# Especificação: Jogos Interativos No RSVP

**Status:** implementação do frontend e das migrations concluída; a migration
precisa ser aplicada ao Supabase para ativar o recurso em um banco existente.

## Resumo

Cada jogo pertence a um convite existente, individual ou de casal. O Admin
configura um jogo por convite, escolhe o tipo e informa os nomes das pessoas
envolvidas e a relação. A mensagem final é um modelo padrão editável no Admin
para cada tipo de jogo e é usada por todos os jogos daquele tipo. O jogo é uma
unidade: termina quando o convite conclui a experiência, sem identificar qual
membro arrastou as peças. O convite pode jogar novamente.

O quebra-cabeça tem quatro peças em uma ordem fixa. Há três artes: convidados em
geral, Pais e Padrinhos/Madrinhas. Foram preparados SVGs de exemplo que podem
ser substituídos pelas artes finais sem mudar a estrutura das quatro peças.

## Tipos De Jogo

Cada configuração pertence a um convite e tem exatamente um tipo:

| Tipo | Uso | Arte |
| --- | --- | --- |
| `general` | Convidado(s) em geral | Arte geral |
| `parents` | Pais | Arte Pais |
| `godparents_couple` | Casal de Padrinhos/Madrinhas | Arte Padrinhos/Madrinhas |
| `godfather` | Somente um Padrinho | Arte Padrinhos/Madrinhas |
| `godmother` | Somente uma Madrinha | Arte Padrinhos/Madrinhas |

O tipo define a categoria de conteúdo e a arte a carregar. Os nomes e a relação
exibidos são informados na configuração daquele jogo; não é necessário mapear
uma pessoa do jogo para o membro principal ou para uma posição do convite. O
tipo também determina qual modelo de mensagem será usado.

## Convite E Unidade De Jogo

- Um registro de jogo está ligado a um `guest_id` existente.
- Um convite individual ou de casal pode ter um jogo configurado pelo Admin.
- Todo o progresso pertence ao convite. Para casal, não há progresso separado
  por membro, nem pergunta sobre qual pessoa está usando o site.
- Se o tipo for “Somente um Padrinho” ou “Somente uma Madrinha”, o jogo continua
  sendo do convite; o nome da pessoa homenageada é apenas conteúdo da
  configuração.
- O jogo pode ser rejogado após a conclusão. O registro mantém a contagem e a
  data da última conclusão, sem impedir novas partidas.
- Sair ou pular antes de terminar não conta como conclusão. A montagem parcial
  não é persistida; ao voltar, o convite pode iniciar uma nova tentativa.

## Configuração No Admin

O cadastro/edição do jogo permite:

- buscar e selecionar um convite já cadastrado;
- escolher um dos cinco tipos;
- informar nome ou nomes das pessoas homenageadas;
- informar/editar a relação que será apresentada;
- ativar/desativar o jogo por um switch, sem confirmação e sem apagar seu
  histórico;
- visualizar os dados em um modal, editar em um formulário modal e excluir o
  jogo com confirmação padrão do navegador. A exclusão apaga a configuração e o
  histórico do jogo, sem alterar o convite ou o RSVP;
- consultar se o convite já concluiu, quantas vezes jogou e quando concluiu por
  último.
- ordenar os registros e filtrar por convite/nomes, tipo de jogo, status e
  participação;
- abrir os detalhes clicando na linha da tabela ou no card mobile. Cliques nos
  botões e no switch executam suas ações sem abrir também os detalhes.

Em uma área própria de configurações, o Admin edita a mensagem padrão de cada
tipo de jogo. A alteração do modelo afeta os jogos daquele tipo, sem exigir
edição convite a convite. O cadastro de um jogo não terá uma cópia editável da
mensagem.

Não é necessário alterar o cadastro normal de convidados para atribuir uma
identidade individual no jogo. Nomes e relação são dados de apresentação do
jogo, associados ao convite.

### Inscrição Manual E Em Lote

- Deve ser possível cadastrar manualmente um jogo para um convite.
- Deve ser possível selecionar vários convites existentes e criar jogos gerais
  para eles em lote. Os nomes são sugeridos a partir do cadastro do convite.
- Jogos especiais de Pais, casal de Padrinhos, Padrinho individual ou Madrinha
  individual podem ser criados manualmente.
- A automatização só pode inferir papéis se a base de dados tiver uma fonte
  explícita dessa informação. Hoje `guest_side` informa Noiva/Noivo/Casal, e
  `couple_members` guarda nomes; nenhum dos dois identifica Pais ou
  Padrinhos/Madrinhas. Portanto, não inferir papel especial desses campos.

## Fluxo Público

1. Um convite com jogo ativo vê no RSVP um botão flutuante para abrir a
   interação.
2. A interface apresenta a introdução e a pergunta definida para aquele tipo.
   Para perguntas com resposta certa, uma resposta errada pode ser repetida até
   acertar, com feedback brincalhão.
3. O convite monta um quebra-cabeça de quatro peças arrastáveis.
4. Quando as quatro peças ficam na posição correta, o jogo termina e mostra o
   modelo de mensagem configurado no Admin para aquele tipo, preenchido com os
   nomes e a relação do jogo.
5. A pessoa pode pular e voltar mais tarde. Depois de concluir, o botão também
   permite rever a mensagem ou iniciar outra partida.

As perguntas e respostas podem ser padronizadas por tipo. Os modelos da mensagem
final são editáveis no Admin por tipo de jogo.

## Mensagem

- O Admin edita um modelo padrão para cada tipo de jogo, em uma área separada do
  cadastro de convites/jogos.
- Cada tipo tem variantes singular e plural para manter a concordância quando o
  jogo envolve uma pessoa ou mais de uma.
- Os modelos podem usar os marcadores `{{names}}` e `{{relationship}}`. O
  frontend substitui esses marcadores pelos nomes e pela relação informados no
  jogo.
- A variante singular/plural é escolhida a partir da quantidade de nomes
  cadastrados no jogo. Para casos específicos, o Admin pode ajustar o texto do
  modelo daquele tipo.
- A mesma mensagem padrão se aplica a todos os jogos com o mesmo tipo. Não há
  sobrescrita de mensagem por convite na primeira versão.

## Modelo De Dados Proposto

A primeira migration desta funcionalidade cria as tabelas `rsvp_games` e
`rsvp_game_message_templates`, além de seus índices, restrições, políticas e
operações seguras necessárias. Não há dados de jogos existentes para migrar.
As tabelas ainda não existem no banco conectado até que a migration seja
aplicada.

Usar uma tabela própria, por exemplo `public.rsvp_games`, com um registro por
convite:

- `id`: UUID do jogo;
- `guest_id`: referência a `public.guests.id`, com unicidade para garantir um
  jogo configurado por convite;
- `game_type`: um dos cinco tipos listados acima;
- `display_names`: nomes das pessoas homenageadas, como texto ou lista simples;
- `relationship_label`: relação apresentada junto à homenagem, editada no
  Admin;
- `is_active`: controla se o jogo aparece no RSVP;
- `play_count`: número de conclusões;
- `last_completed_at`: data/hora da conclusão mais recente;
- `created_at` e `updated_at`.

Manter os modelos de mensagem em uma segunda tabela própria,
`public.rsvp_game_message_templates`, com uma linha por `game_type`:

- `game_type`: chave primária/restrita aos tipos de jogo suportados;
- `singular_message`: modelo para um nome;
- `plural_message`: modelo para mais de um nome;
- `updated_at`.

Os modelos necessários para os cinco tipos devem ser provisionados
inicialmente. O Admin altera esses modelos; os registros em `rsvp_games`
guardam apenas tipo, nomes, relação e estado do jogo.

O estado transitório da partida pode ser mantido no navegador enquanto o jogo
está aberto. Persistir apenas o resultado por convite é suficiente para saber
se já jogou e permitir rejogar. Se o produto exigir retomar uma partida
interrompida em outro dispositivo, isso será uma decisão adicional e poderá
justificar uma pequena tabela de sessões, sem criar registros por membro.

Não criar tabela de membros/jogadores. Não colocar dados do jogo em
`rsvps.guest_data`, `rsvps.presence` ou outros campos do RSVP. A exclusão ou
edição dos dados de um convite deve manter a relação e aplicar as regras de
retenção definidas para o sistema.

### Acesso

- O Admin cria/edita/desativa jogos usando operações administrativas
  autorizadas.
- O convidado autenticado lê somente o jogo vinculado ao próprio convite.
- A gravação de conclusão incrementa `play_count` e atualiza
  `last_completed_at`, validando o `guest_id` pela sessão autenticada.
- RLS/RPCs devem impedir que o navegador escolha ou atualize o jogo de outro
  convite.

## SVGs De Exemplo

Os exemplos ficam em `assets/images/rsvp-game/examples/`, agrupados em três
diretórios: `general`, `parents` e `godparents`. Cada diretório contém a arte
completa `art.svg`, que o jogo recorta no navegador em quatro quadrantes.

Ordem fixa ao montar:

```text
01 02
03 04
```

O jogo carrega `art.svg` e recorta no navegador quatro quadrantes de igual
tamanho. Para substituir o exemplo pela arte final, manter o canvas `600 × 420`
e substituir `art.svg`; o recorte continua funcionando sem arquivos extras.
Se a proporção mudar, ajustar também a proporção do tabuleiro em `css/rsvp.css`.

## Itens Fora Do Escopo Inicial

- Saber qual membro do casal realizou cada ação.
- Várias pessoas ou jogos independentes dentro de um único convite.
- Mensagem final individualizada por convite; a mensagem é padronizada por tipo.
- Inferir automaticamente parentesco/papel a partir do nome ou do tipo de
  convite.
- Alterar a confirmação de presença ou outros fluxos do RSVP.
