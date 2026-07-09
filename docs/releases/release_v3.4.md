# Site de Casamento - L & M - v3.4

Esta release inicia a infraestrutura de notificações transacionais por e-mail.
O primeiro fluxo coberto é o RSVP público criado ou atualizado pelo convidado.

## Funcionalidades

- Notificação por e-mail quando o convidado salva o RSVP público.
- E-mail administrativo enviado para `ADMIN_EMAIL`.
- E-mail de confirmação enviado ao convidado quando o RSVP possui e-mail válido.
- Assuntos e conteúdo diferenciados para RSVP Recebido e RSVP Atualizado.
- E-mail de casal com seção de respostas individuais dos membros do convite.
- Mensagens com identidade afetiva do casamento e corações roxos.

## Arquitetura

- Adicionadas as tabelas `notification_events` e `notification_deliveries`.
- A RPC `save_current_rsvp(...)` cria evento `rsvp_saved` após salvar o RSVP.
- A Edge Function `send-notifications` processa eventos pendentes em segundo plano.
- O frontend acorda a função após o RSVP, sem bloquear a mensagem de sucesso ao convidado.
- Cada destinatário possui registro próprio de entrega.

## Segurança

- Secrets SMTP ficam somente no Supabase.
- A Edge Function mantém `verify_jwt = true`.
- O convidado só processa notificações do próprio `guest_id`.
- As tabelas de notificação usam RLS e não têm acesso direto para `anon` ou `authenticated`.
- A função usa `service_role` somente para gerenciar eventos e entregas.
- Conteúdo dinâmico do RSVP é escapado antes de entrar no HTML dos e-mails.
- Idempotência por `dedupe_key` evita e-mails duplicados para a mesma versão do RSVP.

## Limites Intencionais

- RSVP manual do painel administrativo não dispara e-mail automaticamente.
- Presentes, reservas, contribuições e pagamentos ainda não disparam notificações.
- Entregas com falha são registradas, mas não são reenviadas automaticamente nesta versão.

## Documentação

- Adicionado runbook de SMTP com exemplos para Gmail e Outlook/Hotmail.
- Atualizados os scripts de rebuild e verificação final.
- Adicionados SQLs incrementais para criar e verificar a outbox de notificações.

## Próximos Passos

- Notificar reservas de presentes.
- Notificar pagamentos ou compras informadas.
- Avaliar tela administrativa para consultar falhas de entrega.
