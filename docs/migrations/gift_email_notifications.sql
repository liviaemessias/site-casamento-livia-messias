-- ============================================================
-- Gift transactional email notifications
-- ============================================================

begin;

create or replace function public.enqueue_gift_notification_event(
  p_event_type text,
  p_aggregate_type text,
  p_aggregate_id uuid,
  p_aggregate_version timestamp with time zone,
  p_guest_id uuid,
  p_payload jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  event_version timestamp with time zone;
  guest_name text;
  guest_invite_type text;
  guest_email text;
begin
  if p_event_type is null
    or p_aggregate_type is null
    or p_aggregate_id is null
    or p_guest_id is null
  then
    return;
  end if;

  event_version := coalesce(p_aggregate_version, timezone('utc'::text, now()));

  select guest.name, guest.invite_type
  into guest_name, guest_invite_type
  from public.guests as guest
  where guest.id = p_guest_id;

  select nullif(rsvp.email, '')
  into guest_email
  from public.rsvps as rsvp
  where rsvp.guest_id = p_guest_id
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
    p_aggregate_type,
    p_aggregate_id,
    event_version,
    p_guest_id,
    concat(
      p_event_type,
      ':',
      p_aggregate_id::text,
      ':',
      extract(epoch from event_version)::text
    ),
    coalesce(p_payload, '{}'::jsonb)
      || jsonb_build_object(
        'guest_name', guest_name,
        'invite_type', coalesce(guest_invite_type, 'individual'),
        'email', guest_email
      )
  )
  on conflict (dedupe_key) do nothing;
end;
$$;

comment on function public.enqueue_gift_notification_event(
  text,
  text,
  uuid,
  timestamp with time zone,
  uuid,
  jsonb
) is
  'Internal helper that writes gift-related transactional email events.';

revoke all on function public.enqueue_gift_notification_event(
  text,
  text,
  uuid,
  timestamp with time zone,
  uuid,
  jsonb
) from public, anon, authenticated;

create or replace function public.reserve_gift(
  target_gift_id uuid,
  reservation_message text default null
)
returns setof public.gifts
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_guest uuid;
  current_guest_name text;
  event_time timestamp with time zone;
  reserved_gift public.gifts%rowtype;
begin
  current_guest := public.current_guest_id();

  if current_guest is null then
    raise exception 'Unauthorized';
  end if;

  select name
  into current_guest_name
  from public.guests
  where id = current_guest
    and active is true;

  if not found then
    return;
  end if;

  event_time := timezone('utc'::text, now());

  update public.gifts
  set
    status = 'Reservado',
    reserved_guest_id = current_guest,
    reserved_name = current_guest_name,
    reservation_message = left(coalesce($2, ''), 2000),
    reserved_at = event_time,
    payment_status = 'Pendente',
    payment_reported_at = null,
    selected_purchase_method = null,
    selected_purchase_details = null
  where id = target_gift_id
    and coalesce(gift_type, 'single') <> 'quota'
    and reserved_guest_id is null
    and status = 'Disponível'
  returning * into reserved_gift;

  if not found then
    return;
  end if;

  perform public.enqueue_gift_notification_event(
    'gift_reserved',
    'gift',
    reserved_gift.id,
    event_time,
    current_guest,
    jsonb_build_object(
      'gift_id', reserved_gift.id,
      'gift_name', reserved_gift.name,
      'gift_category', reserved_gift.category,
      'gift_type', coalesce(reserved_gift.gift_type, 'single'),
      'price', reserved_gift.price,
      'message', reserved_gift.reservation_message,
      'payment_status', reserved_gift.payment_status
    )
  );

  return next reserved_gift;
end;
$$;

create or replace function public.report_gift_payment(target_gift_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_guest uuid;
  event_time timestamp with time zone;
  updated_gift public.gifts%rowtype;
begin
  current_guest := public.current_guest_id();

  if current_guest is null then
    return false;
  end if;

  event_time := timezone('utc'::text, now());

  update public.gifts
  set
    payment_status = 'Informado',
    payment_reported_at = event_time
  where id = target_gift_id
    and reserved_guest_id = current_guest
    and coalesce(gift_type, 'single') <> 'quota'
    and coalesce(payment_status, 'Pendente') = 'Pendente'
    and (
      (
        coalesce(purchase_mode, 'money') = 'money'
        and selected_purchase_method in ('pix', 'card')
        and selected_purchase_details is not null
      )
      or (
        purchase_mode = 'hybrid'
        and selected_purchase_method in ('pix', 'card')
        and selected_purchase_details is not null
      )
      or (
        purchase_mode in ('external', 'hybrid')
        and selected_purchase_method in ('online', 'physical')
        and selected_purchase_details ->> 'type'
          = selected_purchase_method
      )
    )
  returning * into updated_gift;

  if not found then
    return false;
  end if;

  perform public.enqueue_gift_notification_event(
    'gift_payment_reported',
    'gift',
    updated_gift.id,
    event_time,
    current_guest,
    jsonb_build_object(
      'gift_id', updated_gift.id,
      'gift_name', updated_gift.name,
      'gift_category', updated_gift.category,
      'gift_type', coalesce(updated_gift.gift_type, 'single'),
      'price', updated_gift.price,
      'message', updated_gift.reservation_message,
      'payment_status', updated_gift.payment_status,
      'purchase_method', updated_gift.selected_purchase_method
    )
  );

  return true;
end;
$$;

create or replace function public.reserve_gift_quotas(
  target_gift_id uuid,
  contribution_message text,
  requested_quantity integer
)
returns setof public.gift_contributions
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_guest uuid;
  current_guest_name text;
  gift_record public.gifts%rowtype;
  reserved_quantity integer;
  available_quantity integer;
  effective_quota_value numeric;
  event_time timestamp with time zone;
  new_contribution public.gift_contributions%rowtype;
begin
  current_guest := public.current_guest_id();

  if current_guest is null or requested_quantity <= 0 then
    return;
  end if;

  select name
  into current_guest_name
  from public.guests
  where id = current_guest
    and active is true;

  if not found then
    return;
  end if;

  select *
  into gift_record
  from public.gifts
  where id = target_gift_id
    and gift_type = 'quota'
  for update;

  if not found or coalesce(gift_record.quota_count, 0) <= 0 then
    return;
  end if;

  select coalesce(sum(quota_quantity), 0)::integer
  into reserved_quantity
  from public.gift_contributions
  where gift_id = target_gift_id;

  available_quantity := gift_record.quota_count - reserved_quantity;

  if available_quantity < requested_quantity then
    return;
  end if;

  effective_quota_value := coalesce(
    nullif(gift_record.quota_value, 0),
    gift_record.price / nullif(gift_record.quota_count, 0)
  );

  if effective_quota_value is null or effective_quota_value <= 0 then
    return;
  end if;

  event_time := timezone('utc'::text, now());

  insert into public.gift_contributions (
    gift_id,
    guest_id,
    contributor_name,
    message,
    quota_quantity,
    quota_value,
    total_value,
    payment_status,
    payment_method
  )
  values (
    target_gift_id,
    current_guest,
    left(current_guest_name, 200),
    left(coalesce(contribution_message, ''), 2000),
    requested_quantity,
    effective_quota_value,
    requested_quantity * effective_quota_value,
    'Pendente',
    'pix'
  )
  returning * into new_contribution;

  perform public.enqueue_gift_notification_event(
    'gift_contribution_reserved',
    'gift_contribution',
    new_contribution.id,
    event_time,
    current_guest,
    jsonb_build_object(
      'gift_id', gift_record.id,
      'gift_name', gift_record.name,
      'gift_category', gift_record.category,
      'gift_type', 'quota',
      'price', gift_record.price,
      'quota_quantity', new_contribution.quota_quantity,
      'quota_value', new_contribution.quota_value,
      'total_value', new_contribution.total_value,
      'message', new_contribution.message,
      'payment_status', new_contribution.payment_status,
      'payment_method', new_contribution.payment_method
    )
  );

  return next new_contribution;
end;
$$;

create or replace function public.report_gift_contribution_payment(
  target_contribution_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_guest uuid;
  event_time timestamp with time zone;
  updated_contribution public.gift_contributions%rowtype;
  gift_record public.gifts%rowtype;
begin
  current_guest := public.current_guest_id();

  if current_guest is null then
    return false;
  end if;

  event_time := timezone('utc'::text, now());

  update public.gift_contributions
  set
    payment_status = 'Informado',
    payment_reported_at = event_time
  where id = target_contribution_id
    and guest_id = current_guest
    and coalesce(payment_status, 'Pendente') = 'Pendente'
  returning * into updated_contribution;

  if not found then
    return false;
  end if;

  select *
  into gift_record
  from public.gifts
  where id = updated_contribution.gift_id;

  perform public.enqueue_gift_notification_event(
    'gift_contribution_payment_reported',
    'gift_contribution',
    updated_contribution.id,
    event_time,
    current_guest,
    jsonb_build_object(
      'gift_id', gift_record.id,
      'gift_name', gift_record.name,
      'gift_category', gift_record.category,
      'gift_type', 'quota',
      'price', gift_record.price,
      'quota_quantity', updated_contribution.quota_quantity,
      'quota_value', updated_contribution.quota_value,
      'total_value', updated_contribution.total_value,
      'message', updated_contribution.message,
      'payment_status', updated_contribution.payment_status,
      'payment_method', updated_contribution.payment_method
    )
  );

  return true;
end;
$$;

create or replace function public.admin_confirm_gift_purchase(
  target_gift_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  event_time timestamp with time zone;
  updated_gift public.gifts%rowtype;
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

  event_time := timezone('utc'::text, now());

  update public.gifts
  set
    status = 'Comprado',
    payment_status = 'Confirmado'
  where id = target_gift_id
    and coalesce(gift_type, 'single') <> 'quota'
    and reserved_guest_id is not null
  returning * into updated_gift;

  if not found then
    return false;
  end if;

  perform public.enqueue_gift_notification_event(
    'gift_purchase_confirmed',
    'gift',
    updated_gift.id,
    event_time,
    updated_gift.reserved_guest_id,
    jsonb_build_object(
      'gift_id', updated_gift.id,
      'gift_name', updated_gift.name,
      'gift_category', updated_gift.category,
      'gift_type', coalesce(updated_gift.gift_type, 'single'),
      'price', updated_gift.price,
      'message', updated_gift.reservation_message,
      'payment_status', updated_gift.payment_status,
      'purchase_method', updated_gift.selected_purchase_method
    )
  );

  return true;
end;
$$;

create or replace function public.admin_release_gift_reservation(
  target_gift_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  event_time timestamp with time zone;
  gift_record public.gifts%rowtype;
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
  into gift_record
  from public.gifts
  where id = target_gift_id
    and coalesce(gift_type, 'single') <> 'quota'
    and reserved_guest_id is not null
  for update;

  if not found then
    return false;
  end if;

  event_time := timezone('utc'::text, now());

  update public.gifts
  set
    status = 'Disponível',
    reserved_guest_id = null,
    reserved_name = null,
    reservation_message = null,
    reserved_at = null,
    payment_status = null,
    payment_reported_at = null,
    selected_purchase_method = null,
    selected_purchase_details = null,
    card_payment_reference = null
  where id = target_gift_id;

  perform public.enqueue_gift_notification_event(
    'gift_reservation_released',
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
      'purchase_method', gift_record.selected_purchase_method
    )
  );

  return true;
end;
$$;

create or replace function public.admin_confirm_gift_contribution(
  target_contribution_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  event_time timestamp with time zone;
  updated_contribution public.gift_contributions%rowtype;
  gift_record public.gifts%rowtype;
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

  select gift.*
  into gift_record
  from public.gift_contributions as contribution
  inner join public.gifts as gift
    on gift.id = contribution.gift_id
  where contribution.id = target_contribution_id
    and gift.gift_type = 'quota'
  for update of contribution;

  if not found then
    return false;
  end if;

  event_time := timezone('utc'::text, now());

  update public.gift_contributions
  set payment_status = 'Confirmado'
  where id = target_contribution_id
  returning * into updated_contribution;

  perform public.enqueue_gift_notification_event(
    'gift_contribution_confirmed',
    'gift_contribution',
    updated_contribution.id,
    event_time,
    updated_contribution.guest_id,
    jsonb_build_object(
      'gift_id', gift_record.id,
      'gift_name', gift_record.name,
      'gift_category', gift_record.category,
      'gift_type', 'quota',
      'price', gift_record.price,
      'quota_quantity', updated_contribution.quota_quantity,
      'quota_value', updated_contribution.quota_value,
      'total_value', updated_contribution.total_value,
      'message', updated_contribution.message,
      'payment_status', updated_contribution.payment_status,
      'payment_method', updated_contribution.payment_method
    )
  );

  return true;
end;
$$;

create or replace function public.admin_release_gift_contribution(
  target_contribution_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  event_time timestamp with time zone;
  contribution_record public.gift_contributions%rowtype;
  gift_record public.gifts%rowtype;
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

  select contribution.*
  into contribution_record
  from public.gift_contributions as contribution
  inner join public.gifts as gift
    on gift.id = contribution.gift_id
  where contribution.id = target_contribution_id
    and gift.gift_type = 'quota'
  for update of contribution;

  if not found then
    return false;
  end if;

  select *
  into gift_record
  from public.gifts
  where id = contribution_record.gift_id;

  event_time := timezone('utc'::text, now());

  delete from public.gift_contributions
  where id = target_contribution_id;

  perform public.enqueue_gift_notification_event(
    'gift_contribution_released',
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
      'payment_method', contribution_record.payment_method
    )
  );

  return true;
end;
$$;

revoke all on function public.reserve_gift(uuid, text) from public, anon;
revoke all on function public.report_gift_payment(uuid) from public, anon;
revoke all on function public.reserve_gift_quotas(uuid, text, integer)
  from public, anon;
revoke all on function public.report_gift_contribution_payment(uuid)
  from public, anon;
revoke all on function public.admin_confirm_gift_purchase(uuid)
  from public, anon;
revoke all on function public.admin_release_gift_reservation(uuid)
  from public, anon;
revoke all on function public.admin_confirm_gift_contribution(uuid)
  from public, anon;
revoke all on function public.admin_release_gift_contribution(uuid)
  from public, anon;

grant execute on function public.reserve_gift(uuid, text) to authenticated;
grant execute on function public.report_gift_payment(uuid) to authenticated;
grant execute on function public.reserve_gift_quotas(uuid, text, integer)
  to authenticated;
grant execute on function public.report_gift_contribution_payment(uuid)
  to authenticated;
grant execute on function public.admin_confirm_gift_purchase(uuid)
  to authenticated;
grant execute on function public.admin_release_gift_reservation(uuid)
  to authenticated;
grant execute on function public.admin_confirm_gift_contribution(uuid)
  to authenticated;
grant execute on function public.admin_release_gift_contribution(uuid)
  to authenticated;

commit;
