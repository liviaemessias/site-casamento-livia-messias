-- ============================================================
-- Verification: active RLS enforcement
-- ============================================================
--
-- Every row should have check_passed = true.

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
    'settings'
  )
order by c.relname;

select
  format('anon has no access to %s', table_name) as check_name,
  not (
    has_table_privilege('anon', format('public.%I', table_name), 'select')
    or has_table_privilege('anon', format('public.%I', table_name), 'insert')
    or has_table_privilege('anon', format('public.%I', table_name), 'update')
    or has_table_privilege('anon', format('public.%I', table_name), 'delete')
  ) as check_passed
from (
  values
    ('guests'),
    ('rsvps'),
    ('gifts'),
    ('gift_contributions'),
    ('settings')
) as application_tables(table_name);

select
  format('authenticated can select %s through RLS', table_name) as check_name,
  has_table_privilege(
    'authenticated',
    format('public.%I', table_name),
    'select'
  )
  and not has_table_privilege(
    'authenticated',
    format('public.%I', table_name),
    'insert'
  )
  and not has_table_privilege(
    'authenticated',
    format('public.%I', table_name),
    'update'
  )
  and not has_table_privilege(
    'authenticated',
    format('public.%I', table_name),
    'delete'
  ) as check_passed
from (
  values
    ('guests'),
    ('rsvps'),
    ('gifts'),
    ('gift_contributions')
) as application_tables(table_name);

select
  'authenticated cannot read settings directly' as check_name,
  not has_table_privilege(
    'authenticated',
    'public.settings',
    'select'
  ) as check_passed;
