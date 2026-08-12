# Site de Casamento - L & M - v4.4

Esta release concentra melhorias visuais e de experiência na área
administrativa, com foco no Dashboard inicial, navegação responsiva e
padronização do cabeçalho das páginas do painel.

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
- No mobile, a experiência administrativa passou a se aproximar de um aplicativo:
  topbar fixa com o nome da área atual, comportamento de ocultar/exibir ao
  rolar a página e navbar inferior com atalhos principais.
- A opção "Mais" da navbar mobile abre o menu administrativo completo,
  preservando o acesso às páginas menos frequentes sem ocupar espaço excessivo.
- Os alertas do menu administrativo também passaram a considerar links da
  navegação mobile, mantendo sinais de pendência consistentes.

### Dashboard Inicial

- O topo da dashboard foi reorganizado para usar o padrão global:
  "Painel Administrativo", "Visão Geral" e descrição curta.
- A seção "O que merece atenção agora" foi suavizada para funcionar como faixa
  discreta de contexto, sem competir com o cabeçalho principal nem com os cards.
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

## Observações De Fechamento

- Esta release não inclui migrações de banco, alterações de RPC ou novos
  scripts de rebuild.
- As mudanças se concentram em HTML, CSS e JavaScript da experiência
  administrativa.
