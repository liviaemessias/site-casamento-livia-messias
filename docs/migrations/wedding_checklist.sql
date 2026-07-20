begin;

create table if not exists public.wedding_checklist_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text not null default '#6f3fa7',
  icon text not null default 'check-square',
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint wedding_checklist_categories_name_key unique (name),
  constraint wedding_checklist_categories_name_length_check
    check (char_length(btrim(name)) between 1 and 120),
  constraint wedding_checklist_categories_color_check
    check (color ~ '^#[0-9A-Fa-f]{6}$'),
  constraint wedding_checklist_categories_icon_length_check
    check (char_length(btrim(icon)) between 1 and 60)
);

create table if not exists public.wedding_checklist_responsibles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  responsible_type text not null default 'person',
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint wedding_checklist_responsibles_name_key unique (name),
  constraint wedding_checklist_responsibles_name_length_check
    check (char_length(btrim(name)) between 1 and 120),
  constraint wedding_checklist_responsibles_type_check
    check (responsible_type in ('person', 'group', 'family', 'planner', 'other'))
);

create table if not exists public.wedding_checklist_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.wedding_checklist_categories(id) on delete restrict,
  responsible_id uuid null references public.wedding_checklist_responsibles(id) on delete restrict,
  title text not null,
  description text null,
  period_key text not null,
  status text not null default 'pending',
  priority text not null default 'normal',
  owner text not null default 'couple',
  due_date date null,
  notes text null,
  display_order integer not null default 0,
  completed_at timestamp with time zone null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint wedding_checklist_items_unique_period_title unique (period_key, title),
  constraint wedding_checklist_items_title_length_check
    check (char_length(btrim(title)) between 1 and 180),
  constraint wedding_checklist_items_description_length_check
    check (description is null or char_length(description) <= 900),
  constraint wedding_checklist_items_notes_length_check
    check (notes is null or char_length(notes) <= 1600),
  constraint wedding_checklist_items_period_check
    check (
      period_key in (
        '12_months_before',
        '11_months_before',
        '10_months_before',
        '9_months_before',
        '8_months_before',
        '7_months_before',
        '6_months_before',
        '5_months_before',
        '4_months_before',
        '3_months_before',
        '2_months_before',
        '1_month_before',
        'wedding_week',
        'wedding_day',
        'after_wedding'
      )
    ),
  constraint wedding_checklist_items_status_check
    check (status in ('pending', 'in_progress', 'completed')),
  constraint wedding_checklist_items_priority_check
    check (priority in ('low', 'normal', 'high')),
  constraint wedding_checklist_items_owner_check
    check (owner in ('bride', 'groom', 'couple', 'planner', 'family'))
);

alter table public.wedding_checklist_items
  add column if not exists responsible_id uuid null references public.wedding_checklist_responsibles(id) on delete restrict;

create index if not exists wedding_checklist_categories_order_idx
  on public.wedding_checklist_categories (is_active, display_order, name);

create index if not exists wedding_checklist_responsibles_order_idx
  on public.wedding_checklist_responsibles (is_active, display_order, name);

create index if not exists wedding_checklist_items_period_order_idx
  on public.wedding_checklist_items (period_key, display_order, title);

create index if not exists wedding_checklist_items_status_idx
  on public.wedding_checklist_items (status, due_date);

alter table public.wedding_checklist_categories enable row level security;
alter table public.wedding_checklist_responsibles enable row level security;
alter table public.wedding_checklist_items enable row level security;

revoke all on table public.wedding_checklist_categories from anon, authenticated;
revoke all on table public.wedding_checklist_responsibles from anon, authenticated;
revoke all on table public.wedding_checklist_items from anon, authenticated;
grant all on table public.wedding_checklist_categories to service_role;
grant all on table public.wedding_checklist_responsibles to service_role;
grant all on table public.wedding_checklist_items to service_role;

create or replace function public.touch_wedding_checklist_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_wedding_checklist_categories_updated_at
  on public.wedding_checklist_categories;
create trigger touch_wedding_checklist_categories_updated_at
  before update on public.wedding_checklist_categories
  for each row
  execute function public.touch_wedding_checklist_updated_at();

drop trigger if exists touch_wedding_checklist_responsibles_updated_at
  on public.wedding_checklist_responsibles;
create trigger touch_wedding_checklist_responsibles_updated_at
  before update on public.wedding_checklist_responsibles
  for each row
  execute function public.touch_wedding_checklist_updated_at();

drop trigger if exists touch_wedding_checklist_items_updated_at
  on public.wedding_checklist_items;
create trigger touch_wedding_checklist_items_updated_at
  before update on public.wedding_checklist_items
  for each row
  execute function public.touch_wedding_checklist_updated_at();

insert into public.wedding_checklist_categories
  (name, color, icon, display_order)
values
  ('Cerimônia', '#6f3fa7', 'church', 1),
  ('Recepção', '#a6607c', 'party-popper', 2),
  ('Convidados', '#3f7f8f', 'users', 3),
  ('Fornecedores', '#7b6f3f', 'handshake', 4),
  ('Documentação', '#8f5f3f', 'file-check', 5),
  ('Trajes', '#5f6f9f', 'shirt', 6),
  ('Beleza', '#b45f8a', 'sparkles', 7),
  ('Música', '#6b7f3f', 'music', 8),
  ('Decoração', '#8a6bb4', 'flower-2', 9),
  ('Presentes', '#b47a3f', 'gift', 10),
  ('Papelaria e Convites', '#4f7a5a', 'mail', 11),
  ('Pré-Wedding', '#6f8fb4', 'camera', 12),
  ('Save the Date', '#9f6f6f', 'calendar-heart', 13),
  ('Caixinha dos Padrinhos', '#7f5fa7', 'package', 14),
  ('Caixinha dos Pais', '#a75f7f', 'heart', 15),
  ('Lua de Mel', '#3f7fa7', 'plane', 16),
  ('Financeiro', '#5f8f5f', 'wallet', 17),
  ('Outros', '#6b6473', 'more-horizontal', 18)
on conflict (name) do nothing;

insert into public.wedding_checklist_responsibles
  (name, responsible_type, display_order)
values
  ('Casal', 'group', 1),
  ('Noiva', 'person', 2),
  ('Noivo', 'person', 3),
  ('Cerimonialista', 'planner', 4),
  ('Família', 'family', 5),
  ('Mãe da Noiva', 'family', 6),
  ('Pai da Noiva', 'family', 7),
  ('Mãe do Noivo', 'family', 8),
  ('Pai do Noivo', 'family', 9),
  ('Padrinhos', 'group', 10),
  ('Madrinhas', 'group', 11),
  ('Padrinho', 'person', 12),
  ('Madrinha', 'person', 13),
  ('Amigo(a)', 'person', 14),
  ('Amigos', 'group', 15),
  ('Outro', 'other', 16)
on conflict (name) do nothing;

update public.wedding_checklist_responsibles
set name = 'Noiva'
where name = 'Livia'
  and not exists (
    select 1
    from public.wedding_checklist_responsibles
    where name = 'Noiva'
  );

update public.wedding_checklist_responsibles
set name = 'Noivo'
where name = 'Messias'
  and not exists (
    select 1
    from public.wedding_checklist_responsibles
    where name = 'Noivo'
  );

do $$
begin
  if (
    select coalesce(max(display_order), 0)
    from public.wedding_checklist_categories
  ) > (
    select greatest(count(*) * 2, 1)
    from public.wedding_checklist_categories
  ) then
    with ordered_categories as (
      select
        id,
        row_number() over (order by display_order asc, name asc) as normalized_order
      from public.wedding_checklist_categories
    )
    update public.wedding_checklist_categories as category
    set display_order = ordered_categories.normalized_order
    from ordered_categories
    where ordered_categories.id = category.id;
  end if;
end;
$$;

do $$
begin
  if (
    select coalesce(max(display_order), 0)
    from public.wedding_checklist_responsibles
  ) > (
    select greatest(count(*) * 2, 1)
    from public.wedding_checklist_responsibles
  ) then
    with ordered_responsibles as (
      select
        id,
        row_number() over (order by display_order asc, name asc) as normalized_order
      from public.wedding_checklist_responsibles
    )
    update public.wedding_checklist_responsibles as responsible
    set display_order = ordered_responsibles.normalized_order
    from ordered_responsibles
    where ordered_responsibles.id = responsible.id;
  end if;
end;
$$;

insert into public.wedding_checklist_items
  (category_id, title, description, period_key, priority, owner, display_order)
select category.id, seed.title, seed.description, seed.period_key, seed.priority, seed.owner, seed.display_order
from (
  values
    ('12_months_before', 'Convidados', 'Montar a lista inicial de convidados.', 'Definir lista preliminar de convidados', 'high', 'couple', 10),
    ('12_months_before', 'Cerimônia', 'Reservar a igreja ou local da cerimônia.', 'Reservar local da cerimônia', 'high', 'couple', 20),
    ('12_months_before', 'Recepção', 'Definir e reservar o espaço da recepção.', 'Reservar local da recepção', 'high', 'couple', 30),
    ('11_months_before', 'Fornecedores', 'Pesquisar fotografia, filmagem, buffet, cerimonial e música.', 'Pesquisar fornecedores principais', 'high', 'couple', 10),
    ('11_months_before', 'Financeiro', 'Criar uma estimativa inicial de orçamento.', 'Definir orçamento inicial', 'high', 'couple', 20),
    ('10_months_before', 'Fornecedores', 'Fechar cerimonial ou assessoria do casamento.', 'Contratar cerimonial', 'high', 'couple', 10),
    ('10_months_before', 'Papelaria e Convites', 'Definir identidade visual inicial do casamento.', 'Definir identidade visual', 'normal', 'couple', 20),
    ('9_months_before', 'Pré-Wedding', 'Escolher estilo, local e data aproximada do ensaio.', 'Planejar ensaio Pré-Wedding', 'normal', 'couple', 10),
    ('9_months_before', 'Save the Date', 'Planejar formato e envio do Save the Date.', 'Planejar Save the Date', 'normal', 'couple', 20),
    ('8_months_before', 'Trajes', 'Pesquisar vestido, traje do noivo e referências.', 'Pesquisar trajes dos noivos', 'normal', 'couple', 10),
    ('8_months_before', 'Caixinha dos Padrinhos', 'Definir padrinhos, madrinhas e estilo das caixinhas.', 'Planejar caixinhas dos padrinhos', 'normal', 'couple', 20),
    ('7_months_before', 'Caixinha dos Pais', 'Definir lembrança ou caixinha especial para os pais.', 'Planejar caixinhas dos pais', 'normal', 'couple', 10),
    ('7_months_before', 'Música', 'Escolher repertório da cerimônia e atrações da recepção.', 'Planejar músicas e atrações', 'normal', 'couple', 20),
    ('6_months_before', 'Papelaria e Convites', 'Revisar texto, nomes e dados dos convites.', 'Preparar convites', 'high', 'couple', 10),
    ('6_months_before', 'Presentes', 'Definir lista de presentes, cotas e formas de pagamento.', 'Organizar lista de presentes', 'normal', 'couple', 20),
    ('5_months_before', 'Decoração', 'Fechar proposta de decoração da cerimônia e recepção.', 'Definir decoração', 'normal', 'couple', 10),
    ('5_months_before', 'Beleza', 'Agendar testes de cabelo, maquiagem e cuidados.', 'Agendar testes de beleza', 'normal', 'bride', 20),
    ('4_months_before', 'Documentação', 'Separar documentos necessários para casamento religioso/civil.', 'Revisar documentação', 'high', 'couple', 10),
    ('4_months_before', 'Convidados', 'Conferir contatos e preparar envio dos convites.', 'Revisar contatos dos convidados', 'normal', 'couple', 20),
    ('3_months_before', 'Papelaria e Convites', 'Enviar convites e acompanhar confirmações.', 'Enviar convites', 'high', 'couple', 10),
    ('3_months_before', 'Fornecedores', 'Revisar contratos, pagamentos e pontos pendentes.', 'Revisar contratos de fornecedores', 'normal', 'couple', 20),
    ('2_months_before', 'Convidados', 'Acompanhar RSVPs pendentes e ajustes da lista.', 'Acompanhar confirmações de presença', 'high', 'couple', 10),
    ('2_months_before', 'Recepção', 'Alinhar cardápio, ilhas, atrações e programação.', 'Alinhar detalhes da recepção', 'normal', 'couple', 20),
    ('1_month_before', 'Cerimônia', 'Confirmar roteiro, entradas, músicas e responsáveis.', 'Confirmar roteiro da cerimônia', 'high', 'couple', 10),
    ('1_month_before', 'Recepção', 'Fechar cronograma final da festa.', 'Confirmar cronograma da recepção', 'high', 'couple', 20),
    ('wedding_week', 'Beleza', 'Separar itens pessoais e confirmar horários do dia.', 'Organizar itens da semana do casamento', 'high', 'couple', 10),
    ('wedding_week', 'Fornecedores', 'Confirmar horários e contatos finais com fornecedores.', 'Confirmar fornecedores na semana', 'high', 'planner', 20),
    ('wedding_day', 'Cerimônia', 'Confirmar alianças, documentos e itens essenciais.', 'Conferir itens essenciais do dia', 'high', 'couple', 10),
    ('after_wedding', 'Financeiro', 'Conferir pagamentos finais e pendências.', 'Fechar pagamentos pendentes', 'normal', 'couple', 10),
    ('after_wedding', 'Outros', 'Enviar agradecimentos e organizar registros do casamento.', 'Organizar agradecimentos pós-casamento', 'low', 'couple', 20)
) as seed(period_key, category_name, description, title, priority, owner, display_order)
join public.wedding_checklist_categories as category
  on category.name = seed.category_name
on conflict (period_key, title) do nothing;

update public.wedding_checklist_items as item
set responsible_id = responsible.id
from public.wedding_checklist_responsibles as responsible
where item.responsible_id is null
  and responsible.name = case item.owner
    when 'bride' then 'Noiva'
    when 'groom' then 'Noivo'
    when 'planner' then 'Cerimonialista'
    when 'family' then 'Família'
    else 'Casal'
  end;

create or replace function public.admin_list_checklist_categories()
returns table (
  id uuid,
  name text,
  color text,
  icon text,
  display_order integer,
  is_active boolean,
  item_count bigint,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.' using errcode = '42501';
  end if;

  return query
  select
    category.id,
    category.name,
    category.color,
    category.icon,
    category.display_order,
    category.is_active,
    count(item.id) as item_count,
    category.created_at,
    category.updated_at
  from public.wedding_checklist_categories as category
  left join public.wedding_checklist_items as item
    on item.category_id = category.id
  group by category.id
  order by category.display_order asc, category.name asc;
end;
$$;

create or replace function public.admin_list_checklist_responsibles()
returns table (
  id uuid,
  name text,
  responsible_type text,
  display_order integer,
  is_active boolean,
  item_count bigint,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.' using errcode = '42501';
  end if;

  return query
  select
    responsible.id,
    responsible.name,
    responsible.responsible_type,
    responsible.display_order,
    responsible.is_active,
    count(item.id) as item_count,
    responsible.created_at,
    responsible.updated_at
  from public.wedding_checklist_responsibles as responsible
  left join public.wedding_checklist_items as item
    on item.responsible_id = responsible.id
  group by responsible.id
  order by responsible.display_order asc, responsible.name asc;
end;
$$;

drop function if exists public.admin_list_checklist_items();

create or replace function public.admin_list_checklist_items()
returns table (
  id uuid,
  category_id uuid,
  category_name text,
  category_color text,
  category_icon text,
  responsible_id uuid,
  responsible_name text,
  responsible_type text,
  title text,
  description text,
  period_key text,
  status text,
  priority text,
  owner text,
  due_date date,
  notes text,
  display_order integer,
  completed_at timestamp with time zone,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.' using errcode = '42501';
  end if;

  return query
  select
    item.id,
    item.category_id,
    category.name,
    category.color,
    category.icon,
    item.responsible_id,
    coalesce(responsible.name, case item.owner
      when 'bride' then 'Noiva'
      when 'groom' then 'Noivo'
      when 'planner' then 'Cerimonialista'
      when 'family' then 'Família'
      else 'Casal'
    end),
    coalesce(responsible.responsible_type, case item.owner
      when 'planner' then 'planner'
      when 'family' then 'family'
      else 'group'
    end),
    item.title,
    item.description,
    item.period_key,
    item.status,
    item.priority,
    item.owner,
    item.due_date,
    item.notes,
    item.display_order,
    item.completed_at,
    item.created_at,
    item.updated_at
  from public.wedding_checklist_items as item
  join public.wedding_checklist_categories as category
    on category.id = item.category_id
  left join public.wedding_checklist_responsibles as responsible
    on responsible.id = item.responsible_id
  order by item.period_key asc, item.display_order asc, item.title asc;
end;
$$;

create or replace function public.admin_save_checklist_category(
  target_category_id uuid,
  submitted_name text,
  submitted_color text default '#6f3fa7',
  submitted_icon text default 'check-square',
  submitted_display_order integer default 0,
  submitted_is_active boolean default true
)
returns setof public.wedding_checklist_categories
language plpgsql
security definer
set search_path = ''
as $$
declare
  saved_category public.wedding_checklist_categories%rowtype;
  safe_name text := nullif(btrim(submitted_name), '');
  safe_color text := coalesce(nullif(btrim(submitted_color), ''), '#6f3fa7');
  safe_icon text := coalesce(nullif(btrim(submitted_icon), ''), 'check-square');
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.' using errcode = '42501';
  end if;

  if safe_name is null then
    return;
  end if;

  if target_category_id is null then
    insert into public.wedding_checklist_categories
      (name, color, icon, display_order, is_active)
    values
      (left(safe_name, 120), safe_color, left(safe_icon, 60), coalesce(submitted_display_order, 0), coalesce(submitted_is_active, true))
    returning * into saved_category;
  else
    update public.wedding_checklist_categories
    set
      name = left(safe_name, 120),
      color = safe_color,
      icon = left(safe_icon, 60),
      display_order = coalesce(submitted_display_order, 0),
      is_active = coalesce(submitted_is_active, true)
    where id = target_category_id
    returning * into saved_category;
  end if;

  return next saved_category;
end;
$$;

create or replace function public.admin_save_checklist_responsible(
  target_responsible_id uuid,
  submitted_name text,
  submitted_responsible_type text default 'person',
  submitted_display_order integer default 0,
  submitted_is_active boolean default true
)
returns setof public.wedding_checklist_responsibles
language plpgsql
security definer
set search_path = ''
as $$
declare
  saved_responsible public.wedding_checklist_responsibles%rowtype;
  safe_name text := nullif(btrim(submitted_name), '');
  normalized_type text := coalesce(nullif(submitted_responsible_type, ''), 'person');
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.' using errcode = '42501';
  end if;

  if safe_name is null then
    return;
  end if;

  if normalized_type not in ('person', 'group', 'family', 'planner', 'other') then
    normalized_type := 'person';
  end if;

  if target_responsible_id is null then
    insert into public.wedding_checklist_responsibles
      (name, responsible_type, display_order, is_active)
    values
      (left(safe_name, 120), normalized_type, coalesce(submitted_display_order, 0), coalesce(submitted_is_active, true))
    returning * into saved_responsible;
  else
    update public.wedding_checklist_responsibles
    set
      name = left(safe_name, 120),
      responsible_type = normalized_type,
      display_order = coalesce(submitted_display_order, 0),
      is_active = coalesce(submitted_is_active, true)
    where id = target_responsible_id
    returning * into saved_responsible;
  end if;

  return next saved_responsible;
end;
$$;

drop function if exists public.admin_save_checklist_item(
  uuid,
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  date,
  text,
  integer
);

create or replace function public.admin_save_checklist_item(
  target_item_id uuid,
  submitted_category_id uuid,
  submitted_title text,
  submitted_description text,
  submitted_period_key text,
  submitted_status text,
  submitted_priority text,
  submitted_responsible_id uuid,
  submitted_due_date date,
  submitted_notes text,
  submitted_display_order integer
)
returns setof public.wedding_checklist_items
language plpgsql
security definer
set search_path = ''
as $$
declare
  saved_item public.wedding_checklist_items%rowtype;
  safe_title text := nullif(btrim(submitted_title), '');
  normalized_status text := coalesce(nullif(submitted_status, ''), 'pending');
  normalized_priority text := coalesce(nullif(submitted_priority, ''), 'normal');
  legacy_owner text := 'couple';
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.' using errcode = '42501';
  end if;

  if safe_title is null
    or not exists (
      select 1
      from public.wedding_checklist_categories
      where id = submitted_category_id
    )
    or not exists (
      select 1
      from public.wedding_checklist_responsibles
      where id = submitted_responsible_id
    )
  then
    return;
  end if;

  if target_item_id is null then
    insert into public.wedding_checklist_items
      (category_id, responsible_id, title, description, period_key, status, priority, owner, due_date, notes, display_order, completed_at)
    values
      (
        submitted_category_id,
        submitted_responsible_id,
        left(safe_title, 180),
        nullif(left(coalesce(submitted_description, ''), 900), ''),
        submitted_period_key,
        normalized_status,
        normalized_priority,
        legacy_owner,
        submitted_due_date,
        nullif(left(coalesce(submitted_notes, ''), 1600), ''),
        coalesce(submitted_display_order, 0),
        case when normalized_status = 'completed' then now() else null end
      )
    returning * into saved_item;
  else
    update public.wedding_checklist_items
    set
      category_id = submitted_category_id,
      responsible_id = submitted_responsible_id,
      title = left(safe_title, 180),
      description = nullif(left(coalesce(submitted_description, ''), 900), ''),
      period_key = submitted_period_key,
      status = normalized_status,
      priority = normalized_priority,
      owner = legacy_owner,
      due_date = submitted_due_date,
      notes = nullif(left(coalesce(submitted_notes, ''), 1600), ''),
      display_order = coalesce(submitted_display_order, 0),
      completed_at = case
        when normalized_status = 'completed' and completed_at is null then now()
        when normalized_status <> 'completed' then null
        else completed_at
      end
    where id = target_item_id
    returning * into saved_item;
  end if;

  return next saved_item;
end;
$$;

create or replace function public.admin_set_checklist_item_status(
  target_item_id uuid,
  submitted_status text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.' using errcode = '42501';
  end if;

  update public.wedding_checklist_items
  set
    status = submitted_status,
    completed_at = case when submitted_status = 'completed' then now() else null end
  where id = target_item_id;

  return found;
end;
$$;

create or replace function public.admin_reorder_checklist_items(
  submitted_period_key text,
  submitted_item_ids uuid[]
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.' using errcode = '42501';
  end if;

  if submitted_period_key is null then
    return false;
  end if;

  if exists (
    select 1
    from unnest(submitted_item_ids) as submitted(item_id)
    left join public.wedding_checklist_items as item
      on item.id = submitted.item_id
      and item.period_key = submitted_period_key
    where item.id is null
  ) then
    return false;
  end if;

  with ordered_items as (
    select
      submitted.item_id,
      submitted.item_order::integer * 10 as display_order
    from unnest(submitted_item_ids) with ordinality as submitted(item_id, item_order)
  )
  update public.wedding_checklist_items as item
  set display_order = ordered_items.display_order
  from ordered_items
  where item.id = ordered_items.item_id
    and item.period_key = submitted_period_key;

  return true;
end;
$$;

create or replace function public.admin_delete_checklist_category(
  target_category_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.' using errcode = '42501';
  end if;

  if exists (
    select 1
    from public.wedding_checklist_items
    where category_id = target_category_id
  ) then
    return false;
  end if;

  delete from public.wedding_checklist_categories
  where id = target_category_id;

  return found;
end;
$$;

create or replace function public.admin_delete_checklist_responsible(
  target_responsible_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.' using errcode = '42501';
  end if;

  if exists (
    select 1
    from public.wedding_checklist_items
    where responsible_id = target_responsible_id
  ) then
    return false;
  end if;

  delete from public.wedding_checklist_responsibles
  where id = target_responsible_id;

  return found;
end;
$$;

create or replace function public.admin_delete_checklist_item(
  target_item_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.' using errcode = '42501';
  end if;

  delete from public.wedding_checklist_items
  where id = target_item_id;

  return found;
end;
$$;

revoke all on function public.admin_list_checklist_categories() from public, anon;
grant execute on function public.admin_list_checklist_categories() to authenticated;

revoke all on function public.admin_list_checklist_responsibles() from public, anon;
grant execute on function public.admin_list_checklist_responsibles() to authenticated;

revoke all on function public.admin_list_checklist_items() from public, anon;
grant execute on function public.admin_list_checklist_items() to authenticated;

revoke all on function public.admin_save_checklist_category(uuid, text, text, text, integer, boolean) from public, anon;
grant execute on function public.admin_save_checklist_category(uuid, text, text, text, integer, boolean) to authenticated;

revoke all on function public.admin_save_checklist_responsible(uuid, text, text, integer, boolean) from public, anon;
grant execute on function public.admin_save_checklist_responsible(uuid, text, text, integer, boolean) to authenticated;

revoke all on function public.admin_save_checklist_item(uuid, uuid, text, text, text, text, text, uuid, date, text, integer) from public, anon;
grant execute on function public.admin_save_checklist_item(uuid, uuid, text, text, text, text, text, uuid, date, text, integer) to authenticated;

revoke all on function public.admin_set_checklist_item_status(uuid, text) from public, anon;
grant execute on function public.admin_set_checklist_item_status(uuid, text) to authenticated;

revoke all on function public.admin_reorder_checklist_items(text, uuid[]) from public, anon;
grant execute on function public.admin_reorder_checklist_items(text, uuid[]) to authenticated;

revoke all on function public.admin_delete_checklist_category(uuid) from public, anon;
grant execute on function public.admin_delete_checklist_category(uuid) to authenticated;

revoke all on function public.admin_delete_checklist_responsible(uuid) from public, anon;
grant execute on function public.admin_delete_checklist_responsible(uuid) to authenticated;

revoke all on function public.admin_delete_checklist_item(uuid) from public, anon;
grant execute on function public.admin_delete_checklist_item(uuid) to authenticated;

commit;
