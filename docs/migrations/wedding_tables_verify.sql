-- Every row returned by this query should have check_passed = true.

select * from (
select
  'wedding table objects exist' as check_name,
  to_regclass('public.wedding_tables') is not null
  and to_regclass('public.wedding_table_assignments') is not null
  and to_regprocedure('public.admin_list_wedding_tables()') is not null
  and to_regprocedure('public.admin_list_wedding_table_assignments()') is not null
  and to_regprocedure(
    'public.admin_save_wedding_table(uuid,text,integer,text,text,integer,boolean)'
  ) is not null
  and to_regprocedure('public.admin_assign_guest_to_table(uuid,uuid,text)') is not null
  and to_regprocedure('public.admin_remove_guest_from_table(uuid)') is not null
  and to_regprocedure('public.admin_set_wedding_table_active(uuid,boolean)') is not null
  and to_regprocedure('public.admin_reorder_wedding_tables(uuid[])') is not null
  and to_regprocedure('public.admin_delete_wedding_table(uuid)') is not null
    as check_passed
union all
select
  'wedding table RLS is enabled' as check_name,
  exists (
    select 1
    from pg_class as c
    join pg_namespace as n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'wedding_tables'
      and c.relrowsecurity
  )
  and exists (
    select 1
    from pg_class as c
    join pg_namespace as n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'wedding_table_assignments'
      and c.relrowsecurity
  ) as check_passed
union all
select
  'wedding table direct access is restricted' as check_name,
  not has_table_privilege('anon', 'public.wedding_tables', 'select')
  and not has_table_privilege('authenticated', 'public.wedding_tables', 'insert')
  and not has_table_privilege('anon', 'public.wedding_table_assignments', 'select')
  and not has_table_privilege('authenticated', 'public.wedding_table_assignments', 'insert')
    as check_passed
union all
select
  'wedding table admin RPCs are restricted' as check_name,
  not has_function_privilege('anon', 'public.admin_list_wedding_tables()', 'execute')
  and has_function_privilege('authenticated', 'public.admin_list_wedding_tables()', 'execute')
  and not has_function_privilege(
    'anon',
    'public.admin_save_wedding_table(uuid,text,integer,text,text,integer,boolean)',
    'execute'
  )
  and has_function_privilege(
    'authenticated',
    'public.admin_save_wedding_table(uuid,text,integer,text,text,integer,boolean)',
    'execute'
  )
  and not has_function_privilege(
    'anon',
    'public.admin_set_wedding_table_active(uuid,boolean)',
    'execute'
  )
  and has_function_privilege(
    'authenticated',
    'public.admin_set_wedding_table_active(uuid,boolean)',
    'execute'
  ) as check_passed
union all
select
  'one guest can be assigned to only one table' as check_name,
  exists (
    select 1
    from pg_constraint
    where conname = 'wedding_table_assignments_guest_unique'
  ) as check_passed
) as checks
order by check_name;
