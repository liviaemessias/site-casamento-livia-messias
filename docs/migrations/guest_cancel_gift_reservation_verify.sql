select
  'cancel_my_gift_reservation function exists' as check_name,
  to_regprocedure('public.cancel_my_gift_reservation(uuid)') is not null as check_passed;

select
  'cancel_my_gift_contribution function exists' as check_name,
  to_regprocedure('public.cancel_my_gift_contribution(uuid)') is not null as check_passed;

select
  'guest cancellation permissions are restricted' as check_name,
  not has_function_privilege('anon', 'public.cancel_my_gift_reservation(uuid)', 'execute')
  and has_function_privilege('authenticated', 'public.cancel_my_gift_reservation(uuid)', 'execute')
  and not has_function_privilege('anon', 'public.cancel_my_gift_contribution(uuid)', 'execute')
  and has_function_privilege('authenticated', 'public.cancel_my_gift_contribution(uuid)', 'execute') as check_passed;

select
  'guest cancellation functions use security definer' as check_name,
  count(*) = 2 as check_passed
from pg_proc
where oid in (
  'public.cancel_my_gift_reservation(uuid)'::regprocedure,
  'public.cancel_my_gift_contribution(uuid)'::regprocedure
)
and prosecdef is true;
