-- Verification: financial management
-- Every row returned by this script should have check_passed = true.

select
  'financial management tables exist' as check_name,
  to_regclass('public.financial_budget_scenarios') is not null
  and to_regclass('public.financial_categories') is not null
  and to_regclass('public.financial_payers') is not null
  and to_regclass('public.financial_budget_items') is not null
  and to_regclass('public.financial_expenses') is not null
  and to_regclass('public.financial_expense_payments') is not null
    as check_passed;

select
  'financial expenses can link to budget items' as check_name,
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'financial_expenses'
      and column_name = 'budget_item_id'
  )
  and to_regclass('public.financial_expenses_budget_item_idx') is not null
    as check_passed;

select
  'financial management tables have RLS enabled' as check_name,
  bool_and(class.relrowsecurity) as check_passed
from pg_class as class
join pg_namespace as namespace
  on namespace.oid = class.relnamespace
where namespace.nspname = 'public'
  and class.relname in (
    'financial_budget_scenarios',
    'financial_categories',
    'financial_payers',
    'financial_budget_items',
    'financial_expenses',
    'financial_expense_payments'
  );

select
  'financial tables are hidden from anon/authenticated direct access' as check_name,
  not exists (
    select 1
    from (
      values
        ('financial_budget_scenarios'),
        ('financial_categories'),
        ('financial_payers'),
        ('financial_budget_items'),
        ('financial_expenses'),
        ('financial_expense_payments')
    ) as financial_tables(table_name)
    where has_table_privilege(
      'anon',
      format('public.%I', financial_tables.table_name),
      'select, insert, update, delete'
    )
      or has_table_privilege(
        'authenticated',
        format('public.%I', financial_tables.table_name),
        'select, insert, update, delete'
      )
  ) as check_passed;

select
  'financial seed scenarios exist' as check_name,
  exists (
    select 1
    from public.financial_budget_scenarios
    where context = 'wedding'
      and name = 'Planejado'
      and is_reference is true
      and is_active is true
  )
  and exists (
    select 1
    from public.financial_budget_scenarios
    where context = 'honeymoon'
      and name = 'Planejado'
      and is_reference is true
      and is_active is true
  ) as check_passed;

select
  'financial contexts have exactly one active reference scenario' as check_name,
  not exists (
    select 1
    from (values ('wedding'), ('honeymoon')) as expected(context)
    left join public.financial_budget_scenarios as scenario
      on scenario.context = expected.context
      and scenario.is_reference is true
      and scenario.is_active is true
    group by expected.context
    having count(scenario.id) <> 1
  ) as check_passed;

select
  'financial seed categories exist' as check_name,
  count(*) >= 15 as check_passed
from public.financial_categories;

select
  'financial seed payers exist' as check_name,
  count(*) >= 7 as check_passed
from public.financial_payers;

select
  format('%s exists', expected.function_name) as check_name,
  to_regprocedure(expected.function_name) is not null as check_passed
from (
  values
    ('public.admin_list_financial_categories()'),
    ('public.admin_save_financial_category(uuid,text,text,text,text,integer,boolean)'),
    ('public.admin_delete_financial_category(uuid)'),
    ('public.admin_reorder_financial_categories(text,uuid[])'),
    ('public.admin_list_financial_payers()'),
    ('public.admin_save_financial_payer(uuid,text,text,text,text,integer,boolean)'),
    ('public.admin_delete_financial_payer(uuid)'),
    ('public.admin_reorder_financial_payers(uuid[])'),
    ('public.admin_list_financial_budget_scenarios()'),
    ('public.admin_save_financial_budget_scenario(uuid,text,text,text,boolean,integer,boolean)'),
    ('public.admin_delete_financial_budget_scenario(uuid)'),
    ('public.admin_reorder_financial_budget_scenarios(text,uuid[])'),
    ('public.admin_list_financial_budget_items()'),
    ('public.admin_save_financial_budget_item(uuid,uuid,uuid,text,numeric,text,text,text,text,integer,boolean)'),
    ('public.admin_delete_financial_budget_item(uuid)'),
    ('public.admin_list_financial_expenses()'),
    ('public.admin_save_financial_expense(uuid,uuid,uuid,text,uuid,uuid,text,text,text,numeric,text,text,date,text,text,boolean)'),
    ('public.admin_delete_financial_expense(uuid)'),
    ('public.admin_list_financial_expense_payments()'),
    ('public.admin_save_financial_expense_payment(uuid,uuid,uuid,integer,text,numeric,date,date,text,text)'),
    ('public.admin_delete_financial_expense_payment(uuid)'),
    ('public.admin_get_financial_summary(text)')
) as expected(function_name);

select
  'financial admin RPCs have restricted execution' as check_name,
  not exists (
    select 1
    from (
      values
        ('public.admin_list_financial_categories()'),
        ('public.admin_save_financial_category(uuid,text,text,text,text,integer,boolean)'),
        ('public.admin_delete_financial_category(uuid)'),
        ('public.admin_reorder_financial_categories(text,uuid[])'),
        ('public.admin_list_financial_payers()'),
        ('public.admin_save_financial_payer(uuid,text,text,text,text,integer,boolean)'),
        ('public.admin_delete_financial_payer(uuid)'),
        ('public.admin_reorder_financial_payers(uuid[])'),
        ('public.admin_list_financial_budget_scenarios()'),
        ('public.admin_save_financial_budget_scenario(uuid,text,text,text,boolean,integer,boolean)'),
        ('public.admin_delete_financial_budget_scenario(uuid)'),
        ('public.admin_reorder_financial_budget_scenarios(text,uuid[])'),
        ('public.admin_list_financial_budget_items()'),
        ('public.admin_save_financial_budget_item(uuid,uuid,uuid,text,numeric,text,text,text,text,integer,boolean)'),
        ('public.admin_delete_financial_budget_item(uuid)'),
        ('public.admin_list_financial_expenses()'),
        ('public.admin_save_financial_expense(uuid,uuid,uuid,text,uuid,uuid,text,text,text,numeric,text,text,date,text,text,boolean)'),
        ('public.admin_delete_financial_expense(uuid)'),
        ('public.admin_list_financial_expense_payments()'),
        ('public.admin_save_financial_expense_payment(uuid,uuid,uuid,integer,text,numeric,date,date,text,text)'),
        ('public.admin_delete_financial_expense_payment(uuid)'),
        ('public.admin_get_financial_summary(text)')
    ) as expected(function_name)
    where has_function_privilege('anon', expected.function_name, 'execute')
      or not has_function_privilege('authenticated', expected.function_name, 'execute')
  ) as check_passed;

select
  'financial summary RPC source uses qualified aggregate columns' as check_name,
  exists (
    select 1
    from pg_proc
    join pg_namespace
      on pg_namespace.oid = pg_proc.pronamespace
    where pg_namespace.nspname = 'public'
      and pg_proc.proname = 'admin_get_financial_summary'
      and pg_get_functiondef(pg_proc.oid) like '%sum(with_calculations.reference_budget_amount)%'
      and pg_get_functiondef(pg_proc.oid) like '%sum(with_calculations.total_contracted)%'
      and pg_get_functiondef(pg_proc.oid) like '%min(with_calculations.next_due_date)%'
  ) as check_passed;

select
  'financial budget items accept shared categories' as check_name,
  exists (
    select 1
    from pg_proc
    join pg_namespace
      on pg_namespace.oid = pg_proc.pronamespace
    where pg_namespace.nspname = 'public'
      and pg_proc.proname = 'admin_save_financial_budget_item'
      and pg_get_functiondef(pg_proc.oid) like '%category_record.context not in (scenario_record.context, ''both'')%'
      and pg_get_functiondef(pg_proc.oid) like '%Financial category does not match the scenario context.%'
  ) as check_passed;

select
  'financial scenario RPCs enforce active reference guard' as check_name,
  exists (
    select 1
    from pg_proc
    join pg_namespace
      on pg_namespace.oid = pg_proc.pronamespace
    where pg_namespace.nspname = 'public'
      and pg_proc.proname = 'admin_save_financial_budget_scenario'
      and pg_get_functiondef(pg_proc.oid) like '%Each financial context must have one active reference scenario.%'
      and pg_get_functiondef(pg_proc.oid) like '%A reference financial budget scenario must be active.%'
  )
  and exists (
    select 1
    from pg_proc
    join pg_namespace
      on pg_namespace.oid = pg_proc.pronamespace
    where pg_namespace.nspname = 'public'
      and pg_proc.proname = 'admin_delete_financial_budget_scenario'
      and pg_get_functiondef(pg_proc.oid) like '%Each financial context must have one active reference scenario.%'
  ) as check_passed;
