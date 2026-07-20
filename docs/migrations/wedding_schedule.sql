begin;

create table if not exists public.wedding_schedule_sections (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  location_name text not null,
  address text null,
  description text null,
  display_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint wedding_schedule_sections_title_length_check
    check (char_length(btrim(title)) between 1 and 120),
  constraint wedding_schedule_sections_location_name_length_check
    check (char_length(btrim(location_name)) between 1 and 160),
  constraint wedding_schedule_sections_address_length_check
    check (address is null or char_length(address) <= 260),
  constraint wedding_schedule_sections_description_length_check
    check (description is null or char_length(description) <= 700)
);

create table if not exists public.wedding_schedule_activities (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.wedding_schedule_sections(id) on delete cascade,
  title text not null,
  activity_type text not null default 'moment',
  time_mode text not null default 'scheduled',
  start_time time without time zone null,
  end_time time without time zone null,
  description text null,
  display_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint wedding_schedule_activities_title_length_check
    check (char_length(btrim(title)) between 1 and 140),
  constraint wedding_schedule_activities_type_check
    check (activity_type in ('moment', 'attraction', 'island', 'service', 'other')),
  constraint wedding_schedule_activities_time_mode_check
    check (time_mode in ('scheduled', 'period', 'available', 'tbd')),
  constraint wedding_schedule_activities_description_length_check
    check (description is null or char_length(description) <= 800),
  constraint wedding_schedule_activities_time_required_check
    check (
      (time_mode = 'scheduled' and start_time is not null)
      or (time_mode = 'period' and start_time is not null and end_time is not null)
      or (time_mode in ('available', 'tbd') and start_time is null and end_time is null)
    )
);

create index if not exists wedding_schedule_sections_public_order_idx
  on public.wedding_schedule_sections (is_visible, display_order, title);

create index if not exists wedding_schedule_sections_admin_order_idx
  on public.wedding_schedule_sections (display_order, title);

create index if not exists wedding_schedule_activities_section_order_idx
  on public.wedding_schedule_activities (section_id, is_visible, display_order, start_time, title);

create index if not exists wedding_schedule_activities_admin_order_idx
  on public.wedding_schedule_activities (section_id, display_order, start_time, title);

alter table public.wedding_schedule_sections enable row level security;
alter table public.wedding_schedule_activities enable row level security;

revoke all on table public.wedding_schedule_sections from anon, authenticated;
revoke all on table public.wedding_schedule_activities from anon, authenticated;
grant all on table public.wedding_schedule_sections to service_role;
grant all on table public.wedding_schedule_activities to service_role;

create or replace function public.touch_wedding_schedule_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_wedding_schedule_sections_updated_at
  on public.wedding_schedule_sections;
create trigger touch_wedding_schedule_sections_updated_at
  before update on public.wedding_schedule_sections
  for each row
  execute function public.touch_wedding_schedule_updated_at();

drop trigger if exists touch_wedding_schedule_activities_updated_at
  on public.wedding_schedule_activities;
create trigger touch_wedding_schedule_activities_updated_at
  before update on public.wedding_schedule_activities
  for each row
  execute function public.touch_wedding_schedule_updated_at();

create or replace function public.list_public_schedule()
returns table (
  section_id uuid,
  section_title text,
  location_name text,
  address text,
  section_description text,
  section_display_order integer,
  activity_id uuid,
  activity_title text,
  activity_type text,
  time_mode text,
  start_time time without time zone,
  end_time time without time zone,
  activity_description text,
  activity_display_order integer
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (select 1 from public.get_current_guest_profile()) then
    raise exception 'Guest access required.'
      using errcode = '42501';
  end if;

  return query
  select
    section.id,
    section.title,
    section.location_name,
    section.address,
    section.description,
    section.display_order,
    activity.id,
    activity.title,
    activity.activity_type,
    activity.time_mode,
    activity.start_time,
    activity.end_time,
    activity.description,
    activity.display_order
  from public.wedding_schedule_sections as section
  left join public.wedding_schedule_activities as activity
    on activity.section_id = section.id
   and activity.is_visible = true
  where section.is_visible = true
  order by
    section.display_order asc,
    section.title asc,
    activity.display_order asc nulls last,
    activity.start_time asc nulls last,
    activity.title asc nulls last;
end;
$$;

create or replace function public.admin_list_schedule_sections()
returns table (
  id uuid,
  title text,
  location_name text,
  address text,
  description text,
  display_order integer,
  is_visible boolean,
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
    section.id,
    section.title,
    section.location_name,
    section.address,
    section.description,
    section.display_order,
    section.is_visible,
    section.created_at,
    section.updated_at
  from public.wedding_schedule_sections as section
  order by section.display_order asc, section.title asc;
end;
$$;

create or replace function public.admin_list_schedule_activities()
returns table (
  id uuid,
  section_id uuid,
  section_title text,
  title text,
  activity_type text,
  time_mode text,
  start_time time without time zone,
  end_time time without time zone,
  description text,
  display_order integer,
  is_visible boolean,
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
    activity.id,
    activity.section_id,
    section.title,
    activity.title,
    activity.activity_type,
    activity.time_mode,
    activity.start_time,
    activity.end_time,
    activity.description,
    activity.display_order,
    activity.is_visible,
    activity.created_at,
    activity.updated_at
  from public.wedding_schedule_activities as activity
  join public.wedding_schedule_sections as section
    on section.id = activity.section_id
  order by section.display_order asc, activity.display_order asc, activity.start_time asc nulls last, activity.title asc;
end;
$$;

create or replace function public.admin_save_schedule_section(
  target_section_id uuid,
  submitted_title text,
  submitted_location_name text,
  submitted_address text default null,
  submitted_description text default null,
  submitted_display_order integer default 0,
  submitted_is_visible boolean default true
)
returns setof public.wedding_schedule_sections
language plpgsql
security definer
set search_path = ''
as $$
declare
  saved_section public.wedding_schedule_sections%rowtype;
  safe_title text := nullif(btrim(submitted_title), '');
  safe_location_name text := nullif(btrim(submitted_location_name), '');
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.'
      using errcode = '42501';
  end if;

  if safe_title is null then
    raise exception 'Schedule section title is required.'
      using errcode = '22023';
  end if;

  if safe_location_name is null then
    raise exception 'Schedule section location is required.'
      using errcode = '22023';
  end if;

  if target_section_id is null then
    insert into public.wedding_schedule_sections (
      title,
      location_name,
      address,
      description,
      display_order,
      is_visible
    )
    values (
      safe_title,
      safe_location_name,
      nullif(btrim(submitted_address), ''),
      nullif(btrim(submitted_description), ''),
      coalesce(submitted_display_order, 0),
      coalesce(submitted_is_visible, true)
    )
    returning * into saved_section;
  else
    update public.wedding_schedule_sections
    set
      title = safe_title,
      location_name = safe_location_name,
      address = nullif(btrim(submitted_address), ''),
      description = nullif(btrim(submitted_description), ''),
      display_order = coalesce(submitted_display_order, 0),
      is_visible = coalesce(submitted_is_visible, true)
    where wedding_schedule_sections.id = target_section_id
    returning * into saved_section;

    if saved_section.id is null then
      raise exception 'Schedule section not found.'
        using errcode = 'P0002';
    end if;
  end if;

  return next saved_section;
end;
$$;

create or replace function public.admin_save_schedule_activity(
  target_activity_id uuid,
  submitted_section_id uuid,
  submitted_title text,
  submitted_activity_type text default 'moment',
  submitted_time_mode text default 'scheduled',
  submitted_start_time time without time zone default null,
  submitted_end_time time without time zone default null,
  submitted_description text default null,
  submitted_display_order integer default 0,
  submitted_is_visible boolean default true
)
returns setof public.wedding_schedule_activities
language plpgsql
security definer
set search_path = ''
as $$
declare
  saved_activity public.wedding_schedule_activities%rowtype;
  safe_title text := nullif(btrim(submitted_title), '');
  safe_activity_type text := coalesce(nullif(btrim(submitted_activity_type), ''), 'moment');
  safe_time_mode text := coalesce(nullif(btrim(submitted_time_mode), ''), 'scheduled');
  safe_start_time time without time zone := submitted_start_time;
  safe_end_time time without time zone := submitted_end_time;
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.'
      using errcode = '42501';
  end if;

  if safe_title is null then
    raise exception 'Schedule activity title is required.'
      using errcode = '22023';
  end if;

  if not exists (
    select 1
    from public.wedding_schedule_sections
    where id = submitted_section_id
  ) then
    raise exception 'Schedule section not found.'
      using errcode = 'P0002';
  end if;

  if safe_time_mode in ('available', 'tbd') then
    safe_start_time := null;
    safe_end_time := null;
  end if;

  if target_activity_id is null then
    insert into public.wedding_schedule_activities (
      section_id,
      title,
      activity_type,
      time_mode,
      start_time,
      end_time,
      description,
      display_order,
      is_visible
    )
    values (
      submitted_section_id,
      safe_title,
      safe_activity_type,
      safe_time_mode,
      safe_start_time,
      safe_end_time,
      nullif(btrim(submitted_description), ''),
      coalesce(submitted_display_order, 0),
      coalesce(submitted_is_visible, true)
    )
    returning * into saved_activity;
  else
    update public.wedding_schedule_activities
    set
      section_id = submitted_section_id,
      title = safe_title,
      activity_type = safe_activity_type,
      time_mode = safe_time_mode,
      start_time = safe_start_time,
      end_time = safe_end_time,
      description = nullif(btrim(submitted_description), ''),
      display_order = coalesce(submitted_display_order, 0),
      is_visible = coalesce(submitted_is_visible, true)
    where wedding_schedule_activities.id = target_activity_id
    returning * into saved_activity;

    if saved_activity.id is null then
      raise exception 'Schedule activity not found.'
        using errcode = 'P0002';
    end if;
  end if;

  return next saved_activity;
end;
$$;

create or replace function public.admin_set_schedule_section_visible(
  target_section_id uuid,
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

  update public.wedding_schedule_sections
  set is_visible = coalesce(submitted_is_visible, false)
  where id = target_section_id;

  if not found then
    raise exception 'Schedule section not found.'
      using errcode = 'P0002';
  end if;

  return true;
end;
$$;

create or replace function public.admin_set_schedule_activity_visible(
  target_activity_id uuid,
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

  update public.wedding_schedule_activities
  set is_visible = coalesce(submitted_is_visible, false)
  where id = target_activity_id;

  if not found then
    raise exception 'Schedule activity not found.'
      using errcode = 'P0002';
  end if;

  return true;
end;
$$;

create or replace function public.admin_reorder_schedule_sections(submitted_section_ids uuid[])
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

  if submitted_section_ids is null or cardinality(submitted_section_ids) = 0 then
    return true;
  end if;

  select count(*), count(distinct section_id)
    into submitted_count, existing_count
  from unnest(submitted_section_ids) as submitted(section_id);

  if submitted_count <> existing_count then
    raise exception 'Schedule section order list contains duplicates.'
      using errcode = '22023';
  end if;

  select count(*)
    into existing_count
  from public.wedding_schedule_sections
  where id = any(submitted_section_ids);

  if existing_count <> submitted_count then
    raise exception 'Schedule section order list contains unknown sections.'
      using errcode = 'P0002';
  end if;

  with ordered_sections as (
    select
      section_id,
      row_number() over (order by ordinality)::integer as next_display_order
    from unnest(submitted_section_ids) with ordinality as ordered(section_id, ordinality)
  )
  update public.wedding_schedule_sections as section
  set display_order = ordered_sections.next_display_order
  from ordered_sections
  where section.id = ordered_sections.section_id;

  return true;
end;
$$;

create or replace function public.admin_reorder_schedule_activities(
  target_section_id uuid,
  submitted_activity_ids uuid[]
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
    raise exception 'Administrator access required.'
      using errcode = '42501';
  end if;

  if submitted_activity_ids is null or cardinality(submitted_activity_ids) = 0 then
    return true;
  end if;

  select count(*), count(distinct activity_id)
    into submitted_count, existing_count
  from unnest(submitted_activity_ids) as submitted(activity_id);

  if submitted_count <> existing_count then
    raise exception 'Schedule activity order list contains duplicates.'
      using errcode = '22023';
  end if;

  select count(*)
    into existing_count
  from public.wedding_schedule_activities
  where section_id = target_section_id
    and id = any(submitted_activity_ids);

  if existing_count <> submitted_count then
    raise exception 'Schedule activity order list contains unknown activities.'
      using errcode = 'P0002';
  end if;

  with ordered_activities as (
    select
      activity_id,
      row_number() over (order by ordinality)::integer as next_display_order
    from unnest(submitted_activity_ids) with ordinality as ordered(activity_id, ordinality)
  )
  update public.wedding_schedule_activities as activity
  set display_order = ordered_activities.next_display_order
  from ordered_activities
  where activity.id = ordered_activities.activity_id
    and activity.section_id = target_section_id;

  return true;
end;
$$;

create or replace function public.admin_delete_schedule_section(target_section_id uuid)
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

  delete from public.wedding_schedule_sections
  where id = target_section_id;

  if not found then
    raise exception 'Schedule section not found.'
      using errcode = 'P0002';
  end if;

  return true;
end;
$$;

create or replace function public.admin_delete_schedule_activity(target_activity_id uuid)
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

  delete from public.wedding_schedule_activities
  where id = target_activity_id;

  if not found then
    raise exception 'Schedule activity not found.'
      using errcode = 'P0002';
  end if;

  return true;
end;
$$;

comment on table public.wedding_schedule_sections is
  'Program schedule sections such as ceremony and reception.';

comment on table public.wedding_schedule_activities is
  'Program schedule activities that belong to schedule sections.';

revoke all on function public.touch_wedding_schedule_updated_at()
  from public, anon, authenticated;

revoke all on function public.list_public_schedule() from public;
grant execute on function public.list_public_schedule() to authenticated;

revoke all on function public.admin_list_schedule_sections() from public, anon;
grant execute on function public.admin_list_schedule_sections() to authenticated;

revoke all on function public.admin_list_schedule_activities() from public, anon;
grant execute on function public.admin_list_schedule_activities() to authenticated;

revoke all on function public.admin_save_schedule_section(uuid, text, text, text, text, integer, boolean)
  from public, anon;
grant execute on function public.admin_save_schedule_section(uuid, text, text, text, text, integer, boolean)
  to authenticated;

revoke all on function public.admin_save_schedule_activity(uuid, uuid, text, text, text, time without time zone, time without time zone, text, integer, boolean)
  from public, anon;
grant execute on function public.admin_save_schedule_activity(uuid, uuid, text, text, text, time without time zone, time without time zone, text, integer, boolean)
  to authenticated;

revoke all on function public.admin_set_schedule_section_visible(uuid, boolean)
  from public, anon;
grant execute on function public.admin_set_schedule_section_visible(uuid, boolean)
  to authenticated;

revoke all on function public.admin_set_schedule_activity_visible(uuid, boolean)
  from public, anon;
grant execute on function public.admin_set_schedule_activity_visible(uuid, boolean)
  to authenticated;

revoke all on function public.admin_reorder_schedule_sections(uuid[]) from public, anon;
grant execute on function public.admin_reorder_schedule_sections(uuid[]) to authenticated;

revoke all on function public.admin_reorder_schedule_activities(uuid, uuid[]) from public, anon;
grant execute on function public.admin_reorder_schedule_activities(uuid, uuid[]) to authenticated;

revoke all on function public.admin_delete_schedule_section(uuid) from public, anon;
grant execute on function public.admin_delete_schedule_section(uuid) to authenticated;

revoke all on function public.admin_delete_schedule_activity(uuid) from public, anon;
grant execute on function public.admin_delete_schedule_activity(uuid) to authenticated;

commit;
