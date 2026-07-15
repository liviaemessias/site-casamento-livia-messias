-- ============================================================
-- Verification: notification delivery sorting
-- ============================================================

select
  'sortable notification audit RPC exists' as check_name,
  to_regprocedure(
    'public.admin_list_notification_deliveries(text,text,text,timestamp with time zone,timestamp with time zone,integer,integer,text,text,text,text)'
  ) is not null as check_passed;

select
  'sortable notification audit RPC has restricted execution' as check_name,
  not has_function_privilege(
    'anon',
    'public.admin_list_notification_deliveries(text,text,text,timestamp with time zone,timestamp with time zone,integer,integer,text,text,text,text)',
    'execute'
  )
  and has_function_privilege(
    'authenticated',
    'public.admin_list_notification_deliveries(text,text,text,timestamp with time zone,timestamp with time zone,integer,integer,text,text,text,text)',
    'execute'
  ) as check_passed;
