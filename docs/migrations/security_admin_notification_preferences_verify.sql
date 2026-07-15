-- ============================================================
-- Verification: administrative notification preference operations
-- ============================================================

select
  'admin notification preference RPCs exist' as check_name,
  to_regprocedure('public.admin_list_notification_preferences()') is not null
  and to_regprocedure('public.admin_update_notification_preference(text,boolean,boolean,boolean,boolean)') is not null
  as check_passed;

select
  'admin notification preference RPCs are authenticated only' as check_name,
  not has_function_privilege(
    'anon',
    'public.admin_list_notification_preferences()',
    'execute'
  )
  and has_function_privilege(
    'authenticated',
    'public.admin_list_notification_preferences()',
    'execute'
  )
  and not has_function_privilege(
    'anon',
    'public.admin_update_notification_preference(text,boolean,boolean,boolean,boolean)',
    'execute'
  )
  and has_function_privilege(
    'authenticated',
    'public.admin_update_notification_preference(text,boolean,boolean,boolean,boolean)',
    'execute'
  ) as check_passed;

select
  'notification preferences remain hidden from authenticated direct access' as check_name,
  not has_table_privilege(
    'authenticated',
    'public.notification_preferences',
    'select, insert, update, delete'
  ) as check_passed;
