-- ============================================================
-- Secure administrative notification preference operations
-- ============================================================

begin;

create or replace function public.admin_list_notification_preferences()
returns table (
  event_type text,
  event_group text,
  label text,
  description text,
  automatic_enabled boolean,
  manual_enabled boolean,
  admin_enabled boolean,
  guest_enabled boolean,
  updated_at timestamp with time zone
)
language plpgsql
security definer
set search_path = ''
as $$
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

  return query
  select
    preference.event_type,
    preference.event_group,
    preference.label,
    preference.description,
    preference.automatic_enabled,
    preference.manual_enabled,
    preference.admin_enabled,
    preference.guest_enabled,
    preference.updated_at
  from public.notification_preferences as preference
  order by
    case preference.event_group
      when 'rsvp' then 1
      when 'gift' then 2
      when 'gift_contribution' then 3
      else 4
    end,
    preference.label;
end;
$$;

create or replace function public.admin_update_notification_preference(
  target_event_type text,
  submitted_automatic_enabled boolean,
  submitted_manual_enabled boolean,
  submitted_admin_enabled boolean,
  submitted_guest_enabled boolean
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
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

  update public.notification_preferences
  set
    automatic_enabled = coalesce(submitted_automatic_enabled, automatic_enabled),
    manual_enabled = coalesce(submitted_manual_enabled, manual_enabled),
    admin_enabled = coalesce(submitted_admin_enabled, admin_enabled),
    guest_enabled = coalesce(submitted_guest_enabled, guest_enabled),
    updated_at = timezone('utc'::text, now())
  where event_type = nullif(btrim(target_event_type), '');

  return found;
end;
$$;

comment on function public.admin_list_notification_preferences() is
  'Returns notification preferences for authenticated administrators.';

comment on function public.admin_update_notification_preference(
  text,
  boolean,
  boolean,
  boolean,
  boolean
) is
  'Updates one notification preference row as an authenticated administrator.';

revoke all on function public.admin_list_notification_preferences() from public, anon;
grant execute on function public.admin_list_notification_preferences() to authenticated;

revoke all on function public.admin_update_notification_preference(
  text,
  boolean,
  boolean,
  boolean,
  boolean
) from public, anon;

grant execute on function public.admin_update_notification_preference(
  text,
  boolean,
  boolean,
  boolean,
  boolean
) to authenticated;

commit;
