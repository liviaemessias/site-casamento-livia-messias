-- ============================================================
-- Notification delivery summary
-- ============================================================

begin;

create or replace function public.admin_get_notification_delivery_summary(
  p_status text default null,
  p_event_type text default null,
  p_recipient_type text default null,
  p_created_from timestamp with time zone default null,
  p_created_to timestamp with time zone default null,
  p_origin text default null,
  p_search text default null
)
returns table (
  total_count bigint,
  sent_count bigint,
  failed_count bigint,
  skipped_count bigint,
  pending_count bigint
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

  return query
  select
    count(*) as total_count,
    count(*) filter (
      where coalesce(delivery.status, event.status) = 'sent'
    ) as sent_count,
    count(*) filter (
      where coalesce(delivery.status, event.status) = 'failed'
    ) as failed_count,
    count(*) filter (
      where coalesce(delivery.status, event.status) = 'skipped'
    ) as skipped_count,
    count(*) filter (
      where coalesce(delivery.status, event.status) in ('pending', 'processing')
    ) as pending_count
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
    );
end;
$$;

comment on function public.admin_get_notification_delivery_summary(
  text,
  text,
  text,
  timestamp with time zone,
  timestamp with time zone,
  text,
  text
) is
  'Returns total notification delivery counters for authenticated administrators using the current audit filters.';

revoke all on function public.admin_get_notification_delivery_summary(
  text,
  text,
  text,
  timestamp with time zone,
  timestamp with time zone,
  text,
  text
) from public, anon;

grant execute on function public.admin_get_notification_delivery_summary(
  text,
  text,
  text,
  timestamp with time zone,
  timestamp with time zone,
  text,
  text
) to authenticated;

commit;
