# Site de Casamento - L & M - v4.7

Esta release inicia um novo ciclo após o fechamento da v4.6, focado em ajustes
de usabilidade da experiência pública, especialmente na Lista de Presentes, nos
logins e no controle pelo convidado das reservas ainda pendentes.

## Concluído

### Logins Públicos E Administrativo

- As páginas de login voltaram a exibir a barra superior e o menu, tanto no
  desktop quanto no mobile.
- A mudança mantém os logins mais integrados à navegação pública do site, sem
  perder o visual compacto definido nas versões anteriores.

### Lista Pública De Presentes

- Os avisos de presentes externos foram refinados para ficarem mais leves,
  removendo o bloco retangular quando não há lojas sugeridas.
- O texto de ausência de lojas foi ajustado para indicar que a compra pode ser
  feita em qualquer local de preferência do convite.
- Os textos dos modais de compra online e física foram revisados para orientar o
  convidado a comprar fora do site e depois retornar para informar a compra.
- As instruções respeitam a concordância de convite individual ou de casal.
- As opções de lojas online passaram a indicar visualmente que levam para um
  site externo.
- O botão de loja online passou de "Comprar online" para "Ir para site".
- O modal de pagamento com cartão foi simplificado, com ação de pagamento
  externo mais direta e visual mais próximo dos botões discretos da página.
- O botão de cartão passou a usar o texto "Ir para Pagamento Externo".
- Presentes externos sem valor passaram a usar "A consultar na loja" como
  indicação de valor, quando não se enquadram como presente combinado.
- A regra de "Presente combinado" ficou mais específica: sem valor, externo e
  sem lojas cadastradas.
- Foi adicionado um botão flutuante de dúvidas na Lista de Presentes, permitindo
  que convidados falem com os noivos sobre reservas, pagamento, cotas ou formas
  de presentear.
- O botão de dúvidas fica empilhado acima do botão flutuante de ações pendentes
  quando houver pendências; caso contrário, ocupa o mesmo canto de apoio da
  página.
- O botão abre o modal de contato com texto adaptado para convite individual ou
  de casal e, quando houver WhatsApp configurado, prepara uma mensagem de
  dúvida sobre a Lista de Presentes.

### RSVP Público

- A página pública de RSVP recebeu um botão flutuante de dúvidas para contato
  com os noivos via WhatsApp.
- O botão abre um modal explicativo antes de direcionar o convidado, deixando
  claro que o contato serve para dúvidas sobre confirmação de presença,
  acompanhantes, crianças ou restrições alimentares.
- O texto do modal e a mensagem pronta do WhatsApp respeitam convite individual
  ou de casal.

### Cancelamento De Reservas Pelo Convidado

- Convidados podem cancelar reservas pendentes diretamente na Lista de
  Presentes.
- O cancelamento direto vale para presentes individuais reservados e
  contribuições por cota ainda pendentes.
- Reservas ou cotas já informadas ou confirmadas não podem ser canceladas
  diretamente pelo convidado.
- Nesses casos, a interface oferece contato com os noivos via WhatsApp quando o
  número estiver configurado.
- Foi adicionado um modal de confirmação antes do cancelamento, evitando ações
  acidentais.
- Ao cancelar um presente individual pendente, o presente volta para
  `Disponível` e os dados da reserva são limpos.
- Ao cancelar uma contribuição por cota pendente, a contribuição é removida e as
  cotas voltam a ficar disponíveis.
- A experiência também foi integrada à seção "Presentes para concluir", aos
  cards públicos e ao modal de detalhes do presente.
- O cancelamento de reservas pendentes passou a enfileirar notificações
  transacionais para admin e convidado.
- Os novos eventos `gift_reservation_cancelled` e
  `gift_contribution_cancelled` são processados pela Edge Function
  `send-notifications`, seguindo o mesmo padrão dos demais e-mails de presentes.
- Os e-mails de cancelamento mantêm a identidade visual existente, títulos com
  coração e textos com concordância para convite individual ou de casal.
- O e-mail de cancelamento de presente individual preserva a forma de presentear
  selecionada pelo convidado antes de limpar a reserva.

## Banco De Dados, Rebuild E Scripts

- Adicionada a migração `docs/migrations/guest_cancel_gift_reservation.sql` com
  as RPCs `cancel_my_gift_reservation(...)` e
  `cancel_my_gift_contribution(...)`.
- A mesma migração adiciona as preferências dos eventos de cancelamento em
  `notification_preferences`, com envio automático para admin e convidado.
- Adicionado o verificador
  `docs/migrations/guest_cancel_gift_reservation_verify.sql`.
- O rebuild completo foi atualizado para criar projetos novos já com as RPCs de
  cancelamento de reservas pendentes de presentes e suas notificações.
- A verificação final do rebuild foi atualizada para validar a presença das RPCs
  de cancelamento, as regras principais de propriedade e status pendente e as
  preferências de notificação dos novos eventos.

## Observações De Fechamento

- Para projetos existentes, rodar
  `docs/migrations/guest_cancel_gift_reservation.sql` e, em seguida,
  `docs/migrations/guest_cancel_gift_reservation_verify.sql`.
- A Edge Function `send-notifications` precisa ser redeployada para aplicar os
  novos títulos e textos dos e-mails de cancelamento.
- Para projetos novos criados a partir do rebuild completo, as RPCs de
  cancelamento de presentes e suas notificações já entram no setup principal.
- O cancelamento direto é propositalmente restrito ao estado pendente. Qualquer
  ajuste após compra/pagamento informado ou confirmado deve ser tratado com os
  noivos.
