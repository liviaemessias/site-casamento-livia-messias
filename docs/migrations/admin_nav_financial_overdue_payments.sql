-- ============================================================
-- Admin navigation alerts: due or overdue financial payments
-- ============================================================

begin;

drop function if exists public.admin_get_nav_alerts();

create or replace function public.admin_get_nav_alerts()
returns table (
  has_pending_wall_messages boolean,
  has_reported_gifts boolean,
  has_overdue_checklist_tasks boolean,
  has_due_financial_payments boolean
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
    ) as has_reported_gifts,
    exists (
      select 1
      from public.wedding_checklist_items as checklist_item
      where checklist_item.status <> 'completed'
        and checklist_item.due_date < current_date
      limit 1
    ) as has_overdue_checklist_tasks,
    exists (
      select 1
      from public.financial_expense_payments as payment
      join public.financial_expenses as expense
        on expense.id = payment.expense_id
      where payment.status = 'unpaid'
        and payment.due_date is not null
        and payment.due_date <= current_date
        and expense.status <> 'cancelled'
        and expense.is_active = true
      limit 1
    ) as has_due_financial_payments;
end;
$$;

comment on function public.admin_get_nav_alerts() is
  'Returns compact boolean alerts for the authenticated administrator navigation menu.';

revoke all on function public.admin_get_nav_alerts() from public, anon;
grant execute on function public.admin_get_nav_alerts() to authenticated;

commit;
