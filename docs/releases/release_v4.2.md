# Site de Casamento - L & M - v4.2

Esta release inicia o módulo `Financeiro`, voltado ao gerenciamento de previsão
orçamentária, gastos contratados, parcelas e pagamentos do casamento e da lua de
mel.

O objetivo é substituir gradualmente as planilhas manuais de orçamento previsto
e controle de pagamentos por uma área integrada ao Admin, mantendo a lógica de
cenários, categorias, pagadores e acompanhamento de valores pagos/em aberto.

## Concluído

### Fundação Do Módulo Financeiro

- Criada a modelagem inicial do módulo `Financeiro`.
- Incluídos os contextos `Casamento` e `Lua de Mel`.
- Criados cenários de orçamento por contexto.
- Criado cenário inicial `Planejado` para cada contexto.
- Permitido marcar um cenário de referência por contexto.
- Criadas categorias financeiras com seed inicial e suporte a edição futura.
- Criados pagadores com seed inicial e suporte a edição futura.
- Separado o conceito de pagador padrão do gasto e pagador efetivo da parcela.
- Criados itens de orçamento previsto.
- Criados gastos reais/contratados.
- Criadas parcelas e pagamentos.
- Incluído vínculo opcional entre gasto real e fornecedor cadastrado.

### Banco, Segurança E Rebuild

- Criada a migração
  `docs/migrations/financial_management.sql`.
- Criado o script de verificação
  `docs/migrations/financial_management_verify.sql`.
- Criadas RPCs administrativas para listar, salvar e excluir dados financeiros.
- Criada RPC administrativa de resumo financeiro.
- Criado hotfix incremental para a RPC de resumo financeiro:
  `docs/migrations/financial_summary_rpc_fix.sql`.
- RLS habilitado nas tabelas financeiras.
- Acesso direto às tabelas financeiras bloqueado para `anon` e
  `authenticated`.
- Execução administrativa liberada por RPC para usuários autenticados.
- Rebuild completo atualizado para criar o módulo financeiro em projetos novos.
- Verificador final do rebuild atualizado para validar tabelas, RLS, grants,
  RPCs e seeds financeiros.

### Interface Admin Inicial

- Criada a página `admin-financial.html`.
- Adicionada a entrada `Financeiro` ao menu administrativo comum.
- Configurado o carregamento de `js/admin-financial.js` pelo bootstrap Admin.
- Iniciada a reorganização visual do módulo Financeiro com submenu interno.
- A página principal do Financeiro passa a funcionar como `Visão Geral`.
- Criada a página `admin-financial-budget.html` para centralizar a gestão do
  orçamento previsto.
- Criada a página `admin-financial-expenses.html` para centralizar a gestão de
  gastos reais e suas parcelas.
- Criada a página `admin-financial-payments.html` para centralizar a consulta
  de parcelas, vencimentos e pagamentos.
- Criada a página `admin-financial-base.html` para centralizar os cadastros
  base do módulo.
- Criada navegação por contexto: `Todos`, `Casamento` e `Lua de Mel`.
- Criados cards iniciais de resumo financeiro.
- Criada leitura inicial via RPCs financeiras.
- Criadas prévias iniciais para próximas parcelas, gastos recentes e orçamento
  previsto na Visão Geral Financeira.
- A prévia de Gastos Recentes da Visão Geral passa a exibir até 4 itens em
  lista compacta com divisores, nome do gasto, resumo `Pago X de Y` e ações
  discretas por ícone.
- A prévia de Gastos Recentes passa a priorizar os gastos com data mais recente.
- A seção de Próximas Parcelas na Visão Geral passa a exibir o pagador abaixo
  do nome do gasto, reduzindo colunas e priorizando a largura da tabela no
  desktop.
- A Visão Geral Financeira passa a organizar Próximas Parcelas como área
  principal à esquerda e empilhar Gastos Recentes e Orçamento Previsto na coluna
  lateral direita.
- A prévia de Orçamento Previsto na Visão Geral passa a usar lista compacta com
  até 4 itens, valor previsto, divisores discretos e ações por ícone, em vez de
  tabela completa.
- A prévia de Orçamento Previsto na Visão Geral passa a mostrar, por item,
  valor previsto, realizado vinculado e quanto ainda falta gastar ou se houve
  estouro.
- Na prévia de Orçamento Previsto da Visão Geral, a ação principal do item passa
  a abrir os detalhes em vez de editar diretamente.
- O seletor de cenário da prévia de Orçamento Previsto na Visão Geral passa a
  usar um controle compacto integrado ao cabeçalho da seção.
- A experiência mobile da Visão Geral Financeira é refinada: ações principais
  ocupam a largura disponível, abas internas podem rolar horizontalmente e a
  tabela de Próximas Parcelas mantém formato tabular com scroll horizontal
  controlado.
- Criada listagem inicial de cenários, categorias e pagadores.
- Botões de criação de item previsto e gasto real ficam visíveis, mas
  desabilitados até a próxima etapa de CRUD.

### Categorias Financeiras

- Criado modal de gerenciamento de categorias financeiras.
- Permitida criação de categorias.
- Permitida edição de nome, contexto, cor, ícone, ordem e status ativo/inativo.
- Adicionado seletor de ícones com preview visual de cor e ícone.
- Ao clicar em editar, o modal rola para o formulário de edição.
- Permitida exclusão de categorias sem uso.
- Categorias já usadas em orçamento previsto ou gastos reais são preservadas;
  nesses casos, a recomendação é desativar a categoria para manter o histórico.
- Nova categoria herda o contexto ativo quando a tela está em `Casamento` ou
  `Lua de Mel`.

### Pagadores Financeiros

- Criado modal de gerenciamento de pagadores financeiros.
- Permitida criação de pagadores.
- Permitida edição de nome, descrição, cor, ícone, ordem e status ativo/inativo.
- Adicionado seletor de ícones com preview visual de cor e ícone.
- Ao clicar em editar, o modal rola para o formulário de edição.
- Permitida exclusão de pagadores sem uso.
- Pagadores já usados em gastos ou parcelas são preservados; nesses casos, a
  recomendação é desativar o pagador para manter o histórico.

### Cenários Financeiros

- Criado modal de gerenciamento de cenários de orçamento.
- Permitida criação de cenários por contexto.
- Permitida edição de nome, contexto, descrição, ordem, referência e status
  ativo/inativo.
- Permitida marcação de cenário de referência por contexto.
- Impedido visualmente salvar um cenário como referência quando ele estiver
  inativo.
- Impedido pela interface e pelas RPCs que `Casamento` ou `Lua de Mel` fiquem
  sem cenário de referência ativo.
- Permitida exclusão de cenários sem itens previstos.
- Cenários com itens previstos são preservados; nesses casos, a recomendação é
  desativar o cenário para manter o histórico.
- Cenário atualmente marcado como referência não é excluído pela interface antes
  de outro cenário ser definido como referência.
- Ao clicar em editar, o modal rola para o formulário de edição.

### Organização Dos Cadastros Base

- Criado modal único para organizar ordem dos cadastros base do Financeiro.
- Permitida organização de cenários por contexto.
- Permitida organização de categorias por contexto.
- Permitida organização de pagadores.
- Adicionado suporte a botões de subir/descer e arrastar para reorganizar.
- Criadas RPCs administrativas para salvar a ordem em lote.
- Criado hotfix incremental `docs/migrations/financial_base_ordering.sql`.

### Orçamento Previsto

- Criado modal de criação e edição de itens previstos.
- Permitido vincular item previsto a um cenário de orçamento.
- Categorias disponíveis são filtradas pelo contexto do cenário.
- Permitido informar valor estimado, fornecedor previsto ou referência,
  prioridade, status, ordem, observações e ativo/inativo.
- O campo `Valor Estimado` do modal de Item Previsto passa a usar máscara de
  moeda em reais, com digitação por centavos semelhante a aplicativos bancários.
- Os campos monetários de Gasto Real e Parcelas passam a usar a mesma máscara
  de moeda em reais, incluindo valor total, entrada e valor da parcela.
- A área de Presentes passa a usar máscara de moeda em reais nos campos de
  valor do presente e valor calculado da cota.
- Permitida exclusão de itens previstos.
- A tabela de Orçamento Previsto passa a ter ações de editar e excluir.
- A tabela de Orçamento Previsto passa a ter ação de detalhes com modal próprio
  para consultar resumo, classificação, fornecedor/referência e observações do
  item previsto.
- A gestão completa de Orçamento Previsto passa a ter página própria dentro do
  módulo Financeiro.
- A página de Orçamento Previsto passa a exibir cards de resumo do cenário
  selecionado, incluindo total previsto, quantidade de itens, categorias e maior
  item.
- A tabela de Orçamento Previsto passa a ter filtro por cenário, iniciando pelo
  cenário de referência do contexto selecionado.
- O seletor de cenário da página de Orçamento Previsto passa a ficar em uma
  área destacada antes dos cards de resumo, deixando claro que ele controla os
  indicadores e a tabela.
- A tabela de Orçamento Previsto passa a ter filtros por busca, categoria,
  status e situação ativa/inativa.
- A tabela de Orçamento Previsto passa a ter filtro por situação do orçamento:
  com saldo, estourado, no limite ou sem gasto vinculado.
- Os cards e prévias de Orçamento Previsto passam a considerar apenas itens
  ativos nos totais principais, mantendo itens inativos disponíveis para
  consulta histórica na tabela.
- O modal de detalhes do Item Previsto passa a oferecer atalho para abrir a
  página de Gastos Reais já filtrada pelos gastos vinculados ao item.
- Itens de Orçamento Previsto passam a aceitar explicitamente categorias
  compartilhadas (`Compartilhado`) em cenários de `Casamento` e `Lua de Mel`.
- A tabela de Orçamento Previsto passa a listar todos os itens compatíveis com
  os filtros ativos, sem limite de resumo.
- Cards e listagens são atualizados após salvar ou excluir.

### Gastos Reais

- Habilitado o botão `Gasto Real` na página Admin `Financeiro`.
- Criado modal de criação e edição de gastos reais.
- Permitido informar contexto, categoria, tipo, valor total, forma de pagamento,
  status, data de contratação/compra, descrição, link ou referência, observações
  e ativo/inativo.
- Permitido vincular opcionalmente fornecedor cadastrado e pagador principal.
- Categorias compartilhadas (`Compartilhado`) podem ser usadas em gastos de
  `Casamento` ou `Lua de Mel`, conforme o contexto escolhido no modal.
- Fornecedores vinculados a gastos reais passam a ser protegidos contra
  exclusão direta; nesses casos, a recomendação é ocultar o fornecedor ou
  remover o vínculo financeiro antes de excluir.
- A tabela de Gastos Recentes passa a ter ações de editar e excluir.
- Criada a seção completa `Gastos Reais`, com todos os gastos do contexto e
  filtros por busca, categoria, tipo, status, pagador e fornecedor.
- A seção `Gastos Reais` passa a ter filtro por vínculo com item previsto,
  permitindo listar gastos com ou sem relação com o orçamento planejado.
- A seção `Gastos Reais` passa a permitir filtrar por um item previsto
  específico, inclusive via link direto com parâmetros de URL.
- A tabela completa de `Gastos Reais` passa a permitir ordenação por gasto,
  tipo, categoria, valores e status.
- A informação de fornecedor passa a aparecer como detalhe abaixo do nome do
  gasto, reduzindo a largura da tabela.
- A informação de pagador principal passa a aparecer na própria coluna do gasto,
  em formato compacto inspirado no indicador `Convidado de`.
- Adicionado card `Falta do Orçamento`, calculado pelo orçamento de referência
  menos o total já pago.
- Cards e listagens são atualizados após salvar ou excluir.
- Gastos reais passam a ter modal de detalhes próprio, com resumo financeiro,
  dados de classificação, vínculo com fornecedor, parcelas e observações.

### Parcelas E Pagamentos

- Criada seção de parcelas dentro do modal de edição de Gasto Real.
- Permitido cadastrar, editar e excluir parcelas manualmente após o gasto real
  existir no banco.
- Parcelas permitem informar número, descrição, valor, vencimento, pagador
  efetivo, status, data de pagamento e observações.
- O modal exibe o total das parcelas cadastradas para o gasto.
- Ao criar um novo gasto real, o modal reabre em modo edição para permitir
  cadastrar parcelas em seguida.
- A seção de parcelas fica oculta durante a criação inicial do gasto e aparece
  apenas após o gasto existir no banco.
- A seção de parcelas no modal de edição de Gasto Real passa a usar uma lista
  de cards com informações essenciais e ações compactas para editar, marcar
  como paga e excluir.
- O cadastro/edição manual de parcelas passa a acontecer em modal próprio,
  aberto pela ação `Nova Parcela` ou pelo botão de edição dos cards.
- A geração automática permanece no modal do Gasto Real como sanfona; quando o
  gasto já possui parcelas, ela inicia fechada para priorizar a lista de
  parcelas existentes.
- Adicionado gerador inicial de parcelas para pagamento à vista, parcelado e
  entrada + parcelas.
- Em `Entrada + parcelas`, o vencimento da entrada fica separado do primeiro
  vencimento das parcelas.
- A tabela de Próximas Parcelas passa a mostrar apenas parcelas em aberto ou
  atrasadas, sem listar parcelas pagas.
- O próximo vencimento e a quantidade de parcelas atrasadas passam a aparecer
  de forma discreta no cabeçalho da seção de Próximas Parcelas.
- A tabela de Próximas Parcelas na Visão Geral passa a ter ação rápida para
  marcar parcela em aberto como paga, com modal para confirmar data de pagamento
  e pagador.
- A tabela de Próximas Parcelas na Visão Geral passa a destacar visualmente
  parcelas vencendo no dia atual e parcelas atrasadas.
- Ao marcar uma parcela como paga, a data de pagamento é preenchida
  automaticamente com a data de vencimento quando ainda estiver vazia.
- Em pagamentos à vista, o gerador oculta o intervalo e permite criar a parcela
  única já como paga usando o vencimento como data de pagamento.
- Criada página própria de Parcelas com filtros por busca, categoria, status e
  pagador, mantendo a consulta completa separada da Visão Geral.
- A página de Parcelas passa a ter ordenação por colunas, ações de Detalhes e
  Excluir na tabela, modal de detalhes e modal próprio de edição de parcela.
- O menu administrativo passa a sinalizar parcelas financeiras vencidas ou com
  vencimento no dia atual no item `Financeiro` e nos subitens `Visão Geral` e
  `Parcelas`.
- As tabelas de Orçamento Previsto, Gastos Reais e Parcelas passam a seguir o
  padrão geral de filtros do Admin, incluindo contador de itens filtrados e ação
  `Limpar Filtros`.
- A página de Cadastros Base do Financeiro recebe cards compactos com contadores,
  ícones, cores e metadados de uso para cenários, categorias e pagadores.
- Os cards de Cadastros Base passam a ter ações compactas de Detalhes e Excluir,
  com modais próprios de detalhes e formulários dedicados para criar/editar
  cenários, categorias e pagadores.
- Na página de Indicadores, a seção antiga `Resumo Financeiro` passa a ser
  identificada como `Valores dos Presentes`, evitando conflito com o novo módulo
  Financeiro.

### Relatórios Financeiros

- A página de Relatórios passa a organizar os cards em seções: `Convidados e
  Operação`, `Presentes` e `Financeiro`.
- O relatório antigo de `Valores Reservados` passa a ser apresentado como
  `Presentes e Cotas`, evitando ambiguidade com o novo módulo Financeiro.
- Criados cards financeiros separados para `Orçamento Previsto`, `Gastos Reais`
  e `Parcelas`.
- Criado CSV de `Orçamento Previsto`, com filtros por contexto, cenário,
  categoria, status e situação do orçamento.
- O relatório de `Orçamento Previsto` passa a filtrar itens ativos por padrão,
  permitindo selecionar todos ou apenas inativos quando necessário.
- Criado CSV de `Gastos Reais`, com filtros por contexto, categoria, tipo,
  status, pagador, fornecedor e vínculo com item previsto.
- O CSV de `Gastos Reais` permite incluir as parcelas logo abaixo de cada gasto,
  identificando as linhas como `Gasto` ou `Parcela`.
- Criado CSV de `Parcelas`, com filtros por contexto, categoria, status,
  pagador e período de vencimento.
- Os relatórios financeiros em CSV passam a permitir seleção de colunas no
  mesmo padrão visual dos demais relatórios consolidados.
- Criada exportação XLSX para `Orçamento Previsto`, `Gastos Reais` e
  `Parcelas`, reaproveitando o padrão visual das planilhas já existentes.
- O XLSX de `Gastos Reais` passa a mesclar dados do gasto quando as parcelas
  são incluídas logo abaixo dele, reduzindo repetição visual.
- O XLSX de `Parcelas` passa a agrupar parcelas por gasto e mesclar de forma
  leve as colunas de contexto do gasto.
- Criada exportação PDF para `Orçamento Previsto`, em formato executivo com
  totais, cenário, contexto e destaque para itens estourados ou sem gasto
  vinculado.
- Criada exportação PDF para `Gastos Reais`, em blocos por gasto, com resumo
  financeiro e parcelas opcionais abaixo de cada item.
- Criada exportação PDF para `Parcelas`, em formato de agenda financeira
  agrupada por mês de vencimento e destaque para parcelas atrasadas.

## Observações

- O contexto `Todos` deve funcionar como visão consolidada.
- O alerta principal de orçamento deve comparar o total contratado com o cenário
  de referência do contexto.
- Em `Todos`, a comparação padrão deve somar os cenários de referência de
  `Casamento` e `Lua de Mel`.
- Cenários alternativos existem para planejamento e simulação, mas não afetam os
  cards principais salvo quando marcados como referência.
- Relatórios de gastos, parcelas e pagamentos não dependem de cenário.
- Relatórios que envolvem orçamento previsto devem permitir escolha de cenário
  ou usar o cenário de referência por padrão.
- Gastos reais podem ser vinculados opcionalmente a itens previstos do mesmo
  contexto, permitindo acompanhar realizado, pago, em aberto e diferença por
  item do orçamento.

## Como Aplicar Em Um Projeto Existente

1. Rodar a migração:

   ```sql
   docs/migrations/financial_management.sql
   ```

2. Rodar a verificação:

   ```sql
   docs/migrations/financial_management_verify.sql
   ```

3. Se a primeira versão do Financeiro já tiver sido aplicada antes do hotfix do
   resumo, rodar:

   ```sql
   docs/migrations/financial_summary_rpc_fix.sql
   ```

4. Verificar o hotfix:

   ```sql
   docs/migrations/financial_summary_rpc_fix_verify.sql
   ```

5. Rodar o hotfix de guarda dos cenários de referência:

   ```sql
   docs/migrations/financial_budget_scenario_reference_guard.sql
   ```

6. Verificar o hotfix:

   ```sql
   docs/migrations/financial_budget_scenario_reference_guard_verify.sql
   ```

7. Rodar o hotfix de organização dos cadastros base:

   ```sql
   docs/migrations/financial_base_ordering.sql
   ```

8. Verificar o hotfix:

   ```sql
   docs/migrations/financial_base_ordering_verify.sql
   ```

9. Rodar o hotfix de categorias compartilhadas no Orçamento Previsto:

   ```sql
   docs/migrations/financial_budget_shared_categories_fix.sql
   ```

10. Verificar o hotfix:

   ```sql
   docs/migrations/financial_budget_shared_categories_fix_verify.sql
   ```

11. Rodar o hotfix de proteção de exclusão de fornecedores vinculados ao
    Financeiro:

   ```sql
   docs/migrations/vendor_financial_delete_guard.sql
   ```

12. Verificar o hotfix:

   ```sql
   docs/migrations/vendor_financial_delete_guard_verify.sql
   ```

13. Rodar a evolução de vínculo entre gastos reais e itens previstos:

   ```sql
   docs/migrations/financial_expense_budget_item_link.sql
   ```

14. Rodar o hotfix de alerta de parcelas financeiras vencidas ou vencendo hoje
    no menu:

   ```sql
   docs/migrations/admin_nav_financial_overdue_payments.sql
   ```

15. Verificar o hotfix:

   ```sql
   docs/migrations/admin_nav_financial_overdue_payments_verify.sql
   ```

16. Verificar novamente o módulo Financeiro:

   ```sql
   docs/migrations/financial_management_verify.sql
   ```

Não é necessário rodar o rebuild em um projeto existente. O rebuild consolidado
é destinado apenas a projetos novos ou reconstruções limpas.
