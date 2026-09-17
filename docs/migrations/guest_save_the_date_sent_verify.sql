select
  'guests.save_the_date_sent column exists' as check_name,
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'guests'
      and column_name = 'save_the_date_sent'
      and data_type = 'boolean'
  ) as check_passed
union all
select
  'guests.save_the_date_sent is not nullable with default false' as check_name,
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'guests'
      and column_name = 'save_the_date_sent'
      and is_nullable = 'NO'
      and column_default = 'false'
  ) as check_passed
union all
select
  'guest Save the Date RPCs exist' as check_name,
  to_regprocedure('public.create_guest_with_invite_code(text,text,jsonb,integer,boolean,boolean,text)') is not null
  and to_regprocedure('public.admin_update_guest(uuid,text,text,jsonb,integer,boolean,boolean,text)') is not null
  and to_regprocedure('public.admin_set_guest_save_the_date_sent(uuid,boolean)') is not null as check_passed
union all
select
  'guest Save the Date RPCs are restricted' as check_name,
  not has_function_privilege(
    'anon',
    'public.create_guest_with_invite_code(text,text,jsonb,integer,boolean,boolean,text)',
    'execute'
  )
  and has_function_privilege(
    'authenticated',
    'public.create_guest_with_invite_code(text,text,jsonb,integer,boolean,boolean,text)',
    'execute'
  )
  and not has_function_privilege(
    'anon',
    'public.admin_update_guest(uuid,text,text,jsonb,integer,boolean,boolean,text)',
    'execute'
  )
  and has_function_privilege(
    'authenticated',
    'public.admin_update_guest(uuid,text,text,jsonb,integer,boolean,boolean,text)',
    'execute'
  )
  and not has_function_privilege(
    'anon',
    'public.admin_set_guest_save_the_date_sent(uuid,boolean)',
    'execute'
  )
  and has_function_privilege(
    'authenticated',
    'public.admin_set_guest_save_the_date_sent(uuid,boolean)',
    'execute'
  ) as check_passed;
