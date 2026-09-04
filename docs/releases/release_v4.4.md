# Site de Casamento - L & M - v4.4

Esta release concentra melhorias visuais e de experiência na área
administrativa, com foco em tornar o painel mais profissional, mais compacto e
mais confortável no desktop e no mobile, sem perder a identidade delicada do
casamento.

## Concluído

### Experiência Administrativa

- O Dashboard inicial passou por refinamento visual para ficar mais profissional
  e menos pesado, mantendo a identidade roxa e delicada do casamento.
- O cabeçalho das páginas administrativas foi padronizado como uma composição
  editorial, sem aparência de card, com subtítulo, título, descrição e detalhe
  ornamental discreto.
- Os títulos principais do admin passaram a usar uma tipografia mais limpa e
  adequada para sistema, preservando o tom romântico nos detalhes visuais.
- O `admin-common.js` passou a preencher descrições curtas automaticamente nos
  cabeçalhos das páginas administrativas, garantindo consistência entre as
  áreas sem duplicar marcação em todos os HTMLs.
- A navegação lateral do desktop recebeu agrupamentos visuais por área, ícones,
  estados ativos mais claros e foco automático no item selecionado quando
  possível.
- O foco automático do menu lateral foi refinado para centralizar corretamente a
  opção ativa, inclusive em páginas dentro de submenus como Financeiro.
- No mobile, a experiência administrativa passou a se aproximar de um aplicativo:
  topbar fixa com o nome da área atual, comportamento de ocultar/exibir ao
  rolar a página e navbar inferior com atalhos principais.
- A opção "Mais" da navbar mobile abre o menu administrativo completo,
  preservando o acesso às páginas menos frequentes sem ocupar espaço excessivo.
- Os alertas do menu administrativo também passaram a considerar links da
  navegação mobile, mantendo sinais de pendência consistentes.
- As páginas administrativas passaram a usar áreas superiores mais compactas,
  reduzindo redundâncias como títulos duplicados e aproximando ações, filtros e
  conteúdo principal.
- Botões gerais de topo, ações discretas e toggles foram padronizados em várias
  páginas para reduzir peso visual e melhorar a leitura.

### Dashboard Inicial

- O topo da dashboard foi reorganizado para usar o padrão global:
  "Painel Administrativo", "Visão Geral" e descrição curta.
- A seção "O que merece atenção agora" foi removida do topo, deixando a
  dashboard começar de forma mais direta pelos indicadores e mantendo apenas o
  status discreto de atualização.
- O texto de status foi refinado para "Atualizado agora", sem pontuação final,
  acompanhando o padrão visual mais leve.
- Os cards de métricas ficaram mais compactos, com sombras e ícones menos
  pesados.
- Os cards de "Pessoas Esperadas", "Convidados Pagantes", "Valor Confirmado",
  "Presentes Informados", "Recados Pendentes" e "Falhas de E-mail" receberam
  ícones e hierarquia visual mais clara.
- Os painéis de "Presença" e "Presentes" foram refinados com cabeçalhos mais
  limpos, links de ação discretos e legendas mais escaneáveis.
- Ações rápidas da dashboard receberam ícones discretos e menor peso visual.
- Ícones incompatíveis com a versão atual do Lucide foram substituídos por
  alternativas suportadas.

### Páginas De Gestão

- A página de Convidados recebeu topo mais direto, filtros recolhíveis e ações
  compactas para atualizar, exportar e criar convites, preservando a tabela no
  desktop e usando cards no mobile.
- A listagem mobile de Convidados foi refinada para exibir informações como
  "Convidado de" de forma mais organizada, com indicador visual e texto lado a
  lado.
- O controle de convite enviado na página de Convidados ganhou aparência de
  toggle, alinhado ao padrão usado depois em outras páginas.
- A página de RSVP recebeu o mesmo padrão de topo compacto, filtros recolhíveis,
  tabela desktop e cards mobile.
- Na tabela e nos cards de RSVP, convites de casal passaram a sinalizar a
  presença de cada membro diretamente no nome do convite, com check verde para
  presença confirmada e X vermelho para ausência.
- Para convites de casal, a renderização do nome do RSVP preserva textos
  cadastrados no convite, como "e Família", enriquecendo apenas os nomes dos
  membros encontrados dentro do texto.
- A coluna "Presença" da tabela de RSVP foi simplificada para mostrar somente o
  resumo geral do convite.
- A página de Presentes do Admin recebeu ajustes na tabela, cards mobile e
  indicação discreta do modo de compra do presente: Dinheiro/PIX/Cartão, Compra
  Externa ou Híbrida.
- Na tabela de Presentes, valor e tipo ficaram mais integrados ao nome do
  presente, enquanto a visualização de convidados em presentes por cotas ficou
  menos pesada e mais consistente com presentes individuais.
- A página de Recados foi revisada dentro do padrão visual administrativo,
  mantendo moderação, resposta e estados dos recados sem alterar o fluxo de
  negócio.
- A página de Checklist recebeu refinamentos de cabeçalho, filtros e ações para
  acompanhar o padrão administrativo adotado nas demais telas.
- A página de Programação passou a separar melhor Etapas e Atividades, com
  títulos de seção mais claros, métricas acima das listagens e toggle de
  visibilidade no padrão dos demais controles.
- A página de Mesas teve topo e filtros revisados sem alterar os cards de mesa,
  que já estavam em bom estado visual e responsivo.
- A página de Fornecedores recebeu o padrão visual novo, incluindo filtros,
  ações compactas e toggle de visibilidade mais elegante.
- A página de Notificações teve cards mobile, paginação, texto de intervalo e
  ações de detalhe refinados para melhorar leitura e usabilidade.
- A página de Configurações recebeu ajustes na tabela de preferências de
  notificação no desktop e representação em cards no mobile, com toggles
  alinhados à direita.
- A página de Relatórios Consolidados teve o topo revisado para seguir o padrão
  administrativo, preservando a organização e os relatórios existentes.

### Financeiro Administrativo

- A Visão Geral Financeira recebeu o novo padrão de cabeçalho e removeu ações de
  topo redundantes, mantendo foco nas seções principais.
- A lista/tabela de Próximas Parcelas foi refinada para desktop e mobile, com
  cards compactos no mobile e clique na linha/card para abrir detalhes da
  parcela.
- A navegação interna do Financeiro foi ajustada para distribuir melhor as
  opções de Visão Geral, Orçamento Previsto, Gastos Reais, Parcelas e Cadastros
  Base, mantendo a aba ativa visível no mobile.
- As páginas de Orçamento Previsto, Gastos Reais, Parcelas e Cadastros Base
  receberam os refinamentos visuais e de usabilidade aplicados às demais páginas
  administrativas.
- Em Gastos Reais, a tabela passou a ordenar por data de contratação/compra,
  com padrão do mais recente para o mais antigo, e a organização das colunas foi
  ajustada para reduzir largura horizontal.
- Em Parcelas, filtros, ações, detalhes e edição foram mantidos no padrão das
  demais tabelas administrativas.

## Observações De Fechamento

- Esta release não inclui migrações de banco, alterações de RPC ou novos
  scripts de rebuild.
- As mudanças se concentram em HTML, CSS e JavaScript da experiência
  administrativa.
- Não há scripts SQL obrigatórios para rodar nesta release.
