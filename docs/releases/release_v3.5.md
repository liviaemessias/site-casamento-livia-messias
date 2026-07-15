# Site de Casamento - L & M - v3.5

Esta release evolui a base de notificações criada na v3.4 para permitir controle por tipo de evento, diferenciar origem automática/manual e enviar lembretes manuais de reservas pendentes no painel administrativo.

## Concluído

- Adicionada a tabela `notification_preferences` para controlar preferências por tipo de notificação.
- Criado seed inicial com os eventos automáticos atuais de RSVP, presentes e cotas.
- Adicionadas preferências manuais para `gift_reservation_reminder` e `gift_contribution_reminder`.
- Adicionado `notification_events.origin`, com valores `automatic` e `manual`.
- A Edge Function `send-notifications` passa a consultar as preferências antes de criar entregas para admin ou convidado.
- Eventos desabilitados continuam sendo processados na outbox, mas suas entregas são registradas como `skipped`, preservando o histórico.
- Adicionadas RPCs administrativas para listar e atualizar preferências sem expor a tabela diretamente ao frontend.
- Adicionada seção própria em Configurações para editar os switches Automática, Manual, Admin e Convidado por tipo de evento.
- Adicionado filtro de origem na página de Notificações.
- Adicionada busca server-side no histórico de notificações por convidado, e-mail, presente/cota, identificadores, tipo, status ou motivo.
- A auditoria de notificações passa a exibir motivos amigáveis para entregas ignoradas, como falta de e-mail do convidado ou envio desativado nas preferências.
- Adicionadas ações manuais no painel de Presentes:
  - lembrete para presente individual reservado com pagamento pendente;
  - lembrete por contribuição pendente em presentes por cotas.
- Os lembretes manuais respeitam `manual_enabled`, `admin_enabled` e `guest_enabled`.
- Refinada a tabela de Notificações para reduzir largura horizontal, manter `Origem` no filtro/detalhes, exibir motivos de auditoria e preservar o e-mail na listagem.
- Refinada a tabela de Presentes com situação e convidado mais compactos e badges parciais abreviados.
- Adicionada dica na lista pública de presentes para incentivar o convidado a informar e-mail no RSVP antes de reservar presentes.

## Próximos Passos

- Reenvio manual de confirmações e avisos já existentes.

## Fora Do Escopo Inicial

- Editor completo de templates.
- Campanhas em massa.
- Agendamento automático recorrente.
- Processamento automático de bounces/devoluções.
