-- Every row returned by this script should have check_passed = true.

select
  format('%s exists', expected.function_name) as check_name,
  to_regprocedure(expected.function_name) is not null as check_passed
from (
  values
    ('public.admin_save_gift(uuid,text,text,text,numeric,text,text,integer,text,text,jsonb)'),
    ('public.admin_delete_gift(uuid)')
) as expected(function_name);

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
  ) as check_passed;

select
  'authenticated cannot mutate gifts directly' as check_name,
  not has_table_privilege('authenticated', 'public.gifts', 'insert')
  and not has_table_privilege('authenticated', 'public.gifts', 'update')
  and not has_table_privilege('authenticated', 'public.gifts', 'delete')
    as check_passed;
