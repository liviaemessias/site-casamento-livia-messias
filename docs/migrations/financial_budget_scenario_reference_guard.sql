begin;

create or replace function public.admin_save_financial_budget_scenario(
  target_scenario_id uuid,
  submitted_context text,
  submitted_name text,
  submitted_description text default null,
  submitted_is_reference boolean default false,
  submitted_display_order integer default 0,
  submitted_is_active boolean default true
)
returns setof public.financial_budget_scenarios
language plpgsql
security definer
set search_path = ''
as $$
declare
  saved_scenario public.financial_budget_scenarios%rowtype;
  previous_context text;
  safe_context text := nullif(btrim(submitted_context), '');
  safe_name text := nullif(btrim(submitted_name), '');
  next_is_reference boolean := coalesce(submitted_is_reference, false);
  next_is_active boolean := coalesce(submitted_is_active, true);
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.' using errcode = '42501';
  end if;

  if safe_context not in ('wedding', 'honeymoon') then
    raise exception 'Invalid financial budget scenario context.' using errcode = '22023';
  end if;

  if safe_name is null then
    raise exception 'Financial budget scenario name is required.' using errcode = '22023';
  end if;

  if not next_is_active and next_is_reference then
    raise exception 'A reference financial budget scenario must be active.' using errcode = '22023';
  end if;

  if target_scenario_id is not null then
    select context into previous_context
    from public.financial_budget_scenarios
    where id = target_scenario_id;

    if previous_context is null then
      raise exception 'Financial budget scenario not found.' using errcode = 'P0002';
    end if;
  end if;

  if next_is_reference and next_is_active then
    update public.financial_budget_scenarios
    set is_reference = false
    where context = safe_context
      and (target_scenario_id is null or id <> target_scenario_id);
  end if;

  if target_scenario_id is null then
    insert into public.financial_budget_scenarios (
      context,
      name,
      description,
      is_reference,
      display_order,
      is_active
    )
    values (
      safe_context,
      safe_name,
      nullif(btrim(submitted_description), ''),
      next_is_reference,
      coalesce(submitted_display_order, 0),
      next_is_active
    )
    returning * into saved_scenario;
  else
    update public.financial_budget_scenarios
    set
      context = safe_context,
      name = safe_name,
      description = nullif(btrim(submitted_description), ''),
      is_reference = next_is_reference,
      display_order = coalesce(submitted_display_order, 0),
      is_active = next_is_active
    where id = target_scenario_id
    returning * into saved_scenario;
  end if;

  if not exists (
    select 1
    from public.financial_budget_scenarios
    where context = safe_context
      and is_reference is true
      and is_active is true
  ) then
    raise exception 'Each financial context must have one active reference scenario.' using errcode = '23514';
  end if;

  if previous_context is not null
    and previous_context <> safe_context
    and not exists (
      select 1
      from public.financial_budget_scenarios
      where context = previous_context
        and is_reference is true
        and is_active is true
    )
  then
    raise exception 'Each financial context must have one active reference scenario.' using errcode = '23514';
  end if;

  return next saved_scenario;
end;
$$;

create or replace function public.admin_delete_financial_budget_scenario(
  target_scenario_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  scenario_context text;
  scenario_is_reference boolean;
  scenario_is_active boolean;
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.' using errcode = '42501';
  end if;

  select context, is_reference, is_active
  into scenario_context, scenario_is_reference, scenario_is_active
  from public.financial_budget_scenarios
  where id = target_scenario_id;

  if scenario_context is null then
    raise exception 'Financial budget scenario not found.' using errcode = 'P0002';
  end if;

  if scenario_is_reference is true
    and scenario_is_active is true
    and not exists (
      select 1
      from public.financial_budget_scenarios
      where context = scenario_context
        and id <> target_scenario_id
        and is_reference is true
        and is_active is true
    )
  then
    raise exception 'Each financial context must have one active reference scenario.' using errcode = '23514';
  end if;

  delete from public.financial_budget_scenarios
  where id = target_scenario_id;

  if not found then
    raise exception 'Financial budget scenario not found.' using errcode = 'P0002';
  end if;

  return true;
end;
$$;

revoke all on function public.admin_save_financial_budget_scenario(uuid, text, text, text, boolean, integer, boolean)
  from public, anon;
grant execute on function public.admin_save_financial_budget_scenario(uuid, text, text, text, boolean, integer, boolean)
  to authenticated;

revoke all on function public.admin_delete_financial_budget_scenario(uuid) from public, anon;
grant execute on function public.admin_delete_financial_budget_scenario(uuid) to authenticated;

commit;
