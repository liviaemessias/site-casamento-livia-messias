-- ============================================================
-- Secure administrative guest operations
-- ============================================================

begin;

drop function if exists public.admin_update_guest(
  uuid,
  text,
  text,
  jsonb,
  integer
);

drop function if exists public.admin_update_guest(
  uuid,
  text,
  text,
  jsonb,
  integer,
  boolean
);
drop function if exists public.admin_set_guest_invite_sent(uuid, boolean);

create or replace function public.admin_update_guest(
  target_guest_id uuid,
  p_name text,
  p_invite_type text,
  p_couple_members jsonb,
  p_max_guests integer,
  p_invite_sent boolean
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

  if p_name is null
    or p_invite_type is null
    or p_invite_type not in ('individual', 'couple')
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
    invite_sent = p_invite_sent
  where id = target_guest_id;

  get diagnostics updated_count = row_count;
  return updated_count = 1;
end;
$$;

create or replace function public.admin_set_guest_active(
  target_guest_id uuid,
  next_active boolean
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

  if next_active is null then
    return false;
  end if;

  if next_active is false and exists (
    select 1
    from public.admin_users as administrator
    where administrator.guest_id = target_guest_id
      and administrator.active is true
  ) then
    return false;
  end if;

  update public.guests
  set active = next_active
  where id = target_guest_id;

  get diagnostics updated_count = row_count;

  if updated_count <> 1 then
    return false;
  end if;

  if next_active is false then
    update public.guest_access_sessions
    set revoked_at = coalesce(revoked_at, timezone('utc'::text, now()))
    where guest_id = target_guest_id;
  else
    delete from public.guest_access_sessions
    where guest_id = target_guest_id
      and revoked_at is not null;
  end if;

  return true;
end;
$$;

create or replace function public.admin_set_guest_invite_sent(
  target_guest_id uuid,
  next_invite_sent boolean
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

  if next_invite_sent is null then
    return false;
  end if;

  update public.guests
  set invite_sent = next_invite_sent
  where id = target_guest_id;

  get diagnostics updated_count = row_count;
  return updated_count = 1;
end;
$$;

comment on function public.admin_update_guest(
  uuid,
  text,
  text,
  jsonb,
  integer,
  boolean
) is
  'Validates and updates a guest without exposing direct table writes.';

comment on function public.admin_set_guest_active(uuid, boolean) is
  'Changes guest access and synchronizes invitation sessions atomically.';
comment on function public.admin_set_guest_invite_sent(uuid, boolean) is
  'Marks whether a guest invitation has been sent.';

revoke all on function public.admin_update_guest(
  uuid,
  text,
  text,
  jsonb,
  integer,
  boolean
) from public, anon;
revoke all on function public.admin_set_guest_active(uuid, boolean)
  from public, anon;
revoke all on function public.admin_set_guest_invite_sent(uuid, boolean)
  from public, anon;

grant execute on function public.admin_update_guest(
  uuid,
  text,
  text,
  jsonb,
  integer,
  boolean
) to authenticated;
grant execute on function public.admin_set_guest_active(uuid, boolean)
  to authenticated;
grant execute on function public.admin_set_guest_invite_sent(uuid, boolean)
  to authenticated;

-- All guest mutations now use trusted RPCs or the claim-invite service role.
revoke insert, update, delete on table public.guests from authenticated;

commit;
