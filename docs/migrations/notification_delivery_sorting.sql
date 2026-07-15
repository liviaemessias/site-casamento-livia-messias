-- ============================================================
-- Notification delivery sorting
-- ============================================================

begin;

drop function if exists public.admin_list_notification_deliveries(
  text,
  text,
  text,
  timestamp with time zone,
  timestamp with time zone,
  integer,
  integer,
  text,
  text
);

drop function if exists public.admin_list_notification_deliveries(
  text,
  text,
  text,
  timestamp with time zone,
  timestamp with time zone,
  integer,
  integer,
  text,
  text,
  text,
  text
);

create or replace function public.admin_list_notification_deliveries(
  p_status text default null,
  p_event_type text default null,
  p_recipient_type text default null,
  p_created_from timestamp with time zone default null,
  p_created_to timestamp with time zone default null,
  p_limit integer default 50,
  p_offset integer default 0,
  p_origin text default null,
  p_search text default null,
  p_sort_key text default 'created_at',
  p_sort_direction text default 'desc'
)
returns table (
  total_count bigint,
  notification_event_id uuid,
  delivery_id uuid,
  created_at timestamp with time zone,
  event_type text,
  origin text,
  aggregate_type text,
  aggregate_id uuid,
  aggregate_version timestamp with time zone,
  guest_id uuid,
  guest_name text,
  event_status text,
  delivery_status text,
  recipient_type text,
  recipient_email text,
  channel text,
  processed_at timestamp with time zone,
  sent_at timestamp with time zone,
  skipped_at timestamp with time zone,
  failed_at timestamp with time zone,
  last_error text,
  payload jsonb
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.'
      using errcode = '42501';
  end if;

  p_status := lower(nullif(btrim(p_status), ''));
  p_event_type := nullif(btrim(p_event_type), '');
  p_recipient_type := lower(nullif(btrim(p_recipient_type), ''));
  p_origin := lower(nullif(btrim(p_origin), ''));
  p_search := lower(nullif(btrim(p_search), ''));
  p_sort_key := lower(coalesce(nullif(btrim(p_sort_key), ''), 'created_at'));
  p_sort_direction := lower(coalesce(nullif(btrim(p_sort_direction), ''), 'desc'));
  p_limit := least(greatest(coalesce(p_limit, 50), 1), 100);
  p_offset := greatest(coalesce(p_offset, 0), 0);

  if p_sort_key not in (
    'created_at',
    'event_type',
    'guest_name',
    'recipient_type',
    'recipient_email',
    'status'
  ) then
    p_sort_key := 'created_at';
  end if;

  if p_sort_direction not in ('asc', 'desc') then
    p_sort_direction := 'desc';
  end if;

  return query
  select
    count(*) over () as total_count,
    event.id as notification_event_id,
    delivery.id as delivery_id,
    event.created_at,
    event.event_type,
    event.origin,
    event.aggregate_type,
    event.aggregate_id,
    event.aggregate_version,
    event.guest_id,
    guest.name as guest_name,
    event.status as event_status,
    coalesce(delivery.status, event.status) as delivery_status,
    delivery.recipient_type,
    delivery.recipient_email,
    delivery.channel,
    event.processed_at,
    delivery.sent_at,
    delivery.skipped_at,
    coalesce(delivery.failed_at, event.failed_at) as failed_at,
    coalesce(delivery.last_error, event.last_error) as last_error,
    event.payload
  from public.notification_events as event
  left join public.notification_deliveries as delivery
    on delivery.event_id = event.id
  left join public.guests as guest
    on guest.id = event.guest_id
  where (
      p_status is null
      or lower(event.status) = p_status
      or lower(delivery.status) = p_status
    )
    and (p_event_type is null or event.event_type = p_event_type)
    and (p_recipient_type is null or lower(delivery.recipient_type) = p_recipient_type)
    and (p_origin is null or event.origin = p_origin)
    and (p_created_from is null or event.created_at >= p_created_from)
    and (p_created_to is null or event.created_at < p_created_to)
    and (
      p_search is null
      or lower(coalesce(guest.name, '')) like '%' || p_search || '%'
      or lower(coalesce(delivery.recipient_email, '')) like '%' || p_search || '%'
      or lower(coalesce(delivery.last_error, event.last_error, '')) like '%' || p_search || '%'
      or lower(event.event_type) like '%' || p_search || '%'
      or lower(event.origin) like '%' || p_search || '%'
      or lower(event.aggregate_type) like '%' || p_search || '%'
      or lower(event.status) like '%' || p_search || '%'
      or lower(coalesce(delivery.status, '')) like '%' || p_search || '%'
      or lower(event.id::text) like '%' || p_search || '%'
      or lower(coalesce(delivery.id::text, '')) like '%' || p_search || '%'
      or lower(event.aggregate_id::text) like '%' || p_search || '%'
      or lower(event.payload::text) like '%' || p_search || '%'
    )
  order by
    case when p_sort_key = 'created_at' and p_sort_direction = 'asc' then event.created_at end asc nulls last,
    case when p_sort_key = 'created_at' and p_sort_direction = 'desc' then event.created_at end desc nulls last,
    case when p_sort_key = 'event_type' and p_sort_direction = 'asc' then event.event_type end asc nulls last,
    case when p_sort_key = 'event_type' and p_sort_direction = 'desc' then event.event_type end desc nulls last,
    case when p_sort_key = 'guest_name' and p_sort_direction = 'asc' then guest.name end asc nulls last,
    case when p_sort_key = 'guest_name' and p_sort_direction = 'desc' then guest.name end desc nulls last,
    case when p_sort_key = 'recipient_type' and p_sort_direction = 'asc' then delivery.recipient_type end asc nulls last,
    case when p_sort_key = 'recipient_type' and p_sort_direction = 'desc' then delivery.recipient_type end desc nulls last,
    case when p_sort_key = 'recipient_email' and p_sort_direction = 'asc' then delivery.recipient_email end asc nulls last,
    case when p_sort_key = 'recipient_email' and p_sort_direction = 'desc' then delivery.recipient_email end desc nulls last,
    case when p_sort_key = 'status' and p_sort_direction = 'asc' then coalesce(delivery.status, event.status) end asc nulls last,
    case when p_sort_key = 'status' and p_sort_direction = 'desc' then coalesce(delivery.status, event.status) end desc nulls last,
    event.created_at desc,
    delivery.created_at desc nulls last
  limit p_limit
  offset p_offset;
end;
$$;

comment on function public.admin_list_notification_deliveries(
  text,
  text,
  text,
  timestamp with time zone,
  timestamp with time zone,
  integer,
  integer,
  text,
  text,
  text,
  text
) is
  'Returns notification events and delivery attempts for authenticated administrators, with filters and sorting.';

revoke all on function public.admin_list_notification_deliveries(
  text,
  text,
  text,
  timestamp with time zone,
  timestamp with time zone,
  integer,
  integer,
  text,
  text,
  text,
  text
) from public, anon;
grant execute on function public.admin_list_notification_deliveries(
  text,
  text,
  text,
  timestamp with time zone,
  timestamp with time zone,
  integer,
  integer,
  text,
  text,
  text,
  text
) to authenticated;

commit;
