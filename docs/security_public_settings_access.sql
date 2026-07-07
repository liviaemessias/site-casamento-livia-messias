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
