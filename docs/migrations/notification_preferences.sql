-- ============================================================
-- Notification preferences
-- ============================================================
--
-- Adds per-event switches for automatic/manual notification flows.

begin;

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
    'rsvp_saved',
    'rsvp',
    'RSVP recebido/atualizado',
    'Enviado quando o convidado salva ou atualiza o RSVP público.',
    true,
    false,
    true,
    true
  ),
  (
    'gift_reserved',
    'gift',
    'Presente reservado',
    'Enviado quando o convidado reserva um presente individual.',
    true,
    false,
    true,
    true
  ),
  (
    'gift_payment_reported',
    'gift',
    'Pagamento ou compra de presente informado',
    'Enviado quando o convidado informa pagamento ou compra de presente individual.',
    true,
    false,
    true,
    true
  ),
  (
    'gift_purchase_confirmed',
    'gift',
    'Presente confirmado',
    'Enviado quando o admin confirma o pagamento ou compra de presente individual.',
    true,
    false,
    true,
    true
  ),
  (
    'gift_reservation_released',
    'gift',
    'Presente liberado',
    'Enviado quando o admin libera uma reserva de presente individual.',
    true,
    false,
    true,
    true
  ),
  (
    'gift_contribution_reserved',
    'gift_contribution',
    'Cota reservada',
    'Enviado quando o convidado reserva cotas de um presente.',
    true,
    false,
    true,
    true
  ),
  (
    'gift_contribution_payment_reported',
    'gift_contribution',
    'Pagamento de cota informado',
    'Enviado quando o convidado informa pagamento de cotas.',
    true,
    false,
    true,
    true
  ),
  (
    'gift_contribution_confirmed',
    'gift_contribution',
    'Cota confirmada',
    'Enviado quando o admin confirma uma contribuição por cotas.',
    true,
    false,
    true,
    true
  ),
  (
    'gift_contribution_released',
    'gift_contribution',
    'Cota liberada',
    'Enviado quando o admin libera uma reserva de cotas.',
    true,
    false,
    true,
    true
  )
on conflict (event_type) do update
set
  event_group = excluded.event_group,
  label = excluded.label,
  description = excluded.description,
  updated_at = timezone('utc'::text, now());

alter table public.notification_preferences enable row level security;

revoke all on table public.notification_preferences from anon, authenticated;

grant select, insert, update, delete
  on table public.notification_preferences
  to service_role;

comment on table public.notification_preferences is
  'Per-event switches for automatic and manual notification flows.';

commit;
