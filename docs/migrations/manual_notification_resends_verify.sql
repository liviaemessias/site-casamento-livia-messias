-- ============================================================
-- Verification: manual notification resends
-- ============================================================

select
  'manual notification resend RPCs exist' as check_name,
  to_regprocedure('public.admin_create_manual_notification_event(text,uuid,text)') is not null
  and to_regprocedure('public.admin_resend_notification_delivery(uuid)') is not null
  as check_passed;

select
  'manual notification resend RPCs are authenticated only' as check_name,
  not has_function_privilege(
    'anon',
    'public.admin_create_manual_notification_event(text,uuid,text)',
    'execute'
  )
  and has_function_privilege(
    'authenticated',
    'public.admin_create_manual_notification_event(text,uuid,text)',
    'execute'
  )
  and not has_function_privilege(
    'anon',
    'public.admin_resend_notification_delivery(uuid)',
    'execute'
  )
  and has_function_privilege(
    'authenticated',
    'public.admin_resend_notification_delivery(uuid)',
    'execute'
  )
  as check_passed;

select
  'manual resends enabled for existing transactional events' as check_name,
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
)
and manual_enabled is true;
