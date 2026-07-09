-- Every row returned by this script should have check_passed = true.

select
  'secure invitation code RPC exists' as check_name,
  to_regprocedure(
    'public.create_guest_with_invite_code(text,text,jsonb,integer,boolean)'
  ) is not null as check_passed;

select
  'anon cannot execute secure invitation code RPC' as check_name,
  not has_function_privilege(
    'anon',
    'public.create_guest_with_invite_code(text,text,jsonb,integer,boolean)',
    'execute'
  ) as check_passed;

select
  'authenticated can execute secure invitation code RPC' as check_name,
  has_function_privilege(
    'authenticated',
    'public.create_guest_with_invite_code(text,text,jsonb,integer,boolean)',
    'execute'
  ) as check_passed;

select
  'authenticated cannot insert guests directly' as check_name,
  not has_table_privilege(
    'authenticated',
    'public.guests',
    'insert'
  ) as check_passed;
