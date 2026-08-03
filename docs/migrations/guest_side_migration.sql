begin;

alter table public.guests
  add column if not exists guest_side text not null default 'couple';

alter table public.guests
  drop constraint if exists guests_guest_side_check;

alter table public.guests
  add constraint guests_guest_side_check
    check (guest_side in ('bride', 'groom', 'couple'));

comment on column public.guests.guest_side is
  'Identifies whether the invitation belongs to the bride, groom or couple.';

commit;
