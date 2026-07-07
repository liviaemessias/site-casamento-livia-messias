-- ============================================================
-- Harden guest gift purchase method and payment reporting
-- ============================================================

begin;

create or replace function public.set_gift_purchase_method(
  target_gift_id uuid,
  purchase_method text,
  purchase_details jsonb default null
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_guest uuid;
  gift_record public.gifts%rowtype;
  safe_purchase_details jsonb;
  normalized_purchase_mode text;
  updated_count integer;
begin
  current_guest := public.current_guest_id();

  if current_guest is null
    or purchase_method is null
    or purchase_method not in ('pix', 'card', 'online', 'physical')
  then
    return false;
  end if;

  select *
  into gift_record
  from public.gifts
  where id = target_gift_id
    and reserved_guest_id = current_guest
    and coalesce(gift_type, 'single') <> 'quota'
  for update;

  if not found
    or gift_record.payment_status = 'Confirmado'
  then
    return false;
  end if;

  normalized_purchase_mode := coalesce(gift_record.purchase_mode, 'money');

  if normalized_purchase_mode = 'money'
    and purchase_method not in ('pix', 'card')
  then
    return false;
  end if;

  if normalized_purchase_mode = 'external'
    and purchase_method not in ('online', 'physical')
  then
    return false;
  end if;

  if normalized_purchase_mode not in ('money', 'external', 'hybrid') then
    return false;
  end if;

  if purchase_method = 'pix' then
    if gift_record.price is null or gift_record.price <= 0 then
      return false;
    end if;

    safe_purchase_details := jsonb_build_object('type', 'pix');
  elsif purchase_method = 'card' then
    if gift_record.price is null
      or gift_record.price <= 0
      or nullif(gift_record.card_payment_url, '') is null
    then
      return false;
    end if;

    safe_purchase_details := jsonb_build_object(
      'type', 'card',
      'url', gift_record.card_payment_url
    );
  elsif purchase_details is null then
    -- Suggested stores are optional; the guest may buy elsewhere.
    safe_purchase_details := jsonb_build_object('type', purchase_method);
  elsif not exists (
    select 1
    from jsonb_array_elements(
      case
        when jsonb_typeof(gift_record.external_purchase_options) = 'array'
          then gift_record.external_purchase_options
        else '[]'::jsonb
      end
    ) as option
    where option = purchase_details
      and option ->> 'type' = purchase_method
  ) then
    return false;
  else
    safe_purchase_details := purchase_details;
  end if;

  update public.gifts
  set
    selected_purchase_method = purchase_method,
    selected_purchase_details = safe_purchase_details
  where id = target_gift_id
    and reserved_guest_id = current_guest
    and coalesce(gift_type, 'single') <> 'quota'
    and coalesce(payment_status, 'Pendente') <> 'Confirmado';

  get diagnostics updated_count = row_count;
  return updated_count = 1;
end;
$$;

create or replace function public.report_gift_payment(target_gift_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_guest uuid;
  updated_count integer;
begin
  current_guest := public.current_guest_id();

  if current_guest is null then
    return false;
  end if;

  update public.gifts
  set
    payment_status = 'Informado',
    payment_reported_at = timezone('utc'::text, now())
  where id = target_gift_id
    and reserved_guest_id = current_guest
    and coalesce(gift_type, 'single') <> 'quota'
    and coalesce(payment_status, 'Pendente') <> 'Confirmado'
    and (
      (
        coalesce(purchase_mode, 'money') = 'money'
        and selected_purchase_method in ('pix', 'card')
        and selected_purchase_details is not null
      )
      or (
        purchase_mode = 'hybrid'
        and selected_purchase_method in ('pix', 'card')
        and selected_purchase_details is not null
      )
      or (
        purchase_mode in ('external', 'hybrid')
        and selected_purchase_method in ('online', 'physical')
        and selected_purchase_details ->> 'type'
          = selected_purchase_method
      )
    );

  get diagnostics updated_count = row_count;
  return updated_count = 1;
end;
$$;

comment on function public.set_gift_purchase_method(uuid, text, jsonb) is
  'Stores only purchase methods allowed by the reserved gift configuration.';
comment on function public.report_gift_payment(uuid) is
  'Reports payment only after a compatible purchase method was selected.';

revoke all on function public.set_gift_purchase_method(uuid, text, jsonb)
  from public, anon;
revoke all on function public.report_gift_payment(uuid) from public, anon;
grant execute on function public.set_gift_purchase_method(uuid, text, jsonb)
  to authenticated;
grant execute on function public.report_gift_payment(uuid) to authenticated;

commit;
