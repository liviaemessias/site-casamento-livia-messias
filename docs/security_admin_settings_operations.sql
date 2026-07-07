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
