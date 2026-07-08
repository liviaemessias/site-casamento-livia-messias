-- ============================================================
-- Supabase rebuild: final verification
-- ============================================================
--
-- Every row returned by this query should have check_passed = true.

select * from (
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
    ('public.create_guest_with_invite_code(text,text,jsonb,integer)'),
    ('public.admin_confirm_gift_purchase(uuid)'),
    ('public.admin_release_gift_reservation(uuid)'),
    ('public.admin_confirm_gift_contribution(uuid)'),
    ('public.admin_release_gift_contribution(uuid)'),
    ('public.admin_save_guest_rsvp(uuid,text,text,text,text,text,jsonb)'),
    ('public.admin_delete_guest_rsvp(uuid)'),
    ('public.admin_update_guest(uuid,text,text,jsonb,integer)'),
    ('public.admin_set_guest_active(uuid,boolean)'),
    ('public.admin_save_gift(uuid,text,text,text,numeric,text,text,integer,text,text,jsonb)'),
    ('public.admin_delete_gift(uuid)'),
    ('public.admin_save_settings(text,text,text,text,integer,jsonb)'),
    ('public.get_public_settings()'),
    ('public.get_public_event_settings()'),
    ('public.register_guest_access(uuid)'),
    ('public.get_current_guest_profile()'),
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
  'secure invitation code RPC has restricted execution' as check_name,
  not has_function_privilege(
    'anon',
    'public.create_guest_with_invite_code(text,text,jsonb,integer)',
    'execute'
  )
  and has_function_privilege(
    'authenticated',
    'public.create_guest_with_invite_code(text,text,jsonb,integer)',
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
    'public.admin_update_guest(uuid,text,text,jsonb,integer)',
    'execute'
  )
  and not has_function_privilege(
    'anon',
    'public.admin_set_guest_active(uuid,boolean)',
    'execute'
  )
  and has_function_privilege(
    'authenticated',
    'public.admin_update_guest(uuid,text,text,jsonb,integer)',
    'execute'
  )
  and has_function_privilege(
    'authenticated',
    'public.admin_set_guest_active(uuid,boolean)',
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
        ('settings')
    ) as application_tables(table_name)
    where has_table_privilege(
      'anon',
      format('public.%I', table_name),
      'select, insert, update, delete'
    )
  ) as check_passed
union all
select
  'service_role can operate claim-invite dependencies' as check_name,
  has_table_privilege(
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
  ) as check_passed
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
