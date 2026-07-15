-- ============================================================
-- Verification: manual notification reminders
-- ============================================================

select
  'notification_events origin column exists' as check_name,
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'notification_events'
      and column_name = 'origin'
  ) as check_passed;

select
  'notification_events origin constraint exists' as check_name,
  exists (
    select 1
    from pg_constraint
    where conname = 'notification_events_origin_check'
  ) as check_passed;

select
  'manual reminder preferences exist' as check_name,
  count(*) = 2 as check_passed
from public.notification_preferences
where event_type in (
  'gift_reservation_reminder',
  'gift_contribution_reminder'
)
  and manual_enabled is true;

select
  'manual reminder RPCs exist' as check_name,
  to_regprocedure('public.admin_send_gift_reservation_reminder(uuid)') is not null
  and to_regprocedure('public.admin_send_gift_contribution_reminder(uuid)') is not null
  as check_passed;

select
  'notification audit RPC accepts origin and search filters' as check_name,
  to_regprocedure(
    'public.admin_list_notification_deliveries(text,text,text,timestamp with time zone,timestamp with time zone,integer,integer,text,text)'
  ) is not null as check_passed;

select
  'manual reminder RPCs are authenticated only' as check_name,
  not has_function_privilege(
    'anon',
    'public.admin_send_gift_reservation_reminder(uuid)',
    'execute'
  )
  and has_function_privilege(
    'authenticated',
    'public.admin_send_gift_reservation_reminder(uuid)',
    'execute'
  )
  and not has_function_privilege(
    'anon',
    'public.admin_send_gift_contribution_reminder(uuid)',
    'execute'
  )
  and has_function_privilege(
    'authenticated',
    'public.admin_send_gift_contribution_reminder(uuid)',
    'execute'
  ) as check_passed;
