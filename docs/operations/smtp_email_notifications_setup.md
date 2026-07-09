# Notificações Por E-mail Via SMTP

Este runbook configura as notificações transacionais da versão 3.4.

O fluxo inicial envia e-mails quando o convidado salva o RSVP público:

- admin recebe sempre;
- convidado recebe somente se o RSVP tiver e-mail válido;
- RSVP manual feito no painel administrativo não dispara e-mail automaticamente.

## Arquitetura

1. O RSVP público é salvo pela RPC `save_current_rsvp(...)`.
2. A RPC cria um evento `rsvp_saved` em `notification_events`.
3. O frontend chama a Edge Function `send-notifications` em segundo plano.
4. A função valida a sessão do convidado, processa eventos pendentes do próprio convite e envia e-mails por SMTP.
5. Cada destinatário fica registrado em `notification_deliveries` como `sent`, `failed` ou `skipped`.

O RSVP continua salvo mesmo se o envio de e-mail falhar.

## Segurança

- Nunca coloque credenciais SMTP no frontend.
- Use Supabase Secrets para `SMTP_PASS`, `SMTP_USER`, `ADMIN_EMAIL` e demais configurações.
- Mantenha `verify_jwt = true` em `supabase/config.toml`.
- A função valida o Bearer token do convidado e processa apenas notificações do `guest_id` vinculado.
- As tabelas `notification_events` e `notification_deliveries` têm RLS habilitado e não possuem acesso direto para `anon` ou `authenticated`.
- A Edge Function usa `service_role` somente para gerenciar a outbox de notificações.
- Todo conteúdo dinâmico do RSVP é escapado antes de entrar no HTML do e-mail.
- Não registre secrets, tokens ou payloads completos em logs.

## SQLs

Em um projeto existente, execute no SQL Editor:

```text
docs/migrations/email_notifications_schema.sql
docs/migrations/email_notifications_schema_verify.sql
docs/migrations/security_edge_function_service_role_grants.sql
docs/migrations/security_edge_function_service_role_grants_verify.sql
docs/migrations/security_guest_rsvp_validation.sql
docs/migrations/security_guest_rsvp_validation_verify.sql
```

A ordem importa: `email_notifications_schema.sql` deve rodar antes da versão atualizada de `security_guest_rsvp_validation.sql`.

## Secrets

Configure os secrets:

```powershell
npx supabase secrets set `
  ADMIN_EMAIL="liviaemessias23@gmail.com" `
  SMTP_HOST="smtp.gmail.com" `
  SMTP_PORT="587" `
  SMTP_SECURE="false" `
  SMTP_USER="seu-email@gmail.com" `
  SMTP_PASS="senha-de-app" `
  SMTP_FROM_EMAIL="seu-email@gmail.com" `
  SMTP_FROM_NAME="Livia & Messias" `
  ALLOWED_ORIGINS="https://liviaemessias.github.io,http://127.0.0.1:5500"
```

`ALLOWED_ORIGINS` é compartilhado com `claim-invite`. Preserve as origens já usadas no projeto.

## Gmail

Configuração comum:

```text
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu-email@gmail.com
SMTP_PASS=senha de app do Gmail
SMTP_FROM_EMAIL=seu-email@gmail.com
```

Use senha de app da conta Google. Não use a senha normal da conta.

### Criar Senha De App No Gmail

Segundo a documentação oficial da Conta do Google, senhas de app têm 16 dígitos
e só podem ser criadas em contas com verificação em duas etapas ativada:
https://support.google.com/accounts/answer/185833?hl=pt-BR

1. Acesse a Conta do Google que será usada como remetente.
2. Entre em `Segurança`.
3. Ative a `Verificação em duas etapas`, se ainda não estiver ativa.
4. Acesse `Senhas de app` ou abra diretamente:
   https://myaccount.google.com/apppasswords
5. Faça login novamente, se o Google solicitar.
6. Crie uma senha para o app de e-mail/SMTP.
7. Copie a senha gerada de 16 dígitos e use esse valor em `SMTP_PASS`.
8. Guarde a senha em um gerenciador seguro ou configure imediatamente no
   Supabase Secrets, porque ela normalmente só é exibida uma vez.

Se a opção `Senhas de app` não aparecer, verifique estes pontos:

- a verificação em duas etapas precisa estar ativa;
- contas de trabalho, escola ou organização podem bloquear esse recurso;
- contas com Proteção Avançada podem não permitir senha de app;
- contas configuradas apenas com chaves de segurança podem não exibir a opção.

Ao trocar a senha principal da Conta do Google, as senhas de app podem ser
revogadas. Nesse caso, gere uma nova senha e atualize `SMTP_PASS` nos secrets do
Supabase.

## Outlook/Hotmail

Configuração comum:

```text
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu-email@outlook.com
SMTP_PASS=senha ou senha de app, conforme a segurança da conta
SMTP_FROM_EMAIL=seu-email@outlook.com
```

Algumas contas Microsoft podem exigir autenticação SMTP habilitada, senha de app ou ajustes de segurança da conta.

## Deploy Da Edge Function

Publique:

```powershell
npx supabase functions deploy send-notifications
```

Confira que a função permanece com JWT habilitado:

```toml
[functions.send-notifications]
verify_jwt = true
```

## Teste Funcional

1. Entre como convidado por código.
2. Responda o RSVP público com e-mail válido.
3. Confirme que o RSVP salva e a tela mostra sucesso.
4. Verifique se o admin recebeu `[Casamento] RSVP Recebido 💜`.
5. Verifique se o convidado recebeu `RSVP Recebido 💜`.
6. Em convite de casal, verifique se o e-mail do casal mostra a seção `Respostas do convite`.
7. Atualize o RSVP.
8. Verifique os assuntos `RSVP Atualizado 💜`.
9. Teste um RSVP sem e-mail e confirme que o admin recebe, enquanto o delivery do convidado fica `skipped`.

## Consultas Úteis

Eventos recentes:

```sql
select *
from public.notification_events
order by created_at desc
limit 20;
```

Entregas recentes:

```sql
select *
from public.notification_deliveries
order by created_at desc
limit 20;
```
