-- ============================================================
-- Wedding table assignments
-- ============================================================

begin;

create table if not exists public.wedding_tables (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  capacity integer not null default 8,
  location text null,
  notes text null,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint wedding_tables_name_length_check
    check (char_length(btrim(name)) between 1 and 120),
  constraint wedding_tables_capacity_check
    check (capacity >= 0 and capacity <= 100),
  constraint wedding_tables_location_length_check
    check (location is null or char_length(location) <= 160),
  constraint wedding_tables_notes_length_check
    check (notes is null or char_length(notes) <= 600)
);

create table if not exists public.wedding_table_assignments (
  id uuid primary key default gen_random_uuid(),
  table_id uuid not null references public.wedding_tables(id) on delete cascade,
  guest_id uuid not null references public.guests(id) on delete cascade,
  notes text null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint wedding_table_assignments_guest_unique unique (guest_id),
  constraint wedding_table_assignments_notes_length_check
    check (notes is null or char_length(notes) <= 400)
);

create index if not exists wedding_tables_admin_order_idx
  on public.wedding_tables (is_active, display_order, name);

create index if not exists wedding_table_assignments_table_idx
  on public.wedding_table_assignments (table_id, guest_id);

alter table public.wedding_tables enable row level security;
alter table public.wedding_table_assignments enable row level security;

revoke all on table public.wedding_tables from anon, authenticated;
revoke all on table public.wedding_table_assignments from anon, authenticated;
grant all on table public.wedding_tables to service_role;
grant all on table public.wedding_table_assignments to service_role;

create or replace function public.touch_wedding_table_updated_at()
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

drop trigger if exists touch_wedding_table_updated_at
  on public.wedding_tables;

create trigger touch_wedding_table_updated_at
  before update on public.wedding_tables
  for each row
  execute function public.touch_wedding_table_updated_at();

drop trigger if exists touch_wedding_table_assignment_updated_at
  on public.wedding_table_assignments;

create trigger touch_wedding_table_assignment_updated_at
  before update on public.wedding_table_assignments
  for each row
  execute function public.touch_wedding_table_updated_at();

create or replace function public.admin_list_wedding_tables()
returns table (
  id uuid,
  name text,
  capacity integer,
  location text,
  notes text,
  display_order integer,
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
    raise exception 'Administrator access required.'
      using errcode = '42501';
  end if;

  return query
  select
    table_item.id,
    table_item.name,
    table_item.capacity,
    table_item.location,
    table_item.notes,
    table_item.display_order,
    table_item.is_active,
    table_item.created_at,
    table_item.updated_at
  from public.wedding_tables as table_item
  order by table_item.display_order asc, table_item.name asc;
end;
$$;

create or replace function public.admin_list_wedding_table_assignments()
returns table (
  id uuid,
  table_id uuid,
  guest_id uuid,
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
    raise exception 'Administrator access required.'
      using errcode = '42501';
  end if;

  return query
  select
    assignment.id,
    assignment.table_id,
    assignment.guest_id,
    assignment.notes,
    assignment.created_at,
    assignment.updated_at
  from public.wedding_table_assignments as assignment
  order by assignment.created_at asc;
end;
$$;

create or replace function public.admin_save_wedding_table(
  target_table_id uuid,
  submitted_name text,
  submitted_capacity integer default 8,
  submitted_location text default null,
  submitted_notes text default null,
  submitted_display_order integer default 0,
  submitted_is_active boolean default true
)
returns public.wedding_tables
language plpgsql
security definer
set search_path = ''
as $$
declare
  saved_table public.wedding_tables%rowtype;
  safe_name text := nullif(btrim(submitted_name), '');
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.'
      using errcode = '42501';
  end if;

  if safe_name is null then
    raise exception 'Table name is required.'
      using errcode = '22023';
  end if;

  if coalesce(submitted_capacity, 0) < 0 then
    raise exception 'Table capacity cannot be negative.'
      using errcode = '22023';
  end if;

  if target_table_id is null then
    insert into public.wedding_tables (
      name,
      capacity,
      location,
      notes,
      display_order,
      is_active
    )
    values (
      safe_name,
      coalesce(submitted_capacity, 8),
      nullif(btrim(submitted_location), ''),
      nullif(btrim(submitted_notes), ''),
      coalesce(submitted_display_order, 0),
      coalesce(submitted_is_active, true)
    )
    returning * into saved_table;
  else
    update public.wedding_tables
    set
      name = safe_name,
      capacity = coalesce(submitted_capacity, 8),
      location = nullif(btrim(submitted_location), ''),
      notes = nullif(btrim(submitted_notes), ''),
      display_order = coalesce(submitted_display_order, 0),
      is_active = coalesce(submitted_is_active, true)
    where id = target_table_id
    returning * into saved_table;

    if saved_table.id is null then
      raise exception 'Wedding table not found.'
        using errcode = 'P0002';
    end if;
  end if;

  return saved_table;
end;
$$;

create or replace function public.admin_assign_guest_to_table(
  target_table_id uuid,
  target_guest_id uuid,
  submitted_notes text default null
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.'
      using errcode = '42501';
  end if;

  if not exists (
    select 1 from public.wedding_tables
    where id = target_table_id
  ) then
    raise exception 'Wedding table not found.'
      using errcode = 'P0002';
  end if;

  if not exists (
    select 1 from public.guests
    where id = target_guest_id
  ) then
    raise exception 'Guest not found.'
      using errcode = 'P0002';
  end if;

  insert into public.wedding_table_assignments (
    table_id,
    guest_id,
    notes
  )
  values (
    target_table_id,
    target_guest_id,
    nullif(btrim(submitted_notes), '')
  )
  on conflict (guest_id) do update
  set
    table_id = excluded.table_id,
    notes = excluded.notes;

  return true;
end;
$$;

create or replace function public.admin_remove_guest_from_table(target_guest_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.'
      using errcode = '42501';
  end if;

  delete from public.wedding_table_assignments
  where guest_id = target_guest_id;

  return true;
end;
$$;

create or replace function public.admin_set_wedding_table_active(
  target_table_id uuid,
  submitted_is_active boolean
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.'
      using errcode = '42501';
  end if;

  update public.wedding_tables
  set is_active = coalesce(submitted_is_active, true)
  where id = target_table_id;

  if not found then
    raise exception 'Wedding table not found.'
      using errcode = 'P0002';
  end if;

  return true;
end;
$$;

create or replace function public.admin_reorder_wedding_tables(submitted_table_ids uuid[])
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
    raise exception 'Administrator access required.'
      using errcode = '42501';
  end if;

  if submitted_table_ids is null or cardinality(submitted_table_ids) = 0 then
    return true;
  end if;

  select count(*), count(distinct table_id)
    into submitted_count, existing_count
  from unnest(submitted_table_ids) as submitted(table_id);

  if submitted_count <> existing_count then
    raise exception 'Table order list contains duplicate tables.'
      using errcode = '22023';
  end if;

  select count(*)
    into existing_count
  from public.wedding_tables
  where id = any(submitted_table_ids);

  if existing_count <> submitted_count then
    raise exception 'Table order list contains unknown tables.'
      using errcode = 'P0002';
  end if;

  with ordered_tables as (
    select
      table_id,
      row_number() over (order by ordinality)::integer as next_display_order
    from unnest(submitted_table_ids) with ordinality as ordered(table_id, ordinality)
  )
  update public.wedding_tables as table_item
  set display_order = ordered_tables.next_display_order
  from ordered_tables
  where table_item.id = ordered_tables.table_id;

  return true;
end;
$$;

create or replace function public.admin_delete_wedding_table(target_table_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.'
      using errcode = '42501';
  end if;

  delete from public.wedding_tables
  where id = target_table_id;

  if not found then
    raise exception 'Wedding table not found.'
      using errcode = 'P0002';
  end if;

  return true;
end;
$$;

comment on table public.wedding_tables is
  'Wedding reception tables managed by administrators.';

comment on table public.wedding_table_assignments is
  'Administrative assignment of guest invitations to wedding tables.';

revoke all on function public.touch_wedding_table_updated_at()
  from public, anon, authenticated;

revoke all on function public.admin_list_wedding_tables() from public, anon;
grant execute on function public.admin_list_wedding_tables() to authenticated;

revoke all on function public.admin_list_wedding_table_assignments() from public, anon;
grant execute on function public.admin_list_wedding_table_assignments() to authenticated;

revoke all on function public.admin_save_wedding_table(uuid, text, integer, text, text, integer, boolean)
  from public, anon;
grant execute on function public.admin_save_wedding_table(uuid, text, integer, text, text, integer, boolean)
  to authenticated;

revoke all on function public.admin_assign_guest_to_table(uuid, uuid, text)
  from public, anon;
grant execute on function public.admin_assign_guest_to_table(uuid, uuid, text)
  to authenticated;

revoke all on function public.admin_remove_guest_from_table(uuid) from public, anon;
grant execute on function public.admin_remove_guest_from_table(uuid) to authenticated;

revoke all on function public.admin_set_wedding_table_active(uuid, boolean)
  from public, anon;
grant execute on function public.admin_set_wedding_table_active(uuid, boolean)
  to authenticated;

revoke all on function public.admin_reorder_wedding_tables(uuid[]) from public, anon;
grant execute on function public.admin_reorder_wedding_tables(uuid[]) to authenticated;

revoke all on function public.admin_delete_wedding_table(uuid) from public, anon;
grant execute on function public.admin_delete_wedding_table(uuid) to authenticated;

commit;
