-- Every row returned by this script should have check_passed = true.

select
  'purchase confirmation RPC uses the required method-aware signature' as check_name,
  to_regprocedure('public.admin_confirm_gift_purchase(uuid,text)') is not null
  and to_regprocedure('public.admin_confirm_gift_purchase(uuid)') is null
  as check_passed;

select
  'purchase confirmation RPC is restricted to authenticated administrators' as check_name,
  not has_function_privilege(
    'anon',
    'public.admin_confirm_gift_purchase(uuid,text)',
    'execute'
  )
  and has_function_privilege(
    'authenticated',
    'public.admin_confirm_gift_purchase(uuid,text)',
    'execute'
  ) as check_passed;

select
  'purchase confirmation RPC validates the selected method and purchase mode' as check_name,
  position(
    'selected_purchase_method' in pg_get_functiondef(
      'public.admin_confirm_gift_purchase(uuid,text)'::regprocedure
    )
  ) > 0
  and position(
    'purchase_mode' in pg_get_functiondef(
      'public.admin_confirm_gift_purchase(uuid,text)'::regprocedure
    )
  ) > 0 as check_passed;