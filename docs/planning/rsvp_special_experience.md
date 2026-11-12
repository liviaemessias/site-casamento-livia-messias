# Especificação: Experiência Especial no RSVP

**Status:** planejada; ainda não implementada.

Este documento reúne as decisões de escopo, experiência, conteúdo, arte e dados para a brincadeira voltada a Pais e Padrinhos/Madrinhas no RSVP. Ele serve como referência de planejamento e design; não descreve uma funcionalidade já disponível.

## Planejamento Aprovado

Esta funcionalidade está planejada, mas ainda **não foi implementada**. As definições abaixo orientam uma implementação futura.

### Objetivo E Público

- Criar uma experiência curta e carinhosa para Pais e Padrinhos/Madrinhas no
  fluxo público de RSVP.
- A classificação será atribuída a cada pessoa do convite no cadastro ou edição
  de convidados do Admin. Os papéis previstos são `pai`, `mãe`, `padrinho` e
  `madrinha`; pessoas sem papel especial não participam.
- A brincadeira deve ser acessível pela página de RSVP, por um botão flutuante
  no estilo do botão de dúvidas já existente. A exibição será condicional aos
  papéis do convite e ao estado da brincadeira.

### Fluxo Da Brincadeira

1. Uma pergunta leve pede que a pessoa ou o grupo identifique seu papel no
   casamento. A aplicação já conhece a classificação cadastrada no Admin.
2. Se a resposta não corresponder, aparece uma mensagem bem-humorada e a pessoa
   pode tentar novamente sem limite de tentativas.
3. Após acertar, a aplicação apresenta um quebra-cabeça simples de quatro
   peças. A montagem é feita arrastando as peças.
4. Ao concluir o quebra-cabeça, a pessoa revela uma mensagem de agradecimento
   personalizada para Pais ou Padrinhos/Madrinhas e com o(s) nome(s) adequado(s).
5. A pessoa pode pular a brincadeira e voltar a ela mais tarde pelo botão
   flutuante. Pular não marca a brincadeira como concluída.
6. A conclusão é registrada quando a surpresa final é revelada. Depois disso,
   o botão oferece acesso para rever a mensagem.

### Regras De Grupo E Concordância

- Convite individual: uma única pessoa responde e recebe uma mensagem no
  singular.
- Convite de casal em que ambos são Pais: a dupla participa de uma brincadeira
  única e recebe uma mensagem conjunta no plural.
- Convite de casal em que ambos são Padrinhos/Madrinhas: a dupla participa de
  uma brincadeira única e recebe uma mensagem conjunta no plural, mesmo que os
  papéis individuais sejam padrinho e madrinha.
- Convite de casal em que apenas uma pessoa tem papel especial: a brincadeira e
  a mensagem são direcionadas somente a essa pessoa, com tratamento singular.
- Aplicar concordância de gênero e número em pergunta, opções, feedback e
  mensagem final. Não presumir que os dois membros de um casal compartilham o
  mesmo papel.

### Conteúdo Sugerido

As frases abaixo são propostas iniciais e devem permanecer editáveis nas
configurações do Admin, idealmente em uma tabela própria de conteúdo da
experiência, para permitir ajustes sem alterar o código.

**Pergunta de identificação**

- Individual: “Qual é o seu papel especial no nosso dia?”
- Grupo: “Qual é o papel especial de vocês no nosso dia?”
- Opções: o papel correspondente ao cadastro, com as formas adequadas — Pai,
  Mãe, Padrinho, Madrinha ou o grupo Pais/Padrinhos e Madrinhas.
- Resposta errada: “Hmm… essa resposta não bate com a nossa lista secreta 😄
  Tente de novo!” Ajustar “tente/tentem” ao número de participantes.
- Resposta certa: “Isso! Agora é hora de montar a surpresa. São só quatro peças
  💜” Ajustar o tratamento ao singular ou plural.

**Mensagem final para Pais**

- Individual: “{nome}, seu carinho, seu exemplo e seu apoio fazem parte da
  nossa história. Que alegria ter você ao nosso lado neste dia. A gente ama
  você! Com amor, Livia e Messias.”
- Grupo: “{nomes}, o carinho, o exemplo e o apoio de vocês fazem parte da nossa
  história. Que alegria ter vocês ao nosso lado neste dia. A gente ama vocês!
  Com amor, Livia e Messias.”

**Mensagem final para Padrinhos/Madrinhas**

- Individual: “{nome}, que alegria contar com você ao nosso lado nessa
  caminhada. Seu carinho torna este momento ainda mais especial. A gente ama
  você! Com carinho, Livia e Messias.”
- Grupo: “{nomes}, que alegria contar com vocês ao nosso lado nessa caminhada.
  O carinho de vocês torna este momento ainda mais especial. A gente ama vocês!
  Com carinho, Livia e Messias.”

Os textos são exemplos; devem ser revisados para cobrir corretamente as
variações de singular/plural e gênero, inclusive convites de casal com apenas
um membro elegível.

### Arte E Experiência Visual

- Usar ilustrações vetoriais SVG, com uma arte temática para Pais e outra para
  Padrinhos/Madrinhas. A direção visual sugerida é acolhedora e celebrativa,
  com elementos como raízes, casa ou coração para Pais, e elementos ligados a
  união, flores ou constelações para Padrinhos/Madrinhas, em tons de lilás,
  roxo e dourado.
- Cada arte poderá ser dividida visualmente em quatro peças interativas do
  quebra-cabeça. A ilustração deve continuar legível em telas pequenas.
- O botão flutuante deve acompanhar o estilo do botão de dúvidas existente e
  comunicar os estados “começar/continuar” e “rever mensagem”.

### Dados E Impactos A Considerar Na Implementação

- O cadastro atual guarda cada convite em `public.guests`. Em convites de casal,
  os nomes dos membros ficam em `guests.couple_members` (JSONB). `guest_side`
  indica o lado do convite — noiva, noivo ou casal — e não representa o papel
  familiar especial.
- A resposta de presença fica em `public.rsvps`, com dados detalhados das
  pessoas em `rsvps.guest_data`. Esses dados pertencem ao RSVP e não devem ser
  usados para guardar papéis ou conclusão da brincadeira.
- Na implementação, modelar os papéis por pessoa e a conclusão da experiência
  separadamente do RSVP, preservando o fluxo atual de confirmação de presença.
  Para casais, a associação deve identificar sem ambiguidade qual membro tem
  qual papel.
- A sugestão atual é guardar textos editáveis em configuração própria e manter
  as artes SVG como arquivos estáticos. A estrutura final de tabelas, RPCs,
  políticas de acesso e campos administrativos será definida antes da
  implementação.
- O Admin será afetado pelo novo campo de papel por pessoa e pela edição das
  mensagens. A página pública afetada será o RSVP. As demais páginas e os
  registros de presença não devem mudar por causa dessa brincadeira.
- Ainda será necessário definir as regras de acesso seguro à leitura/gravação
  dos papéis e do estado de conclusão, incluindo a associação ao convite
  autenticado. Não aplicar alterações de banco até fechar essa modelagem.
