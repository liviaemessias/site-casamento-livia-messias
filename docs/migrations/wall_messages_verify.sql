-- ============================================================
-- Verification: guest wall messages
-- ============================================================

select
  'guest_wall_messages table exists' as check_name,
  to_regclass('public.guest_wall_messages') is not null as check_passed;

select
  'guest_wall_messages has RLS enabled' as check_name,
  relrowsecurity is true as check_passed
from pg_class
where oid = 'public.guest_wall_messages'::regclass;

select
  'guest_wall_messages is hidden from anon/authenticated direct access' as check_name,
  not has_table_privilege('anon', 'public.guest_wall_messages', 'select')
  and not has_table_privilege('authenticated', 'public.guest_wall_messages', 'select')
  and not has_table_privilege('authenticated', 'public.guest_wall_messages', 'insert')
  and not has_table_privilege('authenticated', 'public.guest_wall_messages', 'update') as check_passed;

select
  'public approved wall RPC exists' as check_name,
  to_regprocedure('public.list_approved_wall_messages(integer,integer)') is not null as check_passed;

select
  'guest wall RPCs exist' as check_name,
  to_regprocedure('public.get_current_guest_wall_message()') is not null
  and to_regprocedure('public.save_current_guest_wall_message(text)') is not null as check_passed;

select
  'admin wall RPCs exist' as check_name,
  to_regprocedure('public.admin_list_wall_messages(text,text,integer,integer)') is not null
  and to_regprocedure('public.admin_approve_wall_message(uuid)') is not null
  and to_regprocedure('public.admin_hide_wall_message(uuid)') is not null
  and to_regprocedure('public.admin_reply_wall_message(uuid,text)') is not null
  and to_regprocedure('public.admin_clear_wall_message_reply(uuid)') is not null
  and to_regprocedure('public.admin_delete_wall_message(uuid)') is not null as check_passed;

select
  'public list RPC allows anon/authenticated only' as check_name,
  has_function_privilege('anon', 'public.list_approved_wall_messages(integer,integer)', 'execute')
  and has_function_privilege('authenticated', 'public.list_approved_wall_messages(integer,integer)', 'execute') as check_passed;

select
  'guest write RPCs are authenticated only' as check_name,
  not has_function_privilege('anon', 'public.get_current_guest_wall_message()', 'execute')
  and has_function_privilege('authenticated', 'public.get_current_guest_wall_message()', 'execute')
  and not has_function_privilege('anon', 'public.save_current_guest_wall_message(text)', 'execute')
  and has_function_privilege('authenticated', 'public.save_current_guest_wall_message(text)', 'execute') as check_passed;

select
  'admin wall RPCs are authenticated only' as check_name,
  not has_function_privilege('anon', 'public.admin_list_wall_messages(text,text,integer,integer)', 'execute')
  and has_function_privilege('authenticated', 'public.admin_list_wall_messages(text,text,integer,integer)', 'execute')
  and not has_function_privilege('anon', 'public.admin_approve_wall_message(uuid)', 'execute')
  and has_function_privilege('authenticated', 'public.admin_approve_wall_message(uuid)', 'execute')
  and not has_function_privilege('anon', 'public.admin_hide_wall_message(uuid)', 'execute')
  and has_function_privilege('authenticated', 'public.admin_hide_wall_message(uuid)', 'execute')
  and not has_function_privilege('anon', 'public.admin_reply_wall_message(uuid,text)', 'execute')
  and has_function_privilege('authenticated', 'public.admin_reply_wall_message(uuid,text)', 'execute')
  and not has_function_privilege('anon', 'public.admin_clear_wall_message_reply(uuid)', 'execute')
  and has_function_privilege('authenticated', 'public.admin_clear_wall_message_reply(uuid)', 'execute')
  and not has_function_privilege('anon', 'public.admin_delete_wall_message(uuid)', 'execute')
  and has_function_privilege('authenticated', 'public.admin_delete_wall_message(uuid)', 'execute') as check_passed;
