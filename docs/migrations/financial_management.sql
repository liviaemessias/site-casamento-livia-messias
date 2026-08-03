-- ============================================================
-- Financial management
-- ============================================================

begin;

create table if not exists public.financial_budget_scenarios (
  id uuid primary key default gen_random_uuid(),
  context text not null,
  name text not null,
  description text null,
  is_reference boolean not null default false,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint financial_budget_scenarios_context_check
    check (context in ('wedding', 'honeymoon')),
  constraint financial_budget_scenarios_name_length_check
    check (char_length(btrim(name)) between 1 and 120),
  constraint financial_budget_scenarios_description_length_check
    check (description is null or char_length(description) <= 600),
  constraint financial_budget_scenarios_context_name_key
    unique (context, name)
);

create unique index if not exists financial_budget_scenarios_reference_idx
  on public.financial_budget_scenarios (context)
  where is_reference is true and is_active is true;

create table if not exists public.financial_categories (
  id uuid primary key default gen_random_uuid(),
  context text not null,
  name text not null,
  color text not null default '#5b1166',
  icon text not null default 'wallet',
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint financial_categories_context_check
    check (context in ('wedding', 'honeymoon', 'both')),
  constraint financial_categories_name_length_check
    check (char_length(btrim(name)) between 1 and 120),
  constraint financial_categories_color_check
    check (color ~ '^#[0-9A-Fa-f]{6}$'),
  constraint financial_categories_icon_length_check
    check (char_length(btrim(icon)) between 1 and 60),
  constraint financial_categories_context_name_key
    unique (context, name)
);

create table if not exists public.financial_payers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text null,
  color text not null default '#5b1166',
  icon text not null default 'user',
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint financial_payers_name_key unique (name),
  constraint financial_payers_name_length_check
    check (char_length(btrim(name)) between 1 and 120),
  constraint financial_payers_description_length_check
    check (description is null or char_length(description) <= 400),
  constraint financial_payers_color_check
    check (color ~ '^#[0-9A-Fa-f]{6}$'),
  constraint financial_payers_icon_length_check
    check (char_length(btrim(icon)) between 1 and 60)
);

create table if not exists public.financial_budget_items (
  id uuid primary key default gen_random_uuid(),
  scenario_id uuid not null references public.financial_budget_scenarios(id) on delete cascade,
  category_id uuid not null references public.financial_categories(id) on delete restrict,
  context text not null,
  title text not null,
  estimated_amount numeric(12, 2) not null default 0,
  expected_vendor_name text null,
  priority text not null default 'normal',
  status text not null default 'planned',
  notes text null,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint financial_budget_items_context_check
    check (context in ('wedding', 'honeymoon')),
  constraint financial_budget_items_title_length_check
    check (char_length(btrim(title)) between 1 and 180),
  constraint financial_budget_items_estimated_amount_check
    check (estimated_amount >= 0),
  constraint financial_budget_items_expected_vendor_length_check
    check (expected_vendor_name is null or char_length(expected_vendor_name) <= 180),
  constraint financial_budget_items_priority_check
    check (priority in ('low', 'normal', 'high')),
  constraint financial_budget_items_status_check
    check (status in ('planned', 'researching', 'approved', 'replaced', 'discarded')),
  constraint financial_budget_items_notes_length_check
    check (notes is null or char_length(notes) <= 1200)
);

create table if not exists public.financial_expenses (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.financial_categories(id) on delete restrict,
  budget_item_id uuid null references public.financial_budget_items(id) on delete set null,
  vendor_id uuid null references public.wedding_vendors(id) on delete set null,
  default_payer_id uuid null references public.financial_payers(id) on delete set null,
  context text not null,
  type text not null default 'supplier',
  title text not null,
  description text null,
  total_amount numeric(12, 2) not null default 0,
  payment_method text not null default 'custom',
  status text not null default 'planned',
  contracted_at date null,
  reference_url text null,
  notes text null,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint financial_expenses_context_check
    check (context in ('wedding', 'honeymoon')),
  constraint financial_expenses_type_check
    check (type in ('supplier', 'one_off_purchase', 'fee', 'reservation', 'service', 'product', 'travel', 'lodging', 'transport', 'other')),
  constraint financial_expenses_title_length_check
    check (char_length(btrim(title)) between 1 and 180),
  constraint financial_expenses_description_length_check
    check (description is null or char_length(description) <= 900),
  constraint financial_expenses_total_amount_check
    check (total_amount >= 0),
  constraint financial_expenses_payment_method_check
    check (payment_method in ('cash', 'installments', 'deposit_installments', 'custom')),
  constraint financial_expenses_status_check
    check (status in ('planned', 'quoting', 'contracted', 'purchased', 'paid', 'cancelled')),
  constraint financial_expenses_reference_url_length_check
    check (reference_url is null or char_length(reference_url) <= 1000),
  constraint financial_expenses_notes_length_check
    check (notes is null or char_length(notes) <= 1600)
);

create table if not exists public.financial_expense_payments (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid not null references public.financial_expenses(id) on delete cascade,
  payer_id uuid null references public.financial_payers(id) on delete set null,
  installment_number integer not null default 1,
  label text null,
  amount numeric(12, 2) not null default 0,
  due_date date null,
  paid_at date null,
  status text not null default 'unpaid',
  notes text null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint financial_expense_payments_installment_number_check
    check (installment_number >= 1 and installment_number <= 240),
  constraint financial_expense_payments_label_length_check
    check (label is null or char_length(label) <= 120),
  constraint financial_expense_payments_amount_check
    check (amount >= 0),
  constraint financial_expense_payments_status_check
    check (status in ('unpaid', 'paid', 'cancelled')),
  constraint financial_expense_payments_paid_date_check
    check (paid_at is null or status = 'paid'),
  constraint financial_expense_payments_notes_length_check
    check (notes is null or char_length(notes) <= 900)
);

create index if not exists financial_budget_scenarios_order_idx
  on public.financial_budget_scenarios (context, is_active, is_reference desc, display_order, name);

create index if not exists financial_categories_order_idx
  on public.financial_categories (context, is_active, display_order, name);

create index if not exists financial_payers_order_idx
  on public.financial_payers (is_active, display_order, name);

create index if not exists financial_budget_items_scenario_idx
  on public.financial_budget_items (context, scenario_id, category_id, display_order, title);

create index if not exists financial_expenses_context_idx
  on public.financial_expenses (context, status, category_id, contracted_at);

create index if not exists financial_expenses_budget_item_idx
  on public.financial_expenses (budget_item_id);

create index if not exists financial_expense_payments_due_idx
  on public.financial_expense_payments (status, due_date, expense_id);

alter table public.financial_budget_scenarios enable row level security;
alter table public.financial_categories enable row level security;
alter table public.financial_payers enable row level security;
alter table public.financial_budget_items enable row level security;
alter table public.financial_expenses enable row level security;
alter table public.financial_expense_payments enable row level security;

revoke all on table public.financial_budget_scenarios from anon, authenticated;
revoke all on table public.financial_categories from anon, authenticated;
revoke all on table public.financial_payers from anon, authenticated;
revoke all on table public.financial_budget_items from anon, authenticated;
revoke all on table public.financial_expenses from anon, authenticated;
revoke all on table public.financial_expense_payments from anon, authenticated;

grant all on table public.financial_budget_scenarios to service_role;
grant all on table public.financial_categories to service_role;
grant all on table public.financial_payers to service_role;
grant all on table public.financial_budget_items to service_role;
grant all on table public.financial_expenses to service_role;
grant all on table public.financial_expense_payments to service_role;

create or replace function public.touch_financial_management_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists touch_financial_budget_scenarios_updated_at
  on public.financial_budget_scenarios;
create trigger touch_financial_budget_scenarios_updated_at
  before update on public.financial_budget_scenarios
  for each row
  execute function public.touch_financial_management_updated_at();

drop trigger if exists touch_financial_categories_updated_at
  on public.financial_categories;
create trigger touch_financial_categories_updated_at
  before update on public.financial_categories
  for each row
  execute function public.touch_financial_management_updated_at();

drop trigger if exists touch_financial_payers_updated_at
  on public.financial_payers;
create trigger touch_financial_payers_updated_at
  before update on public.financial_payers
  for each row
  execute function public.touch_financial_management_updated_at();

drop trigger if exists touch_financial_budget_items_updated_at
  on public.financial_budget_items;
create trigger touch_financial_budget_items_updated_at
  before update on public.financial_budget_items
  for each row
  execute function public.touch_financial_management_updated_at();

drop trigger if exists touch_financial_expenses_updated_at
  on public.financial_expenses;
create trigger touch_financial_expenses_updated_at
  before update on public.financial_expenses
  for each row
  execute function public.touch_financial_management_updated_at();

drop trigger if exists touch_financial_expense_payments_updated_at
  on public.financial_expense_payments;
create trigger touch_financial_expense_payments_updated_at
  before update on public.financial_expense_payments
  for each row
  execute function public.touch_financial_management_updated_at();

insert into public.financial_budget_scenarios
  (context, name, description, is_reference, display_order)
values
  ('wedding', 'Planejado', 'Cenário principal de referência do casamento.', true, 1),
  ('honeymoon', 'Planejado', 'Cenário principal de referência da lua de mel.', true, 1)
on conflict (context, name) do update
set is_reference = excluded.is_reference,
    display_order = excluded.display_order,
    is_active = true;

insert into public.financial_categories
  (context, name, color, icon, display_order)
values
  ('wedding', 'Buffet', '#8f5f3f', 'utensils', 10),
  ('wedding', 'Cerimonial', '#5b1166', 'clipboard-check', 20),
  ('wedding', 'Fotografia e Filmagem', '#3f7f8f', 'camera', 30),
  ('wedding', 'Noiva', '#b45f8a', 'sparkles', 40),
  ('wedding', 'Noivo', '#5f6f9f', 'shirt', 50),
  ('wedding', 'Igreja e Civil', '#7b6f3f', 'church', 60),
  ('wedding', 'Decoração', '#8a6bb4', 'flower-2', 70),
  ('wedding', 'Papelaria e Convites', '#4f7a5a', 'mail', 80),
  ('honeymoon', 'Passagens', '#3f7fa7', 'plane', 10),
  ('honeymoon', 'Hospedagem', '#a6607c', 'hotel', 20),
  ('honeymoon', 'Passeios', '#6b7f3f', 'map', 30),
  ('honeymoon', 'Transporte', '#b47a3f', 'car', 40),
  ('honeymoon', 'Documentação', '#8f5f3f', 'file-check', 50),
  ('both', 'Presentes e Extras', '#b47a3f', 'gift', 900),
  ('both', 'Outros', '#6b6473', 'more-horizontal', 999)
on conflict (context, name) do nothing;

insert into public.financial_payers
  (name, description, color, icon, display_order)
values
  ('Noivo', 'Pagamentos feitos ou previstos pelo noivo.', '#5f6f9f', 'user', 10),
  ('Noiva', 'Pagamentos feitos ou previstos pela noiva.', '#b45f8a', 'user', 20),
  ('Ambos', 'Pagamentos divididos ou feitos pelo casal.', '#5b1166', 'users', 30),
  ('Família da Noiva', 'Pagamentos feitos ou previstos pela família da noiva.', '#a6607c', 'home', 40),
  ('Família do Noivo', 'Pagamentos feitos ou previstos pela família do noivo.', '#3f7f8f', 'home', 50),
  ('A definir', 'Pagador ainda não definido.', '#6b6473', 'help-circle', 60),
  ('Outro', 'Outro pagador.', '#7b6f3f', 'circle-dollar-sign', 70)
on conflict (name) do nothing;

create or replace function public.admin_list_financial_categories()
returns table (
  id uuid,
  context text,
  name text,
  color text,
  icon text,
  display_order integer,
  is_active boolean,
  budget_item_count bigint,
  expense_count bigint,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.' using errcode = '42501';
  end if;

  return query
  select
    category.id,
    category.context,
    category.name,
    category.color,
    category.icon,
    category.display_order,
    category.is_active,
    count(distinct budget_item.id) as budget_item_count,
    count(distinct expense.id) as expense_count,
    category.created_at,
    category.updated_at
  from public.financial_categories as category
  left join public.financial_budget_items as budget_item
    on budget_item.category_id = category.id
  left join public.financial_expenses as expense
    on expense.category_id = category.id
  group by category.id
  order by category.context asc, category.display_order asc, category.name asc;
end;
$$;

create or replace function public.admin_save_financial_category(
  target_category_id uuid,
  submitted_context text,
  submitted_name text,
  submitted_color text default '#5b1166',
  submitted_icon text default 'wallet',
  submitted_display_order integer default 0,
  submitted_is_active boolean default true
)
returns setof public.financial_categories
language plpgsql
security definer
set search_path = ''
as $$
declare
  saved_category public.financial_categories%rowtype;
  safe_context text := nullif(btrim(submitted_context), '');
  safe_name text := nullif(btrim(submitted_name), '');
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.' using errcode = '42501';
  end if;

  if safe_context not in ('wedding', 'honeymoon', 'both') then
    raise exception 'Invalid financial category context.' using errcode = '22023';
  end if;

  if safe_name is null then
    raise exception 'Financial category name is required.' using errcode = '22023';
  end if;

  if target_category_id is null then
    insert into public.financial_categories (
      context,
      name,
      color,
      icon,
      display_order,
      is_active
    )
    values (
      safe_context,
      safe_name,
      coalesce(nullif(btrim(submitted_color), ''), '#5b1166'),
      coalesce(nullif(btrim(submitted_icon), ''), 'wallet'),
      coalesce(submitted_display_order, 0),
      coalesce(submitted_is_active, true)
    )
    returning * into saved_category;
  else
    update public.financial_categories
    set
      context = safe_context,
      name = safe_name,
      color = coalesce(nullif(btrim(submitted_color), ''), '#5b1166'),
      icon = coalesce(nullif(btrim(submitted_icon), ''), 'wallet'),
      display_order = coalesce(submitted_display_order, 0),
      is_active = coalesce(submitted_is_active, true)
    where id = target_category_id
    returning * into saved_category;

    if saved_category.id is null then
      raise exception 'Financial category not found.' using errcode = 'P0002';
    end if;
  end if;

  return next saved_category;
end;
$$;

create or replace function public.admin_delete_financial_category(target_category_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.' using errcode = '42501';
  end if;

  delete from public.financial_categories
  where id = target_category_id;

  if not found then
    raise exception 'Financial category not found.' using errcode = 'P0002';
  end if;

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

create or replace function public.admin_list_financial_payers()
returns table (
  id uuid,
  name text,
  description text,
  color text,
  icon text,
  display_order integer,
  is_active boolean,
  expense_count bigint,
  payment_count bigint,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.' using errcode = '42501';
  end if;

  return query
  select
    payer.id,
    payer.name,
    payer.description,
    payer.color,
    payer.icon,
    payer.display_order,
    payer.is_active,
    count(distinct expense.id) as expense_count,
    count(distinct payment.id) as payment_count,
    payer.created_at,
    payer.updated_at
  from public.financial_payers as payer
  left join public.financial_expenses as expense
    on expense.default_payer_id = payer.id
  left join public.financial_expense_payments as payment
    on payment.payer_id = payer.id
  group by payer.id
  order by payer.display_order asc, payer.name asc;
end;
$$;

create or replace function public.admin_save_financial_payer(
  target_payer_id uuid,
  submitted_name text,
  submitted_description text default null,
  submitted_color text default '#5b1166',
  submitted_icon text default 'user',
  submitted_display_order integer default 0,
  submitted_is_active boolean default true
)
returns setof public.financial_payers
language plpgsql
security definer
set search_path = ''
as $$
declare
  saved_payer public.financial_payers%rowtype;
  safe_name text := nullif(btrim(submitted_name), '');
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.' using errcode = '42501';
  end if;

  if safe_name is null then
    raise exception 'Financial payer name is required.' using errcode = '22023';
  end if;

  if target_payer_id is null then
    insert into public.financial_payers (
      name,
      description,
      color,
      icon,
      display_order,
      is_active
    )
    values (
      safe_name,
      nullif(btrim(submitted_description), ''),
      coalesce(nullif(btrim(submitted_color), ''), '#5b1166'),
      coalesce(nullif(btrim(submitted_icon), ''), 'user'),
      coalesce(submitted_display_order, 0),
      coalesce(submitted_is_active, true)
    )
    returning * into saved_payer;
  else
    update public.financial_payers
    set
      name = safe_name,
      description = nullif(btrim(submitted_description), ''),
      color = coalesce(nullif(btrim(submitted_color), ''), '#5b1166'),
      icon = coalesce(nullif(btrim(submitted_icon), ''), 'user'),
      display_order = coalesce(submitted_display_order, 0),
      is_active = coalesce(submitted_is_active, true)
    where id = target_payer_id
    returning * into saved_payer;

    if saved_payer.id is null then
      raise exception 'Financial payer not found.' using errcode = 'P0002';
    end if;
  end if;

  return next saved_payer;
end;
$$;

create or replace function public.admin_delete_financial_payer(target_payer_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.' using errcode = '42501';
  end if;

  delete from public.financial_payers
  where id = target_payer_id;

  if not found then
    raise exception 'Financial payer not found.' using errcode = 'P0002';
  end if;

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

create or replace function public.admin_list_financial_budget_scenarios()
returns table (
  id uuid,
  context text,
  name text,
  description text,
  is_reference boolean,
  display_order integer,
  is_active boolean,
  item_count bigint,
  total_estimated numeric,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.' using errcode = '42501';
  end if;

  return query
  select
    scenario.id,
    scenario.context,
    scenario.name,
    scenario.description,
    scenario.is_reference,
    scenario.display_order,
    scenario.is_active,
    count(item.id) as item_count,
    coalesce(sum(item.estimated_amount) filter (where item.is_active is true), 0)::numeric as total_estimated,
    scenario.created_at,
    scenario.updated_at
  from public.financial_budget_scenarios as scenario
  left join public.financial_budget_items as item
    on item.scenario_id = scenario.id
  group by scenario.id
  order by scenario.context asc, scenario.is_reference desc, scenario.display_order asc, scenario.name asc;
end;
$$;

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

    if saved_scenario.id is null then
      raise exception 'Financial budget scenario not found.' using errcode = 'P0002';
    end if;
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

create or replace function public.admin_delete_financial_budget_scenario(target_scenario_id uuid)
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

drop function if exists public.admin_list_financial_budget_items();

create or replace function public.admin_list_financial_budget_items()
returns table (
  id uuid,
  scenario_id uuid,
  scenario_name text,
  scenario_is_reference boolean,
  category_id uuid,
  category_name text,
  context text,
  title text,
  estimated_amount numeric,
  expected_vendor_name text,
  priority text,
  status text,
  notes text,
  display_order integer,
  is_active boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  linked_expense_count bigint,
  linked_expense_total numeric,
  linked_paid_total numeric,
  linked_remaining_total numeric,
  linked_delta numeric
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.' using errcode = '42501';
  end if;

  return query
  select
    item.id,
    item.scenario_id,
    scenario.name,
    scenario.is_reference,
    item.category_id,
    category.name,
    item.context,
    item.title,
    item.estimated_amount,
    item.expected_vendor_name,
    item.priority,
    item.status,
    item.notes,
    item.display_order,
    item.is_active,
    item.created_at,
    item.updated_at,
    coalesce(linked_expenses.linked_expense_count, 0)::bigint,
    coalesce(linked_expenses.linked_expense_total, 0)::numeric,
    coalesce(linked_payments.linked_paid_total, 0)::numeric,
    greatest(
      coalesce(linked_expenses.linked_expense_total, 0) - coalesce(linked_payments.linked_paid_total, 0),
      0
    )::numeric,
    (
      coalesce(linked_expenses.linked_expense_total, 0) - item.estimated_amount
    )::numeric
  from public.financial_budget_items as item
  join public.financial_budget_scenarios as scenario
    on scenario.id = item.scenario_id
  join public.financial_categories as category
    on category.id = item.category_id
  left join lateral (
    select
      count(*)::bigint as linked_expense_count,
      coalesce(sum(expense.total_amount), 0)::numeric as linked_expense_total
    from public.financial_expenses as expense
    where expense.budget_item_id = item.id
      and expense.is_active is true
      and expense.status <> 'cancelled'
  ) as linked_expenses on true
  left join lateral (
    select
      coalesce(sum(payment.amount), 0)::numeric as linked_paid_total
    from public.financial_expenses as expense
    join public.financial_expense_payments as payment
      on payment.expense_id = expense.id
    where expense.budget_item_id = item.id
      and expense.is_active is true
      and expense.status <> 'cancelled'
      and payment.status = 'paid'
  ) as linked_payments on true
  order by item.context asc, scenario.display_order asc, category.display_order asc, item.display_order asc, item.title asc;
end;
$$;

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
    raise exception 'Financial category does not match the scenario context.' using errcode = '22023';
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

create or replace function public.admin_delete_financial_budget_item(target_item_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.' using errcode = '42501';
  end if;

  delete from public.financial_budget_items
  where id = target_item_id;

  if not found then
    raise exception 'Financial budget item not found.' using errcode = 'P0002';
  end if;

  return true;
end;
$$;

drop function if exists public.admin_list_financial_expenses();

create or replace function public.admin_list_financial_expenses()
returns table (
  id uuid,
  category_id uuid,
  category_name text,
  budget_item_id uuid,
  budget_item_title text,
  budget_item_estimated_amount numeric,
  vendor_id uuid,
  vendor_name text,
  default_payer_id uuid,
  default_payer_name text,
  context text,
  type text,
  title text,
  description text,
  total_amount numeric,
  paid_amount numeric,
  remaining_amount numeric,
  payment_method text,
  status text,
  contracted_at date,
  reference_url text,
  notes text,
  is_active boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.' using errcode = '42501';
  end if;

  return query
  select
    expense.id,
    expense.category_id,
    category.name,
    expense.budget_item_id,
    budget_item.title,
    budget_item.estimated_amount,
    expense.vendor_id,
    vendor.name,
    expense.default_payer_id,
    payer.name,
    expense.context,
    expense.type,
    expense.title,
    expense.description,
    expense.total_amount,
    coalesce(sum(payment.amount) filter (where payment.status = 'paid'), 0)::numeric as paid_amount,
    greatest(
      expense.total_amount - coalesce(sum(payment.amount) filter (where payment.status = 'paid'), 0),
      0
    )::numeric as remaining_amount,
    expense.payment_method,
    expense.status,
    expense.contracted_at,
    expense.reference_url,
    expense.notes,
    expense.is_active,
    expense.created_at,
    expense.updated_at
  from public.financial_expenses as expense
  join public.financial_categories as category
    on category.id = expense.category_id
  left join public.financial_budget_items as budget_item
    on budget_item.id = expense.budget_item_id
  left join public.wedding_vendors as vendor
    on vendor.id = expense.vendor_id
  left join public.financial_payers as payer
    on payer.id = expense.default_payer_id
  left join public.financial_expense_payments as payment
    on payment.expense_id = expense.id
  group by expense.id, category.name, budget_item.title, budget_item.estimated_amount, vendor.name, payer.name
  order by expense.context asc, expense.contracted_at nulls last, category.name asc, expense.title asc;
end;
$$;

drop function if exists public.admin_save_financial_expense(
  uuid, uuid, text, uuid, uuid, text, text, text, numeric, text, text, date, text, text, boolean
);

create or replace function public.admin_save_financial_expense(
  target_expense_id uuid,
  submitted_category_id uuid,
  submitted_budget_item_id uuid default null,
  submitted_context text default null,
  submitted_vendor_id uuid default null,
  submitted_default_payer_id uuid default null,
  submitted_type text default 'supplier',
  submitted_title text default null,
  submitted_description text default null,
  submitted_total_amount numeric default 0,
  submitted_payment_method text default 'custom',
  submitted_status text default 'planned',
  submitted_contracted_at date default null,
  submitted_reference_url text default null,
  submitted_notes text default null,
  submitted_is_active boolean default true
)
returns setof public.financial_expenses
language plpgsql
security definer
set search_path = ''
as $$
declare
  saved_expense public.financial_expenses%rowtype;
  category_record public.financial_categories%rowtype;
  budget_item_record public.financial_budget_items%rowtype;
  safe_context text := nullif(btrim(submitted_context), '');
  safe_title text := nullif(btrim(submitted_title), '');
  safe_type text := coalesce(nullif(btrim(submitted_type), ''), 'supplier');
  safe_payment_method text := coalesce(nullif(btrim(submitted_payment_method), ''), 'custom');
  safe_status text := coalesce(nullif(btrim(submitted_status), ''), 'planned');
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.' using errcode = '42501';
  end if;

  if safe_title is null then
    raise exception 'Financial expense title is required.' using errcode = '22023';
  end if;

  select * into category_record
  from public.financial_categories
  where id = submitted_category_id;

  if not found then
    raise exception 'Financial category not found.' using errcode = 'P0002';
  end if;

  safe_context := coalesce(safe_context, nullif(category_record.context, 'both'));

  if safe_context not in ('wedding', 'honeymoon') then
    raise exception 'Financial expense context is required for shared categories.' using errcode = '22023';
  end if;

  if category_record.context <> 'both'
    and category_record.context <> safe_context
  then
    raise exception 'Financial category does not match the expense context.' using errcode = '22023';
  end if;

  if submitted_vendor_id is not null
    and not exists (select 1 from public.wedding_vendors where id = submitted_vendor_id)
  then
    raise exception 'Wedding vendor not found.' using errcode = 'P0002';
  end if;

  if submitted_default_payer_id is not null
    and not exists (select 1 from public.financial_payers where id = submitted_default_payer_id)
  then
    raise exception 'Financial payer not found.' using errcode = 'P0002';
  end if;

  if submitted_budget_item_id is not null then
    select * into budget_item_record
    from public.financial_budget_items
    where id = submitted_budget_item_id;

    if not found then
      raise exception 'Financial budget item not found.' using errcode = 'P0002';
    end if;

    if budget_item_record.context <> safe_context then
      raise exception 'Financial budget item does not match the expense context.' using errcode = '22023';
    end if;
  end if;

  if target_expense_id is null then
    insert into public.financial_expenses (
      category_id,
      budget_item_id,
      context,
      vendor_id,
      default_payer_id,
      type,
      title,
      description,
      total_amount,
      payment_method,
      status,
      contracted_at,
      reference_url,
      notes,
      is_active
    )
    values (
      category_record.id,
      submitted_budget_item_id,
      safe_context,
      submitted_vendor_id,
      submitted_default_payer_id,
      safe_type,
      safe_title,
      nullif(btrim(submitted_description), ''),
      coalesce(submitted_total_amount, 0),
      safe_payment_method,
      safe_status,
      submitted_contracted_at,
      nullif(btrim(submitted_reference_url), ''),
      nullif(btrim(submitted_notes), ''),
      coalesce(submitted_is_active, true)
    )
    returning * into saved_expense;
  else
    update public.financial_expenses
    set
      category_id = category_record.id,
      budget_item_id = submitted_budget_item_id,
      context = safe_context,
      vendor_id = submitted_vendor_id,
      default_payer_id = submitted_default_payer_id,
      type = safe_type,
      title = safe_title,
      description = nullif(btrim(submitted_description), ''),
      total_amount = coalesce(submitted_total_amount, 0),
      payment_method = safe_payment_method,
      status = safe_status,
      contracted_at = submitted_contracted_at,
      reference_url = nullif(btrim(submitted_reference_url), ''),
      notes = nullif(btrim(submitted_notes), ''),
      is_active = coalesce(submitted_is_active, true)
    where id = target_expense_id
    returning * into saved_expense;

    if saved_expense.id is null then
      raise exception 'Financial expense not found.' using errcode = 'P0002';
    end if;
  end if;

  return next saved_expense;
end;
$$;

create or replace function public.admin_delete_financial_expense(target_expense_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.' using errcode = '42501';
  end if;

  delete from public.financial_expenses
  where id = target_expense_id;

  if not found then
    raise exception 'Financial expense not found.' using errcode = 'P0002';
  end if;

  return true;
end;
$$;

create or replace function public.admin_list_financial_expense_payments()
returns table (
  id uuid,
  expense_id uuid,
  expense_title text,
  context text,
  category_id uuid,
  category_name text,
  payer_id uuid,
  payer_name text,
  installment_number integer,
  label text,
  amount numeric,
  due_date date,
  paid_at date,
  status text,
  display_status text,
  notes text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.' using errcode = '42501';
  end if;

  return query
  select
    payment.id,
    payment.expense_id,
    expense.title,
    expense.context,
    expense.category_id,
    category.name,
    payment.payer_id,
    payer.name,
    payment.installment_number,
    payment.label,
    payment.amount,
    payment.due_date,
    payment.paid_at,
    payment.status,
    case
      when payment.status = 'unpaid'
        and payment.due_date is not null
        and payment.due_date < current_date
        then 'overdue'
      else payment.status
    end as display_status,
    payment.notes,
    payment.created_at,
    payment.updated_at
  from public.financial_expense_payments as payment
  join public.financial_expenses as expense
    on expense.id = payment.expense_id
  join public.financial_categories as category
    on category.id = expense.category_id
  left join public.financial_payers as payer
    on payer.id = payment.payer_id
  order by payment.due_date nulls last, expense.title asc, payment.installment_number asc;
end;
$$;

create or replace function public.admin_save_financial_expense_payment(
  target_payment_id uuid,
  submitted_expense_id uuid,
  submitted_payer_id uuid default null,
  submitted_installment_number integer default 1,
  submitted_label text default null,
  submitted_amount numeric default 0,
  submitted_due_date date default null,
  submitted_paid_at date default null,
  submitted_status text default 'unpaid',
  submitted_notes text default null
)
returns setof public.financial_expense_payments
language plpgsql
security definer
set search_path = ''
as $$
declare
  saved_payment public.financial_expense_payments%rowtype;
  safe_status text := coalesce(nullif(btrim(submitted_status), ''), 'unpaid');
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.' using errcode = '42501';
  end if;

  if not exists (select 1 from public.financial_expenses where id = submitted_expense_id) then
    raise exception 'Financial expense not found.' using errcode = 'P0002';
  end if;

  if submitted_payer_id is not null
    and not exists (select 1 from public.financial_payers where id = submitted_payer_id)
  then
    raise exception 'Financial payer not found.' using errcode = 'P0002';
  end if;

  if target_payment_id is null then
    insert into public.financial_expense_payments (
      expense_id,
      payer_id,
      installment_number,
      label,
      amount,
      due_date,
      paid_at,
      status,
      notes
    )
    values (
      submitted_expense_id,
      submitted_payer_id,
      coalesce(submitted_installment_number, 1),
      nullif(btrim(submitted_label), ''),
      coalesce(submitted_amount, 0),
      submitted_due_date,
      submitted_paid_at,
      safe_status,
      nullif(btrim(submitted_notes), '')
    )
    returning * into saved_payment;
  else
    update public.financial_expense_payments
    set
      expense_id = submitted_expense_id,
      payer_id = submitted_payer_id,
      installment_number = coalesce(submitted_installment_number, 1),
      label = nullif(btrim(submitted_label), ''),
      amount = coalesce(submitted_amount, 0),
      due_date = submitted_due_date,
      paid_at = submitted_paid_at,
      status = safe_status,
      notes = nullif(btrim(submitted_notes), '')
    where id = target_payment_id
    returning * into saved_payment;

    if saved_payment.id is null then
      raise exception 'Financial payment not found.' using errcode = 'P0002';
    end if;
  end if;

  return next saved_payment;
end;
$$;

create or replace function public.admin_delete_financial_expense_payment(target_payment_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.' using errcode = '42501';
  end if;

  delete from public.financial_expense_payments
  where id = target_payment_id;

  if not found then
    raise exception 'Financial payment not found.' using errcode = 'P0002';
  end if;

  return true;
end;
$$;

create or replace function public.admin_get_financial_summary(
  target_context text default 'all'
)
returns table (
  context text,
  reference_scenario_id uuid,
  reference_scenario_name text,
  reference_budget_amount numeric,
  total_contracted numeric,
  total_paid numeric,
  total_remaining numeric,
  committed_delta numeric,
  committed_percent numeric,
  overdue_payment_count bigint,
  next_due_date date,
  due_this_month_amount numeric
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.' using errcode = '42501';
  end if;

  if coalesce(target_context, 'all') not in ('all', 'wedding', 'honeymoon') then
    raise exception 'Invalid financial summary context.' using errcode = '22023';
  end if;

  return query
  with selected_contexts as (
    select unnest(
      case
        when coalesce(target_context, 'all') = 'wedding' then array['wedding']
        when coalesce(target_context, 'all') = 'honeymoon' then array['honeymoon']
        else array['wedding', 'honeymoon']
      end
    ) as context
  ),
  reference_scenarios as (
    select distinct on (scenario.context)
      scenario.context,
      scenario.id,
      scenario.name
    from public.financial_budget_scenarios as scenario
    join selected_contexts
      on selected_contexts.context = scenario.context
    where scenario.is_active is true
    order by
      scenario.context,
      scenario.is_reference desc,
      (scenario.name = 'Planejado') desc,
      scenario.display_order asc,
      scenario.name asc
  ),
  context_summary as (
    select
      selected_contexts.context,
      reference_scenarios.id as reference_scenario_id,
      reference_scenarios.name as reference_scenario_name,
      coalesce(sum(budget_item.estimated_amount) filter (
        where budget_item.id is not null and budget_item.is_active is true
      ), 0)::numeric as reference_budget_amount,
      coalesce((
        select sum(expense.total_amount)
        from public.financial_expenses as expense
        where expense.context = selected_contexts.context
          and expense.is_active is true
          and expense.status <> 'cancelled'
      ), 0)::numeric as total_contracted,
      coalesce((
        select sum(payment.amount)
        from public.financial_expense_payments as payment
        join public.financial_expenses as expense
          on expense.id = payment.expense_id
        where expense.context = selected_contexts.context
          and expense.is_active is true
          and expense.status <> 'cancelled'
          and payment.status = 'paid'
      ), 0)::numeric as total_paid,
      coalesce((
        select count(*)
        from public.financial_expense_payments as payment
        join public.financial_expenses as expense
          on expense.id = payment.expense_id
        where expense.context = selected_contexts.context
          and expense.is_active is true
          and expense.status <> 'cancelled'
          and payment.status = 'unpaid'
          and payment.due_date is not null
          and payment.due_date < current_date
      ), 0)::bigint as overdue_payment_count,
      (
        select min(payment.due_date)
        from public.financial_expense_payments as payment
        join public.financial_expenses as expense
          on expense.id = payment.expense_id
        where expense.context = selected_contexts.context
          and expense.is_active is true
          and expense.status <> 'cancelled'
          and payment.status = 'unpaid'
          and payment.due_date is not null
      ) as next_due_date,
      coalesce((
        select sum(payment.amount)
        from public.financial_expense_payments as payment
        join public.financial_expenses as expense
          on expense.id = payment.expense_id
        where expense.context = selected_contexts.context
          and expense.is_active is true
          and expense.status <> 'cancelled'
          and payment.status = 'unpaid'
          and payment.due_date >= date_trunc('month', current_date)::date
          and payment.due_date < (date_trunc('month', current_date) + interval '1 month')::date
      ), 0)::numeric as due_this_month_amount
    from selected_contexts
    left join reference_scenarios
      on reference_scenarios.context = selected_contexts.context
    left join public.financial_budget_items as budget_item
      on budget_item.scenario_id = reference_scenarios.id
    group by selected_contexts.context, reference_scenarios.id, reference_scenarios.name
  ),
  with_calculations as (
    select
      context_summary.context,
      context_summary.reference_scenario_id,
      context_summary.reference_scenario_name,
      context_summary.reference_budget_amount,
      context_summary.total_contracted,
      context_summary.total_paid,
      greatest(context_summary.total_contracted - context_summary.total_paid, 0)::numeric as total_remaining,
      (context_summary.total_contracted - context_summary.reference_budget_amount)::numeric as committed_delta,
      case
        when context_summary.reference_budget_amount > 0
          then round((context_summary.total_contracted / context_summary.reference_budget_amount) * 100, 2)
        else null
      end as committed_percent,
      context_summary.overdue_payment_count,
      context_summary.next_due_date,
      context_summary.due_this_month_amount
    from context_summary
  )
  select * from with_calculations
  union all
  select
    'all' as context,
    null::uuid as reference_scenario_id,
    'Referências consolidadas' as reference_scenario_name,
    sum(with_calculations.reference_budget_amount)::numeric as reference_budget_amount,
    sum(with_calculations.total_contracted)::numeric as total_contracted,
    sum(with_calculations.total_paid)::numeric as total_paid,
    sum(with_calculations.total_remaining)::numeric as total_remaining,
    sum(with_calculations.committed_delta)::numeric as committed_delta,
    case
      when sum(with_calculations.reference_budget_amount) > 0
        then round((sum(with_calculations.total_contracted) / sum(with_calculations.reference_budget_amount)) * 100, 2)
      else null
    end as committed_percent,
    sum(with_calculations.overdue_payment_count)::bigint as overdue_payment_count,
    min(with_calculations.next_due_date) as next_due_date,
    sum(with_calculations.due_this_month_amount)::numeric as due_this_month_amount
  from with_calculations
  where coalesce(target_context, 'all') = 'all'
  having coalesce(target_context, 'all') = 'all';
end;
$$;

comment on table public.financial_budget_scenarios is
  'Financial budget scenarios for wedding and honeymoon contexts.';

comment on table public.financial_categories is
  'Editable financial categories shared by budget items and real expenses.';

comment on table public.financial_payers is
  'Editable payer list used as default payer on expenses and effective payer on installments.';

comment on table public.financial_budget_items is
  'Estimated budget items linked to a financial budget scenario.';

comment on table public.financial_expenses is
  'Real contracted expenses and purchases for wedding or honeymoon financial control.';

comment on table public.financial_expense_payments is
  'Installments and payments linked to real financial expenses.';

revoke all on function public.touch_financial_management_updated_at()
  from public, anon, authenticated;

revoke all on function public.admin_list_financial_categories() from public, anon;
grant execute on function public.admin_list_financial_categories() to authenticated;

revoke all on function public.admin_save_financial_category(uuid, text, text, text, text, integer, boolean)
  from public, anon;
grant execute on function public.admin_save_financial_category(uuid, text, text, text, text, integer, boolean)
  to authenticated;

revoke all on function public.admin_delete_financial_category(uuid) from public, anon;
grant execute on function public.admin_delete_financial_category(uuid) to authenticated;

revoke all on function public.admin_reorder_financial_categories(text, uuid[])
  from public, anon;
grant execute on function public.admin_reorder_financial_categories(text, uuid[])
  to authenticated;

revoke all on function public.admin_list_financial_payers() from public, anon;
grant execute on function public.admin_list_financial_payers() to authenticated;

revoke all on function public.admin_save_financial_payer(uuid, text, text, text, text, integer, boolean)
  from public, anon;
grant execute on function public.admin_save_financial_payer(uuid, text, text, text, text, integer, boolean)
  to authenticated;

revoke all on function public.admin_delete_financial_payer(uuid) from public, anon;
grant execute on function public.admin_delete_financial_payer(uuid) to authenticated;

revoke all on function public.admin_reorder_financial_payers(uuid[])
  from public, anon;
grant execute on function public.admin_reorder_financial_payers(uuid[])
  to authenticated;

revoke all on function public.admin_list_financial_budget_scenarios() from public, anon;
grant execute on function public.admin_list_financial_budget_scenarios() to authenticated;

revoke all on function public.admin_save_financial_budget_scenario(uuid, text, text, text, boolean, integer, boolean)
  from public, anon;
grant execute on function public.admin_save_financial_budget_scenario(uuid, text, text, text, boolean, integer, boolean)
  to authenticated;

revoke all on function public.admin_delete_financial_budget_scenario(uuid) from public, anon;
grant execute on function public.admin_delete_financial_budget_scenario(uuid) to authenticated;

revoke all on function public.admin_reorder_financial_budget_scenarios(text, uuid[])
  from public, anon;
grant execute on function public.admin_reorder_financial_budget_scenarios(text, uuid[])
  to authenticated;

revoke all on function public.admin_list_financial_budget_items() from public, anon;
grant execute on function public.admin_list_financial_budget_items() to authenticated;

revoke all on function public.admin_save_financial_budget_item(uuid, uuid, uuid, text, numeric, text, text, text, text, integer, boolean)
  from public, anon;
grant execute on function public.admin_save_financial_budget_item(uuid, uuid, uuid, text, numeric, text, text, text, text, integer, boolean)
  to authenticated;

revoke all on function public.admin_delete_financial_budget_item(uuid) from public, anon;
grant execute on function public.admin_delete_financial_budget_item(uuid) to authenticated;

revoke all on function public.admin_list_financial_expenses() from public, anon;
grant execute on function public.admin_list_financial_expenses() to authenticated;

revoke all on function public.admin_save_financial_expense(uuid, uuid, uuid, text, uuid, uuid, text, text, text, numeric, text, text, date, text, text, boolean)
  from public, anon;
grant execute on function public.admin_save_financial_expense(uuid, uuid, uuid, text, uuid, uuid, text, text, text, numeric, text, text, date, text, text, boolean)
  to authenticated;

revoke all on function public.admin_delete_financial_expense(uuid) from public, anon;
grant execute on function public.admin_delete_financial_expense(uuid) to authenticated;

revoke all on function public.admin_list_financial_expense_payments() from public, anon;
grant execute on function public.admin_list_financial_expense_payments() to authenticated;

revoke all on function public.admin_save_financial_expense_payment(uuid, uuid, uuid, integer, text, numeric, date, date, text, text)
  from public, anon;
grant execute on function public.admin_save_financial_expense_payment(uuid, uuid, uuid, integer, text, numeric, date, date, text, text)
  to authenticated;

revoke all on function public.admin_delete_financial_expense_payment(uuid) from public, anon;
grant execute on function public.admin_delete_financial_expense_payment(uuid) to authenticated;

revoke all on function public.admin_get_financial_summary(text) from public, anon;
grant execute on function public.admin_get_financial_summary(text) to authenticated;

commit;
