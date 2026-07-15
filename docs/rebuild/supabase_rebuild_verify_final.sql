-- ============================================================
-- Supabase rebuild: final verification
-- ============================================================
--
-- Every row returned by this query should have check_passed = true.

select * from (
select
  'guests.invite_sent column exists' as check_name,
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'guests'
      and column_name = 'invite_sent'
      and data_type = 'boolean'
  ) as check_passed
union all
select
  'legacy guests.is_admin column is absent' as check_name,
  not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'guests'
      and column_name = 'is_admin'
  ) as check_passed
union all
select
  format('%s exists', expected.object_name) as check_name,
  to_regclass(expected.object_name) is not null as check_passed
from (
  values
    ('public.guests'),
    ('public.rsvps'),
    ('public.gifts'),
    ('public.gift_contributions'),
    ('public.settings'),
    ('public.notification_events'),
    ('public.notification_deliveries'),
    ('public.notification_preferences'),
    ('public.guest_wall_messages'),
    ('public.admin_users'),
    ('public.guest_access_sessions'),
    ('public.invite_login_attempts')
) as expected(object_name)
union all
select
  format('%s has RLS enabled', c.relname) as check_name,
  c.relrowsecurity as check_passed
from pg_class as c
inner join pg_namespace as n
  on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in (
    'guests',
    'rsvps',
    'gifts',
    'gift_contributions',
    'settings',
    'notification_events',
    'notification_deliveries',
    'notification_preferences',
    'guest_wall_messages',
    'admin_users',
    'guest_access_sessions',
    'invite_login_attempts'
  )
union all
select
  format('%s exists', expected.function_name) as check_name,
  to_regprocedure(expected.function_name) is not null as check_passed
from (
  values
    ('public.current_guest_id()'),
    ('public.is_admin()'),
    ('public.create_guest_with_invite_code(text,text,jsonb,integer,boolean)'),
    ('public.admin_confirm_gift_purchase(uuid)'),
    ('public.admin_release_gift_reservation(uuid)'),
    ('public.admin_confirm_gift_contribution(uuid)'),
    ('public.admin_release_gift_contribution(uuid)'),
    ('public.admin_save_guest_rsvp(uuid,text,text,text,text,text,jsonb)'),
    ('public.admin_delete_guest_rsvp(uuid)'),
    ('public.admin_update_guest(uuid,text,text,jsonb,integer,boolean)'),
    ('public.admin_set_guest_active(uuid,boolean)'),
    ('public.admin_set_guest_invite_sent(uuid,boolean)'),
    ('public.admin_save_gift(uuid,text,text,text,numeric,text,text,integer,text,text,jsonb)'),
    ('public.admin_delete_gift(uuid)'),
    ('public.admin_save_settings(text,text,text,text,integer,jsonb)'),
    ('public.admin_list_notification_deliveries(text,text,text,timestamp with time zone,timestamp with time zone,integer,integer,text,text,text,text)'),
    ('public.admin_get_notification_delivery_summary(text,text,text,timestamp with time zone,timestamp with time zone,text,text)'),
    ('public.admin_get_nav_alerts()'),
    ('public.admin_list_notification_preferences()'),
    ('public.admin_update_notification_preference(text,boolean,boolean,boolean,boolean)'),
    ('public.admin_send_gift_reservation_reminder(uuid)'),
    ('public.admin_send_gift_contribution_reminder(uuid)'),
    ('public.admin_create_manual_notification_event(text,uuid,text)'),
    ('public.admin_resend_notification_delivery(uuid)'),
    ('public.admin_list_wall_messages(text,text,integer,integer)'),
    ('public.admin_approve_wall_message(uuid)'),
    ('public.admin_hide_wall_message(uuid)'),
    ('public.admin_reply_wall_message(uuid,text)'),
    ('public.admin_clear_wall_message_reply(uuid)'),
    ('public.admin_delete_wall_message(uuid)'),
    ('public.enqueue_gift_notification_event(text,text,uuid,timestamp with time zone,uuid,jsonb)'),
    ('public.enqueue_wall_message_notification_event(text,uuid,timestamp with time zone)'),
    ('public.get_public_settings()'),
    ('public.get_public_event_settings()'),
    ('public.register_guest_access(uuid)'),
    ('public.get_current_guest_profile()'),
    ('public.list_approved_wall_messages(integer,integer)'),
    ('public.get_current_guest_wall_message()'),
    ('public.save_current_guest_wall_message(text)'),
    ('public.get_gift_catalog()'),
    ('public.save_current_rsvp(text,text,text,text,text,jsonb)'),
    ('public.reserve_gift(uuid,text)'),
    ('public.set_gift_purchase_method(uuid,text,jsonb)'),
    ('public.report_gift_payment(uuid)'),
    ('public.reserve_gift_quotas(uuid,text,integer)'),
    ('public.report_gift_contribution_payment(uuid)'),
    ('public.recalculate_quota_gift_status(uuid)')
) as expected(function_name)
union all
select
  'administrative notification RPC has restricted execution' as check_name,
  not has_function_privilege(
    'anon',
    'public.admin_list_notification_deliveries(text,text,text,timestamp with time zone,timestamp with time zone,integer,integer,text,text,text,text)',
    'execute'
  )
  and has_function_privilege(
    'authenticated',
    'public.admin_list_notification_deliveries(text,text,text,timestamp with time zone,timestamp with time zone,integer,integer,text,text,text,text)',
    'execute'
  ) as check_passed
union all
select
  'administrative notification summary RPC has restricted execution' as check_name,
  not has_function_privilege(
    'anon',
    'public.admin_get_notification_delivery_summary(text,text,text,timestamp with time zone,timestamp with time zone,text,text)',
    'execute'
  )
  and has_function_privilege(
    'authenticated',
    'public.admin_get_notification_delivery_summary(text,text,text,timestamp with time zone,timestamp with time zone,text,text)',
    'execute'
  ) as check_passed
union all
select
  'administrative navigation alert RPC has restricted execution' as check_name,
  not has_function_privilege(
    'anon',
    'public.admin_get_nav_alerts()',
    'execute'
  )
  and has_function_privilege(
    'authenticated',
    'public.admin_get_nav_alerts()',
    'execute'
  ) as check_passed
union all
select
  'manual gift reminder RPCs have restricted execution' as check_name,
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
  ) as check_passed
union all
select
  'manual notification resend RPCs have restricted execution' as check_name,
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
  ) as check_passed
union all
select
  'wall message RPCs have restricted execution' as check_name,
  has_function_privilege(
    'anon',
    'public.list_approved_wall_messages(integer,integer)',
    'execute'
  )
  and has_function_privilege(
    'authenticated',
    'public.list_approved_wall_messages(integer,integer)',
    'execute'
  )
  and not has_function_privilege(
    'anon',
    'public.get_current_guest_wall_message()',
    'execute'
  )
  and has_function_privilege(
    'authenticated',
    'public.get_current_guest_wall_message()',
    'execute'
  )
  and not has_function_privilege(
    'anon',
    'public.save_current_guest_wall_message(text)',
    'execute'
  )
  and has_function_privilege(
    'authenticated',
    'public.save_current_guest_wall_message(text)',
    'execute'
  )
  and not has_function_privilege(
    'anon',
    'public.admin_list_wall_messages(text,text,integer,integer)',
    'execute'
  )
  and has_function_privilege(
    'authenticated',
    'public.admin_list_wall_messages(text,text,integer,integer)',
    'execute'
  )
  and not has_function_privilege(
    'anon',
    'public.admin_approve_wall_message(uuid)',
    'execute'
  )
  and has_function_privilege(
    'authenticated',
    'public.admin_approve_wall_message(uuid)',
    'execute'
  )
  and not has_function_privilege(
    'anon',
    'public.admin_hide_wall_message(uuid)',
    'execute'
  )
  and has_function_privilege(
    'authenticated',
    'public.admin_hide_wall_message(uuid)',
    'execute'
  )
  and not has_function_privilege(
    'anon',
    'public.admin_reply_wall_message(uuid,text)',
    'execute'
  )
  and has_function_privilege(
    'authenticated',
    'public.admin_reply_wall_message(uuid,text)',
    'execute'
  )
  and not has_function_privilege(
    'anon',
    'public.admin_clear_wall_message_reply(uuid)',
    'execute'
  )
  and has_function_privilege(
    'authenticated',
    'public.admin_clear_wall_message_reply(uuid)',
    'execute'
  )
  and not has_function_privilege(
    'anon',
    'public.admin_delete_wall_message(uuid)',
    'execute'
  )
  and has_function_privilege(
    'authenticated',
    'public.admin_delete_wall_message(uuid)',
    'execute'
  ) as check_passed
union all
select
  'administrative notification preference RPCs have restricted execution' as check_name,
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
  ) as check_passed
union all
select
  'gift notification helper is internal only' as check_name,
  not has_function_privilege(
    'anon',
    'public.enqueue_gift_notification_event(text,text,uuid,timestamp with time zone,uuid,jsonb)',
    'execute'
  )
  and not has_function_privilege(
    'authenticated',
    'public.enqueue_gift_notification_event(text,text,uuid,timestamp with time zone,uuid,jsonb)',
    'execute'
  ) as check_passed
union all
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
  ) as check_passed
union all
select
  'notification dedupe constraints exist' as check_name,
  to_regclass('public.notification_events_dedupe_key_key') is not null
  and to_regclass('public.notification_deliveries_dedupe_key_key') is not null
    as check_passed
union all
select
  'notification events track origin' as check_name,
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'notification_events'
      and column_name = 'origin'
  )
  and exists (
    select 1
    from pg_constraint
    where conname = 'notification_events_origin_check'
  ) as check_passed
union all
select
  'secure invitation code RPC has restricted execution' as check_name,
  not has_function_privilege(
    'anon',
    'public.create_guest_with_invite_code(text,text,jsonb,integer,boolean)',
    'execute'
  )
  and has_function_privilege(
    'authenticated',
    'public.create_guest_with_invite_code(text,text,jsonb,integer,boolean)',
    'execute'
  ) as check_passed
union all
select
  'authenticated cannot insert guests directly' as check_name,
  not has_table_privilege(
    'authenticated',
    'public.guests',
    'insert'
  ) as check_passed
union all
select
  'administrative gift RPCs have restricted execution' as check_name,
  not exists (
    select 1
    from (
      values
        ('public.admin_confirm_gift_purchase(uuid)'),
        ('public.admin_release_gift_reservation(uuid)'),
        ('public.admin_confirm_gift_contribution(uuid)'),
        ('public.admin_release_gift_contribution(uuid)')
    ) as expected(function_name)
    where has_function_privilege(
      'anon',
      expected.function_name,
      'execute'
    )
      or not has_function_privilege(
        'authenticated',
        expected.function_name,
        'execute'
      )
  ) as check_passed
union all
select
  'authenticated cannot mutate gift contributions directly' as check_name,
  not has_table_privilege(
    'authenticated',
    'public.gift_contributions',
    'insert'
  )
  and not has_table_privilege(
    'authenticated',
    'public.gift_contributions',
    'update'
  )
  and not has_table_privilege(
    'authenticated',
    'public.gift_contributions',
    'delete'
  ) as check_passed
union all
select
  'administrative RSVP RPCs have restricted execution' as check_name,
  not has_function_privilege(
    'anon',
    'public.admin_save_guest_rsvp(uuid,text,text,text,text,text,jsonb)',
    'execute'
  )
  and not has_function_privilege(
    'anon',
    'public.admin_delete_guest_rsvp(uuid)',
    'execute'
  )
  and has_function_privilege(
    'authenticated',
    'public.admin_save_guest_rsvp(uuid,text,text,text,text,text,jsonb)',
    'execute'
  )
  and has_function_privilege(
    'authenticated',
    'public.admin_delete_guest_rsvp(uuid)',
    'execute'
  ) as check_passed
union all
select
  'authenticated cannot mutate RSVPs directly' as check_name,
  not has_table_privilege('authenticated', 'public.rsvps', 'insert')
  and not has_table_privilege('authenticated', 'public.rsvps', 'update')
  and not has_table_privilege('authenticated', 'public.rsvps', 'delete')
    as check_passed
union all
select
  'administrative guest RPCs have restricted execution' as check_name,
  not has_function_privilege(
    'anon',
    'public.admin_update_guest(uuid,text,text,jsonb,integer,boolean)',
    'execute'
  )
  and not has_function_privilege(
    'anon',
    'public.admin_set_guest_active(uuid,boolean)',
    'execute'
  )
  and not has_function_privilege(
    'anon',
    'public.admin_set_guest_invite_sent(uuid,boolean)',
    'execute'
  )
  and has_function_privilege(
    'authenticated',
    'public.admin_update_guest(uuid,text,text,jsonb,integer,boolean)',
    'execute'
  )
  and has_function_privilege(
    'authenticated',
    'public.admin_set_guest_active(uuid,boolean)',
    'execute'
  )
  and has_function_privilege(
    'authenticated',
    'public.admin_set_guest_invite_sent(uuid,boolean)',
    'execute'
  ) as check_passed
union all
select
  'authenticated cannot mutate guests directly' as check_name,
  not has_table_privilege('authenticated', 'public.guests', 'insert')
  and not has_table_privilege('authenticated', 'public.guests', 'update')
  and not has_table_privilege('authenticated', 'public.guests', 'delete')
    as check_passed
union all
select
  'administrative gift catalog RPCs have restricted execution' as check_name,
  not has_function_privilege(
    'anon',
    'public.admin_save_gift(uuid,text,text,text,numeric,text,text,integer,text,text,jsonb)',
    'execute'
  )
  and not has_function_privilege(
    'anon',
    'public.admin_delete_gift(uuid)',
    'execute'
  )
  and has_function_privilege(
    'authenticated',
    'public.admin_save_gift(uuid,text,text,text,numeric,text,text,integer,text,text,jsonb)',
    'execute'
  )
  and has_function_privilege(
    'authenticated',
    'public.admin_delete_gift(uuid)',
    'execute'
  ) as check_passed
union all
select
  'authenticated cannot mutate gifts directly' as check_name,
  not has_table_privilege('authenticated', 'public.gifts', 'insert')
  and not has_table_privilege('authenticated', 'public.gifts', 'update')
  and not has_table_privilege('authenticated', 'public.gifts', 'delete')
    as check_passed
union all
select
  'authenticated cannot access notification tables directly' as check_name,
  not has_table_privilege(
    'authenticated',
    'public.notification_events',
    'select, insert, update, delete'
  )
  and not has_table_privilege(
    'authenticated',
    'public.notification_deliveries',
    'select, insert, update, delete'
  )
  and not has_table_privilege(
    'authenticated',
    'public.notification_preferences',
    'select, insert, update, delete'
  )
  and not has_table_privilege(
    'authenticated',
    'public.guest_wall_messages',
    'select, insert, update, delete'
  ) as check_passed
union all
select
  'anon cannot access notification tables directly' as check_name,
  not has_table_privilege(
    'anon',
    'public.notification_events',
    'select, insert, update, delete'
  )
  and not has_table_privilege(
    'anon',
    'public.notification_deliveries',
    'select, insert, update, delete'
  )
  and not has_table_privilege(
    'anon',
    'public.notification_preferences',
    'select, insert, update, delete'
  )
  and not has_table_privilege(
    'anon',
    'public.guest_wall_messages',
    'select, insert, update, delete'
  ) as check_passed
union all
select
  'settings singleton index exists' as check_name,
  to_regclass('public.settings_singleton_idx') is not null as check_passed
union all
select
  'settings has at most one row' as check_name,
  (select count(*) from public.settings) <= 1 as check_passed
union all
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
  ) as check_passed
union all
select
  'authenticated cannot mutate settings directly' as check_name,
  not has_table_privilege('authenticated', 'public.settings', 'insert')
  and not has_table_privilege('authenticated', 'public.settings', 'update')
  and not has_table_privilege('authenticated', 'public.settings', 'delete')
    as check_passed
union all
select
  'public settings RPC has restricted execution' as check_name,
  not has_function_privilege(
    'anon',
    'public.get_public_settings()',
    'execute'
  )
  and has_function_privilege(
    'authenticated',
    'public.get_public_settings()',
    'execute'
  ) as check_passed
union all
select
  'authenticated cannot read settings directly' as check_name,
  not has_table_privilege('authenticated', 'public.settings', 'select')
    as check_passed
union all
select
  'public event settings RPC is available without table access' as check_name,
  has_function_privilege(
    'anon',
    'public.get_public_event_settings()',
    'execute'
  )
  and has_function_privilege(
    'authenticated',
    'public.get_public_event_settings()',
    'execute'
  ) as check_passed
union all
select
  'broad authenticated settings policy is absent' as check_name,
  not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'settings'
      and policyname = 'settings_select_authenticated'
  ) as check_passed
union all
select
  format(
    '%s policy exists on %s',
    expected.policy_name,
    expected.table_name
  ) as check_name,
  exists (
    select 1
    from pg_policies as policy
    where policy.schemaname = 'public'
      and policy.tablename = expected.table_name
      and policy.policyname = expected.policy_name
  ) as check_passed
from (
  values
    ('guests', 'guests_admin_all'),
    ('guests', 'guests_select_own'),
    ('rsvps', 'rsvps_admin_all'),
    ('rsvps', 'rsvps_select_own'),
    ('gifts', 'gifts_admin_all'),
    ('gifts', 'gifts_select_accessible'),
    ('gift_contributions', 'gift_contributions_admin_all'),
    ('gift_contributions', 'gift_contributions_select_own'),
    ('settings', 'settings_admin_all')
) as expected(table_name, policy_name)
union all
select
  format(
    '%s trigger exists on %s',
    expected.trigger_name,
    expected.table_name
  ) as check_name,
  exists (
    select 1
    from pg_trigger as trigger
    inner join pg_class as relation
      on relation.oid = trigger.tgrelid
    inner join pg_namespace as namespace
      on namespace.oid = relation.relnamespace
    where trigger.tgname = expected.trigger_name
      and not trigger.tgisinternal
      and namespace.nspname = 'public'
      and relation.relname = expected.table_name
  ) as check_passed
from (
  values
    ('rsvps', 'sync_guest_confirmation_after_rsvp'),
    ('gift_contributions', 'sync_quota_gift_after_contribution'),
    ('gifts', 'sync_quota_gift_after_definition_change')
) as expected(table_name, trigger_name)
union all
select
  'anon has no direct access to application tables' as check_name,
  not exists (
    select 1
    from (
      values
        ('guests'),
        ('rsvps'),
        ('gifts'),
        ('gift_contributions'),
        ('settings'),
        ('notification_events'),
        ('notification_deliveries'),
        ('guest_wall_messages')
    ) as application_tables(table_name)
    where has_table_privilege(
      'anon',
      format('public.%I', table_name),
      'select, insert, update, delete'
    )
  ) as check_passed
union all
select
  'service_role can operate Edge Function dependencies' as check_name,
  has_table_privilege(
    'service_role',
    'public.admin_users',
    'select'
  )
  and has_table_privilege(
    'service_role',
    'public.guest_access_sessions',
    'select'
  )
  and has_table_privilege(
    'service_role',
    'public.guest_access_sessions',
    'insert'
  )
  and has_table_privilege(
    'service_role',
    'public.guest_access_sessions',
    'update'
  )
  and has_table_privilege(
    'service_role',
    'public.guest_access_sessions',
    'delete'
  )
  and has_table_privilege(
    'service_role',
    'public.invite_login_attempts',
    'select'
  )
  and has_table_privilege(
    'service_role',
    'public.invite_login_attempts',
    'insert'
  )
  and has_table_privilege(
    'service_role',
    'public.invite_login_attempts',
    'update'
  )
  and has_table_privilege(
    'service_role',
    'public.invite_login_attempts',
    'delete'
  )
  and has_table_privilege(
    'service_role',
    'public.guests',
    'select'
  )
  and has_table_privilege(
    'service_role',
    'public.guests',
    'update'
  )
  and has_sequence_privilege(
    'service_role',
    'public.invite_login_attempts_id_seq',
    'usage'
  )
  and has_sequence_privilege(
    'service_role',
    'public.invite_login_attempts_id_seq',
    'select'
  )
  and has_function_privilege(
    'service_role',
    'public.register_guest_access(uuid)',
    'execute'
  )
  and has_table_privilege(
    'service_role',
    'public.notification_events',
    'select, insert, update, delete'
  )
  and has_table_privilege(
    'service_role',
    'public.notification_deliveries',
    'select, insert, update, delete'
  )
  and has_table_privilege(
    'service_role',
    'public.notification_preferences',
    'select'
  ) as check_passed
union all
select
  'notification preferences contain current event types' as check_name,
  (
    select count(*)
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
      'gift_contribution_released',
      'gift_reservation_reminder',
      'gift_contribution_reminder',
      'wall_message_submitted',
      'wall_message_approved',
      'wall_message_replied'
    )
  ) = 14 as check_passed
union all
select
  'notification preferences allow wall message event group' as check_name,
  exists (
    select 1
    from pg_constraint
    where conname = 'notification_preferences_event_group_check'
      and pg_get_constraintdef(oid) like '%wall_message%'
  ) as check_passed
union all
select
  'manual notification resends are enabled for transactional events' as check_name,
  (
    select count(*)
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
    and manual_enabled is true
  ) = 9 as check_passed
union all
select
  'admin_users contains an active administrator' as check_name,
  exists (
    select 1
    from public.admin_users
    where active is true
  ) as check_passed
union all
select
  'settings contains complete payment information' as check_name,
  exists (
    select 1
    from public.settings
    where nullif(btrim(pix_key), '') is not null
      and nullif(btrim(merchant_name), '') is not null
      and nullif(btrim(merchant_city), '') is not null
      and nullif(btrim(whatsapp_number), '') is not null
      and buffet_paying_age between 1 and 18
  ) as check_passed
union all
select
  'settings contains complete wedding information' as check_name,
  exists (
    select 1
    from public.settings
    where nullif(btrim(bride_name), '') is not null
      and nullif(btrim(groom_name), '') is not null
      and wedding_date is not null
      and rsvp_deadline <= wedding_date::date
      and nullif(btrim(ceremony_name), '') is not null
      and nullif(btrim(ceremony_address), '') is not null
      and ceremony_time is not null
      and nullif(btrim(reception_name), '') is not null
      and nullif(btrim(reception_address), '') is not null
      and reception_time is not null
  ) as check_passed
) as rebuild_checks
order by check_passed asc, check_name asc;
