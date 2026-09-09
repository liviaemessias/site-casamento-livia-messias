# Site de Casamento - L & M - v4.5

Esta release concentra a finalização da experiência pública refinada, com foco
na Home, navegação, lista de presentes, logins e pequenos ajustes de
usabilidade que deixam o site mais direto para os convidados.

## Concluído

### Home E Navegação Pública

- A página inicial recebeu atalhos circulares logo abaixo da data do casamento,
  oferecendo acesso imediato a RSVP, Lista de Presentes, Local, Recados, Nossa
  História e Menu.
- O botão antigo de confirmação de presença da hero foi removido, dando lugar a
  ações rápidas mais compactas e equilibradas com a composição visual.
- Os atalhos da hero receberam ícones SVG, `aria-label` e `title`, preservando
  clareza visual, acessibilidade e indicação de contexto no hover.
- O atalho de Local foi posicionado entre Presentes e Recados, levando à seção
  de Cerimônia e Recepção na própria Home.
- Foi criado um padrão reutilizável de painel lateral para a navegação pública,
  usado pelo atalho de menu da hero e pelo hambúrguer das páginas públicas.
- O novo painel público possui botão de fechar com `X`, fechamento ao clicar em
  links, ao clicar fora do painel e pela tecla `Esc`.
- O menu público preserva as opções específicas de cada página, incluindo casos
  como Nossa História, Programação e Pré-Wedding.
- As âncoras de Cerimônia e Recepção na Home passaram a considerar o header
  fixo, evitando que o scroll ultrapasse o começo dos cards.

### Lista Pública De Presentes

- A lista pública de presentes foi reformulada para cards mais compactos,
  permitindo melhor aproveitamento do espaço no desktop e duas colunas no
  mobile quando houver largura suficiente.
- Os cards passaram a priorizar informações essenciais, mantendo preço,
  categoria, status, formas de pagamento, ações e detalhes em uma estrutura mais
  leve.
- Presentes sem foto receberam uma área visual com coração decorativo,
  preservando a consistência do grid.
- Presentes externos sem valor cadastrado passam a exibir "Presente combinado"
  no estilo visual do valor, evitando vão excessivo ou aparência de item
  incompleto.
- Informações de cotas foram reposicionadas como selo sobre a imagem, reduzindo
  peso visual no corpo do card.
- Presentes ou cotas associados ao convite logado receberam selos discretos no
  canto superior do card para indicar itens comprados, aguardando confirmação ou
  reservados com ação pendente.
- O texto de status distingue compra e pagamento conforme o modo do presente,
  usando "Pagamento" para PIX/cartão e "Compra" para loja online ou física.
- Quando uma cota confirmada pertence ao convite logado, o card mostra
  "Comprado por você" ou "Comprado por vocês", conforme o tipo de convite.
- Quando todas as cotas de um presente estão confirmadas, o card passa a
  indicar o presente como "Comprado".
- Os botões dos cards foram alinhados e compactados para reduzir quebras,
  transbordamentos e desalinhamento entre presentes individuais, cotas e itens
  com ações pendentes.
- A seção de Presentes para Concluir foi alinhada ao novo padrão visual dos
  cards, incluindo acesso à forma escolhida, troca de forma quando aplicável e
  ação para informar pagamento ou compra.
- O botão de confirmação de pagamento/compra ganhou indicação visual discreta
  com símbolo de check.

### Pagamento PIX E Formas De Presentear

- Os cards públicos passaram a exibir ícones SVG para indicar formas de
  pagamento ou compra disponíveis, como PIX, cartão e compra externa.
- O ícone do PIX foi ajustado para se aproximar melhor da identidade visual do
  método, mantendo integração com a paleta do site.
- Os modais de PIX passaram a incluir uma frase curta sobre parcelamento pelo
  aplicativo do banco, com concordância para convite individual ou de casal.
- No desktop, o modal de PIX organiza QR-Code e código Copia e Cola lado a lado,
  aproveitando melhor a largura disponível.
- A ação de copiar o PIX Copia e Cola foi mantida de forma compacta e integrada
  ao próprio bloco do código, sem botão grande separado.
- O toast de código PIX copiado foi ajustado para aparecer acima do modal, sem
  parecer ficar atrás da camada de sobreposição.

### Filtros Públicos De Presentes

- O painel de filtros da lista de presentes foi refinado visualmente para ficar
  mais discreto, elegante e responsivo.
- O seletor principal passou a usar labels com capitalização adequada, incluindo
  "Todos os presentes", "Disponíveis" e "Reservados/comprados".
- Os seletores públicos foram harmonizados com o visual adotado em RSVP para
  quantidade de acompanhantes e idade da criança.
- Mensagens de estado vazio e textos auxiliares foram revisados para respeitar
  convite individual ou de casal.
- Foi adicionada a opção de filtrar presentes comprados ou reservados pelo
  próprio convite logado.

### Logins

- Os logins de convidado e administrador foram compactados para ocupar menos
  altura e parecerem mais leves.
- O card principal, a logo, os campos, os botões, mensagens e links receberam
  espaçamentos menores no desktop e no mobile.
- O login administrativo foi ajustado com atenção especial ao mobile, reduzindo
  a sensação de tela alta demais sem remover as marcas d'água decorativas.

## Observações De Fechamento

- Esta release não inclui migrações de banco, alterações de RPC ou novos
  scripts de rebuild.
- As mudanças se concentram em HTML, CSS e JavaScript da experiência pública.
- Não há scripts SQL obrigatórios para rodar nesta release.
