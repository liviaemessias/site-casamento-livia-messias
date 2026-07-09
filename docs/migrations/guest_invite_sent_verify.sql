-- Every row returned by this script should have check_passed = true.

select
  'guests.invite_sent column exists' as check_name,
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'guests'
      and column_name = 'invite_sent'
      and data_type = 'boolean'
  ) as check_passed;

select
  'guests.invite_sent is not nullable' as check_name,
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'guests'
      and column_name = 'invite_sent'
      and is_nullable = 'NO'
  ) as check_passed;
