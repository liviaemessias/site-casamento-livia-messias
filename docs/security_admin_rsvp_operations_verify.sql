-- Every row returned by this script should have check_passed = true.

select
  format('%s exists', expected.function_name) as check_name,
  to_regprocedure(expected.function_name) is not null as check_passed
from (
  values
    ('public.admin_save_guest_rsvp(uuid,text,text,text,text,text,jsonb)'),
    ('public.admin_delete_guest_rsvp(uuid)')
) as expected(function_name);

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
  ) as check_passed;

select
  'authenticated cannot mutate RSVPs directly' as check_name,
  not has_table_privilege('authenticated', 'public.rsvps', 'insert')
  and not has_table_privilege('authenticated', 'public.rsvps', 'update')
  and not has_table_privilege('authenticated', 'public.rsvps', 'delete')
    as check_passed;
