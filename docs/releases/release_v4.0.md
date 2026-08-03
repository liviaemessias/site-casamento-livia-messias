# Site de Casamento - L & M - v4.0

Esta release inaugura as áreas de Fornecedores, Programação, Checklist e Mesas
do casamento, marcando uma nova etapa do site como central de conteúdo para
convidados e também de organização para os noivos. Além dos fluxos principais
de RSVP, presentes, fotos e recados, a versão adiciona um checklist
administrativo com categorias e tarefas padrão por período, gestão de mesas da
recepção com ocupação planejada, confirmada e híbrida, e refina a experiência
pública da Lista de Presentes, especialmente nos textos dos modais e na
organização visual dos cards. A gestão de convidados também passa a registrar
se cada convite é da Noiva, do Noivo ou do Casal, preparando a base para
filtros, mesas e relatórios de organização. Os Relatórios Consolidados também
ganham auditorias operacionais das mesas, um mapa exportável e uma lista para
recepção em CSV, XLSX e PDF.

## Concluído

### Fornecedores

- Adicionada a página pública `vendors.html` para exibir fornecedores do
  casamento aos convidados.
- Adicionado menu `Fornecedores` nas páginas públicas principais.
- Criado estado vazio amigável para quando ainda não houver fornecedores
  visíveis no site.
- Criados cards públicos com categoria, nome, responsáveis, descrição, imagem,
  Instagram, site e WhatsApp, exibindo apenas os dados preenchidos.
- Mantida a renderização da página por APIs do DOM, sem `innerHTML`.

### Administração De Fornecedores

- Criada a página administrativa `admin-vendors.html`.
- Adicionado cadastro, edição, listagem, filtros, controle de visibilidade,
  destaque, ordenação e exclusão de fornecedores.
- Adicionado modal `Organizar Ordem` com arrastar e soltar, botões de
  subir/descer e salvamento da ordem pública em lote.
- Adicionados cards de métricas para total, visíveis, ocultos e destaques.
- Integrada a nova página ao menu administrativo e ao carregamento protegido do
  painel.
- Criada a tabela `wedding_vendors` e RPCs seguras para listagem pública e
  administração protegida por `is_admin()`.

### Programação

- Adicionada a página protegida `schedule.html` para exibir a programação do
  casamento somente a convidados logados.
- A programação é organizada em etapas criadas pelo admin, como Cerimônia e
  Recepção, cada uma com local, endereço opcional, descrição e ordem.
- Atividades podem ser cadastradas como Momento, Atração, Ilha, Serviço ou
  Outro.
- Atividades aceitam horário específico, período, disponibilidade durante a
  etapa ou horário a definir.
- Criado estado vazio amigável para quando ainda não houver programação
  visível no site.
- Mantida a renderização por APIs do DOM, sem `innerHTML`.

### Administração Da Programação

- Criada a página administrativa `admin-schedule.html`.
- Adicionados cards de métricas, filtros, ordenação por colunas úteis,
  controles de visibilidade, cadastro, edição, detalhes e exclusão de etapas e
  atividades.
- Adicionados modais de organização de ordem para etapas e atividades, com
  arrastar e soltar e botões de subir/descer.
- Integrada a nova página ao menu administrativo e ao carregamento protegido do
  painel.
- Criadas as tabelas `wedding_schedule_sections` e
  `wedding_schedule_activities`, com RLS habilitado e acesso somente por RPCs.

### Checklist Do Casamento

- Criada a página administrativa `admin-checklist.html`.
- Adicionado checklist em cards agrupados por período, de `12 meses antes` até
  `Depois do casamento`.
- Adicionados cards de métricas para total, pendentes, em andamento,
  concluídas e atrasadas.
- Adicionados filtros por busca, período, status, categoria, responsável e
  prioridade.
- Adicionada exportação CSV das tarefas considerando os filtros atuais.
- Adicionada organização manual da ordem das tarefas dentro de cada período,
  com setas e arrastar/soltar.
- Adicionadas ações rápidas discretas nos períodos para criar tarefa e
  organizar a ordem daquele período.
- Adicionado alerta simples no menu administrativo quando houver tarefas
  atrasadas no Checklist.
- Adicionados modais padrão para criar, editar, detalhar e excluir tarefas.
- Adicionada gestão de categorias editáveis com nome, cor, ícone, ordem e
  status ativo/inativo.
- Adicionada gestão de responsáveis editáveis, permitindo cadastrar pessoas,
  grupos, família, cerimonial e outros responsáveis pelo checklist.
- Criadas categorias e tarefas iniciais pelo SQL de setup/rebuild, incluindo
  Pré-Wedding, Save the Date, Caixinha dos Padrinhos e Caixinha dos Pais.

### Lista De Presentes

- Removida a opção `Enviar comprovante` dos modais públicos de presentes.
- Revisados textos dos modais públicos para adaptar concordância entre convite
  individual e convite de casal.
- Padronizada a escrita `QR-Code` nos textos públicos e na documentação.
- Ajustadas instruções de PIX, cartão, compra online e loja física para ficarem
  mais naturais para convidados individuais e casais.
- Melhorada a distribuição dos cards de pendências e das categorias de
  presentes em telas desktop e mobile.

### RSVP E Restrições Alimentares

- Adicionada escolha explícita `Sim`/`Não` para restrição alimentar no RSVP
  público e nos RSVPs manuais do painel administrativo.
- O campo de detalhe da restrição alimentar passa a aparecer somente quando a
  resposta é `Sim`.
- Criado o campo `food_restriction` em `rsvps`, mantendo `food` apenas como
  detalhe textual.
- Atualizados filtros, tabela, detalhes, CSVs, relatórios e e-mails para usar a
  escolha explícita, preservando compatibilidade com RSVPs antigos.

### Convidados

- Adicionado o campo administrativo `Convidado de`, com opções Noiva, Noivo e
  Casal.
- Atualizados cadastro, edição, filtro, tabela, modal de detalhes e exportação
  CSV da página de convidados.
- Atualizados relatórios de presença/buffet e pendências para incluir a nova
  coluna selecionável `Convidado de`.
- Atualizadas as RPCs administrativas de criação e edição de convidados para
  validar o valor no banco.
- Atualizada a página de Indicadores com cards e gráfico de distribuição dos
  convidados por Noiva, Noivo e Casal.

### Mesas

- Criada a página administrativa `admin-tables.html` para definição de mesas da
  recepção.
- Adicionados modos de ocupação `Híbrido`, `Confirmado` e `Planejado`.
- Adicionados cards de métricas, filtros, exportação CSV, cadastro, edição,
  detalhes, exclusão e organização manual da ordem das mesas.
- Adicionada ação de ativar/desativar mesa diretamente pelo modal de detalhes,
  com RPC administrativa dedicada.
- Adicionada atribuição de convidados às mesas, com remoção e realocação
  protegidas por RPCs administrativas.
- Adicionada ação rápida para trocar convidados de mesa pelos cards e pelo
  modal de detalhes de mesa.
- Observações das atribuições de convidados às mesas passam a ter indicador
  discreto, modal de leitura e coluna na exportação CSV.
- Convidados inativos atribuídos a mesas ficam sinalizados e não entram na
  ocupação Planejada, Confirmada ou Híbrida.
- Convidados atribuídos a mesas que responderam RSVP como ausência ficam
  sinalizados na mesa e no CSV de exportação.
- Integrada a informação de mesa na página de Convidados, com filtro, detalhes
  e exportação CSV.
- Integrada a informação de mesa na página de RSVPs, com filtro, exibição
  discreta abaixo do convidado e exportação CSV.
- Adicionados filtros de `Com mesa` e `Sem mesa` nas páginas de Convidados e
  RSVPs.
- Adicionadas ações para definir, trocar e remover mesa no modal de detalhes
  do Convidado.
- Adicionado atalho `Gerenciar Mesa` no modal de detalhes do RSVP, abrindo o
  convidado correspondente em contexto.
- Integradas as informações de mesa e observação do convidado na mesa ao
  relatório de Presença/Buffet em CSV e XLSX, com seleção opcional de colunas.
- Adicionada pendência operacional para convidados confirmados sem mesa no
  relatório de Pendências.
- Atualizada a página de Indicadores com cards e gráfico de situação das
  mesas, incluindo mesas ativas, com vagas, lotadas, acima da capacidade,
  convites com/sem mesa e alertas de organização.

### Relatórios Consolidados

- Adicionado o relatório de Mapa de Mesas em CSV e XLSX, com modos de ocupação
  Híbrido, Confirmado e Planejado e opções resumida por convite ou detalhada por
  pessoa.
- Adicionado o PDF operacional do Mapa de Mesas, com blocos por mesa,
  capacidade, ocupação, vagas, pessoas, observações, data do casamento e
  destaque para pessoas ainda sem mesa.
- Ampliado o relatório de Ações Pendentes com auditorias de mesas acima da
  capacidade, mesas inativas com convidados, convidados inativos ou ausentes
  ainda alocados e crianças confirmadas sem idade válida para o buffet.
- Consolidadas linhas idênticas no relatório de Ações Pendentes para evitar
  duplicidades na exportação.
- Adicionada a Lista para Recepção detalhada por pessoa confirmada, em ordem
  alfabética ou agrupada por mesa.
- Adicionadas exportações CSV, XLSX e PDF para a Lista para Recepção, com
  seleção de colunas e sem expor código de convite, restrições alimentares ou
  dados financeiros.
- Adicionada a coluna opcional Categoria do Buffet à Lista para Recepção,
  desmarcada por padrão e disponível em CSV, XLSX e PDF.
- Criado o Relatório Final do Buffet somente com pessoas confirmadas, incluindo
  totais de pagantes, adultos, crianças por categoria, regra etária aplicada,
  convites com restrição, RSVPs pendentes e confirmados sem mesa.
- O XLSX do buffet possui abas separadas para Resumo, Pessoas Confirmadas,
  Resumo por Mesa e Restrições Alimentares.
- O relatório oferece um PDF resumido, com totais e restrições, e um PDF
  completo, com todas as pessoas confirmadas ordenadas por mesa.
- As restrições permanecem vinculadas ao RSVP: o relatório lista o responsável
  e as pessoas confirmadas do convite sem atribuir o texto a uma pessoa
  específica.
- O PDF da recepção possui marcação manual de chegada, destaque para pessoas
  confirmadas sem mesa, cabeçalho, data do casamento, data de geração e
  numeração de páginas.
- Criada infraestrutura reutilizável de geração de PDFs tabulares no frontend,
  com quebra automática de textos e cabeçalhos repetidos em documentos de
  várias páginas.
- Adicionado o Checklist Operacional Final em XLSX e PDF dentro de Ações
  Pendentes, consolidando pendências automáticas com tarefas não concluídas do
  Checklist do Casamento.
- Adicionada seleção de conteúdo ao Checklist Operacional Final para exportar
  tudo consolidado, somente pendências automáticas ou somente tarefas do
  checklist.
- Separada visualmente a seleção de colunas de Ações Pendentes, que se aplica
  somente às respectivas exportações CSV e XLSX.
- O checklist operacional apresenta prioridade, área, origem, responsável,
  status, prazo, período e ação, com tarefas atrasadas no topo, resumo de totais
  e marcação manual de conclusão.
- Adicionada formatação de prioridade e andamento nas planilhas XLSX e nos PDFs
  operacionais, com data do casamento, data de geração e paginação.

### Banco, Rebuild E Documentação

- Adicionado o script incremental `docs/migrations/wedding_vendors.sql`.
- Adicionado o verificador incremental
  `docs/migrations/wedding_vendors_verify.sql`.
- Adicionado o script incremental `docs/migrations/wedding_schedule.sql`.
- Adicionado o verificador incremental
  `docs/migrations/wedding_schedule_verify.sql`.
- Adicionado o script incremental
  `docs/migrations/rsvp_food_restriction_choice.sql`.
- Adicionado o verificador incremental
  `docs/migrations/rsvp_food_restriction_choice_verify.sql`.
- Adicionado o script incremental `docs/migrations/wedding_checklist.sql`.
- Adicionado o verificador incremental
  `docs/migrations/wedding_checklist_verify.sql`.
- Adicionado o script incremental `docs/migrations/guest_side_migration.sql`.
- Adicionado o verificador incremental
  `docs/migrations/guest_side_verify.sql`.
- Adicionado o script incremental `docs/migrations/wedding_tables.sql`.
- Adicionado o verificador incremental
  `docs/migrations/wedding_tables_verify.sql`.
- Atualizados o rebuild completo, a verificação final e o runbook para incluir
  as tabelas e RPCs de Fornecedores, Programação, Checklist, Mesas e a
  classificação `Convidado de`.
- Atualizados README, modelagem do banco e índice de migrations.

## Observações

- Os dados de responsáveis são opcionais, pois alguns fornecedores podem ter
  apenas o nome da empresa ou marca cadastrada.
- A página pública trata fornecedores como conteúdo informativo para os
  convidados, sem controle financeiro ou gestão de contratos.
- Quando não houver fornecedores visíveis, a página pública exibe uma mensagem
  discreta e amigável, seguindo o padrão usado em Presentes e Recados.
- A Programação é protegida no frontend e no banco: `list_public_schedule()`
  exige sessão autenticada com perfil de convidado válido.

## Como Aplicar Em Um Projeto Existente

Execute:

```sql
docs/migrations/wedding_vendors.sql
docs/migrations/wedding_schedule.sql
docs/migrations/rsvp_food_restriction_choice.sql
docs/migrations/wedding_checklist.sql
docs/migrations/guest_side_migration.sql
docs/migrations/wedding_tables.sql
docs/migrations/security_invite_code_generation.sql
docs/migrations/security_admin_guest_operations.sql
```

Depois valide com:

```sql
docs/migrations/wedding_vendors_verify.sql
docs/migrations/wedding_schedule_verify.sql
docs/migrations/rsvp_food_restriction_choice_verify.sql
docs/migrations/wedding_checklist_verify.sql
docs/migrations/guest_side_verify.sql
docs/migrations/wedding_tables_verify.sql
docs/migrations/security_invite_code_generation_verify.sql
docs/migrations/security_admin_guest_operations_verify.sql
```

Não é necessário subir Edge Function para esta release.

## Fora Do Escopo

- Controle de gastos, contratos ou pagamentos de fornecedores.
- Upload administrativo de imagens.
- Avaliações, depoimentos ou indicação pública feita pelos convidados.
