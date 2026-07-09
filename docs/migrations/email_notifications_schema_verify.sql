-- Every row returned by this script should have check_passed = true.

select
  format('%s exists', expected.object_name) as check_name,
  to_regclass(expected.object_name) is not null as check_passed
from (
  values
    ('public.notification_events'),
    ('public.notification_deliveries')
) as expected(object_name);

select
  format('%s has RLS enabled', c.relname) as check_name,
  c.relrowsecurity as check_passed
from pg_class as c
inner join pg_namespace as n
  on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('notification_events', 'notification_deliveries');

select
  'notification dedupe constraints exist' as check_name,
  to_regclass('public.notification_events_dedupe_key_key') is not null
  and to_regclass('public.notification_deliveries_dedupe_key_key') is not null
    as check_passed;

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
  ) as check_passed;

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
  ) as check_passed;

select
  'service_role can manage notification tables' as check_name,
  has_table_privilege(
    'service_role',
    'public.notification_events',
    'select, insert, update, delete'
  )
  and has_table_privilege(
    'service_role',
    'public.notification_deliveries',
    'select, insert, update, delete'
  ) as check_passed;
