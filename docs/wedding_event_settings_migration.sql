-- Add structured wedding information to the singleton settings row.

begin;

alter table public.settings
  add column if not exists bride_name text not null default 'Livia',
  add column if not exists groom_name text not null default 'Messias',
  add column if not exists wedding_date timestamptz not null default '2027-04-23 18:30:00-03',
  add column if not exists rsvp_deadline date not null default '2027-03-01',
  add column if not exists ceremony_name text not null default 'Santuário de Nossa Senhora de Fátima',
  add column if not exists ceremony_address text not null default 'Av. Treze de Maio, 200 - Fátima, Fortaleza - CE, 60040-530',
  add column if not exists ceremony_time time not null default '18:30',
  add column if not exists reception_name text not null default 'Martha''s Buffet Conceito',
  add column if not exists reception_address text not null default 'Av. Bezerra de Menezes, 531 - Parquelândia, Fortaleza - CE, 60325-004',
  add column if not exists reception_time time not null default '21:00';

commit;
