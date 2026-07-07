-- Every row returned by this script should have check_passed = true.

select
  format('settings.%s exists', expected.column_name) as check_name,
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'settings'
      and column_name = expected.column_name
  ) as check_passed
from (
  values
    ('bride_name'),
    ('groom_name'),
    ('wedding_date'),
    ('rsvp_deadline'),
    ('ceremony_name'),
    ('ceremony_address'),
    ('ceremony_time'),
    ('reception_name'),
    ('reception_address'),
    ('reception_time')
) as expected(column_name);

select
  'wedding event settings are complete' as check_name,
  exists (
    select 1
    from public.settings
    where nullif(btrim(bride_name), '') is not null
      and nullif(btrim(groom_name), '') is not null
      and wedding_date is not null
      and rsvp_deadline <= wedding_date::date
      and nullif(btrim(ceremony_name), '') is not null
      and nullif(btrim(ceremony_address), '') is not null
      and ceremony_time is not null
      and nullif(btrim(reception_name), '') is not null
      and nullif(btrim(reception_address), '') is not null
      and reception_time is not null
  ) as check_passed;
