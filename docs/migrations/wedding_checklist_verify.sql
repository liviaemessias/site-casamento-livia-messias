-- Every row returned by this script should have check_passed = true.

select
  'wedding checklist tables exist' as check_name,
  to_regclass('public.wedding_checklist_categories') is not null
  and to_regclass('public.wedding_checklist_responsibles') is not null
  and to_regclass('public.wedding_checklist_items') is not null as check_passed;

select
  'wedding checklist tables have RLS enabled' as check_name,
  (
    select relrowsecurity
    from pg_class
    where oid = 'public.wedding_checklist_categories'::regclass
  )
  and (
    select relrowsecurity
    from pg_class
    where oid = 'public.wedding_checklist_responsibles'::regclass
  )
  and (
    select relrowsecurity
    from pg_class
    where oid = 'public.wedding_checklist_items'::regclass
  ) as check_passed;

select
  'wedding checklist seed categories exist' as check_name,
  count(*) >= 18 as check_passed
from public.wedding_checklist_categories;

select
  'wedding checklist seed responsibles exist' as check_name,
  count(*) >= 16 as check_passed
from public.wedding_checklist_responsibles;

select
  'wedding checklist seed items exist' as check_name,
  count(*) >= 30 as check_passed
from public.wedding_checklist_items;

select
  format('%s exists', expected.function_name) as check_name,
  to_regprocedure(expected.function_name) is not null as check_passed
from (
  values
    ('public.admin_list_checklist_categories()'),
    ('public.admin_list_checklist_responsibles()'),
    ('public.admin_list_checklist_items()'),
    ('public.admin_save_checklist_category(uuid,text,text,text,integer,boolean)'),
    ('public.admin_save_checklist_responsible(uuid,text,text,integer,boolean)'),
    ('public.admin_save_checklist_item(uuid,uuid,text,text,text,text,text,uuid,date,text,integer)'),
    ('public.admin_set_checklist_item_status(uuid,text)'),
    ('public.admin_reorder_checklist_items(text,uuid[])'),
    ('public.admin_delete_checklist_category(uuid)'),
    ('public.admin_delete_checklist_responsible(uuid)'),
    ('public.admin_delete_checklist_item(uuid)')
) as expected(function_name);

select
  'wedding checklist RPCs have restricted execution' as check_name,
  not has_function_privilege('anon', 'public.admin_list_checklist_categories()', 'execute')
  and has_function_privilege('authenticated', 'public.admin_list_checklist_categories()', 'execute')
  and not has_function_privilege('anon', 'public.admin_list_checklist_responsibles()', 'execute')
  and has_function_privilege('authenticated', 'public.admin_list_checklist_responsibles()', 'execute')
  and not has_function_privilege('anon', 'public.admin_list_checklist_items()', 'execute')
  and has_function_privilege('authenticated', 'public.admin_list_checklist_items()', 'execute')
  and not has_function_privilege(
    'anon',
    'public.admin_save_checklist_item(uuid,uuid,text,text,text,text,text,uuid,date,text,integer)',
    'execute'
  )
  and has_function_privilege(
    'authenticated',
    'public.admin_save_checklist_item(uuid,uuid,text,text,text,text,text,uuid,date,text,integer)',
    'execute'
  )
  and not has_function_privilege(
    'anon',
    'public.admin_reorder_checklist_items(text,uuid[])',
    'execute'
  )
  and has_function_privilege(
    'authenticated',
    'public.admin_reorder_checklist_items(text,uuid[])',
    'execute'
  ) as check_passed;

select
  'authenticated cannot access checklist tables directly' as check_name,
  not has_table_privilege('authenticated', 'public.wedding_checklist_categories', 'select, insert, update, delete')
  and not has_table_privilege('authenticated', 'public.wedding_checklist_responsibles', 'select, insert, update, delete')
  and not has_table_privilege('authenticated', 'public.wedding_checklist_items', 'select, insert, update, delete')
    as check_passed;
