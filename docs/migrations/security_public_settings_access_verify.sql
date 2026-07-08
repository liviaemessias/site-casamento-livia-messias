-- Every row returned by this script should have check_passed = true.

select
  'public settings RPC exists' as check_name,
  to_regprocedure('public.get_public_settings()') is not null as check_passed;

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
  ) as check_passed;

select
  'authenticated cannot read settings directly' as check_name,
  not has_table_privilege(
    'authenticated',
    'public.settings',
    'select'
  ) as check_passed;

select
  'broad authenticated settings policy is absent' as check_name,
  not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'settings'
      and policyname = 'settings_select_authenticated'
  ) as check_passed;

select
  'public settings RPC exposes only approved columns' as check_name,
  (
    select array_agg(parameter_name::text order by ordinal_position)
    from information_schema.parameters
    where specific_schema = 'public'
      and specific_name::text like 'get_public_settings_%'
      and parameter_mode = 'OUT'
  ) = array[
    'pix_key',
    'merchant_name',
    'merchant_city',
    'whatsapp_number',
    'buffet_paying_age',
    'bride_name',
    'groom_name',
    'wedding_date',
    'rsvp_deadline',
    'ceremony_name',
    'ceremony_address',
    'ceremony_time',
    'reception_name',
    'reception_address',
    'reception_time'
  ] as check_passed;

select
  'public event settings RPC has public execution' as check_name,
  has_function_privilege(
    'anon',
    'public.get_public_event_settings()',
    'execute'
  )
  and has_function_privilege(
    'authenticated',
    'public.get_public_event_settings()',
    'execute'
  ) as check_passed;

select
  'public event settings RPC exposes only event columns' as check_name,
  (
    select array_agg(parameter_name::text order by ordinal_position)
    from information_schema.parameters
    where specific_schema = 'public'
      and specific_name::text like 'get_public_event_settings_%'
      and parameter_mode = 'OUT'
  ) = array[
    'bride_name',
    'groom_name',
    'wedding_date',
    'rsvp_deadline',
    'ceremony_name',
    'ceremony_address',
    'ceremony_time',
    'reception_name',
    'reception_address',
    'reception_time'
  ] as check_passed;
