# Migrations

Esta pasta guarda scripts incrementais, verificações, rollbacks e runbooks
históricos usados durante a evolução do projeto.

Use estes arquivos quando a intenção for atualizar um projeto existente, aplicando
uma mudança específica e sua verificação correspondente.

## Como Usar

Para cada mudança incremental, execute primeiro o SQL principal e depois o
arquivo `*_verify.sql` relacionado, quando existir.

Exemplos recentes:

- `guest_invite_sent_migration.sql` + `guest_invite_sent_verify.sql`
- `email_notifications_schema.sql` + `email_notifications_schema_verify.sql`
- `gift_email_notifications.sql` + `gift_email_notifications_verify.sql`
- `notification_preferences.sql` + `notification_preferences_verify.sql`
- `manual_notification_reminders.sql` + `manual_notification_reminders_verify.sql`
- `manual_notification_resends.sql` + `manual_notification_resends_verify.sql`
- `notification_delivery_sorting.sql` + `notification_delivery_sorting_verify.sql`
- `notification_delivery_summary.sql` + `notification_delivery_summary_verify.sql`
- `wall_messages.sql` + `wall_messages_verify.sql`
- `wall_message_email_notifications.sql` + `wall_message_email_notifications_verify.sql`
- `admin_nav_alerts.sql` + `admin_nav_alerts_verify.sql`

Alguns arquivos dependem de outros já terem sido aplicados. Quando houver dúvida,
consulte o runbook da funcionalidade, como
`docs/operations/smtp_email_notifications_setup.md`.

## O Que Não Fazer

Não use esta pasta como caminho principal para recriar um projeto Supabase novo.
Para instalação limpa, use `docs/rebuild/supabase_rebuild_runbook.md` e
`docs/rebuild/supabase_rebuild_full_setup.sql`.

Arquivos com `rollback` no nome são operacionais e devem ser usados apenas com
planejamento e backup.

`supabase_schema_full_setup.sql` é legado e permanece apenas como histórico do
modelo anterior sem RLS final. Ele não representa o estado atual de produção.
