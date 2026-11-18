# Site de Casamento - L & M - v5.1

Esta release reúne efeitos atmosféricos reutilizáveis nos heros públicos,
efeitos decorativos na página inicial, melhorias nas mensagens de convite do
Admin e o novo jogo opcional de quebra-cabeça no RSVP, com gerenciamento
administrativo próprio. O escopo descrito abaixo foi concluído em 17 de novembro
de 2026.

## Implementado

### Efeitos Visuais Nos Heros

- Criado um efeito atmosférico reutilizável com névoa suave e pontos de luz que
  sobem em velocidades variadas.
- Aplicado aos heros da página inicial, Nossa História, Pré-Wedding, RSVP,
  Manual dos Convidados, Programação, Mural de Recados e Fornecedores.
- Centralizadas as regras visuais em `css/hero-atmosphere.css` e a criação das
  camadas decorativas em `js/hero-atmosphere.js`, evitando manter implementações
  separadas em cada página.
- A animação respeita a preferência do sistema por movimento reduzido.

### Efeitos De Entrada Na Página Inicial

- Adicionados estouros decorativos em tons de lilás e roxo quando as seções da
  página inicial entram na área visível.
- Cada entrada apresenta três estouros em sequência, distribuídos em diferentes
  alturas da tela. O efeito não bloqueia cliques nem a rolagem.
- Para quem prefere movimento reduzido, os estouros aparecem sem animação.

### Mensagens De Convite No Admin

- O modal de mensagem personalizada em Convidados agora oferece as versões
  detalhada, curta e intermediária, para convites individuais ou de casal.
- A versão curta apresenta data e horário da Missa Nupcial. A intermediária
  acrescenta os locais e informa que a recepção acontece após a missa.
- As versões curta e intermediária mencionam o Convite Digital em PDF e
  lembram o admin de anexá-lo manualmente no WhatsApp. O sistema não armazena
  nem envia o PDF.
- Todas as versões continuam editáveis antes de copiar; a versão detalhada é
  selecionada por padrão.

### Jogos Interativos No RSVP

- Criada a configuração de um jogo por convite, com tipos para convidados em
  geral, Pais, casal de Padrinhos/Madrinhas, Padrinho ou Madrinha.
- Criada uma página administrativa para configurar jogos especiais
  individualmente e criar jogos gerais em lote, revisar nomes e relação,
  visualizar, editar, remover, ativar/desativar jogos e consultar conclusões
  com modais para detalhes/edição, switch imediato para o status e caixa de
  confirmação nativa para remoção.
- A tabela administrativa permite ordenar e filtrar por convite/nomes, tipo de
  jogo, status e participação. Clicar na linha ou no card mobile abre os
  detalhes; as ações permanecem separadas dos cliques no switch e nos botões.
- A interface mobile usa cards; a coluna de ações da tabela mantém Editar e
  Remover empilhados, e o card abre os detalhes ao ser clicado.
- Mensagens finais são modelos padrão editáveis por tipo, com variantes
  singular/plural; cada jogo usa os nomes e a relação configurados para o
  convite.
- Adicionado ao RSVP um botão flutuante para abrir a pergunta e o quebra-cabeça
  de quatro peças. O convite pode pular e voltar depois, rever a mensagem e
  rejogar; cada conclusão incrementa o contador do convite.
- Incluídas as três artes vetoriais finais — geral, Pais e
  Padrinhos/Madrinhas — em arquivos `art.svg`. O jogo recorta cada arte em
  quatro quadrantes no navegador, sem arquivos separados por peça.
- A migration inicial `rsvp_games.sql` cria as tabelas de jogo e de modelos de
  mensagem, com RLS e RPCs restritas. O estado do jogo permanece separado da
  confirmação de presença.

## Banco De Dados E Compatibilidade

- As mudanças visuais e as mensagens do convite são executadas no frontend.
- Os jogos do RSVP requerem a migration inicial `docs/migrations/rsvp_games.sql`
  em um banco existente, antes de o jogo aparecer no RSVP. Para projetos novos,
  as tabelas e RPCs também estão incorporadas em
  `docs/rebuild/supabase_rebuild_full_setup.sql`.
- A migration não altera `rsvps`, `rsvps.guest_data` nem o fluxo de confirmação
  de presença.

## Fechamento Da Release

- A release v5.1 está concluída e reúne as funcionalidades e melhorias
  descritas neste documento.
- Para ativar os Jogos do RSVP em um banco existente, aplicar e verificar
  `docs/migrations/rsvp_games.sql`. Em instalações novas, usar a versão
  consolidada em `docs/rebuild/supabase_rebuild_full_setup.sql`.
- O fechamento desta release registra a conclusão do escopo no código e na
  documentação; não confirma por si só a publicação do site nem a aplicação da
  migration no Supabase.
