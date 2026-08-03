-- Verification: wedding vendors

select
  'wedding_vendors table exists' as check_name,
  to_regclass('public.wedding_vendors') is not null as check_passed;

select
  'wedding_vendors has RLS enabled' as check_name,
  relrowsecurity as check_passed
from pg_class
where oid = 'public.wedding_vendors'::regclass;

select
  'wedding_vendors is hidden from anon/authenticated direct access' as check_name,
  not has_table_privilege('anon', 'public.wedding_vendors', 'select')
  and not has_table_privilege('authenticated', 'public.wedding_vendors', 'select')
  and not has_table_privilege('authenticated', 'public.wedding_vendors', 'insert')
  and not has_table_privilege('authenticated', 'public.wedding_vendors', 'update')
  and not has_table_privilege('authenticated', 'public.wedding_vendors', 'delete')
  as check_passed;

select
  'wedding vendor RPCs exist' as check_name,
  to_regprocedure('public.list_public_vendors()') is not null
  and to_regprocedure('public.admin_list_vendors()') is not null
  and to_regprocedure(
    'public.admin_save_vendor(uuid,text,text,text,text,text,text,text,text,integer,boolean,boolean)'
  ) is not null
  and to_regprocedure('public.admin_set_vendor_visible(uuid,boolean)') is not null
  and to_regprocedure('public.admin_reorder_vendors(uuid[])') is not null
  and to_regprocedure('public.admin_delete_vendor(uuid)') is not null
  as check_passed;

select
  'public vendor RPC is public, admin RPCs are restricted' as check_name,
  has_function_privilege('anon', 'public.list_public_vendors()', 'execute')
  and has_function_privilege('authenticated', 'public.list_public_vendors()', 'execute')
  and not has_function_privilege('anon', 'public.admin_list_vendors()', 'execute')
  and has_function_privilege('authenticated', 'public.admin_list_vendors()', 'execute')
  and not has_function_privilege(
    'anon',
    'public.admin_save_vendor(uuid,text,text,text,text,text,text,text,text,integer,boolean,boolean)',
    'execute'
  )
  and has_function_privilege(
    'authenticated',
    'public.admin_save_vendor(uuid,text,text,text,text,text,text,text,text,integer,boolean,boolean)',
    'execute'
  )
  and not has_function_privilege(
    'anon',
    'public.admin_set_vendor_visible(uuid,boolean)',
    'execute'
  )
  and has_function_privilege(
    'authenticated',
    'public.admin_set_vendor_visible(uuid,boolean)',
    'execute'
  )
  and not has_function_privilege('anon', 'public.admin_reorder_vendors(uuid[])', 'execute')
  and has_function_privilege(
    'authenticated',
    'public.admin_reorder_vendors(uuid[])',
    'execute'
  )
  and not has_function_privilege('anon', 'public.admin_delete_vendor(uuid)', 'execute')
  and has_function_privilege(
    'authenticated',
    'public.admin_delete_vendor(uuid)',
    'execute'
  ) as check_passed;

select
  'vendor delete RPC protects financial links' as check_name,
  exists (
    select 1
    from pg_proc
    join pg_namespace
      on pg_namespace.oid = pg_proc.pronamespace
    where pg_namespace.nspname = 'public'
      and pg_proc.proname = 'admin_delete_vendor'
      and pg_get_functiondef(pg_proc.oid) like '%public.financial_expenses%'
      and pg_get_functiondef(pg_proc.oid) like '%Vendor is linked to financial expenses and cannot be deleted.%'
  ) as check_passed;
