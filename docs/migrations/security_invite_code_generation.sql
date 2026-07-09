-- ============================================================
-- Secure server-side generation of guest invitation codes
-- ============================================================
--
-- Run this script once in an existing secured Supabase project. Clean
-- rebuilds also execute this file as part of the documented sequence.

begin;

create extension if not exists pgcrypto with schema extensions;

drop function if exists public.create_guest_with_invite_code(
  text,
  text,
  jsonb,
  integer
);

drop function if exists public.create_guest_with_invite_code(
  text,
  text,
  jsonb,
  integer,
  boolean
);

create or replace function public.create_guest_with_invite_code(
  p_name text,
  p_invite_type text default 'individual',
  p_couple_members jsonb default null,
  p_max_guests integer default 0,
  p_invite_sent boolean default false
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
        active,
        access_count,
        invite_type,
        couple_members
      )
      values (
        p_name,
        generated_code,
        p_max_guests,
        false,
        p_invite_sent,
        true,
        0,
        p_invite_type,
        p_couple_members
      )
      returning * into created_guest;

      return created_guest;
    exception
      when unique_violation then
        -- Generate another code if the unique invitation code already exists.
        null;
    end;
  end loop;

  raise exception 'Unable to generate a unique invitation code.'
    using errcode = 'P0001';
end;
$$;

comment on function public.create_guest_with_invite_code(
  text,
  text,
  jsonb,
  integer,
  boolean
) is
  'Creates a guest as an authenticated administrator and generates a secure invitation code.';

revoke all on function public.create_guest_with_invite_code(
  text,
  text,
  jsonb,
  integer,
  boolean
) from public;

revoke all on function public.create_guest_with_invite_code(
  text,
  text,
  jsonb,
  integer,
  boolean
) from anon;

grant execute on function public.create_guest_with_invite_code(
  text,
  text,
  jsonb,
  integer,
  boolean
) to authenticated;

-- New guests must be created through the RPC. Existing guests can still be
-- selected, updated and deleted by the administrative RLS policy.
revoke insert on table public.guests from authenticated;

commit;
