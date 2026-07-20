# Site de Casamento - L & M - v4.0

Esta release inaugura as áreas de Fornecedores, Programação e Checklist do
casamento, marcando uma nova etapa do site como central de conteúdo para
convidados e também de organização para os noivos. Além dos fluxos principais
de RSVP, presentes, fotos e recados, a versão adiciona um checklist
administrativo com categorias e tarefas padrão por período, e refina a
experiência pública da Lista de Presentes, especialmente nos textos dos modais
e na organização visual dos cards.

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
- Atualizados o rebuild completo, a verificação final e o runbook para incluir
  as tabelas e RPCs de Fornecedores, Programação e Checklist.
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
```

Depois valide com:

```sql
docs/migrations/wedding_vendors_verify.sql
docs/migrations/wedding_schedule_verify.sql
```

Não é necessário subir Edge Function para esta release.

## Fora Do Escopo

- Controle de gastos, contratos ou pagamentos de fornecedores.
- Upload administrativo de imagens.
- Avaliações, depoimentos ou indicação pública feita pelos convidados.
