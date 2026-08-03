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
- `guest_side_migration.sql` + `guest_side_verify.sql`
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
- `admin_nav_financial_overdue_payments.sql` + `admin_nav_financial_overdue_payments_verify.sql`
- `wedding_vendors.sql` + `wedding_vendors_verify.sql`
- `wedding_schedule.sql` + `wedding_schedule_verify.sql`
- `rsvp_food_restriction_choice.sql` + `rsvp_food_restriction_choice_verify.sql`
- `rsvp_food_restriction_per_person.sql` + `rsvp_food_restriction_per_person_verify.sql`
- `financial_management.sql` + `financial_management_verify.sql`
- `financial_summary_rpc_fix.sql` + `financial_summary_rpc_fix_verify.sql`
- `financial_budget_scenario_reference_guard.sql` + `financial_budget_scenario_reference_guard_verify.sql`
- `financial_base_ordering.sql` + `financial_base_ordering_verify.sql`
- `wedding_checklist.sql` + `wedding_checklist_verify.sql`
- `wedding_tables.sql` + `wedding_tables_verify.sql`

Observação: `rsvp_food_restriction_per_person.sql` é a evolução do modelo de
restrição alimentar da v4.1. Ele move a restrição para cada pessoa dentro de
`rsvps.guest_data`, recria as RPCs de RSVP e remove as colunas legadas
`rsvps.food` e `rsvps.food_restriction`. O campo `rsvps.message` permanece no
RSVP. Depois da aplicação, execute
`rsvp_food_restriction_per_person_verify.sql`.

Alguns arquivos dependem de outros já terem sido aplicados. Quando houver dúvida,
consulte o runbook da funcionalidade, como
`docs/operations/smtp_email_notifications_setup.md`.

Observação: `financial_management.sql` inicia o módulo Financeiro da v4.2. Ele
cria cenários de orçamento, categorias, pagadores, itens previstos, gastos reais
e parcelas/pagamentos para os contextos `Casamento` e `Lua de Mel`, com cenário
de referência por contexto e RPCs administrativas para o Admin.

Observação: `financial_summary_rpc_fix.sql` corrige a RPC
`admin_get_financial_summary(text)` da primeira implementação do Financeiro,
qualificando os campos agregados do resumo consolidado para evitar conflito com
os nomes das colunas de retorno da própria função.

Observação: `financial_budget_scenario_reference_guard.sql` reforça as RPCs de
cenários financeiros para impedir que `Casamento` ou `Lua de Mel` fiquem sem um
cenário de referência ativo.

Observação: `financial_base_ordering.sql` adiciona RPCs para organizar em lote a
ordem de cenários, categorias e pagadores financeiros.

Observação: `financial_expense_budget_item_link.sql` adiciona o vínculo opcional
entre gastos reais e itens previstos, permitindo comparar o realizado de cada
item do orçamento com o valor planejado.

Observação: `admin_nav_financial_overdue_payments.sql` atualiza
`admin_get_nav_alerts()` para sinalizar parcelas financeiras vencidas ou com
vencimento no dia atual no menu administrativo.

## O Que Não Fazer

Não use esta pasta como caminho principal para recriar um projeto Supabase novo.
Para instalação limpa, use `docs/rebuild/supabase_rebuild_runbook.md` e
`docs/rebuild/supabase_rebuild_full_setup.sql`.

Arquivos com `rollback` no nome são operacionais e devem ser usados apenas com
planejamento e backup.

`supabase_schema_full_setup.sql` é legado e permanece apenas como histórico do
modelo anterior sem RLS final. Ele não representa o estado atual de produção.
