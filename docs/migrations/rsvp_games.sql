-- RSVP games: one game configuration and completion counter per invitation.
-- Requires the secure-auth helpers public.is_admin() and
-- public.current_guest_id() from security_phase_2_prepare.sql.

begin;

create table if not exists public.rsvp_games (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid not null unique
    references public.guests(id) on delete cascade,
  game_type text not null,
  display_names text[] not null,
  relationship_label text not null,
  is_active boolean not null default true,
  play_count integer not null default 0,
  last_completed_at timestamp with time zone null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint rsvp_games_game_type_check check (
    game_type in (
      'general',
      'parents',
      'godparents_couple',
      'godfather',
      'godmother'
    )
  ),
  constraint rsvp_games_display_names_count_check check (
    cardinality(display_names) between 1 and 4
  ),
  constraint rsvp_games_display_names_nonempty_check check (
    array_position(display_names, null) is null
  ),
  constraint rsvp_games_special_name_count_check check (
    (game_type = 'godparents_couple' and cardinality(display_names) = 2)
    or (game_type in ('godfather', 'godmother') and cardinality(display_names) = 1)
    or game_type in ('general', 'parents')
  ),
  constraint rsvp_games_relationship_length_check check (
    char_length(btrim(relationship_label)) between 1 and 120
  ),
  constraint rsvp_games_play_count_check check (play_count >= 0)
);

create table if not exists public.rsvp_game_message_templates (
  game_type text primary key,
  singular_message text not null,
  plural_message text not null,
  updated_at timestamp with time zone not null default now(),
  constraint rsvp_game_message_templates_type_check check (
    game_type in (
      'general',
      'parents',
      'godparents_couple',
      'godfather',
      'godmother'
    )
  ),
  constraint rsvp_game_message_templates_singular_length_check check (
    char_length(btrim(singular_message)) between 1 and 3000
  ),
  constraint rsvp_game_message_templates_plural_length_check check (
    char_length(btrim(plural_message)) between 1 and 3000
  )
);

comment on table public.rsvp_games is
  'One RSVP game configuration and completion counter per guest invitation.';
comment on table public.rsvp_game_message_templates is
  'Editable singular/plural final message templates shared by RSVP game type.';
comment on column public.rsvp_games.display_names is
  'Names presented by the game; these are not linked to individual invite members.';

alter table public.rsvp_games enable row level security;
alter table public.rsvp_game_message_templates enable row level security;

revoke all on table public.rsvp_games from public, anon, authenticated;
revoke all on table public.rsvp_game_message_templates from public, anon, authenticated;

insert into public.rsvp_game_message_templates (
  game_type,
  singular_message,
  plural_message
)
values
  (
    'general',
    '{{names}}, que alegria ter você com a gente! Sua presença torna nosso dia ainda mais especial. Com carinho, Livia e Messias.',
    '{{names}}, que alegria ter vocês com a gente! A presença de vocês torna nosso dia ainda mais especial. Com carinho, Livia e Messias.'
  ),
  (
    'parents',
    '{{names}}, seu carinho e seu exemplo fazem parte da nossa história. Que alegria ter você ao nosso lado. Com amor, Livia e Messias.',
    '{{names}}, o carinho e o exemplo de vocês fazem parte da nossa história. Que alegria ter vocês ao nosso lado. Com amor, Livia e Messias.'
  ),
  (
    'godparents_couple',
    '{{names}}, que alegria contar com você nessa caminhada. Seu carinho torna este momento ainda mais especial. Com carinho, Livia e Messias.',
    '{{names}}, que alegria contar com vocês nessa caminhada. O carinho de vocês torna este momento ainda mais especial. Com carinho, Livia e Messias.'
  ),
  (
    'godfather',
    '{{names}}, que alegria ter você como Padrinho! Seu carinho torna este momento ainda mais especial. Com carinho, Livia e Messias.',
    '{{names}}, que alegria ter vocês como Padrinhos! O carinho de vocês torna este momento ainda mais especial. Com carinho, Livia e Messias.'
  ),
  (
    'godmother',
    '{{names}}, que alegria ter você como Madrinha! Seu carinho torna este momento ainda mais especial. Com carinho, Livia e Messias.',
    '{{names}}, que alegria ter vocês como Madrinhas! O carinho de vocês torna este momento ainda mais especial. Com carinho, Livia e Messias.'
  )
on conflict (game_type) do nothing;

create or replace function public.admin_list_rsvp_games()
returns table (
  game_id uuid,
  guest_id uuid,
  guest_name text,
  invite_type text,
  couple_members jsonb,
  game_type text,
  display_names text[],
  relationship_label text,
  is_active boolean,
  play_count integer,
  last_completed_at timestamp with time zone
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.' using errcode = '42501';
  end if;

  return query
  select
    game.id,
    game.guest_id,
    guest.name,
    coalesce(guest.invite_type, 'individual'),
    coalesce(guest.couple_members, '[]'::jsonb),
    game.game_type,
    game.display_names,
    game.relationship_label,
    game.is_active,
    game.play_count,
    game.last_completed_at
  from public.rsvp_games as game
  join public.guests as guest on guest.id = game.guest_id
  order by lower(guest.name), guest.name;
end;
$$;

create or replace function public.admin_list_rsvp_game_guests()
returns table (
  guest_id uuid,
  guest_name text,
  invite_type text,
  couple_members jsonb,
  has_game boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.' using errcode = '42501';
  end if;

  return query
  select
    guest.id,
    guest.name,
    coalesce(guest.invite_type, 'individual'),
    coalesce(guest.couple_members, '[]'::jsonb),
    game.id is not null
  from public.guests as guest
  left join public.rsvp_games as game on game.guest_id = guest.id
  where guest.active is true
  order by lower(guest.name), guest.name;
end;
$$;

create or replace function public.admin_list_rsvp_game_message_templates()
returns table (
  game_type text,
  singular_message text,
  plural_message text,
  updated_at timestamp with time zone
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.' using errcode = '42501';
  end if;

  return query
  select template.game_type, template.singular_message,
    template.plural_message, template.updated_at
  from public.rsvp_game_message_templates as template
  order by template.game_type;
end;
$$;

create or replace function public.admin_save_rsvp_game(
  p_guest_id uuid,
  p_game_type text,
  p_display_names text[],
  p_relationship_label text,
  p_is_active boolean default true
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_type text := lower(nullif(btrim(p_game_type), ''));
  normalized_names text[];
  normalized_relationship text := nullif(btrim(p_relationship_label), '');
  saved_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.' using errcode = '42501';
  end if;

  if p_guest_id is null or not exists (
    select 1 from public.guests as guest
    where guest.id = p_guest_id
  ) then
    raise exception 'Select an existing invitation.' using errcode = '22023';
  end if;

  if normalized_type is null or normalized_type not in (
    'general', 'parents', 'godparents_couple', 'godfather', 'godmother'
  ) then
    raise exception 'Invalid RSVP game type.' using errcode = '22023';
  end if;

  select coalesce(array_agg(name order by ordinal), array[]::text[])
  into normalized_names
  from (
    select nullif(btrim(candidate.name), '') as name, candidate.ordinality as ordinal
    from unnest(coalesce(p_display_names, array[]::text[]))
      with ordinality as candidate(name, ordinality)
    where nullif(btrim(candidate.name), '') is not null
  ) as names;

  if cardinality(normalized_names) not between 1 and 4
    or exists (
      select 1 from unnest(normalized_names) as item(name)
      where char_length(item.name) > 120
    )
  then
    raise exception 'Enter between one and four names (up to 120 characters each).'
      using errcode = '22023';
  end if;

  if (normalized_type = 'godparents_couple' and cardinality(normalized_names) <> 2)
    or (normalized_type in ('godfather', 'godmother') and cardinality(normalized_names) <> 1)
  then
    raise exception 'This game type requires two godparent names or one individual godparent name.'
      using errcode = '22023';
  end if;

  if normalized_relationship is null
    or char_length(normalized_relationship) > 120
  then
    raise exception 'A relationship label is required (up to 120 characters).'
      using errcode = '22023';
  end if;

  insert into public.rsvp_games (
    guest_id, game_type, display_names, relationship_label, is_active
  )
  values (
    p_guest_id, normalized_type, normalized_names, normalized_relationship,
    coalesce(p_is_active, true)
  )
  on conflict (guest_id) do update
  set game_type = excluded.game_type,
      display_names = excluded.display_names,
      relationship_label = excluded.relationship_label,
      is_active = excluded.is_active,
      updated_at = now()
  returning id into saved_id;

  return saved_id;
end;
$$;

create or replace function public.admin_create_rsvp_games_bulk(
  p_guest_ids uuid[]
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  inserted_count integer := 0;
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.' using errcode = '42501';
  end if;

  if coalesce(cardinality(p_guest_ids), 0) not between 1 and 500 then
    raise exception 'Select between one and 500 invitations.' using errcode = '22023';
  end if;

  with selected_guests as (
    select distinct guest.*
    from public.guests as guest
    where guest.id = any(p_guest_ids)
      and guest.active is true
      and not exists (
        select 1 from public.rsvp_games as existing_game
        where existing_game.guest_id = guest.id
      )
  ), prepared as (
    select
      guest.id as guest_id,
      'general'::text as game_type,
      case
        when guest.invite_type = 'couple' then coalesce(
          (
            select array_agg(nullif(btrim(member.value ->> 'name'), '') order by member.ordinality)
            from jsonb_array_elements(
              case
                when jsonb_typeof(guest.couple_members) = 'array'
                  then guest.couple_members
                else '[]'::jsonb
              end
            ) with ordinality as member(value, ordinality)
            where nullif(btrim(member.value ->> 'name'), '') is not null
          ),
          array[guest.name]
        )
        else array[guest.name]
      end as display_names,
      'Convidados'::text as relationship_label
    from selected_guests as guest
  )
  insert into public.rsvp_games (
    guest_id, game_type, display_names, relationship_label
  )
  select guest_id, game_type, display_names, relationship_label
  from prepared
  on conflict (guest_id) do nothing;

  get diagnostics inserted_count = row_count;
  return inserted_count;
end;
$$;

create or replace function public.admin_save_rsvp_game_message_template(
  p_game_type text,
  p_singular_message text,
  p_plural_message text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_type text := lower(nullif(btrim(p_game_type), ''));
  normalized_singular text := nullif(btrim(p_singular_message), '');
  normalized_plural text := nullif(btrim(p_plural_message), '');
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.' using errcode = '42501';
  end if;

  if normalized_type is null or normalized_type not in (
    'general', 'parents', 'godparents_couple', 'godfather', 'godmother'
  ) then
    raise exception 'Invalid RSVP game type.' using errcode = '22023';
  end if;

  if normalized_singular is null or normalized_plural is null
    or char_length(normalized_singular) > 3000
    or char_length(normalized_plural) > 3000
  then
    raise exception 'Both message variants are required (up to 3000 characters).'
      using errcode = '22023';
  end if;

  insert into public.rsvp_game_message_templates (
    game_type, singular_message, plural_message, updated_at
  )
  values (
    normalized_type, normalized_singular, normalized_plural, now()
  )
  on conflict (game_type) do update
  set singular_message = excluded.singular_message,
      plural_message = excluded.plural_message,
      updated_at = now();

  return true;
end;
$$;

create or replace function public.get_current_rsvp_game()
returns table (
  game_id uuid,
  game_type text,
  display_names text[],
  relationship_label text,
  play_count integer,
  last_completed_at timestamp with time zone,
  singular_message text,
  plural_message text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    game.id,
    game.game_type,
    game.display_names,
    game.relationship_label,
    game.play_count,
    game.last_completed_at,
    template.singular_message,
    template.plural_message
  from public.rsvp_games as game
  join public.rsvp_game_message_templates as template
    on template.game_type = game.game_type
  where game.guest_id = public.current_guest_id()
    and game.is_active is true
  limit 1;
$$;

create or replace function public.complete_current_rsvp_game(p_game_id uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_play_count integer;
begin
  if public.current_guest_id() is null then
    raise exception 'An active invitation is required.' using errcode = '42501';
  end if;

  update public.rsvp_games as game
  set play_count = game.play_count + 1,
      last_completed_at = now(),
      updated_at = now()
  where game.id = p_game_id
    and game.guest_id = public.current_guest_id()
    and game.is_active is true
  returning game.play_count into new_play_count;

  if new_play_count is null then
    raise exception 'RSVP game not found for this invitation.'
      using errcode = 'P0002';
  end if;

  return new_play_count;
end;
$$;

create or replace function public.admin_set_rsvp_game_active(
  p_game_id uuid,
  p_is_active boolean
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  updated_count integer;
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.' using errcode = '42501';
  end if;

  if p_game_id is null or p_is_active is null then
    return false;
  end if;

  update public.rsvp_games as game
  set is_active = p_is_active,
      updated_at = now()
  where game.id = p_game_id;

  get diagnostics updated_count = row_count;
  return updated_count = 1;
end;
$$;

create or replace function public.admin_delete_rsvp_game(p_game_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  deleted_count integer;
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.' using errcode = '42501';
  end if;

  if p_game_id is null then
    return false;
  end if;

  delete from public.rsvp_games as game
  where game.id = p_game_id;

  get diagnostics deleted_count = row_count;
  return deleted_count = 1;
end;
$$;

revoke all on function public.admin_list_rsvp_games() from public, anon;
revoke all on function public.admin_list_rsvp_game_guests() from public, anon;
revoke all on function public.admin_list_rsvp_game_message_templates() from public, anon;
revoke all on function public.admin_save_rsvp_game(uuid, text, text[], text, boolean) from public, anon;
revoke all on function public.admin_create_rsvp_games_bulk(uuid[]) from public, anon;
revoke all on function public.admin_save_rsvp_game_message_template(text, text, text) from public, anon;
revoke all on function public.get_current_rsvp_game() from public, anon;
revoke all on function public.complete_current_rsvp_game(uuid) from public, anon;
revoke all on function public.admin_set_rsvp_game_active(uuid, boolean) from public, anon;
revoke all on function public.admin_delete_rsvp_game(uuid) from public, anon;

grant execute on function public.admin_list_rsvp_games() to authenticated;
grant execute on function public.admin_list_rsvp_game_guests() to authenticated;
grant execute on function public.admin_list_rsvp_game_message_templates() to authenticated;
grant execute on function public.admin_save_rsvp_game(uuid, text, text[], text, boolean) to authenticated;
grant execute on function public.admin_create_rsvp_games_bulk(uuid[]) to authenticated;
grant execute on function public.admin_save_rsvp_game_message_template(text, text, text) to authenticated;
grant execute on function public.get_current_rsvp_game() to authenticated;
grant execute on function public.complete_current_rsvp_game(uuid) to authenticated;
grant execute on function public.admin_set_rsvp_game_active(uuid, boolean) to authenticated;
grant execute on function public.admin_delete_rsvp_game(uuid) to authenticated;

commit;
