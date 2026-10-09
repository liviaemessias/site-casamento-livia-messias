-- Require a compatible purchase method when an administrator confirms a gift.
-- The chosen method and confirmation are saved in the same transaction.

begin;

drop function if exists public.admin_confirm_gift_purchase(uuid);

create or replace function public.admin_confirm_gift_purchase(
  target_gift_id uuid,
  target_purchase_method text default null
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  event_time timestamp with time zone;
  gift_record public.gifts%rowtype;
  updated_gift public.gifts%rowtype;
  normalized_purchase_mode text;
  effective_purchase_method text;
  safe_purchase_details jsonb;
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

  select gift.*
  into gift_record
  from public.gifts as gift
  where gift.id = target_gift_id
    and gift.status = 'Reservado'
    and coalesce(gift.gift_type, 'single') <> 'quota'
    and gift.reserved_guest_id is not null
    and coalesce(gift.payment_status, 'Pendente') <> 'Confirmado'
  for update of gift;

  if not found then
    return false;
  end if;

  effective_purchase_method := coalesce(
    nullif(btrim(gift_record.selected_purchase_method), ''),
    nullif(btrim(target_purchase_method), '')
  );

  if effective_purchase_method is null then
    return false;
  end if;

  if nullif(btrim(gift_record.selected_purchase_method), '') is not null
    and target_purchase_method is not null
    and btrim(target_purchase_method)
      <> btrim(gift_record.selected_purchase_method)
  then
    return false;
  end if;

  normalized_purchase_mode := coalesce(
    nullif(btrim(gift_record.purchase_mode), ''),
    'money'
  );

  if normalized_purchase_mode not in ('money', 'external', 'hybrid') then
    return false;
  end if;

  if effective_purchase_method in ('pix', 'card') then
    if normalized_purchase_mode not in ('money', 'hybrid')
      or gift_record.price is null
      or gift_record.price <= 0
    then
      return false;
    end if;

    if effective_purchase_method = 'card'
      and nullif(btrim(gift_record.card_payment_url), '') is null
    then
      return false;
    end if;
  elsif effective_purchase_method in ('online', 'physical') then
    if normalized_purchase_mode not in ('external', 'hybrid') then
      return false;
    end if;
  else
    return false;
  end if;

  if effective_purchase_method = 'pix' then
    safe_purchase_details := jsonb_build_object('type', 'pix');
  elsif effective_purchase_method = 'card' then
    safe_purchase_details := jsonb_build_object(
      'type', 'card',
      'url', gift_record.card_payment_url
    );
  else
    safe_purchase_details :=
      case
        when jsonb_typeof(gift_record.selected_purchase_details) = 'object'
          then gift_record.selected_purchase_details
        else '{}'::jsonb
      end
      || jsonb_build_object('type', effective_purchase_method);
  end if;

  event_time := timezone('utc'::text, now());

  update public.gifts
  set
    status = 'Comprado',
    payment_status = 'Confirmado',
    selected_purchase_method = effective_purchase_method,
    selected_purchase_details = safe_purchase_details
  where id = target_gift_id
  returning * into updated_gift;

  if not found then
    return false;
  end if;

  perform public.enqueue_gift_notification_event(
    'gift_purchase_confirmed',
    'gift',
    updated_gift.id,
    event_time,
    updated_gift.reserved_guest_id,
    jsonb_build_object(
      'gift_id', updated_gift.id,
      'gift_name', updated_gift.name,
      'gift_category', updated_gift.category,
      'gift_type', coalesce(updated_gift.gift_type, 'single'),
      'price', updated_gift.price,
      'message', updated_gift.reservation_message,
      'payment_status', updated_gift.payment_status,
      'purchase_method', updated_gift.selected_purchase_method
    )
  );

  return true;
end;
$$;

comment on function public.admin_confirm_gift_purchase(uuid, text) is
  'Confirms a reserved gift as an authenticated administrator and records the compatible purchase method atomically.';

revoke all on function public.admin_confirm_gift_purchase(uuid, text)
  from public, anon;
grant execute on function public.admin_confirm_gift_purchase(uuid, text)
  to authenticated;

notify pgrst, 'reload schema';

commit;