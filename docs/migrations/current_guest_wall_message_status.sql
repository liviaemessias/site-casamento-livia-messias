-- ============================================================
-- Current guest wall message status
-- ============================================================

begin;

create or replace function public.current_guest_has_wall_message()
returns table (
  has_message boolean,
  status text,
  submitted_at timestamp with time zone,
  updated_at timestamp with time zone
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_guest uuid;
begin
  current_guest := public.current_guest_id();

  if current_guest is null then
    return query
    select false, null::text, null::timestamp with time zone, null::timestamp with time zone;
    return;
  end if;

  return query
  select
    exists (
      select 1
      from public.guest_wall_messages as wall_message
      where wall_message.guest_id = current_guest
    ) as has_message,
    (
      select wall_message.status
      from public.guest_wall_messages as wall_message
      where wall_message.guest_id = current_guest
      limit 1
    ) as status,
    (
      select wall_message.submitted_at
      from public.guest_wall_messages as wall_message
      where wall_message.guest_id = current_guest
      limit 1
    ) as submitted_at,
    (
      select wall_message.updated_at
      from public.guest_wall_messages as wall_message
      where wall_message.guest_id = current_guest
      limit 1
    ) as updated_at;
end;
$$;

comment on function public.current_guest_has_wall_message() is
  'Returns whether the current invited guest already has a wall message, without exposing the message text.';

revoke all on function public.current_guest_has_wall_message() from public, anon;
grant execute on function public.current_guest_has_wall_message() to authenticated;

commit;
