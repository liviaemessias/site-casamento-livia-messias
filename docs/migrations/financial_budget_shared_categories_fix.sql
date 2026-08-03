-- ============================================================
-- Financial budget shared categories hotfix
-- ============================================================
--
-- Ensures Budget Forecast items can use categories from the same context
-- or shared categories (`both` / Compartilhado).

create or replace function public.admin_save_financial_budget_item(
  target_item_id uuid,
  submitted_scenario_id uuid,
  submitted_category_id uuid,
  submitted_title text,
  submitted_estimated_amount numeric default 0,
  submitted_expected_vendor_name text default null,
  submitted_priority text default 'normal',
  submitted_status text default 'planned',
  submitted_notes text default null,
  submitted_display_order integer default 0,
  submitted_is_active boolean default true
)
returns setof public.financial_budget_items
language plpgsql
security definer
set search_path = ''
as $$
declare
  saved_item public.financial_budget_items%rowtype;
  scenario_record public.financial_budget_scenarios%rowtype;
  category_record public.financial_categories%rowtype;
  safe_title text := nullif(btrim(submitted_title), '');
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.' using errcode = '42501';
  end if;

  if safe_title is null then
    raise exception 'Financial budget item title is required.' using errcode = '22023';
  end if;

  select * into scenario_record
  from public.financial_budget_scenarios
  where id = submitted_scenario_id;

  if not found then
    raise exception 'Financial budget scenario not found.' using errcode = 'P0002';
  end if;

  select * into category_record
  from public.financial_categories
  where id = submitted_category_id;

  if not found then
    raise exception 'Financial category not found.' using errcode = 'P0002';
  end if;

  if category_record.context not in (scenario_record.context, 'both') then
    raise exception 'Financial category does not match the scenario context.'
      using errcode = '22023';
  end if;

  if target_item_id is null then
    insert into public.financial_budget_items (
      scenario_id,
      category_id,
      context,
      title,
      estimated_amount,
      expected_vendor_name,
      priority,
      status,
      notes,
      display_order,
      is_active
    )
    values (
      scenario_record.id,
      category_record.id,
      scenario_record.context,
      safe_title,
      coalesce(submitted_estimated_amount, 0),
      nullif(btrim(submitted_expected_vendor_name), ''),
      coalesce(nullif(btrim(submitted_priority), ''), 'normal'),
      coalesce(nullif(btrim(submitted_status), ''), 'planned'),
      nullif(btrim(submitted_notes), ''),
      coalesce(submitted_display_order, 0),
      coalesce(submitted_is_active, true)
    )
    returning * into saved_item;
  else
    update public.financial_budget_items
    set
      scenario_id = scenario_record.id,
      category_id = category_record.id,
      context = scenario_record.context,
      title = safe_title,
      estimated_amount = coalesce(submitted_estimated_amount, 0),
      expected_vendor_name = nullif(btrim(submitted_expected_vendor_name), ''),
      priority = coalesce(nullif(btrim(submitted_priority), ''), 'normal'),
      status = coalesce(nullif(btrim(submitted_status), ''), 'planned'),
      notes = nullif(btrim(submitted_notes), ''),
      display_order = coalesce(submitted_display_order, 0),
      is_active = coalesce(submitted_is_active, true)
    where id = target_item_id
    returning * into saved_item;

    if saved_item.id is null then
      raise exception 'Financial budget item not found.' using errcode = 'P0002';
    end if;
  end if;

  return next saved_item;
end;
$$;

comment on function public.admin_save_financial_budget_item(
  uuid,
  uuid,
  uuid,
  text,
  numeric,
  text,
  text,
  text,
  text,
  integer,
  boolean
) is
  'Creates or updates Budget Forecast items. The category must belong to the scenario context or be shared.';

revoke all on function public.admin_save_financial_budget_item(
  uuid,
  uuid,
  uuid,
  text,
  numeric,
  text,
  text,
  text,
  text,
  integer,
  boolean
) from public, anon;

grant execute on function public.admin_save_financial_budget_item(
  uuid,
  uuid,
  uuid,
  text,
  numeric,
  text,
  text,
  text,
  text,
  integer,
  boolean
) to authenticated;
