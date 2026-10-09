# Site de Casamento - L & M - v4.9

> Documento em andamento. Esta release continuará recebendo mudanças e notas
> conforme as funcionalidades forem desenvolvidas, até o fechamento da versão.

Esta release está sendo preparada para reunir novas funcionalidades e melhorias
do site. Entre as entregas desta release estão a página pública Manual dos
Convidados, a confirmação administrativa da forma de presentear e a separação
dos valores financeiros da lista.

## Implementado Até Agora

### Manual Dos Convidados

- Criada a página pública `guest-guide.html`, com layout responsivo e conteúdo
  estático no próprio site; não requer consulta ao banco de dados ou migração.
- Incluídas orientações gerais de traje esporte fino e a informação de que o
  branco fica reservado à noiva.
- Reunidos combinados de confirmação de presença, pontualidade, convivência com
  fotógrafos, mesa de doces, convite pessoal, decoração, despedida dos noivos e
  aproveitamento da celebração.
- Adicionados links para o RSVP e para a Lista de Presentes, seguindo os fluxos
  de acesso de convidados já existentes.
- Incluído o acesso ao Manual dos Convidados no menu de todas as páginas
  públicas e uma seção de apresentação na página inicial, sem adicionar um
  atalho à área de ações rápidas da Home.
- Padronizada a redação das instruções para se dirigir aos convidados no plural.
- Ajustados o menu suspenso no desktop, o botão de navegação para a primeira
  seção do manual e os tamanhos do hero para acompanhar a página Nossa História.

- Aplicada aos cards do manual uma elevação e uma sombra suaves ao passar o
  mouse, respeitando a preferência do sistema por movimento reduzido.

### Boas-vindas Na Página Inicial

- Incluído na seção Bem-vindos o trecho de Mateus 19:5b–6, com apresentação
  discreta abaixo da mensagem principal.
- Atualizada a mensagem de boas-vindas para: “Depois de tantos sonhos, orações
  e momentos especiais, chegou o dia de celebrar nossa união ao lado de pessoas
  queridas. Estamos muito felizes por ter vocês conosco neste momento tão
  especial.”

### Confirmação De Presentes Pelo Admin

- Adicionada a exigência de registrar a forma de presentear antes de confirmar
  um presente individual reservado. Quando o convidado já escolheu a forma, ela
  é preservada; quando ainda não escolheu, o Admin solicita a seleção.
- A confirmação grava método, detalhes compatíveis e status final na mesma RPC.
  PIX, cartão, compra online e loja física são validados conforme o modo do
  presente.
- Criada a migration `admin_gift_purchase_method_confirmation.sql` e sua
  verificação. A versão consolidada do Supabase e a verificação de rebuild também
  foram atualizadas. Não há mudança na estrutura das tabelas.

### Indicadores Financeiros Dos Presentes

- Mantidos `Valor da Lista`, `Valor Reservado` e `Valor Disponível` como valores
  gerais dos presentes e das cotas.
- Os indicadores `Dinheiro Informado`, `Dinheiro Confirmado` e `Dinheiro
  Pendente` consideram PIX, cartão e contribuições por cotas. Presentes com
  forma online ou loja física não são somados como dinheiro.
- Adicionados os indicadores `Presentes não monetários`, para compras online e
  em loja, e `Forma não informada`, para presentes reservados, informados ou
  confirmados sem método registrado. Esses valores ficam fora dos totais em
  dinheiro.
- Atualizado o resumo principal do Admin para que `Dinheiro Confirmado` siga a
  mesma regra.
- O gráfico financeiro mostra as categorias em segmentos proporcionais, com
  largura mínima para que valores pequenos positivos continuem visíveis. A
  legenda mantém os valores e percentuais calculados.
- Os cartões de dinheiro informado, confirmado e pendente abrem a lista com os
  filtros de status e formas PIX/cartão; o filtro de pendência também inclui
  registros sem status final e contribuições por cotas pendentes.
- Os cartões de presentes não monetários e de forma não informada abrem a lista
  apenas com presentes que entram no indicador (reservados, informados ou
  confirmados), combinando o status financeiro com a forma. O filtro de forma
  inclui opções combinadas de PIX/cartão e compras online/em loja.
- A classificação usa `gifts.selected_purchase_method`, que já existe. Registros
  sem método permanecem no valor geral da lista e são exibidos separadamente;
  esta alteração dos indicadores não exige migration.

### Modal Público De Presentes Por Cotas

- No desktop, quando um presente por cotas possui imagem, ela fica à esquerda
  e ocupa a altura necessária para acompanhar o conteúdo. As informações do
  presente, formas disponíveis, resumo das cotas e ações ficam à direita.
- Presentes por cotas sem imagem mantêm a disposição anterior. No mobile, a
  estrutura e a ordem visual anteriores também são preservadas.
- A mudança é apenas de apresentação e não exige alteração no banco de dados.

## Ainda Em Desenvolvimento

- Registrar nesta seção as próximas funcionalidades e melhorias que entrarem
  no escopo da v4.9.
- Revisar este documento e a documentação geral no fechamento da release.

## Banco De Dados E Compatibilidade

- A confirmação administrativa de presentes exige a migration `admin_gift_purchase_method_confirmation.sql` antes de publicar o Admin atualizado.
  A migration altera a RPC, sem adicionar colunas ou tabelas.

- A página do Manual dos Convidados usa conteúdo estático e não exige alterações
  no Supabase.
- A separação dos indicadores monetários usa os campos atuais e não exige
  alterações no banco. A migration de confirmação administrativa continua
  necessária para o fluxo de confirmação descrito acima.
- A versão atual do projeto permanece 4.8 até a conclusão e o fechamento da
  release v4.9.
