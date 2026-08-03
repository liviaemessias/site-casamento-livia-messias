-- Verification: admin navigation alerts for due or overdue financial payments

select
  'admin navigation alerts include due financial payments flag' as check_name,
  exists (
    select 1
    from pg_proc
    where oid = 'public.admin_get_nav_alerts()'::regprocedure
      and proargnames @> array['has_due_financial_payments']
  ) as check_passed;

select
  'admin navigation alerts query financial payments' as check_name,
  exists (
    select 1
    from pg_proc
    where oid = 'public.admin_get_nav_alerts()'::regprocedure
      and pg_get_functiondef(oid) like '%financial_expense_payments%'
      and pg_get_functiondef(oid) like '%payment.status = ''unpaid''%'
      and pg_get_functiondef(oid) like '%payment.due_date <= current_date%'
  ) as check_passed;

select
  'admin navigation alerts RPC remains authenticated only' as check_name,
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
