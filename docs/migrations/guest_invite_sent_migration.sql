-- ============================================================
-- Track whether each guest invitation was sent
-- ============================================================

begin;

alter table public.guests
  add column if not exists invite_sent boolean not null default false;

comment on column public.guests.invite_sent is
  'Indicates whether the wedding invitation was already sent to this guest.';

commit;
