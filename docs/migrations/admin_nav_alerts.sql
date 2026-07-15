-- ============================================================
-- Admin navigation alerts
-- ============================================================

begin;

create or replace function public.admin_get_nav_alerts()
returns table (
  has_pending_wall_messages boolean,
  has_reported_gifts boolean
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

  return query
  select
    exists (
      select 1
      from public.guest_wall_messages as wall_message
      where wall_message.status = 'pending'
      limit 1
    ) as has_pending_wall_messages,
    (
      exists (
        select 1
        from public.gifts as gift
        where gift.payment_status = 'Informado'
        limit 1
      )
      or exists (
        select 1
        from public.gift_contributions as contribution
        where contribution.payment_status = 'Informado'
        limit 1
      )
    ) as has_reported_gifts;
end;
$$;

comment on function public.admin_get_nav_alerts() is
  'Returns compact boolean alerts for the authenticated administrator navigation menu.';

revoke all on function public.admin_get_nav_alerts() from public, anon;
grant execute on function public.admin_get_nav_alerts() to authenticated;

commit;
