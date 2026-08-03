select
  'guests.guest_side column exists' as check_name,
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'guests'
      and column_name = 'guest_side'
      and data_type = 'text'
  ) as check_passed;

select
  'guests.guest_side is not nullable with default' as check_name,
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'guests'
      and column_name = 'guest_side'
      and is_nullable = 'NO'
      and column_default = '''couple''::text'
  ) as check_passed;

select
  'guests.guest_side constraint exists' as check_name,
  exists (
    select 1
    from pg_constraint
    where conname = 'guests_guest_side_check'
      and conrelid = 'public.guests'::regclass
  ) as check_passed;
