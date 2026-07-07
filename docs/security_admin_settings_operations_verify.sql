-- Every row returned by this script should have check_passed = true.

select
  'settings singleton index exists' as check_name,
  to_regclass('public.settings_singleton_idx') is not null as check_passed;

select
  'settings has at most one row' as check_name,
  (select count(*) from public.settings) <= 1 as check_passed;

select
  'secure settings RPC exists' as check_name,
  to_regprocedure(
    'public.admin_save_settings(text,text,text,text,integer,jsonb)'
  ) is not null as check_passed;

select
  'secure settings RPC has restricted execution' as check_name,
  not has_function_privilege(
    'anon',
    'public.admin_save_settings(text,text,text,text,integer,jsonb)',
    'execute'
  )
  and has_function_privilege(
    'authenticated',
    'public.admin_save_settings(text,text,text,text,integer,jsonb)',
    'execute'
  ) as check_passed;

select
  'authenticated cannot mutate settings directly' as check_name,
  not has_table_privilege('authenticated', 'public.settings', 'insert')
  and not has_table_privilege('authenticated', 'public.settings', 'update')
  and not has_table_privilege('authenticated', 'public.settings', 'delete')
    as check_passed;
