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
- Página de Relatórios com exportações CSV/XLSX, seleção de colunas e opções resumidas ou detalhadas para a lista de confirmados.
- Referências visuais personalizadas nos logins e nas páginas públicas, adaptadas para desktop e mobile.
- Textos de saudação, reserva e pagamento adaptados para convites individuais e de casal.
- Login administrativo com e-mail e senha pelo Supabase Auth.
- Geração segura dos códigos de convite no Supabase, restrita a administradores.
- Confirmação e liberação administrativa de presentes e cotas por RPCs transacionais.
- Criação, atualização e remoção administrativa de RSVPs por RPCs transacionais.
- RSVP público validado no banco com membros, acompanhantes e idades padronizadas.
- Formas de presentear e confirmações de pagamento validadas no banco.
- Edição, ativação e desativação de convidados por RPCs com controle de sessões.
- Cadastro, edição e exclusão de presentes por RPCs com validação financeira.
- Configurações globais validadas e salvas como registro único por RPC.
- Configurações públicas expostas por RPC com colunas fixas, sem leitura direta da tabela pelo frontend.
- Nomes, datas, prazo do RSVP, cerimônia e recepção configuráveis pelo painel e reutilizados nas páginas públicas.
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
- `admin-indicators.html`: métricas e gráficos detalhados do casamento.
- `admin-reports.html`: relatórios consolidados e exportações CSV/XLSX.
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
- `js/event-settings.js`: carrega e aplica nomes, datas e locais do casamento nas páginas públicas.
- `js/admin-common.js`: comportamento comum das páginas administrativas.
- `js/pix.js`: geração pura do payload PIX, CRC16 e URL do QR Code.
- `js/gifts.js`: fluxo da lista de presentes, reserva, cotas, escolha da forma de presentear e confirmação de pagamento/compra.
- `js/rsvp.js`: fluxo de confirmação de presença.
- `js/admin-dashboard.js`: métricas detalhadas da página de Indicadores.
- `js/admin-dashboard-charts.js`: renderização dos gráficos de Indicadores.
- `js/admin-overview.js`: visão resumida e acionável do Dashboard inicial.
- `js/admin-dashboard-reports.js`: geração dos relatórios consolidados exportáveis.
- `js/admin-reports.js`: carregamento dos dados da página de relatórios.
- `js/buffet-metrics.js`: classificação compartilhada de adultos, crianças pagantes, não pagantes e sem idade válida.
- `js/admin-export.js`: geração e download de CSV/XLSX nas páginas administrativas.
- `js/admin-gifts.js`: CRUD, filtros, ordenação, cotas e administração de presentes.
- `js/admin-guests.js`: CRUD, filtros, ordenação de convidados e RSVP manual.
- `js/admin-rsvps.js`: listagem, filtros, ordenação e remoção de RSVPs.
- `js/admin-settings.js`: edição dos dados do casamento, PIX, WhatsApp e regra do buffet.

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
- Presentes externos e híbridos podem ser cadastrados sem lojas. As lojas são sugestões opcionais, e o convidado pode informar uma compra online ou física realizada em outro local.
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

A página `admin-settings.html` permite editar os dados do casamento, cerimônia,
recepção, chave PIX, nome/cidade do recebedor, WhatsApp e idade mínima em que
uma criança passa a ser pagante para o buffet.

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

- `docs/captcha_turnstile_setup.md`: ativação, testes e rollback do Cloudflare Turnstile nos logins.
- `docs/release_v3.1.md`: notas da versão 3.1, com métricas do buffet, melhorias nos presentes e referências visuais.
- `docs/release_v3.0.md`: histórico da versão 3.0, com a migração de segurança e os fluxos validados.
- `docs/business_flow_and_limitations.md`: fluxos de negócio, limitações e roadmap.
- `docs/database_modeling.md`: tabelas, campos e regras de banco.
- `docs/json_payload_modeling.md`: estruturas JSON usadas em RSVP e presentes.
- `docs/supabase_rebuild_runbook.md`: guia principal para reconstruir banco, Auth, Edge Function, grants e RLS em um projeto Supabase novo.
- `docs/supabase_rebuild_01_base_schema.sql`: estrutura base fechada das tabelas da aplicação.
- `docs/buffet_paying_age_migration.sql`: adiciona a regra do buffet em projetos Supabase já existentes.
- `docs/security_invite_code_generation.sql`: instala a criação administrativa de convidados com código seguro gerado no Supabase.
- `docs/security_invite_code_generation_verify.sql`: verifica a RPC e suas permissões de execução.
- `docs/security_invite_code_generation_rollback.sql`: remove a RPC de criação segura, após reversão compatível do frontend.
- `docs/security_admin_gift_operations.sql`: instala as ações administrativas transacionais de presentes e cotas.
- `docs/security_admin_gift_operations_verify.sql`: verifica as RPCs administrativas e o bloqueio de gravações diretas nas contribuições.
- `docs/security_admin_gift_operations_rollback.sql`: restaura temporariamente as gravações administrativas diretas.
- `docs/security_admin_rsvp_operations.sql`: instala as operações administrativas validadas e atômicas de RSVP.
- `docs/security_admin_rsvp_operations_verify.sql`: verifica as RPCs administrativas e o bloqueio de gravações diretas em RSVPs.
- `docs/security_admin_rsvp_operations_rollback.sql`: restaura temporariamente as gravações administrativas diretas em RSVPs.
- `docs/security_admin_guest_operations.sql`: instala edição e controle de acesso dos convidados por RPCs.
- `docs/security_admin_guest_operations_verify.sql`: verifica as RPCs e o bloqueio de gravações diretas em convidados.
- `docs/security_admin_guest_operations_rollback.sql`: restaura temporariamente as gravações administrativas diretas em convidados.
- `docs/security_remove_legacy_guest_admin_flag.sql`: remove `guests.is_admin` de projetos existentes após a atualização das RPCs; a autorização permanece em `admin_users`.
- `docs/security_admin_gift_catalog_operations.sql`: instala o CRUD validado do catálogo de presentes.
- `docs/security_admin_gift_catalog_operations_verify.sql`: verifica as RPCs e o bloqueio de gravações diretas em presentes.
- `docs/security_admin_gift_catalog_operations_rollback.sql`: restaura temporariamente as gravações administrativas diretas em presentes.
- `docs/security_admin_settings_operations.sql`: instala o salvamento validado e único das configurações globais.
- `docs/security_admin_settings_operations_verify.sql`: verifica a RPC, o registro único e o bloqueio de gravações diretas.
- `docs/security_admin_settings_operations_rollback.sql`: restaura temporariamente as gravações administrativas diretas em configurações.
- `docs/security_public_settings_access.sql`: restringe a leitura das configurações a uma RPC com campos públicos explícitos.
- `docs/security_public_settings_access_verify.sql`: verifica a RPC pública e o bloqueio de leitura direta da tabela.
- `docs/security_public_settings_access_rollback.sql`: restaura temporariamente a leitura direta de configurações.
- `docs/wedding_event_settings_migration.sql`: adiciona os dados estruturados do casamento em projetos existentes.
- `docs/wedding_event_settings_verify.sql`: verifica as colunas e o preenchimento dos dados do evento.
- `docs/security_guest_rsvp_validation.sql`: reforça a validação do RSVP enviado pelos convidados.
- `docs/security_guest_rsvp_validation_verify.sql`: verifica permissões e bloqueio de gravações diretas do RSVP.
- `docs/security_guest_gift_payment_validation.sql`: valida a compatibilidade das formas de presentear e exige seleção antes da confirmação.
- `docs/security_guest_gift_payment_validation_verify.sql`: verifica as RPCs públicas de pagamento e suas permissões.
- `docs/supabase_rebuild_environment_inventory.md`: inventário das configurações não secretas que devem ser reproduzidas.
- `docs/supabase_rebuild_verify_final.sql`: verificação final da reconstrução e das permissões.
- `docs/supabase_data_cleanup_runbook.md`: limpeza segura dos dados de teste, preservando administrador e configurações.
- `docs/supabase_schema_full_setup.sql`: setup legado anterior à migração de segurança; não usar na reconstrução atual.
- `docs/security_migration_plan.md`: plano gradual para Supabase Auth, RLS e Edge Functions.
- `docs/security_admin_setup_runbook.md`: guia reproduzível de toda a configuração administrativa realizada.
- `docs/security_phase_2_prepare.sql`: estruturas preparatórias da nova autenticação, sem alterar o acesso atual.
- `docs/security_phase_2_verify.sql`: verificações da estrutura e das permissões preparatórias.
- `docs/security_phase_2_rollback.sql`: rollback da preparação enquanto a nova autenticação ainda não estiver em uso.
- `docs/security_admin_authenticated_access.sql`: acesso transitório do painel autenticado às tabelas atuais.
- `docs/security_admin_authenticated_access_verify.sql`: verificação das permissões transitórias do painel.
- `docs/security_phase_3_claim_invite_runbook.md`: preparação e deploy seguro da Edge Function de convite.
- `docs/security_phase_3_claim_invite_prepare.sql`: tabela de tentativas e função atômica de registro de acesso.
- `docs/security_phase_3_claim_invite_verify.sql`: verificações da estrutura da Edge Function.
- `docs/security_phase_3_claim_invite_rollback.sql`: rollback da estrutura da Edge Function.
- `docs/security_phase_3_claim_invite_smoke_test.md`: roteiro de testes após o deploy da função.
- `docs/security_edge_function_service_role_grants.sql`: privilégios internos necessários para a Edge Function.
- `docs/security_edge_function_service_role_grants_verify.sql`: verificação dos privilégios da `service_role`.
- `docs/security_phase_4_rls_runbook.md`: guia de preparação, corte e rollback da RLS definitiva.
- `docs/security_phase_4_rls_prepare.sql`: políticas, RPCs e triggers criados sem ativar RLS.
- `docs/security_phase_4_rls_verify_prepare.sql`: verificação segura da preparação da RLS.
- `docs/security_phase_4_rls_activate.sql`: ativação da RLS para o corte definitivo.
- `docs/security_phase_4_rls_verify_active.sql`: verificação posterior à ativação.
- `docs/security_phase_4_rls_activation_rollback.sql`: rollback emergencial para o acesso legado.
- `docs/security_phase_4_rls_prepare_rollback.sql`: remoção da preparação antes do corte.
- `docs/security_phase_5_frontend_cutover.md`: migração do frontend público e roteiro do corte definitivo.
- `docs/security_fix_guest_gift_rpcs.sql`: correção dos RPCs de reserva individual e forma de presentear.

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
- Página de Relatórios Consolidados de presença/buffet, financeiro e pendências, com CSV/XLSX, seleção de colunas, categorias de pagamento e regra aplicada.
- Login e proteção das páginas administrativas com Supabase Auth.
- Criação administrativa de convidados com código de convite gerado no banco.
- Confirmação e liberação de presentes e cotas processadas atomicamente no banco.
- RSVPs administrativos salvos e removidos atomicamente no banco.
- RSVP dos convidados validado contra os dados oficiais do convite.
- Pagamentos e compras informados somente após uma forma compatível ser selecionada.
- Edição e ativação de convidados protegidas no banco, com revogação de sessões ao desativar.
- Catálogo de presentes validado no banco, incluindo valores, cotas e opções externas.
- Configurações de PIX, WhatsApp e buffet validadas e mantidas em registro único.
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
