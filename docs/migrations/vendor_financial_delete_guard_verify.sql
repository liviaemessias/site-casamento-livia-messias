-- ============================================================
-- Verification: Vendor financial delete guard
-- ============================================================
--
-- Every row returned by this query should have check_passed = true.

select
  'vendor delete RPC protects financial links' as check_name,
  exists (
    select 1
    from pg_proc
    join pg_namespace
      on pg_namespace.oid = pg_proc.pronamespace
    where pg_namespace.nspname = 'public'
      and pg_proc.proname = 'admin_delete_vendor'
      and pg_get_functiondef(pg_proc.oid) like '%public.financial_expenses%'
      and pg_get_functiondef(pg_proc.oid) like '%Vendor is linked to financial expenses and cannot be deleted.%'
  ) as check_passed;
