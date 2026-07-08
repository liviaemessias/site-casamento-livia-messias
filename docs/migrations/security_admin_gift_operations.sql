-- ============================================================
-- Secure administrative gift and contribution operations
-- ============================================================
--
-- Run this script once in an existing secured Supabase project. Clean
-- rebuilds also execute this file as part of the documented sequence.

begin;

create or replace function public.admin_confirm_gift_purchase(
  target_gift_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
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

  perform 1
  from public.gifts
  where id = target_gift_id
    and coalesce(gift_type, 'single') <> 'quota'
    and reserved_guest_id is not null
  for update;

  if not found then
    return false;
  end if;

  update public.gifts
  set
    status = 'Comprado',
    payment_status = 'Confirmado'
  where id = target_gift_id;

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

  perform 1
  from public.gifts
  where id = target_gift_id
    and coalesce(gift_type, 'single') <> 'quota'
    and reserved_guest_id is not null
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
    selected_purchase_details = null,
    card_payment_reference = null
  where id = target_gift_id;

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

  perform 1
  from public.gift_contributions as contribution
  inner join public.gifts as gift
    on gift.id = contribution.gift_id
  where contribution.id = target_contribution_id
    and gift.gift_type = 'quota'
  for update of contribution;

  if not found then
    return false;
  end if;

  update public.gift_contributions
  set payment_status = 'Confirmado'
  where id = target_contribution_id;

  -- The contribution trigger recalculates the parent gift in this transaction.
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
  deleted_contribution_id uuid;
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

  delete from public.gift_contributions as contribution
  using public.gifts as gift
  where contribution.id = target_contribution_id
    and gift.id = contribution.gift_id
    and gift.gift_type = 'quota'
  returning contribution.id into deleted_contribution_id;

  -- The contribution trigger recalculates the parent gift in this transaction.
  return deleted_contribution_id is not null;
end;
$$;

comment on function public.admin_confirm_gift_purchase(uuid) is
  'Confirms an individual gift purchase as an authenticated administrator.';
comment on function public.admin_release_gift_reservation(uuid) is
  'Releases an individual gift reservation as an authenticated administrator.';
comment on function public.admin_confirm_gift_contribution(uuid) is
  'Confirms a quota contribution and atomically refreshes its gift status.';
comment on function public.admin_release_gift_contribution(uuid) is
  'Deletes a quota contribution and atomically refreshes its gift status.';

revoke all on function public.admin_confirm_gift_purchase(uuid)
  from public, anon;
revoke all on function public.admin_release_gift_reservation(uuid)
  from public, anon;
revoke all on function public.admin_confirm_gift_contribution(uuid)
  from public, anon;
revoke all on function public.admin_release_gift_contribution(uuid)
  from public, anon;

grant execute on function public.admin_confirm_gift_purchase(uuid)
  to authenticated;
grant execute on function public.admin_release_gift_reservation(uuid)
  to authenticated;
grant execute on function public.admin_confirm_gift_contribution(uuid)
  to authenticated;
grant execute on function public.admin_release_gift_contribution(uuid)
  to authenticated;

-- Contributions are mutated only through guest or administrative RPCs.
revoke insert, update, delete
  on table public.gift_contributions
  from authenticated;

commit;
