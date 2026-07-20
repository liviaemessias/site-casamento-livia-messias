-- ============================================================
-- Wedding vendors
-- ============================================================

begin;

create table if not exists public.wedding_vendors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  responsible_names text null,
  description text null,
  image_url text null,
  instagram_url text null,
  website_url text null,
  whatsapp_number text null,
  display_order integer not null default 0,
  is_visible boolean not null default true,
  is_featured boolean not null default false,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint wedding_vendors_name_length_check
    check (char_length(btrim(name)) between 1 and 160),
  constraint wedding_vendors_category_length_check
    check (char_length(btrim(category)) between 1 and 120),
  constraint wedding_vendors_responsible_names_length_check
    check (responsible_names is null or char_length(responsible_names) <= 240),
  constraint wedding_vendors_description_length_check
    check (description is null or char_length(description) <= 800),
  constraint wedding_vendors_image_url_length_check
    check (image_url is null or char_length(image_url) <= 1000),
  constraint wedding_vendors_instagram_url_length_check
    check (instagram_url is null or char_length(instagram_url) <= 1000),
  constraint wedding_vendors_website_url_length_check
    check (website_url is null or char_length(website_url) <= 1000),
  constraint wedding_vendors_whatsapp_number_length_check
    check (whatsapp_number is null or char_length(whatsapp_number) <= 30)
);

create index if not exists wedding_vendors_public_order_idx
  on public.wedding_vendors (is_visible, display_order, category, name);

create index if not exists wedding_vendors_admin_order_idx
  on public.wedding_vendors (display_order, category, name);

alter table public.wedding_vendors enable row level security;

revoke all on table public.wedding_vendors from anon, authenticated;
grant all on table public.wedding_vendors to service_role;

create or replace function public.touch_wedding_vendor_updated_at()
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

drop trigger if exists touch_wedding_vendor_updated_at
  on public.wedding_vendors;

create trigger touch_wedding_vendor_updated_at
  before update on public.wedding_vendors
  for each row
  execute function public.touch_wedding_vendor_updated_at();

create or replace function public.list_public_vendors()
returns table (
  id uuid,
  name text,
  category text,
  responsible_names text,
  description text,
  image_url text,
  instagram_url text,
  website_url text,
  whatsapp_number text,
  display_order integer,
  is_featured boolean
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  return query
  select
    vendor.id,
    vendor.name,
    vendor.category,
    vendor.responsible_names,
    vendor.description,
    vendor.image_url,
    vendor.instagram_url,
    vendor.website_url,
    vendor.whatsapp_number,
    vendor.display_order,
    vendor.is_featured
  from public.wedding_vendors as vendor
  where vendor.is_visible = true
  order by vendor.is_featured desc, vendor.display_order asc, vendor.category asc, vendor.name asc;
end;
$$;

create or replace function public.admin_list_vendors()
returns table (
  id uuid,
  name text,
  category text,
  responsible_names text,
  description text,
  image_url text,
  instagram_url text,
  website_url text,
  whatsapp_number text,
  display_order integer,
  is_visible boolean,
  is_featured boolean,
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
    vendor.id,
    vendor.name,
    vendor.category,
    vendor.responsible_names,
    vendor.description,
    vendor.image_url,
    vendor.instagram_url,
    vendor.website_url,
    vendor.whatsapp_number,
    vendor.display_order,
    vendor.is_visible,
    vendor.is_featured,
    vendor.created_at,
    vendor.updated_at
  from public.wedding_vendors as vendor
  order by vendor.display_order asc, vendor.category asc, vendor.name asc;
end;
$$;

create or replace function public.admin_save_vendor(
  target_vendor_id uuid,
  submitted_name text,
  submitted_category text,
  submitted_responsible_names text default null,
  submitted_description text default null,
  submitted_image_url text default null,
  submitted_instagram_url text default null,
  submitted_website_url text default null,
  submitted_whatsapp_number text default null,
  submitted_display_order integer default 0,
  submitted_is_visible boolean default true,
  submitted_is_featured boolean default false
)
returns table (
  id uuid,
  name text,
  category text,
  responsible_names text,
  description text,
  image_url text,
  instagram_url text,
  website_url text,
  whatsapp_number text,
  display_order integer,
  is_visible boolean,
  is_featured boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  saved_vendor public.wedding_vendors%rowtype;
  safe_name text := nullif(btrim(submitted_name), '');
  safe_category text := nullif(btrim(submitted_category), '');
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.'
      using errcode = '42501';
  end if;

  if safe_name is null then
    raise exception 'Vendor name is required.'
      using errcode = '22023';
  end if;

  if safe_category is null then
    raise exception 'Vendor category is required.'
      using errcode = '22023';
  end if;

  if target_vendor_id is null then
    insert into public.wedding_vendors (
      name,
      category,
      responsible_names,
      description,
      image_url,
      instagram_url,
      website_url,
      whatsapp_number,
      display_order,
      is_visible,
      is_featured
    )
    values (
      safe_name,
      safe_category,
      nullif(btrim(submitted_responsible_names), ''),
      nullif(btrim(submitted_description), ''),
      nullif(btrim(submitted_image_url), ''),
      nullif(btrim(submitted_instagram_url), ''),
      nullif(btrim(submitted_website_url), ''),
      nullif(btrim(submitted_whatsapp_number), ''),
      coalesce(submitted_display_order, 0),
      coalesce(submitted_is_visible, true),
      coalesce(submitted_is_featured, false)
    )
    returning * into saved_vendor;
  else
    update public.wedding_vendors
    set
      name = safe_name,
      category = safe_category,
      responsible_names = nullif(btrim(submitted_responsible_names), ''),
      description = nullif(btrim(submitted_description), ''),
      image_url = nullif(btrim(submitted_image_url), ''),
      instagram_url = nullif(btrim(submitted_instagram_url), ''),
      website_url = nullif(btrim(submitted_website_url), ''),
      whatsapp_number = nullif(btrim(submitted_whatsapp_number), ''),
      display_order = coalesce(submitted_display_order, 0),
      is_visible = coalesce(submitted_is_visible, true),
      is_featured = coalesce(submitted_is_featured, false)
    where wedding_vendors.id = target_vendor_id
    returning * into saved_vendor;

    if saved_vendor.id is null then
      raise exception 'Vendor not found.'
        using errcode = 'P0002';
    end if;
  end if;

  return query
  select
    saved_vendor.id,
    saved_vendor.name,
    saved_vendor.category,
    saved_vendor.responsible_names,
    saved_vendor.description,
    saved_vendor.image_url,
    saved_vendor.instagram_url,
    saved_vendor.website_url,
    saved_vendor.whatsapp_number,
    saved_vendor.display_order,
    saved_vendor.is_visible,
    saved_vendor.is_featured,
    saved_vendor.created_at,
    saved_vendor.updated_at;
end;
$$;

create or replace function public.admin_set_vendor_visible(
  target_vendor_id uuid,
  submitted_is_visible boolean
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

  update public.wedding_vendors
  set is_visible = coalesce(submitted_is_visible, false)
  where id = target_vendor_id;

  if not found then
    raise exception 'Vendor not found.'
      using errcode = 'P0002';
  end if;

  return true;
end;
$$;

create or replace function public.admin_reorder_vendors(submitted_vendor_ids uuid[])
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

  if submitted_vendor_ids is null or cardinality(submitted_vendor_ids) = 0 then
    return true;
  end if;

  select count(*), count(distinct vendor_id)
    into submitted_count, existing_count
  from unnest(submitted_vendor_ids) as submitted(vendor_id);

  if submitted_count <> existing_count then
    raise exception 'Vendor order list contains duplicate vendors.'
      using errcode = '22023';
  end if;

  select count(*)
    into existing_count
  from public.wedding_vendors
  where id = any(submitted_vendor_ids);

  if existing_count <> submitted_count then
    raise exception 'Vendor order list contains unknown vendors.'
      using errcode = 'P0002';
  end if;

  with ordered_vendors as (
    select
      vendor_id,
      row_number() over (order by ordinality)::integer as next_display_order
    from unnest(submitted_vendor_ids) with ordinality as ordered(vendor_id, ordinality)
  )
  update public.wedding_vendors as vendor
  set display_order = ordered_vendors.next_display_order
  from ordered_vendors
  where vendor.id = ordered_vendors.vendor_id;

  return true;
end;
$$;

create or replace function public.admin_delete_vendor(target_vendor_id uuid)
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

  delete from public.wedding_vendors
  where id = target_vendor_id;

  if not found then
    raise exception 'Vendor not found.'
      using errcode = 'P0002';
  end if;

  return true;
end;
$$;

comment on table public.wedding_vendors is
  'Public wedding vendors displayed to guests, managed by administrators.';

comment on function public.list_public_vendors() is
  'Returns visible wedding vendors for public display.';

comment on function public.admin_list_vendors() is
  'Returns all wedding vendors for authenticated administrators.';

comment on function public.admin_save_vendor(
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  integer,
  boolean,
  boolean
) is
  'Creates or updates a wedding vendor for authenticated administrators.';

comment on function public.admin_reorder_vendors(uuid[]) is
  'Updates wedding vendor display order in a single authenticated administrator operation.';

revoke all on function public.touch_wedding_vendor_updated_at() from public, anon, authenticated;

revoke all on function public.list_public_vendors() from public;
grant execute on function public.list_public_vendors() to anon, authenticated;

revoke all on function public.admin_list_vendors() from public, anon;
grant execute on function public.admin_list_vendors() to authenticated;

revoke all on function public.admin_save_vendor(
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  integer,
  boolean,
  boolean
) from public, anon;
grant execute on function public.admin_save_vendor(
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  integer,
  boolean,
  boolean
) to authenticated;

revoke all on function public.admin_set_vendor_visible(uuid, boolean)
  from public, anon;
grant execute on function public.admin_set_vendor_visible(uuid, boolean)
  to authenticated;

revoke all on function public.admin_reorder_vendors(uuid[]) from public, anon;
grant execute on function public.admin_reorder_vendors(uuid[]) to authenticated;

revoke all on function public.admin_delete_vendor(uuid) from public, anon;
grant execute on function public.admin_delete_vendor(uuid) to authenticated;

commit;
