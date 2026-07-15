-- ============================================================
-- Notification preferences verification
-- ============================================================

select
  'notification_preferences table exists' as check_name,
  to_regclass('public.notification_preferences') is not null as check_passed;

select
  'notification_preferences has RLS enabled' as check_name,
  c.relrowsecurity as check_passed
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname = 'notification_preferences';

select
  'notification_preferences service_role can select' as check_name,
  has_table_privilege(
    'service_role',
    'public.notification_preferences',
    'select'
  ) as check_passed;

select
  'notification_preferences is hidden from anon/authenticated' as check_name,
  not has_table_privilege('anon', 'public.notification_preferences', 'select')
  and not has_table_privilege('authenticated', 'public.notification_preferences', 'select')
  and not has_table_privilege('authenticated', 'public.notification_preferences', 'update')
  as check_passed;

select
  'notification_preferences contains current automatic event types' as check_name,
  count(*) = 9 as check_passed
from public.notification_preferences
where event_type in (
  'rsvp_saved',
  'gift_reserved',
  'gift_payment_reported',
  'gift_purchase_confirmed',
  'gift_reservation_released',
  'gift_contribution_reserved',
  'gift_contribution_payment_reported',
  'gift_contribution_confirmed',
  'gift_contribution_released'
);
