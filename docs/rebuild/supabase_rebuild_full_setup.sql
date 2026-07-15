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
-- Internal rebuild component.
-- For a clean project setup, run docs/rebuild/supabase_rebuild_full_setup.sql
-- instead of executing this file directly.

begin;

create extension if not exists pgcrypto;

create table if not exists public.guests (
  id uuid not null default gen_random_uuid(),
  created_at timestamp with time zone null default timezone('utc'::text, now()),
  name text not null,
  invite_code text not null,
  max_guests integer null default 0,
  confirmed boolean null default false,
  invite_sent boolean not null default false,
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

create table if not exists public.notification_events (
  id uuid not null default gen_random_uuid(),
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  event_type text not null,
  aggregate_type text not null,
  aggregate_id uuid not null,
  aggregate_version timestamp with time zone null,
  guest_id uuid null,
  dedupe_key text not null,
  payload jsonb not null default '{}'::jsonb,
  origin text not null default 'automatic',
  status text not null default 'pending',
  attempts integer not null default 0,
  next_attempt_at timestamp with time zone not null default timezone('utc'::text, now()),
  claimed_at timestamp with time zone null,
  processed_at timestamp with time zone null,
  failed_at timestamp with time zone null,
  last_error text null,

  constraint notification_events_pkey primary key (id),
  constraint notification_events_guest_id_fkey
    foreign key (guest_id)
    references public.guests(id)
    on delete set null,
  constraint notification_events_dedupe_key_key unique (dedupe_key),
  constraint notification_events_origin_check
    check (origin in ('automatic', 'manual')),
  constraint notification_events_status_check
    check (status in ('pending', 'processing', 'processed', 'failed'))
);

create table if not exists public.notification_deliveries (
  id uuid not null default gen_random_uuid(),
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  event_id uuid not null,
  recipient_type text not null,
  recipient_email text null,
  channel text not null default 'email',
  dedupe_key text not null,
  status text not null default 'pending',
  attempts integer not null default 0,
  claimed_at timestamp with time zone null,
  sent_at timestamp with time zone null,
  failed_at timestamp with time zone null,
  skipped_at timestamp with time zone null,
  last_error text null,

  constraint notification_deliveries_pkey primary key (id),
  constraint notification_deliveries_event_id_fkey
    foreign key (event_id)
    references public.notification_events(id)
    on delete cascade,
  constraint notification_deliveries_dedupe_key_key unique (dedupe_key),
  constraint notification_deliveries_recipient_type_check
    check (recipient_type in ('admin', 'guest')),
  constraint notification_deliveries_channel_check
    check (channel in ('email')),
  constraint notification_deliveries_status_check
    check (status in ('pending', 'processing', 'sent', 'failed', 'skipped'))
);

create table if not exists public.notification_preferences (
  event_type text not null,
  event_group text not null,
  label text not null,
  description text null,
  automatic_enabled boolean not null default true,
  manual_enabled boolean not null default false,
  admin_enabled boolean not null default true,
  guest_enabled boolean not null default true,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone('utc'::text, now()),

  constraint notification_preferences_pkey primary key (event_type),
  constraint notification_preferences_event_type_check
    check (event_type <> ''),
  constraint notification_preferences_event_group_check
    check (event_group in ('rsvp', 'gift', 'gift_contribution', 'manual'))
);

create index if not exists notification_events_pending_idx
  on public.notification_events (status, next_attempt_at, created_at)
  where status = 'pending';

create index if not exists notification_events_guest_pending_idx
  on public.notification_events (guest_id, status, next_attempt_at, created_at)
  where status = 'pending';

create index if not exists notification_deliveries_event_id_idx
  on public.notification_deliveries (event_id);

-- Do not expose the tables before the final RLS policies are installed.
alter table public.guests enable row level security;
alter table public.rsvps enable row level security;
alter table public.gifts enable row level security;
alter table public.gift_contributions enable row level security;
alter table public.settings enable row level security;
alter table public.notification_events enable row level security;
alter table public.notification_deliveries enable row level security;
alter table public.notification_preferences enable row level security;

revoke all on table public.guests from anon, authenticated;
revoke all on table public.rsvps from anon, authenticated;
revoke all on table public.gifts from anon, authenticated;
revoke all on table public.gift_contributions from anon, authenticated;
revoke all on table public.settings from anon, authenticated;
revoke all on table public.notification_events from anon, authenticated;
revoke all on table public.notification_deliveries from anon, authenticated;
revoke all on table public.notification_preferences from anon, authenticated;

insert into public.notification_preferences (
  event_type,
  event_group,
  label,
  description,
  automatic_enabled,
  manual_enabled,
  admin_enabled,
  guest_enabled
)
values
  ('rsvp_saved', 'rsvp', 'RSVP recebido/atualizado', 'Enviado quando o convidado salva ou atualiza o RSVP público.', true, false, true, true),
  ('gift_reserved', 'gift', 'Presente reservado', 'Enviado quando o convidado reserva um presente individual.', true, false, true, true),
  ('gift_payment_reported', 'gift', 'Pagamento ou compra de presente informado', 'Enviado quando o convidado informa pagamento ou compra de presente individual.', true, false, true, true),
  ('gift_purchase_confirmed', 'gift', 'Presente confirmado', 'Enviado quando o admin confirma o pagamento ou compra de presente individual.', true, false, true, true),
  ('gift_reservation_released', 'gift', 'Presente liberado', 'Enviado quando o admin libera uma reserva de presente individual.', true, false, true, true),
  ('gift_reservation_reminder', 'gift', 'Lembrete de presente', 'Disparo manual para lembrar uma reserva de presente individual pendente.', false, true, true, true),
  ('gift_contribution_reserved', 'gift_contribution', 'Cota reservada', 'Enviado quando o convidado reserva cotas de um presente.', true, false, true, true),
  ('gift_contribution_payment_reported', 'gift_contribution', 'Pagamento de cota informado', 'Enviado quando o convidado informa pagamento de cotas.', true, false, true, true),
  ('gift_contribution_confirmed', 'gift_contribution', 'Cota confirmada', 'Enviado quando o admin confirma uma contribuição por cotas.', true, false, true, true),
  ('gift_contribution_released', 'gift_contribution', 'Cota liberada', 'Enviado quando o admin libera uma reserva de cotas.', true, false, true, true),
  ('gift_contribution_reminder', 'gift_contribution', 'Lembrete de cota', 'Disparo manual para lembrar uma reserva de cota pendente.', false, true, true, true)
on conflict (event_type) do update
set
  event_group = excluded.event_group,
  label = excluded.label,
  description = excluded.description,
  updated_at = timezone('utc'::text, now());

commit;

-- Source: docs\migrations\notification_delivery_sorting.sql

begin;

drop function if exists public.admin_list_notification_deliveries(
  text,
  text,
  text,
  timestamp with time zone,
  timestamp with time zone,
  integer,
  integer,
  text,
  text
);

drop function if exists public.admin_list_notification_deliveries(
  text,
  text,
  text,
  timestamp with time zone,
  timestamp with time zone,
  integer,
  integer,
  text,
  text,
  text,
  text
);

create or replace function public.admin_list_notification_deliveries(
  p_status text default null,
  p_event_type text default null,
  p_recipient_type text default null,
  p_created_from timestamp with time zone default null,
  p_created_to timestamp with time zone default null,
  p_limit integer default 50,
  p_offset integer default 0,
  p_origin text default null,
  p_search text default null,
  p_sort_key text default 'created_at',
  p_sort_direction text default 'desc'
)
returns table (
  total_count bigint,
  notification_event_id uuid,
  delivery_id uuid,
  created_at timestamp with time zone,
  event_type text,
  origin text,
  aggregate_type text,
  aggregate_id uuid,
  aggregate_version timestamp with time zone,
  guest_id uuid,
  guest_name text,
  event_status text,
  delivery_status text,
  recipient_type text,
  recipient_email text,
  channel text,
  processed_at timestamp with time zone,
  sent_at timestamp with time zone,
  skipped_at timestamp with time zone,
  failed_at timestamp with time zone,
  last_error text,
  payload jsonb
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

  p_status := lower(nullif(btrim(p_status), ''));
  p_event_type := nullif(btrim(p_event_type), '');
  p_recipient_type := lower(nullif(btrim(p_recipient_type), ''));
  p_origin := lower(nullif(btrim(p_origin), ''));
  p_search := lower(nullif(btrim(p_search), ''));
  p_sort_key := lower(coalesce(nullif(btrim(p_sort_key), ''), 'created_at'));
  p_sort_direction := lower(coalesce(nullif(btrim(p_sort_direction), ''), 'desc'));
  p_limit := least(greatest(coalesce(p_limit, 50), 1), 100);
  p_offset := greatest(coalesce(p_offset, 0), 0);

  if p_sort_key not in (
    'created_at',
    'event_type',
    'guest_name',
    'recipient_type',
    'recipient_email',
    'status'
  ) then
    p_sort_key := 'created_at';
  end if;

  if p_sort_direction not in ('asc', 'desc') then
    p_sort_direction := 'desc';
  end if;

  return query
  select
    count(*) over () as total_count,
    event.id as notification_event_id,
    delivery.id as delivery_id,
    event.created_at,
    event.event_type,
    event.origin,
    event.aggregate_type,
    event.aggregate_id,
    event.aggregate_version,
    event.guest_id,
    guest.name as guest_name,
    event.status as event_status,
    coalesce(delivery.status, event.status) as delivery_status,
    delivery.recipient_type,
    delivery.recipient_email,
    delivery.channel,
    event.processed_at,
    delivery.sent_at,
    delivery.skipped_at,
    coalesce(delivery.failed_at, event.failed_at) as failed_at,
    coalesce(delivery.last_error, event.last_error) as last_error,
    event.payload
  from public.notification_events as event
  left join public.notification_deliveries as delivery
    on delivery.event_id = event.id
  left join public.guests as guest
    on guest.id = event.guest_id
  where (
      p_status is null
      or lower(event.status) = p_status
      or lower(delivery.status) = p_status
    )
    and (p_event_type is null or event.event_type = p_event_type)
    and (p_recipient_type is null or lower(delivery.recipient_type) = p_recipient_type)
    and (p_origin is null or event.origin = p_origin)
    and (p_created_from is null or event.created_at >= p_created_from)
    and (p_created_to is null or event.created_at < p_created_to)
    and (
      p_search is null
      or lower(coalesce(guest.name, '')) like '%' || p_search || '%'
      or lower(coalesce(delivery.recipient_email, '')) like '%' || p_search || '%'
      or lower(coalesce(delivery.last_error, event.last_error, '')) like '%' || p_search || '%'
      or lower(event.event_type) like '%' || p_search || '%'
      or lower(event.origin) like '%' || p_search || '%'
      or lower(event.aggregate_type) like '%' || p_search || '%'
      or lower(event.status) like '%' || p_search || '%'
      or lower(coalesce(delivery.status, '')) like '%' || p_search || '%'
      or lower(event.id::text) like '%' || p_search || '%'
      or lower(coalesce(delivery.id::text, '')) like '%' || p_search || '%'
      or lower(event.aggregate_id::text) like '%' || p_search || '%'
      or lower(event.payload::text) like '%' || p_search || '%'
    )
  order by
    case when p_sort_key = 'created_at' and p_sort_direction = 'asc' then event.created_at end asc nulls last,
    case when p_sort_key = 'created_at' and p_sort_direction = 'desc' then event.created_at end desc nulls last,
    case when p_sort_key = 'event_type' and p_sort_direction = 'asc' then event.event_type end asc nulls last,
    case when p_sort_key = 'event_type' and p_sort_direction = 'desc' then event.event_type end desc nulls last,
    case when p_sort_key = 'guest_name' and p_sort_direction = 'asc' then guest.name end asc nulls last,
    case when p_sort_key = 'guest_name' and p_sort_direction = 'desc' then guest.name end desc nulls last,
    case when p_sort_key = 'recipient_type' and p_sort_direction = 'asc' then delivery.recipient_type end asc nulls last,
    case when p_sort_key = 'recipient_type' and p_sort_direction = 'desc' then delivery.recipient_type end desc nulls last,
    case when p_sort_key = 'recipient_email' and p_sort_direction = 'asc' then delivery.recipient_email end asc nulls last,
    case when p_sort_key = 'recipient_email' and p_sort_direction = 'desc' then delivery.recipient_email end desc nulls last,
    case when p_sort_key = 'status' and p_sort_direction = 'asc' then coalesce(delivery.status, event.status) end asc nulls last,
    case when p_sort_key = 'status' and p_sort_direction = 'desc' then coalesce(delivery.status, event.status) end desc nulls last,
    event.created_at desc,
    delivery.created_at desc nulls last
  limit p_limit
  offset p_offset;
end;
$$;

comment on function public.admin_list_notification_deliveries(
  text,
  text,
  text,
  timestamp with time zone,
  timestamp with time zone,
  integer,
  integer,
  text,
  text,
  text,
  text
) is
  'Returns notification events and delivery attempts for authenticated administrators, with filters and sorting.';

revoke all on function public.admin_list_notification_deliveries(
  text,
  text,
  text,
  timestamp with time zone,
  timestamp with time zone,
  integer,
  integer,
  text,
  text,
  text,
  text
) from public, anon;
grant execute on function public.admin_list_notification_deliveries(
  text,
  text,
  text,
  timestamp with time zone,
  timestamp with time zone,
  integer,
  integer,
  text,
  text,
  text,
  text
) to authenticated;

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
-- Source: docs\migrations\security_admin_notification_operations.sql
-- ============================================================

-- ============================================================
-- Secure administrative notification audit operations
-- ============================================================

begin;

create or replace function public.admin_list_notification_deliveries(
  p_status text default null,
  p_event_type text default null,
  p_recipient_type text default null,
  p_created_from timestamp with time zone default null,
  p_created_to timestamp with time zone default null,
  p_limit integer default 50,
  p_offset integer default 0,
  p_origin text default null,
  p_search text default null
)
returns table (
  total_count bigint,
  notification_event_id uuid,
  delivery_id uuid,
  created_at timestamp with time zone,
  event_type text,
  origin text,
  aggregate_type text,
  aggregate_id uuid,
  aggregate_version timestamp with time zone,
  guest_id uuid,
  guest_name text,
  event_status text,
  delivery_status text,
  recipient_type text,
  recipient_email text,
  channel text,
  processed_at timestamp with time zone,
  sent_at timestamp with time zone,
  skipped_at timestamp with time zone,
  failed_at timestamp with time zone,
  last_error text,
  payload jsonb
)
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

  p_status := lower(nullif(btrim(p_status), ''));
  p_event_type := nullif(btrim(p_event_type), '');
  p_recipient_type := lower(nullif(btrim(p_recipient_type), ''));
  p_origin := lower(nullif(btrim(p_origin), ''));
  p_search := lower(nullif(btrim(p_search), ''));
  p_limit := least(greatest(coalesce(p_limit, 50), 1), 100);
  p_offset := greatest(coalesce(p_offset, 0), 0);

  return query
  select
    count(*) over () as total_count,
    event.id as notification_event_id,
    delivery.id as delivery_id,
    event.created_at,
    event.event_type,
    event.origin,
    event.aggregate_type,
    event.aggregate_id,
    event.aggregate_version,
    event.guest_id,
    guest.name as guest_name,
    event.status as event_status,
    coalesce(delivery.status, event.status) as delivery_status,
    delivery.recipient_type,
    delivery.recipient_email,
    delivery.channel,
    event.processed_at,
    delivery.sent_at,
    delivery.skipped_at,
    coalesce(delivery.failed_at, event.failed_at) as failed_at,
    coalesce(delivery.last_error, event.last_error) as last_error,
    event.payload
  from public.notification_events as event
  left join public.notification_deliveries as delivery
    on delivery.event_id = event.id
  left join public.guests as guest
    on guest.id = event.guest_id
  where (
      p_status is null
      or lower(event.status) = p_status
      or lower(delivery.status) = p_status
    )
    and (p_event_type is null or event.event_type = p_event_type)
    and (p_recipient_type is null or lower(delivery.recipient_type) = p_recipient_type)
    and (p_origin is null or event.origin = p_origin)
    and (p_created_from is null or event.created_at >= p_created_from)
    and (p_created_to is null or event.created_at < p_created_to)
    and (
      p_search is null
      or lower(coalesce(guest.name, '')) like '%' || p_search || '%'
      or lower(coalesce(delivery.recipient_email, '')) like '%' || p_search || '%'
      or lower(coalesce(delivery.last_error, event.last_error, '')) like '%' || p_search || '%'
      or lower(event.event_type) like '%' || p_search || '%'
      or lower(event.origin) like '%' || p_search || '%'
      or lower(event.aggregate_type) like '%' || p_search || '%'
      or lower(event.status) like '%' || p_search || '%'
      or lower(coalesce(delivery.status, '')) like '%' || p_search || '%'
      or lower(event.id::text) like '%' || p_search || '%'
      or lower(coalesce(delivery.id::text, '')) like '%' || p_search || '%'
      or lower(event.aggregate_id::text) like '%' || p_search || '%'
      or lower(event.payload::text) like '%' || p_search || '%'
    )
  order by event.created_at desc, delivery.created_at desc nulls last
  limit p_limit
  offset p_offset;
end;
$$;

comment on function public.admin_list_notification_deliveries(
  text,
  text,
  text,
  timestamp with time zone,
  timestamp with time zone,
  integer,
  integer,
  text,
  text
) is
  'Returns notification events and delivery attempts for authenticated administrators.';

revoke all on function public.admin_list_notification_deliveries(
  text,
  text,
  text,
  timestamp with time zone,
  timestamp with time zone,
  integer,
  integer,
  text,
  text
) from public, anon;

grant execute on function public.admin_list_notification_deliveries(
  text,
  text,
  text,
  timestamp with time zone,
  timestamp with time zone,
  integer,
  integer,
  text,
  text
) to authenticated;

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

grant select
  on table public.admin_users
  to service_role;

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

grant select, insert, update, delete
  on table public.notification_events
  to service_role;

grant select, insert, update, delete
  on table public.notification_deliveries
  to service_role;

grant select
  on table public.notification_preferences
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

-- ============================================================
-- Final override: gift transactional email notifications
-- Source: docs\migrations\gift_email_notifications.sql
-- ============================================================

begin;

create or replace function public.enqueue_gift_notification_event(
  p_event_type text,
  p_aggregate_type text,
  p_aggregate_id uuid,
  p_aggregate_version timestamp with time zone,
  p_guest_id uuid,
  p_payload jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  event_version timestamp with time zone;
  guest_name text;
  guest_invite_type text;
  guest_email text;
begin
  if p_event_type is null
    or p_aggregate_type is null
    or p_aggregate_id is null
    or p_guest_id is null
  then
    return;
  end if;

  event_version := coalesce(p_aggregate_version, timezone('utc'::text, now()));

  select guest.name, guest.invite_type
  into guest_name, guest_invite_type
  from public.guests as guest
  where guest.id = p_guest_id;

  select nullif(rsvp.email, '')
  into guest_email
  from public.rsvps as rsvp
  where rsvp.guest_id = p_guest_id
  order by rsvp.updated_at desc nulls last, rsvp.created_at desc nulls last
  limit 1;

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
    p_event_type,
    p_aggregate_type,
    p_aggregate_id,
    event_version,
    p_guest_id,
    concat(
      p_event_type,
      ':',
      p_aggregate_id::text,
      ':',
      extract(epoch from event_version)::text
    ),
    coalesce(p_payload, '{}'::jsonb)
      || jsonb_build_object(
        'guest_name', guest_name,
        'invite_type', coalesce(guest_invite_type, 'individual'),
        'email', guest_email
      )
  )
  on conflict (dedupe_key) do nothing;
end;
$$;

revoke all on function public.enqueue_gift_notification_event(
  text,
  text,
  uuid,
  timestamp with time zone,
  uuid,
  jsonb
) from public, anon, authenticated;

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
  event_time timestamp with time zone;
  reserved_gift public.gifts%rowtype;
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

  event_time := timezone('utc'::text, now());

  update public.gifts
  set
    status = 'Reservado',
    reserved_guest_id = current_guest,
    reserved_name = current_guest_name,
    reservation_message = left(coalesce($2, ''), 2000),
    reserved_at = event_time,
    payment_status = 'Pendente',
    payment_reported_at = null,
    selected_purchase_method = null,
    selected_purchase_details = null
  where id = target_gift_id
    and coalesce(gift_type, 'single') <> 'quota'
    and reserved_guest_id is null
    and status = 'Disponível'
  returning * into reserved_gift;

  if not found then
    return;
  end if;

  perform public.enqueue_gift_notification_event(
    'gift_reserved',
    'gift',
    reserved_gift.id,
    event_time,
    current_guest,
    jsonb_build_object(
      'gift_id', reserved_gift.id,
      'gift_name', reserved_gift.name,
      'gift_category', reserved_gift.category,
      'gift_type', coalesce(reserved_gift.gift_type, 'single'),
      'price', reserved_gift.price,
      'message', reserved_gift.reservation_message,
      'payment_status', reserved_gift.payment_status
    )
  );

  return next reserved_gift;
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
  event_time timestamp with time zone;
  updated_gift public.gifts%rowtype;
begin
  current_guest := public.current_guest_id();

  if current_guest is null then
    return false;
  end if;

  event_time := timezone('utc'::text, now());

  update public.gifts
  set
    payment_status = 'Informado',
    payment_reported_at = event_time
  where id = target_gift_id
    and reserved_guest_id = current_guest
    and coalesce(gift_type, 'single') <> 'quota'
    and coalesce(payment_status, 'Pendente') = 'Pendente'
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
    )
  returning * into updated_gift;

  if not found then
    return false;
  end if;

  perform public.enqueue_gift_notification_event(
    'gift_payment_reported',
    'gift',
    updated_gift.id,
    event_time,
    current_guest,
    jsonb_build_object(
      'gift_id', updated_gift.id,
      'gift_name', updated_gift.name,
      'gift_category', updated_gift.category,
      'gift_type', coalesce(updated_gift.gift_type, 'single'),
      'price', updated_gift.price,
      'message', updated_gift.reservation_message,
      'payment_status', updated_gift.payment_status,
      'purchase_method', updated_gift.selected_purchase_method
    )
  );

  return true;
end;
$$;

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
  event_time timestamp with time zone;
  new_contribution public.gift_contributions%rowtype;
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

  event_time := timezone('utc'::text, now());

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
  returning * into new_contribution;

  perform public.enqueue_gift_notification_event(
    'gift_contribution_reserved',
    'gift_contribution',
    new_contribution.id,
    event_time,
    current_guest,
    jsonb_build_object(
      'gift_id', gift_record.id,
      'gift_name', gift_record.name,
      'gift_category', gift_record.category,
      'gift_type', 'quota',
      'price', gift_record.price,
      'quota_quantity', new_contribution.quota_quantity,
      'quota_value', new_contribution.quota_value,
      'total_value', new_contribution.total_value,
      'message', new_contribution.message,
      'payment_status', new_contribution.payment_status,
      'payment_method', new_contribution.payment_method
    )
  );

  return next new_contribution;
end;
$$;

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
  event_time timestamp with time zone;
  updated_contribution public.gift_contributions%rowtype;
  gift_record public.gifts%rowtype;
begin
  current_guest := public.current_guest_id();

  if current_guest is null then
    return false;
  end if;

  event_time := timezone('utc'::text, now());

  update public.gift_contributions
  set
    payment_status = 'Informado',
    payment_reported_at = event_time
  where id = target_contribution_id
    and guest_id = current_guest
    and coalesce(payment_status, 'Pendente') = 'Pendente'
  returning * into updated_contribution;

  if not found then
    return false;
  end if;

  select *
  into gift_record
  from public.gifts
  where id = updated_contribution.gift_id;

  perform public.enqueue_gift_notification_event(
    'gift_contribution_payment_reported',
    'gift_contribution',
    updated_contribution.id,
    event_time,
    current_guest,
    jsonb_build_object(
      'gift_id', gift_record.id,
      'gift_name', gift_record.name,
      'gift_category', gift_record.category,
      'gift_type', 'quota',
      'price', gift_record.price,
      'quota_quantity', updated_contribution.quota_quantity,
      'quota_value', updated_contribution.quota_value,
      'total_value', updated_contribution.total_value,
      'message', updated_contribution.message,
      'payment_status', updated_contribution.payment_status,
      'payment_method', updated_contribution.payment_method
    )
  );

  return true;
end;
$$;

create or replace function public.admin_confirm_gift_purchase(
  target_gift_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  event_time timestamp with time zone;
  updated_gift public.gifts%rowtype;
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

  event_time := timezone('utc'::text, now());

  update public.gifts
  set
    status = 'Comprado',
    payment_status = 'Confirmado'
  where id = target_gift_id
    and coalesce(gift_type, 'single') <> 'quota'
    and reserved_guest_id is not null
  returning * into updated_gift;

  if not found then
    return false;
  end if;

  perform public.enqueue_gift_notification_event(
    'gift_purchase_confirmed',
    'gift',
    updated_gift.id,
    event_time,
    updated_gift.reserved_guest_id,
    jsonb_build_object(
      'gift_id', updated_gift.id,
      'gift_name', updated_gift.name,
      'gift_category', updated_gift.category,
      'gift_type', coalesce(updated_gift.gift_type, 'single'),
      'price', updated_gift.price,
      'message', updated_gift.reservation_message,
      'payment_status', updated_gift.payment_status,
      'purchase_method', updated_gift.selected_purchase_method
    )
  );

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
declare
  event_time timestamp with time zone;
  gift_record public.gifts%rowtype;
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

  select *
  into gift_record
  from public.gifts
  where id = target_gift_id
    and coalesce(gift_type, 'single') <> 'quota'
    and reserved_guest_id is not null
  for update;

  if not found then
    return false;
  end if;

  event_time := timezone('utc'::text, now());

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

  perform public.enqueue_gift_notification_event(
    'gift_reservation_released',
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
      'purchase_method', gift_record.selected_purchase_method
    )
  );

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
declare
  event_time timestamp with time zone;
  updated_contribution public.gift_contributions%rowtype;
  gift_record public.gifts%rowtype;
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

  select gift.*
  into gift_record
  from public.gift_contributions as contribution
  inner join public.gifts as gift
    on gift.id = contribution.gift_id
  where contribution.id = target_contribution_id
    and gift.gift_type = 'quota'
  for update of contribution;

  if not found then
    return false;
  end if;

  event_time := timezone('utc'::text, now());

  update public.gift_contributions
  set payment_status = 'Confirmado'
  where id = target_contribution_id
  returning * into updated_contribution;

  perform public.enqueue_gift_notification_event(
    'gift_contribution_confirmed',
    'gift_contribution',
    updated_contribution.id,
    event_time,
    updated_contribution.guest_id,
    jsonb_build_object(
      'gift_id', gift_record.id,
      'gift_name', gift_record.name,
      'gift_category', gift_record.category,
      'gift_type', 'quota',
      'price', gift_record.price,
      'quota_quantity', updated_contribution.quota_quantity,
      'quota_value', updated_contribution.quota_value,
      'total_value', updated_contribution.total_value,
      'message', updated_contribution.message,
      'payment_status', updated_contribution.payment_status,
      'payment_method', updated_contribution.payment_method
    )
  );

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
  event_time timestamp with time zone;
  contribution_record public.gift_contributions%rowtype;
  gift_record public.gifts%rowtype;
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

  select contribution.*
  into contribution_record
  from public.gift_contributions as contribution
  inner join public.gifts as gift
    on gift.id = contribution.gift_id
  where contribution.id = target_contribution_id
    and gift.gift_type = 'quota'
  for update of contribution;

  if not found then
    return false;
  end if;

  select *
  into gift_record
  from public.gifts
  where id = contribution_record.gift_id;

  event_time := timezone('utc'::text, now());

  delete from public.gift_contributions
  where id = target_contribution_id;

  perform public.enqueue_gift_notification_event(
    'gift_contribution_released',
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
      'payment_method', contribution_record.payment_method
    )
  );

  return true;
end;
$$;

revoke all on function public.reserve_gift(uuid, text) from public, anon;
revoke all on function public.report_gift_payment(uuid) from public, anon;
revoke all on function public.reserve_gift_quotas(uuid, text, integer)
  from public, anon;
revoke all on function public.report_gift_contribution_payment(uuid)
  from public, anon;
revoke all on function public.admin_confirm_gift_purchase(uuid)
  from public, anon;
revoke all on function public.admin_release_gift_reservation(uuid)
  from public, anon;
revoke all on function public.admin_confirm_gift_contribution(uuid)
  from public, anon;
revoke all on function public.admin_release_gift_contribution(uuid)
  from public, anon;

grant execute on function public.reserve_gift(uuid, text) to authenticated;
grant execute on function public.report_gift_payment(uuid) to authenticated;
grant execute on function public.reserve_gift_quotas(uuid, text, integer)
  to authenticated;
grant execute on function public.report_gift_contribution_payment(uuid)
  to authenticated;
grant execute on function public.admin_confirm_gift_purchase(uuid)
  to authenticated;
grant execute on function public.admin_release_gift_reservation(uuid)
  to authenticated;
grant execute on function public.admin_confirm_gift_contribution(uuid)
  to authenticated;
grant execute on function public.admin_release_gift_contribution(uuid)
  to authenticated;

commit;

-- ============================================================
-- Source: docs\migrations\security_admin_notification_preferences.sql
-- ============================================================

-- ============================================================
-- Secure administrative notification preference operations
-- ============================================================

begin;

create or replace function public.admin_list_notification_preferences()
returns table (
  event_type text,
  event_group text,
  label text,
  description text,
  automatic_enabled boolean,
  manual_enabled boolean,
  admin_enabled boolean,
  guest_enabled boolean,
  updated_at timestamp with time zone
)
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

  return query
  select
    preference.event_type,
    preference.event_group,
    preference.label,
    preference.description,
    preference.automatic_enabled,
    preference.manual_enabled,
    preference.admin_enabled,
    preference.guest_enabled,
    preference.updated_at
  from public.notification_preferences as preference
  order by
    case preference.event_group
      when 'rsvp' then 1
      when 'gift' then 2
      when 'gift_contribution' then 3
      else 4
    end,
    preference.label;
end;
$$;

create or replace function public.admin_update_notification_preference(
  target_event_type text,
  submitted_automatic_enabled boolean,
  submitted_manual_enabled boolean,
  submitted_admin_enabled boolean,
  submitted_guest_enabled boolean
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

  update public.notification_preferences
  set
    automatic_enabled = coalesce(submitted_automatic_enabled, automatic_enabled),
    manual_enabled = coalesce(submitted_manual_enabled, manual_enabled),
    admin_enabled = coalesce(submitted_admin_enabled, admin_enabled),
    guest_enabled = coalesce(submitted_guest_enabled, guest_enabled),
    updated_at = timezone('utc'::text, now())
  where event_type = nullif(btrim(target_event_type), '');

  return found;
end;
$$;

comment on function public.admin_list_notification_preferences() is
  'Returns notification preferences for authenticated administrators.';

comment on function public.admin_update_notification_preference(
  text,
  boolean,
  boolean,
  boolean,
  boolean
) is
  'Updates one notification preference row as an authenticated administrator.';

revoke all on function public.admin_list_notification_preferences() from public, anon;
grant execute on function public.admin_list_notification_preferences() to authenticated;

revoke all on function public.admin_update_notification_preference(
  text,
  boolean,
  boolean,
  boolean,
  boolean
) from public, anon;

grant execute on function public.admin_update_notification_preference(
  text,
  boolean,
  boolean,
  boolean,
  boolean
) to authenticated;

commit;

-- ============================================================
-- Source: docs\migrations\manual_notification_reminders.sql
-- ============================================================

-- ============================================================
-- Manual notification reminders
-- ============================================================

begin;

alter table public.notification_events
  add column if not exists origin text not null default 'automatic';

alter table public.notification_events
  drop constraint if exists notification_events_origin_check;

alter table public.notification_events
  add constraint notification_events_origin_check
  check (origin in ('automatic', 'manual'));

insert into public.notification_preferences (
  event_type,
  event_group,
  label,
  description,
  automatic_enabled,
  manual_enabled,
  admin_enabled,
  guest_enabled
)
values
  (
    'gift_reservation_reminder',
    'gift',
    'Lembrete de presente',
    'Disparo manual para lembrar uma reserva de presente individual pendente.',
    false,
    true,
    true,
    true
  ),
  (
    'gift_contribution_reminder',
    'gift_contribution',
    'Lembrete de cota',
    'Disparo manual para lembrar uma reserva de cota pendente.',
    false,
    true,
    true,
    true
  )
on conflict (event_type) do update
set
  event_group = excluded.event_group,
  label = excluded.label,
  description = excluded.description,
  manual_enabled = excluded.manual_enabled,
  updated_at = timezone('utc'::text, now());

create or replace function public.admin_send_gift_reservation_reminder(
  target_gift_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  event_time timestamp with time zone;
  gift_record public.gifts%rowtype;
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

  select *
  into gift_record
  from public.gifts
  where id = target_gift_id
    and coalesce(gift_type, 'single') <> 'quota'
    and status = 'Reservado'
    and reserved_guest_id is not null
    and coalesce(payment_status, 'Pendente') = 'Pendente';

  if not found then
    return false;
  end if;

  event_time := timezone('utc'::text, now());

  perform public.enqueue_gift_notification_event(
    'gift_reservation_reminder',
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
      'notification_origin', 'manual',
      'triggered_by', 'admin',
      'triggered_by_user_id', (select auth.uid()),
      'reminder_kind', 'pending_reservation'
    )
  );

  update public.notification_events
  set origin = 'manual'
  where dedupe_key = concat(
    'gift_reservation_reminder',
    ':',
    gift_record.id::text,
    ':',
    extract(epoch from event_time)::text
  );

  return true;
end;
$$;

create or replace function public.admin_send_gift_contribution_reminder(
  target_contribution_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  event_time timestamp with time zone;
  contribution_record public.gift_contributions%rowtype;
  gift_record public.gifts%rowtype;
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

  select contribution.*
  into contribution_record
  from public.gift_contributions as contribution
  inner join public.gifts as gift
    on gift.id = contribution.gift_id
  where contribution.id = target_contribution_id
    and gift.gift_type = 'quota'
    and coalesce(contribution.payment_status, 'Pendente') = 'Pendente';

  if not found then
    return false;
  end if;

  select *
  into gift_record
  from public.gifts
  where id = contribution_record.gift_id;

  event_time := timezone('utc'::text, now());

  perform public.enqueue_gift_notification_event(
    'gift_contribution_reminder',
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
      'triggered_by_user_id', (select auth.uid()),
      'reminder_kind', 'pending_reservation'
    )
  );

  update public.notification_events
  set origin = 'manual'
  where dedupe_key = concat(
    'gift_contribution_reminder',
    ':',
    contribution_record.id::text,
    ':',
    extract(epoch from event_time)::text
  );

  return true;
end;
$$;

revoke all on function public.admin_send_gift_reservation_reminder(uuid)
  from public, anon;
revoke all on function public.admin_send_gift_contribution_reminder(uuid)
  from public, anon;

grant execute on function public.admin_send_gift_reservation_reminder(uuid)
  to authenticated;
grant execute on function public.admin_send_gift_contribution_reminder(uuid)
  to authenticated;

commit;
-- ============================================================
-- Manual notification resends
-- ============================================================

begin;

update public.notification_preferences
set
  manual_enabled = true,
  updated_at = timezone('utc'::text, now())
where event_type in (
  'rsvp_saved',
  'gift_reserved',
  'gift_payment_reported',
  'gift_purchase_confirmed',
  'gift_reservation_released',
  'gift_contribution_reserved',
  'gift_contribution_payment_reported',
  'gift_contribution_confirmed',
  'gift_contribution_released'
);

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
      'food', rsvp_record.food,
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

create or replace function public.admin_resend_notification_delivery(
  target_delivery_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  delivery_record public.notification_deliveries%rowtype;
  event_record public.notification_events%rowtype;
  event_id uuid;
  event_time timestamp with time zone;
  refreshed_email text;
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

  select *
  into delivery_record
  from public.notification_deliveries
  where id = target_delivery_id
    and status not in ('pending', 'processing');

  if not found then
    return null;
  end if;

  select *
  into event_record
  from public.notification_events
  where id = delivery_record.event_id;

  if not found then
    return null;
  end if;

  if event_record.guest_id is not null then
    select nullif(rsvp.email, '')
    into refreshed_email
    from public.rsvps as rsvp
    where rsvp.guest_id = event_record.guest_id
    order by rsvp.updated_at desc nulls last, rsvp.created_at desc nulls last
    limit 1;
  end if;

  event_time := timezone('utc'::text, now());

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
    event_record.event_type,
    event_record.aggregate_type,
    event_record.aggregate_id,
    event_time,
    'manual',
    event_record.guest_id,
    concat(
      event_record.event_type,
      ':manual-resend:',
      delivery_record.id::text,
      ':',
      extract(epoch from event_time)::text,
      ':',
      gen_random_uuid()::text
    ),
    coalesce(event_record.payload, '{}'::jsonb)
      || case
        when refreshed_email is null then '{}'::jsonb
        else jsonb_build_object('email', refreshed_email)
      end
      || jsonb_build_object(
        'manual_recipient_type', delivery_record.recipient_type,
        'notification_origin', 'manual',
        'resent_from_delivery_id', delivery_record.id,
        'resent_from_event_id', event_record.id,
        'triggered_by', 'admin',
        'triggered_by_user_id', (select auth.uid())
      )
  )
  returning id into event_id;

  return event_id;
end;
$$;

comment on function public.admin_create_manual_notification_event(
  text,
  uuid,
  text
) is
  'Creates a manual notification event for an authenticated administrator.';

comment on function public.admin_resend_notification_delivery(uuid) is
  'Creates a manual resend event for one previous notification delivery.';

revoke all on function public.admin_create_manual_notification_event(
  text,
  uuid,
  text
) from public, anon;
revoke all on function public.admin_resend_notification_delivery(uuid)
  from public, anon;

grant execute on function public.admin_create_manual_notification_event(
  text,
  uuid,
  text
) to authenticated;
grant execute on function public.admin_resend_notification_delivery(uuid)
  to authenticated;

commit;

-- ============================================================
-- Source: docs\migrations\wall_messages.sql
-- ============================================================

-- ============================================================
-- Guest wall messages
-- ============================================================

begin;

create table if not exists public.guest_wall_messages (
  id uuid not null default gen_random_uuid(),
  guest_id uuid not null,
  message text not null,
  status text not null default 'pending',
  couple_reply text null,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone('utc'::text, now()),
  submitted_at timestamp with time zone not null default timezone('utc'::text, now()),
  approved_at timestamp with time zone null,
  hidden_at timestamp with time zone null,
  couple_replied_at timestamp with time zone null,

  constraint guest_wall_messages_pkey primary key (id),
  constraint guest_wall_messages_guest_id_key unique (guest_id),
  constraint guest_wall_messages_guest_id_fkey
    foreign key (guest_id)
    references public.guests(id)
    on delete cascade,
  constraint guest_wall_messages_status_check
    check (status in ('pending', 'approved', 'hidden')),
  constraint guest_wall_messages_message_length_check
    check (char_length(btrim(message)) between 1 and 800),
  constraint guest_wall_messages_reply_length_check
    check (couple_reply is null or char_length(btrim(couple_reply)) <= 800)
);

create index if not exists guest_wall_messages_status_approved_idx
  on public.guest_wall_messages (status, approved_at desc, created_at desc);

create index if not exists guest_wall_messages_guest_status_idx
  on public.guest_wall_messages (guest_id, status);

alter table public.guest_wall_messages enable row level security;

revoke all on table public.guest_wall_messages from anon, authenticated;
grant all on table public.guest_wall_messages to service_role;

create or replace function public.list_approved_wall_messages(
  p_limit integer default 100,
  p_offset integer default 0
)
returns table (
  total_count bigint,
  id uuid,
  guest_name text,
  message text,
  couple_reply text,
  approved_at timestamp with time zone,
  couple_replied_at timestamp with time zone,
  created_at timestamp with time zone
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  p_limit := least(greatest(coalesce(p_limit, 100), 1), 100);
  p_offset := greatest(coalesce(p_offset, 0), 0);

  return query
  select
    count(*) over () as total_count,
    wall_message.id,
    guest.name as guest_name,
    wall_message.message,
    wall_message.couple_reply,
    wall_message.approved_at,
    wall_message.couple_replied_at,
    wall_message.created_at
  from public.guest_wall_messages as wall_message
  inner join public.guests as guest
    on guest.id = wall_message.guest_id
  where wall_message.status = 'approved'
    and guest.active is true
  order by
    wall_message.approved_at desc nulls last,
    wall_message.created_at desc
  limit p_limit
  offset p_offset;
end;
$$;

create or replace function public.get_current_guest_wall_message()
returns table (
  id uuid,
  message text,
  status text,
  couple_reply text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  submitted_at timestamp with time zone,
  approved_at timestamp with time zone,
  hidden_at timestamp with time zone,
  couple_replied_at timestamp with time zone
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_guest uuid;
begin
  current_guest := public.current_guest_id();

  if current_guest is null then
    return;
  end if;

  return query
  select
    wall_message.id,
    wall_message.message,
    wall_message.status,
    wall_message.couple_reply,
    wall_message.created_at,
    wall_message.updated_at,
    wall_message.submitted_at,
    wall_message.approved_at,
    wall_message.hidden_at,
    wall_message.couple_replied_at
  from public.guest_wall_messages as wall_message
  where wall_message.guest_id = current_guest;
end;
$$;

create or replace function public.save_current_guest_wall_message(
  submitted_message text
)
returns table (
  id uuid,
  message text,
  status text,
  couple_reply text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  submitted_at timestamp with time zone,
  approved_at timestamp with time zone,
  hidden_at timestamp with time zone,
  couple_replied_at timestamp with time zone
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_guest uuid;
  safe_message text;
  saved_message public.guest_wall_messages%rowtype;
begin
  current_guest := public.current_guest_id();
  safe_message := left(btrim(coalesce(submitted_message, '')), 800);

  if current_guest is null or safe_message = '' then
    return;
  end if;

  if not exists (
    select 1
    from public.guests as guest
    where guest.id = current_guest
      and guest.active is true
  ) then
    return;
  end if;

  insert into public.guest_wall_messages (
    guest_id,
    message,
    status,
    submitted_at,
    updated_at,
    approved_at,
    hidden_at
  )
  values (
    current_guest,
    safe_message,
    'pending',
    timezone('utc'::text, now()),
    timezone('utc'::text, now()),
    null,
    null
  )
  on conflict (guest_id)
  do update set
    message = excluded.message,
    status = 'pending',
    submitted_at = excluded.submitted_at,
    updated_at = excluded.updated_at,
    approved_at = null,
    hidden_at = null
  returning * into saved_message;

  return query
  select
    saved_message.id,
    saved_message.message,
    saved_message.status,
    saved_message.couple_reply,
    saved_message.created_at,
    saved_message.updated_at,
    saved_message.submitted_at,
    saved_message.approved_at,
    saved_message.hidden_at,
    saved_message.couple_replied_at;
end;
$$;

create or replace function public.admin_list_wall_messages(
  p_status text default null,
  p_search text default null,
  p_limit integer default 100,
  p_offset integer default 0
)
returns table (
  total_count bigint,
  id uuid,
  guest_id uuid,
  guest_name text,
  invite_type text,
  message text,
  status text,
  couple_reply text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  submitted_at timestamp with time zone,
  approved_at timestamp with time zone,
  hidden_at timestamp with time zone,
  couple_replied_at timestamp with time zone
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

  p_status := lower(nullif(btrim(p_status), ''));
  p_search := lower(nullif(btrim(p_search), ''));
  p_limit := least(greatest(coalesce(p_limit, 100), 1), 200);
  p_offset := greatest(coalesce(p_offset, 0), 0);

  return query
  select
    count(*) over () as total_count,
    wall_message.id,
    wall_message.guest_id,
    guest.name as guest_name,
    guest.invite_type,
    wall_message.message,
    wall_message.status,
    wall_message.couple_reply,
    wall_message.created_at,
    wall_message.updated_at,
    wall_message.submitted_at,
    wall_message.approved_at,
    wall_message.hidden_at,
    wall_message.couple_replied_at
  from public.guest_wall_messages as wall_message
  inner join public.guests as guest
    on guest.id = wall_message.guest_id
  where (p_status is null or wall_message.status = p_status)
    and (
      p_search is null
      or lower(guest.name) like '%' || p_search || '%'
      or lower(wall_message.message) like '%' || p_search || '%'
      or lower(coalesce(wall_message.couple_reply, '')) like '%' || p_search || '%'
    )
  order by wall_message.submitted_at desc, wall_message.created_at desc
  limit p_limit
  offset p_offset;
end;
$$;

create or replace function public.admin_approve_wall_message(
  target_message_id uuid
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

  update public.guest_wall_messages
  set
    status = 'approved',
    approved_at = timezone('utc'::text, now()),
    hidden_at = null,
    updated_at = timezone('utc'::text, now())
  where id = target_message_id;

  return found;
end;
$$;

create or replace function public.admin_hide_wall_message(
  target_message_id uuid
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

  update public.guest_wall_messages
  set
    status = 'hidden',
    hidden_at = timezone('utc'::text, now()),
    updated_at = timezone('utc'::text, now())
  where id = target_message_id;

  return found;
end;
$$;

create or replace function public.admin_reply_wall_message(
  target_message_id uuid,
  submitted_reply text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  safe_reply text;
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.'
      using errcode = '42501';
  end if;

  safe_reply := left(btrim(coalesce(submitted_reply, '')), 800);

  update public.guest_wall_messages
  set
    couple_reply = nullif(safe_reply, ''),
    couple_replied_at = case
      when safe_reply = '' then null
      else timezone('utc'::text, now())
    end,
    updated_at = timezone('utc'::text, now())
  where id = target_message_id;

  return found;
end;
$$;

create or replace function public.admin_clear_wall_message_reply(
  target_message_id uuid
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

  update public.guest_wall_messages
  set
    couple_reply = null,
    couple_replied_at = null,
    updated_at = timezone('utc'::text, now())
  where id = target_message_id;

  return found;
end;
$$;

create or replace function public.admin_delete_wall_message(
  target_message_id uuid
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

  delete from public.guest_wall_messages
  where id = target_message_id;

  return found;
end;
$$;

comment on table public.guest_wall_messages is
  'Moderated messages left by invited guests for the public wall.';

comment on function public.list_approved_wall_messages(integer, integer) is
  'Lists approved wall messages without exposing private guest data.';

comment on function public.get_current_guest_wall_message() is
  'Returns the current invited guest wall message.';

comment on function public.save_current_guest_wall_message(text) is
  'Creates or updates the current invited guest wall message and returns it to pending review.';

comment on function public.admin_list_wall_messages(text, text, integer, integer) is
  'Lists wall messages for authenticated administrators.';

comment on function public.admin_approve_wall_message(uuid) is
  'Approves a guest wall message as an authenticated administrator.';

comment on function public.admin_hide_wall_message(uuid) is
  'Hides a guest wall message as an authenticated administrator.';

comment on function public.admin_reply_wall_message(uuid, text) is
  'Adds or clears the couple reply to a wall message as an authenticated administrator.';

comment on function public.admin_clear_wall_message_reply(uuid) is
  'Clears the couple reply from a wall message as an authenticated administrator.';

comment on function public.admin_delete_wall_message(uuid) is
  'Deletes a guest wall message as an authenticated administrator.';

revoke all on function public.list_approved_wall_messages(integer, integer)
  from public;
grant execute on function public.list_approved_wall_messages(integer, integer)
  to anon, authenticated;

revoke all on function public.get_current_guest_wall_message()
  from public, anon;
grant execute on function public.get_current_guest_wall_message()
  to authenticated;

revoke all on function public.save_current_guest_wall_message(text)
  from public, anon;
grant execute on function public.save_current_guest_wall_message(text)
  to authenticated;

revoke all on function public.admin_list_wall_messages(text, text, integer, integer)
  from public, anon;
grant execute on function public.admin_list_wall_messages(text, text, integer, integer)
  to authenticated;

revoke all on function public.admin_approve_wall_message(uuid)
  from public, anon;
grant execute on function public.admin_approve_wall_message(uuid)
  to authenticated;

revoke all on function public.admin_hide_wall_message(uuid)
  from public, anon;
grant execute on function public.admin_hide_wall_message(uuid)
  to authenticated;

revoke all on function public.admin_reply_wall_message(uuid, text)
  from public, anon;
grant execute on function public.admin_reply_wall_message(uuid, text)
  to authenticated;

revoke all on function public.admin_clear_wall_message_reply(uuid)
  from public, anon;
grant execute on function public.admin_clear_wall_message_reply(uuid)
  to authenticated;

revoke all on function public.admin_delete_wall_message(uuid)
  from public, anon;
grant execute on function public.admin_delete_wall_message(uuid)
  to authenticated;

commit;

-- Source: docs\migrations\wall_message_email_notifications.sql

begin;

alter table public.notification_preferences
  drop constraint if exists notification_preferences_event_group_check;

alter table public.notification_preferences
  add constraint notification_preferences_event_group_check
  check (event_group in ('rsvp', 'gift', 'gift_contribution', 'manual', 'wall_message'));

insert into public.notification_preferences (
  event_type,
  event_group,
  label,
  description,
  automatic_enabled,
  manual_enabled,
  admin_enabled,
  guest_enabled
)
values
  ('wall_message_submitted', 'wall_message', 'Recado enviado', 'Enviado quando um convidado cria ou edita um recado no mural.', true, false, true, false),
  ('wall_message_approved', 'wall_message', 'Recado aprovado', 'Enviado quando o admin aprova um recado para o mural público.', true, false, false, true),
  ('wall_message_replied', 'wall_message', 'Recado respondido', 'Enviado quando os noivos respondem um recado aprovado.', true, false, false, true)
on conflict (event_type) do update
set
  event_group = excluded.event_group,
  label = excluded.label,
  description = excluded.description,
  automatic_enabled = excluded.automatic_enabled,
  admin_enabled = excluded.admin_enabled,
  guest_enabled = excluded.guest_enabled,
  updated_at = timezone('utc'::text, now());

create or replace function public.enqueue_wall_message_notification_event(
  p_event_type text,
  p_wall_message_id uuid,
  p_event_time timestamp with time zone default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  event_time timestamp with time zone;
  guest_email text;
  guest_record public.guests%rowtype;
  wall_message_record public.guest_wall_messages%rowtype;
begin
  if p_event_type is null
    or p_wall_message_id is null
    or p_event_type not in (
      'wall_message_submitted',
      'wall_message_approved',
      'wall_message_replied'
    )
  then
    return;
  end if;

  event_time := coalesce(p_event_time, timezone('utc'::text, now()));

  select *
  into wall_message_record
  from public.guest_wall_messages
  where id = p_wall_message_id;

  if not found then
    return;
  end if;

  select *
  into guest_record
  from public.guests
  where id = wall_message_record.guest_id
    and active is true;

  if not found then
    return;
  end if;

  select nullif(rsvp.email, '')
  into guest_email
  from public.rsvps as rsvp
  where rsvp.guest_id = wall_message_record.guest_id
  order by rsvp.updated_at desc nulls last, rsvp.created_at desc nulls last
  limit 1;

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
    p_event_type,
    'wall_message',
    wall_message_record.id,
    event_time,
    wall_message_record.guest_id,
    concat(p_event_type, ':', wall_message_record.id::text, ':', extract(epoch from event_time)::text),
    jsonb_build_object(
      'wall_message_id', wall_message_record.id,
      'guest_name', guest_record.name,
      'invite_type', coalesce(guest_record.invite_type, 'individual'),
      'email', guest_email,
      'message', wall_message_record.message,
      'status', wall_message_record.status,
      'couple_reply', wall_message_record.couple_reply,
      'submitted_at', wall_message_record.submitted_at,
      'approved_at', wall_message_record.approved_at,
      'couple_replied_at', wall_message_record.couple_replied_at
    )
  )
  on conflict (dedupe_key) do nothing;
end;
$$;

comment on function public.enqueue_wall_message_notification_event(text, uuid, timestamp with time zone) is
  'Internal helper that writes wall-message transactional email events.';

revoke all on function public.enqueue_wall_message_notification_event(text, uuid, timestamp with time zone)
  from public, anon, authenticated;

create or replace function public.save_current_guest_wall_message(
  submitted_message text
)
returns table (
  id uuid,
  message text,
  status text,
  couple_reply text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  submitted_at timestamp with time zone,
  approved_at timestamp with time zone,
  hidden_at timestamp with time zone,
  couple_replied_at timestamp with time zone
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_guest uuid;
  event_time timestamp with time zone;
  safe_message text;
  saved_message public.guest_wall_messages%rowtype;
begin
  current_guest := public.current_guest_id();
  event_time := timezone('utc'::text, now());
  safe_message := left(btrim(coalesce(submitted_message, '')), 800);

  if current_guest is null or safe_message = '' then
    return;
  end if;

  if not exists (
    select 1
    from public.guests as guest
    where guest.id = current_guest
      and guest.active is true
  ) then
    return;
  end if;

  insert into public.guest_wall_messages (
    guest_id,
    message,
    status,
    submitted_at,
    updated_at,
    approved_at,
    hidden_at
  )
  values (
    current_guest,
    safe_message,
    'pending',
    event_time,
    event_time,
    null,
    null
  )
  on conflict (guest_id)
  do update set
    message = excluded.message,
    status = 'pending',
    submitted_at = excluded.submitted_at,
    updated_at = excluded.updated_at,
    approved_at = null,
    hidden_at = null
  returning * into saved_message;

  perform public.enqueue_wall_message_notification_event(
    'wall_message_submitted',
    saved_message.id,
    event_time
  );

  return query
  select
    saved_message.id,
    saved_message.message,
    saved_message.status,
    saved_message.couple_reply,
    saved_message.created_at,
    saved_message.updated_at,
    saved_message.submitted_at,
    saved_message.approved_at,
    saved_message.hidden_at,
    saved_message.couple_replied_at;
end;
$$;

create or replace function public.admin_approve_wall_message(
  target_message_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  event_time timestamp with time zone;
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.'
      using errcode = '42501';
  end if;

  event_time := timezone('utc'::text, now());

  update public.guest_wall_messages
  set
    status = 'approved',
    approved_at = event_time,
    hidden_at = null,
    updated_at = event_time
  where id = target_message_id;

  if found then
    perform public.enqueue_wall_message_notification_event(
      'wall_message_approved',
      target_message_id,
      event_time
    );
  end if;

  return found;
end;
$$;

create or replace function public.admin_reply_wall_message(
  target_message_id uuid,
  submitted_reply text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  event_time timestamp with time zone;
  safe_reply text;
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.'
      using errcode = '42501';
  end if;

  event_time := timezone('utc'::text, now());
  safe_reply := left(btrim(coalesce(submitted_reply, '')), 800);

  update public.guest_wall_messages
  set
    couple_reply = nullif(safe_reply, ''),
    couple_replied_at = case
      when safe_reply = '' then null
      else event_time
    end,
    updated_at = event_time
  where id = target_message_id;

  if found and safe_reply <> '' then
    perform public.enqueue_wall_message_notification_event(
      'wall_message_replied',
      target_message_id,
      event_time
    );
  end if;

  return found;
end;
$$;

commit;

-- Final override: sortable notification audit RPC
-- Source: docs\migrations\notification_delivery_sorting.sql

begin;

drop function if exists public.admin_list_notification_deliveries(
  text,
  text,
  text,
  timestamp with time zone,
  timestamp with time zone,
  integer,
  integer,
  text,
  text
);

drop function if exists public.admin_list_notification_deliveries(
  text,
  text,
  text,
  timestamp with time zone,
  timestamp with time zone,
  integer,
  integer,
  text,
  text,
  text,
  text
);

create or replace function public.admin_list_notification_deliveries(
  p_status text default null,
  p_event_type text default null,
  p_recipient_type text default null,
  p_created_from timestamp with time zone default null,
  p_created_to timestamp with time zone default null,
  p_limit integer default 50,
  p_offset integer default 0,
  p_origin text default null,
  p_search text default null,
  p_sort_key text default 'created_at',
  p_sort_direction text default 'desc'
)
returns table (
  total_count bigint,
  notification_event_id uuid,
  delivery_id uuid,
  created_at timestamp with time zone,
  event_type text,
  origin text,
  aggregate_type text,
  aggregate_id uuid,
  aggregate_version timestamp with time zone,
  guest_id uuid,
  guest_name text,
  event_status text,
  delivery_status text,
  recipient_type text,
  recipient_email text,
  channel text,
  processed_at timestamp with time zone,
  sent_at timestamp with time zone,
  skipped_at timestamp with time zone,
  failed_at timestamp with time zone,
  last_error text,
  payload jsonb
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

  p_status := lower(nullif(btrim(p_status), ''));
  p_event_type := nullif(btrim(p_event_type), '');
  p_recipient_type := lower(nullif(btrim(p_recipient_type), ''));
  p_origin := lower(nullif(btrim(p_origin), ''));
  p_search := lower(nullif(btrim(p_search), ''));
  p_sort_key := lower(coalesce(nullif(btrim(p_sort_key), ''), 'created_at'));
  p_sort_direction := lower(coalesce(nullif(btrim(p_sort_direction), ''), 'desc'));
  p_limit := least(greatest(coalesce(p_limit, 50), 1), 100);
  p_offset := greatest(coalesce(p_offset, 0), 0);

  if p_sort_key not in (
    'created_at',
    'event_type',
    'guest_name',
    'recipient_type',
    'recipient_email',
    'status'
  ) then
    p_sort_key := 'created_at';
  end if;

  if p_sort_direction not in ('asc', 'desc') then
    p_sort_direction := 'desc';
  end if;

  return query
  select
    count(*) over () as total_count,
    event.id as notification_event_id,
    delivery.id as delivery_id,
    event.created_at,
    event.event_type,
    event.origin,
    event.aggregate_type,
    event.aggregate_id,
    event.aggregate_version,
    event.guest_id,
    guest.name as guest_name,
    event.status as event_status,
    coalesce(delivery.status, event.status) as delivery_status,
    delivery.recipient_type,
    delivery.recipient_email,
    delivery.channel,
    event.processed_at,
    delivery.sent_at,
    delivery.skipped_at,
    coalesce(delivery.failed_at, event.failed_at) as failed_at,
    coalesce(delivery.last_error, event.last_error) as last_error,
    event.payload
  from public.notification_events as event
  left join public.notification_deliveries as delivery
    on delivery.event_id = event.id
  left join public.guests as guest
    on guest.id = event.guest_id
  where (
      p_status is null
      or lower(event.status) = p_status
      or lower(delivery.status) = p_status
    )
    and (p_event_type is null or event.event_type = p_event_type)
    and (p_recipient_type is null or lower(delivery.recipient_type) = p_recipient_type)
    and (p_origin is null or event.origin = p_origin)
    and (p_created_from is null or event.created_at >= p_created_from)
    and (p_created_to is null or event.created_at < p_created_to)
    and (
      p_search is null
      or lower(coalesce(guest.name, '')) like '%' || p_search || '%'
      or lower(coalesce(delivery.recipient_email, '')) like '%' || p_search || '%'
      or lower(coalesce(delivery.last_error, event.last_error, '')) like '%' || p_search || '%'
      or lower(event.event_type) like '%' || p_search || '%'
      or lower(event.origin) like '%' || p_search || '%'
      or lower(event.aggregate_type) like '%' || p_search || '%'
      or lower(event.status) like '%' || p_search || '%'
      or lower(coalesce(delivery.status, '')) like '%' || p_search || '%'
      or lower(event.id::text) like '%' || p_search || '%'
      or lower(coalesce(delivery.id::text, '')) like '%' || p_search || '%'
      or lower(event.aggregate_id::text) like '%' || p_search || '%'
      or lower(event.payload::text) like '%' || p_search || '%'
    )
  order by
    case when p_sort_key = 'created_at' and p_sort_direction = 'asc' then event.created_at end asc nulls last,
    case when p_sort_key = 'created_at' and p_sort_direction = 'desc' then event.created_at end desc nulls last,
    case when p_sort_key = 'event_type' and p_sort_direction = 'asc' then event.event_type end asc nulls last,
    case when p_sort_key = 'event_type' and p_sort_direction = 'desc' then event.event_type end desc nulls last,
    case when p_sort_key = 'guest_name' and p_sort_direction = 'asc' then guest.name end asc nulls last,
    case when p_sort_key = 'guest_name' and p_sort_direction = 'desc' then guest.name end desc nulls last,
    case when p_sort_key = 'recipient_type' and p_sort_direction = 'asc' then delivery.recipient_type end asc nulls last,
    case when p_sort_key = 'recipient_type' and p_sort_direction = 'desc' then delivery.recipient_type end desc nulls last,
    case when p_sort_key = 'recipient_email' and p_sort_direction = 'asc' then delivery.recipient_email end asc nulls last,
    case when p_sort_key = 'recipient_email' and p_sort_direction = 'desc' then delivery.recipient_email end desc nulls last,
    case when p_sort_key = 'status' and p_sort_direction = 'asc' then coalesce(delivery.status, event.status) end asc nulls last,
    case when p_sort_key = 'status' and p_sort_direction = 'desc' then coalesce(delivery.status, event.status) end desc nulls last,
    event.created_at desc,
    delivery.created_at desc nulls last
  limit p_limit
  offset p_offset;
end;
$$;

comment on function public.admin_list_notification_deliveries(
  text,
  text,
  text,
  timestamp with time zone,
  timestamp with time zone,
  integer,
  integer,
  text,
  text,
  text,
  text
) is
  'Returns notification events and delivery attempts for authenticated administrators, with filters and sorting.';

revoke all on function public.admin_list_notification_deliveries(
  text,
  text,
  text,
  timestamp with time zone,
  timestamp with time zone,
  integer,
  integer,
  text,
  text,
  text,
  text
) from public, anon;
grant execute on function public.admin_list_notification_deliveries(
  text,
  text,
  text,
  timestamp with time zone,
  timestamp with time zone,
  integer,
  integer,
  text,
  text,
  text,
  text
) to authenticated;

commit;
-- ============================================================
-- Source: docs\migrations\notification_delivery_summary.sql
-- ============================================================

-- ============================================================
-- Notification delivery summary
-- ============================================================

begin;

create or replace function public.admin_get_notification_delivery_summary(
  p_status text default null,
  p_event_type text default null,
  p_recipient_type text default null,
  p_created_from timestamp with time zone default null,
  p_created_to timestamp with time zone default null,
  p_origin text default null,
  p_search text default null
)
returns table (
  total_count bigint,
  sent_count bigint,
  failed_count bigint,
  skipped_count bigint,
  pending_count bigint
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

  p_status := lower(nullif(btrim(p_status), ''));
  p_event_type := nullif(btrim(p_event_type), '');
  p_recipient_type := lower(nullif(btrim(p_recipient_type), ''));
  p_origin := lower(nullif(btrim(p_origin), ''));
  p_search := lower(nullif(btrim(p_search), ''));

  return query
  select
    count(*) as total_count,
    count(*) filter (
      where coalesce(delivery.status, event.status) = 'sent'
    ) as sent_count,
    count(*) filter (
      where coalesce(delivery.status, event.status) = 'failed'
    ) as failed_count,
    count(*) filter (
      where coalesce(delivery.status, event.status) = 'skipped'
    ) as skipped_count,
    count(*) filter (
      where coalesce(delivery.status, event.status) in ('pending', 'processing')
    ) as pending_count
  from public.notification_events as event
  left join public.notification_deliveries as delivery
    on delivery.event_id = event.id
  left join public.guests as guest
    on guest.id = event.guest_id
  where (
      p_status is null
      or lower(event.status) = p_status
      or lower(delivery.status) = p_status
    )
    and (p_event_type is null or event.event_type = p_event_type)
    and (p_recipient_type is null or lower(delivery.recipient_type) = p_recipient_type)
    and (p_origin is null or event.origin = p_origin)
    and (p_created_from is null or event.created_at >= p_created_from)
    and (p_created_to is null or event.created_at < p_created_to)
    and (
      p_search is null
      or lower(coalesce(guest.name, '')) like '%' || p_search || '%'
      or lower(coalesce(delivery.recipient_email, '')) like '%' || p_search || '%'
      or lower(coalesce(delivery.last_error, event.last_error, '')) like '%' || p_search || '%'
      or lower(event.event_type) like '%' || p_search || '%'
      or lower(event.origin) like '%' || p_search || '%'
      or lower(event.aggregate_type) like '%' || p_search || '%'
      or lower(event.status) like '%' || p_search || '%'
      or lower(coalesce(delivery.status, '')) like '%' || p_search || '%'
      or lower(event.id::text) like '%' || p_search || '%'
      or lower(coalesce(delivery.id::text, '')) like '%' || p_search || '%'
      or lower(event.aggregate_id::text) like '%' || p_search || '%'
      or lower(event.payload::text) like '%' || p_search || '%'
    );
end;
$$;

comment on function public.admin_get_notification_delivery_summary(
  text,
  text,
  text,
  timestamp with time zone,
  timestamp with time zone,
  text,
  text
) is
  'Returns total notification delivery counters for authenticated administrators using the current audit filters.';

revoke all on function public.admin_get_notification_delivery_summary(
  text,
  text,
  text,
  timestamp with time zone,
  timestamp with time zone,
  text,
  text
) from public, anon;

grant execute on function public.admin_get_notification_delivery_summary(
  text,
  text,
  text,
  timestamp with time zone,
  timestamp with time zone,
  text,
  text
) to authenticated;

commit;

-- ============================================================
-- Source: docs\migrations\admin_nav_alerts.sql
-- ============================================================

-- ============================================================
-- Admin navigation alerts
-- ============================================================

begin;

create or replace function public.admin_get_nav_alerts()
returns table (
  has_pending_wall_messages boolean,
  has_reported_gifts boolean
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
    exists (
      select 1
      from public.guest_wall_messages as wall_message
      where wall_message.status = 'pending'
      limit 1
    ) as has_pending_wall_messages,
    (
      exists (
        select 1
        from public.gifts as gift
        where gift.payment_status = 'Informado'
        limit 1
      )
      or exists (
        select 1
        from public.gift_contributions as contribution
        where contribution.payment_status = 'Informado'
        limit 1
      )
    ) as has_reported_gifts;
end;
$$;

comment on function public.admin_get_nav_alerts() is
  'Returns compact boolean alerts for the authenticated administrator navigation menu.';

revoke all on function public.admin_get_nav_alerts() from public, anon;
grant execute on function public.admin_get_nav_alerts() to authenticated;

commit;
