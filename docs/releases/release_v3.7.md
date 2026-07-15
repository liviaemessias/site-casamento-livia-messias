# Site de Casamento - L & M - v3.7

Esta release adiciona a primeira versão da área de Pré-Wedding, inaugura o
Mural de Recados e fecha um ciclo importante de refinamento do painel
administrativo. Além das novas páginas públicas, a versão melhora a leitura das
tabelas, adiciona alertas de pendências no menu do admin e cria atalhos rápidos
para consultar mensagens, restrições alimentares e detalhes operacionais sem
precisar abrir fluxos maiores.

## Concluído

### Pré-Wedding E Páginas Públicas

- Adicionada a página `photos.html` com o título `Nosso Pré-Wedding`.
- Adicionada uma seção `Nosso Pré-Wedding` na página inicial, com prévia
responsiva e botão `Ver Fotos`.
- Adicionado menu `Pré-Wedding` nas páginas públicas principais.
- Adicionada galeria responsiva com lightbox, navegação anterior/próxima,
contador e fechamento por `Esc`.
- Centralizada a manutenção das imagens em `js/photo-gallery-data.js`, usado
pela página inicial e pela galeria completa.
- Criada a pasta `assets/images/photos/` para as fotos do Pré-Wedding.
- Ajustados menus e logo das páginas públicas para manter navegação mais
consistente.
- Mantida a renderização da galeria por APIs do DOM, sem `innerHTML`.

### Mural De Recados

- Adicionada a página pública `messages.html` para o Mural de Recados.
- Adicionada uma seção de recados aprovados na página inicial, com botão para
  abrir o mural completo.
- Adicionado menu `Recados` nas páginas públicas principais.
- Criado envio/edição de recado pelo convidado logado, independente do RSVP.
- Recados novos ou editados entram como pendentes até aprovação.
- Recados aprovados aparecem publicamente sem expor dados internos do convite.
- Ajustada a seção de recados na página inicial para usar carrossel discreto,
  com passagem automática e navegação manual.
- Adicionada a página administrativa `admin-messages.html` com filtros,
  aprovação, ocultação, resposta dos noivos, remoção de resposta e exclusão.
- Melhorados os filtros e a ordenação do admin de Recados, incluindo tipo de
  convite, presença de resposta e ordenação por data, pendência ou convidado.
- Criada a tabela `guest_wall_messages` e as RPCs seguras para leitura pública,
  envio do convidado e moderação administrativa.
- Adicionados eventos de e-mail para recado enviado/editado, recado aprovado e
  recado respondido.
- Admin recebe aviso quando um convidado envia ou edita um recado.
- Convidado recebe aviso quando o recado é aprovado ou respondido, desde que
  exista e-mail válido no RSVP.
- Adicionadas preferências e filtros de notificação para eventos do Mural de
  Recados.
- Mantida a renderização do mural por APIs do DOM, sem `innerHTML`.

### Painel Administrativo

- Adicionados alertas compactos no menu administrativo para recados pendentes e
  presentes ou cotas com pagamento informado.
- Criada a RPC segura `admin_get_nav_alerts()` para alimentar os alertas do
  menu administrativo sem expor consultas diretas às tabelas no frontend.
- Padronizados os botões de ações nas tabelas administrativas de Convidados,
  RSVPs, Presentes, Recados e Notificações.
- Melhoradas as tabelas administrativas de RSVPs, Presentes, Recados e
  Notificações, com ajustes de espaçamento, ordenação por colunas úteis e
  indicadores visuais mais claros.
- Adicionado modal de detalhes na página administrativa de RSVPs, com ações de
  edição, reenvio de confirmação e remoção.
- Adicionado filtro para RSVPs com ou sem restrição alimentar.
- Adicionados indicadores visuais na tabela de RSVPs para restrição alimentar e
  crianças pagantes, não pagantes ou sem idade definida.
- Adicionados modais rápidos para visualizar restrição alimentar no RSVP e
  mensagens de presentes ou cotas diretamente pelos ícones das tabelas.
- Melhorada a tabela de Presentes com tipo do presente abaixo do nome,
  indicação de mensagem e redistribuição de colunas para ganhar espaço.
- Removida a opção `Enviar comprovante` do modal público de Presentes,
  mantendo apenas a ação de informar pagamento ou compra pelo site.
- Revisados textos dos modais públicos de Presentes para diferenciar convites
  individuais e de casal em instruções de PIX, cartão, compra online e loja
  física.
- Reorganizados os modais administrativos de RSVPs e Presentes para separar
  melhor dados, comunicação, gestão da reserva, contribuições, contagem e
  datas.
- Reorganizadas as ações dos presentes por cotas, separando comunicação e
  gestão da reserva também em cada contribuição.
- Melhorado o modal de detalhes das Notificações para seguir o padrão visual
  dos demais painéis.
- Ajustados ícones, cores e estados visuais de indicadores de restrição
  alimentar, mensagens de presentes e ações administrativas.

### Banco, Segurança E Documentação

- Atualizados os scripts incrementais, rebuild e verificação final para incluir
  `admin_get_nav_alerts()`.
- Atualizados README e modelagem do banco com os alertas compactos do menu
  administrativo.
- Mantido o tratamento seguro de conteúdo dinâmico com escape e renderização
  controlada nas novas interações.

## Observações

- As imagens atuais são a base inicial da galeria. As fotos oficiais do
  Pré-Wedding ainda serão adicionadas ou substituídas após o ensaio.
- O arquivo `js/photo-gallery-data.js` deve ser atualizado sempre que novas
  fotos forem incluídas em `assets/images/photos/`.
- O Mural de Recados usa uma mensagem por convite. Ao editar, o recado volta
  para revisão.
- A leitura pública do mural e da prévia da home acontece por RPC sanitizada; a
  tabela não é acessada diretamente pelo navegador.
- Para aplicar os alertas do menu administrativo em um projeto existente,
  execute `docs/migrations/admin_nav_alerts.sql` e depois
  `docs/migrations/admin_nav_alerts_verify.sql`.

## Fora Do Escopo

- Upload administrativo de fotos.
- Galeria enviada por convidados.
- Legendas públicas por foto.
- Integração com serviços externos de álbum ou armazenamento.
- Curtidas, paginação avançada ou respostas públicas de convidados.
