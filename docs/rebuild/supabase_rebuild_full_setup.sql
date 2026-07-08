-- ============================================================
-- Supabase rebuild: full clean setup
-- Site de Casamento - Livia & Messias
-- ============================================================
--
-- Use this file on a new empty Supabase project to create the
-- current production schema, functions, grants, triggers and RLS.
-- Historical phase, rollback and migration scripts are intentionally
-- kept as separate documentation, but are not required for a clean rebuild.
--
-- After running this script, configure Supabase Auth, create the admin
-- user, deploy the claim-invite Edge Function and run:
--   docs/rebuild/supabase_rebuild_verify_final.sql
-- ============================================================


-- ============================================================
-- Source: docs\rebuild\supabase_rebuild_01_base_schema.sql
-- ============================================================

-- ============================================================
-- Supabase rebuild: base application schema
-- Site de Casamento - Livia & Messias
-- ============================================================
--
-- Run this first on a new Supabase project.
-- Security tables, functions, policies and grants are added by later scripts.

begin;

create extension if not exists pgcrypto;

create table if not exists public.guests (
  id uuid not null default gen_random_uuid(),
  created_at timestamp with time zone null default timezone('utc'::text, now()),
  name text not null,
  invite_code text not null,
  max_guests integer null default 0,
  confirmed boolean null default false,
  active boolean null default true,
  access_count integer null default 0,
  last_access timestamp with time zone null,
  invite_type text null default 'individual',
  couple_members jsonb null,

  constraint guests_pkey primary key (id),
  constraint guests_invite_code_key unique (invite_code)
);

create table if not exists public.rsvps (
  id uuid not null default gen_random_uuid(),
  created_at timestamp with time zone null default timezone('utc'::text, now()),
  guest_id uuid null,
  presence text null,
  food text null,
  message text null,
  guest_data jsonb null,
  email text null,
  phone text null,
  updated_at timestamp with time zone null default timezone('utc'::text, now()),

  constraint rsvps_pkey primary key (id),
  constraint rsvps_guest_id_fkey
    foreign key (guest_id)
    references public.guests(id)
    on delete cascade
);

create table if not exists public.gifts (
  id uuid not null default gen_random_uuid(),
  created_at timestamp with time zone null default timezone('utc'::text, now()),
  category text not null,
  name text not null,
  description text null,
  price numeric null,
  image_url text null,
  status text null default 'Disponível',
  reserved_at timestamp with time zone null,
  reserved_name text null,
  reservation_message text null,
  reserved_guest_id uuid null,
  payment_status text null default 'Pendente',
  payment_reported_at timestamp with time zone null,
  card_payment_url text null,
  card_payment_provider text null,
  card_payment_reference text null,
  purchase_mode text null default 'money',
  external_purchase_options jsonb null default '[]'::jsonb,
  selected_purchase_method text null,
  selected_purchase_details jsonb null,
  gift_type text null default 'single',
  quota_count integer null,
  quota_value numeric null,

  constraint gifts_pkey primary key (id),
  constraint gifts_reserved_guest_id_fkey
    foreign key (reserved_guest_id)
    references public.guests(id)
    on delete set null
);

create table if not exists public.gift_contributions (
  id uuid not null default gen_random_uuid(),
  created_at timestamp with time zone null default timezone('utc'::text, now()),
  gift_id uuid not null,
  guest_id uuid null,
  contributor_name text null,
  message text null,
  quota_quantity integer not null default 1,
  quota_value numeric not null,
  total_value numeric not null,
  payment_status text null default 'Pendente',
  payment_method text null default 'pix',
  payment_reported_at timestamp with time zone null,
  pix_code text null,
  pix_qr_code_url text null,

  constraint gift_contributions_pkey primary key (id),
  constraint gift_contributions_gift_id_fkey
    foreign key (gift_id)
    references public.gifts(id)
    on delete cascade,
  constraint gift_contributions_guest_id_fkey
    foreign key (guest_id)
    references public.guests(id)
    on delete set null,
  constraint gift_contributions_quota_quantity_check
    check (quota_quantity > 0)
);

create table if not exists public.settings (
  id uuid not null default gen_random_uuid(),
  pix_key text null,
  whatsapp_number text null,
  merchant_name text null,
  merchant_city text null,
  buffet_paying_age integer not null default 7,
  bride_name text not null default 'Livia',
  groom_name text not null default 'Messias',
  wedding_date timestamptz not null default '2027-04-23 18:30:00-03',
  rsvp_deadline date not null default '2027-03-01',
  ceremony_name text not null default 'Santuário de Nossa Senhora de Fátima',
  ceremony_address text not null default 'Av. Treze de Maio, 200 - Fátima, Fortaleza - CE, 60040-530',
  ceremony_time time not null default '18:30',
  reception_name text not null default 'Martha''s Buffet Conceito',
  reception_address text not null default 'Av. Bezerra de Menezes, 531 - Parquelândia, Fortaleza - CE, 60325-004',
  reception_time time not null default '21:00',

  constraint settings_pkey primary key (id),
  constraint settings_buffet_paying_age_check
    check (buffet_paying_age between 1 and 18)
);

-- Do not expose the tables before the final RLS policies are installed.
alter table public.guests enable row level security;
alter table public.rsvps enable row level security;
alter table public.gifts enable row level security;
alter table public.gift_contributions enable row level security;
alter table public.settings enable row level security;

revoke all on table public.guests from anon, authenticated;
revoke all on table public.rsvps from anon, authenticated;
revoke all on table public.gifts from anon, authenticated;
revoke all on table public.gift_contributions from anon, authenticated;
revoke all on table public.settings from anon, authenticated;

commit;

-- ============================================================
-- Source: docs\migrations\security_phase_2_prepare.sql
-- ============================================================

-- ============================================================
-- Security phase 2: authentication support structures
-- Site de Casamento - Livia & Messias
-- ============================================================
--
-- This migration is intentionally non-disruptive:
-- - it does not enable RLS on the existing application tables;
-- - it does not revoke the permissions currently used by the frontend;
-- - it only creates the structures required by the new authentication flow.
--
-- Apply this file before changing the frontend authentication.

begin;

-- ============================================================
-- Administrator accounts
-- ============================================================

create table if not exists public.admin_users (
  user_id uuid not null,
  guest_id uuid not null,
  active boolean not null default true,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),

  constraint admin_users_pkey primary key (user_id),
  constraint admin_users_user_id_fkey
    foreign key (user_id)
    references auth.users(id)
    on delete cascade,
  constraint admin_users_guest_id_fkey
    foreign key (guest_id)
    references public.guests(id)
    on delete restrict,
  constraint admin_users_guest_id_key unique (guest_id)
);

comment on table public.admin_users is
  'Links Supabase Auth users to active administrator accounts.';

-- ============================================================
-- Guest access sessions
-- ============================================================

create table if not exists public.guest_access_sessions (
  user_id uuid not null,
  guest_id uuid not null,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  last_access timestamp with time zone not null default timezone('utc'::text, now()),
  revoked_at timestamp with time zone null,

  constraint guest_access_sessions_pkey primary key (user_id),
  constraint guest_access_sessions_user_id_fkey
    foreign key (user_id)
    references auth.users(id)
    on delete cascade,
  constraint guest_access_sessions_guest_id_fkey
    foreign key (guest_id)
    references public.guests(id)
    on delete cascade
);

create index if not exists guest_access_sessions_guest_id_idx
  on public.guest_access_sessions (guest_id);

create index if not exists guest_access_sessions_active_guest_idx
  on public.guest_access_sessions (guest_id)
  where revoked_at is null;

comment on table public.guest_access_sessions is
  'Links an authenticated anonymous Supabase user to one wedding invitation.';

-- ============================================================
-- Authorization helpers
-- ============================================================

create or replace function public.current_guest_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select access_link.guest_id
  from (
    select administrator.guest_id, 0 as priority
    from public.admin_users as administrator
    where administrator.user_id = (select auth.uid())
      and administrator.active is true

    union all

    select session.guest_id, 1 as priority
    from public.guest_access_sessions as session
    where session.user_id = (select auth.uid())
      and session.revoked_at is null
  ) as access_link
  inner join public.guests as guest
    on guest.id = access_link.guest_id
  where guest.active is true
  order by access_link.priority
  limit 1;
$$;

comment on function public.current_guest_id() is
  'Returns the active guest linked to the current Supabase Auth session.';

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users as administrator
    where administrator.user_id = (select auth.uid())
      and administrator.active is true
  );
$$;

comment on function public.is_admin() is
  'Returns whether the current Supabase Auth user is an active administrator.';

-- The helper functions are available only to authenticated sessions.
revoke all on function public.current_guest_id() from public;
revoke all on function public.current_guest_id() from anon;
grant execute on function public.current_guest_id() to authenticated;

revoke all on function public.is_admin() from public;
revoke all on function public.is_admin() from anon;
grant execute on function public.is_admin() to authenticated;

-- ============================================================
-- Protect the new internal tables immediately
-- ============================================================

alter table public.admin_users enable row level security;
alter table public.guest_access_sessions enable row level security;

revoke all on table public.admin_users from anon, authenticated;
revoke all on table public.guest_access_sessions from anon, authenticated;

grant select, insert, update, delete
  on table public.guest_access_sessions
  to service_role;

-- No direct policies are created here. These tables are managed by trusted
-- SQL/Edge Function operations using the service role. Authenticated clients
-- consume only the authorization helper functions above.

commit;

-- ============================================================
-- Source: docs\migrations\security_phase_3_claim_invite_prepare.sql
-- ============================================================

-- ============================================================
-- Security phase 3: claim-invite support
-- ============================================================
--
-- Creates the internal rate-limit table used by the claim-invite Edge
-- Function. This does not enable RLS on existing application tables.

begin;

create table if not exists public.invite_login_attempts (
  id bigint generated always as identity,
  user_id uuid not null,
  network_hash text not null,
  attempted_at timestamp with time zone not null
    default timezone('utc'::text, now()),
  success boolean not null default false,

  constraint invite_login_attempts_pkey primary key (id),
  constraint invite_login_attempts_user_id_fkey
    foreign key (user_id)
    references auth.users(id)
    on delete cascade
);

create index if not exists invite_login_attempts_user_recent_idx
  on public.invite_login_attempts (user_id, attempted_at desc)
  where success is false;

create index if not exists invite_login_attempts_network_recent_idx
  on public.invite_login_attempts (network_hash, attempted_at desc)
  where success is false;

alter table public.invite_login_attempts enable row level security;

revoke all on table public.invite_login_attempts from anon, authenticated;
revoke all on sequence public.invite_login_attempts_id_seq
  from anon, authenticated;

grant select, insert, update, delete
  on table public.invite_login_attempts
  to service_role;

grant usage, select
  on sequence public.invite_login_attempts_id_seq
  to service_role;

grant select, update
  on table public.guests
  to service_role;

comment on table public.invite_login_attempts is
  'Internal audit and rate-limit records for invite code validation.';

create or replace function public.register_guest_access(target_guest_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.guests
  set
    access_count = coalesce(access_count, 0) + 1,
    last_access = timezone('utc'::text, now())
  where id = target_guest_id
    and active is true;
$$;

revoke all on function public.register_guest_access(uuid) from public;
revoke all on function public.register_guest_access(uuid) from anon;
revoke all on function public.register_guest_access(uuid) from authenticated;
grant execute on function public.register_guest_access(uuid) to service_role;

commit;

-- ============================================================
-- Source: docs\migrations\security_phase_4_rls_prepare.sql
-- ============================================================

-- ============================================================
-- Security phase 4: RLS policies and safe guest operations
-- ============================================================
--
-- This script creates policies, triggers and RPCs, but intentionally does not
-- enable RLS on the existing application tables. Run the activation script
-- only after the public frontend has been migrated to Supabase Auth.

begin;

-- ============================================================
-- Safe current guest profile
-- ============================================================

create or replace function public.get_current_guest_profile()
returns table (
  id uuid,
  name text,
  max_guests integer,
  confirmed boolean,
  active boolean,
  invite_type text,
  couple_members jsonb
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    guest.id,
    guest.name,
    guest.max_guests,
    guest.confirmed,
    guest.active,
    guest.invite_type,
    guest.couple_members
  from public.guests as guest
  where guest.id = public.current_guest_id()
    and guest.active is true
  limit 1;
$$;

revoke all on function public.get_current_guest_profile() from public, anon;
grant execute on function public.get_current_guest_profile() to authenticated;

-- ============================================================
-- Safe gift catalog
-- ============================================================

create or replace function public.get_gift_catalog()
returns table (
  id uuid,
  created_at timestamp with time zone,
  category text,
  name text,
  description text,
  price numeric,
  image_url text,
  status text,
  reserved_at timestamp with time zone,
  reserved_name text,
  reservation_message text,
  reserved_guest_id uuid,
  payment_status text,
  payment_reported_at timestamp with time zone,
  card_payment_url text,
  purchase_mode text,
  external_purchase_options jsonb,
  selected_purchase_method text,
  selected_purchase_details jsonb,
  gift_type text,
  quota_count integer,
  quota_value numeric,
  quota_reserved_count bigint,
  quota_confirmed_count bigint,
  own_contributions jsonb
)
language sql
stable
security definer
set search_path = ''
as $$
  with current_access as (
    select public.current_guest_id() as guest_id
  )
  select
    gift.id,
    gift.created_at,
    gift.category,
    gift.name,
    gift.description,
    gift.price,
    gift.image_url,
    gift.status,
    case
      when gift.reserved_guest_id = access.guest_id then gift.reserved_at
      else null
    end,
    case
      when gift.reserved_guest_id = access.guest_id then gift.reserved_name
      else null
    end,
    case
      when gift.reserved_guest_id = access.guest_id
        then gift.reservation_message
      else null
    end,
    case
      when gift.reserved_guest_id = access.guest_id
        then gift.reserved_guest_id
      else null
    end,
    case
      when gift.reserved_guest_id = access.guest_id
        or gift.gift_type = 'quota'
        then gift.payment_status
      else null
    end,
    case
      when gift.reserved_guest_id = access.guest_id
        then gift.payment_reported_at
      else null
    end,
    gift.card_payment_url,
    gift.purchase_mode,
    gift.external_purchase_options,
    case
      when gift.reserved_guest_id = access.guest_id
        then gift.selected_purchase_method
      else null
    end,
    case
      when gift.reserved_guest_id = access.guest_id
        then gift.selected_purchase_details
      else null
    end,
    gift.gift_type,
    gift.quota_count,
    gift.quota_value,
    coalesce(contribution_totals.reserved_count, 0),
    coalesce(contribution_totals.confirmed_count, 0),
    coalesce(own_contributions.items, '[]'::jsonb)
  from public.gifts as gift
  cross join current_access as access
  left join lateral (
    select
      coalesce(sum(contribution.quota_quantity), 0)::bigint as reserved_count,
      coalesce(
        sum(contribution.quota_quantity)
          filter (where contribution.payment_status = 'Confirmado'),
        0
      )::bigint as confirmed_count
    from public.gift_contributions as contribution
    where contribution.gift_id = gift.id
  ) as contribution_totals on true
  left join lateral (
    select jsonb_agg(
      jsonb_build_object(
        'id', contribution.id,
        'gift_id', contribution.gift_id,
        'guest_id', contribution.guest_id,
        'contributor_name', contribution.contributor_name,
        'message', contribution.message,
        'quota_quantity', contribution.quota_quantity,
        'quota_value', contribution.quota_value,
        'total_value', contribution.total_value,
        'payment_status', contribution.payment_status,
        'payment_method', contribution.payment_method,
        'payment_reported_at', contribution.payment_reported_at,
        'created_at', contribution.created_at
      )
      order by contribution.created_at
    ) as items
    from public.gift_contributions as contribution
    where contribution.gift_id = gift.id
      and contribution.guest_id = access.guest_id
  ) as own_contributions on true
  where access.guest_id is not null
  order by gift.category, gift.name;
$$;

revoke all on function public.get_gift_catalog() from public, anon;
grant execute on function public.get_gift_catalog() to authenticated;

-- ============================================================
-- RSVP synchronization
-- ============================================================

create or replace function public.sync_guest_confirmation_from_rsvp()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  affected_guest_id uuid;
begin
  if tg_op = 'UPDATE' and old.guest_id is distinct from new.guest_id then
    update public.guests
    set confirmed = exists (
      select 1
      from public.rsvps
      where guest_id = old.guest_id
    )
    where id = old.guest_id;
  end if;

  affected_guest_id := case
    when tg_op = 'DELETE' then old.guest_id
    else new.guest_id
  end;

  update public.guests
  set confirmed = exists (
    select 1
    from public.rsvps
    where guest_id = affected_guest_id
  )
  where id = affected_guest_id;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

drop trigger if exists sync_guest_confirmation_after_rsvp
  on public.rsvps;

create trigger sync_guest_confirmation_after_rsvp
after insert or update or delete on public.rsvps
for each row execute function public.sync_guest_confirmation_from_rsvp();

revoke all on function public.sync_guest_confirmation_from_rsvp()
  from public, anon, authenticated;

-- ============================================================
-- Safe RSVP write
-- ============================================================

do $$
begin
  if exists (
    select guest_id
    from public.rsvps
    where guest_id is not null
    group by guest_id
    having count(*) > 1
  ) then
    raise exception
      'Duplicate RSVP rows found. Merge duplicates before preparing RLS.';
  end if;
end;
$$;

create unique index if not exists rsvps_guest_id_key
  on public.rsvps (guest_id)
  where guest_id is not null;

create or replace function public.save_current_rsvp(
  submitted_presence text,
  submitted_email text,
  submitted_phone text,
  submitted_food text,
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
  requested_guest_count integer;
  companion_count integer;
begin
  current_guest := public.current_guest_id();

  if current_guest is null
    or submitted_presence not in ('Sim', 'Não')
    or jsonb_typeof(coalesce(submitted_guest_data, '{}'::jsonb)) <> 'object'
  then
    return;
  end if;

  select *
  into guest_record
  from public.guests
  where id = current_guest
    and active is true;

  if not found then
    return;
  end if;

  begin
    requested_guest_count := coalesce(
      nullif(submitted_guest_data->>'guest_count', '')::integer,
      0
    );
  exception
    when invalid_text_representation then
      return;
  end;

  companion_count := case
    when jsonb_typeof(submitted_guest_data->'companions') = 'array'
      then jsonb_array_length(submitted_guest_data->'companions')
    else 0
  end;

  if requested_guest_count < 0
    or requested_guest_count > coalesce(guest_record.max_guests, 0)
    or companion_count <> requested_guest_count
    or (submitted_presence = 'Não' and requested_guest_count <> 0)
  then
    return;
  end if;

  safe_guest_data := jsonb_set(
    coalesce(submitted_guest_data, '{}'::jsonb),
    '{name}',
    to_jsonb(guest_record.name),
    true
  );

  return query
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
    current_guest,
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
    updated_at = excluded.updated_at
  returning *;
end;
$$;

revoke all on function public.save_current_rsvp(
  text,
  text,
  text,
  text,
  text,
  jsonb
) from public, anon;
grant execute on function public.save_current_rsvp(
  text,
  text,
  text,
  text,
  text,
  jsonb
) to authenticated;

-- ============================================================
-- Quota status synchronization
-- ============================================================

create or replace function public.recalculate_quota_gift_status(
  target_gift_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  total_quotas integer;
  reserved_quotas integer;
  confirmed_quotas integer;
  informed_quotas integer;
  next_status text;
  next_payment_status text;
begin
  select quota_count
  into total_quotas
  from public.gifts
  where id = target_gift_id
    and gift_type = 'quota';

  if not found then
    return;
  end if;

  select
    coalesce(sum(quota_quantity), 0)::integer,
    coalesce(
      sum(quota_quantity) filter (where payment_status = 'Confirmado'),
      0
    )::integer,
    coalesce(
      sum(quota_quantity) filter (where payment_status = 'Informado'),
      0
    )::integer
  into reserved_quotas, confirmed_quotas, informed_quotas
  from public.gift_contributions
  where gift_id = target_gift_id;

  next_status := 'Disponível';
  next_payment_status := null;

  if total_quotas > 0 and confirmed_quotas >= total_quotas then
    next_status := 'Comprado';
    next_payment_status := 'Confirmado';
  elsif total_quotas > 0 and reserved_quotas >= total_quotas then
    next_status := 'Reservado';
    next_payment_status := case
      when confirmed_quotas > 0 then 'Parcialmente confirmado'
      when informed_quotas > 0 then 'Parcialmente informado'
      else 'Pendente'
    end;
  elsif reserved_quotas > 0 then
    next_status := 'Parcial';
    next_payment_status := case
      when confirmed_quotas > 0 then 'Parcialmente confirmado'
      when informed_quotas > 0 then 'Parcialmente informado'
      else 'Pendente'
    end;
  end if;

  update public.gifts
  set
    status = next_status,
    payment_status = next_payment_status
  where id = target_gift_id;
end;
$$;

revoke all on function public.recalculate_quota_gift_status(uuid)
  from public, anon, authenticated;
grant execute on function public.recalculate_quota_gift_status(uuid)
  to service_role;

create or replace function public.sync_quota_gift_from_contribution()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    perform public.recalculate_quota_gift_status(old.gift_id);
    return old;
  end if;

  perform public.recalculate_quota_gift_status(new.gift_id);

  if tg_op = 'UPDATE' and old.gift_id is distinct from new.gift_id then
    perform public.recalculate_quota_gift_status(old.gift_id);
  end if;

  return new;
end;
$$;

drop trigger if exists sync_quota_gift_after_contribution
  on public.gift_contributions;

create trigger sync_quota_gift_after_contribution
after insert or update or delete on public.gift_contributions
for each row execute function public.sync_quota_gift_from_contribution();

revoke all on function public.sync_quota_gift_from_contribution()
  from public, anon, authenticated;

create or replace function public.sync_quota_gift_after_definition_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.recalculate_quota_gift_status(new.id);
  return new;
end;
$$;

drop trigger if exists sync_quota_gift_after_definition_change
  on public.gifts;

create trigger sync_quota_gift_after_definition_change
after update of quota_count, gift_type on public.gifts
for each row
when (
  old.quota_count is distinct from new.quota_count
  or old.gift_type is distinct from new.gift_type
)
execute function public.sync_quota_gift_after_definition_change();

revoke all on function public.sync_quota_gift_after_definition_change()
  from public, anon, authenticated;

-- ============================================================
-- Guest gift operations
-- ============================================================

create or replace function public.reserve_gift(
  target_gift_id uuid,
  reservation_message text default null
)
returns setof public.gifts
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_guest uuid;
  current_guest_name text;
begin
  current_guest := public.current_guest_id();

  if current_guest is null then
    raise exception 'Unauthorized';
  end if;

  select name
  into current_guest_name
  from public.guests
  where id = current_guest
    and active is true;

  if not found then
    return;
  end if;

  return query
  update public.gifts
  set
    status = 'Reservado',
    reserved_guest_id = current_guest,
    reserved_name = current_guest_name,
    reservation_message = left(coalesce($2, ''), 2000),
    reserved_at = timezone('utc'::text, now()),
    payment_status = 'Pendente',
    payment_reported_at = null,
    selected_purchase_method = null,
    selected_purchase_details = null
  where id = target_gift_id
    and coalesce(gift_type, 'single') <> 'quota'
    and reserved_guest_id is null
    and status = 'Disponível'
  returning *;
end;
$$;

revoke all on function public.reserve_gift(uuid, text)
  from public, anon;
grant execute on function public.reserve_gift(uuid, text)
  to authenticated;

create or replace function public.set_gift_purchase_method(
  target_gift_id uuid,
  purchase_method text,
  purchase_details jsonb default null
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_guest uuid;
  gift_record public.gifts%rowtype;
  safe_purchase_details jsonb;
  updated_count integer;
begin
  current_guest := public.current_guest_id();

  if current_guest is null
    or $2 not in ('pix', 'card', 'online', 'physical') then
    return false;
  end if;

  select *
  into gift_record
  from public.gifts
  where id = target_gift_id
    and reserved_guest_id = current_guest
    and coalesce(gift_type, 'single') <> 'quota'
  for update;

  if not found then
    return false;
  end if;

  if $2 = 'pix' then
    safe_purchase_details := jsonb_build_object('type', 'pix');
  elsif $2 = 'card' then
    if nullif(gift_record.card_payment_url, '') is null then
      return false;
    end if;

    safe_purchase_details := jsonb_build_object(
      'type',
      'card',
      'url',
      gift_record.card_payment_url
    );
  elsif $3 is null then
    safe_purchase_details := null;
  elsif not exists (
    select 1
    from jsonb_array_elements(
      case
        when jsonb_typeof(gift_record.external_purchase_options) = 'array'
          then gift_record.external_purchase_options
        else '[]'::jsonb
      end
    ) as option
    where option = $3
      and option->>'type' = $2
  ) then
    return false;
  else
    safe_purchase_details := $3;
  end if;

  update public.gifts
  set
    selected_purchase_method = $2,
    selected_purchase_details = safe_purchase_details
  where id = target_gift_id
    and reserved_guest_id = current_guest
    and coalesce(gift_type, 'single') <> 'quota';

  get diagnostics updated_count = row_count;
  return updated_count = 1;
end;
$$;

revoke all on function public.set_gift_purchase_method(uuid, text, jsonb)
  from public, anon;
grant execute on function public.set_gift_purchase_method(uuid, text, jsonb)
  to authenticated;

create or replace function public.report_gift_payment(target_gift_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_guest uuid;
  updated_count integer;
begin
  current_guest := public.current_guest_id();

  if current_guest is null then
    return false;
  end if;

  update public.gifts
  set
    payment_status = 'Informado',
    payment_reported_at = timezone('utc'::text, now()),
    selected_purchase_method = coalesce(selected_purchase_method, 'pix')
  where id = target_gift_id
    and reserved_guest_id = current_guest
    and coalesce(gift_type, 'single') <> 'quota'
    and coalesce(payment_status, 'Pendente') <> 'Confirmado';

  get diagnostics updated_count = row_count;
  return updated_count = 1;
end;
$$;

revoke all on function public.report_gift_payment(uuid) from public, anon;
grant execute on function public.report_gift_payment(uuid) to authenticated;

create or replace function public.reserve_gift_quotas(
  target_gift_id uuid,
  contribution_message text,
  requested_quantity integer
)
returns setof public.gift_contributions
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_guest uuid;
  current_guest_name text;
  gift_record public.gifts%rowtype;
  reserved_quantity integer;
  available_quantity integer;
  effective_quota_value numeric;
begin
  current_guest := public.current_guest_id();

  if current_guest is null or requested_quantity <= 0 then
    return;
  end if;

  select name
  into current_guest_name
  from public.guests
  where id = current_guest
    and active is true;

  if not found then
    return;
  end if;

  select *
  into gift_record
  from public.gifts
  where id = target_gift_id
    and gift_type = 'quota'
  for update;

  if not found or coalesce(gift_record.quota_count, 0) <= 0 then
    return;
  end if;

  select coalesce(sum(quota_quantity), 0)::integer
  into reserved_quantity
  from public.gift_contributions
  where gift_id = target_gift_id;

  available_quantity := gift_record.quota_count - reserved_quantity;

  if available_quantity < requested_quantity then
    return;
  end if;

  effective_quota_value := coalesce(
    nullif(gift_record.quota_value, 0),
    gift_record.price / nullif(gift_record.quota_count, 0)
  );

  if effective_quota_value is null or effective_quota_value <= 0 then
    return;
  end if;

  return query
  insert into public.gift_contributions (
    gift_id,
    guest_id,
    contributor_name,
    message,
    quota_quantity,
    quota_value,
    total_value,
    payment_status,
    payment_method
  )
  values (
    target_gift_id,
    current_guest,
    left(current_guest_name, 200),
    left(coalesce(contribution_message, ''), 2000),
    requested_quantity,
    effective_quota_value,
    requested_quantity * effective_quota_value,
    'Pendente',
    'pix'
  )
  returning *;
end;
$$;

revoke all on function public.reserve_gift_quotas(
  uuid,
  text,
  integer
) from public, anon;
grant execute on function public.reserve_gift_quotas(
  uuid,
  text,
  integer
) to authenticated;

create or replace function public.report_gift_contribution_payment(
  target_contribution_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_guest uuid;
  updated_count integer;
begin
  current_guest := public.current_guest_id();

  if current_guest is null then
    return false;
  end if;

  update public.gift_contributions
  set
    payment_status = 'Informado',
    payment_reported_at = timezone('utc'::text, now())
  where id = target_contribution_id
    and guest_id = current_guest
    and coalesce(payment_status, 'Pendente') <> 'Confirmado';

  get diagnostics updated_count = row_count;
  return updated_count = 1;
end;
$$;

revoke all on function public.report_gift_contribution_payment(uuid)
  from public, anon;
grant execute on function public.report_gift_contribution_payment(uuid)
  to authenticated;

-- ============================================================
-- RLS policies (created now, enforced only after activation)
-- ============================================================

drop policy if exists guests_admin_all on public.guests;
create policy guests_admin_all
on public.guests
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists guests_select_own on public.guests;
create policy guests_select_own
on public.guests
for select
to authenticated
using (id = public.current_guest_id());

drop policy if exists rsvps_admin_all on public.rsvps;
create policy rsvps_admin_all
on public.rsvps
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists rsvps_select_own on public.rsvps;
create policy rsvps_select_own
on public.rsvps
for select
to authenticated
using (guest_id = public.current_guest_id());

drop policy if exists gifts_admin_all on public.gifts;
create policy gifts_admin_all
on public.gifts
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists gifts_select_accessible on public.gifts;
create policy gifts_select_accessible
on public.gifts
for select
to authenticated
using (
  reserved_guest_id = public.current_guest_id()
);

drop policy if exists gift_contributions_admin_all
  on public.gift_contributions;
create policy gift_contributions_admin_all
on public.gift_contributions
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists gift_contributions_select_own
  on public.gift_contributions;
create policy gift_contributions_select_own
on public.gift_contributions
for select
to authenticated
using (guest_id = public.current_guest_id());

drop policy if exists settings_admin_all on public.settings;
create policy settings_admin_all
on public.settings
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists settings_select_authenticated on public.settings;
create policy settings_select_authenticated
on public.settings
for select
to authenticated
using (public.current_guest_id() is not null or public.is_admin());

commit;

-- ============================================================
-- Source: docs\migrations\security_guest_rsvp_validation.sql
-- ============================================================

-- ============================================================
-- Harden validation of RSVPs submitted by invited guests
-- ============================================================

begin;

create or replace function public.save_current_rsvp(
  submitted_presence text,
  submitted_email text,
  submitted_phone text,
  submitted_food text,
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
  requested_guest_count integer;
  companion_count integer;
  submitted_member_count integer;
  expected_member_count integer;
  member_is_coming boolean;
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

  return query
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
    current_guest,
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
    updated_at = excluded.updated_at
  returning *;
end;
$$;

comment on function public.save_current_rsvp(
  text,
  text,
  text,
  text,
  text,
  jsonb
) is
  'Validates and saves the current guest RSVP using canonical invitation data.';

revoke all on function public.save_current_rsvp(
  text,
  text,
  text,
  text,
  text,
  jsonb
) from public, anon;
grant execute on function public.save_current_rsvp(
  text,
  text,
  text,
  text,
  text,
  jsonb
) to authenticated;

commit;

-- ============================================================
-- Source: docs\migrations\security_guest_gift_payment_validation.sql
-- ============================================================

-- ============================================================
-- Harden guest gift purchase method and payment reporting
-- ============================================================

begin;

create or replace function public.set_gift_purchase_method(
  target_gift_id uuid,
  purchase_method text,
  purchase_details jsonb default null
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_guest uuid;
  gift_record public.gifts%rowtype;
  safe_purchase_details jsonb;
  normalized_purchase_mode text;
  updated_count integer;
begin
  current_guest := public.current_guest_id();

  if current_guest is null
    or purchase_method is null
    or purchase_method not in ('pix', 'card', 'online', 'physical')
  then
    return false;
  end if;

  select *
  into gift_record
  from public.gifts
  where id = target_gift_id
    and reserved_guest_id = current_guest
    and coalesce(gift_type, 'single') <> 'quota'
  for update;

  if not found
    or gift_record.payment_status = 'Confirmado'
  then
    return false;
  end if;

  normalized_purchase_mode := coalesce(gift_record.purchase_mode, 'money');

  if normalized_purchase_mode = 'money'
    and purchase_method not in ('pix', 'card')
  then
    return false;
  end if;

  if normalized_purchase_mode = 'external'
    and purchase_method not in ('online', 'physical')
  then
    return false;
  end if;

  if normalized_purchase_mode not in ('money', 'external', 'hybrid') then
    return false;
  end if;

  if purchase_method = 'pix' then
    if gift_record.price is null or gift_record.price <= 0 then
      return false;
    end if;

    safe_purchase_details := jsonb_build_object('type', 'pix');
  elsif purchase_method = 'card' then
    if gift_record.price is null
      or gift_record.price <= 0
      or nullif(gift_record.card_payment_url, '') is null
    then
      return false;
    end if;

    safe_purchase_details := jsonb_build_object(
      'type', 'card',
      'url', gift_record.card_payment_url
    );
  elsif purchase_details is null then
    -- Suggested stores are optional; the guest may buy elsewhere.
    safe_purchase_details := jsonb_build_object('type', purchase_method);
  elsif not exists (
    select 1
    from jsonb_array_elements(
      case
        when jsonb_typeof(gift_record.external_purchase_options) = 'array'
          then gift_record.external_purchase_options
        else '[]'::jsonb
      end
    ) as option
    where option = purchase_details
      and option ->> 'type' = purchase_method
  ) then
    return false;
  else
    safe_purchase_details := purchase_details;
  end if;

  update public.gifts
  set
    selected_purchase_method = purchase_method,
    selected_purchase_details = safe_purchase_details
  where id = target_gift_id
    and reserved_guest_id = current_guest
    and coalesce(gift_type, 'single') <> 'quota'
    and coalesce(payment_status, 'Pendente') <> 'Confirmado';

  get diagnostics updated_count = row_count;
  return updated_count = 1;
end;
$$;

create or replace function public.report_gift_payment(target_gift_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_guest uuid;
  updated_count integer;
begin
  current_guest := public.current_guest_id();

  if current_guest is null then
    return false;
  end if;

  update public.gifts
  set
    payment_status = 'Informado',
    payment_reported_at = timezone('utc'::text, now())
  where id = target_gift_id
    and reserved_guest_id = current_guest
    and coalesce(gift_type, 'single') <> 'quota'
    and coalesce(payment_status, 'Pendente') <> 'Confirmado'
    and (
      (
        coalesce(purchase_mode, 'money') = 'money'
        and selected_purchase_method in ('pix', 'card')
        and selected_purchase_details is not null
      )
      or (
        purchase_mode = 'hybrid'
        and selected_purchase_method in ('pix', 'card')
        and selected_purchase_details is not null
      )
      or (
        purchase_mode in ('external', 'hybrid')
        and selected_purchase_method in ('online', 'physical')
        and selected_purchase_details ->> 'type'
          = selected_purchase_method
      )
    );

  get diagnostics updated_count = row_count;
  return updated_count = 1;
end;
$$;

comment on function public.set_gift_purchase_method(uuid, text, jsonb) is
  'Stores only purchase methods allowed by the reserved gift configuration.';
comment on function public.report_gift_payment(uuid) is
  'Reports payment only after a compatible purchase method was selected.';

revoke all on function public.set_gift_purchase_method(uuid, text, jsonb)
  from public, anon;
revoke all on function public.report_gift_payment(uuid) from public, anon;
grant execute on function public.set_gift_purchase_method(uuid, text, jsonb)
  to authenticated;
grant execute on function public.report_gift_payment(uuid) to authenticated;

commit;

-- ============================================================
-- Source: docs\migrations\security_invite_code_generation.sql
-- ============================================================

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
  integer,
  boolean
);

create or replace function public.create_guest_with_invite_code(
  p_name text,
  p_invite_type text default 'individual',
  p_couple_members jsonb default null,
  p_max_guests integer default 0
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
  integer
) is
  'Creates a guest as an authenticated administrator and generates a secure invitation code.';

revoke all on function public.create_guest_with_invite_code(
  text,
  text,
  jsonb,
  integer
) from public;

revoke all on function public.create_guest_with_invite_code(
  text,
  text,
  jsonb,
  integer
) from anon;

grant execute on function public.create_guest_with_invite_code(
  text,
  text,
  jsonb,
  integer
) to authenticated;

-- New guests must be created through the RPC. Existing guests can still be
-- selected, updated and deleted by the administrative RLS policy.
revoke insert on table public.guests from authenticated;

commit;

-- ============================================================
-- Source: docs\migrations\security_admin_gift_operations.sql
-- ============================================================

-- ============================================================
-- Secure administrative gift and contribution operations
-- ============================================================
--
-- Run this script once in an existing secured Supabase project. Clean
-- rebuilds also execute this file as part of the documented sequence.

begin;

create or replace function public.admin_confirm_gift_purchase(
  target_gift_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
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

  perform 1
  from public.gifts
  where id = target_gift_id
    and coalesce(gift_type, 'single') <> 'quota'
    and reserved_guest_id is not null
  for update;

  if not found then
    return false;
  end if;

  update public.gifts
  set
    status = 'Comprado',
    payment_status = 'Confirmado'
  where id = target_gift_id;

  return true;
end;
$$;

create or replace function public.admin_release_gift_reservation(
  target_gift_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
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

  perform 1
  from public.gifts
  where id = target_gift_id
    and coalesce(gift_type, 'single') <> 'quota'
    and reserved_guest_id is not null
  for update;

  if not found then
    return false;
  end if;

  update public.gifts
  set
    status = 'Disponível',
    reserved_guest_id = null,
    reserved_name = null,
    reservation_message = null,
    reserved_at = null,
    payment_status = null,
    payment_reported_at = null,
    selected_purchase_method = null,
    selected_purchase_details = null,
    card_payment_reference = null
  where id = target_gift_id;

  return true;
end;
$$;

create or replace function public.admin_confirm_gift_contribution(
  target_contribution_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
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

  perform 1
  from public.gift_contributions as contribution
  inner join public.gifts as gift
    on gift.id = contribution.gift_id
  where contribution.id = target_contribution_id
    and gift.gift_type = 'quota'
  for update of contribution;

  if not found then
    return false;
  end if;

  update public.gift_contributions
  set payment_status = 'Confirmado'
  where id = target_contribution_id;

  -- The contribution trigger recalculates the parent gift in this transaction.
  return true;
end;
$$;

create or replace function public.admin_release_gift_contribution(
  target_contribution_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  deleted_contribution_id uuid;
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

  delete from public.gift_contributions as contribution
  using public.gifts as gift
  where contribution.id = target_contribution_id
    and gift.id = contribution.gift_id
    and gift.gift_type = 'quota'
  returning contribution.id into deleted_contribution_id;

  -- The contribution trigger recalculates the parent gift in this transaction.
  return deleted_contribution_id is not null;
end;
$$;

comment on function public.admin_confirm_gift_purchase(uuid) is
  'Confirms an individual gift purchase as an authenticated administrator.';
comment on function public.admin_release_gift_reservation(uuid) is
  'Releases an individual gift reservation as an authenticated administrator.';
comment on function public.admin_confirm_gift_contribution(uuid) is
  'Confirms a quota contribution and atomically refreshes its gift status.';
comment on function public.admin_release_gift_contribution(uuid) is
  'Deletes a quota contribution and atomically refreshes its gift status.';

revoke all on function public.admin_confirm_gift_purchase(uuid)
  from public, anon;
revoke all on function public.admin_release_gift_reservation(uuid)
  from public, anon;
revoke all on function public.admin_confirm_gift_contribution(uuid)
  from public, anon;
revoke all on function public.admin_release_gift_contribution(uuid)
  from public, anon;

grant execute on function public.admin_confirm_gift_purchase(uuid)
  to authenticated;
grant execute on function public.admin_release_gift_reservation(uuid)
  to authenticated;
grant execute on function public.admin_confirm_gift_contribution(uuid)
  to authenticated;
grant execute on function public.admin_release_gift_contribution(uuid)
  to authenticated;

-- Contributions are mutated only through guest or administrative RPCs.
revoke insert, update, delete
  on table public.gift_contributions
  from authenticated;

commit;

-- ============================================================
-- Source: docs\migrations\security_admin_rsvp_operations.sql
-- ============================================================

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

-- ============================================================
-- Source: docs\migrations\security_admin_guest_operations.sql
-- ============================================================

-- ============================================================
-- Secure administrative guest operations
-- ============================================================

begin;

drop function if exists public.admin_update_guest(
  uuid,
  text,
  text,
  jsonb,
  integer,
  boolean
);

create or replace function public.admin_update_guest(
  target_guest_id uuid,
  p_name text,
  p_invite_type text,
  p_couple_members jsonb,
  p_max_guests integer
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
    max_guests = p_max_guests
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

comment on function public.admin_update_guest(
  uuid,
  text,
  text,
  jsonb,
  integer
) is
  'Validates and updates a guest without exposing direct table writes.';

comment on function public.admin_set_guest_active(uuid, boolean) is
  'Changes guest access and synchronizes invitation sessions atomically.';

revoke all on function public.admin_update_guest(
  uuid,
  text,
  text,
  jsonb,
  integer
) from public, anon;
revoke all on function public.admin_set_guest_active(uuid, boolean)
  from public, anon;

grant execute on function public.admin_update_guest(
  uuid,
  text,
  text,
  jsonb,
  integer
) to authenticated;
grant execute on function public.admin_set_guest_active(uuid, boolean)
  to authenticated;

-- All guest mutations now use trusted RPCs or the claim-invite service role.
revoke insert, update, delete on table public.guests from authenticated;

commit;

-- ============================================================
-- Source: docs\migrations\security_admin_gift_catalog_operations.sql
-- ============================================================

-- ============================================================
-- Secure administrative gift catalog operations
-- ============================================================

begin;

create or replace function public.admin_save_gift(
  target_gift_id uuid,
  submitted_category text,
  submitted_name text,
  submitted_description text,
  submitted_price numeric,
  submitted_image_url text,
  submitted_gift_type text,
  submitted_quota_count integer,
  submitted_purchase_mode text,
  submitted_card_payment_url text,
  submitted_external_options jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  existing_gift public.gifts%rowtype;
  saved_gift_id uuid;
  safe_category text;
  safe_name text;
  safe_description text;
  safe_image_url text;
  safe_gift_type text;
  safe_purchase_mode text;
  safe_card_payment_url text;
  safe_external_options jsonb := '[]'::jsonb;
  safe_price numeric;
  safe_quota_count integer;
  safe_quota_value numeric;
  has_activity boolean;
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

  safe_category := nullif(btrim(submitted_category), '');
  safe_name := nullif(btrim(submitted_name), '');
  safe_description := left(btrim(coalesce(submitted_description, '')), 4000);
  safe_image_url := left(btrim(coalesce(submitted_image_url, '')), 2000);
  safe_gift_type := lower(nullif(btrim(submitted_gift_type), ''));
  safe_purchase_mode := lower(nullif(btrim(submitted_purchase_mode), ''));
  safe_card_payment_url := left(
    btrim(coalesce(submitted_card_payment_url, '')),
    2000
  );
  safe_price := submitted_price;
  safe_quota_count := submitted_quota_count;

  if safe_category is null
    or safe_name is null
    or safe_gift_type is null
    or safe_gift_type not in ('single', 'quota')
    or safe_purchase_mode is null
    or safe_purchase_mode not in ('money', 'external', 'hybrid')
    or (safe_price is not null and safe_price <= 0)
    or (
      safe_card_payment_url <> ''
      and safe_card_payment_url !~* '^https?://'
    )
  then
    return null;
  end if;

  if safe_gift_type = 'quota' then
    if safe_price is null
      or safe_quota_count is null
      or safe_quota_count <= 0
    then
      return null;
    end if;

    safe_purchase_mode := 'money';
    safe_external_options := '[]'::jsonb;
    safe_quota_value := safe_price / safe_quota_count;
  else
    safe_quota_count := null;
    safe_quota_value := null;

    if safe_purchase_mode in ('money', 'hybrid') and safe_price is null then
      return null;
    end if;

    if safe_purchase_mode = 'money' then
      safe_external_options := '[]'::jsonb;
    else
      if jsonb_typeof(coalesce(submitted_external_options, '[]'::jsonb))
          <> 'array'
        or exists (
          select 1
          from jsonb_array_elements(
            coalesce(submitted_external_options, '[]'::jsonb)
          ) as option
          where jsonb_typeof(option) <> 'object'
            or option ->> 'type' is null
            or option ->> 'type' not in ('online', 'physical')
            or nullif(btrim(option ->> 'store'), '') is null
            or (
              option ->> 'type' = 'online'
              and coalesce(option ->> 'url', '') !~* '^https?://'
            )
        )
      then
        return null;
      end if;

      select coalesce(
        jsonb_agg(
          jsonb_build_object(
            'type', option ->> 'type',
            'store', left(btrim(option ->> 'store'), 200),
            'url', case
              when option ->> 'type' = 'online'
                then left(btrim(option ->> 'url'), 2000)
              else ''
            end,
            'notes', left(btrim(coalesce(option ->> 'notes', '')), 1000)
          )
          order by position
        ),
        '[]'::jsonb
      )
      into safe_external_options
      from jsonb_array_elements(
        coalesce(submitted_external_options, '[]'::jsonb)
      )
        with ordinality as options(option, position);
    end if;
  end if;

  if target_gift_id is null then
    insert into public.gifts (
      category,
      name,
      description,
      price,
      image_url,
      status,
      payment_status,
      gift_type,
      quota_count,
      quota_value,
      purchase_mode,
      card_payment_url,
      external_purchase_options
    )
    values (
      left(safe_category, 200),
      left(safe_name, 300),
      safe_description,
      safe_price,
      safe_image_url,
      'Disponível',
      null,
      safe_gift_type,
      safe_quota_count,
      safe_quota_value,
      safe_purchase_mode,
      safe_card_payment_url,
      safe_external_options
    )
    returning id into saved_gift_id;

    return saved_gift_id;
  end if;

  select *
  into existing_gift
  from public.gifts
  where id = target_gift_id
  for update;

  if not found then
    return null;
  end if;

  has_activity := existing_gift.reserved_guest_id is not null
    or existing_gift.status in ('Parcial', 'Reservado', 'Comprado')
    or exists (
      select 1
      from public.gift_contributions as contribution
      where contribution.gift_id = target_gift_id
    );

  if has_activity and (
    existing_gift.gift_type is distinct from safe_gift_type
    or existing_gift.price is distinct from safe_price
    or existing_gift.quota_count is distinct from safe_quota_count
    or existing_gift.purchase_mode is distinct from safe_purchase_mode
    or coalesce(existing_gift.card_payment_url, '')
      is distinct from safe_card_payment_url
    or coalesce(existing_gift.external_purchase_options, '[]'::jsonb)
      is distinct from safe_external_options
  ) then
    return null;
  end if;

  update public.gifts
  set
    category = left(safe_category, 200),
    name = left(safe_name, 300),
    description = safe_description,
    price = safe_price,
    image_url = safe_image_url,
    gift_type = safe_gift_type,
    quota_count = safe_quota_count,
    quota_value = safe_quota_value,
    purchase_mode = safe_purchase_mode,
    card_payment_url = safe_card_payment_url,
    external_purchase_options = safe_external_options
  where id = target_gift_id
  returning id into saved_gift_id;

  return saved_gift_id;
end;
$$;

create or replace function public.admin_delete_gift(target_gift_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  deleted_gift_id uuid;
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

  delete from public.gifts
  where id = target_gift_id
  returning id into deleted_gift_id;

  return deleted_gift_id is not null;
end;
$$;

comment on function public.admin_save_gift(
  uuid,
  text,
  text,
  text,
  numeric,
  text,
  text,
  integer,
  text,
  text,
  jsonb
) is
  'Validates and creates or updates a gift as an administrator.';
comment on function public.admin_delete_gift(uuid) is
  'Deletes a gift and its quota contributions as an administrator.';

revoke all on function public.admin_save_gift(
  uuid,
  text,
  text,
  text,
  numeric,
  text,
  text,
  integer,
  text,
  text,
  jsonb
) from public, anon;
revoke all on function public.admin_delete_gift(uuid) from public, anon;

grant execute on function public.admin_save_gift(
  uuid,
  text,
  text,
  text,
  numeric,
  text,
  text,
  integer,
  text,
  text,
  jsonb
) to authenticated;
grant execute on function public.admin_delete_gift(uuid) to authenticated;

-- All gift mutations now use guest or administrative RPCs.
revoke insert, update, delete on table public.gifts from authenticated;

commit;

-- ============================================================
-- Source: docs\migrations\security_admin_settings_operations.sql
-- ============================================================

-- ============================================================
-- Secure administrative global settings operation
-- ============================================================

begin;

do $$
begin
  if (select count(*) from public.settings) > 1 then
    raise exception
      'Multiple settings rows found. Merge them before installing the singleton constraint.';
  end if;
end;
$$;

create unique index if not exists settings_singleton_idx
  on public.settings ((true));

drop function if exists public.admin_save_settings(
  text,
  text,
  text,
  text,
  integer
);

create or replace function public.admin_save_settings(
  submitted_pix_key text,
  submitted_merchant_name text,
  submitted_merchant_city text,
  submitted_whatsapp_number text,
  submitted_buffet_paying_age integer,
  submitted_event_settings jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  settings_id uuid;
  safe_pix_key text;
  safe_merchant_name text;
  safe_merchant_city text;
  safe_whatsapp_number text;
  safe_bride_name text;
  safe_groom_name text;
  safe_wedding_date timestamptz;
  safe_rsvp_deadline date;
  safe_ceremony_name text;
  safe_ceremony_address text;
  safe_ceremony_time time;
  safe_reception_name text;
  safe_reception_address text;
  safe_reception_time time;
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

  safe_pix_key := nullif(btrim(submitted_pix_key), '');
  safe_merchant_name := nullif(btrim(submitted_merchant_name), '');
  safe_merchant_city := nullif(btrim(submitted_merchant_city), '');
  safe_whatsapp_number := regexp_replace(
    coalesce(submitted_whatsapp_number, ''),
    '[^0-9]',
    '',
    'g'
  );
  safe_bride_name := nullif(btrim(submitted_event_settings->>'bride_name'), '');
  safe_groom_name := nullif(btrim(submitted_event_settings->>'groom_name'), '');
  safe_ceremony_name := nullif(btrim(submitted_event_settings->>'ceremony_name'), '');
  safe_ceremony_address := nullif(btrim(submitted_event_settings->>'ceremony_address'), '');
  safe_reception_name := nullif(btrim(submitted_event_settings->>'reception_name'), '');
  safe_reception_address := nullif(btrim(submitted_event_settings->>'reception_address'), '');

  if coalesce(submitted_event_settings->>'wedding_date', '') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T'
    or coalesce(submitted_event_settings->>'rsvp_deadline', '') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
    or coalesce(submitted_event_settings->>'ceremony_time', '') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]'
    or coalesce(submitted_event_settings->>'reception_time', '') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]'
  then
    return null;
  end if;

  safe_wedding_date := (submitted_event_settings->>'wedding_date')::timestamptz;
  safe_rsvp_deadline := (submitted_event_settings->>'rsvp_deadline')::date;
  safe_ceremony_time := (submitted_event_settings->>'ceremony_time')::time;
  safe_reception_time := (submitted_event_settings->>'reception_time')::time;

  if safe_pix_key is null
    or length(safe_pix_key) > 200
    or safe_merchant_name is null
    or length(safe_merchant_name) > 200
    or safe_merchant_city is null
    or length(safe_merchant_city) > 100
    or safe_whatsapp_number !~ '^55[0-9]{10,11}$'
    or submitted_buffet_paying_age is null
    or submitted_buffet_paying_age not between 1 and 18
    or safe_bride_name is null or length(safe_bride_name) > 100
    or safe_groom_name is null or length(safe_groom_name) > 100
    or safe_ceremony_name is null or length(safe_ceremony_name) > 200
    or safe_ceremony_address is null or length(safe_ceremony_address) > 500
    or safe_reception_name is null or length(safe_reception_name) > 200
    or safe_reception_address is null or length(safe_reception_address) > 500
    or safe_rsvp_deadline > safe_wedding_date::date
  then
    return null;
  end if;

  lock table public.settings in share row exclusive mode;

  select id
  into settings_id
  from public.settings
  limit 1;

  if settings_id is null then
    insert into public.settings (
      pix_key,
      merchant_name,
      merchant_city,
      whatsapp_number,
      buffet_paying_age,
      bride_name,
      groom_name,
      wedding_date,
      rsvp_deadline,
      ceremony_name,
      ceremony_address,
      ceremony_time,
      reception_name,
      reception_address,
      reception_time
    )
    values (
      safe_pix_key,
      safe_merchant_name,
      safe_merchant_city,
      safe_whatsapp_number,
      submitted_buffet_paying_age,
      safe_bride_name,
      safe_groom_name,
      safe_wedding_date,
      safe_rsvp_deadline,
      safe_ceremony_name,
      safe_ceremony_address,
      safe_ceremony_time,
      safe_reception_name,
      safe_reception_address,
      safe_reception_time
    )
    returning id into settings_id;
  else
    update public.settings
    set
      pix_key = safe_pix_key,
      merchant_name = safe_merchant_name,
      merchant_city = safe_merchant_city,
      whatsapp_number = safe_whatsapp_number,
      buffet_paying_age = submitted_buffet_paying_age,
      bride_name = safe_bride_name,
      groom_name = safe_groom_name,
      wedding_date = safe_wedding_date,
      rsvp_deadline = safe_rsvp_deadline,
      ceremony_name = safe_ceremony_name,
      ceremony_address = safe_ceremony_address,
      ceremony_time = safe_ceremony_time,
      reception_name = safe_reception_name,
      reception_address = safe_reception_address,
      reception_time = safe_reception_time
    where id = settings_id;
  end if;

  return settings_id;
end;
$$;

comment on function public.admin_save_settings(
  text,
  text,
  text,
  text,
  integer,
  jsonb
) is
  'Validates and saves the singleton wedding settings as an administrator.';

revoke all on function public.admin_save_settings(
  text,
  text,
  text,
  text,
  integer,
  jsonb
) from public, anon;

grant execute on function public.admin_save_settings(
  text,
  text,
  text,
  text,
  integer,
  jsonb
) to authenticated;

revoke insert, update, delete on table public.settings from authenticated;

commit;

-- ============================================================
-- Source: docs\migrations\security_public_settings_access.sql
-- ============================================================

-- ============================================================
-- Restricted public settings access
-- ============================================================

begin;

drop function if exists public.get_public_settings();

create function public.get_public_settings()
returns table (
  pix_key text,
  merchant_name text,
  merchant_city text,
  whatsapp_number text,
  buffet_paying_age integer,
  bride_name text,
  groom_name text,
  wedding_date timestamptz,
  rsvp_deadline date,
  ceremony_name text,
  ceremony_address text,
  ceremony_time time,
  reception_name text,
  reception_address text,
  reception_time time
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if public.current_guest_id() is null and not public.is_admin() then
    raise exception 'Authenticated guest or administrator access required.'
      using errcode = '42501';
  end if;

  return query
  select
    configuration.pix_key,
    configuration.merchant_name,
    configuration.merchant_city,
    configuration.whatsapp_number,
    configuration.buffet_paying_age,
    configuration.bride_name,
    configuration.groom_name,
    configuration.wedding_date,
    configuration.rsvp_deadline,
    configuration.ceremony_name,
    configuration.ceremony_address,
    configuration.ceremony_time,
    configuration.reception_name,
    configuration.reception_address,
    configuration.reception_time
  from public.settings as configuration
  limit 1;
end;
$$;

comment on function public.get_public_settings() is
  'Returns only the settings fields explicitly exposed to guests and administrators.';

revoke all on function public.get_public_settings() from public, anon;
grant execute on function public.get_public_settings() to authenticated;

drop function if exists public.get_public_event_settings();

create or replace function public.get_public_event_settings()
returns table (
  bride_name text,
  groom_name text,
  wedding_date timestamptz,
  rsvp_deadline date,
  ceremony_name text,
  ceremony_address text,
  ceremony_time time,
  reception_name text,
  reception_address text,
  reception_time time
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    configuration.bride_name,
    configuration.groom_name,
    configuration.wedding_date,
    configuration.rsvp_deadline,
    configuration.ceremony_name,
    configuration.ceremony_address,
    configuration.ceremony_time,
    configuration.reception_name,
    configuration.reception_address,
    configuration.reception_time
  from public.settings as configuration
  limit 1
$$;

comment on function public.get_public_event_settings() is
  'Returns only non-sensitive wedding event information for public pages.';

revoke all on function public.get_public_event_settings() from public;
grant execute on function public.get_public_event_settings() to anon, authenticated;

revoke select on table public.settings from authenticated;
drop policy if exists settings_select_authenticated on public.settings;

commit;

-- ============================================================
-- Source: docs\migrations\security_edge_function_service_role_grants.sql
-- ============================================================

-- ============================================================
-- Edge Function service role grants
-- ============================================================
--
-- Required because bypassing RLS does not replace PostgreSQL table grants.

begin;

grant usage on schema public to service_role;

grant select, insert, update, delete
  on table public.guest_access_sessions
  to service_role;

grant select, insert, update, delete
  on table public.invite_login_attempts
  to service_role;

grant usage, select
  on sequence public.invite_login_attempts_id_seq
  to service_role;

grant select, update
  on table public.guests
  to service_role;

grant execute
  on function public.register_guest_access(uuid)
  to service_role;

commit;

-- ============================================================
-- Source: docs\migrations\security_phase_4_rls_activate.sql
-- ============================================================

-- ============================================================
-- Security phase 4: activate final RLS enforcement
-- ============================================================
--
-- DO NOT RUN until:
-- - the public frontend uses Supabase Auth;
-- - login.js calls claim-invite;
-- - RSVP and gift mutations use the safe RPCs;
-- - the complete cutover smoke test is ready.

begin;

alter table public.guests enable row level security;
alter table public.rsvps enable row level security;
alter table public.gifts enable row level security;
alter table public.gift_contributions enable row level security;
alter table public.settings enable row level security;

revoke all on table public.guests from anon;
revoke all on table public.rsvps from anon;
revoke all on table public.gifts from anon;
revoke all on table public.gift_contributions from anon;
revoke all on table public.settings from anon;

grant usage on schema public to authenticated;

grant select on table public.guests
  to authenticated;
grant select on table public.rsvps
  to authenticated;
grant select on table public.gifts
  to authenticated;
grant select on table public.gift_contributions
  to authenticated;
revoke select on table public.settings
  from authenticated;

commit;
