-- Release 4.2 - Link real expenses to planned budget items
-- Run after docs/migrations/financial_management.sql in existing projects.

begin;

alter table public.financial_expenses
  add column if not exists budget_item_id uuid null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'financial_expenses_budget_item_id_fkey'
      and conrelid = 'public.financial_expenses'::regclass
  ) then
    alter table public.financial_expenses
      add constraint financial_expenses_budget_item_id_fkey
      foreign key (budget_item_id)
      references public.financial_budget_items(id)
      on delete set null;
  end if;
end;
$$;

create index if not exists financial_expenses_budget_item_idx
  on public.financial_expenses (budget_item_id);

drop function if exists public.admin_list_financial_budget_items();

create or replace function public.admin_list_financial_budget_items()
returns table (
  id uuid,
  scenario_id uuid,
  scenario_name text,
  scenario_is_reference boolean,
  category_id uuid,
  category_name text,
  context text,
  title text,
  estimated_amount numeric,
  expected_vendor_name text,
  priority text,
  status text,
  notes text,
  display_order integer,
  is_active boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  linked_expense_count bigint,
  linked_expense_total numeric,
  linked_paid_total numeric,
  linked_remaining_total numeric,
  linked_delta numeric
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.' using errcode = '42501';
  end if;

  return query
  select
    item.id,
    item.scenario_id,
    scenario.name,
    scenario.is_reference,
    item.category_id,
    category.name,
    item.context,
    item.title,
    item.estimated_amount,
    item.expected_vendor_name,
    item.priority,
    item.status,
    item.notes,
    item.display_order,
    item.is_active,
    item.created_at,
    item.updated_at,
    coalesce(linked_expenses.linked_expense_count, 0)::bigint,
    coalesce(linked_expenses.linked_expense_total, 0)::numeric,
    coalesce(linked_payments.linked_paid_total, 0)::numeric,
    greatest(
      coalesce(linked_expenses.linked_expense_total, 0) - coalesce(linked_payments.linked_paid_total, 0),
      0
    )::numeric,
    (
      coalesce(linked_expenses.linked_expense_total, 0) - item.estimated_amount
    )::numeric
  from public.financial_budget_items as item
  join public.financial_budget_scenarios as scenario
    on scenario.id = item.scenario_id
  join public.financial_categories as category
    on category.id = item.category_id
  left join lateral (
    select
      count(*)::bigint as linked_expense_count,
      coalesce(sum(expense.total_amount), 0)::numeric as linked_expense_total
    from public.financial_expenses as expense
    where expense.budget_item_id = item.id
      and expense.is_active is true
      and expense.status <> 'cancelled'
  ) as linked_expenses on true
  left join lateral (
    select
      coalesce(sum(payment.amount), 0)::numeric as linked_paid_total
    from public.financial_expenses as expense
    join public.financial_expense_payments as payment
      on payment.expense_id = expense.id
    where expense.budget_item_id = item.id
      and expense.is_active is true
      and expense.status <> 'cancelled'
      and payment.status = 'paid'
  ) as linked_payments on true
  order by item.context asc, scenario.display_order asc, category.display_order asc, item.display_order asc, item.title asc;
end;
$$;

drop function if exists public.admin_list_financial_expenses();

create or replace function public.admin_list_financial_expenses()
returns table (
  id uuid,
  category_id uuid,
  category_name text,
  budget_item_id uuid,
  budget_item_title text,
  budget_item_estimated_amount numeric,
  vendor_id uuid,
  vendor_name text,
  default_payer_id uuid,
  default_payer_name text,
  context text,
  type text,
  title text,
  description text,
  total_amount numeric,
  paid_amount numeric,
  remaining_amount numeric,
  payment_method text,
  status text,
  contracted_at date,
  reference_url text,
  notes text,
  is_active boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.' using errcode = '42501';
  end if;

  return query
  select
    expense.id,
    expense.category_id,
    category.name,
    expense.budget_item_id,
    budget_item.title,
    budget_item.estimated_amount,
    expense.vendor_id,
    vendor.name,
    expense.default_payer_id,
    payer.name,
    expense.context,
    expense.type,
    expense.title,
    expense.description,
    expense.total_amount,
    coalesce(sum(payment.amount) filter (where payment.status = 'paid'), 0)::numeric as paid_amount,
    greatest(
      expense.total_amount - coalesce(sum(payment.amount) filter (where payment.status = 'paid'), 0),
      0
    )::numeric as remaining_amount,
    expense.payment_method,
    expense.status,
    expense.contracted_at,
    expense.reference_url,
    expense.notes,
    expense.is_active,
    expense.created_at,
    expense.updated_at
  from public.financial_expenses as expense
  join public.financial_categories as category
    on category.id = expense.category_id
  left join public.financial_budget_items as budget_item
    on budget_item.id = expense.budget_item_id
  left join public.wedding_vendors as vendor
    on vendor.id = expense.vendor_id
  left join public.financial_payers as payer
    on payer.id = expense.default_payer_id
  left join public.financial_expense_payments as payment
    on payment.expense_id = expense.id
  group by expense.id, category.name, budget_item.title, budget_item.estimated_amount, vendor.name, payer.name
  order by expense.context asc, expense.contracted_at nulls last, category.name asc, expense.title asc;
end;
$$;

drop function if exists public.admin_save_financial_expense(
  uuid, uuid, text, uuid, uuid, text, text, text, numeric, text, text, date, text, text, boolean
);

create or replace function public.admin_save_financial_expense(
  target_expense_id uuid,
  submitted_category_id uuid,
  submitted_budget_item_id uuid default null,
  submitted_context text default null,
  submitted_vendor_id uuid default null,
  submitted_default_payer_id uuid default null,
  submitted_type text default 'supplier',
  submitted_title text default null,
  submitted_description text default null,
  submitted_total_amount numeric default 0,
  submitted_payment_method text default 'custom',
  submitted_status text default 'planned',
  submitted_contracted_at date default null,
  submitted_reference_url text default null,
  submitted_notes text default null,
  submitted_is_active boolean default true
)
returns setof public.financial_expenses
language plpgsql
security definer
set search_path = ''
as $$
declare
  saved_expense public.financial_expenses%rowtype;
  category_record public.financial_categories%rowtype;
  budget_item_record public.financial_budget_items%rowtype;
  safe_context text := nullif(btrim(submitted_context), '');
  safe_title text := nullif(btrim(submitted_title), '');
  safe_type text := coalesce(nullif(btrim(submitted_type), ''), 'supplier');
  safe_payment_method text := coalesce(nullif(btrim(submitted_payment_method), ''), 'custom');
  safe_status text := coalesce(nullif(btrim(submitted_status), ''), 'planned');
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.' using errcode = '42501';
  end if;

  if safe_title is null then
    raise exception 'Financial expense title is required.' using errcode = '22023';
  end if;

  select * into category_record
  from public.financial_categories
  where id = submitted_category_id;

  if not found then
    raise exception 'Financial category not found.' using errcode = 'P0002';
  end if;

  safe_context := coalesce(safe_context, nullif(category_record.context, 'both'));

  if safe_context not in ('wedding', 'honeymoon') then
    raise exception 'Financial expense context is required for shared categories.' using errcode = '22023';
  end if;

  if category_record.context <> 'both'
    and category_record.context <> safe_context
  then
    raise exception 'Financial category does not match the expense context.' using errcode = '22023';
  end if;

  if submitted_vendor_id is not null
    and not exists (select 1 from public.wedding_vendors where id = submitted_vendor_id)
  then
    raise exception 'Wedding vendor not found.' using errcode = 'P0002';
  end if;

  if submitted_default_payer_id is not null
    and not exists (select 1 from public.financial_payers where id = submitted_default_payer_id)
  then
    raise exception 'Financial payer not found.' using errcode = 'P0002';
  end if;

  if submitted_budget_item_id is not null then
    select * into budget_item_record
    from public.financial_budget_items
    where id = submitted_budget_item_id;

    if not found then
      raise exception 'Financial budget item not found.' using errcode = 'P0002';
    end if;

    if budget_item_record.context <> safe_context then
      raise exception 'Financial budget item does not match the expense context.' using errcode = '22023';
    end if;
  end if;

  if target_expense_id is null then
    insert into public.financial_expenses (
      category_id,
      budget_item_id,
      context,
      vendor_id,
      default_payer_id,
      type,
      title,
      description,
      total_amount,
      payment_method,
      status,
      contracted_at,
      reference_url,
      notes,
      is_active
    )
    values (
      category_record.id,
      submitted_budget_item_id,
      safe_context,
      submitted_vendor_id,
      submitted_default_payer_id,
      safe_type,
      safe_title,
      nullif(btrim(submitted_description), ''),
      coalesce(submitted_total_amount, 0),
      safe_payment_method,
      safe_status,
      submitted_contracted_at,
      nullif(btrim(submitted_reference_url), ''),
      nullif(btrim(submitted_notes), ''),
      coalesce(submitted_is_active, true)
    )
    returning * into saved_expense;
  else
    update public.financial_expenses
    set
      category_id = category_record.id,
      budget_item_id = submitted_budget_item_id,
      context = safe_context,
      vendor_id = submitted_vendor_id,
      default_payer_id = submitted_default_payer_id,
      type = safe_type,
      title = safe_title,
      description = nullif(btrim(submitted_description), ''),
      total_amount = coalesce(submitted_total_amount, 0),
      payment_method = safe_payment_method,
      status = safe_status,
      contracted_at = submitted_contracted_at,
      reference_url = nullif(btrim(submitted_reference_url), ''),
      notes = nullif(btrim(submitted_notes), ''),
      is_active = coalesce(submitted_is_active, true)
    where id = target_expense_id
    returning * into saved_expense;

    if saved_expense.id is null then
      raise exception 'Financial expense not found.' using errcode = 'P0002';
    end if;
  end if;

  return next saved_expense;
end;
$$;

revoke all on function public.admin_list_financial_budget_items() from public, anon;
grant execute on function public.admin_list_financial_budget_items() to authenticated;

revoke all on function public.admin_list_financial_expenses() from public, anon;
grant execute on function public.admin_list_financial_expenses() to authenticated;

revoke all on function public.admin_save_financial_expense(
  uuid, uuid, uuid, text, uuid, uuid, text, text, text, numeric, text, text, date, text, text, boolean
) from public, anon;
grant execute on function public.admin_save_financial_expense(
  uuid, uuid, uuid, text, uuid, uuid, text, text, text, numeric, text, text, date, text, text, boolean
) to authenticated;

commit;
