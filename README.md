# Site de Casamento - Livia & Messias

Site de casamento personalizado para centralizar informações do evento, RSVP, lista de presentes e administração dos noivos.

## Desenvolvimento

Desenvolvido por **Messias D. P. de M. Filho**.

GitHub: [messiasfl10](https://github.com/messiasfl10/)

## Funcionalidades

- Acesso por código de convite.
- RSVP individual e para convites de casal.
- Cadastro de acompanhantes, crianças e restrições alimentares.
- Idade das crianças padronizada conforme a data do casamento.
- Regra configurável de idade mínima pagante para o buffet.
- Lista de presentes com reserva.
- Presentes por cotas para contribuições financeiras via PIX.
- Área de acompanhamento dos presentes do convite que ainda possuem ações pendentes.
- Formas de presentear por PIX, cartão via checkout externo, compra online e loja física.
- QR Code e PIX Copia e Cola gerados no frontend.
- Envio de comprovante via WhatsApp.
- Confirmação antes de reservar presentes ou informar pagamentos e compras.
- Painel administrativo separado por áreas.
- Dashboard com distinção entre convites e pessoas, capacidade planejada, métricas de convidados pagantes e crianças do buffet, presentes e financeiro, incluindo gráficos de distribuição e atalhos com filtros aplicados.
- Filtros, ordenação, contadores de resultado e limpeza de filtros no admin.
- Exportação CSV de convidados, RSVPs e presentes respeitando filtros e ordenação atuais, incluindo totais planejados de convidados e acompanhantes.
- Relatórios consolidados no dashboard com CSV/XLSX, seleção de colunas e opções resumidas ou detalhadas para a lista de confirmados.
- Referências visuais personalizadas nos logins e nas páginas públicas, adaptadas para desktop e mobile.
- Textos de saudação, reserva e pagamento adaptados para convites individuais e de casal.
- Login administrativo com e-mail e senha pelo Supabase Auth.
- Login seguro dos convidados com sessão anônima e Edge Function.
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

- `index.html`: página inicial, informações do casamento e contagem regressiva.
- `our-story.html`: linha do tempo da história do casal.
- `login.html`: entrada por código de convite.
- `rsvp.html`: confirmação de presença.
- `gifts.html`: lista de presentes e fluxo de reserva/pagamento.

### Administrativas

O antigo painel único foi dividido em páginas dedicadas:

- `admin-login.html`: acesso administrativo com e-mail e senha pelo Supabase Auth.
- `admin-dashboard.html`: resumo geral do casamento.
- `admin-gifts.html`: gestão de presentes.
- `admin-guests.html`: gestão de convidados e RSVP manual.
- `admin-rsvps.html`: consulta e remoção de confirmações.
- `admin-settings.html`: configuração de PIX, WhatsApp e idade mínima pagante do buffet.

Todas as páginas administrativas passam por `js/admin-bootstrap.js`, que
confirma a sessão do Supabase Auth e a função `is_admin()` antes de carregar a
lógica da tela. `js/admin-common.js` concentra logout, toast, formatação de
datas e atualização de textos simples.

## Organização Dos Scripts

- `js/supabase.js`: configuração do cliente Supabase.
- `js/auth.js`: implementação legada de sessão local, mantida apenas como referência e fallback controlado.
- `js/guest-auth-config.js`: configuração do modo de autenticação dos convidados, atualmente em `supabase`.
- `js/guest-auth.js`: sessão, login por convite e logout dos convidados.
- `js/guest-data.js`: operações de RSVP e presentes em modo legado ou por RPCs.
- `js/guest-bootstrap.js`: validação do convidado antes de carregar páginas protegidas.
- `js/admin-login.js`: login administrativo com e-mail e senha.
- `js/admin-bootstrap.js`: proteção e carregamento das páginas administrativas.
- `js/public-common.js`: comportamento comum das páginas públicas autenticadas, como navbar, logout e saudação do convidado.
- `js/captcha-config.js`: ativação e Site Key pública do Cloudflare Turnstile.
- `js/turnstile-captcha.js`: carregamento, token, expiração e reset do CAPTCHA compartilhado pelos logins.
- `js/reference-decorations.js`: referências visuais aleatórias dos logins, laterais desktop e divisores mobile.
- `js/child-age-options.js`: opções padronizadas para informar a idade das crianças na data do casamento.
- `js/admin-common.js`: comportamento comum das páginas administrativas.
- `js/pix.js`: geração pura do payload PIX, CRC16 e URL do QR Code.
- `js/gifts.js`: fluxo da lista de presentes, reserva, cotas, escolha da forma de presentear e confirmação de pagamento/compra.
- `js/rsvp.js`: fluxo de confirmação de presença.
- `js/admin-dashboard.js`: métricas do dashboard.
- `js/admin-dashboard-charts.js`: renderização dos gráficos do dashboard.
- `js/admin-dashboard-reports.js`: relatórios consolidados exportáveis do dashboard.
- `js/buffet-metrics.js`: classificação compartilhada de adultos, crianças pagantes, não pagantes e sem idade válida.
- `js/admin-export.js`: geração e download de CSV/XLSX nas páginas administrativas.
- `js/admin-gifts.js`: CRUD, filtros, ordenação, cotas e administração de presentes.
- `js/admin-guests.js`: CRUD, filtros, ordenação de convidados e RSVP manual.
- `js/admin-rsvps.js`: listagem, filtros, ordenação e remoção de RSVPs.
- `js/admin-settings.js`: edição das configurações globais de PIX, WhatsApp e regra do buffet.

## Organização Dos CSSs

- `css/tokens.css`: tokens globais de cores, fontes, raios, sombras e espaçamentos.
- `css/style.css`: estilos base e página inicial.
- `css/login.css`: tela de login.
- `css/rsvp.css`: página de RSVP.
- `css/gifts.css`: lista de presentes e modais de pagamento.
- `css/story.css`: página Nossa História.
- `css/admin.css`: todas as páginas administrativas.

Os CSSs foram padronizados para usar tokens globais sempre que possível. Os HTMLs também evitam estilos inline; classes utilitárias como `is-hidden` são usadas para estados iniciais simples.

## Organização Dos Assets

As imagens do site ficam organizadas por contexto em `assets/images/`:

- `home/`: capa da página inicial e fotos da cerimônia e da recepção.
- `our-story/`: capa e fotos dos carrosséis da página Nossa História.
- `login-references/`: referências visuais usadas nos logins e nas decorações das páginas públicas.

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
Ele não representa o fluxo ativo da versão 3.1.

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
- Informar e-mail, telefone, restrição alimentar e mensagem.
- Adicionar acompanhantes dentro do limite do convite.
- Confirmar membros de convite de casal individualmente.

Os dados completos ficam em `rsvps.guest_data`, permitindo preservar membros do casal e acompanhantes em JSON.

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

Regras de valor:

- Presentes com `purchase_mode = money`, `purchase_mode = hybrid` ou `gift_type = quota` exigem valor maior que zero.
- Presentes com `purchase_mode = external` podem ficar sem valor, pois o preço pode depender da loja ou da compra online.
- Quando um presente externo não possui valor cadastrado, a página pública não exibe `R$ 0,00`.
- Pagamentos por cartão dependem de `card_payment_url` cadastrado no presente e abrem um checkout externo.
- Presentes por cotas podem aparecer como `Parcial` quando parte das cotas foi reservada, mas o total ainda não foi preenchido.

## Painel Administrativo

O admin foi separado em páginas especializadas e possui filtros e ordenação local nas tabelas principais.

Filtros disponíveis:

- Presentes: busca por presente, categoria ou convidado; status; pagamento; forma de presentear.
- Presentes por cotas: filtros específicos para cotas disponíveis, parcialmente reservadas, totalmente reservadas, parcialmente confirmadas e totalmente confirmadas.
- Convidados: busca por nome ou código; status; RSVP; tipo de convite; administrador.
- RSVP: busca por convidado, acompanhante ou mensagem; presença; acompanhantes; categorias do buffet.

Cada tela filtrável exibe contador de resultados e botão para limpar filtros.

As colunas de dados das tabelas administrativas podem ser ordenadas pelo cabeçalho. A ordenação acontece depois dos filtros, usando os dados já carregados em memória.

A página `admin-settings.html` permite editar a chave PIX, nome/cidade do recebedor, WhatsApp e idade mínima em que uma criança passa a ser pagante para o buffet.

## PIX E QR Code

A lógica PIX está isolada em `js/pix.js`.

Responsabilidades:

- Normalizar textos removendo acentos.
- Montar campos EMV.
- Calcular CRC16.
- Gerar payload PIX Copia e Cola.
- Gerar URL do QR Code via `api.qrserver.com`.

O `gifts.js` apenas chama:

```js
PixPayment.generatePayload(settings, gift);
PixPayment.getQrCodeUrl(payload);
```

## Documentação Complementar

- `docs/release_v3.1.md`: notas da versão 3.1, com métricas do buffet, melhorias nos presentes e referências visuais.

## Status Atual

Concluído:

- Autenticação por convite.
- RSVP individual e casal.
- Cadastro e gestão de acompanhantes.
- Idade das crianças padronizada e regra configurável de idade pagante do buffet.
- Lista de presentes.
- Acompanhamento de presentes do convite com ações pendentes.
- PIX com QR Code e copia e cola.
- Presentes por cotas com contribuições via PIX.
- Cartão via checkout externo e compras externas.
- Painel administrativo separado por seções.
- Dashboard administrativo com gráfico de distribuição de RSVPs.
- Dashboard com convidados pagantes, total de crianças, crianças pagantes, não pagantes e sem idade válida.
- Atalhos nas métricas do Dashboard com filtros administrativos aplicados.
- Dashboard financeiro com valores da lista, reservados, disponíveis, informados, confirmados e pendentes, incluindo gráficos de distribuição.
- Filtros administrativos com ordenação, contadores e limpeza.
- Exportação CSV de convidados, RSVPs e presentes respeitando filtros e ordenação atuais.
- Relatórios consolidados de presença/buffet, financeiro e pendências no dashboard, com CSV/XLSX, seleção de colunas, categorias de pagamento e regra aplicada.
- Login e proteção das páginas administrativas com Supabase Auth.
- Login seguro dos convidados por código, com sessão anônima e Edge Function.
- Cloudflare Turnstile validado pelo Supabase Auth nos dois fluxos de login.
- Row Level Security para isolamento dos dados de convidados e administradores.
- Helpers comuns para admin e páginas públicas.
- Referências visuais responsivas nas páginas públicas.
- Tokens globais de CSS.

Em aberto:

- Limpeza periódica de contas anônimas e registros de tentativas.
- Revisão de Content Security Policy, dependências CDN e usos de `innerHTML`.
- Rotação dos códigos de convite antes da publicação definitiva.
- Upload interno de comprovantes.
- Relatórios avançados por período ou fornecedor.
- Indicadores financeiros avançados por período ou forma de pagamento.
