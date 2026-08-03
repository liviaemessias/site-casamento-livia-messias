begin;

create or replace function public.admin_reorder_financial_budget_scenarios(
  submitted_context text,
  submitted_scenario_ids uuid[]
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  safe_context text := nullif(btrim(submitted_context), '');
  submitted_count integer;
  existing_count integer;
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.' using errcode = '42501';
  end if;

  if safe_context not in ('wedding', 'honeymoon') then
    raise exception 'Invalid financial budget scenario context.' using errcode = '22023';
  end if;

  if submitted_scenario_ids is null or cardinality(submitted_scenario_ids) = 0 then
    return true;
  end if;

  select count(*), count(distinct scenario_id)
    into submitted_count, existing_count
  from unnest(submitted_scenario_ids) as submitted(scenario_id);

  if submitted_count <> existing_count then
    raise exception 'Financial scenario order list contains duplicate scenarios.' using errcode = '22023';
  end if;

  select count(*)
    into existing_count
  from public.financial_budget_scenarios
  where context = safe_context
    and id = any(submitted_scenario_ids);

  if existing_count <> submitted_count then
    raise exception 'Financial scenario order list contains unknown scenarios.' using errcode = 'P0002';
  end if;

  with ordered_scenarios as (
    select
      submitted.scenario_id,
      (submitted.scenario_order::integer * 10) as display_order
    from unnest(submitted_scenario_ids) with ordinality as submitted(scenario_id, scenario_order)
  )
  update public.financial_budget_scenarios as scenario
  set display_order = ordered_scenarios.display_order
  from ordered_scenarios
  where scenario.id = ordered_scenarios.scenario_id
    and scenario.context = safe_context;

  return true;
end;
$$;

create or replace function public.admin_reorder_financial_categories(
  submitted_context text,
  submitted_category_ids uuid[]
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  safe_context text := nullif(btrim(submitted_context), '');
  submitted_count integer;
  existing_count integer;
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.' using errcode = '42501';
  end if;

  if safe_context not in ('wedding', 'honeymoon', 'both') then
    raise exception 'Invalid financial category context.' using errcode = '22023';
  end if;

  if submitted_category_ids is null or cardinality(submitted_category_ids) = 0 then
    return true;
  end if;

  select count(*), count(distinct category_id)
    into submitted_count, existing_count
  from unnest(submitted_category_ids) as submitted(category_id);

  if submitted_count <> existing_count then
    raise exception 'Financial category order list contains duplicate categories.' using errcode = '22023';
  end if;

  select count(*)
    into existing_count
  from public.financial_categories
  where context = safe_context
    and id = any(submitted_category_ids);

  if existing_count <> submitted_count then
    raise exception 'Financial category order list contains unknown categories.' using errcode = 'P0002';
  end if;

  with ordered_categories as (
    select
      submitted.category_id,
      (submitted.category_order::integer * 10) as display_order
    from unnest(submitted_category_ids) with ordinality as submitted(category_id, category_order)
  )
  update public.financial_categories as category
  set display_order = ordered_categories.display_order
  from ordered_categories
  where category.id = ordered_categories.category_id
    and category.context = safe_context;

  return true;
end;
$$;

create or replace function public.admin_reorder_financial_payers(
  submitted_payer_ids uuid[]
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  submitted_count integer;
  existing_count integer;
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.' using errcode = '42501';
  end if;

  if submitted_payer_ids is null or cardinality(submitted_payer_ids) = 0 then
    return true;
  end if;

  select count(*), count(distinct payer_id)
    into submitted_count, existing_count
  from unnest(submitted_payer_ids) as submitted(payer_id);

  if submitted_count <> existing_count then
    raise exception 'Financial payer order list contains duplicate payers.' using errcode = '22023';
  end if;

  select count(*)
    into existing_count
  from public.financial_payers
  where id = any(submitted_payer_ids);

  if existing_count <> submitted_count then
    raise exception 'Financial payer order list contains unknown payers.' using errcode = 'P0002';
  end if;

  with ordered_payers as (
    select
      submitted.payer_id,
      (submitted.payer_order::integer * 10) as display_order
    from unnest(submitted_payer_ids) with ordinality as submitted(payer_id, payer_order)
  )
  update public.financial_payers as payer
  set display_order = ordered_payers.display_order
  from ordered_payers
  where payer.id = ordered_payers.payer_id;

  return true;
end;
$$;

revoke all on function public.admin_reorder_financial_budget_scenarios(text, uuid[])
  from public, anon;
grant execute on function public.admin_reorder_financial_budget_scenarios(text, uuid[])
  to authenticated;

revoke all on function public.admin_reorder_financial_categories(text, uuid[])
  from public, anon;
grant execute on function public.admin_reorder_financial_categories(text, uuid[])
  to authenticated;

revoke all on function public.admin_reorder_financial_payers(uuid[])
  from public, anon;
grant execute on function public.admin_reorder_financial_payers(uuid[])
  to authenticated;

commit;
