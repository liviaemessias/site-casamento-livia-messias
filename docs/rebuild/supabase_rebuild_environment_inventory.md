# Inventário Do Ambiente Supabase

Este arquivo contém somente valores não secretos ou nomes de configurações.
Senhas, tokens, chaves privadas e o valor do pepper devem ficar em um
gerenciador de senhas.

Snapshot documental criado em 18 de junho de 2026.

## Projeto Atual

- Project ref: `pzgrshdabbvlhdzxtteq`
- Edge Functions: `claim-invite`, `send-notifications`
- Verify JWT: habilitado
- Frontend de convidados: `mode: "supabase"`
- Fonte da Edge Function conferida com o arquivo exportado do projeto atual

## Authentication

- Email/Password: habilitado para o administrador
- Anonymous Sign-Ins: habilitado para convidados
- Usuário administrador: recriar manualmente em `Authentication → Users`
- Vínculo administrativo: inserir em `public.admin_users`

Valores que devem ser conferidos e anotados antes de uma reconstrução:

- Site URL: `https://liviaemessias.github.io/site-casamento-livia-messias/`
- Redirect URLs:
  - `https://liviaemessias.github.io/site-casamento-livia-messias/`
  - `http://127.0.0.1:5500`
- Confirmação de e-mail obrigatória:
- Anonymous Sign-In rate limit:
- CAPTCHA/Turnstile: habilitado com Cloudflare Turnstile; a Secret Key fica no Supabase e a Site Key pública em `js/captcha-config.js`.
- SMTP customizado:

## Edge Function Secrets

Secrets obrigatórios:

- `INVITE_RATE_LIMIT_PEPPER`
- `ALLOWED_ORIGINS`
- `ADMIN_EMAIL`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM_EMAIL`
- `SMTP_FROM_NAME`

Valores que devem ficar no gerenciador de senhas:

- pepper atual;
- lista de origens de produção;
- origens locais necessárias.
- credenciais SMTP;
- e-mail remetente;
- e-mail administrativo de destino.

Valor administrativo padrão planejado:

```text
liviaemessias23@gmail.com
```

Origem local usada durante o desenvolvimento:

```text
http://127.0.0.1:5500
```

Origem pública esperada:

```text
https://liviaemessias.github.io
```

## Frontend

Ao criar outro projeto Supabase, atualizar em `js/supabase.js`:

- `SUPABASE_URL`;
- `SUPABASE_ANON_KEY` ou publishable key.

A `service_role` nunca deve ser colocada no frontend.

Páginas administrativas esperadas:

- `admin-dashboard.html`;
- `admin-guests.html`;
- `admin-rsvps.html`;
- `admin-gifts.html`;
- `admin-notifications.html`;
- `admin-indicators.html`;
- `admin-reports.html`;
- `admin-messages.html`;
- `admin-checklist.html`;
- `admin-schedule.html`;
- `admin-vendors.html`;
- `admin-settings.html`.

Metadados públicos padrão do site, mantidos no frontend e no `<head>` de
`index.html`:

- URL canônica: `https://liviaemessias.github.io/site-casamento-livia-messias/`
- Imagem social: `https://liviaemessias.github.io/site-casamento-livia-messias/assets/images/home/cover-main-page.jpg`
- Descrição: `Celebre conosco o nosso casamento — 23 de abril de 2027. Confira os detalhes do grande dia!`

## Dados Persistentes

Dados que podem ser exportados e restaurados:

- `guests`;
- `rsvps`;
- `gifts`;
- `gift_contributions`;
- `settings`;
- `notification_events`;
- `notification_deliveries`;
- `notification_preferences`;
- `wall_messages`;
- `wedding_checklist_categories`;
- `wedding_checklist_responsibles`;
- `wedding_checklist_items`;
- `wedding_schedule_sections`;
- `wedding_schedule_activities`;
- `wedding_vendors`.

Dados que normalmente não devem ser migrados:

- usuários anônimos de `auth.users`;
- `guest_access_sessions`;
- `invite_login_attempts`.

As tabelas de notificação podem ser migradas se você quiser preservar histórico
de entregas; para uma reconstrução limpa, normalmente podem começar vazias.

O usuário administrativo deve ser recriado no Auth e ligado novamente ao
registro correto de `guests`.
