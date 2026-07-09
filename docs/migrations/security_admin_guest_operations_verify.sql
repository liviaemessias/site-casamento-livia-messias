-- Every row returned by this script should have check_passed = true.

select
  format('%s exists', expected.function_name) as check_name,
  to_regprocedure(expected.function_name) is not null as check_passed
from (
  values
    ('public.admin_update_guest(uuid,text,text,jsonb,integer,boolean)'),
    ('public.admin_set_guest_active(uuid,boolean)'),
    ('public.admin_set_guest_invite_sent(uuid,boolean)')
) as expected(function_name);

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
  ) as check_passed;

select
  'authenticated cannot mutate guests directly' as check_name,
  not has_table_privilege('authenticated', 'public.guests', 'insert')
  and not has_table_privilege('authenticated', 'public.guests', 'update')
  and not has_table_privilege('authenticated', 'public.guests', 'delete')
    as check_passed;
