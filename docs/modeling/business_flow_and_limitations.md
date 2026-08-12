# Fluxos de Negócio e Limitações

Este documento descreve os principais fluxos implementados no projeto e as limitações conhecidas.

## Arquitetura Atual Do Frontend

O projeto é uma aplicação HTML/CSS/JavaScript Vanilla integrada diretamente ao Supabase.

Páginas públicas:

- `index.html`
- `our-story.html`
- `login.html`
- `rsvp.html`
- `gifts.html`

Páginas administrativas:

- `admin-dashboard.html`
- `admin-indicators.html`
- `admin-reports.html`
- `admin-gifts.html`
- `admin-guests.html`
- `admin-rsvps.html`
- `admin-settings.html`

Scripts compartilhados:

- `auth.js`: sessão local e validação do código de convite.
- `public-common.js`: navbar, logout e saudação das páginas públicas autenticadas.
- `admin-common.js`: autenticação admin, logout, toast, utilitários do painel,
  navegação administrativa responsiva, alertas compactos do menu e cabeçalhos
  padronizados.
- `pix.js`: geração de payload PIX e URL de QR-Code.

CSS compartilhado:

- `tokens.css`: tokens globais de cores, fontes, sombras, raios e espaçamentos.

## Fluxo De Autenticação

O frontend público está preparado para dois modos.

Modo atual `legacy`:

1. O convidado acessa `login.html`.
2. Informa o código de convite.
3. O frontend consulta `guests.invite_code`.
4. A sessão é salva no `localStorage`.

Modo preparado `supabase`:

1. O Supabase Auth cria uma sessão anônima.
2. `claim-invite` valida o código.
3. `guest_access_sessions` vincula a sessão ao convite.
4. `guest-bootstrap.js` carrega a página após obter o perfil.
5. RSVP e presentes usam RLS e RPCs restritas.

A mudança de modo será feita somente durante o corte definitivo da RLS.

Páginas administrativas usam um fluxo separado:

```text
e-mail e senha
-> Supabase Auth
-> public.is_admin()
-> carregamento da página administrativa
```

Sem uma sessão administrativa válida, o usuário é redirecionado para
`admin-login.html`. A autorização é definida exclusivamente pelo vínculo ativo
em `admin_users`; o cadastro de convidados não concede privilégios
administrativos.

## Fluxo RSVP Individual

1. O convidado acessa `rsvp.html`.
2. O sistema preenche o nome do convite.
3. O convidado escolhe `Sim` ou `Não`.
4. Pode informar e-mail, telefone, se o convidado principal possui restrição
   alimentar e mensagem. Quando marca `Sim` para restrição alimentar, o campo
   de detalhe é liberado.
5. Se houver acompanhantes disponíveis, o sistema exibe a quantidade permitida.
6. Para cada acompanhante, são informados nome, se é criança, restrição
   alimentar individual e, quando aplicável, a idade que terá na data do
   casamento.
7. A idade da criança é selecionada em uma lista padronizada de
   `Menos de 1 ano` até `12 anos`, evitando respostas livres inconsistentes.
8. O RSVP é criado ou atualizado na tabela `rsvps`.
9. O campo `guests.confirmed` é atualizado.
10. Se já existir RSVP para o convite, o fluxo atualiza o registro existente em vez de criar outro.

## Fluxo RSVP Casal

1. O sistema lê `guests.couple_members`.
2. Cada membro do casal responde presença e restrição alimentar
   individualmente.
3. O RSVP geral fica como `Sim` se pelo menos um membro comparecer.
4. Se todos responderem `Não`, o RSVP geral fica como `Não`.
5. O dashboard considera membros confirmados, acompanhantes e total esperado.

## Fluxo De Reserva De Presente

1. O convidado acessa `gifts.html`.
2. Escolhe um presente disponível.
3. Opcionalmente deixa uma mensagem.
4. O presente recebe:

```text
status = Reservado
reserved_guest_id = guest.id
reserved_name = guest.name
payment_status = Pendente
```

5. O sistema abre a escolha da forma de presentear.
6. Se o convidado tiver presentes reservados sem forma de presentear ou confirmação de pagamento/compra, `gifts.html` exibe um atalho no topo da lista.

## Fluxo De Presentes Por Cotas

Presentes por cotas são usados apenas para contribuições financeiras via PIX.

1. O admin cadastra o presente com `gift_type = quota`.
2. O admin informa valor total e quantidade de cotas.
3. O sistema calcula `quota_value`.
4. O convidado escolhe uma ou mais cotas disponíveis.
5. O sistema cria uma contribuição em `gift_contributions`.
6. O PIX é gerado usando `gift_contributions.total_value`.
7. O convidado informa o pagamento da contribuição.

Atualização:

```text
gift_contributions.payment_status = Informado
gift_contributions.payment_reported_at = data atual
```

Presentes por cotas não usam `gifts.reserved_guest_id`, porque vários convidados podem contribuir para o mesmo presente.

O status agregado do presente por cotas é sincronizado a partir das contribuições:

```text
sem cotas reservadas -> Disponível
cotas parcialmente reservadas -> Parcial
todas as cotas reservadas -> Reservado
todas as cotas confirmadas -> Comprado
```

O `payment_status` agregado também pode assumir estados parciais:

```text
Pendente
Parcialmente informado
Parcialmente confirmado
Confirmado
```

## Formas De Presentear

As opções exibidas dependem de `gifts.purchase_mode`.

Valores possíveis:

```text
money
external
hybrid
```

Regras de valor:

- `money`: exige valor maior que zero, pois gera pagamento financeiro interno.
- `external`: valor opcional; quando não informado, a página pública não mostra preço.
- `hybrid`: exige valor maior que zero, pois o convidado pode escolher PIX/cartão.
- `quota`: exige valor total maior que zero e quantidade de cotas maior que zero.

### PIX

1. O convidado seleciona PIX.
2. `gifts.selected_purchase_method` recebe `pix`.
3. `pix.js` gera o payload PIX.
4. `pix.js` gera a URL do QR-Code.
5. O modal exibe QR-Code e PIX Copia e Cola.
6. O convidado informa que realizou o pagamento.

Atualização:

```text
payment_status = Informado
payment_reported_at = data atual
```

### Cartão De Crédito

1. O convidado seleciona cartão.
2. O sistema registra `selected_purchase_method = card`.
3. O sistema salva `selected_purchase_details` com `type = card` e a URL configurada.
4. Se `card_payment_url` estiver configurado, o checkout externo é aberto.
5. O convidado informa que realizou o pagamento.

Atualização:

```text
payment_status = Informado
payment_reported_at = data atual
```

### Compra Online

1. O convidado seleciona uma loja online cadastrada.
2. O sistema salva:

```text
selected_purchase_method = online
selected_purchase_details = objeto da loja
```

3. A URL da loja é aberta quando disponível.
4. O convidado informa que realizou a compra.

### Loja Física

1. O convidado seleciona uma loja física cadastrada.
2. O sistema salva:

```text
selected_purchase_method = physical
selected_purchase_details = objeto da loja
```

3. O convidado usa as instruções exibidas e informa que realizou a compra.

## Fluxo Administrativo

O painel administrativo foi dividido em páginas, com navegação lateral no
desktop e navegação inferior em estilo aplicativo no mobile. Os cabeçalhos das
páginas seguem um padrão comum com subtítulo, título, descrição curta e detalhe
ornamental discreto.

### Dashboard

Arquivo:

```text
admin-dashboard.html
```

Exibe uma visão resumida com:

- Pessoas esperadas.
- Convidados pagantes.
- Valor confirmado.
- Presentes informados aguardando confirmação.
- Recados pendentes.
- Falhas de e-mail.
- Gráfico de rosca da situação dos convites.
- Barra de distribuição dos presentes.
- Atalhos para as áreas operacionais, Indicadores e Relatórios.

### Indicadores

Arquivo:

```text
admin-indicators.html
```

Concentra as métricas e gráficos detalhados do casamento:

- Total de convidados ativos.
- Confirmados.
- Acompanhantes.
- RSVP Sim.
- RSVP Não.
- Total esperado.
- Convites por origem: Noiva, Noivo e Casal.
- Convites individuais, convites de casal, convites enviados e convites não
  enviados.
- Mesas totais, ativas, com vagas, lotadas e acima da capacidade.
- Convites com mesa, sem mesa, confirmados sem mesa e ausentes ainda
  atribuídos a mesa.
- Convidados pagantes conforme a idade mínima configurada.
- Total de crianças, crianças pagantes, não pagantes e sem idade válida.
- Gráfico de distribuição das pessoas confirmadas por categoria do buffet.
- Gráfico de distribuição de RSVPs entre confirmados, não comparecerão e pendentes.
- Gráfico de distribuição dos convidados por origem.
- Gráfico de situação das mesas por ocupação híbrida e status ativo/inativo.
- Métricas clicáveis para abrir Convidados, RSVP ou Presentes com filtros aplicados quando houver filtro equivalente.
- Presentes reservados.
- Pagamentos informados.
- Presentes comprados.
- Presentes parcialmente reservados por cotas.
- Gráfico de distribuição dos presentes por situação.
- Configurações de PIX e WhatsApp.
- Cotas disponíveis e cotas confirmadas.
- Valores financeiros da lista, reservados, disponíveis, informados, confirmados e pendentes, incluindo gráfico de distribuição.

### Relatórios Consolidados

Arquivo:

```text
admin-reports.html
```

Centraliza os relatórios exportáveis de presença/buffet, Resumo Final do Buffet,
financeiro, ações pendentes, mapa de mesas e lista para recepção, com formatos CSV/XLSX e seleção
de colunas. A lista para recepção também possui PDF paginado, pode ser ordenada
alfabeticamente ou agrupada por mesa e inclui somente pessoas confirmadas. O
código de convite, as restrições alimentares e os dados financeiros não fazem
parte dessa lista operacional. A categoria calculada pelo buffet pode ser
incluída opcionalmente por pessoa, com os valores Pagante, Criança pagante,
Criança não pagante ou Criança sem idade; a coluna permanece desmarcada por
padrão para preservar uma lista de entrada mais enxuta.

O Mapa de Mesas pode ser exportado em CSV e XLSX nos níveis resumido por convite
ou detalhado por pessoa. O PDF possui uma estrutura operacional fixa, organizada
em blocos por mesa, e respeita o modo Híbrido, Confirmado ou Planejado escolhido
no modal. Cada bloco informa situação, capacidade, ocupação, vagas, localização,
observações e pessoas consideradas. Convidados ainda não alocados aparecem ao
final em um bloco Sem mesa. A seleção de colunas do modal afeta somente CSV e
XLSX.

O Relatório Final do Buffet é próprio para envio ao fornecedor e considera
somente pessoas com presença confirmada. A exportação XLSX possui quatro abas:
Resumo, Pessoas Confirmadas, Resumo por Mesa e Restrições Alimentares. O resumo
inclui pessoas confirmadas, pagantes, adultos pagantes, total de crianças,
crianças pagantes, não pagantes e sem idade, regra etária aplicada, quantidade
de convites com restrição, RSVPs pendentes e confirmados sem mesa. A aba por
mesa também apresenta localização, observações e os totais de cada categoria.

Há dois PDFs: um resumo, com os totais no cabeçalho e a relação paginada de
restrições, e outro completo, com todas as pessoas confirmadas ordenadas por
mesa. A restrição alimentar é tratada por pessoa do convite. O dado persistido
em `guest_data` guarda apenas a descrição da restrição; nomes são adicionados
somente na apresentação quando o relatório precisa diferenciar múltiplas
pessoas.

O Relatório Consolidado de Ações Pendentes reúne:

- convites ainda não enviados e RSVPs sem resposta;
- convidados confirmados sem mesa;
- mesas ativas acima da capacidade no modo híbrido;
- mesas inativas que ainda possuem convidados;
- convidados inativos ou com ausência confirmada que continuam em mesas;
- crianças confirmadas sem idade válida para o cálculo do buffet;
- reservas e pagamentos de presentes ou cotas que ainda exigem ação.

Linhas idênticas são consolidadas para impedir duplicidade na exportação quando
a origem dos dados apresenta registros repetidos.

O Checklist Operacional Final pode reunir essas pendências automáticas e as
tarefas não concluídas do Checklist do Casamento. Antes da exportação, é possível
escolher entre tudo consolidado, somente pendências automáticas ou somente
tarefas do checklist. A exportação está disponível em XLSX e PDF e apresenta
origem, área, prioridade, responsável, status, prazo, período e ação sugerida.
Tarefas atrasadas e ações de prioridade alta aparecem primeiro e recebem
destaque visual. Tarefas já concluídas não entram no documento. A seleção de
colunas de Ações Pendentes afeta apenas as exportações CSV e XLSX desse relatório,
sem alterar as colunas operacionais do checklist final.

### Gestão De Presentes

Arquivo:

```text
admin-gifts.html
```

Permite:

- Criar presentes.
- Editar presentes.
- Excluir presentes.
- Configurar presentes individuais ou por cotas.
- Configurar modo de compra.
- Configurar link de pagamento por cartão.
- Cadastrar opções de compra online e loja física.
- Liberar reservas.
- Marcar presentes como comprados.
- Confirmar ou liberar contribuições por cota.
- Exportar CSV dos presentes filtrados e ordenados.
- Filtrar por busca textual, status, tipo, cotas, pagamento e forma de presentear.
- Ordenar por presente, categoria, convidado, status, forma, pagamento e data de reserva.
- Ver contador de resultados e limpar filtros.

### Configurações Do Admin

Arquivo:

```text
admin-settings.html
```

Permite editar:

- Chave PIX.
- Nome do recebedor usado no payload PIX.
- Cidade do recebedor usada no payload PIX.
- WhatsApp de contato configurado no site.
- Idade mínima em que uma criança passa a ser pagante para o buffet.

### Gestão De Convidados

Arquivo:

```text
admin-guests.html
```

Permite:

- Criar convidados.
- Editar convidados.
- Ativar/desativar convidados.
- Marcar convites como enviados ou não enviados.
- Classificar cada convite como convidado da Noiva, do Noivo ou do Casal.
- Definir, trocar ou remover a mesa do convite pelo modal de detalhes do
  convidado.
- Registrar observação específica do convidado na mesa ao definir ou trocar a
  atribuição.
- Copiar código de convite.
- Preencher RSVP manual.
- Exportar CSV dos convidados filtrados e ordenados, incluindo o status de envio do convite, convidado de e mesa.
- Filtrar por busca textual, status, RSVP, envio do convite, tipo de convite,
  convidado de e mesa, incluindo `Com mesa`, `Sem mesa` e mesa específica.
- Ordenar por nome, tipo, acompanhantes, confirmado, convite enviado, status, código, último acesso e acessos.
- Ver contador de resultados e limpar filtros.

### Gestão De RSVP

Arquivo:

```text
admin-rsvps.html
```

Permite:

- Visualizar confirmações.
- Consultar acompanhantes.
- Consultar restrições e mensagens.
- Consultar a mesa atual do convite.
- Acessar `Gerenciar Mesa`, que abre o detalhe do convidado correspondente para
  definir, trocar ou remover mesa.
- Remover RSVP.
- Exportar CSV dos RSVPs filtrados e ordenados.
- Filtrar por busca textual, presença, acompanhantes, categorias do buffet e
  mesa, incluindo `Com mesa`, `Sem mesa` e mesa específica.
- Ordenar por convidado, presença, quantidade de acompanhantes e data de atualização.
- Ver contador de resultados e limpar filtros.

### Gestão De Mesas

Arquivo:

```text
admin-tables.html
```

Permite:

- Criar, editar, detalhar, excluir e ordenar mesas da recepção.
- Definir capacidade, localização, observações e status ativo/inativo.
- Ativar ou desativar uma mesa pelo modal de detalhes, usando RPC dedicada.
- Atribuir, trocar e remover convidados das mesas; a troca pode ser feita pelos
  cards da página de Mesas, pelo modal de detalhes da mesa ou pelo detalhe do
  convidado.
- Exibir observações específicas do convidado na mesa por indicador discreto e
  modal de leitura.
- Alternar a visualização de ocupação entre Planejado, Confirmado e Híbrido.
- Filtrar por busca, situação da mesa, incluindo `Ativas`, `Lotadas` e `Acima
  da capacidade`, origem do convite e status do convidado.
- Exportar CSV com mesa, capacidade, ocupações, convidados atribuídos,
  presença no RSVP e observação do convidado na mesa.

Regras de contagem:

- Planejado: usa o tamanho máximo do convite, considerando casal/individual e
  acompanhantes permitidos.
- Confirmado: usa apenas pessoas confirmadas no RSVP.
- Híbrido: usa Confirmado quando já existe RSVP e Planejado quando o convite
  ainda não respondeu.
- Convidados inativos permanecem visíveis se já estiverem atribuídos a uma mesa,
  mas não entram na ocupação.
- Convidados atribuídos a uma mesa que responderam RSVP como ausência ficam
  sinalizados com `Não vai`; no modo Confirmado contam como zero.
- O filtro `Lotadas` inclui mesas exatamente lotadas e mesas acima da
  capacidade. O filtro `Acima da capacidade` restringe apenas as mesas
  excedidas.

### Checklist Do Casamento

Arquivo:

```text
admin-checklist.html
```

Permite:

- Organizar tarefas internas do casamento em cards por período, de `12 meses
  antes` até `Depois do casamento`.
- Filtrar por busca textual, período, status, categoria, responsável e
  prioridade.
- Criar, editar, detalhar, concluir/reabrir e excluir tarefas.
- Criar tarefa diretamente a partir do card do período desejado.
- Criar, editar e excluir categorias quando elas ainda não possuem tarefas.
- Criar, editar e excluir responsáveis quando eles ainda não possuem tarefas.
- Organizar manualmente a ordem das tarefas dentro de cada período, com setas
  ou arrastar/soltar.
- Exibir alerta simples no menu administrativo quando existirem tarefas
  atrasadas.
- Usar categorias, responsáveis e tarefas padrão populadas pelo SQL de rebuild
  ou pela migration incremental.

### Comportamento Dos Filtros E Ordenação Administrativos

Os filtros e a ordenação do admin são aplicados no frontend, em memória, sobre os dados já carregados do Supabase.

Isso evita novas consultas a cada tecla digitada ou clique de ordenação e preserva os controles após operações que recarregam a tabela.

### Exportação CSV

As páginas de Presentes, Convidados e RSVP possuem exportação CSV. O arquivo baixado respeita os filtros e a ordenação aplicados na tabela no momento do clique.

O Dashboard também possui relatórios consolidados exportáveis:

- Presença e buffet: convites confirmados, pessoas do convite, acompanhantes, crianças, convidados pagantes, crianças pagantes, não pagantes e sem idade válida, além da regra de idade aplicada, com seleção de colunas e CSV/XLSX resumido ou detalhado por pessoa.
- Financeiro: presentes individuais e cotas com convidado, status, valor e data, com seleção de colunas e CSV/XLSX.
- Pendências: RSVPs sem resposta, reservas e pagamentos que ainda precisam de ação, com seleção de colunas e CSV/XLSX.

Cada área possui:

- Campo de busca.
- Selects para filtros específicos da tela.
- Cabeçalhos clicáveis nas principais colunas de dados.
- Indicador visual de ordenação ascendente ou descendente.
- Contador no formato `N itens` ou `N de T itens`.
- Botão `Limpar filtros`.

O fluxo de exibição é:

```text
dados carregados -> filtros -> ordenação -> renderização da tabela
```

As tabelas exibem uma mensagem de estado vazio quando nenhum registro corresponde aos filtros selecionados.

## Segurança Atual

O sistema usa:

- Supabase Auth com sessão anônima para convidados.
- Edge Function `claim-invite` para validar o código e vincular a sessão ao convite.
- Supabase Auth com e-mail e senha para administradores.
- Controle administrativo por `admin_users` e `is_admin()`.
- RLS para isolamento dos dados por convidado e proteção das operações administrativas.
- RPCs restritas para RSVP, reservas, cotas e informações de pagamento.
- Limitação de tentativas por sessão anônima e hash protegido do endereço de rede.
- Cloudflare Turnstile validado pelo Supabase Auth nos logins administrativo e de convidados.

## Limitações Atuais

- Contas anônimas e tentativas antigas ainda não possuem limpeza periódica automatizada.
- As dependências externas carregadas por CDN ainda podem ser avaliadas para empacotamento local quando fizer sentido.
- Os códigos de convite ainda devem ser rotacionados antes da publicação definitiva.
- Comprovantes não são enviados nem armazenados pelo sistema; o convidado
  apenas informa pagamento ou compra pelo site.
- O provedor de cartão ainda depende de URL externa configurada manualmente.
- O QR-Code PIX depende do serviço externo `api.qrserver.com`.
- A confirmação final de pagamentos ainda depende de conferência administrativa.
- As fotos oficiais do Pré-Wedding ainda serão adicionadas ou substituídas após
  o ensaio.

## Melhorias Futuras

- Automatizar a limpeza de contas anônimas e tentativas antigas.
- Avaliar empacotamento local de dependências CDN restantes.
- Upload de comprovantes no sistema.
- Relatórios avançados por período ou fornecedor.
- Indicadores financeiros avançados por período ou forma de pagamento.
- Integração real com gateway de pagamento.
- Adicionar ou substituir as fotos oficiais do Pré-Wedding após o ensaio.

## Status Atual

Concluído:

- Autenticação por convite.
- RSVP individual e casal.
- Acompanhantes e crianças.
- Lista de presentes.
- Página e seção de Pré-Wedding com galeria responsiva e lightbox.
- Mural de Recados com página pública, envio/edição pelo convidado logado,
  prévia na página inicial, aprovação, ocultação, filtros e resposta dos
  noivos no painel administrativo.
- Presentes por cotas via PIX.
- PIX com payload e QR-Code.
- Compra online e loja física.
- Painel administrativo separado.
- Dashboard administrativo com gráfico de distribuição de RSVPs.
- Dashboard com métricas de pagantes e crianças para o buffet.
- Dashboard financeiro com valores da lista, reservados, disponíveis, informados, confirmados e pendentes, incluindo gráficos de distribuição.
- Filtros administrativos com ordenação, contadores e limpeza.
- Exportação CSV de presentes, convidados e RSVPs.
- Relatórios consolidados no dashboard.
- Login administrativo com e-mail e senha pelo Supabase Auth.
- Login de convidados com sessão anônima e Edge Function.
- RLS e RPCs restritas para isolamento por convite.
- Limitação de tentativas no login por código.
- Guia completo de reconstrução do ambiente Supabase.
- Notificações por e-mail com preferências por evento, histórico auditável com
  filtros, paginação e ordenação, lembretes manuais de presentes/cotas e
  eventos do Mural de Recados.
- Fornecedores e Programação do casamento com páginas públicas/protegidas,
  estados vazios amigáveis e gestão administrativa por RPCs seguras.
- Helpers `admin-common.js` e `public-common.js`.
- Navegação administrativa desktop/mobile e cabeçalhos padronizados via
  `admin-common.js`.
- Módulo `pix.js`.
- CSS com tokens globais.

Em aberto:

- Endurecimentos adicionais de segurança antes da publicação definitiva.
- Relatórios avançados por período ou fornecedor.
- Upload interno de comprovantes.
