# Site de Casamento - L & M - v4.3

Esta release concentra melhorias visuais e de identidade da experiência pública
e administrativa do site.

## Concluído

### Identidade Visual Do Casal

- Adicionadas variações SVG da logo do casal em `assets/images/brand/`.
- Os SVGs da logo foram limpos para uso como assets estáticos, removendo
  `DOCTYPE`, metadados, comentários de ferramenta, dimensões fixas em `mm` e
  namespaces não usados.
- A logo passa a ser usada na sidebar administrativa por meio de `<img>`, sem
  SVG inline, com `alt` dinâmico e fallback textual caso o asset não carregue.
- A versão light da logo passa a ser testada no hero da página inicial, de forma
  decorativa e sem interferir na atualização dinâmica dos nomes do casal.
- O hero da página inicial passa a testar uma linguagem mais romântica, com a
  fonte Parisienne no nome do casal e data/botão de confirmação mais discretos.
- A página inicial recebeu refinamentos visuais nas seções de boas-vindas,
  cerimônia e recepção, com ornamento discreto, cards mais leves e detalhes de
  horário mais delicados.
- A seção de contagem regressiva foi suavizada para combinar com o novo tom da
  Home, com cards mais leves, números elegantes e labels menores.
- As seções de chamada para RSVP, Presentes, Programação, Pré-Wedding, Recados
  e Fornecedores receberam botões e fundos mais suaves para acompanhar o estilo
  romântico da página inicial.
- O texto da marca nos headers públicos foi refinado para ficar mais leve,
  mantendo contraste adequado nos estados transparente, rolado e `navbar-light`.
- O roxo principal da identidade visual foi escurecido para `#5B1166`, com
  tons translúcidos, sombras públicas, defaults administrativos, scripts de
  rebuild e estilos de e-mail recalibrados para a nova base.
- Os usos diretos do roxo principal foram reduzidos com `--color-primary-rgb`
  nos CSS e constantes compartilhadas nos módulos administrativos/e-mails,
  mantendo literais apenas onde o valor precisa ser persistido como dado.
- As telas de login de convidados e administradores receberam a logo do casal
  como marca principal, card mais leve e ajustes de espaçamento/responsividade
  mobile sem remover as marcas d'água decorativas; o login administrativo foi
  compactado para ocupar menos altura em telas menores e a logo passa a voltar
  para o início do site.
- A logo do casal foi adicionada de forma discreta aos rodapés públicos,
  reforçando a identidade sem competir com a navegação; as páginas de RSVP e
  Presentes também receberam rodapés no mesmo padrão.
- A logo dos rodapés públicos passa a funcionar como atalho para voltar à
  página inicial, com foco acessível e hover discreto.
- A página de RSVP recebeu refinamentos visuais no card do formulário, campos,
  opções binárias em formato de switch segmentado, incluindo presença e
  restrição alimentar, seleção de criança para acompanhantes e botão principal,
  mantendo a restrição alimentar do convidado principal no fluxo natural do
  formulário e a hero existente sem alterações.
- A página de Presentes recebeu refinamentos nos modais e botões de ação, com o
  botão de reserva alinhado ao padrão visual dos botões de presentear e os
  botões/ícones de confirmação harmonizados com a identidade roxa principal.
- Os cards e modais da página de Presentes foram suavizados para acompanhar o
  tom mais romântico do site, com cards mais delicados, microinterações mais
  consistentes e o modal de pagamento/compra reorganizado em blocos visuais
  mais escaneáveis, incluindo ação compacta para copiar o código PIX.
- A lista pública de Presentes recebeu um painel discreto e expansível de
  filtros, permitindo aos convidados filtrar por disponibilidade, categoria,
  tipo de presente e ordenar por valor ou nome, com tratamento específico para
  presentes por cotas e opção para visualizar itens reservados/comprados pelo
  próprio convite.
- A página Nossa História recebeu refinamentos visuais no hero e na timeline,
  com cards mais leves, linha/bolinhas mais delicadas, polaroids suavizadas e
  ajustes mobile sem alterar o tamanho da hero; os comentários pessoais do
  noivo passam a aparecer como notas destacadas e a tipografia ganhou uso
  pontual da fonte Parisienne para reforçar o tom romântico.
- O hero da página de Pré-Wedding foi ampliado para uma composição mais cheia e
  espaçosa, aproximando-se da presença visual da página Nossa História sem
  alterar a galeria; também recebeu um botão para acessar a galeria na própria
  página e um atalho “Galeria” no menu exclusivo dessa tela.
- Os títulos principais dos heros das páginas públicas passam a usar a fonte
  Parisienne de forma centralizada por `--font-romantic`, preservando a
  tipografia clássica nas seções internas, modais, rodapés e área
  administrativa.
- Os textos de chamada dos heros públicos e chamadas relacionadas na Home foram
  refinados para remover pontuação final, deixando a leitura mais leve e aberta.
- A chamada do hero da página de Recados passa a se adaptar ao tipo do convite,
  usando singular para convite individual e plural para convite de casal.
- Os cards públicos do Mural de Recados foram refinados para acompanhar o
  padrão visual dos Presentes, com fundo mais leve, sombras suaves,
  microinterações no desktop e comportamento estável no mobile.
- Os cards públicos de Fornecedores também foram refinados com fundo mais
  delicado, imagens com zoom suave, botões de contato mais elegantes e
  responsividade alinhada ao restante das páginas públicas.
- A chamada do hero da página de Programação também passa a se adaptar ao tipo
  do convite, alternando entre singular e plural após a identificação do
  convidado.
- A saudação das páginas públicas autenticadas foi simplificada para
  “Olá, nome do convite”, sem variação por tipo de convite.
- A página de Programação recebeu ajustes de suavidade nos cards das etapas e
  atividades, com microinterações no desktop, comportamento estável no mobile e
  respeito a `prefers-reduced-motion`, além de refinamentos no painel de
  informações da etapa para destacar título, local, endereço e descrição de
  forma mais elegante.
- O menu público foi reorganizado com a opção agrupadora "Mais", reduzindo o
  número de itens visíveis no desktop e mantendo RSVP, Presentes e Nossa
  História como acessos principais. No mobile, os links continuam listados
  diretamente, sem dropdown.
- O dropdown "Mais" no desktop passa a abrir por hover/foco e permanecer
  disponível enquanto o usuário move o cursor até as opções, sem exigir clique
  para manter o menu aberto.
- A página inicial foi alinhada ao padrão de metadados das demais páginas
  públicas, usando `•` no `<title>`, Open Graph, Twitter Cards e metadados
  recalculados em tempo de execução.
- O texto principal da Home foi refinado para "Vamos nos casar" e a chamada do
  hero foi atualizada para "Com Deus e Nossa Senhora guiando nossos passos,
  começamos o nosso para sempre".
- Na página Nossa História, a opção do menu "Nossa Jornada" foi simplificada
  para "Jornada".

## Observações De Fechamento

- Esta release não inclui migrações de banco nem novos scripts de rebuild.
- As mudanças se concentram em HTML, CSS e JavaScript de experiência pública,
  identidade visual e pequenos ajustes administrativos.
