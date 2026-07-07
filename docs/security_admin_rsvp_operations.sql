-- ============================================================
-- Secure administrative RSVP operations
-- ============================================================
--
-- Run this script once in an existing secured Supabase project. Clean
-- rebuilds also execute this file as part of the documented sequence.

begin;

create or replace function public.admin_save_guest_rsvp(
  target_guest_id uuid,
  submitted_presence text,
  submitted_email text,
  submitted_phone text,
  submitted_food text,
  submitted_message text,
  submitted_guest_data jsonb
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  guest_record public.guests%rowtype;
  safe_guest_data jsonb;
  safe_members jsonb := '[]'::jsonb;
  safe_companions jsonb := '[]'::jsonb;
  requested_guest_count integer;
  companion_count integer;
  submitted_member_count integer;
  expected_member_count integer;
  member_is_coming boolean;
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

  if submitted_presence is null
    or submitted_presence not in ('Sim', 'Não')
    or jsonb_typeof(coalesce(submitted_guest_data, '{}'::jsonb)) <> 'object'
  then
    return false;
  end if;

  select *
  into guest_record
  from public.guests
  where id = target_guest_id
  for update;

  if not found then
    return false;
  end if;

  begin
    requested_guest_count := coalesce(
      nullif(submitted_guest_data ->> 'guest_count', '')::integer,
      0
    );
  exception
    when invalid_text_representation then
      return false;
  end;

  companion_count := case
    when jsonb_typeof(submitted_guest_data -> 'companions') = 'array'
      then jsonb_array_length(submitted_guest_data -> 'companions')
    else 0
  end;

  if requested_guest_count < 0
    or requested_guest_count > coalesce(guest_record.max_guests, 0)
    or companion_count <> requested_guest_count
    or (submitted_presence = 'Não' and requested_guest_count <> 0)
  then
    return false;
  end if;

  if exists (
    select 1
    from jsonb_array_elements(
      case
        when jsonb_typeof(submitted_guest_data -> 'companions') = 'array'
          then submitted_guest_data -> 'companions'
        else '[]'::jsonb
      end
    ) as companion
    where jsonb_typeof(companion) <> 'object'
      or nullif(btrim(companion ->> 'name'), '') is null
      or companion ->> 'is_child' is null
      or companion ->> 'is_child' not in ('Sim', 'Não')
      or (
        companion ->> 'is_child' = 'Sim'
        and nullif(btrim(companion ->> 'age'), '') is null
      )
  ) then
    return false;
  end if;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'name', left(btrim(companion ->> 'name'), 200),
        'is_child', companion ->> 'is_child',
        'age', case
          when companion ->> 'is_child' = 'Sim'
            then left(btrim(companion ->> 'age'), 40)
          else ''
        end
      )
      order by position
    ),
    '[]'::jsonb
  )
  into safe_companions
  from jsonb_array_elements(
    case
      when jsonb_typeof(submitted_guest_data -> 'companions') = 'array'
        then submitted_guest_data -> 'companions'
      else '[]'::jsonb
    end
  ) with ordinality as companions(companion, position);

  if guest_record.invite_type = 'couple' then
    expected_member_count := case
      when jsonb_typeof(guest_record.couple_members) = 'array'
        then jsonb_array_length(guest_record.couple_members)
      else 0
    end;
    submitted_member_count := case
      when jsonb_typeof(submitted_guest_data -> 'members') = 'array'
        then jsonb_array_length(submitted_guest_data -> 'members')
      else 0
    end;

    if expected_member_count <> 2
      or submitted_member_count <> expected_member_count
      or exists (
        select 1
        from jsonb_array_elements(submitted_guest_data -> 'members') as member
        where member ->> 'presence' is null
          or member ->> 'presence' not in ('Sim', 'Não')
      )
    then
      return false;
    end if;

    select
      coalesce(
        jsonb_agg(
          jsonb_build_object(
            'name', expected.member ->> 'name',
            'presence', submitted.member ->> 'presence'
          )
          order by expected.position
        ),
        '[]'::jsonb
      ),
      bool_or(submitted.member ->> 'presence' = 'Sim')
    into safe_members, member_is_coming
    from jsonb_array_elements(guest_record.couple_members)
      with ordinality as expected(member, position)
    inner join jsonb_array_elements(submitted_guest_data -> 'members')
      with ordinality as submitted(member, position)
      using (position);

    if submitted_presence <> (
      case
        when coalesce(member_is_coming, false) then 'Sim'
        else 'Não'
      end
    ) then
      return false;
    end if;
  elsif jsonb_array_length(
    case
      when jsonb_typeof(submitted_guest_data -> 'members') = 'array'
        then submitted_guest_data -> 'members'
      else '[]'::jsonb
    end
  ) <> 0 then
    return false;
  end if;

  safe_guest_data := jsonb_build_object(
    'name', guest_record.name,
    'email', left(coalesce(submitted_email, ''), 320),
    'phone', left(coalesce(submitted_phone, ''), 40),
    'guest_count', requested_guest_count,
    'members', safe_members,
    'companions', safe_companions
  );

  insert into public.rsvps (
    guest_id,
    presence,
    email,
    phone,
    food,
    message,
    guest_data,
    updated_at
  )
  values (
    target_guest_id,
    submitted_presence,
    left(coalesce(submitted_email, ''), 320),
    left(coalesce(submitted_phone, ''), 40),
    left(coalesce(submitted_food, ''), 1000),
    left(coalesce(submitted_message, ''), 4000),
    safe_guest_data,
    timezone('utc'::text, now())
  )
  on conflict (guest_id) where guest_id is not null
  do update set
    presence = excluded.presence,
    email = excluded.email,
    phone = excluded.phone,
    food = excluded.food,
    message = excluded.message,
    guest_data = excluded.guest_data,
    updated_at = excluded.updated_at;

  -- The RSVP trigger updates guests.confirmed in this transaction.
  return true;
end;
$$;

create or replace function public.admin_delete_guest_rsvp(
  target_rsvp_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  deleted_rsvp_id uuid;
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

  delete from public.rsvps
  where id = target_rsvp_id
  returning id into deleted_rsvp_id;

  -- The RSVP trigger updates guests.confirmed in this transaction.
  return deleted_rsvp_id is not null;
end;
$$;

comment on function public.admin_save_guest_rsvp(
  uuid,
  text,
  text,
  text,
  text,
  text,
  jsonb
) is
  'Validates and saves an RSVP for a selected guest as an administrator.';

comment on function public.admin_delete_guest_rsvp(uuid) is
  'Deletes an RSVP and synchronizes its guest as an administrator.';

revoke all on function public.admin_save_guest_rsvp(
  uuid,
  text,
  text,
  text,
  text,
  text,
  jsonb
) from public, anon;
revoke all on function public.admin_delete_guest_rsvp(uuid)
  from public, anon;

grant execute on function public.admin_save_guest_rsvp(
  uuid,
  text,
  text,
  text,
  text,
  text,
  jsonb
) to authenticated;
grant execute on function public.admin_delete_guest_rsvp(uuid)
  to authenticated;

-- Guests and administrators mutate RSVPs only through RPCs.
revoke insert, update, delete on table public.rsvps from authenticated;

commit;
