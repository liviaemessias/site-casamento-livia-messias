-- ============================================================
-- RSVP dietary restriction explicit choice
-- ============================================================
--
-- Adds an explicit yes/no field for dietary restrictions and updates the
-- public/admin RSVP RPCs to keep the boolean and detail text consistent.

begin;

alter table public.rsvps
  add column if not exists food_restriction boolean not null default false;

update public.rsvps
set food_restriction = true
where nullif(btrim(coalesce(food, '')), '') is not null;

drop function if exists public.save_current_rsvp(
  text,
  text,
  text,
  text,
  text,
  jsonb
);

create or replace function public.save_current_rsvp(
  submitted_presence text,
  submitted_email text,
  submitted_phone text,
  submitted_food text,
  submitted_food_restriction boolean,
  submitted_message text,
  submitted_guest_data jsonb
)
returns setof public.rsvps
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_guest uuid;
  guest_record public.guests%rowtype;
  safe_guest_data jsonb;
  safe_members jsonb := '[]'::jsonb;
  safe_companions jsonb := '[]'::jsonb;
  safe_food text := '';
  safe_food_restriction boolean := coalesce(submitted_food_restriction, false);
  requested_guest_count integer;
  companion_count integer;
  event_operation text;
  submitted_member_count integer;
  expected_member_count integer;
  member_is_coming boolean;
  saved_rsvp public.rsvps%rowtype;
  was_existing boolean;
begin
  current_guest := public.current_guest_id();

  if current_guest is null
    or submitted_presence is null
    or submitted_presence not in ('Sim', 'Não')
    or jsonb_typeof(coalesce(submitted_guest_data, '{}'::jsonb)) <> 'object'
  then
    return;
  end if;

  if safe_food_restriction then
    safe_food := left(btrim(coalesce(submitted_food, '')), 1000);

    if safe_food = '' then
      return;
    end if;
  end if;

  select *
  into guest_record
  from public.guests
  where id = current_guest
    and active is true
  for update;

  if not found then
    return;
  end if;

  select exists (
    select 1
    from public.rsvps as existing_rsvp
    where existing_rsvp.guest_id = current_guest
  )
  into was_existing;

  begin
    requested_guest_count := coalesce(
      nullif(submitted_guest_data ->> 'guest_count', '')::integer,
      0
    );
  exception
    when invalid_text_representation then
      return;
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
    return;
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
        and not (
          companion ->> 'age' = 'Menos de 1 ano'
          or companion ->> 'age' = '1 ano'
          or companion ->> 'age' ~ '^([2-9]|1[0-2]) anos$'
        )
      )
  ) then
    return;
  end if;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'name', left(btrim(companion ->> 'name'), 200),
        'is_child', companion ->> 'is_child',
        'age', case
          when companion ->> 'is_child' = 'Sim'
            then companion ->> 'age'
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
      return;
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
      return;
    end if;
  elsif jsonb_array_length(
    case
      when jsonb_typeof(submitted_guest_data -> 'members') = 'array'
        then submitted_guest_data -> 'members'
      else '[]'::jsonb
    end
  ) <> 0 then
    return;
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
    food_restriction,
    message,
    guest_data,
    updated_at
  )
  values (
    current_guest,
    submitted_presence,
    left(coalesce(submitted_email, ''), 320),
    left(coalesce(submitted_phone, ''), 40),
    safe_food,
    safe_food_restriction,
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
    food_restriction = excluded.food_restriction,
    message = excluded.message,
    guest_data = excluded.guest_data,
    updated_at = excluded.updated_at
  returning * into saved_rsvp;

  event_operation := case
    when was_existing then 'updated'
    else 'created'
  end;

  insert into public.notification_events (
    event_type,
    aggregate_type,
    aggregate_id,
    aggregate_version,
    guest_id,
    dedupe_key,
    payload
  )
  values (
    'rsvp_saved',
    'rsvp',
    saved_rsvp.id,
    saved_rsvp.updated_at,
    current_guest,
    concat(
      'rsvp_saved:',
      saved_rsvp.id::text,
      ':',
      extract(epoch from saved_rsvp.updated_at)::text
    ),
    jsonb_build_object(
      'operation', event_operation,
      'operation_label', case
        when event_operation = 'updated' then 'RSVP Atualizado'
        else 'RSVP Recebido'
      end,
      'guest_name', guest_record.name,
      'invite_type', guest_record.invite_type,
      'couple_members', coalesce(guest_record.couple_members, '[]'::jsonb),
      'rsvp_id', saved_rsvp.id,
      'rsvp_updated_at', saved_rsvp.updated_at,
      'presence', saved_rsvp.presence,
      'email', saved_rsvp.email,
      'phone', saved_rsvp.phone,
      'food_restriction', saved_rsvp.food_restriction,
      'food', saved_rsvp.food,
      'message', saved_rsvp.message,
      'guest_data', saved_rsvp.guest_data
    )
  )
  on conflict (dedupe_key) do nothing;

  return next saved_rsvp;
end;
$$;

comment on function public.save_current_rsvp(
  text,
  text,
  text,
  text,
  boolean,
  text,
  jsonb
) is
  'Validates and saves the current guest RSVP using canonical invitation data.';

revoke all on function public.save_current_rsvp(
  text,
  text,
  text,
  text,
  boolean,
  text,
  jsonb
) from public, anon;
grant execute on function public.save_current_rsvp(
  text,
  text,
  text,
  text,
  boolean,
  text,
  jsonb
) to authenticated;

drop function if exists public.admin_save_guest_rsvp(
  uuid,
  text,
  text,
  text,
  text,
  text,
  jsonb
);

create or replace function public.admin_save_guest_rsvp(
  target_guest_id uuid,
  submitted_presence text,
  submitted_email text,
  submitted_phone text,
  submitted_food text,
  submitted_food_restriction boolean,
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
  safe_food text := '';
  safe_food_restriction boolean := coalesce(submitted_food_restriction, false);
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

  if safe_food_restriction then
    safe_food := left(btrim(coalesce(submitted_food, '')), 1000);

    if safe_food = '' then
      return false;
    end if;
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
        and not (
          companion ->> 'age' = 'Menos de 1 ano'
          or companion ->> 'age' = '1 ano'
          or companion ->> 'age' ~ '^([2-9]|1[0-2]) anos$'
        )
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
    food_restriction,
    message,
    guest_data,
    updated_at
  )
  values (
    target_guest_id,
    submitted_presence,
    left(coalesce(submitted_email, ''), 320),
    left(coalesce(submitted_phone, ''), 40),
    safe_food,
    safe_food_restriction,
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
    food_restriction = excluded.food_restriction,
    message = excluded.message,
    guest_data = excluded.guest_data,
    updated_at = excluded.updated_at;

  return true;
end;
$$;

comment on function public.admin_save_guest_rsvp(
  uuid,
  text,
  text,
  text,
  text,
  boolean,
  text,
  jsonb
) is
  'Validates and saves an RSVP for a selected guest as an administrator.';

revoke all on function public.admin_save_guest_rsvp(
  uuid,
  text,
  text,
  text,
  text,
  boolean,
  text,
  jsonb
) from public, anon;
grant execute on function public.admin_save_guest_rsvp(
  uuid,
  text,
  text,
  text,
  text,
  boolean,
  text,
  jsonb
) to authenticated;

revoke insert, update, delete on table public.rsvps from authenticated;

commit;
