# Site de Casamento - L & M - v4.6

Esta release aprofunda a experiência pública após a reformulação visual da v4.5,
com foco em deixar os fluxos de RSVP, Mural de Recados e Lista de Presentes mais
conectados, claros e fáceis de concluir. Também inclui pequenos ajustes
administrativos e documentação de apoio para testes.

## Concluído

### RSVP Integrado Ao Mural De Recados

- O RSVP público passou a oferecer a opção de transformar a mensagem deixada
  pelos convidados em recado para o Mural.
- A opção aparece de forma contextual quando existe mensagem válida no RSVP,
  usando um toggle visual em vez de checkbox simples.
- O texto do toggle respeita convite individual ou de casal, usando "meu" ou
  "nosso" conforme o caso.
- O formulário consulta se o convite já possui recado no mural e adapta o texto
  para criação de novo recado ou atualização do recado existente.
- Ao optar por enviar a mensagem ao mural, o recado é salvo como pendente e
  segue o fluxo normal de aprovação dos noivos antes de aparecer publicamente.
- A mensagem auxiliar deixa claro que o recado só ficará visível após aprovação.
- O feedback final do RSVP informa quando o recado foi enviado para aprovação
  ou quando houve falha apenas no envio ao mural, sem invalidar o RSVP salvo.
- Foi adicionada a RPC `current_guest_has_wall_message()` para retornar apenas
  o estado necessário ao frontend, sem expor dados indevidos do mural.

### Lista Pública De Presentes

- Os cards da lista pública passaram a ser clicáveis, abrindo o modal de
  detalhes do presente.
- Os cards da seção "Presentes para concluir" também passaram a abrir o modal de
  detalhes, mantendo os botões internos funcionando normalmente.
- O modal de detalhes agora exibe ações contextuais conforme o presente:
  presentear, contribuir com cotas, visualizar forma escolhida e informar
  pagamento ou compra realizada.
- O modal de detalhes para presentes por cotas foi reorganizado no desktop,
  deixando imagem e informações principais na coluna esquerda e ações/resumo na
  coluna direita.
- As seções internas do modal de detalhes receberam espaçamentos, divisórias e
  títulos mais equilibrados.
- A reserva de cotas passou a permitir alteração da quantidade apenas pelos
  botões de menos e mais, evitando edição manual direta do número.
- Os botões de quantidade de cotas ficaram mais arredondados e amigáveis.
- Foi criado um botão flutuante discreto para indicar ações pendentes em
  presentes do convite logado.
- O botão flutuante aparece somente quando há pendências e leva diretamente à
  seção "Presentes para concluir".
- Quando o aviso para cadastrar e-mail no RSVP aparece na lista de presentes, o
  botão flutuante se posiciona acima dele e retorna suavemente ao lugar após o
  fechamento do aviso.
- O seed `docs/seeds/gift_test_catalog_50.sql` foi criado para popular a lista
  com aproximadamente 50 presentes variados para testes, incluindo categorias,
  cotas, PIX, cartão, lojas externas, opções híbridas, links genéricos e algumas
  imagens externas.

### Home E Experiência Pública

- A ação "Deslize para descobrir" da Home foi ajustada para não ultrapassar o
  início da seção de destino.
- A Home passou a exibir a seção de boas-vindas antes da contagem regressiva,
  deixando a entrada da página mais acolhedora.
- O destino do "Deslize para descobrir" foi alinhado à seção de boas-vindas.
- Foi criada uma saudação visual de sessão para convidados logados, exibida uma
  vez por sessão com "Olá, ..." em um card/toast elegante no canto superior
  direito.
- A saudação usa `sessionStorage` apenas para registrar que já foi exibida na
  sessão atual, sem armazenar id ou nome do convidado.
- Ao sair do acesso do convite, a marcação de saudação exibida é limpa para que
  outro convidado no mesmo navegador receba a saudação corretamente.
- O botão de fechar do novo menu público foi corrigido para não aparecer no
  desktop quando o menu tradicional não precisa dele.
- O indicador de status na página pública de Recados foi refinado no mobile para
  não ocupar a largura inteira e permanecer alinhado de forma mais natural.

### Administração E Financeiro

- O modal de detalhes de Gastos Reais foi ajustado para lidar melhor com links
  de referência muito longos.
- Links extensos agora quebram ou truncam visualmente sem causar overflow no
  modal.
- O ajuste vale para os detalhes de gastos acessados pelo Financeiro e pelos
  pontos que reutilizam o mesmo modal.

### Administração De Presentes

- A tabela administrativa de Presentes recebeu ajustes para reduzir o scroll
  lateral causado pelo excesso de informações.
- A coluna "Cotas" passou a usar textos mais curtos, exibindo reservas,
  confirmações e valor por cota em formato compacto.
- As colunas "Presente" e "Reservado em" foram levemente compactadas para
  melhorar o aproveitamento horizontal sem alterar o tamanho da fonte.
- Na coluna "Ações", o botão "Detalhes" foi removido da tabela e dos cards
  mobile, mantendo o acesso aos detalhes pelo clique no item.
- As ações rápidas passaram a priorizar "Editar" e "Remover", com o botão
  "Remover" seguindo o mesmo padrão visual usado no RSVP.
- No modal de detalhes de presentes por cota, os status das contribuições, como
  "Pendente", deixaram de ocupar a largura inteira e passaram a respeitar o
  tamanho do conteúdo.
- Na coluna "Convidado", o ícone de situação de cada contribuição por cota
  passou a abrir um modal rápido focado naquela cota, com resumo do convidado,
  presente, quantidade, valor, situação, mensagem e ações possíveis.
- O modal rápido reaproveita as mesmas ações da seção "Contribuições" do modal
  completo, incluindo lembrete, reenvios, confirmação e liberação da cota.

### Administração De Convidados

- O cadastro de convidados passou a controlar separadamente o envio do Save the
  Date e do convite oficial.
- A página administrativa de Convidados recebeu filtro, coluna, ordenação,
  toggle e ação rápida para "Save the Date enviado".
- O campo antigo de convite enviado foi mantido, mas passou a ser tratado
  visualmente como "Convite oficial enviado".
- O modal de criação/edição de convidados passou a permitir marcar Save the Date
  e convite oficial separadamente.
- O modal de detalhes do convidado passou a exibir os dois status de envio e
  ações independentes para marcar ou desmarcar cada um.
- Os status do resumo do modal de detalhes de Convidados passaram a ficar lado a
  lado e quebrar linha somente quando não houver espaço.
- Os cards mobile de convidados também receberam o controle rápido do Save the
  Date, mantendo o padrão visual dos toggles atuais.
- A exportação CSV de convidados e os relatórios de presença/buffet passaram a
  incluir "Save the Date enviado" e "Convite oficial enviado".
- A página de Indicadores passou a separar métricas de Save the Date enviados,
  Save the Date pendentes, convites oficiais enviados e convites oficiais
  pendentes.
- As ações pendentes passaram a listar Save the Date pendente separadamente de
  convite oficial pendente.
- O mesmo comportamento de resumo com status lado a lado foi aplicado aos
  modais administrativos de RSVPs e Recados que usam badges de situação.

## Banco De Dados, Rebuild E Scripts

- Adicionada a migração `docs/migrations/current_guest_wall_message_status.sql`
  com a RPC `current_guest_has_wall_message()`.
- Adicionado o verificador
  `docs/migrations/current_guest_wall_message_status_verify.sql`.
- O rebuild completo foi atualizado para criar a RPC nova em projetos iniciados
  do zero.
- A verificação final do rebuild foi atualizada para validar a existência e as
  permissões da RPC.
- Adicionada a migração `docs/migrations/guest_save_the_date_sent.sql` com o
  campo `guests.save_the_date_sent`, a RPC
  `admin_set_guest_save_the_date_sent(...)` e as assinaturas atualizadas das
  RPCs administrativas de criação/edição de convidados.
- Adicionado o verificador
  `docs/migrations/guest_save_the_date_sent_verify.sql`.
- O rebuild completo foi atualizado para criar projetos novos já com o controle
  de Save the Date.
- O seed `docs/seeds/gift_test_catalog_50.sql` é opcional e voltado apenas para
  massa de testes da Lista de Presentes.

## Observações De Fechamento

- Para projetos existentes, rodar a migração
  `docs/migrations/current_guest_wall_message_status.sql` e, em seguida, o
  verificador correspondente.
- Para habilitar o controle de Save the Date em projetos existentes, rodar
  `docs/migrations/guest_save_the_date_sent.sql` e, em seguida,
  `docs/migrations/guest_save_the_date_sent_verify.sql`.
- Para projetos novos criados a partir do rebuild completo, a RPC já entra no
  setup principal, assim como o controle de Save the Date.
- O seed de presentes não é obrigatório para produção.
- As demais mudanças se concentram em HTML, CSS e JavaScript da experiência
  pública e em ajustes visuais pontuais do Admin.
