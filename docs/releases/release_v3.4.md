# Site de Casamento - L & M - v3.4

Esta release inicia a infraestrutura de notificações transacionais por e-mail.
Os fluxos cobertos são o RSVP público e eventos principais de presentes/cotas.

## Funcionalidades

- Notificação por e-mail quando o convidado salva o RSVP público.
- E-mail administrativo enviado para `ADMIN_EMAIL`.
- E-mail de confirmação enviado ao convidado quando o RSVP possui e-mail válido.
- Assuntos e conteúdo diferenciados para RSVP Recebido e RSVP Atualizado.
- Texto do RSVP do convidado adaptado conforme presença confirmada ou ausência,
  com concordância para convite individual e de casal.
- E-mail de casal com seção de respostas individuais dos membros do convite.
- Validação preventiva no RSVP para sugerir correções em domínios comuns de e-mail, como Gmail, Hotmail, Outlook e Yahoo.
- Mensagens com identidade afetiva do casamento e assinatura com corações roxo
  e vermelho.
- Notificações de presentes individuais reservados, pagamentos informados,
  compras confirmadas e reservas liberadas.
- Notificações de cotas reservadas, pagamentos informados, contribuições
  confirmadas e cotas liberadas.
- Página administrativa de notificações com filtros para RSVP, presentes e
  cotas.

## Arquitetura

- Adicionadas as tabelas `notification_events` e `notification_deliveries`.
- A RPC `save_current_rsvp(...)` cria evento `rsvp_saved` após salvar o RSVP.
- RPCs de presentes/cotas criam eventos transacionais na mesma outbox.
- A Edge Function `send-notifications` processa eventos pendentes em segundo plano.
- O frontend acorda a função após RSVP e ações de presentes/cotas, sem
  bloquear a mensagem de sucesso ao convidado ou admin.
- O painel de presentes atualiza a tabela logo após confirmações/liberações,
  deixando o processamento de e-mail em segundo plano.
- Cada destinatário possui registro próprio de entrega.

## Segurança

- Secrets SMTP ficam somente no Supabase.
- A Edge Function mantém `verify_jwt = true`.
- O convidado só processa notificações do próprio `guest_id`.
- Admin autenticado é validado em `admin_users` antes de processar eventos
  administrativos pendentes, com prioridade sobre qualquer sessão pública de
  convidado existente no mesmo navegador.
- As tabelas de notificação usam RLS e não têm acesso direto para `anon` ou `authenticated`.
- A função usa `service_role` somente para gerenciar eventos e entregas.
- Conteúdo dinâmico do RSVP e dos presentes/cotas é escapado antes de entrar no HTML dos e-mails.
- Idempotência por `dedupe_key` evita e-mails duplicados para o mesmo evento.

## Limites Intencionais

- RSVP manual do painel administrativo não dispara e-mail automaticamente.
- Seleção de forma de pagamento, loja ou método de compra não dispara e-mail
  por si só; os e-mails começam na reserva e na informação de pagamento/compra.
- Entregas com falha são registradas, mas não são reenviadas automaticamente nesta versão.

## Documentação

- Adicionado runbook de SMTP com exemplos para Gmail e Outlook/Hotmail.
- Atualizados os scripts de rebuild e verificação final.
- Adicionados SQLs incrementais para criar e verificar a outbox de notificações.
- Adicionado SQL incremental para eventos de e-mail de presentes/cotas.

## Próximos Passos

- Avaliar processamento de bounces/devoluções de e-mail.
- Evoluir para notificações manuais no painel administrativo em uma próxima
  release, provavelmente v3.5.
- Avaliar lembretes manuais para reservas pendentes antigas.
- Avaliar ações administrativas para reenviar confirmações, avisar reserva
  pendente, confirmar pagamento/compra e comunicar liberação de presente/cota.
- Avaliar templates editáveis ou mensagens personalizadas para disparos manuais.
