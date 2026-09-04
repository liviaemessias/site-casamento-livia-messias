# Site de Casamento - Livia & Messias

Site de casamento personalizado para centralizar informações do evento, RSVP, lista de presentes e administração dos noivos.

Versão atual: **4.4**.

## Desenvolvimento

Desenvolvido por **Messias D. P. de M. Filho**.

GitHub: [messiasfl10](https://github.com/messiasfl10/)

## Funcionalidades

- Acesso por código de convite.
- Controle administrativo de convites enviados ou ainda pendentes de envio.
- Classificação administrativa de convidados como convidados da Noiva, do Noivo
  ou do Casal.
- Notificações transacionais por e-mail para RSVP público, reservas,
  pagamentos, confirmações/liberações de presentes e cotas e Mural de
  Recados.
- Reenvio manual e auditável de confirmações e avisos já existentes.
- RSVP individual e para convites de casal, com restrição alimentar por pessoa
  do convite.
- Cadastro de acompanhantes e crianças, com restrição alimentar individual para
  convidado principal, membros do casal e acompanhantes.
- Idade das crianças padronizada até 12 anos, conforme a data do casamento.
- Regra configurável de idade mínima pagante para o buffet.
- Lista de presentes com reserva.
- Seção da lista de presentes na página inicial.
- Presentes por cotas para contribuições financeiras via PIX.
- Área de acompanhamento dos presentes do convite que ainda possuem ações pendentes.
- Dica na lista de presentes para informar e-mail no RSVP e receber confirmações, novidades e avisos.
- Formas de presentear por PIX, cartão via checkout externo, compra online e loja física.
- QR-Code e PIX Copia e Cola gerados no frontend.
- Confirmação antes de reservar presentes ou informar pagamentos e compras.
- Painel administrativo repaginado com navegação lateral desktop, navbar
  inferior mobile em estilo aplicativo e páginas especializadas.
- Dashboard operacional refinado com indicadores clicáveis, resumos visuais de
  RSVP e presentes, atalhos para as principais pendências e cabeçalhos
  administrativos padronizados.
- Páginas administrativas refinadas com cabeçalhos compactos, filtros
  recolhíveis, tabelas desktop, cards mobile, toggles elegantes, ações discretas
  e indicadores visuais para estados importantes.
- Página de Indicadores com métricas e gráficos detalhados de presença,
  convidados, mesas, buffet, presentes e valores dos presentes.
- Módulo Financeiro administrativo para orçamento previsto, gastos reais,
  parcelas, cenários, categorias, pagadores, contextos de casamento/lua de mel,
  vínculo entre gasto e item previsto, alertas de vencimento e relatórios.
- Experiência pública refinada com identidade visual do casal, logo em pontos
  estratégicos, tom roxo principal atualizado, tipografia romântica nos heros,
  menu desktop agrupado e melhorias responsivas nas páginas públicas.
- Filtros, ordenação, contadores de resultado e limpeza de filtros no admin.
- Alertas compactos no menu administrativo para recados pendentes, presentes
  ou cotas com pagamento informado, tarefas atrasadas e parcelas financeiras
  vencidas ou vencendo no dia atual.
- Exportação CSV de convidados, RSVPs e presentes respeitando filtros e ordenação atuais, incluindo convite enviado, convidado de e totais planejados de convidados e acompanhantes.
- Página de Relatórios com exportações CSV/XLSX/PDF, seleção de colunas,
  convite enviado, convidado de, mesa, observação do convidado na mesa,
  restrições alimentares por pessoa e opções resumidas ou detalhadas conforme o
  relatório.
- Mural de Recados com página pública, prévia na página inicial, moderação
  administrativa, respostas dos noivos e notificações por e-mail.
- Página pública de Fornecedores, com cards visíveis para convidados e estado
  vazio amigável quando ainda não houver fornecedores cadastrados.
- Administração de fornecedores com cadastro, edição, listagem, visibilidade,
  destaque, ordenação manual por modal e exclusão.
- Página protegida de Programação do casamento, com etapas e atividades
  visíveis apenas para convidados logados.
- Administração da programação com cadastro de etapas, atividades, filtros,
  ordenação manual por modal, visibilidade e exclusão.
- Checklist administrativo do casamento, com tarefas em cards por período,
  categorias e responsáveis editáveis, ações rápidas por período, organização
  manual da ordem, exportação CSV, status, prioridade, alerta de tarefas
  atrasadas e seed inicial.
- Definição administrativa de Mesas, com ocupação Planejada, Confirmada e
  Híbrida, atribuição de convidados, gestão pelo detalhe do convidado, atalho
  via RSVP, filtros, métricas e exportação CSV.
- Referências visuais personalizadas nos logins e nas páginas públicas, adaptadas para desktop e mobile.
- Footer público padronizado com logo do casal e atalho para voltar à página
  inicial.
- Textos de saudação, reserva e pagamento adaptados para convites individuais e de casal.
- Login administrativo com e-mail e senha pelo Supabase Auth.
- Geração segura dos códigos de convite no Supabase, restrita a administradores.
- Confirmação e liberação administrativa de presentes e cotas por RPCs transacionais.
- Criação, atualização e remoção administrativa de RSVPs por RPCs transacionais.
- RSVP público validado no banco com membros, acompanhantes e idades padronizadas.
- Formas de presentear e confirmações de pagamento validadas no banco.
- Edição, ativação/desativação e marcação de envio de convite por RPCs administrativas.
- Cadastro, edição e exclusão de presentes por RPCs com validação financeira.
- Configurações globais validadas e salvas como registro único por RPC.
- Configurações públicas expostas por RPC com colunas fixas, sem leitura direta da tabela pelo frontend.
- Nomes, datas, prazo do RSVP, cerimônia e recepção configuráveis pelo painel e reutilizados nas páginas públicas.
- Metadados de SEO, Open Graph e Twitter Cards na página inicial, atualizados conforme os dados do evento.
- Content Security Policy em todas as páginas e renderização de conteúdo dinâmico com utilitários seguros.
- Login seguro dos convidados com sessão anônima e Edge Function.
- Outbox segura de notificações com registros por evento e por destinatário.
- Cloudflare Turnstile nos logins administrativo e de convidados.
- Row Level Security e RPCs restritas para isolamento dos dados por convite.
- Limitação de tentativas inválidas no login por código.

## Tecnologias

- HTML5
- CSS3
- JavaScript Vanilla
- Supabase
- PostgreSQL

## Estrutura De Páginas

### Públicas

- `index.html`: página inicial, informações do casamento, contagem regressiva, metadados, identidade visual do casal e acesso à lista de presentes.
- `our-story.html`: linha do tempo da história do casal, notas pessoais e seção da jornada.
- `login.html`: entrada por código de convite.
- `rsvp.html`: confirmação de presença.
- `gifts.html`: lista de presentes, filtros públicos e fluxo de reserva/pagamento.
- `photos.html`: galeria do Pré-Wedding.
- `messages.html`: Mural de Recados.
- `vendors.html`: fornecedores do casamento.
- `schedule.html`: programação do casamento para convidados logados.

### Administrativas

O antigo painel único foi dividido em páginas dedicadas:

- `admin-login.html`: acesso administrativo com e-mail e senha pelo Supabase Auth.
- `admin-dashboard.html`: resumo geral do casamento.
- `admin-indicators.html`: métricas e gráficos detalhados do casamento.
- `admin-reports.html`: relatórios consolidados e exportações CSV/XLSX/PDF.
- `admin-notifications.html`: histórico auditável de notificações e reenvios.
- `admin-gifts.html`: gestão de presentes.
- `admin-guests.html`: gestão de convidados e RSVP manual.
- `admin-rsvps.html`: consulta e remoção de confirmações.
- `admin-messages.html`: moderação e resposta dos recados.
- `admin-checklist.html`: organização interna do checklist do casamento.
- `admin-tables.html`: gestão do mapa de mesas e alocação de convidados.
- `admin-financial.html`: visão geral financeira com orçamento, gastos recentes
  e próximas parcelas.
- `admin-financial-budget.html`: gestão dos itens de orçamento previsto.
- `admin-financial-expenses.html`: gestão dos gastos reais e parcelas por gasto.
- `admin-financial-payments.html`: consulta e gestão completa das parcelas.
- `admin-financial-base.html`: cadastros base de cenários, categorias e pagadores.
- `admin-vendors.html`: cadastro e gestão dos fornecedores exibidos no site.
- `admin-schedule.html`: cadastro e gestão das etapas e atividades da programação do casamento.
- `admin-settings.html`: configuração dos dados do casamento, PIX, WhatsApp e idade mínima pagante do buffet.

Todas as páginas administrativas passam por `js/admin-bootstrap.js`, que
confirma a sessão do Supabase Auth e a função `is_admin()` antes de carregar a
lógica da tela. `js/admin-common.js` concentra logout, toast, formatação de
datas, atualização de textos simples, navegação administrativa responsiva,
alertas compactos do menu e padronização dos cabeçalhos das páginas.

## Organização Dos Scripts

- `js/supabase.js`: configuração do cliente Supabase.
- `js/auth.js`: implementação legada de sessão local, mantida apenas como referência e fallback controlado.
- `js/guest-auth-config.js`: configuração do modo de autenticação dos convidados, atualmente em `supabase`.
- `js/guest-auth.js`: sessão, login por convite e logout dos convidados.
- `js/guest-data.js`: operações de RSVP e presentes em modo legado ou por RPCs.
- `js/guest-bootstrap.js`: validação do convidado antes de carregar páginas protegidas.
- `js/login.js`: fluxo do login público por código de convite.
- `js/admin-login.js`: login administrativo com e-mail e senha.
- `js/admin-bootstrap.js`: proteção e carregamento das páginas administrativas.
- `js/public-common.js`: comportamento comum das páginas públicas autenticadas,
  como navbar, dropdown do menu público, logout e saudação do convidado.
- `js/captcha-config.js`: ativação e Site Key pública do Cloudflare Turnstile.
- `js/turnstile-captcha.js`: carregamento, token, expiração e reset do CAPTCHA compartilhado pelos logins.
- `js/reference-decorations.js`: referências visuais aleatórias dos logins, laterais desktop e divisores mobile.
- `js/photo-gallery-data.js`: lista compartilhada das fotos exibidas na seção e na página de Pré-Wedding.
- `js/script.js`: comportamento específico da página inicial, incluindo navbar,
  menu público, contagem regressiva e interações da Home.
- `js/home-photos.js`: renderização da prévia do Pré-Wedding na página inicial.
- `js/home-messages.js`: renderização da prévia do Mural de Recados na página
  inicial.
- `js/photos.js`: renderização da galeria completa e do lightbox da página de Pré-Wedding.
- `js/story.js`: interações da página Nossa História, incluindo navbar,
  carrosséis, timeline e animações.
- `js/child-age-options.js`: opções padronizadas para informar a idade das crianças na data do casamento.
- `js/event-config.js`: valores públicos padrão de nomes, datas, locais,
  imagens sociais e descrição do evento.
- `js/event-settings.js`: carrega e aplica nomes, datas, locais e metadados da
  página inicial nas páginas públicas.
- `js/security-utils.js`: valida textos e URLs e sanitiza conteúdo HTML dinâmico antes da renderização.
- `js/admin-common.js`: comportamento comum das páginas administrativas,
  incluindo logout, toast, navegação lateral desktop, navbar mobile, alertas do
  menu e descrições padronizadas dos cabeçalhos.
- `js/pix.js`: geração pura do payload PIX, CRC16 e URL do QR-Code.
- `js/gifts.js`: fluxo da lista de presentes, reserva, cotas, escolha da forma de presentear e confirmação de pagamento/compra.
- `js/rsvp.js`: fluxo de confirmação de presença.
- `js/admin-dashboard.js`: métricas detalhadas da página de Indicadores.
- `js/admin-dashboard-charts.js`: renderização dos gráficos de Indicadores.
- `js/admin-overview.js`: visão resumida e acionável do Dashboard inicial.
- `js/admin-dashboard-reports.js`: geração dos relatórios consolidados exportáveis.
- `js/admin-reports.js`: carregamento dos dados da página de relatórios.
- `js/admin-financial.js`: módulo Financeiro administrativo, incluindo visão
  geral, orçamento previsto, gastos reais, parcelas e cadastros base.
- `js/buffet-metrics.js`: classificação compartilhada de adultos, crianças pagantes, não pagantes e sem idade válida.
- `js/admin-export.js`: geração e download de CSV/XLSX nas páginas administrativas.
- `js/admin-gifts.js`: CRUD, filtros, ordenação, cotas e administração de presentes.
- `js/admin-guests.js`: CRUD, filtros, ordenação de convidados e RSVP manual.
- `js/admin-rsvps.js`: listagem, filtros, ordenação e remoção de RSVPs.
- `js/admin-messages.js`: moderação, aprovação, ocultação e respostas do Mural de Recados.
- `js/admin-notifications.js`: histórico auditável de notificações, filtros,
  métricas e reenvios manuais.
- `js/messages.js`: página pública do Mural de Recados, envio do convidado e listagem aprovada.
- `js/admin-vendors.js`: cadastro, edição, filtros e visibilidade dos fornecedores.
- `js/vendors.js`: página pública de Fornecedores e estado vazio.
- `js/admin-schedule.js`: cadastro, edição, filtros, visibilidade e ordenação da programação.
- `js/schedule.js`: página protegida da programação para convidados logados.
- `js/admin-checklist.js`: checklist administrativo em cards por período, com categorias, responsáveis, ordenação, CSV e modais de tarefas.
- `js/admin-tables.js`: mapa de mesas, métricas, filtros, alocação,
  transferência e remoção de convidados em mesas.
- `js/admin-settings.js`: edição dos dados do casamento, PIX, WhatsApp e regra do buffet.

## Organização Dos CSSs

- `css/tokens.css`: tokens globais de cores, fontes, raios, sombras e espaçamentos.
- `css/style.css`: estilos base e página inicial.
- `css/login.css`: tela de login.
- `css/rsvp.css`: página de RSVP.
- `css/gifts.css`: lista de presentes e modais de pagamento.
- `css/story.css`: página Nossa História.
- `css/photos.css`: página de Pré-Wedding e lightbox da galeria.
- `css/messages.css`: página pública do Mural de Recados.
- `css/vendors.css`: página pública de Fornecedores.
- `css/schedule.css`: página protegida da Programação.
- `css/reference-rails.css`: referências visuais laterais/ornamentais,
  divisores mobile e ajustes compartilhados dos rodapés públicos.
- `css/admin.css`: todas as páginas administrativas.

Os CSSs foram padronizados para usar tokens globais sempre que possível. Os HTMLs também evitam estilos inline; classes utilitárias como `is-hidden` são usadas para estados iniciais simples.

## Organização Dos Assets

As imagens do site ficam organizadas por contexto em `assets/images/`:

- `home/`: capa da página inicial e fotos da cerimônia e da recepção.
- `our-story/`: capa e fotos dos carrosséis da página Nossa História.
- `photos/`: fotos exibidas na seção e na página de Pré-Wedding.
- `vendors/`: imagem de referência da página pública de Fornecedores.
- `schedule/`: imagem de referência da página protegida de Programação.
- `login-references/`: referências visuais usadas nos logins e nas decorações das páginas públicas.
- `brand/`: variações SVG da logo do casal usadas em heros, logins, rodapés e
  marca administrativa.

## Assets Do Pré-Wedding

A página `photos.html` e a seção `Nosso Pré-Wedding` da página inicial usam a
lista definida em `js/photo-gallery-data.js`.

As imagens ficam em `assets/images/photos/` e devem usar nomes simples, sem
espaços, como:

- `pre-wedding-01.jpg`
- `pre-wedding-02.jpg`
- `pre-wedding-03.jpg`

As fotos oficiais do Pré-Wedding ainda serão adicionadas ou substituídas após o
ensaio. Ao incluir novas fotos, adicione uma entrada correspondente em
`js/photo-gallery-data.js`; a página completa exibirá todas, enquanto a home usa
as primeiras imagens como prévia.

## Assets Da Página Nossa História

A página `our-story.html` usa carrosséis dentro dos cards da linha do tempo. As imagens ficam em `assets/images/our-story/` e seguem o padrão:

- `historia-item1-1.jpg`, `historia-item1-2.jpg`, etc.
- `historia-item2-1.jpg`, `historia-item2-2.jpg`, etc.
- O número depois de `item` identifica o card da linha do tempo.
- O número final identifica a posição da foto dentro do carrossel.

Por padrão, `.timeline-slides` atende carrosséis com 3 imagens. Para quantidades maiores, use:

- `.timeline-slides six-slides` para carrosséis com 6 imagens.
- `.timeline-slides eight-slides` para carrosséis com 8 imagens.

As animações correspondentes ficam em `css/story.css` e mantêm cada foto ocupando a área do card com `min-width: 100%`, `height: 100%` e `object-fit: cover`.

## Fluxo De Autenticação

### Convidados

O modo atual em `js/guest-auth-config.js` é `supabase`:

1. O Supabase Auth cria uma sessão anônima.
2. A Edge Function `claim-invite` valida o código.
3. A sessão é vinculada em `guest_access_sessions`.
4. Perfil, RSVP e presentes usam RLS e RPCs restritas.
5. Tentativas inválidas são limitadas por usuário e hash protegido da rede.

O modo `legacy` permanece no código apenas como referência e fallback técnico.
Ele não representa o fluxo ativo da versão 3.3.

### Administradores

1. O administrador informa e-mail e senha em `admin-login.html`.
2. O Supabase Auth valida as credenciais.
3. A função `is_admin()` confirma o vínculo ativo em `admin_users`.
4. A lógica da página administrativa só é carregada após essa confirmação.
5. Acesso sem sessão administrativa retorna para `admin-login.html`.

> Estado atual: administradores usam Supabase Auth com e-mail e senha;
> convidados usam sessões anônimas vinculadas ao código pela Edge Function.
> O acesso aos dados é protegido por RLS e RPCs restritas.

## Fluxo RSVP

O RSVP permite:

- Confirmar presença com `Sim` ou `Não`.
- Informar e-mail, telefone, restrição alimentar por pessoa do convite e
  mensagem. Quando houver restrição, o campo de detalhe é liberado somente para
  aquela pessoa.
- Adicionar acompanhantes dentro do limite do convite.
- Confirmar membros de convite de casal individualmente.

Os dados completos ficam em `rsvps.guest_data`, permitindo preservar membros do
casal, acompanhantes e restrições alimentares individuais em JSON. O texto da
restrição guarda apenas a descrição; nomes são adicionados somente em telas,
relatórios e notificações quando é necessário diferenciar as pessoas.

Quando o RSVP público é salvo ou atualizado, a RPC cria um evento
`rsvp_saved` em `notification_events`. O frontend chama a Edge Function
`send-notifications` em segundo plano, sem bloquear a confirmação do convidado.
O admin recebe e-mail sempre; o convidado recebe somente quando informou um
e-mail válido no RSVP. RSVPs manuais feitos no painel administrativo não
disparam e-mail automaticamente, mas podem ser reenviados manualmente. As
mensagens do convidado variam conforme RSVP recebido ou atualizado, presença
confirmada ou ausência, com concordância para convite individual e de casal. Os
e-mails de RSVP listam restrições alimentares por pessoa quando houver convidado
principal, membro do casal ou acompanhante com restrição.

## Fluxo De Presentes

1. O convidado escolhe um presente disponível.
2. O presente é reservado para o convidado.
3. O convidado escolhe uma forma de presentear.
4. O sistema registra `selected_purchase_method` e, quando aplicável, `selected_purchase_details`.
5. Após pagar ou comprar, o convidado marca o pagamento/compra como informado.
6. O administrador valida manualmente e pode marcar como comprado.

Presentes por cotas seguem um fluxo separado:

1. O admin cadastra o presente como `quota`, informa valor total e quantidade de cotas.
2. O convidado escolhe uma ou mais cotas disponíveis.
3. O site registra a contribuição em `gift_contributions`.
4. O PIX é gerado com o valor total das cotas escolhidas.
5. O convidado informa o pagamento e os noivos confirmam depois.

Reservas, pagamentos informados, confirmações administrativas e liberações de
presentes/cotas criam eventos em `notification_events`. O admin recebe e-mail
sempre; o convidado recebe quando possui e-mail válido no RSVP. A seleção de
forma de pagamento, loja ou método de compra não dispara e-mail isoladamente.
No painel administrativo, confirmações e liberações atualizam a tabela antes de
o envio por SMTP terminar.

O admin também pode enviar lembretes manuais para reservas pendentes. Em
presentes individuais, a ação aparece quando o presente está reservado e com
pagamento pendente. Em presentes por cotas, o lembrete é enviado por
contribuição pendente, mesmo que o presente geral esteja como `Parcial`.
Os detalhes de presentes e contribuições também permitem reenviar confirmações
e avisos existentes, sempre como eventos manuais e auditáveis.

Regras de valor:

- Presentes com `purchase_mode = money`, `purchase_mode = hybrid` ou `gift_type = quota` exigem valor maior que zero.
- Presentes com `purchase_mode = external` podem ficar sem valor, pois o preço pode depender da loja ou da compra online.
- Presentes externos e híbridos podem ser cadastrados sem lojas. As lojas são sugestões opcionais, e o convidado pode informar uma compra online ou física realizada em outro local.
- Quando um presente externo não possui valor cadastrado, a página pública não exibe `R$ 0,00`.
- Pagamentos por cartão dependem de `card_payment_url` cadastrado no presente e abrem um checkout externo.
- Presentes por cotas podem aparecer como `Parcial` quando parte das cotas foi reservada, mas o total ainda não foi preenchido.

## Painel Administrativo

O admin foi repaginado com navegação lateral no desktop, ícones, agrupamentos
por área, foco automático no item ativo e experiência mobile em estilo
aplicativo, com topbar dinâmica e navbar inferior. Os cabeçalhos das páginas
administrativas seguem um padrão visual comum, com subtítulo, título, descrição
curta e detalhe ornamental discreto. As páginas de gestão usam uma abordagem
mais compacta, com filtros recolhíveis, ações discretas, tabelas otimizadas no
desktop e cards/listas no mobile quando a tabela não é a melhor experiência.

O Dashboard inicial oferece uma visão operacional com indicadores clicáveis de
pessoas confirmadas, capacidade planejada, convidados pagantes, RSVPs
pendentes, presentes informados e reservados e valor confirmado. Também resume
visualmente a distribuição dos RSVPs e a situação da lista de presentes.

A página de Indicadores concentra a análise detalhada em áreas operacionais:

- Presença: convites, pessoas planejadas, acompanhantes e respostas ao RSVP.
- Buffet: adultos e crianças pagantes, não pagantes ou sem idade válida.
- Presentes: itens disponíveis, parcialmente reservados, reservados e confirmados.
- Valores dos Presentes: totais, disponíveis, reservados, informados,
  confirmados e pendentes.

O módulo Financeiro concentra a gestão de orçamento previsto, gastos reais e
parcelas em páginas próprias. Ele permite trabalhar com os contextos Casamento,
Lua de Mel e Todos, cenários de orçamento por contexto, cenário de referência,
categorias, pagadores, vínculo opcional com fornecedores e vínculo entre gastos
reais e itens previstos. A Visão Geral destaca total previsto, contratado, pago,
em aberto, falta/estouro do orçamento, próximas parcelas e gastos recentes.
Parcelas vencidas ou vencendo no dia atual aparecem como alerta no menu e com
destaque visual na tabela de próximas parcelas.

A página de Relatórios reúne exportações de presença e buffet, Resumo Final do
Buffet, presentes e cotas, Financeiro, ações pendentes, mapa de mesas e lista
para recepção. Os arquivos tabulares
podem ser gerados em CSV ou XLSX, com seleção de colunas e modos resumido por
convite ou detalhado por pessoa, quando aplicável. A lista para recepção também
pode ser gerada em PDF paginado, em ordem alfabética ou por mesa, com campo para
marcar a chegada, destaque para pessoas confirmadas sem mesa e categoria do
buffet e restrição alimentar opcionais por pessoa. O Relatório Final do Buffet
considera somente pessoas confirmadas e possui XLSX com abas de resumo, pessoas
confirmadas, resumo por mesa e restrições alimentares. Também oferece um PDF
resumido e outro completo, com todos os confirmados ordenados por mesa, ambos
prontos para envio ao fornecedor. O
Checklist Operacional Final consolida as pendências automáticas e as tarefas não
concluídas do Checklist do Casamento em XLSX e PDF, com prioridades, prazos,
responsáveis e destaque para ações atrasadas.

Os relatórios financeiros da v4.2 incluem Orçamento Previsto, Gastos Reais e
Parcelas em CSV, XLSX e PDF. O relatório de Orçamento Previsto permite filtrar
ativos/inativos, contexto, cenário, categoria, status e situação do orçamento.
Gastos Reais pode incluir parcelas abaixo de cada gasto, e Parcelas funciona
como agenda financeira com vencimentos, pagadores e status.

O Mapa de Mesas também possui um PDF operacional nos modos Híbrido, Confirmado
e Planejado, com blocos por mesa, capacidade, ocupação, vagas, localização,
observações e pessoas. Pessoas consideradas pelo modo escolhido que ainda não
foram alocadas aparecem em um bloco destacado de Sem mesa. Nas exportações CSV
e XLSX do Mapa de Mesas, as colunas de pessoa, criança, idade, categoria do
buffet, restrição alimentar e pagante são próprias das opções detalhadas por
pessoa; os resumos por convite mantêm apenas informações do convite e da mesa.

As páginas de gestão possuem filtros e ordenação local nas tabelas principais.
Em convidados, o admin também controla se cada convite já foi enviado e se o
convite é da Noiva, do Noivo ou do Casal, com filtros dedicados, colunas na
tabela, campos no cadastro/edição e ações rápidas nos detalhes. Em RSVP, convites
de casal indicam a presença de cada membro diretamente no nome do convite,
preservando complementos cadastrados como "e Família". Em Presentes, a listagem
administrativa também indica discretamente o modo de compra cadastrado:
Dinheiro/PIX/Cartão, Compra Externa ou Híbrida.

Filtros disponíveis:

- Presentes: busca por presente, categoria ou convidado; status; pagamento; forma de presentear.
- Presentes por cotas: filtros específicos para cotas disponíveis, parcialmente reservadas, totalmente reservadas, parcialmente confirmadas e totalmente confirmadas.
- Convidados: busca por nome ou código; status; RSVP; envio do convite; tipo de convite; convidado de; mesa, com opções de com mesa, sem mesa e mesa específica.
- RSVP: busca por convidado, acompanhante ou mensagem; presença; acompanhantes; categorias do buffet; mesa, com opções de com mesa, sem mesa e mesa específica.
- Recados: busca por convidado, recado ou resposta; status; tipo de convite;
  resposta; ordenação por data, pendência ou convidado.
- Notificações: busca server-side por convidado, e-mail, presente/cota, identificadores ou motivo; status; tipo; destinatário; origem automática/manual; período; métricas calculadas sobre todo o conjunto filtrado; ordenação por data, tipo, convidado, destinatário, e-mail e status.
- Fornecedores: busca, categoria, visibilidade, destaque, ordenação e gestão
  de ordem manual.
- Programação: busca, tipo/etapa, visibilidade, ordenação e organização manual
  de etapas e atividades.
- Checklist: busca, período, categoria, responsável, status, prioridade,
  atraso e organização manual por período.
- Mesas: busca, capacidade/ocupação, tipo de ocupação, convidados com ou sem
  mesa e atalhos de atribuição a partir de RSVP/convidados.
- Financeiro - Orçamento Previsto: contexto, cenário, categoria, status,
  ativos/inativos e situação do orçamento.
- Financeiro - Gastos Reais: contexto, categoria, pagador, status, tipo de
  pagamento, fornecedor e item previsto vinculado.
- Financeiro - Parcelas: contexto, status, pagador, gasto, vencimento de/até e
  ordenação por vencimento, valor ou status.
- Financeiro - Cadastros Base: contexto e listagem completa de cenários,
  categorias e pagadores, com detalhes, criação, edição, exclusão e ordenação.

Cada tela filtrável exibe contador de resultados e botão para limpar filtros.

As colunas de dados das tabelas administrativas podem ser ordenadas pelo cabeçalho. A ordenação acontece depois dos filtros, usando os dados já carregados em memória.

A página `admin-settings.html` permite editar os dados do casamento, cerimônia,
recepção, chave PIX, nome/cidade do recebedor, WhatsApp e idade mínima em que
uma criança passa a ser pagante para o buffet.

Na mesma página, a seção de Notificações controla quais tipos de e-mail podem
gerar entregas automáticas ou manuais e se cada evento deve enviar para admin,
convidado ou ambos. A página `admin-notifications.html` concentra o histórico
auditável, com paginação server-side e filtros por status, tipo, destinatário,
origem automática/manual, período e busca por convidado, e-mail, presente,
identificadores ou motivo. O modal de detalhes permite reenviar uma entrega já
concluída, falha ou ignorada para o mesmo destinatário, registrando uma nova
tentativa manual.

Nomes dos noivos, data do casamento, prazo do RSVP, locais e horários são
armazenados no registro único de `settings`. As páginas públicas carregam os
campos permitidos pela RPC `get_public_event_settings()` e mantêm valores locais
como fallback caso a configuração remota não esteja disponível.

## Segurança Do Frontend

Todas as páginas HTML definem uma Content Security Policy para restringir as
origens de scripts, estilos, fontes, imagens, conexões e frames. O frontend
evita manipuladores e estilos inline e usa `js/security-utils.js` para validar
URLs e substituir conteúdo dinâmico com fragmentos sanitizados ou APIs do DOM.

A tabela `settings` não é lida diretamente pelo frontend. Dados de pagamento e
do evento são expostos por RPCs distintas, com colunas públicas explícitas.

As tabelas `notification_events`, `notification_deliveries` e
`notification_preferences` têm RLS habilitado e não são acessíveis diretamente
por `anon` ou `authenticated`. O envio de e-mail é feito somente pela Edge
Function `send-notifications`, com secrets SMTP mantidos no Supabase, validação
da sessão do convidado ou do admin ativo e preferências por tipo de evento. A
origem do evento fica registrada como `automatic` ou `manual`.

O Mural de Recados usa a mesma outbox: recado enviado/editado avisa o admin;
recado aprovado ou respondido avisa o convidado quando há e-mail válido no
RSVP.

## PIX e QR-Code

A lógica PIX está isolada em `js/pix.js`.

Responsabilidades:

- Normalizar textos removendo acentos.
- Montar campos EMV.
- Calcular CRC16.
- Gerar payload PIX Copia e Cola.
- Gerar URL do QR-Code via `api.qrserver.com`.

O `gifts.js` apenas chama:

```js
PixPayment.generatePayload(settings, gift);
PixPayment.getQrCodeUrl(payload);
```

## Documentação Complementar

- `docs/operations/captcha_turnstile_setup.md`: ativação, testes e rollback do Cloudflare Turnstile nos logins.
- `docs/operations/smtp_email_notifications_setup.md`: configuração SMTP, Gmail, Outlook/Hotmail, deploy e testes das notificações por e-mail.
- `docs/releases/release_v4.4.md`: notas da versão 4.4, com melhorias visuais
  e de experiência administrativa, Dashboard inicial refinado, navegação mobile
  em estilo aplicativo, cabeçalhos administrativos padronizados, filtros
  recolhíveis, cards mobile, toggles, paginação e indicadores visuais nas
  páginas de gestão.
- `docs/releases/release_v4.3.md`: notas da versão 4.3, com melhorias visuais
  da experiência pública, identidade do casal, menu público, páginas públicas,
  logins e pequenos refinamentos administrativos.
- `docs/releases/release_v4.2.md`: notas da versão 4.2, com módulo
  Financeiro, orçamento previsto, gastos reais, parcelas, cadastros base,
  alertas, relatórios e rebuild atualizado.
- `docs/releases/release_v4.1.md`: notas da versão 4.1, com restrição alimentar por pessoa do convite, e-mails e relatórios adaptados.
- `docs/releases/release_v4.0.md`: notas da versão 4.0, com páginas públicas e administração de Fornecedores, Programação, Checklist e Mesas, além de relatórios operacionais e ajustes na experiência pública de Presentes.
- `docs/releases/release_v3.7.md`: notas da versão 3.7, com página/seção de Pré-Wedding, galeria responsiva, Mural de Recados e e-mails do mural.
- `docs/releases/release_v3.6.md`: notas da versão 3.6, com reenvios manuais auditáveis.
- `docs/releases/release_v3.5.md`: notas da versão 3.5, com preferências de notificação, auditoria, filtros, busca e lembretes manuais de presentes/cotas.
- `docs/releases/release_v3.4.md`: notas da versão 3.4, com notificações por e-mail para RSVP público e presentes/cotas.
- `docs/releases/release_v3.3.md`: notas da versão 3.3, com configurações do evento, segurança do frontend, metadados e melhorias da home.
- `docs/releases/release_v3.2.md`: histórico da versão 3.2, com reforços nas operações protegidas, responsividade e formas de presentear.
- `docs/releases/release_v3.1.md`: notas da versão 3.1, com métricas do buffet, melhorias nos presentes e referências visuais.
- `docs/releases/release_v3.0.md`: histórico da versão 3.0, com a migração de segurança e os fluxos validados.
- `docs/modeling/business_flow_and_limitations.md`: fluxos de negócio, limitações e roadmap.
- `docs/modeling/database_modeling.md`: tabelas, campos e regras de banco.
- `docs/modeling/json_payload_modeling.md`: estruturas JSON usadas em RSVP e presentes.
- `docs/rebuild/README.md`: índice da reconstrução limpa em projeto Supabase novo.
- `docs/rebuild/supabase_rebuild_runbook.md`: guia principal para reconstruir banco, Auth, Edge Function, grants e RLS em um projeto Supabase novo.
- `docs/rebuild/supabase_rebuild_full_setup.sql`: setup consolidado para recriar a solução atual em um projeto Supabase vazio.
- `docs/rebuild/supabase_rebuild_verify_final.sql`: verificação final da reconstrução, das permissões, da RLS e das configurações públicas.
- `docs/rebuild/supabase_rebuild_environment_inventory.md`: inventário das configurações não secretas que devem ser reproduzidas.
- `docs/migrations/README.md`: índice dos scripts incrementais, verificações, rollbacks e arquivos legados.
- `docs/planning/release_v4.2_financial_management_plan.md`: planejamento do
  módulo Financeiro, com contextos, cenários, categorias, pagadores, orçamento,
  gastos reais, parcelas e relatórios.
- `docs/migrations/rsvp_food_restriction_per_person.sql` e
  `docs/migrations/rsvp_food_restriction_per_person_verify.sql`: migração e
  verificação da restrição alimentar por pessoa do convite.
- `docs/migrations/rsvp_food_restriction_choice.sql` e
  `docs/migrations/rsvp_food_restriction_choice_verify.sql`: ajustes de escolha
  e compatibilidade do fluxo de restrição alimentar.
- `docs/migrations/financial_management.sql` e
  `docs/migrations/financial_management_verify.sql`: criação e verificação do
  módulo Financeiro.
- `docs/migrations/financial_summary_rpc_fix.sql` e
  `docs/migrations/financial_summary_rpc_fix_verify.sql`: ajuste incremental
  da RPC de resumo financeiro.
- `docs/migrations/financial_budget_scenario_reference_guard.sql` e
  `docs/migrations/financial_budget_scenario_reference_guard_verify.sql`:
  garantia de cenário de referência por contexto.
- `docs/migrations/financial_base_ordering.sql` e
  `docs/migrations/financial_base_ordering_verify.sql`: ordenação de cenários,
  categorias e pagadores financeiros.
- `docs/migrations/financial_budget_shared_categories_fix.sql` e
  `docs/migrations/financial_budget_shared_categories_fix_verify.sql`: correção
  de categorias compartilhadas no orçamento previsto.
- `docs/migrations/financial_expense_budget_item_link.sql`: vínculo entre
  gastos reais e itens do orçamento previsto.
- `docs/migrations/vendor_financial_delete_guard.sql` e
  `docs/migrations/vendor_financial_delete_guard_verify.sql`: proteção contra
  exclusão de fornecedor vinculado a gastos financeiros.
- `docs/migrations/admin_nav_financial_overdue_payments.sql` e
  `docs/migrations/admin_nav_financial_overdue_payments_verify.sql`: alertas do
  menu administrativo para parcelas vencidas ou vencendo no dia.
- `docs/migrations/guest_invite_sent_migration.sql`: migração incremental para adicionar o controle de convite enviado aos convidados.
- `docs/migrations/guest_invite_sent_verify.sql`: verificação incremental do campo de convite enviado.
- `docs/migrations/guest_side_migration.sql`: migração incremental para classificar convidados como convidados da Noiva, do Noivo ou do Casal.
- `docs/migrations/guest_side_verify.sql`: verificação incremental do campo `guest_side` e sua constraint.
- `docs/migrations/wedding_event_settings_migration.sql` e
  `docs/migrations/wedding_event_settings_verify.sql`: migração e verificação
  das configurações globais do casamento expostas ao site público.
- `docs/migrations/buffet_paying_age_migration.sql`: ajuste da idade mínima
  pagante do buffet nas configurações.
- `docs/migrations/email_notifications_schema.sql`: migração incremental das tabelas de outbox de notificações.
- `docs/migrations/email_notifications_schema_verify.sql`: verificação incremental das tabelas e grants de notificações.
- `docs/migrations/security_admin_notification_operations.sql`: RPC administrativa para auditar notificações sem expor as tabelas diretamente.
- `docs/migrations/security_admin_notification_operations_verify.sql`: verificação da RPC administrativa de notificações.
- `docs/migrations/gift_email_notifications.sql`: migração incremental para criar eventos de e-mail em reservas, pagamentos, confirmações e liberações de presentes/cotas.
- `docs/migrations/gift_email_notifications_verify.sql`: verificação incremental dos eventos de e-mail de presentes/cotas.
- `docs/migrations/notification_preferences.sql`: migração incremental das preferências por tipo de notificação.
- `docs/migrations/notification_preferences_verify.sql`: verificação incremental das preferências de notificação.
- `docs/migrations/security_admin_notification_preferences.sql`: RPCs administrativas para listar e atualizar preferências de notificação.
- `docs/migrations/security_admin_notification_preferences_verify.sql`: verificação das RPCs administrativas de preferências.
- `docs/migrations/manual_notification_reminders.sql`: migração incremental para origem automática/manual, filtro por origem e lembretes manuais de reservas pendentes.
- `docs/migrations/manual_notification_reminders_verify.sql`: verificação incremental dos lembretes manuais.
- `docs/migrations/manual_notification_resends.sql`: migração incremental para reenvio manual de notificações já existentes e criação manual de eventos por contexto.
- `docs/migrations/manual_notification_resends_verify.sql`: verificação incremental dos reenvios manuais.
- `docs/migrations/notification_delivery_sorting.sql`: migração incremental para ordenar o histórico de notificações por colunas úteis.
- `docs/migrations/notification_delivery_sorting_verify.sql`: verificação incremental da RPC de notificações com ordenação.
- `docs/migrations/notification_delivery_summary.sql`: migração incremental para calcular métricas de notificações sobre todo o conjunto filtrado.
- `docs/migrations/notification_delivery_summary_verify.sql`: verificação incremental da RPC de resumo das métricas de notificações.
- `docs/migrations/admin_nav_alerts.sql`: migração incremental dos alertas compactos do menu administrativo para Recados e Presentes.
- `docs/migrations/admin_nav_alerts_verify.sql`: verificação incremental da RPC de alertas do menu administrativo.
- `docs/migrations/wedding_vendors.sql`: migração incremental da tabela e RPCs de Fornecedores.
- `docs/migrations/wedding_vendors_verify.sql`: verificação incremental da tabela, RLS e permissões de Fornecedores.
- `docs/migrations/wedding_schedule.sql`: migração incremental das tabelas e RPCs da Programação.
- `docs/migrations/wedding_schedule_verify.sql`: verificação incremental das tabelas, RLS e permissões da Programação.
- `docs/migrations/wedding_checklist.sql`: migração incremental das tabelas, seeds e RPCs do Checklist.
- `docs/migrations/wedding_checklist_verify.sql`: verificação incremental das tabelas, RLS, seeds e RPCs do Checklist.
- `docs/migrations/wedding_tables.sql`: migração incremental das tabelas e RPCs administrativas de Mesas.
- `docs/migrations/wedding_tables_verify.sql`: verificação incremental das tabelas, RLS e permissões de Mesas.
- `docs/migrations/wall_messages.sql`: migração incremental do Mural de Recados, com envio do convidado, listagem pública aprovada e moderação administrativa.
- `docs/migrations/wall_messages_verify.sql`: verificação incremental da tabela, RLS, grants e RPCs do Mural de Recados.
- `docs/migrations/wall_message_email_notifications.sql`: migração incremental dos eventos de e-mail do Mural de Recados.
- `docs/migrations/wall_message_email_notifications_verify.sql`: verificação incremental dos eventos de e-mail do Mural de Recados.
- `docs/operations/supabase_data_cleanup_runbook.md`: limpeza segura dos dados de teste, preservando administrador e configurações.

Os demais SQLs em `docs/migrations/` são mantidos como histórico de migrações,
verificações pontuais ou rollbacks. Para recriar a solução do zero, use o
runbook e o setup consolidado.

## Status Atual

Concluído:

- Autenticação por convite.
- RSVP individual e casal.
- Cadastro e gestão de acompanhantes.
- Idade das crianças padronizada até 12 anos e regra configurável de idade pagante do buffet.
- Lista de presentes.
- Seção da lista de presentes na página inicial.
- Página e seção de Pré-Wedding com galeria responsiva e lightbox.
- Mural de Recados com página pública, envio/edição pelo convidado logado,
  prévia na página inicial, aprovação, ocultação, resposta dos noivos, remoção
  de resposta e exclusão no painel administrativo.
- Fornecedores com página pública, cadastro administrativo, controle de
  visibilidade, destaque, organização manual da ordem e estado vazio amigável.
- Programação do casamento com página protegida para convidados, cadastro
  administrativo de etapas e atividades, visibilidade, filtros e organização
  manual da ordem.
- Checklist do casamento no painel administrativo, com tarefas padrão
  organizadas de 12 meses antes até depois do casamento, categorias e
  responsáveis editáveis, ações rápidas por período, organização manual por
  período, alerta de tarefas atrasadas no menu e exportação CSV filtrada.
- Acompanhamento de presentes do convite com ações pendentes.
- Dica pública para completar o e-mail do RSVP antes de reservar presentes.
- PIX com QR-Code e copia e cola.
- Presentes por cotas com contribuições via PIX.
- Cartão via checkout externo e compras externas.
- Painel administrativo repaginado com navegação lateral desktop, navbar
  inferior mobile em estilo aplicativo, topbar dinâmica e páginas especializadas.
- Dashboard operacional refinado com indicadores clicáveis, resumos visuais,
  atalhos para pendências e cabeçalhos administrativos padronizados.
- Página de Indicadores com análises detalhadas de presença, buffet, presentes e financeiro.
- Dashboard administrativo com gráfico de distribuição de RSVPs.
- Dashboard com convidados pagantes, total de crianças, crianças pagantes, não pagantes e sem idade válida.
- Atalhos nas métricas do Dashboard com filtros administrativos aplicados.
- Dashboard financeiro com valores da lista, reservados, disponíveis, informados, confirmados e pendentes, incluindo gráficos de distribuição.
- Filtros administrativos com ordenação, contadores e limpeza.
- Alertas compactos no menu administrativo para indicar recados pendentes e
  presentes/cotas com pagamento informado.
- Exportação CSV de convidados, RSVPs e presentes respeitando filtros e ordenação atuais, incluindo convite enviado e convidado de.
- Página de Relatórios Consolidados de presença/buffet, Relatório Final do Buffet, financeiro, ações pendentes, mapa de mesas, lista para recepção e Checklist Operacional Final, com CSV/XLSX, seleção de colunas e PDFs operacionais. O relatório do buffet usa somente confirmados, consolida totais por categoria, pessoas, mesas e restrições alimentares e sinaliza RSVPs pendentes e confirmados sem mesa; as ações pendentes auditam convites e RSVPs, confirmados sem mesa, capacidade e uso das mesas, crianças sem idade, reservas e pagamentos; no checklist final, é possível gerar tudo consolidado, somente essas pendências automáticas ou somente as tarefas não concluídas do Checklist do Casamento.
- Módulo Financeiro administrativo com Visão Geral, Orçamento Previsto, Gastos
  Reais, Parcelas, Cadastros Base, vínculos entre gasto e item previsto,
  alertas de parcelas vencidas/vencendo no dia e relatórios CSV/XLSX/PDF.
- Login e proteção das páginas administrativas com Supabase Auth.
- Criação administrativa de convidados com código de convite gerado no banco.
- Controle de convites enviados no cadastro de convidados, detalhes, filtros e exportações.
- Confirmação e liberação de presentes e cotas processadas atomicamente no banco.
- RSVPs administrativos salvos e removidos atomicamente no banco.
- RSVP dos convidados validado contra os dados oficiais do convite.
- Pagamentos e compras informados somente após uma forma compatível ser selecionada.
- Edição e ativação de convidados protegidas no banco, com revogação de sessões ao desativar.
- Catálogo de presentes validado no banco, incluindo valores, cotas e opções externas.
- Dados do casamento e configurações de PIX, WhatsApp e buffet validados e mantidos em registro único.
- Metadados de SEO e compartilhamento social na página inicial.
- Content Security Policy e tratamento seguro do conteúdo HTML dinâmico.
- Login seguro dos convidados por código, com sessão anônima e Edge Function.
- Notificações por e-mail para RSVP público, reservas, pagamentos,
  confirmações e liberações de presentes/cotas e Mural de Recados, com e-mail
  para admin e convidado quando disponível.
- Preferências de notificação por evento, histórico auditável, busca
  server-side e lembretes manuais para reservas pendentes de presentes/cotas.
- Reenvio manual de RSVP, reservas, pagamentos e confirmações a partir dos
  painéis administrativos ou do histórico de notificações.
- Outbox de notificações com idempotência por evento/destinatário e tabelas protegidas por RLS.
- Cloudflare Turnstile validado pelo Supabase Auth nos dois fluxos de login.
- Row Level Security para isolamento dos dados de convidados e administradores.
- Helpers comuns para admin e páginas públicas.
- Referências visuais responsivas nas páginas públicas.
- Tokens globais de CSS.
- Identidade visual pública da v4.3, com logo do casal, heros com tipografia
  romântica, roxo principal atualizado, menu público agrupado no desktop,
  rodapés públicos com logo clicável e refinamentos mobile/desktop em Home,
  RSVP, Presentes, Nossa História, Pré-Wedding, Recados, Programação e
  Fornecedores.

Em aberto:

- Limpeza periódica de contas anônimas e registros de tentativas.
- Avaliar empacotamento local de dependências carregadas por CDN, exceto serviços externos obrigatórios como Cloudflare Turnstile.
- Rotação dos códigos de convite antes da publicação definitiva.
- Upload interno de comprovantes.
- Relatórios avançados por período ou fornecedor.
- Indicadores financeiros avançados por período ou forma de pagamento.
- Adicionar ou substituir as fotos oficiais do Pré-Wedding após o ensaio.
- Código de Vestimenta.
