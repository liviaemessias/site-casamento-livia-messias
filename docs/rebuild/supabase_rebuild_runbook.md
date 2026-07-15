# Reconstrução Completa Do Supabase

Este guia recria, em um projeto Supabase novo, a estrutura atualmente usada
pelo site: tabelas, Supabase Auth, administrador, login dos convidados, Edge
Function, permissões da `service_role`, RPCs, triggers e RLS.

O processo parte de um projeto vazio. Scripts de fases, rollback, correções
históricas e permissões transitórias foram mantidos no repositório como
histórico operacional, mas não fazem parte da instalação limpa.

## 1. Arquivos Necessários

Para uma reconstrução limpa, use poucos arquivos:

0. `docs/rebuild/README.md`
1. `docs/rebuild/supabase_rebuild_full_setup.sql`
2. `supabase/functions/claim-invite/index.ts`
3. `supabase/functions/send-notifications/index.ts`
4. `docs/rebuild/supabase_rebuild_environment_inventory.md`
5. `docs/rebuild/supabase_rebuild_verify_final.sql`

O arquivo `docs/rebuild/supabase_rebuild_full_setup.sql` é a fonte principal para um
projeto novo. Ele consolida schema, tabelas auxiliares, funções, RPCs, grants,
triggers e RLS final.

O arquivo `docs/rebuild/supabase_rebuild_01_base_schema.sql` é apenas um bloco
interno usado para compor o setup consolidado. Não use esse arquivo sozinho como
instalação completa.

## 2. O Que Não Deve Ser Executado Em Projeto Novo

Não execute em uma reconstrução limpa:

- `docs/migrations/supabase_schema_full_setup.sql`;
- scripts com `rollback` no nome;
- scripts `docs/migrations/security_phase_*`;
- scripts de migração pontual, como
  `docs/migrations/buffet_paying_age_migration.sql` e
  `docs/migrations/wedding_event_settings_migration.sql`;
- `docs/migrations/security_admin_authenticated_access.sql`;
- `docs/migrations/security_fix_guest_gift_rpcs.sql`.

Esses arquivos registram a evolução incremental do projeto. O estado atual já
está incorporado ao setup consolidado. Para entender a finalidade dos scripts
incrementais, veja `docs/migrations/README.md`.

## 3. Preparar A Máquina

Pré-requisitos:

- Node.js 20 ou superior;
- npm e npx;
- Git;
- Docker Desktop somente se o Supabase local for utilizado.

Na raiz do repositório, confira o CLI:

```powershell
npx supabase --version
```

Autentique o CLI:

```powershell
npx supabase login
```

O token pessoal do CLI, a senha do banco e qualquer chave privada não devem
ser salvos no repositório.

## 4. Backup Opcional Do Projeto Atual

Faça esta etapa somente se quiser migrar dados do projeto atual.

```powershell
New-Item -ItemType Directory -Force backups
npx supabase db dump --linked --data-only --use-copy --schema public `
  --exclude public.admin_users,public.guest_access_sessions,public.invite_login_attempts `
  --file backups/public-data.sql
```

Revise o arquivo e confirme que ele contém somente dados persistentes:

- `guests`;
- `rsvps`;
- `gifts`;
- `gift_contributions`;
- `settings`.

Não migre usuários anônimos de `auth.users`, sessões de acesso ou tentativas
de login. O usuário administrativo deve ser recriado no novo projeto.

## 5. Criar E Vincular O Projeto

1. Crie um projeto no painel do Supabase.
2. Guarde a senha do banco em um gerenciador de senhas.
3. Copie o novo Project Ref em **Project Settings -> General**.
4. Na raiz do repositório, execute:

```powershell
npx supabase link --project-ref NOVO_PROJECT_REF
```

O repositório já possui `supabase/config.toml`; não execute `supabase init`.

## 6. Executar O Setup Consolidado

Abra o **SQL Editor** do projeto novo e execute:

```text
docs/rebuild/supabase_rebuild_full_setup.sql
```

Esse script cria e protege:

- tabelas da aplicação;
- `admin_users`;
- `guest_access_sessions`;
- `invite_login_attempts`;
- funções de autorização;
- RPCs públicas e administrativas;
- validações de RSVP e presentes;
- geração segura de código de convite;
- configurações globais e metadados públicos do site;
- grants da `service_role` usados pela Edge Function;
- outbox de notificações por e-mail;
- preferências, lembretes e reenvios manuais de notificações;
- notificações automáticas do Mural de Recados;
- RLS final.

Se for restaurar dados exportados, faça isso depois do setup usando o SQL
Editor ou uma conexão administrativa. Preserve os UUIDs para manter as chaves
estrangeiras.

## 7. Configurar O Supabase Auth

No painel do Supabase:

1. habilite o provedor **Email/Password**;
2. habilite **Anonymous Sign-Ins**;
3. configure **Site URL** e **Redirect URLs**;
4. confira confirmação de e-mail, rate limits, CAPTCHA e SMTP;
5. registre os valores não secretos no inventário do ambiente.

As URLs devem incluir o endereço definitivo do site:

```text
https://liviaemessias.github.io/site-casamento-livia-messias/
```

Enquanto necessário, inclua também origens locais, como:

```text
http://127.0.0.1:5500
```

Para habilitar o CAPTCHA nos logins, siga
`docs/operations/captcha_turnstile_setup.md`.

## 8. Criar O Primeiro Administrador

Em um projeto vazio, crie primeiro um convidado administrativo inicial:

```sql
insert into public.guests (
  name,
  invite_code,
  max_guests,
  confirmed,
  invite_sent,
  active,
  invite_type
)
values (
  'Administrador',
  upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  0,
  false,
  true,
  true,
  'individual'
)
returning id, invite_code;
```

Guarde o `id` retornado.

Em **Authentication -> Users**:

1. crie o usuário administrativo com e-mail e senha forte;
2. marque o e-mail como confirmado;
3. copie o UID do novo usuário.

Depois vincule o usuário ao convidado:

```sql
insert into public.admin_users (user_id, guest_id)
values (
  '<UID DE AUTH.USERS>',
  '<ID DE PUBLIC.GUESTS>'
);
```

Não reutilize o UID do projeto anterior, pois os usuários do Auth pertencem ao
projeto em que foram criados.

## 9. Configurar Os Dados Globais

Entre no painel administrativo e abra **Editar Dados Globais**. Cadastre e
salve:

- chave PIX;
- nome do recebedor;
- cidade do recebedor;
- número de WhatsApp no formato `55 + DDD + número`;
- idade mínima pagante do buffet;
- nomes dos noivos;
- data do casamento;
- prazo do RSVP;
- dados da cerimônia;
- dados da recepção.

Os metadados públicos do site, como URL canônica, imagem social e descrição,
ficam nos defaults do frontend e no `<head>` de `index.html`. Eles não precisam
ser configurados no banco.

## 10. Configurar E Publicar A Edge Function

O `INVITE_RATE_LIMIT_PEPPER` é um segredo usado pela `claim-invite` para
proteger o endereço de rede empregado no controle de tentativas de login.

Gere um valor aleatório forte e guarde-o em um gerenciador de senhas. No
PowerShell:

```powershell
$bytes = New-Object byte[] 32
$generator = [Security.Cryptography.RandomNumberGenerator]::Create()
$generator.GetBytes($bytes)
[Convert]::ToBase64String($bytes)
$generator.Dispose()
```

Configure os secrets:

```powershell
npx supabase secrets set `
  INVITE_RATE_LIMIT_PEPPER="VALOR_ALEATORIO_LONGO" `
  ALLOWED_ORIGINS="https://liviaemessias.github.io,http://127.0.0.1:5500"
```

Publique a função:

```powershell
npx supabase functions deploy claim-invite
```

Configure também os secrets SMTP para notificações por e-mail:

```powershell
npx supabase secrets set `
  ADMIN_EMAIL="liviaemessias23@gmail.com" `
  SMTP_HOST="smtp.gmail.com" `
  SMTP_PORT="587" `
  SMTP_SECURE="false" `
  SMTP_USER="SEU_EMAIL_SMTP" `
  SMTP_PASS="SENHA_DE_APP_OU_SMTP" `
  SMTP_FROM_EMAIL="SEU_EMAIL_SMTP" `
  SMTP_FROM_NAME="Livia & Messias"
```

Para Outlook/Hotmail, use `SMTP_HOST="smtp.office365.com"` com porta `587` e
`SMTP_SECURE="false"`. Veja `docs/operations/smtp_email_notifications_setup.md`.

Publique a função de notificações:

```powershell
npx supabase functions deploy send-notifications
```

A verificação de JWT deve permanecer habilitada. Não use `--no-verify-jwt`.

Confira o deploy:

```powershell
npx supabase functions list
```

## 11. Apontar O Frontend Para O Projeto Novo

Em `js/supabase.js`, substitua:

- `SUPABASE_URL`;
- `SUPABASE_ANON_KEY`, usando a publishable key do projeto novo.

Mantenha em `js/guest-auth-config.js`:

```js
mode: "supabase"
```

A URL e a publishable key são próprias para o frontend. A chave `service_role`,
a senha do banco e o pepper são secretos.

## 12. Verificação Técnica

Execute no SQL Editor:

```text
docs/rebuild/supabase_rebuild_verify_final.sql
```

Todas as linhas devem retornar `check_passed = true`.

Também podem ser usados:

```powershell
npx supabase db lint --linked
npx supabase db push --dry-run
```

O `db push --dry-run` é útil apenas quando os SQLs forem convertidos em
migrations dentro de `supabase/migrations`.

## 13. Teste Funcional

Valide, nesta ordem:

1. login administrativo por e-mail e senha;
2. carregamento do dashboard e das tabelas administrativas;
3. criação e edição de convidados, confirmando que o código possui oito
   caracteres e foi retornado pelo Supabase;
4. filtro, coluna, checkbox e ação rápida de convite enviado/não enviado;
5. exportação de convidados e relatórios com a coluna de convite enviado;
6. geração da mensagem personalizada do convite;
7. login de convidado com código válido;
8. rejeição de código inválido;
9. RSVP individual;
10. RSVP de casal;
11. idade de criança com opções de `Menos de 1 ano` até `12 anos`;
12. carregamento da lista de presentes;
13. reserva de presente individual;
14. seleção da forma de presentear;
15. informação de pagamento;
16. reserva e pagamento de cotas;
17. liberação administrativa de presentes e cotas;
18. logout e novo login;
19. isolamento entre dois convidados diferentes;
20. bloqueio das páginas administrativas para convidados;
21. preview do link público com título, descrição e imagem.
22. e-mail de RSVP Recebido para admin e convidado.
23. e-mail de RSVP Atualizado para admin e convidado.
24. e-mails de presente reservado, pagamento informado, presente confirmado e presente liberado.
25. e-mails de cota reservada, pagamento informado, cota confirmada e cota liberada.
26. RSVP sem e-mail válido, confirmando entrega para admin e delivery `guest` como `skipped`.
27. página `admin-notifications.html`, busca, filtros, origem automática/manual, motivos de auditoria, detalhes das entregas de e-mail de RSVP, presentes, cotas, lembretes, reenvios manuais e recados.
28. página `messages.html`, envio/edição de recado por convidado logado e listagem pública apenas de recados aprovados.
29. página `admin-messages.html`, filtros, aprovação, ocultação, resposta dos noivos, remoção de resposta e exclusão de recados.
30. e-mail para admin quando um convidado envia ou edita um recado.
31. e-mail para convidado quando o recado é aprovado ou respondido, incluindo
    o caso sem e-mail válido no RSVP como entrega `skipped`.

Nos logs da `claim-invite`, confirme que não existem erros de grants, RLS ou
acesso às tabelas internas.

## 14. Backup E Manutenção

Antes de uma publicação importante:

1. exporte os dados persistentes;
2. guarde o dump fora do repositório;
3. registre as configurações do Auth no inventário;
4. confirme que o pepper está no gerenciador de senhas;
5. valide o deploy da Edge Function;
6. execute o SQL de verificação final.

Se os códigos de convite forem rotacionados, atualize `guests.invite_code` e
comunique os novos códigos por um canal privado.

## 15. Informações Que Ainda Precisam Ser Inventariadas

Para uma reprodução fiel do projeto atual, registre:

- Site URL e Redirect URLs;
- confirmação de e-mail obrigatória ou dispensada;
- rate limit de login anônimo;
- CAPTCHA/Turnstile habilitado ou não;
- SMTP customizado, se existir;
- origens definitivas aceitas pela Edge Function;
- decisão de migrar ou não os dados atuais;
- e-mail administrativo, sem registrar a senha;
- política de backup e limpeza de usuários anônimos.

Não é necessário compartilhar nem documentar em texto aberto:

- senha do administrador;
- senha do banco;
- chave `service_role`;
- Personal Access Token do Supabase CLI;
- valor do `INVITE_RATE_LIMIT_PEPPER`.

