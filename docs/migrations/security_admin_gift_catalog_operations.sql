-- ============================================================
-- Secure administrative gift catalog operations
-- ============================================================

begin;

create or replace function public.admin_save_gift(
  target_gift_id uuid,
  submitted_category text,
  submitted_name text,
  submitted_description text,
  submitted_price numeric,
  submitted_image_url text,
  submitted_gift_type text,
  submitted_quota_count integer,
  submitted_purchase_mode text,
  submitted_card_payment_url text,
  submitted_external_options jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  existing_gift public.gifts%rowtype;
  saved_gift_id uuid;
  safe_category text;
  safe_name text;
  safe_description text;
  safe_image_url text;
  safe_gift_type text;
  safe_purchase_mode text;
  safe_card_payment_url text;
  safe_external_options jsonb := '[]'::jsonb;
  safe_price numeric;
  safe_quota_count integer;
  safe_quota_value numeric;
  has_activity boolean;
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

  safe_category := nullif(btrim(submitted_category), '');
  safe_name := nullif(btrim(submitted_name), '');
  safe_description := left(btrim(coalesce(submitted_description, '')), 4000);
  safe_image_url := left(btrim(coalesce(submitted_image_url, '')), 2000);
  safe_gift_type := lower(nullif(btrim(submitted_gift_type), ''));
  safe_purchase_mode := lower(nullif(btrim(submitted_purchase_mode), ''));
  safe_card_payment_url := left(
    btrim(coalesce(submitted_card_payment_url, '')),
    2000
  );
  safe_price := submitted_price;
  safe_quota_count := submitted_quota_count;

  if safe_category is null
    or safe_name is null
    or safe_gift_type is null
    or safe_gift_type not in ('single', 'quota')
    or safe_purchase_mode is null
    or safe_purchase_mode not in ('money', 'external', 'hybrid')
    or (safe_price is not null and safe_price <= 0)
    or (
      safe_card_payment_url <> ''
      and safe_card_payment_url !~* '^https?://'
    )
  then
    return null;
  end if;

  if safe_gift_type = 'quota' then
    if safe_price is null
      or safe_quota_count is null
      or safe_quota_count <= 0
    then
      return null;
    end if;

    safe_purchase_mode := 'money';
    safe_external_options := '[]'::jsonb;
    safe_quota_value := safe_price / safe_quota_count;
  else
    safe_quota_count := null;
    safe_quota_value := null;

    if safe_purchase_mode in ('money', 'hybrid') and safe_price is null then
      return null;
    end if;

    if safe_purchase_mode = 'money' then
      safe_external_options := '[]'::jsonb;
    else
      if jsonb_typeof(coalesce(submitted_external_options, '[]'::jsonb))
          <> 'array'
        or exists (
          select 1
          from jsonb_array_elements(
            coalesce(submitted_external_options, '[]'::jsonb)
          ) as option
          where jsonb_typeof(option) <> 'object'
            or option ->> 'type' is null
            or option ->> 'type' not in ('online', 'physical')
            or nullif(btrim(option ->> 'store'), '') is null
            or (
              option ->> 'type' = 'online'
              and coalesce(option ->> 'url', '') !~* '^https?://'
            )
        )
      then
        return null;
      end if;

      select coalesce(
        jsonb_agg(
          jsonb_build_object(
            'type', option ->> 'type',
            'store', left(btrim(option ->> 'store'), 200),
            'url', case
              when option ->> 'type' = 'online'
                then left(btrim(option ->> 'url'), 2000)
              else ''
            end,
            'notes', left(btrim(coalesce(option ->> 'notes', '')), 1000)
          )
          order by position
        ),
        '[]'::jsonb
      )
      into safe_external_options
      from jsonb_array_elements(
        coalesce(submitted_external_options, '[]'::jsonb)
      )
        with ordinality as options(option, position);
    end if;
  end if;

  if target_gift_id is null then
    insert into public.gifts (
      category,
      name,
      description,
      price,
      image_url,
      status,
      payment_status,
      gift_type,
      quota_count,
      quota_value,
      purchase_mode,
      card_payment_url,
      external_purchase_options
    )
    values (
      left(safe_category, 200),
      left(safe_name, 300),
      safe_description,
      safe_price,
      safe_image_url,
      'Disponível',
      null,
      safe_gift_type,
      safe_quota_count,
      safe_quota_value,
      safe_purchase_mode,
      safe_card_payment_url,
      safe_external_options
    )
    returning id into saved_gift_id;

    return saved_gift_id;
  end if;

  select *
  into existing_gift
  from public.gifts
  where id = target_gift_id
  for update;

  if not found then
    return null;
  end if;

  has_activity := existing_gift.reserved_guest_id is not null
    or existing_gift.status in ('Parcial', 'Reservado', 'Comprado')
    or exists (
      select 1
      from public.gift_contributions as contribution
      where contribution.gift_id = target_gift_id
    );

  if has_activity and (
    existing_gift.gift_type is distinct from safe_gift_type
    or existing_gift.price is distinct from safe_price
    or existing_gift.quota_count is distinct from safe_quota_count
    or existing_gift.purchase_mode is distinct from safe_purchase_mode
    or coalesce(existing_gift.card_payment_url, '')
      is distinct from safe_card_payment_url
    or coalesce(existing_gift.external_purchase_options, '[]'::jsonb)
      is distinct from safe_external_options
  ) then
    return null;
  end if;

  update public.gifts
  set
    category = left(safe_category, 200),
    name = left(safe_name, 300),
    description = safe_description,
    price = safe_price,
    image_url = safe_image_url,
    gift_type = safe_gift_type,
    quota_count = safe_quota_count,
    quota_value = safe_quota_value,
    purchase_mode = safe_purchase_mode,
    card_payment_url = safe_card_payment_url,
    external_purchase_options = safe_external_options
  where id = target_gift_id
  returning id into saved_gift_id;

  return saved_gift_id;
end;
$$;

create or replace function public.admin_delete_gift(target_gift_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  deleted_gift_id uuid;
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

  delete from public.gifts
  where id = target_gift_id
  returning id into deleted_gift_id;

  return deleted_gift_id is not null;
end;
$$;

comment on function public.admin_save_gift(
  uuid,
  text,
  text,
  text,
  numeric,
  text,
  text,
  integer,
  text,
  text,
  jsonb
) is
  'Validates and creates or updates a gift as an administrator.';
comment on function public.admin_delete_gift(uuid) is
  'Deletes a gift and its quota contributions as an administrator.';

revoke all on function public.admin_save_gift(
  uuid,
  text,
  text,
  text,
  numeric,
  text,
  text,
  integer,
  text,
  text,
  jsonb
) from public, anon;
revoke all on function public.admin_delete_gift(uuid) from public, anon;

grant execute on function public.admin_save_gift(
  uuid,
  text,
  text,
  text,
  numeric,
  text,
  text,
  integer,
  text,
  text,
  jsonb
) to authenticated;
grant execute on function public.admin_delete_gift(uuid) to authenticated;

-- All gift mutations now use guest or administrative RPCs.
revoke insert, update, delete on table public.gifts from authenticated;

commit;
