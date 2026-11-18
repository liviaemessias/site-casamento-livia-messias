-- Run after rsvp_games.sql. Every result should return check_passed = true.

select
  'RSVP game tables exist' as check_name,
  to_regclass('public.rsvp_games') is not null
  and to_regclass('public.rsvp_game_message_templates') is not null as check_passed;

select
  'RSVP game tables have RLS enabled' as check_name,
  coalesce((
    select relrowsecurity from pg_class
    where oid = to_regclass('public.rsvp_games')
  ), false)
  and coalesce((
    select relrowsecurity from pg_class
    where oid = to_regclass('public.rsvp_game_message_templates')
  ), false) as check_passed;

select
  'RSVP game tables deny direct client access' as check_name,
  not has_table_privilege('anon', 'public.rsvp_games', 'select')
  and not has_table_privilege('authenticated', 'public.rsvp_games', 'select')
  and not has_table_privilege('anon', 'public.rsvp_game_message_templates', 'select')
  and not has_table_privilege('authenticated', 'public.rsvp_game_message_templates', 'select') as check_passed;

select
  'five RSVP game message types are seeded' as check_name,
  count(*) = 5 as check_passed
from public.rsvp_game_message_templates;

select
  format('%s exists', expected.signature) as check_name,
  to_regprocedure(expected.signature) is not null as check_passed
from (
  values
    ('public.admin_list_rsvp_games()'),
    ('public.admin_list_rsvp_game_guests()'),
    ('public.admin_list_rsvp_game_message_templates()'),
    ('public.admin_save_rsvp_game(uuid,text,text[],text,boolean)'),
    ('public.admin_create_rsvp_games_bulk(uuid[])'),
    ('public.admin_save_rsvp_game_message_template(text,text,text)'),
    ('public.get_current_rsvp_game()'),
    ('public.complete_current_rsvp_game(uuid)'),
    ('public.admin_set_rsvp_game_active(uuid,boolean)'),
    ('public.admin_delete_rsvp_game(uuid)')
) as expected(signature);

select
  'RSVP game RPCs are executable by authenticated clients only' as check_name,
  has_function_privilege('authenticated', 'public.get_current_rsvp_game()', 'execute')
  and has_function_privilege('authenticated', 'public.complete_current_rsvp_game(uuid)', 'execute')
  and has_function_privilege('authenticated', 'public.admin_set_rsvp_game_active(uuid,boolean)', 'execute')
  and has_function_privilege('authenticated', 'public.admin_delete_rsvp_game(uuid)', 'execute')
  and not has_function_privilege('anon', 'public.get_current_rsvp_game()', 'execute')
  and not has_function_privilege('anon', 'public.complete_current_rsvp_game(uuid)', 'execute')
  and not has_function_privilege('anon', 'public.admin_set_rsvp_game_active(uuid,boolean)', 'execute')
  and not has_function_privilege('anon', 'public.admin_delete_rsvp_game(uuid)', 'execute')
  and not has_function_privilege('anon', 'public.admin_save_rsvp_game(uuid,text,text[],text,boolean)', 'execute') as check_passed;

select
  'RSVP games do not add columns to RSVP presence data' as check_name,
  not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'rsvps'
      and column_name in ('game_id', 'game_status', 'game_play_count')
  ) as check_passed;
