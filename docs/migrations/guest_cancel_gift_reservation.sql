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
  updated_count integer;
begin
  current_guest := public.current_guest_id();

  if current_guest is null then
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

  get diagnostics updated_count = row_count;
  return updated_count = 1;
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
  deleted_count integer;
begin
  current_guest := public.current_guest_id();

  if current_guest is null then
    return false;
  end if;

  delete from public.gift_contributions
  where id = target_contribution_id
    and guest_id = current_guest
    and coalesce(payment_status, 'Pendente') = 'Pendente';

  get diagnostics deleted_count = row_count;
  return deleted_count = 1;
end;
$$;

comment on function public.cancel_my_gift_contribution(uuid) is
  'Allows the authenticated guest to cancel their own pending quota contribution.';

revoke all on function public.cancel_my_gift_contribution(uuid)
  from public, anon;
grant execute on function public.cancel_my_gift_contribution(uuid)
  to authenticated;

commit;
