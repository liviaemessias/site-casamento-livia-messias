# Modelagem Do Banco De Dados

O projeto utiliza PostgreSQL no Supabase.

## Relacionamentos

```text
guests 1:N rsvps
guests 1:N gifts
gifts 1:N gift_contributions
settings 1:1 configuração global usada pelo frontend
auth.users 1:0..1 admin_users
guests 1:0..1 admin_users
auth.users 1:0..1 guest_access_sessions
guests 1:N guest_access_sessions
guests 1:0..1 guest_wall_messages
guests 1:N notification_events
notification_events 1:N notification_deliveries
notification_preferences 1:N notification_events por event_type
settings 1:N wedding_vendors (conteúdo público gerenciado pelo admin)
```

## Tabela `guests`

Responsável por convidados, códigos de acesso e permissões administrativas.

```sql
create table public.guests (
  id uuid not null default gen_random_uuid(),
  created_at timestamp with time zone null default timezone('utc', now()),
  name text not null,
  invite_code text not null,
  max_guests integer null default 0,
  confirmed boolean null default false,
  invite_sent boolean not null default false,
  active boolean null default true,
  access_count integer null default 0,
  last_access timestamp with time zone null,
  invite_type text null default 'individual',
  couple_members jsonb null,

  constraint guests_pkey primary key (id),
  constraint guests_invite_code_key unique (invite_code)
);
```

Campos principais:

- `name`: nome principal do convite.
- `invite_code`: código único usado no login, gerado no Supabase pela RPC
  administrativa `create_guest_with_invite_code()`.
- `max_guests`: limite de acompanhantes.
- `confirmed`: indica se já existe RSVP confirmado/registrado.
- `invite_sent`: indica se o convite já foi enviado ao convidado.
- `active`: convidados inativos não acessam e não entram nas métricas.
- `access_count`: quantidade de acessos.
- `last_access`: último acesso.
- `invite_type`: `individual` ou `couple`.
- `couple_members`: membros do casal em JSON.

## Tabela `rsvps`

Armazena confirmações de presença.

```sql
create table public.rsvps (
  id uuid not null default gen_random_uuid(),
  created_at timestamp with time zone null default timezone('utc', now()),
  guest_id uuid null,
  presence text null,
  food text null,
  food_restriction boolean not null default false,
  message text null,
  guest_data jsonb null,
  email text null,
  phone text null,
  updated_at timestamp with time zone null default timezone('utc', now()),

  constraint rsvps_pkey primary key (id),

  constraint rsvps_guest_id_fkey
    foreign key (guest_id)
    references guests (id)
    on delete cascade
);
```

Campos principais:

- `guest_id`: referência `guests.id`.
- `presence`: `Sim` ou `Não`.
- `food_restriction`: indica se o convidado declarou restrição alimentar.
- `food`: detalhe da restrição alimentar quando `food_restriction = true`.
- `message`: mensagem aos noivos.
- `email`: e-mail informado.
- `phone`: telefone informado.
- `guest_data`: snapshot JSON completo do RSVP.
- `updated_at`: última alteração.

## Tabela `gifts`

Responsável pela lista de presentes, reservas e forma escolhida para presentear.

```sql
create table public.gifts (
  id uuid not null default gen_random_uuid(),
  created_at timestamp with time zone null default timezone('utc', now()),
  category text not null,
  name text not null,
  description text null,
  price numeric null,
  image_url text null,
  status text null default 'Disponível',
  reserved_at timestamp with time zone null,
  reserved_name text null,
  reservation_message text null,
  reserved_guest_id uuid null,
  payment_status text null default 'Pendente',
  payment_reported_at timestamp with time zone null,
  card_payment_url text null,
  card_payment_provider text null,
  card_payment_reference text null,
  purchase_mode text null default 'money',
  external_purchase_options jsonb null default '[]',
  selected_purchase_method text null,
  selected_purchase_details jsonb null,
  gift_type text null default 'single',
  quota_count integer null,
  quota_value numeric null,

  constraint gifts_pkey primary key (id),

  constraint gifts_reserved_guest_id_fkey
    foreign key (reserved_guest_id)
    references guests(id)
    on delete set null
);
```

Campos principais:

- `category`: categoria do presente.
- `name`: nome do presente.
- `description`: descrição.
- `price`: valor de referência. É obrigatório para presentes financeiros (`money`), híbridos (`hybrid`) e por cotas (`quota`). Pode ser `null` em presentes exclusivamente externos (`external`).
- `image_url`: imagem.
- `status`: `Disponível`, `Parcial`, `Reservado` ou `Comprado`.
- `reserved_guest_id`: convidado que reservou.
- `reserved_name`: nome exibido da reserva.
- `reservation_message`: mensagem do convidado.
- `payment_status`: `Pendente`, `Informado`, `Confirmado`, `Parcialmente informado` ou `Parcialmente confirmado`.
- `payment_reported_at`: quando o convidado informou pagamento/compra.
- `card_payment_url`: URL externa para checkout de pagamento por cartão.
- `card_payment_provider`: provedor do link de cartão, quando aplicável.
- `card_payment_reference`: referência externa do pagamento, quando aplicável.
- `purchase_mode`: `money`, `external` ou `hybrid`.
- `external_purchase_options`: sugestões opcionais de compra online/loja física. Pode permanecer como `[]`, pois o convidado pode comprar em outro local.
- `selected_purchase_method`: `pix`, `card`, `online` ou `physical`.
- `selected_purchase_details`: detalhes da opção escolhida.
- `gift_type`: `single` para presente individual ou `quota` para presente por cotas.
- `quota_count`: quantidade total de cotas do presente.
- `quota_value`: valor unitário calculado para cada cota.

## Tabela `gift_contributions`

Registra contribuições feitas por convidados em presentes por cotas.

```sql
create table public.gift_contributions (
  id uuid not null default gen_random_uuid(),
  created_at timestamp with time zone null default timezone('utc', now()),
  gift_id uuid not null,
  guest_id uuid null,
  contributor_name text null,
  message text null,
  quota_quantity integer not null default 1,
  quota_value numeric not null,
  total_value numeric not null,
  payment_status text null default 'Pendente',
  payment_method text null default 'pix',
  payment_reported_at timestamp with time zone null,
  pix_code text null,
  pix_qr_code_url text null,

  constraint gift_contributions_pkey primary key (id),

  constraint gift_contributions_gift_id_fkey
    foreign key (gift_id)
    references gifts(id)
    on delete cascade,

  constraint gift_contributions_guest_id_fkey
    foreign key (guest_id)
    references guests(id)
    on delete set null
);
```

Campos principais:

- `gift_id`: presente por cotas relacionado.
- `guest_id`: convidado que fez a contribuição.
- `contributor_name`: nome exibido da contribuição.
- `message`: mensagem opcional para os noivos.
- `quota_quantity`: quantidade de cotas reservadas.
- `quota_value`: valor de cada cota no momento da contribuição.
- `total_value`: valor total do PIX.
- `payment_status`: `Pendente`, `Informado` ou `Confirmado`.
- `payment_method`: nesta fase, `pix`.
- `payment_reported_at`: quando o convidado informou o pagamento.
- `pix_code` e `pix_qr_code_url`: campos disponíveis no schema, mas atualmente o frontend gera PIX e QR-Code em tempo de exibição.

## Tabela `settings`

Configurações globais usadas pelo site.

```sql
create table public.settings (
  id uuid not null default gen_random_uuid(),
  pix_key text null,
  whatsapp_number text null,
  merchant_name text null,
  merchant_city text null,
  buffet_paying_age integer not null default 7,
  bride_name text not null default 'Livia',
  groom_name text not null default 'Messias',
  wedding_date timestamptz not null default '2027-04-23 18:30:00-03',
  rsvp_deadline date not null default '2027-03-01',
  ceremony_name text not null default 'Santuário de Nossa Senhora de Fátima',
  ceremony_address text not null default 'Av. Treze de Maio, 200 - Fátima, Fortaleza - CE, 60040-530',
  ceremony_time time not null default '18:30',
  reception_name text not null default 'Martha''s Buffet Conceito',
  reception_address text not null default 'Av. Bezerra de Menezes, 531 - Parquelândia, Fortaleza - CE, 60325-004',
  reception_time time not null default '21:00',

  constraint settings_pkey primary key (id),
  constraint settings_buffet_paying_age_check
    check (buffet_paying_age between 1 and 18)
);
```

Campos principais:

- `pix_key`: chave PIX.
- `whatsapp_number`: número de contato exibido/usado nas configurações do site.
- `merchant_name`: nome usado no payload PIX.
- `merchant_city`: cidade usada no payload PIX.
- `buffet_paying_age`: idade mínima em que uma criança entra na contagem de pagantes. O padrão `7` significa que crianças de até 6 anos não pagam.
- `bride_name` e `groom_name`: nomes exibidos no site e no painel.
- `wedding_date` e `rsvp_deadline`: data do casamento e prazo de confirmação.
- `ceremony_*` e `reception_*`: dados de local e horário exibidos nas páginas públicas e na mensagem de convite.

Metadados públicos como URL canônica, imagem social e descrição ficam nos
defaults do frontend, em `js/event-config.js` e no `<head>` de `index.html`.
Eles não fazem parte da tabela `settings`.

As métricas do buffet interpretam a idade armazenada em
`rsvps.guest_data.companions[].age`. Crianças sem idade reconhecível ficam em
uma categoria separada e não entram automaticamente como pagantes ou não
pagantes.

## Tabela `admin_users`

Relaciona uma conta do Supabase Auth a um convidado administrador.

```sql
create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  guest_id uuid not null unique references public.guests(id) on delete restrict,
  active boolean not null default true,
  created_at timestamp with time zone not null default timezone('utc', now())
);
```

O login administrativo usa e-mail e senha pelo Supabase Auth. O código de
convite do mesmo usuário continua concedendo somente acesso de convidado.

## Tabela `guest_access_sessions`

Relaciona uma sessão autenticada anônima ao convite validado pela futura Edge
Function.

```sql
create table public.guest_access_sessions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  guest_id uuid not null references public.guests(id) on delete cascade,
  created_at timestamp with time zone not null default timezone('utc', now()),
  last_access timestamp with time zone not null default timezone('utc', now()),
  revoked_at timestamp with time zone null
);
```

Cada sessão pertence a um único convite. Um convite pode possuir sessões em
mais de um dispositivo, e cada uma pode ser revogada individualmente.

## Tabela `guest_wall_messages`

Armazena os recados enviados pelos convidados para o Mural de Recados.

```sql
create table public.guest_wall_messages (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid not null unique references public.guests(id) on delete cascade,
  message text not null,
  status text not null default 'pending',
  couple_reply text null,
  created_at timestamp with time zone not null default timezone('utc', now()),
  updated_at timestamp with time zone not null default timezone('utc', now()),
  submitted_at timestamp with time zone not null default timezone('utc', now()),
  approved_at timestamp with time zone null,
  hidden_at timestamp with time zone null,
  couple_replied_at timestamp with time zone null
);
```

Campos principais:

- `guest_id`: convite dono do recado. Nesta fase, cada convite mantém um único
  recado ativo/editável.
- `message`: texto enviado pelo convidado, limitado no banco e no frontend.
- `status`: `pending`, `approved` ou `hidden`.
- `couple_reply`: resposta dos noivos, exibida junto do recado aprovado.
- `submitted_at`, `approved_at`, `hidden_at` e `couple_replied_at`: marcos de
  auditoria do fluxo.

Recados novos ou editados voltam para `pending`. A página pública lista somente
recados aprovados por meio de `list_approved_wall_messages(...)`, sem expor
`guest_id` ou acesso direto à tabela. O convidado usa
`get_current_guest_wall_message()` e `save_current_guest_wall_message(...)`
para ler e editar somente o próprio recado. A administração usa RPCs protegidas
por `is_admin()` para listar, aprovar, ocultar e responder.

## Tabela `wedding_vendors`

Armazena os fornecedores do casamento exibidos aos convidados.

Campos principais:

- `name`: nome da marca, empresa ou fornecedor.
- `category`: categoria exibida no site, como Fotografia e Filmagem,
  Cerimonial ou Ilha de Açaí e Gelatos.
- `responsible_names`: responsáveis pela empresa ou serviço, quando essa
  informação estiver disponível.
- `description`: texto curto exibido no card público.
- `image_url`, `instagram_url`, `website_url` e `whatsapp_number`: canais
  opcionais exibidos somente quando preenchidos.
- `display_order`: ordenação manual no site e no painel.
- `is_visible`: controla se o fornecedor aparece na página pública.
- `is_featured`: marca fornecedores de destaque.

A tabela tem RLS habilitado e não é acessada diretamente por `anon` ou
`authenticated`. A página pública consulta apenas fornecedores visíveis por
`list_public_vendors()`. O painel administrativo usa `admin_list_vendors()`,
`admin_save_vendor(...)`, `admin_set_vendor_visible(...)` e
`admin_reorder_vendors(...)` e `admin_delete_vendor(...)`, todos protegidos por
`is_admin()`. A reordenação recebe a lista de IDs na ordem final e atualiza
`display_order` em lote.

## Tabelas `wedding_schedule_sections` E `wedding_schedule_activities`

Armazenam a programação do casamento exibida aos convidados logados.

`wedding_schedule_sections` representa as etapas da programação, como
Cerimônia ou Recepção.

Campos principais:

- `title`: nome da etapa.
- `location_name`: local principal, como Igreja ou Buffet.
- `address`: endereço opcional.
- `description`: texto curto de contexto.
- `display_order`: ordenação manual da etapa no site e no painel.
- `is_visible`: controla se a etapa aparece para os convidados.

`wedding_schedule_activities` representa os itens dentro de cada etapa.

Campos principais:

- `section_id`: etapa à qual a atividade pertence.
- `title`: nome da atividade.
- `activity_type`: `moment`, `attraction`, `island`, `service` ou `other`.
- `time_mode`: `scheduled`, `period`, `available` ou `tbd`.
- `start_time` e `end_time`: horários usados conforme o tipo de horário.
- `description`: detalhes opcionais da atividade.
- `display_order`: ordenação manual dentro da etapa.
- `is_visible`: controla se a atividade aparece para os convidados.

A tabela de atividades valida que horário específico exige `start_time`,
período exige `start_time` e `end_time`, e itens disponíveis durante a etapa ou
com horário a definir não gravam horários. As tabelas têm RLS habilitado e não
são acessadas diretamente por `anon` ou `authenticated`.

A página pública usa `list_public_schedule()`, que exige sessão autenticada com
perfil de convidado válido e retorna somente etapas e atividades visíveis. O
painel administrativo usa RPCs protegidas por `is_admin()` para listar, salvar,
alterar visibilidade, reordenar e excluir etapas e atividades.

## Tabelas De Notificação

As notificações transacionais usam uma outbox genérica.

### `notification_events`

Registra o evento que aconteceu no sistema.

Campos principais:

- `event_type`: tipo do evento, como `rsvp_saved`, `gift_reserved`,
  `gift_payment_reported`, `gift_purchase_confirmed`,
  `gift_reservation_released`, `gift_contribution_reserved`,
  `gift_contribution_payment_reported`, `gift_contribution_confirmed` ou
  `gift_contribution_released`. Lembretes manuais usam
  `gift_reservation_reminder` e `gift_contribution_reminder`. Recados usam
  `wall_message_submitted`, `wall_message_approved` e
  `wall_message_replied`.
- `aggregate_type`: entidade de origem, como `rsvp`, `gift`,
  `gift_contribution` ou `wall_message`.
- `aggregate_id`: identificador da entidade de origem.
- `aggregate_version`: versão temporal usada para idempotência.
- `guest_id`: convidado relacionado, quando houver.
- `dedupe_key`: chave única que evita duplicar o mesmo evento.
- `payload`: dados sanitizados e necessários para montar os e-mails.
- `origin`: `automatic` para eventos gerados pelo fluxo normal do site ou
  `manual` para ações disparadas pelo administrador.
- `status`: `pending`, `processing`, `processed` ou `failed`.

### `notification_deliveries`

Registra uma tentativa por destinatário.

Campos principais:

- `event_id`: evento de origem.
- `recipient_type`: `admin` ou `guest`.
- `recipient_email`: e-mail de destino, quando disponível.
- `channel`: atualmente `email`.
- `dedupe_key`: chave única por evento e destinatário.
- `status`: `pending`, `processing`, `sent`, `failed` ou `skipped`.
- `last_error`: erro resumido e sem secrets.

### `notification_preferences`

Controla quais tipos de notificação podem gerar entregas automáticas ou
manuais.

Campos principais:

- `event_type`: tipo do evento controlado, como `rsvp_saved` ou
  `gift_contribution_released`.
- `event_group`: agrupamento operacional, como `rsvp`, `gift` ou
  `gift_contribution`; eventos do mural usam `wall_message`.
- `label`: nome amigável para exibição futura no painel administrativo.
- `automatic_enabled`: indica se eventos automáticos desse tipo geram entregas.
- `manual_enabled`: indica se ações manuais desse tipo geram entregas.
- `admin_enabled`: indica se o admin deve receber entregas desse evento.
- `guest_enabled`: indica se o convidado deve receber entregas desse evento.

As tabelas têm RLS habilitado e não são acessadas diretamente pelo frontend.
Somente a Edge Function `send-notifications` gerencia eventos, entregas e lê as
preferências com `service_role`. O painel administrativo consulta o histórico pela RPC
`admin_list_notification_deliveries(...)`, que valida `is_admin()` antes de
retornar dados de auditoria. Essa RPC usa paginação server-side com `p_limit`
e `p_offset`, filtros `p_origin` e `p_search` e ordenação por `p_sort_key` e
`p_sort_direction`, para evitar carregar históricos grandes no frontend. Os
cards de métricas usam `admin_get_notification_delivery_summary(...)`, com os
mesmos filtros, para contabilizar o conjunto completo filtrado em vez de apenas
a página atual. A busca cobre convidado, e-mail, tipo de evento, status,
identificadores, dados do payload e erro/motivo resumido.
Alertas compactos do menu administrativo usam `admin_get_nav_alerts()`, que
retorna apenas indicadores booleanos para recados pendentes e presentes/cotas
com pagamento informado.
Preferências são lidas e atualizadas pelo painel por
`admin_list_notification_preferences()` e
`admin_update_notification_preference(...)`. Lembretes manuais de presentes e
cotas são criados por `admin_send_gift_reservation_reminder(...)` e
`admin_send_gift_contribution_reminder(...)`. Eventos do Mural de Recados são
criados pelo helper interno `enqueue_wall_message_notification_event(...)`.

## Funções De Autorização

- `current_guest_id()`: retorna o convidado ativo relacionado à sessão atual.
- `is_admin()`: informa se a conta autenticada é um administrador ativo.
- `create_guest_with_invite_code()`: valida a conta administrativa, gera um
  código criptograficamente aleatório de oito caracteres e cria o convidado
  em uma única transação.
- `admin_confirm_gift_purchase()` e `admin_release_gift_reservation()`:
  controlam o estado administrativo de presentes individuais.
- `admin_confirm_gift_contribution()` e
  `admin_release_gift_contribution()`: confirmam ou removem cotas e acionam o
  recálculo do presente na mesma transação.
- `admin_save_guest_rsvp()` e `admin_delete_guest_rsvp()`: validam e alteram
  o RSVP selecionado pelo administrador, mantendo `guests.confirmed`
  sincronizado pelo trigger na mesma transação.
- `admin_update_guest()` e `admin_set_guest_active()`: validam alterações do
  convite e sincronizam a ativação com `guest_access_sessions`.
- `admin_save_gift()` e `admin_delete_gift()`: validam e alteram o catálogo,
  calculam o valor das cotas e preservam a estrutura de presentes com
  reservas ou contribuições.
- `admin_save_settings()`: valida PIX, WhatsApp, idade pagante e dados do
  casamento, mantendo um único registro em `settings`.
- `save_current_rsvp()`: usa o convite da sessão como fonte oficial, valida
  membros, acompanhantes e idades e descarta campos adicionais enviados pelo
  cliente. Também cria um evento `rsvp_saved` para notificação por e-mail no
  RSVP público.
- `reserve_gift()`, `reserve_gift_quotas()`, `report_gift_payment()` e
  `report_gift_contribution_payment()`: validam ações públicas de presentes e
  cotas e criam eventos de e-mail quando reserva ou pagamento são registrados.
- `set_gift_purchase_method()`: cruza a forma escolhida com `purchase_mode` e
  valida a escolha sem disparar e-mail isoladamente.
- `list_approved_wall_messages()`: retorna somente recados aprovados e campos
  públicos do Mural de Recados.
- `get_current_guest_wall_message()` e `save_current_guest_wall_message()`:
  leem e salvam o recado do convite da sessão atual. Ao salvar, criam evento de
  e-mail para avisar o admin.
- `admin_list_wall_messages()`, `admin_approve_wall_message()`,
  `admin_hide_wall_message()`, `admin_reply_wall_message()`,
  `admin_clear_wall_message_reply()` e `admin_delete_wall_message()`: moderam
  o Mural de Recados no painel administrativo. Aprovação e resposta criam
  eventos de e-mail para o convidado quando houver e-mail válido no RSVP.
- `list_public_schedule()`: retorna a programação visível somente para sessões
  com convidado válido.
- `admin_list_schedule_sections()`, `admin_save_schedule_section(...)`,
  `admin_set_schedule_section_visible(...)`,
  `admin_reorder_schedule_sections(...)` e
  `admin_delete_schedule_section(...)`: gerenciam as etapas da programação.
- `admin_list_schedule_activities()`, `admin_save_schedule_activity(...)`,
  `admin_set_schedule_activity_visible(...)`,
  `admin_reorder_schedule_activities(...)` e
  `admin_delete_schedule_activity(...)`: gerenciam as atividades da programação.

As funções serão usadas pelas políticas RLS. As tabelas de vínculo não possuem
acesso direto para `anon` ou `authenticated`.

`current_guest_id()` também reconhece o `guest_id` de `admin_users`. Assim, o
login administrativo concede as permissões de administrador e preserva o
acesso do próprio convidado.

## Regras De Banco

### Exclusão De Convidado Com RSVP

RSVPs são removidos automaticamente:

```sql
on delete cascade
```

### Exclusão De Convidado Com Reserva

Reservas permanecem, mas o convidado é desvinculado:

```sql
on delete set null
```

## Status Usados

RSVP:

```text
Sim
Não
```

Presentes:

```text
Disponível
Parcial
Reservado
Comprado
```

Pagamento:

```text
Pendente
Informado
Confirmado
Parcialmente informado
Parcialmente confirmado
```

Modo de compra:

```text
money
external
hybrid
```

Forma escolhida:

```text
pix
card
online
physical
```

Mural de Recados:

```text
pending
approved
hidden
```

Checklist:

```text
pending
in_progress
completed
```

## Checklist Do Casamento

O checklist administrativo usa três tabelas:

- `wedding_checklist_categories`: categorias editáveis, como Cerimônia,
  Recepção, Pré-Wedding, Save the Date, Caixinha dos Padrinhos e Financeiro.
- `wedding_checklist_responsibles`: responsáveis editáveis, como Casal,
  Noiva, Noivo, Cerimonialista, Família, mães, pais, padrinhos, madrinhas e
  amigos.
- `wedding_checklist_items`: tarefas agrupadas por período, de `12 meses
  antes` até `Depois do casamento`, com status, prioridade, responsável
  vinculado, prazo, ordem, descrição e observações.

O setup inicial popula categorias, responsáveis e tarefas padrão pelo SQL de
construção ou pela migration incremental `wedding_checklist.sql`.

## Observações

- O frontend ainda acessa diretamente o Supabase.
- O acesso administrativo depende exclusivamente do vínculo ativo em
  `admin_users`, validado pela função `is_admin()`.
- RLS deve ser configurada antes de um ambiente público definitivo.
- Enquanto o projeto usa acesso direto pelo frontend, `gift_contributions` precisa estar com RLS desativada ou com políticas equivalentes às demais tabelas públicas do projeto.
- O status `Parcial` é usado em presentes por cotas quando há cotas reservadas, mas o presente ainda não foi totalmente reservado.
- Os status `Parcialmente informado` e `Parcialmente confirmado` são derivados das contribuições por cota e sincronizados em `gifts.payment_status`.
