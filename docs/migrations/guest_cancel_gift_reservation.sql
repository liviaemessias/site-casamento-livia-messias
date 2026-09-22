-- ============================================================
-- Guest gift reservation cancellation
-- ============================================================

begin;

create or replace function public.cancel_my_gift_reservation(
  target_gift_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_guest uuid;
  event_time timestamp with time zone;
  cancelled_gift public.gifts%rowtype;
begin
  current_guest := public.current_guest_id();

  if current_guest is null then
    return false;
  end if;

  event_time := timezone('utc'::text, now());

  select *
  into cancelled_gift
  from public.gifts
  where id = target_gift_id
    and reserved_guest_id = current_guest
    and coalesce(gift_type, 'single') <> 'quota'
    and status = 'Reservado'
    and coalesce(payment_status, 'Pendente') = 'Pendente'
  for update;

  if not found then
    return false;
  end if;

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
    selected_purchase_details = null
  where id = target_gift_id
    and reserved_guest_id = current_guest
    and coalesce(gift_type, 'single') <> 'quota'
    and status = 'Reservado'
    and coalesce(payment_status, 'Pendente') = 'Pendente';

  perform public.enqueue_gift_notification_event(
    'gift_reservation_cancelled',
    'gift',
    cancelled_gift.id,
    event_time,
    current_guest,
    jsonb_build_object(
      'gift_id', cancelled_gift.id,
      'gift_name', cancelled_gift.name,
      'gift_category', cancelled_gift.category,
      'gift_type', coalesce(cancelled_gift.gift_type, 'single'),
      'price', cancelled_gift.price,
      'message', cancelled_gift.reservation_message,
      'payment_status', 'Cancelado',
      'purchase_method', cancelled_gift.selected_purchase_method,
      'cancelled_at', event_time
    )
  );

  return true;
end;
$$;

comment on function public.cancel_my_gift_reservation(uuid) is
  'Allows the authenticated guest to cancel their own pending individual gift reservation.';

revoke all on function public.cancel_my_gift_reservation(uuid)
  from public, anon;
grant execute on function public.cancel_my_gift_reservation(uuid)
  to authenticated;

create or replace function public.cancel_my_gift_contribution(
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
  cancelled_contribution public.gift_contributions%rowtype;
  gift_record public.gifts%rowtype;
begin
  current_guest := public.current_guest_id();

  if current_guest is null then
    return false;
  end if;

  event_time := timezone('utc'::text, now());

  delete from public.gift_contributions
  where id = target_contribution_id
    and guest_id = current_guest
    and coalesce(payment_status, 'Pendente') = 'Pendente'
  returning * into cancelled_contribution;

  if not found then
    return false;
  end if;

  select *
  into gift_record
  from public.gifts
  where id = cancelled_contribution.gift_id;

  perform public.enqueue_gift_notification_event(
    'gift_contribution_cancelled',
    'gift_contribution',
    cancelled_contribution.id,
    event_time,
    current_guest,
    jsonb_build_object(
      'gift_id', gift_record.id,
      'gift_name', gift_record.name,
      'gift_category', gift_record.category,
      'gift_type', 'quota',
      'price', gift_record.price,
      'quota_quantity', cancelled_contribution.quota_quantity,
      'quota_value', cancelled_contribution.quota_value,
      'total_value', cancelled_contribution.total_value,
      'message', cancelled_contribution.message,
      'payment_status', 'Cancelado',
      'payment_method', cancelled_contribution.payment_method,
      'cancelled_at', event_time
    )
  );

  return true;
end;
$$;

comment on function public.cancel_my_gift_contribution(uuid) is
  'Allows the authenticated guest to cancel their own pending quota contribution.';

revoke all on function public.cancel_my_gift_contribution(uuid)
  from public, anon;
grant execute on function public.cancel_my_gift_contribution(uuid)
  to authenticated;

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
    'gift_reservation_cancelled',
    'gift',
    'Reserva de presente cancelada',
    'Enviado quando o convidado cancela uma reserva pendente de presente individual.',
    true,
    false,
    true,
    true
  ),
  (
    'gift_contribution_cancelled',
    'gift_contribution',
    'Cota cancelada',
    'Enviado quando o convidado cancela uma contribuição pendente por cota.',
    true,
    false,
    true,
    true
  )
on conflict (event_type) do update
set
  event_group = excluded.event_group,
  label = excluded.label,
  description = excluded.description,
  automatic_enabled = excluded.automatic_enabled,
  manual_enabled = excluded.manual_enabled,
  admin_enabled = excluded.admin_enabled,
  guest_enabled = excluded.guest_enabled;

commit;
