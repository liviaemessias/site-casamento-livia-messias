# Site de Casamento - L & M - v3.6

Esta release evolui as notificações manuais da v3.5 para permitir reenvio
controlado de confirmações e avisos já existentes, sem mensagens livres.

## Concluído

- Adicionada RPC administrativa para criar eventos manuais a partir de RSVP,
  presentes individuais e contribuições por cotas.
- Adicionada RPC administrativa para reenviar uma entrega específica do
  histórico de Notificações.
- A Edge Function `send-notifications` passa a aceitar
  `notification_event_id`, permitindo processar diretamente um evento manual
  recém-criado.
- A Edge Function passa a respeitar `manual_recipient_type`, permitindo
  reenviar uma entrega somente para `admin` ou somente para `guest`.
- Habilitado `manual_enabled` para os eventos transacionais existentes de RSVP,
  presentes e cotas.
- Adicionado botão `Reenviar` no modal de detalhes da página de Notificações
  para entregas que não estejam pendentes ou em processamento.
- Adicionado `Reenviar Confirmação` na página de RSVP para respostas com e-mail.
- Adicionados reenvios nos detalhes do painel de Presentes:
  - `Reenviar Reserva`;
  - `Reenviar Pagamento`;
  - `Reenviar Confirmação`;
  - equivalentes para contribuições por cotas.
- Mantido o padrão de rótulos com verbos/substantivos em maiúsculas e
  preposições em minúsculas.
- Atualizados README, runbook SMTP e verificadores de migração.

## Fora Do Escopo

- Editor livre de mensagens.
- Campanhas em massa.
- Agendamento recorrente automático.
- Processamento automático de bounces/devoluções.
