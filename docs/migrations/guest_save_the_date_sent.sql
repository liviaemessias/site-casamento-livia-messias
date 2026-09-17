-- ============================================================
-- Guest Save the Date sent flag
-- ============================================================

begin;

alter table public.guests
  add column if not exists save_the_date_sent boolean not null default false;

comment on column public.guests.save_the_date_sent is
  'Indica se o Save the Date já foi enviado ao convidado.';

drop function if exists public.create_guest_with_invite_code(
  text,
  text,
  jsonb,
  integer,
  boolean,
  text
);

drop function if exists public.create_guest_with_invite_code(
  text,
  text,
  jsonb,
  integer,
  boolean,
  boolean,
  text
);

create or replace function public.create_guest_with_invite_code(
  p_name text,
  p_invite_type text default 'individual',
  p_couple_members jsonb default null,
  p_max_guests integer default 0,
  p_invite_sent boolean default false,
  p_save_the_date_sent boolean default false,
  p_guest_side text default 'couple'
)
returns public.guests
language plpgsql
security definer
set search_path = ''
as $$
declare
  invite_alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  invite_bytes bytea;
  generated_code text;
  created_guest public.guests%rowtype;
  attempt integer;
begin
  if not exists (
    select 1
    from public.admin_users as administrator
    where administrator.user_id = (select auth.uid())
      and administrator.active is true
  ) then
    raise exception 'Administrator access required.'
      using errcode = '42501';
  end if;

  p_name := nullif(btrim(p_name), '');
  p_invite_type := lower(nullif(btrim(p_invite_type), ''));
  p_max_guests := coalesce(p_max_guests, 0);
  p_invite_sent := coalesce(p_invite_sent, false);
  p_save_the_date_sent := coalesce(p_save_the_date_sent, false);
  p_guest_side := lower(coalesce(nullif(btrim(p_guest_side), ''), 'couple'));

  if p_name is null then
    raise exception 'Guest name is required.'
      using errcode = '22023';
  end if;

  if p_invite_type is null
    or p_invite_type not in ('individual', 'couple')
  then
    raise exception 'Invalid invitation type.'
      using errcode = '22023';
  end if;

  if p_max_guests < 0 then
    raise exception 'Maximum companions cannot be negative.'
      using errcode = '22023';
  end if;

  if p_guest_side not in ('bride', 'groom', 'couple') then
    raise exception 'Invalid guest side.'
      using errcode = '22023';
  end if;

  if p_invite_type = 'couple' then
    if p_couple_members is null
      or jsonb_typeof(p_couple_members) <> 'array'
      or jsonb_array_length(p_couple_members) <> 2
      or exists (
        select 1
        from jsonb_array_elements(p_couple_members) as member
        where nullif(btrim(member ->> 'name'), '') is null
      )
    then
      raise exception 'A couple invitation requires two member names.'
        using errcode = '22023';
    end if;
  else
    p_couple_members := null;
  end if;

  for attempt in 1..5 loop
    invite_bytes := extensions.gen_random_bytes(8);

    select string_agg(
      substr(
        invite_alphabet,
        (get_byte(invite_bytes, byte_index) % 32) + 1,
        1
      ),
      '' order by byte_index
    )
    into generated_code
    from generate_series(0, 7) as byte_index;

    begin
      insert into public.guests (
        name,
        invite_code,
        max_guests,
        confirmed,
        invite_sent,
        save_the_date_sent,
        active,
        access_count,
        invite_type,
        couple_members,
        guest_side
      )
      values (
        p_name,
        generated_code,
        p_max_guests,
        false,
        p_invite_sent,
        p_save_the_date_sent,
        true,
        0,
        p_invite_type,
        p_couple_members,
        p_guest_side
      )
      returning * into created_guest;

      return created_guest;
    exception
      when unique_violation then
        null;
    end;
  end loop;

  raise exception 'Unable to generate a unique invitation code.'
    using errcode = 'P0001';
end;
$$;

drop function if exists public.admin_update_guest(
  uuid,
  text,
  text,
  jsonb,
  integer,
  boolean,
  text
);

drop function if exists public.admin_update_guest(
  uuid,
  text,
  text,
  jsonb,
  integer,
  boolean,
  boolean,
  text
);

drop function if exists public.admin_set_guest_save_the_date_sent(uuid, boolean);

create or replace function public.admin_update_guest(
  target_guest_id uuid,
  p_name text,
  p_invite_type text,
  p_couple_members jsonb,
  p_max_guests integer,
  p_invite_sent boolean,
  p_save_the_date_sent boolean,
  p_guest_side text default 'couple'
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  updated_count integer;
begin
  if not exists (
    select 1
    from public.admin_users as administrator
    where administrator.user_id = (select auth.uid())
      and administrator.active is true
  ) then
    raise exception 'Administrator access required.'
      using errcode = '42501';
  end if;

  p_name := nullif(btrim(p_name), '');
  p_invite_type := lower(nullif(btrim(p_invite_type), ''));
  p_max_guests := coalesce(p_max_guests, 0);
  p_invite_sent := coalesce(p_invite_sent, false);
  p_save_the_date_sent := coalesce(p_save_the_date_sent, false);
  p_guest_side := lower(coalesce(nullif(btrim(p_guest_side), ''), 'couple'));

  if p_name is null
    or p_invite_type is null
    or p_invite_type not in ('individual', 'couple')
    or p_guest_side not in ('bride', 'groom', 'couple')
    or p_max_guests < 0
  then
    return false;
  end if;

  if p_invite_type = 'couple' then
    if p_couple_members is null
      or jsonb_typeof(p_couple_members) <> 'array'
      or jsonb_array_length(p_couple_members) <> 2
      or exists (
        select 1
        from jsonb_array_elements(p_couple_members) as member
        where nullif(btrim(member ->> 'name'), '') is null
      )
    then
      return false;
    end if;
  else
    p_couple_members := null;
  end if;

  update public.guests
  set
    name = p_name,
    invite_type = p_invite_type,
    couple_members = p_couple_members,
    max_guests = p_max_guests,
    invite_sent = p_invite_sent,
    save_the_date_sent = p_save_the_date_sent,
    guest_side = p_guest_side
  where id = target_guest_id;

  get diagnostics updated_count = row_count;
  return updated_count = 1;
end;
$$;

create or replace function public.admin_set_guest_save_the_date_sent(
  target_guest_id uuid,
  next_save_the_date_sent boolean
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  updated_count integer;
begin
  if not exists (
    select 1
    from public.admin_users as administrator
    where administrator.user_id = (select auth.uid())
      and administrator.active is true
  ) then
    raise exception 'Administrator access required.'
      using errcode = '42501';
  end if;

  if next_save_the_date_sent is null then
    return false;
  end if;

  update public.guests
  set save_the_date_sent = next_save_the_date_sent
  where id = target_guest_id;

  get diagnostics updated_count = row_count;
  return updated_count = 1;
end;
$$;

comment on function public.create_guest_with_invite_code(
  text,
  text,
  jsonb,
  integer,
  boolean,
  boolean,
  text
) is
  'Creates a guest as an authenticated administrator and generates a secure invitation code.';

comment on function public.admin_update_guest(
  uuid,
  text,
  text,
  jsonb,
  integer,
  boolean,
  boolean,
  text
) is
  'Validates and updates a guest without exposing direct table writes.';

comment on function public.admin_set_guest_save_the_date_sent(uuid, boolean) is
  'Marks whether a guest Save the Date has been sent.';

revoke all on function public.create_guest_with_invite_code(
  text,
  text,
  jsonb,
  integer,
  boolean,
  boolean,
  text
) from public, anon;

revoke all on function public.admin_update_guest(
  uuid,
  text,
  text,
  jsonb,
  integer,
  boolean,
  boolean,
  text
) from public, anon;

revoke all on function public.admin_set_guest_save_the_date_sent(uuid, boolean)
  from public, anon;

grant execute on function public.create_guest_with_invite_code(
  text,
  text,
  jsonb,
  integer,
  boolean,
  boolean,
  text
) to authenticated;

grant execute on function public.admin_update_guest(
  uuid,
  text,
  text,
  jsonb,
  integer,
  boolean,
  boolean,
  text
) to authenticated;

grant execute on function public.admin_set_guest_save_the_date_sent(uuid, boolean)
  to authenticated;

revoke insert, update, delete on table public.guests from authenticated;

commit;
