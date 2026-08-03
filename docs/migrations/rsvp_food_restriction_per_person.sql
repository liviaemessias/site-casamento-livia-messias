-- ============================================================
-- RSVP dietary restriction per person
-- ============================================================
--
-- Preserves dietary restriction details per confirmed invitation person inside
-- guest_data and removes the legacy rsvps.food/rsvps.food_restriction columns.
-- Existing individual invitation restrictions are moved to the primary guest.
-- Existing couple invitation restrictions are moved to the first couple member.

begin;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'rsvps'
      and column_name = 'food'
  ) then
    alter table public.rsvps
      add column if not exists food_restriction boolean not null default false;

    execute $legacy_food_flag$
      update public.rsvps
      set food_restriction = true
      where nullif(btrim(coalesce(food, '')), '') is not null;
    $legacy_food_flag$;

    execute $legacy_food_individual$
      update public.rsvps as rsvp
      set guest_data = jsonb_set(
          jsonb_set(
            coalesce(rsvp.guest_data, '{}'::jsonb),
            '{food_restriction}',
            to_jsonb(true),
            true
          ),
          '{food}',
          to_jsonb(
            left(
              case
                when lower(btrim(coalesce(rsvp.food, ''))) like lower(guest.name) || ':%'
                  then coalesce(nullif(btrim(substr(btrim(rsvp.food), char_length(guest.name) + 2)), ''), 'Sim, sem detalhes informados')
                else coalesce(nullif(btrim(coalesce(rsvp.food, '')), ''), 'Sim, sem detalhes informados')
              end,
              1000
            )
          ),
          true
        )
      from public.guests as guest
      where guest.id = rsvp.guest_id
        and coalesce(guest.invite_type, 'individual') <> 'couple'
        and (
          rsvp.food_restriction is true
          or nullif(btrim(coalesce(rsvp.food, '')), '') is not null
        );
    $legacy_food_individual$;

    execute $legacy_food_couple$
      with couple_restrictions as (
        select
          rsvp.id,
          jsonb_agg(
            case
              when member.position = 1 then
                member.value || jsonb_build_object(
                  'name', coalesce(member.value ->> 'name', guest_member.value ->> 'name', guest.name),
                  'presence', coalesce(member.value ->> 'presence', rsvp.presence, 'Sim'),
                  'food_restriction', true,
                  'food', left(
                    case
                      when lower(btrim(coalesce(rsvp.food, ''))) like lower(
                        coalesce(member.value ->> 'name', guest_member.value ->> 'name', guest.name)
                      ) || ':%'
                        then coalesce(
                          nullif(
                            btrim(
                              substr(
                                btrim(rsvp.food),
                                char_length(coalesce(member.value ->> 'name', guest_member.value ->> 'name', guest.name)) + 2
                              )
                            ),
                            ''
                          ),
                          'Sim, sem detalhes informados'
                        )
                      else coalesce(nullif(btrim(coalesce(rsvp.food, '')), ''), 'Sim, sem detalhes informados')
                    end,
                    1000
                  )
                )
              else member.value
            end
            order by member.position
          ) as members
        from public.rsvps as rsvp
        inner join public.guests as guest
          on guest.id = rsvp.guest_id
        cross join lateral jsonb_array_elements(
          case
            when jsonb_typeof(rsvp.guest_data -> 'members') = 'array'
              and jsonb_array_length(rsvp.guest_data -> 'members') > 0
              then rsvp.guest_data -> 'members'
            when jsonb_typeof(guest.couple_members) = 'array'
              then guest.couple_members
            else jsonb_build_array(jsonb_build_object('name', guest.name, 'presence', rsvp.presence))
          end
        ) with ordinality as member(value, position)
        left join lateral jsonb_array_elements(
          case
            when jsonb_typeof(guest.couple_members) = 'array'
              then guest.couple_members
            else '[]'::jsonb
          end
        ) with ordinality as guest_member(value, position)
          on guest_member.position = member.position
        where guest.invite_type = 'couple'
          and (
            rsvp.food_restriction is true
            or nullif(btrim(coalesce(rsvp.food, '')), '') is not null
          )
        group by rsvp.id
      )
      update public.rsvps as rsvp
      set guest_data = jsonb_set(
          coalesce(rsvp.guest_data, '{}'::jsonb),
          '{members}',
          couple_restrictions.members,
          true
        )
      from couple_restrictions
      where couple_restrictions.id = rsvp.id;
    $legacy_food_couple$;
  end if;
end;
$$;

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
  safe_food_restriction boolean := false;
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

  select *
  into guest_record
  from public.guests
  where id = current_guest
    and active is true
  for update;

  if not found then
    return;
  end if;

  if guest_record.invite_type <> 'couple'
    and submitted_presence = 'Sim'
    and lower(coalesce(submitted_guest_data ->> 'food_restriction', 'false')) in ('true', 'sim')
  then
    safe_food := left(
      btrim(
        coalesce(
          nullif(submitted_guest_data ->> 'food', ''),
          ''
        )
      ),
      1000
    );

    if safe_food = '' then
      return;
    end if;

    if lower(safe_food) like lower(guest_record.name) || ':%' then
      safe_food := left(
        btrim(substr(safe_food, char_length(guest_record.name) + 2)),
        1000
      );
    end if;

    if safe_food = '' then
      return;
    end if;

    safe_food_restriction := true;
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
        end,
        'food_restriction',
          lower(coalesce(companion ->> 'food_restriction', 'false')) in ('true', 'sim')
          and nullif(btrim(coalesce(companion ->> 'food', '')), '') is not null,
        'food', case
          when lower(coalesce(companion ->> 'food_restriction', 'false')) in ('true', 'sim')
            then left(btrim(coalesce(companion ->> 'food', '')), 1000)
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
            'presence', submitted.member ->> 'presence',
            'food_restriction',
              submitted.member ->> 'presence' = 'Sim'
              and lower(coalesce(submitted.member ->> 'food_restriction', 'false')) in ('true', 'sim')
              and nullif(btrim(coalesce(submitted.member ->> 'food', '')), '') is not null,
            'food', case
              when submitted.member ->> 'presence' = 'Sim'
                and lower(coalesce(submitted.member ->> 'food_restriction', 'false')) in ('true', 'sim')
                then left(btrim(coalesce(submitted.member ->> 'food', '')), 1000)
              else ''
            end
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
    'food_restriction',
      guest_record.invite_type <> 'couple'
      and submitted_presence = 'Sim'
      and safe_food_restriction,
    'food', case
      when guest_record.invite_type <> 'couple'
        and submitted_presence = 'Sim'
        and safe_food_restriction
        then safe_food
      else ''
    end,
    'members', safe_members,
    'companions', safe_companions
  );

  insert into public.rsvps (
    guest_id,
    presence,
    email,
    phone,
    message,
    guest_data,
    updated_at
  )
  values (
    current_guest,
    submitted_presence,
    left(coalesce(submitted_email, ''), 320),
    left(coalesce(submitted_phone, ''), 40),
    left(coalesce(submitted_message, ''), 4000),
    safe_guest_data,
    timezone('utc'::text, now())
  )
  on conflict (guest_id) where guest_id is not null
  do update set
    presence = excluded.presence,
    email = excluded.email,
    phone = excluded.phone,
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
      'food_restriction', safe_food_restriction,
      'food', safe_food,
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
  safe_food_restriction boolean := false;
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

  if guest_record.invite_type <> 'couple'
    and submitted_presence = 'Sim'
    and lower(coalesce(submitted_guest_data ->> 'food_restriction', 'false')) in ('true', 'sim')
  then
    safe_food := left(
      btrim(
        coalesce(
          nullif(submitted_guest_data ->> 'food', ''),
          ''
        )
      ),
      1000
    );

    if safe_food = '' then
      return false;
    end if;

    if lower(safe_food) like lower(guest_record.name) || ':%' then
      safe_food := left(
        btrim(substr(safe_food, char_length(guest_record.name) + 2)),
        1000
      );
    end if;

    if safe_food = '' then
      return false;
    end if;

    safe_food_restriction := true;
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
        end,
        'food_restriction',
          lower(coalesce(companion ->> 'food_restriction', 'false')) in ('true', 'sim')
          and nullif(btrim(coalesce(companion ->> 'food', '')), '') is not null,
        'food', case
          when lower(coalesce(companion ->> 'food_restriction', 'false')) in ('true', 'sim')
            then left(btrim(coalesce(companion ->> 'food', '')), 1000)
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
            'presence', submitted.member ->> 'presence',
            'food_restriction',
              submitted.member ->> 'presence' = 'Sim'
              and lower(coalesce(submitted.member ->> 'food_restriction', 'false')) in ('true', 'sim')
              and nullif(btrim(coalesce(submitted.member ->> 'food', '')), '') is not null,
            'food', case
              when submitted.member ->> 'presence' = 'Sim'
                and lower(coalesce(submitted.member ->> 'food_restriction', 'false')) in ('true', 'sim')
                then left(btrim(coalesce(submitted.member ->> 'food', '')), 1000)
              else ''
            end
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
    'food_restriction',
      guest_record.invite_type <> 'couple'
      and submitted_presence = 'Sim'
      and safe_food_restriction,
    'food', case
      when guest_record.invite_type <> 'couple'
        and submitted_presence = 'Sim'
        and safe_food_restriction
        then safe_food
      else ''
    end,
    'members', safe_members,
    'companions', safe_companions
  );

  insert into public.rsvps (
    guest_id,
    presence,
    email,
    phone,
    message,
    guest_data,
    updated_at
  )
  values (
    target_guest_id,
    submitted_presence,
    left(coalesce(submitted_email, ''), 320),
    left(coalesce(submitted_phone, ''), 40),
    left(coalesce(submitted_message, ''), 4000),
    safe_guest_data,
    timezone('utc'::text, now())
  )
  on conflict (guest_id) where guest_id is not null
  do update set
    presence = excluded.presence,
    email = excluded.email,
    phone = excluded.phone,
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

create or replace function public.rsvp_guest_data_food_summary(
  rsvp_guest_data jsonb
)
returns text
language sql
immutable
set search_path = ''
as $$
  with people as (
    select rsvp_guest_data as person
    where jsonb_typeof(coalesce(rsvp_guest_data, '{}'::jsonb)) = 'object'

    union all

    select member.value as person
    from jsonb_array_elements(
      case
        when jsonb_typeof(rsvp_guest_data -> 'members') = 'array'
          then rsvp_guest_data -> 'members'
        else '[]'::jsonb
      end
    ) as member(value)

    union all

    select companion.value as person
    from jsonb_array_elements(
      case
        when jsonb_typeof(rsvp_guest_data -> 'companions') = 'array'
          then rsvp_guest_data -> 'companions'
        else '[]'::jsonb
      end
    ) as companion(value)
  ),
  restricted_people as (
    select
      concat(
        coalesce(nullif(btrim(person ->> 'name'), ''), 'Sem nome'),
        ': ',
        coalesce(
          nullif(
            case
              when lower(btrim(coalesce(person ->> 'food', ''))) like lower(
                coalesce(nullif(btrim(person ->> 'name'), ''), 'Sem nome')
              ) || ':%'
                then btrim(
                  substr(
                    btrim(person ->> 'food'),
                    char_length(coalesce(nullif(btrim(person ->> 'name'), ''), 'Sem nome')) + 2
                  )
                )
              else btrim(person ->> 'food')
            end,
            ''
          ),
          'Sim, sem detalhes informados'
        )
      ) as summary
    from people
    where coalesce(person ->> 'presence', 'Sim') <> 'Não'
      and (
        lower(coalesce(person ->> 'food_restriction', 'false')) in ('true', 'sim')
        or nullif(btrim(coalesce(person ->> 'food', '')), '') is not null
      )
  )
  select coalesce(string_agg(summary, '; ' order by summary), '')
  from restricted_people;
$$;

comment on function public.rsvp_guest_data_food_summary(jsonb) is
  'Builds a dietary restriction summary from RSVP guest_data people.';

revoke all on function public.rsvp_guest_data_food_summary(jsonb)
  from public, anon;
grant execute on function public.rsvp_guest_data_food_summary(jsonb)
  to authenticated;

create or replace function public.admin_create_manual_notification_event(
  target_event_type text,
  target_aggregate_id uuid,
  target_recipient_type text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  event_id uuid;
  event_time timestamp with time zone;
  normalized_event_type text;
  normalized_recipient_type text;
  rsvp_record public.rsvps%rowtype;
  guest_record public.guests%rowtype;
  gift_record public.gifts%rowtype;
  contribution_record public.gift_contributions%rowtype;
  payload jsonb;
  rsvp_food text;
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

  normalized_event_type := nullif(btrim(target_event_type), '');
  normalized_recipient_type := lower(nullif(btrim(target_recipient_type), ''));

  if normalized_event_type is null or target_aggregate_id is null then
    raise exception 'Notification event type and aggregate id are required.'
      using errcode = '22023';
  end if;

  if normalized_recipient_type is not null
    and normalized_recipient_type not in ('admin', 'guest')
  then
    raise exception 'Invalid notification recipient type.'
      using errcode = '22023';
  end if;

  event_time := timezone('utc'::text, now());

  if normalized_event_type = 'rsvp_saved' then
    select *
    into rsvp_record
    from public.rsvps
    where id = target_aggregate_id
      and guest_id is not null;

    if not found then
      return null;
    end if;

    select *
    into guest_record
    from public.guests
    where id = rsvp_record.guest_id
      and active is true;

    if not found then
      return null;
    end if;

    rsvp_food := public.rsvp_guest_data_food_summary(rsvp_record.guest_data);

    payload := jsonb_build_object(
      'operation', case
        when coalesce(rsvp_record.updated_at, rsvp_record.created_at)
          > coalesce(rsvp_record.created_at, rsvp_record.updated_at)
          then 'updated'
        else 'created'
      end,
      'operation_label', case
        when coalesce(rsvp_record.updated_at, rsvp_record.created_at)
          > coalesce(rsvp_record.created_at, rsvp_record.updated_at)
          then 'RSVP Atualizado'
        else 'RSVP Recebido'
      end,
      'guest_name', guest_record.name,
      'invite_type', guest_record.invite_type,
      'couple_members', coalesce(guest_record.couple_members, '[]'::jsonb),
      'rsvp_id', rsvp_record.id,
      'rsvp_updated_at', rsvp_record.updated_at,
      'presence', rsvp_record.presence,
      'email', rsvp_record.email,
      'phone', rsvp_record.phone,
      'food_restriction', rsvp_food <> '',
      'food', rsvp_food,
      'message', rsvp_record.message,
      'guest_data', rsvp_record.guest_data
    );

    insert into public.notification_events (
      event_type,
      aggregate_type,
      aggregate_id,
      aggregate_version,
      origin,
      guest_id,
      dedupe_key,
      payload
    )
    values (
      normalized_event_type,
      'rsvp',
      rsvp_record.id,
      event_time,
      'manual',
      rsvp_record.guest_id,
      concat(
        normalized_event_type,
        ':manual:',
        rsvp_record.id::text,
        ':',
        extract(epoch from event_time)::text,
        ':',
        gen_random_uuid()::text
      ),
      payload
        || jsonb_build_object(
          'notification_origin', 'manual',
          'triggered_by', 'admin',
          'triggered_by_user_id', (select auth.uid())
        )
        || case
          when normalized_recipient_type is null then '{}'::jsonb
          else jsonb_build_object('manual_recipient_type', normalized_recipient_type)
        end
    )
    returning id into event_id;

    return event_id;
  end if;

  if normalized_event_type in (
    'gift_reserved',
    'gift_payment_reported',
    'gift_purchase_confirmed',
    'gift_reservation_released'
  ) then
    select *
    into gift_record
    from public.gifts
    where id = target_aggregate_id
      and coalesce(gift_type, 'single') <> 'quota'
      and reserved_guest_id is not null;

    if not found then
      return null;
    end if;

    if normalized_event_type = 'gift_payment_reported'
      and coalesce(gift_record.payment_status, 'Pendente') not in ('Informado', 'Confirmado')
    then
      return null;
    end if;

    if normalized_event_type = 'gift_purchase_confirmed'
      and (
        gift_record.status <> 'Comprado'
        and coalesce(gift_record.payment_status, 'Pendente') <> 'Confirmado'
      )
    then
      return null;
    end if;

    if normalized_event_type = 'gift_reservation_released' then
      return null;
    end if;

    perform public.enqueue_gift_notification_event(
      normalized_event_type,
      'gift',
      gift_record.id,
      event_time,
      gift_record.reserved_guest_id,
      jsonb_build_object(
        'gift_id', gift_record.id,
        'gift_name', gift_record.name,
        'gift_category', gift_record.category,
        'gift_type', coalesce(gift_record.gift_type, 'single'),
        'price', gift_record.price,
        'message', gift_record.reservation_message,
        'payment_status', gift_record.payment_status,
        'purchase_method', gift_record.selected_purchase_method,
        'notification_origin', 'manual',
        'triggered_by', 'admin',
        'triggered_by_user_id', (select auth.uid())
      )
      || case
        when normalized_recipient_type is null then '{}'::jsonb
        else jsonb_build_object('manual_recipient_type', normalized_recipient_type)
      end
    );

    update public.notification_events
    set origin = 'manual'
    where dedupe_key = concat(
      normalized_event_type,
      ':',
      gift_record.id::text,
      ':',
      extract(epoch from event_time)::text
    )
    returning id into event_id;

    return event_id;
  end if;

  if normalized_event_type in (
    'gift_contribution_reserved',
    'gift_contribution_payment_reported',
    'gift_contribution_confirmed',
    'gift_contribution_released'
  ) then
    select *
    into contribution_record
    from public.gift_contributions
    where id = target_aggregate_id
      and guest_id is not null;

    if not found then
      return null;
    end if;

    select *
    into gift_record
    from public.gifts
    where id = contribution_record.gift_id
      and gift_type = 'quota';

    if not found then
      return null;
    end if;

    if normalized_event_type = 'gift_contribution_payment_reported'
      and coalesce(contribution_record.payment_status, 'Pendente') not in ('Informado', 'Confirmado')
    then
      return null;
    end if;

    if normalized_event_type = 'gift_contribution_confirmed'
      and coalesce(contribution_record.payment_status, 'Pendente') <> 'Confirmado'
    then
      return null;
    end if;

    if normalized_event_type = 'gift_contribution_released' then
      return null;
    end if;

    perform public.enqueue_gift_notification_event(
      normalized_event_type,
      'gift_contribution',
      contribution_record.id,
      event_time,
      contribution_record.guest_id,
      jsonb_build_object(
        'gift_id', gift_record.id,
        'gift_name', gift_record.name,
        'gift_category', gift_record.category,
        'gift_type', 'quota',
        'price', gift_record.price,
        'quota_quantity', contribution_record.quota_quantity,
        'quota_value', contribution_record.quota_value,
        'total_value', contribution_record.total_value,
        'message', contribution_record.message,
        'payment_status', contribution_record.payment_status,
        'payment_method', contribution_record.payment_method,
        'notification_origin', 'manual',
        'triggered_by', 'admin',
        'triggered_by_user_id', (select auth.uid())
      )
      || case
        when normalized_recipient_type is null then '{}'::jsonb
        else jsonb_build_object('manual_recipient_type', normalized_recipient_type)
      end
    );

    update public.notification_events
    set origin = 'manual'
    where dedupe_key = concat(
      normalized_event_type,
      ':',
      contribution_record.id::text,
      ':',
      extract(epoch from event_time)::text
    )
    returning id into event_id;

    return event_id;
  end if;

  return null;
end;
$$;

comment on function public.admin_create_manual_notification_event(
  text,
  uuid,
  text
) is
  'Creates a manual notification event for a supported aggregate.';

revoke all on function public.admin_create_manual_notification_event(
  text,
  uuid,
  text
) from public, anon;
grant execute on function public.admin_create_manual_notification_event(
  text,
  uuid,
  text
) to authenticated;

revoke insert, update, delete on table public.rsvps from authenticated;

alter table public.rsvps
  drop column if exists food,
  drop column if exists food_restriction;

commit;
