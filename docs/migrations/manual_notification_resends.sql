-- ============================================================
-- Manual notification resends
-- ============================================================

begin;

update public.notification_preferences
set
  manual_enabled = true,
  updated_at = timezone('utc'::text, now())
where event_type in (
  'rsvp_saved',
  'gift_reserved',
  'gift_payment_reported',
  'gift_purchase_confirmed',
  'gift_reservation_released',
  'gift_contribution_reserved',
  'gift_contribution_payment_reported',
  'gift_contribution_confirmed',
  'gift_contribution_released'
);

create or replace function public.admin_create_manual_notification_event(
  target_event_type text,
  target_aggregate_id uuid,
  target_recipient_type text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  event_id uuid;
  event_time timestamp with time zone;
  normalized_event_type text;
  normalized_recipient_type text;
  rsvp_record public.rsvps%rowtype;
  guest_record public.guests%rowtype;
  gift_record public.gifts%rowtype;
  contribution_record public.gift_contributions%rowtype;
  payload jsonb;
begin
  if not exists (
    select 1
    from public.admin_users as administrator
    where administrator.user_id = (select auth.uid())
      and administrator.active is true
  ) then
    raise exception 'Administrator access required.'
      using errcode = '42501';
  end if;

  normalized_event_type := nullif(btrim(target_event_type), '');
  normalized_recipient_type := lower(nullif(btrim(target_recipient_type), ''));

  if normalized_event_type is null or target_aggregate_id is null then
    raise exception 'Notification event type and aggregate id are required.'
      using errcode = '22023';
  end if;

  if normalized_recipient_type is not null
    and normalized_recipient_type not in ('admin', 'guest')
  then
    raise exception 'Invalid notification recipient type.'
      using errcode = '22023';
  end if;

  event_time := timezone('utc'::text, now());

  if normalized_event_type = 'rsvp_saved' then
    select *
    into rsvp_record
    from public.rsvps
    where id = target_aggregate_id
      and guest_id is not null;

    if not found then
      return null;
    end if;

    select *
    into guest_record
    from public.guests
    where id = rsvp_record.guest_id
      and active is true;

    if not found then
      return null;
    end if;

    payload := jsonb_build_object(
      'operation', case
        when coalesce(rsvp_record.updated_at, rsvp_record.created_at)
          > coalesce(rsvp_record.created_at, rsvp_record.updated_at)
          then 'updated'
        else 'created'
      end,
      'operation_label', case
        when coalesce(rsvp_record.updated_at, rsvp_record.created_at)
          > coalesce(rsvp_record.created_at, rsvp_record.updated_at)
          then 'RSVP Atualizado'
        else 'RSVP Recebido'
      end,
      'guest_name', guest_record.name,
      'invite_type', guest_record.invite_type,
      'couple_members', coalesce(guest_record.couple_members, '[]'::jsonb),
      'rsvp_id', rsvp_record.id,
      'rsvp_updated_at', rsvp_record.updated_at,
      'presence', rsvp_record.presence,
      'email', rsvp_record.email,
      'phone', rsvp_record.phone,
      'food', rsvp_record.food,
      'message', rsvp_record.message,
      'guest_data', rsvp_record.guest_data
    );

    insert into public.notification_events (
      event_type,
      aggregate_type,
      aggregate_id,
      aggregate_version,
      origin,
      guest_id,
      dedupe_key,
      payload
    )
    values (
      normalized_event_type,
      'rsvp',
      rsvp_record.id,
      event_time,
      'manual',
      rsvp_record.guest_id,
      concat(
        normalized_event_type,
        ':manual:',
        rsvp_record.id::text,
        ':',
        extract(epoch from event_time)::text,
        ':',
        gen_random_uuid()::text
      ),
      payload
        || jsonb_build_object(
          'notification_origin', 'manual',
          'triggered_by', 'admin',
          'triggered_by_user_id', (select auth.uid())
        )
        || case
          when normalized_recipient_type is null then '{}'::jsonb
          else jsonb_build_object('manual_recipient_type', normalized_recipient_type)
        end
    )
    returning id into event_id;

    return event_id;
  end if;

  if normalized_event_type in (
    'gift_reserved',
    'gift_payment_reported',
    'gift_purchase_confirmed',
    'gift_reservation_released'
  ) then
    select *
    into gift_record
    from public.gifts
    where id = target_aggregate_id
      and coalesce(gift_type, 'single') <> 'quota'
      and reserved_guest_id is not null;

    if not found then
      return null;
    end if;

    if normalized_event_type = 'gift_payment_reported'
      and coalesce(gift_record.payment_status, 'Pendente') not in ('Informado', 'Confirmado')
    then
      return null;
    end if;

    if normalized_event_type = 'gift_purchase_confirmed'
      and (
        gift_record.status <> 'Comprado'
        and coalesce(gift_record.payment_status, 'Pendente') <> 'Confirmado'
      )
    then
      return null;
    end if;

    if normalized_event_type = 'gift_reservation_released' then
      return null;
    end if;

    perform public.enqueue_gift_notification_event(
      normalized_event_type,
      'gift',
      gift_record.id,
      event_time,
      gift_record.reserved_guest_id,
      jsonb_build_object(
        'gift_id', gift_record.id,
        'gift_name', gift_record.name,
        'gift_category', gift_record.category,
        'gift_type', coalesce(gift_record.gift_type, 'single'),
        'price', gift_record.price,
        'message', gift_record.reservation_message,
        'payment_status', gift_record.payment_status,
        'purchase_method', gift_record.selected_purchase_method,
        'notification_origin', 'manual',
        'triggered_by', 'admin',
        'triggered_by_user_id', (select auth.uid())
      )
      || case
        when normalized_recipient_type is null then '{}'::jsonb
        else jsonb_build_object('manual_recipient_type', normalized_recipient_type)
      end
    );

    update public.notification_events
    set origin = 'manual'
    where dedupe_key = concat(
      normalized_event_type,
      ':',
      gift_record.id::text,
      ':',
      extract(epoch from event_time)::text
    )
    returning id into event_id;

    return event_id;
  end if;

  if normalized_event_type in (
    'gift_contribution_reserved',
    'gift_contribution_payment_reported',
    'gift_contribution_confirmed',
    'gift_contribution_released'
  ) then
    select *
    into contribution_record
    from public.gift_contributions
    where id = target_aggregate_id
      and guest_id is not null;

    if not found then
      return null;
    end if;

    select *
    into gift_record
    from public.gifts
    where id = contribution_record.gift_id
      and gift_type = 'quota';

    if not found then
      return null;
    end if;

    if normalized_event_type = 'gift_contribution_payment_reported'
      and coalesce(contribution_record.payment_status, 'Pendente') not in ('Informado', 'Confirmado')
    then
      return null;
    end if;

    if normalized_event_type = 'gift_contribution_confirmed'
      and coalesce(contribution_record.payment_status, 'Pendente') <> 'Confirmado'
    then
      return null;
    end if;

    if normalized_event_type = 'gift_contribution_released' then
      return null;
    end if;

    perform public.enqueue_gift_notification_event(
      normalized_event_type,
      'gift_contribution',
      contribution_record.id,
      event_time,
      contribution_record.guest_id,
      jsonb_build_object(
        'gift_id', gift_record.id,
        'gift_name', gift_record.name,
        'gift_category', gift_record.category,
        'gift_type', 'quota',
        'price', gift_record.price,
        'quota_quantity', contribution_record.quota_quantity,
        'quota_value', contribution_record.quota_value,
        'total_value', contribution_record.total_value,
        'message', contribution_record.message,
        'payment_status', contribution_record.payment_status,
        'payment_method', contribution_record.payment_method,
        'notification_origin', 'manual',
        'triggered_by', 'admin',
        'triggered_by_user_id', (select auth.uid())
      )
      || case
        when normalized_recipient_type is null then '{}'::jsonb
        else jsonb_build_object('manual_recipient_type', normalized_recipient_type)
      end
    );

    update public.notification_events
    set origin = 'manual'
    where dedupe_key = concat(
      normalized_event_type,
      ':',
      contribution_record.id::text,
      ':',
      extract(epoch from event_time)::text
    )
    returning id into event_id;

    return event_id;
  end if;

  return null;
end;
$$;

create or replace function public.admin_resend_notification_delivery(
  target_delivery_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  delivery_record public.notification_deliveries%rowtype;
  event_record public.notification_events%rowtype;
  event_id uuid;
  event_time timestamp with time zone;
  refreshed_email text;
begin
  if not exists (
    select 1
    from public.admin_users as administrator
    where administrator.user_id = (select auth.uid())
      and administrator.active is true
  ) then
    raise exception 'Administrator access required.'
      using errcode = '42501';
  end if;

  select *
  into delivery_record
  from public.notification_deliveries
  where id = target_delivery_id
    and status not in ('pending', 'processing');

  if not found then
    return null;
  end if;

  select *
  into event_record
  from public.notification_events
  where id = delivery_record.event_id;

  if not found then
    return null;
  end if;

  if event_record.guest_id is not null then
    select nullif(rsvp.email, '')
    into refreshed_email
    from public.rsvps as rsvp
    where rsvp.guest_id = event_record.guest_id
    order by rsvp.updated_at desc nulls last, rsvp.created_at desc nulls last
    limit 1;
  end if;

  event_time := timezone('utc'::text, now());

  insert into public.notification_events (
    event_type,
    aggregate_type,
    aggregate_id,
    aggregate_version,
    origin,
    guest_id,
    dedupe_key,
    payload
  )
  values (
    event_record.event_type,
    event_record.aggregate_type,
    event_record.aggregate_id,
    event_time,
    'manual',
    event_record.guest_id,
    concat(
      event_record.event_type,
      ':manual-resend:',
      delivery_record.id::text,
      ':',
      extract(epoch from event_time)::text,
      ':',
      gen_random_uuid()::text
    ),
    coalesce(event_record.payload, '{}'::jsonb)
      || case
        when refreshed_email is null then '{}'::jsonb
        else jsonb_build_object('email', refreshed_email)
      end
      || jsonb_build_object(
        'manual_recipient_type', delivery_record.recipient_type,
        'notification_origin', 'manual',
        'resent_from_delivery_id', delivery_record.id,
        'resent_from_event_id', event_record.id,
        'triggered_by', 'admin',
        'triggered_by_user_id', (select auth.uid())
      )
  )
  returning id into event_id;

  return event_id;
end;
$$;

comment on function public.admin_create_manual_notification_event(
  text,
  uuid,
  text
) is
  'Creates a manual notification event for an authenticated administrator.';

comment on function public.admin_resend_notification_delivery(uuid) is
  'Creates a manual resend event for one previous notification delivery.';

revoke all on function public.admin_create_manual_notification_event(
  text,
  uuid,
  text
) from public, anon;
revoke all on function public.admin_resend_notification_delivery(uuid)
  from public, anon;

grant execute on function public.admin_create_manual_notification_event(
  text,
  uuid,
  text
) to authenticated;
grant execute on function public.admin_resend_notification_delivery(uuid)
  to authenticated;

commit;
