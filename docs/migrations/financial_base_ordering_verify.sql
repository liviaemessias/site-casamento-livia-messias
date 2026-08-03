select
  format('%s exists', expected.function_name) as check_name,
  to_regprocedure(expected.function_name) is not null as check_passed
from (
  values
    ('public.admin_reorder_financial_budget_scenarios(text,uuid[])'),
    ('public.admin_reorder_financial_categories(text,uuid[])'),
    ('public.admin_reorder_financial_payers(uuid[])')
) as expected(function_name)
union all
select
  'financial base ordering RPCs have restricted execution' as check_name,
  not exists (
    select 1
    from (
      values
        ('public.admin_reorder_financial_budget_scenarios(text,uuid[])'),
        ('public.admin_reorder_financial_categories(text,uuid[])'),
        ('public.admin_reorder_financial_payers(uuid[])')
    ) as expected(function_name)
    where has_function_privilege('anon', expected.function_name, 'execute')
      or not has_function_privilege('authenticated', expected.function_name, 'execute')
  ) as check_passed
union all
select
  'financial base ordering RPCs validate duplicate ids' as check_name,
  exists (
    select 1
    from pg_proc
    join pg_namespace
      on pg_namespace.oid = pg_proc.pronamespace
    where pg_namespace.nspname = 'public'
      and pg_proc.proname = 'admin_reorder_financial_budget_scenarios'
      and pg_get_functiondef(pg_proc.oid) like '%duplicate scenarios%'
  )
  and exists (
    select 1
    from pg_proc
    join pg_namespace
      on pg_namespace.oid = pg_proc.pronamespace
    where pg_namespace.nspname = 'public'
      and pg_proc.proname = 'admin_reorder_financial_categories'
      and pg_get_functiondef(pg_proc.oid) like '%duplicate categories%'
  )
  and exists (
    select 1
    from pg_proc
    join pg_namespace
      on pg_namespace.oid = pg_proc.pronamespace
    where pg_namespace.nspname = 'public'
      and pg_proc.proname = 'admin_reorder_financial_payers'
      and pg_get_functiondef(pg_proc.oid) like '%duplicate payers%'
  ) as check_passed;
