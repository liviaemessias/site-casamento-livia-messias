-- Every row returned by this script should have check_passed = true.

select
  format('%s exists', expected.function_name) as check_name,
  to_regprocedure(expected.function_name) is not null as check_passed
from (
  values
    ('public.set_gift_purchase_method(uuid,text,jsonb)'),
    ('public.report_gift_payment(uuid)')
) as expected(function_name);

select
  'guest payment RPCs have restricted execution' as check_name,
  not has_function_privilege(
    'anon',
    'public.set_gift_purchase_method(uuid,text,jsonb)',
    'execute'
  )
  and not has_function_privilege(
    'anon',
    'public.report_gift_payment(uuid)',
    'execute'
  )
  and has_function_privilege(
    'authenticated',
    'public.set_gift_purchase_method(uuid,text,jsonb)',
    'execute'
  )
  and has_function_privilege(
    'authenticated',
    'public.report_gift_payment(uuid)',
    'execute'
  ) as check_passed;

select
  'authenticated cannot mutate gifts directly' as check_name,
  not has_table_privilege('authenticated', 'public.gifts', 'insert')
  and not has_table_privilege('authenticated', 'public.gifts', 'update')
  and not has_table_privilege('authenticated', 'public.gifts', 'delete')
    as check_passed;
