# Notificações Por E-mail Via SMTP

Este runbook configura as notificações transacionais iniciadas na v3.4 e expandidas nas versões seguintes.

O fluxo envia e-mails quando o convidado salva o RSVP público e quando há
eventos relevantes de presentes/cotas e do Mural de Recados:

- admin recebe sempre;
- convidado recebe somente se o RSVP tiver e-mail válido;
- RSVP manual feito no painel administrativo não dispara e-mail automaticamente.
- seleção de forma de pagamento, loja ou método de compra não dispara e-mail
  por si só.
- recado enviado/editado avisa o admin; recado aprovado ou respondido avisa o
  convidado quando houver e-mail válido no RSVP.

## Arquitetura

1. O RSVP público é salvo pela RPC `save_current_rsvp(...)`, uma ação de
   presente/cota é concluída por RPC pública/administrativa, ou um recado é
   enviado, aprovado ou respondido no Mural de Recados.
2. A RPC cria um evento em `notification_events`.
3. O frontend chama a Edge Function `send-notifications` em segundo plano.
4. A função valida a sessão do convidado ou do admin, processa eventos
   pendentes permitidos para aquele ator e envia e-mails por SMTP.
5. Cada destinatário fica registrado em `notification_deliveries` como `sent`, `failed` ou `skipped`.

A ação principal continua salva mesmo se o envio de e-mail falhar.

## Segurança

- Nunca coloque credenciais SMTP no frontend.
- Use Supabase Secrets para `SMTP_PASS`, `SMTP_USER`, `ADMIN_EMAIL` e demais configurações.
- Mantenha `verify_jwt = true` em `supabase/config.toml`.
- A função valida o Bearer token do convidado e processa apenas notificações do `guest_id` vinculado.
- Quando chamada por admin autenticado, a função confirma vínculo ativo em
  `admin_users` antes de processar eventos administrativos pendentes. Essa
  validação de admin tem prioridade sobre eventual sessão pública de convidado
  existente no mesmo navegador.
- As tabelas `notification_events` e `notification_deliveries` têm RLS habilitado e não possuem acesso direto para `anon` ou `authenticated`.
- A Edge Function usa `service_role` somente para gerenciar a outbox de notificações.
- Todo conteúdo dinâmico do RSVP e de presentes/cotas é escapado antes de
  entrar no HTML do e-mail.
- Não registre secrets, tokens ou payloads completos em logs.

## SQLs

Em um projeto existente, execute no SQL Editor:

```text
docs/migrations/email_notifications_schema.sql
docs/migrations/email_notifications_schema_verify.sql
docs/migrations/notification_preferences.sql
docs/migrations/notification_preferences_verify.sql
docs/migrations/security_admin_notification_operations.sql
docs/migrations/security_admin_notification_operations_verify.sql
docs/migrations/security_admin_notification_preferences.sql
docs/migrations/security_admin_notification_preferences_verify.sql
docs/migrations/security_edge_function_service_role_grants.sql
docs/migrations/security_edge_function_service_role_grants_verify.sql
docs/migrations/security_guest_rsvp_validation.sql
docs/migrations/security_guest_rsvp_validation_verify.sql
docs/migrations/gift_email_notifications.sql
docs/migrations/gift_email_notifications_verify.sql
docs/migrations/manual_notification_reminders.sql
docs/migrations/manual_notification_reminders_verify.sql
docs/migrations/manual_notification_resends.sql
docs/migrations/manual_notification_resends_verify.sql
docs/migrations/wall_message_email_notifications.sql
docs/migrations/wall_message_email_notifications_verify.sql
```

A ordem importa: `email_notifications_schema.sql` deve rodar antes da versão atualizada de `security_guest_rsvp_validation.sql`.
Execute `gift_email_notifications.sql` depois das RPCs de presentes/cotas já
existirem no projeto. Execute `manual_notification_reminders.sql` depois de
`notification_preferences.sql`, de `security_admin_notification_operations.sql`
e de `gift_email_notifications.sql`. Execute `manual_notification_resends.sql`
depois de `manual_notification_reminders.sql`. Execute
`wall_message_email_notifications.sql` depois de `wall_messages.sql` e de
`notification_preferences.sql`.

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
9. Teste RSVP individual e de casal com presença `Sim` e `Não`, confirmando
   que a mensagem do convidado muda conforme presença confirmada ou ausência.
10. Teste restrição alimentar por pessoa em convite individual, casal e
    acompanhante. Confirme que o e-mail/notificação apresenta o nome apenas no
    resumo exibido, e que o texto persistido em `guest_data.food` não contém o
    prefixo do nome.
11. Teste um RSVP sem e-mail e confirme que o admin recebe, enquanto o delivery do convidado fica `skipped`.
12. Reserve um presente individual e confirme os e-mails de `Presente Reservado`.
13. Informe o pagamento/compra do presente e confirme `Pagamento Informado`.
14. Confirme o presente no admin e confira `Presente Confirmado`.
15. Libere uma reserva pelo admin e confira `Presente Liberado`.
16. Repita o fluxo com cotas: `Cota Reservada`, `Pagamento Informado`,
    `Cota Confirmada` e `Cota Liberada`.
17. Para um convidado sem e-mail válido no RSVP, confirme que o admin recebe e
    o delivery do convidado fica `skipped`.
18. No histórico de Notificações, abra uma entrega em `Detalhes` e use
    `Reenviar`; confirme que uma nova entrega manual é registrada.
19. No painel de RSVP, use `Reenviar Confirmação` para um RSVP com e-mail.
20. No painel de Presentes, use os botões de reenvio dos detalhes de presente
    individual e contribuição por cota.
21. Envie ou edite um recado em `messages.html` e confirme que o admin recebe
    `[Casamento] Novo Recado 💜`.
22. Aprove o recado no admin e confirme que o convidado recebe
    `Recado Aprovado 💜`.
23. Responda o recado no admin e confirme que o convidado recebe
    `Recado Respondido 💜`.
24. Repita aprovação ou resposta para convidado sem e-mail no RSVP e confirme
    que a entrega do convidado fica `skipped`.

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
