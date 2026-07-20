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
  food_restriction boolean not null default false,
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
