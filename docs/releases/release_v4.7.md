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

## Banco De Dados, Rebuild E Scripts

- Adicionada a migração `docs/migrations/guest_cancel_gift_reservation.sql` com
  as RPCs `cancel_my_gift_reservation(...)` e
  `cancel_my_gift_contribution(...)`.
- Adicionado o verificador
  `docs/migrations/guest_cancel_gift_reservation_verify.sql`.
- O rebuild completo foi atualizado para criar projetos novos já com as RPCs de
  cancelamento de reservas pendentes de presentes.
- A verificação final do rebuild foi atualizada para validar a presença das RPCs
  de cancelamento e as regras principais de propriedade e status pendente.

## Observações De Fechamento

- Para projetos existentes, rodar
  `docs/migrations/guest_cancel_gift_reservation.sql` e, em seguida,
  `docs/migrations/guest_cancel_gift_reservation_verify.sql`.
- Para projetos novos criados a partir do rebuild completo, as RPCs de
  cancelamento de presentes já entram no setup principal.
- O cancelamento direto é propositalmente restrito ao estado pendente. Qualquer
  ajuste após compra/pagamento informado ou confirmado deve ser tratado com os
  noivos.
