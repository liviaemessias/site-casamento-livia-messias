# Site de Casamento - L & M - v5.0

Esta release reúne novas funcionalidades e melhorias do site, incluindo a
página pública Manual dos Convidados, a confirmação administrativa da forma de
presentear, a separação dos valores financeiros da lista e um tutorial
interativo para orientar os convidados na Lista de Presentes.

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

### Valor De Presentes Pagos Com Cartão

- No modal público de pagamento, quando a forma selecionada for Cartão de
  Crédito, o valor exibe o preço do presente e o total estimado com a taxa:
  `valor do presente + taxa do cartão (total aprox. R$ X,XX)`. O cálculo usa
  margem inversa, dividindo o valor desejado por `1 - 0,0498` e arredondando o
  total para centavos, com base na tarifa de 4,98% para recebimento na hora.
- O modal público de detalhes do presente também antecipa o total estimado com
  taxa quando Cartão de Crédito está disponível como forma de presentear.
- A estimativa não inclui possíveis tarifas de parcelamento nem substitui o
  valor configurado no link externo do Mercado Pago, que deve refletir o total
  que será cobrado. O modal informa que o valor final pode variar no checkout.
- O cálculo é feito no front-end e não exige alteração no banco de dados.

### Tutorial Da Lista De Presentes

- Adicionado um botão flutuante próprio para abrir um tutorial em quatro etapas
  sobre reserva, contribuição por PIX ou cartão, compra online ou física e
  comunicação da conclusão pelo site. O tutorial não aparece automaticamente;
  o botão flutuante de dúvidas e contato com os noivos foi preservado.
- A abertura explica que as formas disponíveis variam entre os presentes e que
  os convidados podem escolher entre contribuir com o valor (recebido pelos
  noivos) ou comprar o produto físico. A entrega do produto pode ser combinada
  diretamente com os noivos.
- A etapa de PIX informa que o convidado pode parcelar pelo aplicativo do banco
  se essa opção estiver disponível. Presentes por cotas são explicados como
  contribuições via PIX, com a mesma observação.
- Os textos do tutorial adaptam pronomes e verbos aos convites individuais e de
  casal. A última etapa explica que presentes permanecem reservados até a
  confirmação manual dos noivos e oferece acesso ao contato para dúvidas.
- O botão flutuante foi nomeado `Tutorial de como presentear` e recebeu um
  ícone de livro aberto. O texto de contato com os noivos também varia conforme
  o convite: “Ainda tem dúvida? Fale com os noivos” para convites individuais e
  “Ainda têm dúvidas? Falem com os noivos” para convites de casal.
- Os botões de navegação das etapas mantêm altura e alinhamento uniformes, e o
  botão oculto na primeira etapa não reserva espaço no layout.
- A funcionalidade usa conteúdo estático no frontend e não exige alterações no
  banco de dados.

## Banco De Dados E Compatibilidade

- A confirmação administrativa de presentes exige a migration `admin_gift_purchase_method_confirmation.sql` antes de publicar o Admin atualizado.
  A migration altera a RPC, sem adicionar colunas ou tabelas.

- A página do Manual dos Convidados usa conteúdo estático e não exige alterações
  no Supabase.
- A separação dos indicadores monetários usa os campos atuais e não exige
  alterações no banco. A migration de confirmação administrativa continua
  necessária para o fluxo de confirmação descrito acima.
- O Manual dos Convidados, o tutorial da Lista de Presentes, os indicadores e
  a exibição estimada da taxa do cartão não exigem alterações adicionais no
  banco de dados.

## Fechamento Da Release

- A release v5.0 está concluída e reúne as funcionalidades e melhorias
  descritas neste documento.
- Antes de publicar o Admin atualizado, aplicar e verificar a migration
  `admin_gift_purchase_method_confirmation.sql` conforme o procedimento do
  projeto.
- A documentação geral e a versão informada no README acompanham o fechamento
  da v5.0.
