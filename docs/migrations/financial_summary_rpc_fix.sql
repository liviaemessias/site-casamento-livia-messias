begin;

create or replace function public.admin_get_financial_summary(
  target_context text default 'all'
)
returns table (
  context text,
  reference_scenario_id uuid,
  reference_scenario_name text,
  reference_budget_amount numeric,
  total_contracted numeric,
  total_paid numeric,
  total_remaining numeric,
  committed_delta numeric,
  committed_percent numeric,
  overdue_payment_count bigint,
  next_due_date date,
  due_this_month_amount numeric
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.' using errcode = '42501';
  end if;

  if coalesce(target_context, 'all') not in ('all', 'wedding', 'honeymoon') then
    raise exception 'Invalid financial summary context.' using errcode = '22023';
  end if;

  return query
  with selected_contexts as (
    select unnest(
      case
        when coalesce(target_context, 'all') = 'wedding' then array['wedding']
        when coalesce(target_context, 'all') = 'honeymoon' then array['honeymoon']
        else array['wedding', 'honeymoon']
      end
    ) as context
  ),
  reference_scenarios as (
    select distinct on (scenario.context)
      scenario.context,
      scenario.id,
      scenario.name
    from public.financial_budget_scenarios as scenario
    join selected_contexts
      on selected_contexts.context = scenario.context
    where scenario.is_active is true
    order by
      scenario.context,
      scenario.is_reference desc,
      (scenario.name = 'Planejado') desc,
      scenario.display_order asc,
      scenario.name asc
  ),
  context_summary as (
    select
      selected_contexts.context,
      reference_scenarios.id as reference_scenario_id,
      reference_scenarios.name as reference_scenario_name,
      coalesce(sum(budget_item.estimated_amount) filter (
        where budget_item.id is not null and budget_item.is_active is true
      ), 0)::numeric as reference_budget_amount,
      coalesce((
        select sum(expense.total_amount)
        from public.financial_expenses as expense
        where expense.context = selected_contexts.context
          and expense.is_active is true
          and expense.status <> 'cancelled'
      ), 0)::numeric as total_contracted,
      coalesce((
        select sum(payment.amount)
        from public.financial_expense_payments as payment
        join public.financial_expenses as expense
          on expense.id = payment.expense_id
        where expense.context = selected_contexts.context
          and expense.is_active is true
          and expense.status <> 'cancelled'
          and payment.status = 'paid'
      ), 0)::numeric as total_paid,
      coalesce((
        select count(*)
        from public.financial_expense_payments as payment
        join public.financial_expenses as expense
          on expense.id = payment.expense_id
        where expense.context = selected_contexts.context
          and expense.is_active is true
          and expense.status <> 'cancelled'
          and payment.status = 'unpaid'
          and payment.due_date is not null
          and payment.due_date < current_date
      ), 0)::bigint as overdue_payment_count,
      (
        select min(payment.due_date)
        from public.financial_expense_payments as payment
        join public.financial_expenses as expense
          on expense.id = payment.expense_id
        where expense.context = selected_contexts.context
          and expense.is_active is true
          and expense.status <> 'cancelled'
          and payment.status = 'unpaid'
          and payment.due_date is not null
      ) as next_due_date,
      coalesce((
        select sum(payment.amount)
        from public.financial_expense_payments as payment
        join public.financial_expenses as expense
          on expense.id = payment.expense_id
        where expense.context = selected_contexts.context
          and expense.is_active is true
          and expense.status <> 'cancelled'
          and payment.status = 'unpaid'
          and payment.due_date >= date_trunc('month', current_date)::date
          and payment.due_date < (date_trunc('month', current_date) + interval '1 month')::date
      ), 0)::numeric as due_this_month_amount
    from selected_contexts
    left join reference_scenarios
      on reference_scenarios.context = selected_contexts.context
    left join public.financial_budget_items as budget_item
      on budget_item.scenario_id = reference_scenarios.id
    group by selected_contexts.context, reference_scenarios.id, reference_scenarios.name
  ),
  with_calculations as (
    select
      context_summary.context,
      context_summary.reference_scenario_id,
      context_summary.reference_scenario_name,
      context_summary.reference_budget_amount,
      context_summary.total_contracted,
      context_summary.total_paid,
      greatest(context_summary.total_contracted - context_summary.total_paid, 0)::numeric as total_remaining,
      (context_summary.total_contracted - context_summary.reference_budget_amount)::numeric as committed_delta,
      case
        when context_summary.reference_budget_amount > 0
          then round((context_summary.total_contracted / context_summary.reference_budget_amount) * 100, 2)
        else null
      end as committed_percent,
      context_summary.overdue_payment_count,
      context_summary.next_due_date,
      context_summary.due_this_month_amount
    from context_summary
  )
  select * from with_calculations
  union all
  select
    'all' as context,
    null::uuid as reference_scenario_id,
    'Referências consolidadas' as reference_scenario_name,
    sum(with_calculations.reference_budget_amount)::numeric as reference_budget_amount,
    sum(with_calculations.total_contracted)::numeric as total_contracted,
    sum(with_calculations.total_paid)::numeric as total_paid,
    sum(with_calculations.total_remaining)::numeric as total_remaining,
    sum(with_calculations.committed_delta)::numeric as committed_delta,
    case
      when sum(with_calculations.reference_budget_amount) > 0
        then round((sum(with_calculations.total_contracted) / sum(with_calculations.reference_budget_amount)) * 100, 2)
      else null
    end as committed_percent,
    sum(with_calculations.overdue_payment_count)::bigint as overdue_payment_count,
    min(with_calculations.next_due_date) as next_due_date,
    sum(with_calculations.due_this_month_amount)::numeric as due_this_month_amount
  from with_calculations
  where coalesce(target_context, 'all') = 'all'
  having coalesce(target_context, 'all') = 'all';
end;
$$;

revoke all on function public.admin_get_financial_summary(text) from public, anon;
grant execute on function public.admin_get_financial_summary(text) to authenticated;

commit;
