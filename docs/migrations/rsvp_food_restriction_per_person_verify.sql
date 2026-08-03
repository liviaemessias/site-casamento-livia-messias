-- ============================================================
-- Verification: RSVP dietary restriction per person
-- ============================================================

select
  'legacy rsvps.food column is absent' as check_name,
  not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'rsvps'
      and column_name = 'food'
  ) as check_passed;

select
  'legacy rsvps.food_restriction column is absent' as check_name,
  not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'rsvps'
      and column_name = 'food_restriction'
  ) as check_passed;

select
  'save_current_rsvp RPC exists' as check_name,
  to_regprocedure(
    'public.save_current_rsvp(text,text,text,text,boolean,text,jsonb)'
  ) is not null as check_passed;

select
  'admin_save_guest_rsvp RPC exists' as check_name,
  to_regprocedure(
    'public.admin_save_guest_rsvp(uuid,text,text,text,text,boolean,text,jsonb)'
  ) is not null as check_passed;

select
  'RSVP food summary helper exists' as check_name,
  to_regprocedure('public.rsvp_guest_data_food_summary(jsonb)') is not null
    as check_passed;

with people as (
  select
    rsvp.id,
    rsvp.guest_data as person
  from public.rsvps as rsvp
  where jsonb_typeof(coalesce(rsvp.guest_data, '{}'::jsonb)) = 'object'

  union all

  select
    rsvp.id,
    member.value as person
  from public.rsvps as rsvp
  cross join lateral jsonb_array_elements(
    case
      when jsonb_typeof(rsvp.guest_data -> 'members') = 'array'
        then rsvp.guest_data -> 'members'
      else '[]'::jsonb
    end
  ) as member(value)

  union all

  select
    rsvp.id,
    companion.value as person
  from public.rsvps as rsvp
  cross join lateral jsonb_array_elements(
    case
      when jsonb_typeof(rsvp.guest_data -> 'companions') = 'array'
        then rsvp.guest_data -> 'companions'
      else '[]'::jsonb
    end
  ) as companion(value)
)
select
  'dietary restriction text does not include duplicated person prefix'
    as check_name,
  not exists (
    select 1
    from people
    where nullif(btrim(person ->> 'name'), '') is not null
      and nullif(btrim(person ->> 'food'), '') is not null
      and lower(btrim(person ->> 'food')) like lower(btrim(person ->> 'name')) || ':%'
  ) as check_passed;
