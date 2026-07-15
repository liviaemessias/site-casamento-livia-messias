-- ============================================================
-- Guest wall messages
-- ============================================================

begin;

create table if not exists public.guest_wall_messages (
  id uuid not null default gen_random_uuid(),
  guest_id uuid not null,
  message text not null,
  status text not null default 'pending',
  couple_reply text null,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone('utc'::text, now()),
  submitted_at timestamp with time zone not null default timezone('utc'::text, now()),
  approved_at timestamp with time zone null,
  hidden_at timestamp with time zone null,
  couple_replied_at timestamp with time zone null,

  constraint guest_wall_messages_pkey primary key (id),
  constraint guest_wall_messages_guest_id_key unique (guest_id),
  constraint guest_wall_messages_guest_id_fkey
    foreign key (guest_id)
    references public.guests(id)
    on delete cascade,
  constraint guest_wall_messages_status_check
    check (status in ('pending', 'approved', 'hidden')),
  constraint guest_wall_messages_message_length_check
    check (char_length(btrim(message)) between 1 and 800),
  constraint guest_wall_messages_reply_length_check
    check (couple_reply is null or char_length(btrim(couple_reply)) <= 800)
);

create index if not exists guest_wall_messages_status_approved_idx
  on public.guest_wall_messages (status, approved_at desc, created_at desc);

create index if not exists guest_wall_messages_guest_status_idx
  on public.guest_wall_messages (guest_id, status);

alter table public.guest_wall_messages enable row level security;

revoke all on table public.guest_wall_messages from anon, authenticated;
grant all on table public.guest_wall_messages to service_role;

create or replace function public.list_approved_wall_messages(
  p_limit integer default 100,
  p_offset integer default 0
)
returns table (
  total_count bigint,
  id uuid,
  guest_name text,
  message text,
  couple_reply text,
  approved_at timestamp with time zone,
  couple_replied_at timestamp with time zone,
  created_at timestamp with time zone
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  p_limit := least(greatest(coalesce(p_limit, 100), 1), 100);
  p_offset := greatest(coalesce(p_offset, 0), 0);

  return query
  select
    count(*) over () as total_count,
    wall_message.id,
    guest.name as guest_name,
    wall_message.message,
    wall_message.couple_reply,
    wall_message.approved_at,
    wall_message.couple_replied_at,
    wall_message.created_at
  from public.guest_wall_messages as wall_message
  inner join public.guests as guest
    on guest.id = wall_message.guest_id
  where wall_message.status = 'approved'
    and guest.active is true
  order by
    wall_message.approved_at desc nulls last,
    wall_message.created_at desc
  limit p_limit
  offset p_offset;
end;
$$;

create or replace function public.get_current_guest_wall_message()
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
begin
  current_guest := public.current_guest_id();

  if current_guest is null then
    return;
  end if;

  return query
  select
    wall_message.id,
    wall_message.message,
    wall_message.status,
    wall_message.couple_reply,
    wall_message.created_at,
    wall_message.updated_at,
    wall_message.submitted_at,
    wall_message.approved_at,
    wall_message.hidden_at,
    wall_message.couple_replied_at
  from public.guest_wall_messages as wall_message
  where wall_message.guest_id = current_guest;
end;
$$;

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
  safe_message text;
  saved_message public.guest_wall_messages%rowtype;
begin
  current_guest := public.current_guest_id();
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
    timezone('utc'::text, now()),
    timezone('utc'::text, now()),
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

create or replace function public.admin_list_wall_messages(
  p_status text default null,
  p_search text default null,
  p_limit integer default 100,
  p_offset integer default 0
)
returns table (
  total_count bigint,
  id uuid,
  guest_id uuid,
  guest_name text,
  invite_type text,
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
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.'
      using errcode = '42501';
  end if;

  p_status := lower(nullif(btrim(p_status), ''));
  p_search := lower(nullif(btrim(p_search), ''));
  p_limit := least(greatest(coalesce(p_limit, 100), 1), 200);
  p_offset := greatest(coalesce(p_offset, 0), 0);

  return query
  select
    count(*) over () as total_count,
    wall_message.id,
    wall_message.guest_id,
    guest.name as guest_name,
    guest.invite_type,
    wall_message.message,
    wall_message.status,
    wall_message.couple_reply,
    wall_message.created_at,
    wall_message.updated_at,
    wall_message.submitted_at,
    wall_message.approved_at,
    wall_message.hidden_at,
    wall_message.couple_replied_at
  from public.guest_wall_messages as wall_message
  inner join public.guests as guest
    on guest.id = wall_message.guest_id
  where (p_status is null or wall_message.status = p_status)
    and (
      p_search is null
      or lower(guest.name) like '%' || p_search || '%'
      or lower(wall_message.message) like '%' || p_search || '%'
      or lower(coalesce(wall_message.couple_reply, '')) like '%' || p_search || '%'
    )
  order by wall_message.submitted_at desc, wall_message.created_at desc
  limit p_limit
  offset p_offset;
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
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.'
      using errcode = '42501';
  end if;

  update public.guest_wall_messages
  set
    status = 'approved',
    approved_at = timezone('utc'::text, now()),
    hidden_at = null,
    updated_at = timezone('utc'::text, now())
  where id = target_message_id;

  return found;
end;
$$;

create or replace function public.admin_hide_wall_message(
  target_message_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.'
      using errcode = '42501';
  end if;

  update public.guest_wall_messages
  set
    status = 'hidden',
    hidden_at = timezone('utc'::text, now()),
    updated_at = timezone('utc'::text, now())
  where id = target_message_id;

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
  safe_reply text;
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.'
      using errcode = '42501';
  end if;

  safe_reply := left(btrim(coalesce(submitted_reply, '')), 800);

  update public.guest_wall_messages
  set
    couple_reply = nullif(safe_reply, ''),
    couple_replied_at = case
      when safe_reply = '' then null
      else timezone('utc'::text, now())
    end,
    updated_at = timezone('utc'::text, now())
  where id = target_message_id;

  return found;
end;
$$;

create or replace function public.admin_clear_wall_message_reply(
  target_message_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.'
      using errcode = '42501';
  end if;

  update public.guest_wall_messages
  set
    couple_reply = null,
    couple_replied_at = null,
    updated_at = timezone('utc'::text, now())
  where id = target_message_id;

  return found;
end;
$$;

create or replace function public.admin_delete_wall_message(
  target_message_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.'
      using errcode = '42501';
  end if;

  delete from public.guest_wall_messages
  where id = target_message_id;

  return found;
end;
$$;

comment on table public.guest_wall_messages is
  'Moderated messages left by invited guests for the public wall.';

comment on function public.list_approved_wall_messages(integer, integer) is
  'Lists approved wall messages without exposing private guest data.';

comment on function public.get_current_guest_wall_message() is
  'Returns the current invited guest wall message.';

comment on function public.save_current_guest_wall_message(text) is
  'Creates or updates the current invited guest wall message and returns it to pending review.';

comment on function public.admin_list_wall_messages(text, text, integer, integer) is
  'Lists wall messages for authenticated administrators.';

comment on function public.admin_approve_wall_message(uuid) is
  'Approves a guest wall message as an authenticated administrator.';

comment on function public.admin_hide_wall_message(uuid) is
  'Hides a guest wall message as an authenticated administrator.';

comment on function public.admin_reply_wall_message(uuid, text) is
  'Adds or clears the couple reply to a wall message as an authenticated administrator.';

comment on function public.admin_clear_wall_message_reply(uuid) is
  'Clears the couple reply from a wall message as an authenticated administrator.';

comment on function public.admin_delete_wall_message(uuid) is
  'Deletes a guest wall message as an authenticated administrator.';

revoke all on function public.list_approved_wall_messages(integer, integer)
  from public;
grant execute on function public.list_approved_wall_messages(integer, integer)
  to anon, authenticated;

revoke all on function public.get_current_guest_wall_message()
  from public, anon;
grant execute on function public.get_current_guest_wall_message()
  to authenticated;

revoke all on function public.save_current_guest_wall_message(text)
  from public, anon;
grant execute on function public.save_current_guest_wall_message(text)
  to authenticated;

revoke all on function public.admin_list_wall_messages(text, text, integer, integer)
  from public, anon;
grant execute on function public.admin_list_wall_messages(text, text, integer, integer)
  to authenticated;

revoke all on function public.admin_approve_wall_message(uuid)
  from public, anon;
grant execute on function public.admin_approve_wall_message(uuid)
  to authenticated;

revoke all on function public.admin_hide_wall_message(uuid)
  from public, anon;
grant execute on function public.admin_hide_wall_message(uuid)
  to authenticated;

revoke all on function public.admin_reply_wall_message(uuid, text)
  from public, anon;
grant execute on function public.admin_reply_wall_message(uuid, text)
  to authenticated;

revoke all on function public.admin_clear_wall_message_reply(uuid)
  from public, anon;
grant execute on function public.admin_clear_wall_message_reply(uuid)
  to authenticated;

revoke all on function public.admin_delete_wall_message(uuid)
  from public, anon;
grant execute on function public.admin_delete_wall_message(uuid)
  to authenticated;

commit;
