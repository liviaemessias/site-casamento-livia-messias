-- ============================================================
-- Verification: current guest wall message status
-- ============================================================

select
  'current guest wall message status RPC exists' as check_name,
  to_regprocedure('public.current_guest_has_wall_message()') is not null as check_passed;

select
  'current guest wall message status RPC is authenticated only' as check_name,
  not has_function_privilege('anon', 'public.current_guest_has_wall_message()', 'execute')
  and has_function_privilege('authenticated', 'public.current_guest_has_wall_message()', 'execute') as check_passed;

select
  'current guest wall message status RPC does not expose message text' as check_name,
  not exists (
    select 1
    from pg_proc
    where oid = 'public.current_guest_has_wall_message()'::regprocedure
      and proargnames @> array['message']
  ) as check_passed;
