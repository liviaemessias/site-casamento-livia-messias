-- Verification: notification delivery summary

select
  'notification delivery summary RPC exists' as check_name,
  to_regprocedure(
    'public.admin_get_notification_delivery_summary(text,text,text,timestamp with time zone,timestamp with time zone,text,text)'
  ) is not null as check_passed;

select
  'notification delivery summary RPC is authenticated only' as check_name,
  not has_function_privilege(
    'anon',
    'public.admin_get_notification_delivery_summary(text,text,text,timestamp with time zone,timestamp with time zone,text,text)',
    'execute'
  )
  and has_function_privilege(
    'authenticated',
    'public.admin_get_notification_delivery_summary(text,text,text,timestamp with time zone,timestamp with time zone,text,text)',
    'execute'
  ) as check_passed;
