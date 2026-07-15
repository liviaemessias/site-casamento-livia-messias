-- Every row returned by this script should have check_passed = true.

select
  format('%s exists', expected.function_name) as check_name,
  to_regprocedure(expected.function_name) is not null as check_passed
from (
  values
    ('public.enqueue_gift_notification_event(text,text,uuid,timestamp with time zone,uuid,jsonb)'),
    ('public.reserve_gift(uuid,text)'),
    ('public.report_gift_payment(uuid)'),
    ('public.reserve_gift_quotas(uuid,text,integer)'),
    ('public.report_gift_contribution_payment(uuid)'),
    ('public.admin_confirm_gift_purchase(uuid)'),
    ('public.admin_release_gift_reservation(uuid)'),
    ('public.admin_confirm_gift_contribution(uuid)'),
    ('public.admin_release_gift_contribution(uuid)')
) as expected(function_name);

select
  'gift notification helper is internal only' as check_name,
  not has_function_privilege(
    'anon',
    'public.enqueue_gift_notification_event(text,text,uuid,timestamp with time zone,uuid,jsonb)',
    'execute'
  )
  and not has_function_privilege(
    'authenticated',
    'public.enqueue_gift_notification_event(text,text,uuid,timestamp with time zone,uuid,jsonb)',
    'execute'
  ) as check_passed;

select
  'guest gift notification RPCs keep authenticated access' as check_name,
  not exists (
    select 1
    from (
      values
        ('public.reserve_gift(uuid,text)'),
        ('public.report_gift_payment(uuid)'),
        ('public.reserve_gift_quotas(uuid,text,integer)'),
        ('public.report_gift_contribution_payment(uuid)')
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
  'admin gift notification RPCs keep authenticated access' as check_name,
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
