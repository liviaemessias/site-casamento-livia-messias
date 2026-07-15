-- Every row returned by this script should have check_passed = true.

select
  'administrative notification RPC exists' as check_name,
  to_regprocedure(
    'public.admin_list_notification_deliveries(text,text,text,timestamp with time zone,timestamp with time zone,integer,integer,text,text)'
  ) is not null as check_passed;

select
  'administrative notification RPC has restricted execution' as check_name,
  not has_function_privilege(
    'anon',
    'public.admin_list_notification_deliveries(text,text,text,timestamp with time zone,timestamp with time zone,integer,integer,text,text)',
    'execute'
  )
  and has_function_privilege(
    'authenticated',
    'public.admin_list_notification_deliveries(text,text,text,timestamp with time zone,timestamp with time zone,integer,integer,text,text)',
    'execute'
  ) as check_passed;

select
  'notification audit origin column exists' as check_name,
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'notification_events'
      and column_name = 'origin'
  ) as check_passed;

select
  'notification tables remain private from authenticated direct access' as check_name,
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
