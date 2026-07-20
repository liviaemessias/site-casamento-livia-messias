-- Verification: wedding schedule

select
  'wedding schedule tables exist' as check_name,
  to_regclass('public.wedding_schedule_sections') is not null
  and to_regclass('public.wedding_schedule_activities') is not null as check_passed;

select
  'wedding schedule tables have RLS enabled' as check_name,
  bool_and(relrowsecurity) as check_passed
from pg_class
where oid in (
  'public.wedding_schedule_sections'::regclass,
  'public.wedding_schedule_activities'::regclass
);

select
  'wedding schedule tables are hidden from direct anon/authenticated access' as check_name,
  not has_table_privilege('anon', 'public.wedding_schedule_sections', 'select')
  and not has_table_privilege('authenticated', 'public.wedding_schedule_sections', 'select')
  and not has_table_privilege('authenticated', 'public.wedding_schedule_sections', 'insert')
  and not has_table_privilege('authenticated', 'public.wedding_schedule_sections', 'update')
  and not has_table_privilege('authenticated', 'public.wedding_schedule_sections', 'delete')
  and not has_table_privilege('anon', 'public.wedding_schedule_activities', 'select')
  and not has_table_privilege('authenticated', 'public.wedding_schedule_activities', 'select')
  and not has_table_privilege('authenticated', 'public.wedding_schedule_activities', 'insert')
  and not has_table_privilege('authenticated', 'public.wedding_schedule_activities', 'update')
  and not has_table_privilege('authenticated', 'public.wedding_schedule_activities', 'delete')
  as check_passed;

select
  'wedding schedule RPCs exist' as check_name,
  to_regprocedure('public.list_public_schedule()') is not null
  and to_regprocedure('public.admin_list_schedule_sections()') is not null
  and to_regprocedure('public.admin_list_schedule_activities()') is not null
  and to_regprocedure(
    'public.admin_save_schedule_section(uuid,text,text,text,text,integer,boolean)'
  ) is not null
  and to_regprocedure(
    'public.admin_save_schedule_activity(uuid,uuid,text,text,text,time without time zone,time without time zone,text,integer,boolean)'
  ) is not null
  and to_regprocedure('public.admin_set_schedule_section_visible(uuid,boolean)') is not null
  and to_regprocedure('public.admin_set_schedule_activity_visible(uuid,boolean)') is not null
  and to_regprocedure('public.admin_reorder_schedule_sections(uuid[])') is not null
  and to_regprocedure('public.admin_reorder_schedule_activities(uuid,uuid[])') is not null
  and to_regprocedure('public.admin_delete_schedule_section(uuid)') is not null
  and to_regprocedure('public.admin_delete_schedule_activity(uuid)') is not null
  as check_passed;

select
  'wedding schedule RPC privileges are restricted' as check_name,
  not has_function_privilege('anon', 'public.list_public_schedule()', 'execute')
  and has_function_privilege('authenticated', 'public.list_public_schedule()', 'execute')
  and not has_function_privilege('anon', 'public.admin_list_schedule_sections()', 'execute')
  and has_function_privilege('authenticated', 'public.admin_list_schedule_sections()', 'execute')
  and not has_function_privilege('anon', 'public.admin_list_schedule_activities()', 'execute')
  and has_function_privilege('authenticated', 'public.admin_list_schedule_activities()', 'execute')
  and not has_function_privilege(
    'anon',
    'public.admin_save_schedule_section(uuid,text,text,text,text,integer,boolean)',
    'execute'
  )
  and has_function_privilege(
    'authenticated',
    'public.admin_save_schedule_section(uuid,text,text,text,text,integer,boolean)',
    'execute'
  )
  and not has_function_privilege(
    'anon',
    'public.admin_save_schedule_activity(uuid,uuid,text,text,text,time without time zone,time without time zone,text,integer,boolean)',
    'execute'
  )
  and has_function_privilege(
    'authenticated',
    'public.admin_save_schedule_activity(uuid,uuid,text,text,text,time without time zone,time without time zone,text,integer,boolean)',
    'execute'
  )
  and not has_function_privilege('anon', 'public.admin_set_schedule_section_visible(uuid,boolean)', 'execute')
  and has_function_privilege('authenticated', 'public.admin_set_schedule_section_visible(uuid,boolean)', 'execute')
  and not has_function_privilege('anon', 'public.admin_set_schedule_activity_visible(uuid,boolean)', 'execute')
  and has_function_privilege('authenticated', 'public.admin_set_schedule_activity_visible(uuid,boolean)', 'execute')
  and not has_function_privilege('anon', 'public.admin_reorder_schedule_sections(uuid[])', 'execute')
  and has_function_privilege('authenticated', 'public.admin_reorder_schedule_sections(uuid[])', 'execute')
  and not has_function_privilege('anon', 'public.admin_reorder_schedule_activities(uuid,uuid[])', 'execute')
  and has_function_privilege('authenticated', 'public.admin_reorder_schedule_activities(uuid,uuid[])', 'execute')
  and not has_function_privilege('anon', 'public.admin_delete_schedule_section(uuid)', 'execute')
  and has_function_privilege('authenticated', 'public.admin_delete_schedule_section(uuid)', 'execute')
  and not has_function_privilege('anon', 'public.admin_delete_schedule_activity(uuid)', 'execute')
  and has_function_privilege('authenticated', 'public.admin_delete_schedule_activity(uuid)', 'execute')
  as check_passed;
