-- Every row returned by this script should have check_passed = true.

select
  'rsvps.food_restriction exists' as check_name,
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'rsvps'
      and column_name = 'food_restriction'
      and data_type = 'boolean'
  ) as check_passed;

select
  'guest RSVP RPC uses explicit dietary restriction choice' as check_name,
  to_regprocedure(
    'public.save_current_rsvp(text,text,text,text,boolean,text,jsonb)'
  ) is not null as check_passed;

select
  'admin RSVP RPC uses explicit dietary restriction choice' as check_name,
  to_regprocedure(
    'public.admin_save_guest_rsvp(uuid,text,text,text,text,boolean,text,jsonb)'
  ) is not null as check_passed;

select
  'old RSVP RPC signatures were removed' as check_name,
  to_regprocedure(
    'public.save_current_rsvp(text,text,text,text,text,jsonb)'
  ) is null
  and to_regprocedure(
    'public.admin_save_guest_rsvp(uuid,text,text,text,text,text,jsonb)'
  ) is null as check_passed;

select
  'RSVP RPCs have restricted execution' as check_name,
  not has_function_privilege(
    'anon',
    'public.save_current_rsvp(text,text,text,text,boolean,text,jsonb)',
    'execute'
  )
  and has_function_privilege(
    'authenticated',
    'public.save_current_rsvp(text,text,text,text,boolean,text,jsonb)',
    'execute'
  )
  and not has_function_privilege(
    'anon',
    'public.admin_save_guest_rsvp(uuid,text,text,text,text,boolean,text,jsonb)',
    'execute'
  )
  and has_function_privilege(
    'authenticated',
    'public.admin_save_guest_rsvp(uuid,text,text,text,text,boolean,text,jsonb)',
    'execute'
  ) as check_passed;
