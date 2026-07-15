-- ============================================================
-- Verification: wall message email notifications
-- ============================================================

select
  'wall message notification preferences exist' as check_name,
  count(*) = 3 as check_passed
from public.notification_preferences
where event_type in (
  'wall_message_submitted',
  'wall_message_approved',
  'wall_message_replied'
);

select
  'wall message notification helper exists' as check_name,
  to_regprocedure('public.enqueue_wall_message_notification_event(text,uuid,timestamp with time zone)') is not null as check_passed;

select
  'wall message notification helper is internal only' as check_name,
  not has_function_privilege(
    'anon',
    'public.enqueue_wall_message_notification_event(text,uuid,timestamp with time zone)',
    'execute'
  )
  and not has_function_privilege(
    'authenticated',
    'public.enqueue_wall_message_notification_event(text,uuid,timestamp with time zone)',
    'execute'
  ) as check_passed;

select
  'wall message event group is allowed' as check_name,
  exists (
    select 1
    from pg_constraint
    where conname = 'notification_preferences_event_group_check'
      and pg_get_constraintdef(oid) like '%wall_message%'
  ) as check_passed;
