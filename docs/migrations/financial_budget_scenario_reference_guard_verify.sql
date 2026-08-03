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
  ) as check_passed
union all
select
  'financial scenario save RPC enforces active reference guard' as check_name,
  exists (
    select 1
    from pg_proc
    join pg_namespace
      on pg_namespace.oid = pg_proc.pronamespace
    where pg_namespace.nspname = 'public'
      and pg_proc.proname = 'admin_save_financial_budget_scenario'
      and pg_get_functiondef(pg_proc.oid) like '%Each financial context must have one active reference scenario.%'
      and pg_get_functiondef(pg_proc.oid) like '%A reference financial budget scenario must be active.%'
  ) as check_passed
union all
select
  'financial scenario delete RPC enforces active reference guard' as check_name,
  exists (
    select 1
    from pg_proc
    join pg_namespace
      on pg_namespace.oid = pg_proc.pronamespace
    where pg_namespace.nspname = 'public'
      and pg_proc.proname = 'admin_delete_financial_budget_scenario'
      and pg_get_functiondef(pg_proc.oid) like '%Each financial context must have one active reference scenario.%'
  ) as check_passed
union all
select
  'financial scenario admin RPCs have restricted execution' as check_name,
  not has_function_privilege(
    'anon',
    'public.admin_save_financial_budget_scenario(uuid,text,text,text,boolean,integer,boolean)',
    'execute'
  )
  and has_function_privilege(
    'authenticated',
    'public.admin_save_financial_budget_scenario(uuid,text,text,text,boolean,integer,boolean)',
    'execute'
  )
  and not has_function_privilege(
    'anon',
    'public.admin_delete_financial_budget_scenario(uuid)',
    'execute'
  )
  and has_function_privilege(
    'authenticated',
    'public.admin_delete_financial_budget_scenario(uuid)',
    'execute'
  ) as check_passed;
