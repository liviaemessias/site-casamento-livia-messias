-- ============================================================
-- Verification: Financial budget shared categories hotfix
-- ============================================================
--
-- Every row returned by this query should have check_passed = true.

select
  'budget item RPC accepts shared categories' as check_name,
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
