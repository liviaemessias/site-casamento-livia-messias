-- Every row returned by this script should have check_passed = true.

select
  format('%s exists', expected.function_name) as check_name,
  to_regprocedure(expected.function_name) is not null as check_passed
from (
  values
    ('public.admin_confirm_gift_purchase(uuid)'),
    ('public.admin_release_gift_reservation(uuid)'),
    ('public.admin_confirm_gift_contribution(uuid)'),
    ('public.admin_release_gift_contribution(uuid)')
) as expected(function_name);

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
  ) as check_passed;

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
  ) as check_passed;
