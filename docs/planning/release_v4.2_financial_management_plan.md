# Planejamento Da Release v4.2 - Gerenciamento Financeiro

Este documento planeja a primeira versão do módulo de gerenciamento de previsão
e controle de gastos do casamento. A proposta é transformar as planilhas atuais
de orçamento previsto e controle de pagamentos em uma área administrativa
integrada ao site.

Inicialmente, a funcionalidade deve atender ao casamento, mas o modelo já deve
nascer preparado para controlar também a lua de mel.

## Objetivo

Criar uma área de `Financeiro` no Admin para acompanhar:

- orçamento previsto;
- gastos contratados ou compras realizadas;
- parcelas e vencimentos;
- valores pagos;
- valores em aberto;
- comparação entre previsão e realidade;
- visão separada ou consolidada de casamento e lua de mel.

O módulo deve substituir gradualmente as planilhas manuais, sem perder a lógica
que elas já representam.

## Referências Atuais

### Planilha De Previsão De Orçamento Geral

Uso atual:

- lista itens estimados do casamento;
- separa possibilidades/cenários de orçamento;
- permite comparar alternativas como buffet, vestido, fotografia,
  cerimonialista, igreja, decoração e outros itens;
- soma o valor previsto total de cada cenário.

Principais conceitos identificados:

- item de orçamento;
- cenário de previsão;
- categoria ou área do gasto;
- valor estimado;
- observação ou fornecedor provável.

### Planilha De Controle De Pagamentos

Uso atual:

- registra fornecedores, compras e contratos fechados;
- controla valor total;
- controla pagamento à vista ou parcelado;
- registra parcelas, datas de pagamento, status e responsável pelo pagamento;
- calcula total pago e total restante.

Principais conceitos identificados:

- gasto real;
- tipo do gasto;
- valor contratado;
- parcela;
- vencimento;
- status de pagamento;
- pagador;
- total pago;
- total restante.

## Inspirações De Produto

Ferramentas grandes de planejamento de casamento costumam combinar três ideias:

- orçamento por categorias;
- acompanhamento de fornecedores e pagamentos;
- lembretes ou visão clara de próximos vencimentos.

Para o projeto, o melhor caminho é adaptar essa lógica ao que já existe no Admin:
fornecedores, checklist, relatórios, indicadores e configurações do casamento.

## Escopo Proposto Para A v4.2

### 1. Nova Área Administrativa

Criar uma página Admin para o módulo financeiro.

Nome sugerido:

- `Financeiro`

Alternativas:

- `Gastos`;
- `Orçamento`;
- `Orçamento e Gastos`.

Recomendação inicial: usar `Financeiro`, porque comporta previsão, controle,
pagamentos, lua de mel e relatórios sem parecer limitado a uma única parte do
fluxo.

## Andamento Incremental

Esta seção deve ser atualizada durante o desenvolvimento para evitar concentrar
toda a documentação apenas no fechamento da release.

### Fundação SQL

Status: concluída.

Entregas já preparadas:

- migration incremental `docs/migrations/financial_management.sql`;
- verificação incremental `docs/migrations/financial_management_verify.sql`;
- tabelas de cenários, categorias, pagadores, itens previstos, gastos reais e
  parcelas/pagamentos;
- seeds iniciais para cenários `Planejado`, categorias e pagadores;
- contexto financeiro para `Casamento` e `Lua de Mel`;
- categorias compatíveis com contexto compartilhado;
- cenário de referência por contexto;
- vínculo opcional de gasto com fornecedor;
- pagador padrão no gasto e pagador efetivo na parcela;
- RPCs administrativas para CRUD e resumo financeiro;
- RLS habilitado, acesso direto bloqueado para `anon` e `authenticated`, e
  execução via RPC administrativa autenticada;
- inclusão no rebuild consolidado;
- inclusão no verificador final do rebuild.
- hotfix `financial_summary_rpc_fix.sql` para corrigir a RPC de resumo
  financeiro quando a tela Admin passou a consumir `admin_get_financial_summary`.

Observação: os scripts incrementais já foram executados com sucesso no ambiente
atual. O rebuild consolidado é necessário apenas para projetos novos ou
reconstrução limpa.

### Próxima Frente

Próximo passo recomendado:

- evoluir a página Admin `Financeiro` para os CRUDs completos;
- iniciar pelos cadastros base: categorias, pagadores e cenários;
- depois avançar para orçamento previsto, gastos reais e parcelas.

### Interface Admin Inicial

Status: iniciada.

Entregas já preparadas:

- página Admin `admin-financial.html`;
- página Admin `admin-financial-budget.html` para gestão do orçamento previsto;
- página Admin `admin-financial-expenses.html` para gestão de gastos reais;
- página Admin `admin-financial-base.html` para cadastros base;
- entrada `Financeiro` no menu administrativo comum;
- submenu do Financeiro com `Visão Geral`, `Orçamento Previsto`,
  `Gastos Reais` e `Cadastros Base`;
- carregamento automático de `js/admin-financial.js` via bootstrap Admin;
- navegação de contexto `Todos`, `Casamento` e `Lua de Mel`;
- cards iniciais de orçamento de referência, total contratado, total pago,
  valor faltante em relação ao orçamento pago e valor em aberto;
- destaque de próximo vencimento e parcelas atrasadas dentro da seção de
  vencimentos;
- leitura inicial via RPCs financeiras;
- tabelas iniciais para próximas parcelas, gastos recentes e orçamento previsto;
- listagem dos dados base de cenários, categorias e pagadores;
- botões de novo item previsto e novo gasto real ainda desabilitados para a
  próxima etapa de CRUD.

### CRUD De Categorias Financeiras

Status: iniciado.

Entregas já preparadas:

- modal de gerenciamento de categorias financeiras;
- criação de categoria;
- edição de nome, contexto, cor, ícone, ordem e status ativo/inativo;
- exclusão de categorias sem uso;
- bloqueio visual antes da exclusão quando a categoria já possui itens previstos
  ou gastos vinculados;
- novas categorias herdam o contexto ativo quando a tela está em `Casamento` ou
  `Lua de Mel`;
- listagem de uso por categoria em orçamento previsto e gastos reais.
- seletor de ícones com preview visual de cor e ícone;
- ao editar uma categoria, o modal rola de volta para o formulário de edição.

### CRUD De Pagadores Financeiros

Status: iniciado.

Entregas já preparadas:

- modal de gerenciamento de pagadores financeiros;
- criação de pagador;
- edição de nome, descrição, cor, ícone, ordem e status ativo/inativo;
- exclusão de pagadores sem uso;
- bloqueio visual antes da exclusão quando o pagador já possui gastos ou
  parcelas vinculadas;
- seletor de ícones com preview visual de cor e ícone;
- ao editar um pagador, o modal rola de volta para o formulário de edição.

### CRUD De Cenários Financeiros

Status: iniciado.

Entregas já preparadas:

- modal de gerenciamento de cenários de orçamento;
- criação de cenário por contexto;
- edição de nome, contexto, descrição, ordem, referência e status ativo/inativo;
- marcação de cenário de referência por contexto;
- bloqueio visual para impedir cenário de referência inativo;
- bloqueio visual para impedir que um contexto fique sem cenário de referência;
- guarda por RPC para impedir que `Casamento` ou `Lua de Mel` fiquem sem um
  cenário de referência ativo;
- exclusão de cenários sem itens previstos;
- bloqueio visual antes da exclusão quando o cenário já possui itens previstos;
- orientação visual para definir outro cenário como referência antes de excluir
  o cenário atualmente usado como referência;
- ao editar um cenário, o modal rola de volta para o formulário de edição.

### Organização De Ordem Dos Cadastros Base

Status: iniciada.

Entregas já preparadas:

- modal único para organizar ordem dos cadastros base do Financeiro;
- organização de ordem de cenários por contexto;
- organização de ordem de categorias por contexto;
- organização de ordem de pagadores;
- suporte a botões de subir/descer e arrastar para reorganizar;
- salvamento em lote via RPC administrativa;
- hotfix `financial_base_ordering.sql` com as RPCs de ordenação;
- verificação incremental `financial_base_ordering_verify.sql`.

### CRUD De Orçamento Previsto

Status: iniciado.

Entregas já preparadas:

- modal de criação e edição de item previsto;
- vínculo obrigatório com cenário de orçamento;
- seleção de categoria compatível com o contexto do cenário;
- valor estimado;
- fornecedor previsto ou referência textual;
- prioridade;
- status;
- ordem;
- ativo/inativo;
- exclusão de item previsto;
- ações de editar e excluir na tabela de Orçamento Previsto;
- filtro de cenário na tabela, usando o cenário de referência como padrão em
  cada contexto;
- suporte explícito a categorias compartilhadas (`Compartilhado`) nos itens de
  Orçamento Previsto;
- listagem de todos os itens de Orçamento Previsto compatíveis com os filtros
  ativos, sem limitar a visualização a um resumo inicial;
- atualização dos cards e listagens após salvar ou excluir.

### 2. Contexto Financeiro

O contexto deve funcionar como uma navegação principal da página `Financeiro`,
não apenas como um filtro secundário.

Opções visíveis no topo da página:

- Todos;
- Casamento;
- Lua de Mel.

Todo item financeiro deve indicar a qual contexto pertence:

- casamento;
- lua de mel;
- ambos, se necessário.

Isso permite ver os números separados e também consolidados.

Valores internos sugeridos:

- `wedding`;
- `honeymoon`;
- `both`.

Comportamento esperado:

- em `Todos`, a tela mostra a visão consolidada;
- em `Casamento`, a tela mostra apenas itens do casamento e itens marcados como
  ambos quando fizer sentido;
- em `Lua de Mel`, a tela mostra apenas itens da lua de mel e itens marcados
  como ambos quando fizer sentido;
- ao criar um orçamento, gasto ou parcela dentro de `Casamento`, o contexto já
  deve vir preenchido como casamento;
- ao criar um orçamento, gasto ou parcela dentro de `Lua de Mel`, o contexto já
  deve vir preenchido como lua de mel;
- ao criar algo dentro de `Todos`, o modal deve exigir ou destacar a escolha do
  contexto.

### 3. Orçamento Previsto

Representa o plano ou estimativa antes da contratação.

Campos sugeridos:

- contexto;
- cenário;
- categoria;
- item;
- valor estimado;
- fornecedor previsto ou observação;
- prioridade;
- status do item previsto;
- ordem de exibição;
- ativo/inativo.

Status sugeridos:

- previsto;
- em pesquisa;
- aprovado;
- substituído;
- descartado.

### 4. Cenários De Orçamento

Os cenários substituem as colunas de possibilidades da planilha.

Exemplos:

- possibilidade 1;
- possibilidade 2;
- possibilidade 3;
- planejado oficial;
- econômico;
- completo.

Campos sugeridos:

- nome;
- descrição;
- contexto;
- indicador de cenário de referência;
- ordem de exibição;
- ativo/inativo.

Na primeira versão, deve existir um cenário padrão chamado `Planejado`.

Cada contexto deve ter no máximo um cenário ativo marcado como cenário de
referência. Esse cenário será usado nos cards principais, alertas e comparações
de orçamento.

Exemplo:

- `Casamento` pode ter vários cenários, mas apenas um cenário de referência;
- `Lua de Mel` pode ter vários cenários, mas apenas um cenário de referência.

Cenários alternativos servem para simulação, comparação e histórico de
possibilidades. Eles não devem alimentar o alerta principal de orçamento
estourado, a menos que sejam marcados como referência.

### 5. Gastos Contratados Ou Compras Reais

Representa aquilo que já foi contratado, fechado, comprado ou assumido como
despesa real.

Campos sugeridos:

- contexto;
- categoria;
- tipo;
- descrição;
- fornecedor vinculado;
- valor total;
- forma de pagamento;
- status;
- pagador padrão;
- data de contratação ou compra;
- observações;
- link de referência ou contrato;
- ativo/inativo.

Tipos sugeridos:

- fornecedor;
- compra avulsa;
- taxa;
- reserva;
- serviço;
- produto;
- viagem;
- hospedagem;
- transporte.

Status sugeridos:

- planejado;
- cotando;
- contratado;
- comprado;
- pago;
- cancelado.

Status da implementação: iniciado.

Entregas já preparadas:

- botão `Gasto Real` habilitado na página Admin `Financeiro`;
- modal de criação e edição de gasto real;
- vínculo obrigatório com contexto e categoria;
- suporte a categorias compartilhadas, usando o contexto escolhido no modal;
- vínculo opcional com fornecedor cadastrado;
- vínculo opcional com pagador principal;
- campos de tipo, forma de pagamento, status, data de contratação/compra,
  valor total, descrição, link ou referência, observações e ativo/inativo;
- ações de editar e excluir na tabela de Gastos Recentes;
- seção completa `Gastos Reais` para gestão de todos os gastos do contexto;
- filtros de gastos por busca, categoria, tipo, status, pagador e fornecedor;
- atualização dos cards e listagens após salvar ou excluir.

### 6. Parcelas E Pagamentos

Cada gasto real pode ter uma ou mais parcelas.

Campos sugeridos:

- gasto relacionado;
- número da parcela;
- descrição da parcela;
- valor;
- vencimento;
- status;
- data de pagamento;
- pagador efetivo;
- observações.

Status sugeridos:

- não pago;
- pago;
- atrasado;
- cancelado.

O status `atrasado` pode ser calculado visualmente quando a parcela estiver como
`não pago` e o vencimento já tiver passado.

O pagador da parcela representa quem pagou ou deverá pagar aquela parcela
específica. Ele pode ser diferente do pagador padrão definido no gasto.

Status da implementação: iniciado.

Entregas já preparadas:

- seção de parcelas dentro do modal de edição de Gasto Real;
- criação manual de parcelas após o gasto real existir no banco;
- edição e exclusão de parcelas vinculadas ao gasto;
- campos de número, descrição, valor, vencimento, status, data de pagamento,
  pagador efetivo e observações;
- cálculo visual do total das parcelas do gasto;
- ao criar um gasto novo, o modal reabre em modo edição para permitir cadastrar
  parcelas na sequência.
- a seção de parcelas fica oculta durante a criação inicial do gasto e aparece
  apenas após o gasto existir no banco.
- geração automática inicial de parcelas para pagamentos à vista, parcelados e
  entrada + parcelas.
- em `Entrada + parcelas`, a entrada possui vencimento próprio e as demais
  parcelas possuem um primeiro vencimento separado.
- a tabela de Próximas Parcelas mostra apenas parcelas em aberto ou atrasadas,
  deixando parcelas pagas para o detalhe do gasto e relatórios.
- ao marcar uma parcela como paga, a data de pagamento é preenchida
  automaticamente com o vencimento quando ainda estiver vazia.
- em pagamentos à vista, o gerador oculta o intervalo e permite criar a parcela
  única já como paga usando o vencimento como data de pagamento.

Ficam para os próximos cortes:

- marcação rápida de parcela como paga na tabela de Próximas Parcelas;
- validação visual entre soma das parcelas e valor total do gasto.

### 7. Dashboard Financeiro

Cards iniciais:

- orçamento previsto de referência;
- total contratado;
- total pago;
- total restante;
- diferença entre previsto e contratado;
- percentual do orçamento comprometido;
- próximo vencimento;
- parcelas atrasadas;
- valor a pagar no mês.

Navegação principal:

- Todos;
- Casamento;
- Lua de Mel.

Filtros:

- cenário;
- categoria;
- status;
- pagador;
- período.

### 8. Relatórios E Exportações

Relatórios sugeridos para a primeira versão:

- Orçamento Previsto;
- Gastos Contratados;
- Parcelas e Vencimentos;
- Fluxo Mensal de Pagamentos;
- Comparativo Previsto vs Real, usando o cenário de referência;
- Comparativo Entre Cenários;
- Resumo por Categoria;
- Resumo por Pagador.

Formatos:

- CSV;
- XLSX;

PDF pode ficar para uma fase posterior, quando o layout financeiro estiver mais
maduro.

Personalização esperada:

- todo relatório financeiro deve permitir escolher o contexto: `Todos`,
  `Casamento` ou `Lua de Mel`;
- relatórios que envolvem orçamento previsto devem permitir escolher o cenário;
- o padrão para relatórios comparativos deve ser `Cenário de referência`;
- relatórios puramente realizados, como gastos, parcelas, pagamentos, próximos
  vencimentos e atrasados, não dependem de cenário;
- relatórios devem permitir seleção de colunas quando fizer sentido;
- relatórios devem permitir filtros por categoria, pagador, status e período;
- na visão `Todos`, relatórios comparativos devem usar o cenário de referência
  de cada contexto por padrão.

Relatórios que dependem de cenário:

- Orçamento Previsto;
- Comparativo Previsto vs Real;
- Comparativo Entre Cenários;
- Resumo por Categoria com comparação de orçamento.

Relatórios que não dependem de cenário:

- Gastos Contratados;
- Parcelas e Vencimentos;
- Fluxo Mensal de Pagamentos;
- Resumo por Pagador;
- Pagamentos por Status;
- Próximos Vencimentos;
- Atrasados.

Para o MVP, a escolha manual de múltiplos cenários por contexto na visão `Todos`
pode ficar fora do escopo. O comportamento padrão deve ser usar o cenário de
referência de cada contexto.

## Modelo De Dados Proposto

### `financial_budget_scenarios`

Guarda os cenários de orçamento.

Campos principais:

- `id`;
- `context`;
- `name`;
- `description`;
- `is_reference`;
- `display_order`;
- `is_active`;
- `created_at`;
- `updated_at`.

Regras sugeridas:

- deve existir um cenário `Planejado` por contexto;
- deve existir no máximo um cenário de referência ativo por contexto;
- se não houver cenário de referência, o sistema deve tentar usar o cenário
  `Planejado`;
- se não houver cenário de referência nem cenário `Planejado`, os cards de
  comparação devem informar que não há orçamento de referência configurado.

### `financial_categories`

Guarda categorias reutilizáveis em orçamento previsto e gastos reais.

As categorias devem nascer com seed inicial, mas continuar editáveis pelo Admin.
Isso evita começar com uma tela vazia e, ao mesmo tempo, permite ajustar o
controle financeiro ao planejamento real do casal.

Campos principais:

- `id`;
- `context`;
- `name`;
- `color`;
- `icon`;
- `display_order`;
- `is_active`;
- `created_at`;
- `updated_at`.

Exemplos:

- Buffet;
- Cerimonial;
- Fotografia;
- Noiva;
- Noivo;
- Igreja;
- Decoração;
- Lua de Mel;
- Passagens;
- Hospedagem;
- Documentação.

Observações:

- categorias podem ser específicas de `Casamento`, específicas de `Lua de Mel`
  ou compartilhadas entre os dois contextos;
- uma categoria pode ser desativada sem apagar o histórico financeiro;
- a interface deve permitir criar, editar, ordenar e desativar categorias;
- filtros e relatórios devem permitir análise por categoria.

### `financial_payers`

Guarda os pagadores disponíveis para gastos e parcelas.

Assim como categorias, pagadores devem nascer com seed inicial, mas devem ser
editáveis pelo Admin.

Campos principais:

- `id`;
- `name`;
- `description`;
- `color`;
- `icon`;
- `display_order`;
- `is_active`;
- `created_at`;
- `updated_at`.

Seeds iniciais sugeridos:

- Noivo;
- Noiva;
- Ambos;
- Família da Noiva;
- Família do Noivo;
- A definir;
- Outro.

Observações:

- o cadastro de pagadores permite filtrar gastos e pagamentos por pessoa ou
  grupo;
- o pagador pode representar uma pessoa, um casal ou uma origem de pagamento;
- pagadores inativos não devem aparecer para novos lançamentos, mas devem
  continuar disponíveis no histórico;
- relatórios financeiros devem conseguir agrupar por pagador.

### `financial_budget_items`

Guarda itens previstos.

Campos principais:

- `id`;
- `scenario_id`;
- `category_id`;
- `context`;
- `title`;
- `estimated_amount`;
- `notes`;
- `expected_vendor_name`;
- `priority`;
- `status`;
- `display_order`;
- `is_active`;
- `created_at`;
- `updated_at`.

### `financial_expenses`

Guarda gastos reais, contratos e compras.

Campos principais:

- `id`;
- `category_id`;
- `vendor_id`;
- `context`;
- `type`;
- `title`;
- `description`;
- `total_amount`;
- `payment_method`;
- `status`;
- `default_payer_id`;
- `contracted_at`;
- `reference_url`;
- `notes`;
- `is_active`;
- `created_at`;
- `updated_at`.

### `financial_expense_payments`

Guarda parcelas e pagamentos.

Campos principais:

- `id`;
- `expense_id`;
- `installment_number`;
- `label`;
- `amount`;
- `due_date`;
- `paid_at`;
- `status`;
- `payer_id`;
- `notes`;
- `created_at`;
- `updated_at`.

## Regras De Negócio

- Um gasto real pode existir sem orçamento previsto correspondente.
- Um item previsto pode existir sem gasto real correspondente.
- Uma categoria pode ser usada tanto no orçamento quanto nos gastos reais.
- Uma categoria marcada como `both` deve aparecer nos contextos `Casamento` e
  `Lua de Mel`.
- Uma categoria marcada como `wedding` deve aparecer apenas em `Casamento` e na
  visão `Todos`.
- Uma categoria marcada como `honeymoon` deve aparecer apenas em `Lua de Mel` e
  na visão `Todos`.
- Um gasto pode estar vinculado a um fornecedor cadastrado, mas isso não deve ser
  obrigatório.
- Um gasto pode ter um pagador padrão, usado como sugestão para novas parcelas.
- Cada parcela deve ter seu próprio pagador efetivo ou previsto.
- O pagador da parcela prevalece em relatórios de pagamento, porque representa
  quem pagou ou quem deverá pagar de fato.
- O pagador padrão do gasto serve para organização e preenchimento rápido, mas
  não deve substituir a leitura das parcelas.
- O total pago de um gasto deve ser calculado pela soma das parcelas pagas.
- O total restante de um gasto deve ser `valor total - total pago`.
- Uma parcela sem pagamento e com vencimento anterior à data atual deve aparecer
  como atrasada na interface, mesmo que o status salvo ainda seja `não pago`.
- O valor contratado pode ultrapassar o valor previsto; isso deve ser tratado
  como informação, não como erro.
- O módulo deve permitir casamento e lua de mel no mesmo modelo de dados.
- O alerta de orçamento estourado deve comparar o total contratado do contexto
  com o total previsto no cenário de referência do mesmo contexto.
- A comparação principal deve usar total contratado, não apenas total pago.
- Total pago responde quanto já saiu do caixa; total contratado responde quanto
  já foi comprometido.
- Cenários alternativos não devem afetar os cards principais, salvo quando forem
  marcados como cenário de referência.
- A visão `Todos` deve somar os cenários de referência de `Casamento` e `Lua de
  Mel` para comparação consolidada.

## Integrações Com Áreas Existentes

### Fornecedores

Gastos reais podem ter vínculo opcional com `wedding_vendors`.

Regra definida:

- fornecedores vinculados a gastos reais não podem ser excluídos diretamente;
- nesses casos, o fornecedor deve ser ocultado da página pública ou desvinculado
  dos gastos antes da exclusão;
- a RPC `admin_delete_vendor` deve proteger o histórico financeiro mesmo que a
  chave estrangeira permita `on delete set null`.

Possíveis impactos:

- exibir gastos associados dentro do detalhe do fornecedor;
- mostrar fornecedor financeiro mesmo que ele não esteja visível na página
  pública;
- permitir criar gasto a partir de um fornecedor em uma fase futura.

### Checklist

O financeiro pode alimentar ou complementar tarefas do checklist.

Exemplos futuros:

- tarefa “pagar próxima parcela do buffet”;
- alerta de contrato sem pagamento cadastrado;
- tarefa automática para revisar gastos próximos ao casamento.

Na v4.2 inicial, essa integração pode ser apenas visual ou ficar fora do MVP.

### Dashboard Admin

Indicadores financeiros podem aparecer no dashboard.

Sugestões:

- valor restante;
- próximos vencimentos;
- parcelas atrasadas;
- percentual pago.

### Relatórios Consolidados

Os relatórios financeiros devem entrar como uma nova família de relatórios, sem
misturar com presença, buffet, recepção, mesas ou checklist.

## Telas Sugeridas

### Página Principal Do Financeiro

Componentes:

- navegação de contexto no topo;
- cards de resumo;
- filtros;
- gráfico ou resumo por categoria;
- lista de próximos vencimentos;
- abas de navegação.

Abas sugeridas:

- Visão Geral;
- Orçamento Previsto;
- Gastos;
- Parcelas;
- Relatórios.

Comportamento de contexto:

- `Todos` funciona como visão consolidada;
- `Casamento` funciona como área operacional para cadastrar e revisar despesas
  do casamento;
- `Lua de Mel` funciona como área operacional para cadastrar e revisar despesas
  da lua de mel;
- botões de novo cadastro herdam o contexto ativo;
- modais podem permitir alterar o contexto, mas devem deixar claro o contexto
  herdado da navegação.

### Modal De Orçamento Previsto

Campos:

- contexto;
- cenário;
- categoria;
- item;
- valor estimado;
- fornecedor previsto;
- prioridade;
- status;
- observações.

### Modal De Gasto Real

Campos:

- contexto;
- categoria;
- tipo;
- título;
- fornecedor vinculado;
- valor total;
- forma de pagamento;
- pagador padrão;
- data de contratação;
- status;
- observações;
- link de referência.

### Modal De Parcelas

Campos:

- gasto;
- geração automática de parcelas;
- lista editável de parcelas;
- vencimento;
- valor;
- status;
- pagador efetivo;
- data de pagamento.

## MVP Recomendado

Para a primeira entrega, o melhor MVP seria:

1. criar estrutura SQL;
2. criar página Admin `Financeiro`;
3. cadastrar categorias financeiras;
4. cadastrar pagadores;
5. cadastrar cenários de orçamento;
6. cadastrar itens previstos;
7. cadastrar gastos reais;
8. cadastrar parcelas manualmente;
9. marcar parcela como paga;
10. exibir cards básicos;
11. exportar CSV de orçamento, gastos e parcelas;
12. permitir seleção básica de contexto, cenário, filtros e colunas nos
    relatórios financeiros.

Ficaria fora do MVP:

- importação automática das planilhas;
- PDF;
- alertas por e-mail;
- integração automática com checklist;
- upload de comprovantes;
- anexos de contrato;
- seleção manual de múltiplos cenários por contexto na visão `Todos`;
- dashboards mais sofisticados.

## Fases Sugeridas

### Fase 1 - Fundação

- Migração SQL;
- rebuild;
- verify;
- RPCs administrativas;
- página Admin vazia com navegação;
- carregamento de categorias, cenários, orçamento, gastos e parcelas.
- carregamento de pagadores.

### Fase 2 - CRUD Financeiro

- CRUD de categorias;
- CRUD de pagadores;
- CRUD de cenários;
- marcação de cenário de referência por contexto;
- CRUD de orçamento previsto;
- CRUD de gastos;
- CRUD de parcelas;
- marcação rápida de parcela como paga.

### Fase 3 - Indicadores E Experiência

- cards de resumo;
- filtros;
- próximos vencimentos;
- atrasados;
- diferença entre cenário de referência e total contratado;
- percentual do orçamento comprometido;
- agrupamento por categoria e contexto.

### Fase 4 - Relatórios

- CSV;
- XLSX;
- relatórios por contexto;
- relatórios por cenário quando houver orçamento previsto;
- colunas personalizáveis;
- filtros por categoria, pagador, status e período;
- fluxo mensal;
- comparativo previsto vs real.

### Fase 5 - Integrações E Automação

- alertas no dashboard;
- relação com fornecedores;
- lembretes;
- importação assistida das planilhas;
- possível integração com checklist.

## Pontos De Decisão

Antes da implementação, vale decidir:

1. O nome da área será `Financeiro`, `Gastos` ou `Orçamento`?
2. Categorias serão livres ou haverá categorias iniciais cadastradas por seed?
3. Pagadores serão cadastráveis com seed inicial?
4. O vínculo com fornecedores entra no MVP ou fica opcional para depois?
5. XLSX entra na primeira entrega ou começamos apenas com CSV?

## Recomendações Iniciais

- Usar `Financeiro` como nome da área.
- Incluir `Casamento` e `Lua de Mel` desde o início como contexto.
- Exibir `Todos`, `Casamento` e `Lua de Mel` como navegação principal no topo da
  página Financeiro.
- Fazer novos cadastros herdarem automaticamente o contexto ativo.
- Permitir categorias específicas por contexto e categorias compartilhadas.
- Criar categorias iniciais por seed, mas permitir edição.
- Criar pagadores iniciais por seed, mas permitir edição.
- Usar pagador padrão no gasto e pagador efetivo na parcela.
- Criar um cenário padrão chamado `Planejado`.
- Marcar um cenário de referência por contexto.
- Usar o cenário de referência para comparar orçamento previsto vs total
  contratado.
- Refletir contexto e cenário nos relatórios financeiros.
- Permitir personalização de colunas e filtros nos relatórios financeiros.
- Permitir cenários extras já no banco, mesmo que a interface comece simples.
- Manter vínculo com fornecedores opcional no MVP.
- Começar com CSV e deixar XLSX/PDF para depois, se a primeira entrega ficar
  grande demais.
- Não importar as planilhas automaticamente na primeira etapa; usar as planilhas
  como referência de modelagem e depois criar uma importação assistida.

## Fora Do Escopo Inicial

- Controle bancário;
- conciliação automática;
- integração com cartão, Pix ou banco;
- anexos e comprovantes;
- permissões por pessoa pagadora;
- histórico detalhado de alterações;
- notificações automáticas por e-mail;
- páginas públicas para convidados;
- cálculo automático de orçamento recomendado por região;
- comparação com preços médios de mercado.

## Critérios De Pronto Da Release

A release pode ser considerada pronta quando:

- o Admin tiver uma área financeira funcional;
- for possível cadastrar orçamento previsto;
- for possível cadastrar gastos reais;
- for possível cadastrar e pagar parcelas;
- os cards principais refletirem os dados cadastrados;
- os filtros principais funcionarem;
- as exportações básicas funcionarem;
- relatórios financeiros permitirem escolha de contexto;
- relatórios com orçamento previsto permitirem escolha de cenário ou usarem o
  cenário de referência;
- relatórios permitirem seleção das principais colunas;
- o rebuild incluir as novas tabelas, RPCs, grants e RLS;
- houver scripts de migração e verificação;
- a documentação da release estiver atualizada.
