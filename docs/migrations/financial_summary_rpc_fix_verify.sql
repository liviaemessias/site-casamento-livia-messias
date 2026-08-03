select
  'financial summary RPC exists' as check_name,
  to_regprocedure('public.admin_get_financial_summary(text)') is not null as check_passed
union all
select
  'financial summary RPC has restricted execution' as check_name,
  not has_function_privilege(
    'anon',
    'public.admin_get_financial_summary(text)',
    'execute'
  )
  and has_function_privilege(
    'authenticated',
    'public.admin_get_financial_summary(text)',
    'execute'
  ) as check_passed
union all
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
