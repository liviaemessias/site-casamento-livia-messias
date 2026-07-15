-- ============================================================
-- Wall message email notifications
-- ============================================================

begin;

alter table public.notification_preferences
  drop constraint if exists notification_preferences_event_group_check;

alter table public.notification_preferences
  add constraint notification_preferences_event_group_check
  check (event_group in ('rsvp', 'gift', 'gift_contribution', 'manual', 'wall_message'));

insert into public.notification_preferences (
  event_type,
  event_group,
  label,
  description,
  automatic_enabled,
  manual_enabled,
  admin_enabled,
  guest_enabled
)
values
  (
    'wall_message_submitted',
    'wall_message',
    'Recado enviado',
    'Enviado quando um convidado cria ou edita um recado no mural.',
    true,
    false,
    true,
    false
  ),
  (
    'wall_message_approved',
    'wall_message',
    'Recado aprovado',
    'Enviado quando o admin aprova um recado para o mural público.',
    true,
    false,
    false,
    true
  ),
  (
    'wall_message_replied',
    'wall_message',
    'Recado respondido',
    'Enviado quando os noivos respondem um recado aprovado.',
    true,
    false,
    false,
    true
  )
on conflict (event_type) do update
set
  event_group = excluded.event_group,
  label = excluded.label,
  description = excluded.description,
  automatic_enabled = excluded.automatic_enabled,
  admin_enabled = excluded.admin_enabled,
  guest_enabled = excluded.guest_enabled,
  updated_at = timezone('utc'::text, now());

create or replace function public.enqueue_wall_message_notification_event(
  p_event_type text,
  p_wall_message_id uuid,
  p_event_time timestamp with time zone default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  event_time timestamp with time zone;
  guest_email text;
  guest_record public.guests%rowtype;
  wall_message_record public.guest_wall_messages%rowtype;
begin
  if p_event_type is null
    or p_wall_message_id is null
    or p_event_type not in (
      'wall_message_submitted',
      'wall_message_approved',
      'wall_message_replied'
    )
  then
    return;
  end if;

  event_time := coalesce(p_event_time, timezone('utc'::text, now()));

  select *
  into wall_message_record
  from public.guest_wall_messages
  where id = p_wall_message_id;

  if not found then
    return;
  end if;

  select *
  into guest_record
  from public.guests
  where id = wall_message_record.guest_id
    and active is true;

  if not found then
    return;
  end if;

  select nullif(rsvp.email, '')
  into guest_email
  from public.rsvps as rsvp
  where rsvp.guest_id = wall_message_record.guest_id
  order by rsvp.updated_at desc nulls last, rsvp.created_at desc nulls last
  limit 1;

  insert into public.notification_events (
    event_type,
    aggregate_type,
    aggregate_id,
    aggregate_version,
    guest_id,
    dedupe_key,
    payload
  )
  values (
    p_event_type,
    'wall_message',
    wall_message_record.id,
    event_time,
    wall_message_record.guest_id,
    concat(
      p_event_type,
      ':',
      wall_message_record.id::text,
      ':',
      extract(epoch from event_time)::text
    ),
    jsonb_build_object(
      'wall_message_id', wall_message_record.id,
      'guest_name', guest_record.name,
      'invite_type', coalesce(guest_record.invite_type, 'individual'),
      'email', guest_email,
      'message', wall_message_record.message,
      'status', wall_message_record.status,
      'couple_reply', wall_message_record.couple_reply,
      'submitted_at', wall_message_record.submitted_at,
      'approved_at', wall_message_record.approved_at,
      'couple_replied_at', wall_message_record.couple_replied_at
    )
  )
  on conflict (dedupe_key) do nothing;
end;
$$;

comment on function public.enqueue_wall_message_notification_event(
  text,
  uuid,
  timestamp with time zone
) is
  'Internal helper that writes wall-message transactional email events.';

revoke all on function public.enqueue_wall_message_notification_event(
  text,
  uuid,
  timestamp with time zone
) from public, anon, authenticated;

create or replace function public.save_current_guest_wall_message(
  submitted_message text
)
returns table (
  id uuid,
  message text,
  status text,
  couple_reply text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  submitted_at timestamp with time zone,
  approved_at timestamp with time zone,
  hidden_at timestamp with time zone,
  couple_replied_at timestamp with time zone
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_guest uuid;
  event_time timestamp with time zone;
  safe_message text;
  saved_message public.guest_wall_messages%rowtype;
begin
  current_guest := public.current_guest_id();
  event_time := timezone('utc'::text, now());
  safe_message := left(btrim(coalesce(submitted_message, '')), 800);

  if current_guest is null or safe_message = '' then
    return;
  end if;

  if not exists (
    select 1
    from public.guests as guest
    where guest.id = current_guest
      and guest.active is true
  ) then
    return;
  end if;

  insert into public.guest_wall_messages (
    guest_id,
    message,
    status,
    submitted_at,
    updated_at,
    approved_at,
    hidden_at
  )
  values (
    current_guest,
    safe_message,
    'pending',
    event_time,
    event_time,
    null,
    null
  )
  on conflict (guest_id)
  do update set
    message = excluded.message,
    status = 'pending',
    submitted_at = excluded.submitted_at,
    updated_at = excluded.updated_at,
    approved_at = null,
    hidden_at = null
  returning * into saved_message;

  perform public.enqueue_wall_message_notification_event(
    'wall_message_submitted',
    saved_message.id,
    event_time
  );

  return query
  select
    saved_message.id,
    saved_message.message,
    saved_message.status,
    saved_message.couple_reply,
    saved_message.created_at,
    saved_message.updated_at,
    saved_message.submitted_at,
    saved_message.approved_at,
    saved_message.hidden_at,
    saved_message.couple_replied_at;
end;
$$;

create or replace function public.admin_approve_wall_message(
  target_message_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  event_time timestamp with time zone;
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.'
      using errcode = '42501';
  end if;

  event_time := timezone('utc'::text, now());

  update public.guest_wall_messages
  set
    status = 'approved',
    approved_at = event_time,
    hidden_at = null,
    updated_at = event_time
  where id = target_message_id;

  if found then
    perform public.enqueue_wall_message_notification_event(
      'wall_message_approved',
      target_message_id,
      event_time
    );
  end if;

  return found;
end;
$$;

create or replace function public.admin_reply_wall_message(
  target_message_id uuid,
  submitted_reply text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  event_time timestamp with time zone;
  safe_reply text;
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.'
      using errcode = '42501';
  end if;

  event_time := timezone('utc'::text, now());
  safe_reply := left(btrim(coalesce(submitted_reply, '')), 800);

  update public.guest_wall_messages
  set
    couple_reply = nullif(safe_reply, ''),
    couple_replied_at = case
      when safe_reply = '' then null
      else event_time
    end,
    updated_at = event_time
  where id = target_message_id;

  if found and safe_reply <> '' then
    perform public.enqueue_wall_message_notification_event(
      'wall_message_replied',
      target_message_id,
      event_time
    );
  end if;

  return found;
end;
$$;

commit;
