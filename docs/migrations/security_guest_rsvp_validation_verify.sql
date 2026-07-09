-- Every row returned by this script should have check_passed = true.

select
  'guest RSVP RPC exists' as check_name,
  to_regprocedure(
    'public.save_current_rsvp(text,text,text,text,text,jsonb)'
  ) is not null as check_passed;

select
  'guest RSVP RPC has restricted execution' as check_name,
  not has_function_privilege(
    'anon',
    'public.save_current_rsvp(text,text,text,text,text,jsonb)',
    'execute'
  )
  and has_function_privilege(
    'authenticated',
    'public.save_current_rsvp(text,text,text,text,text,jsonb)',
    'execute'
  ) as check_passed;

select
  'authenticated cannot mutate RSVPs directly' as check_name,
  not has_table_privilege('authenticated', 'public.rsvps', 'insert')
  and not has_table_privilege('authenticated', 'public.rsvps', 'update')
  and not has_table_privilege('authenticated', 'public.rsvps', 'delete')
    as check_passed;

select
  'notification outbox exists for RSVP events' as check_name,
  to_regclass('public.notification_events') is not null
  and to_regclass('public.notification_deliveries') is not null
    as check_passed;

select
  'authenticated cannot access notification outbox directly' as check_name,
  not has_table_privilege(
    'authenticated',
    'public.notification_events',
    'select, insert, update, delete'
  )
  and not has_table_privilege(
    'authenticated',
    'public.notification_deliveries',
    'select, insert, update, delete'
  ) as check_passed;
