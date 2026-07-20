-- Verification: admin navigation alerts

select
  'admin navigation alerts RPC exists' as check_name,
  to_regprocedure('public.admin_get_nav_alerts()') is not null as check_passed;

select
  'admin navigation alerts include checklist overdue flag' as check_name,
  exists (
    select 1
    from pg_proc
    where oid = 'public.admin_get_nav_alerts()'::regprocedure
      and proargnames @> array['has_overdue_checklist_tasks']
  ) as check_passed;

select
  'admin navigation alerts RPC is authenticated only' as check_name,
  not has_function_privilege(
    'anon',
    'public.admin_get_nav_alerts()',
    'execute'
  )
  and has_function_privilege(
    'authenticated',
    'public.admin_get_nav_alerts()',
    'execute'
  ) as check_passed;
