# Planejamento: Brincadeira do RSVP Para Todos os Convidados

**Status:** proposta em discussão; ainda não aprovada nem implementada.

Este documento propõe ampliar a experiência planejada em
[`rsvp_special_experience.md`](rsvp_special_experience.md), originalmente
voltada a Pais e Padrinhos/Madrinhas, para que qualquer convite válido possa
participar. Ele registra uma alternativa de escopo, sem substituir a
especificação anterior.

## Objetivo

Oferecer a todos os convidados uma pequena surpresa interativa no RSVP, mantendo
um reconhecimento especial para Pais e Padrinhos/Madrinhas. A brincadeira não
deve ser condição para confirmar presença, nem exigir que a pessoa pertença a um
grupo específico.

## Proposta De Escopo

- Todo convite autenticado pode iniciar, pular e revisitar a brincadeira.
- O jogo acontece uma vez por convite. Em convites de casal, os dois participam
  juntos, como uma experiência compartilhada.
- O quebra-cabeça de quatro peças permanece como atividade central, com peças
  arrastadas para montar uma ilustração.
- A conclusão é registrada separadamente do RSVP, quando a mensagem final é
  revelada. Pular ou sair antes disso não conclui a experiência.
- A mensagem final é personalizada com o(s) nome(s) do convite. Pais e
  Padrinhos/Madrinhas podem receber uma mensagem temática própria; os demais
  recebem uma mensagem geral de carinho e agradecimento.
- O botão flutuante de acesso aparece para todos os convites e muda conforme o
  estado: começar/continuar ou rever a mensagem.

## Fluxo Sugerido

1. Na página de RSVP, qualquer convite elegível vê um botão para descobrir uma
   surpresa.
2. A abertura apresenta uma saudação com o nome individual ou os nomes do
   convite de casal.
3. Antes do quebra-cabeça, aparece uma pergunta curta e divertida. Para Pais e
   Padrinhos/Madrinhas, pode ser a pergunta de identificação de papel já
   planejada. Para os demais convites, usar uma pergunta geral sobre a
   celebração, sem depender de uma classificação no Admin.
4. Uma resposta errada permite tentar novamente e recebe um feedback leve. A
   resposta certa libera o quebra-cabeça.
5. Ao encaixar as quatro peças, aparece uma mensagem final adequada ao público
   e ao número de pessoas.
6. A pessoa ou o casal pode pular em qualquer momento e retornar depois. Após
   a conclusão, pode reabrir a mensagem final pelo botão flutuante.

## Pergunta E Respostas: Conteúdo Inicial

### Para Pais E Padrinhos/Madrinhas

- Individual: “Qual é o seu papel especial no nosso dia?”
- Convite conjunto: “Qual é o papel especial de vocês no nosso dia?”
- Opções apresentadas conforme o caso: Pai, Mãe, Padrinho, Madrinha, Pais ou
  Padrinhos/Madrinhas.
- Resposta errada: “Hmm… essa resposta não bate com a nossa lista secreta 😄
  Tente de novo!” Ajustar “tente/tentem” ao público da pergunta.
- Resposta certa: “Isso! Agora é hora de montar a surpresa. São só quatro peças
  💜” Ajustar a concordância.

### Para Os Demais Convidados

Pergunta universal sugerida:

- Individual: “Qual é a missão mais importante no nosso grande dia?”
- Convite conjunto: “Qual é a missão mais importante de vocês no nosso grande
  dia?”

- Opções brincalhonas: “Celebrar com a gente”, “Avaliar o buffet” e “Levar a
  decoração para casa”.
- Resposta correta: “Celebrar com a gente”. As demais recebem uma reação
  divertida e permitem nova tentativa.
- Alternativa mais leve: usar uma pergunta de boas-vindas sem resposta errada,
  caso uma pergunta de conhecimento pareça uma barreira desnecessária.

As perguntas, respostas e mensagens devem poder ser revisadas sem alterar o
código. A proposta é mantê-las em configuração própria no Admin, com versões
para singular/plural e conteúdo geral/temático.

## Mensagens Finais Sugeridas

### Pais

- Individual: “{nome}, seu carinho, seu exemplo e seu apoio fazem parte da
  nossa história. Que alegria ter você ao nosso lado neste dia. A gente ama
  você! Com amor, Livia e Messias.”
- Grupo: “{nomes}, o carinho, o exemplo e o apoio de vocês fazem parte da nossa
  história. Que alegria ter vocês ao nosso lado neste dia. A gente ama vocês!
  Com amor, Livia e Messias.”

### Padrinhos/Madrinhas

- Individual: “{nome}, que alegria contar com você ao nosso lado nessa
  caminhada. Seu carinho torna este momento ainda mais especial. A gente ama
  você! Com carinho, Livia e Messias.”
- Grupo: “{nomes}, que alegria contar com vocês ao nosso lado nessa caminhada.
  O carinho de vocês torna este momento ainda mais especial. A gente ama vocês!
  Com carinho, Livia e Messias.”

### Demais Convidados

- Individual: “{nome}, que alegria ter você com a gente! Sua presença faz parte
  da nossa história e deixa esse dia ainda mais especial. Com carinho, Livia e
  Messias.”
- Grupo: “{nomes}, que alegria ter vocês com a gente! A presença de vocês faz
  parte da nossa história e deixa esse dia ainda mais especial. Com carinho,
  Livia e Messias.”

Os textos são rascunhos. Revisar pontuação, tom e concordância antes de
implementá-los e manter variantes explícitas em vez de montar frases com
substituições gramaticais frágeis.

## Regras De Participação E Personalização

- O acesso ao jogo não depende de papel especial.
- O papel é um atributo opcional por pessoa do convite e serve somente para
  selecionar conteúdo personalizado.
- Convite individual elegível para personalização: conteúdo singular da pessoa.
- Convite de casal em que ambos são Pais: um jogo conjunto e mensagem plural de
  Pais.
- Convite de casal em que ambos são Padrinhos/Madrinhas: um jogo conjunto e
  mensagem plural de Padrinhos/Madrinhas, mesmo que uma pessoa seja padrinho e a
  outra madrinha.
- Convite de casal com apenas uma pessoa classificada como Pai, Mãe, Padrinho ou
  Madrinha: o convite continua podendo jogar. A etapa/mensagem temática pode
  reconhecer a pessoa classificada, sem atribuir o papel ao par.
- Convite sem classificação especial: conteúdo geral.
- Se um casal tiver papéis especiais diferentes (por exemplo, um Pai e uma
  Madrinha), selecionar conteúdo exige uma regra de prioridade ou uma mensagem
  mista. A regra recomendada para discussão é usar uma mensagem geral dirigida
  aos dois, evitando escolher um papel e ignorar o outro.
- Usar concordância de gênero e número em todas as etapas. O convite de casal é
  tratado no plural quando ambos são destinatários; conteúdo direcionado a uma
  única pessoa mantém o singular.

## Arte E Interação

- Manter o quebra-cabeça de quatro peças arrastáveis.
- Criar uma ilustração geral que funcione para qualquer convidado e, se desejado,
  variações temáticas para Pais e Padrinhos/Madrinhas.
- SVGs são adequados por permitirem escala e recorte em quatro peças sem perder
  nitidez. Usar uma identidade visual coerente em lilás, roxo e dourado.
- Garantir uso por toque em telas pequenas, alternativa acessível ao arraste,
  foco visível, instruções claras e respeito à preferência por movimento
  reduzido.
- Oferecer botão para sair/pular sem interferir no preenchimento do RSVP.

## Dados, Admin E Compatibilidade

- Convites ficam em `public.guests`; membros do casal são representados em
  `guests.couple_members` (JSONB). `guest_side` identifica noiva, noivo ou casal
  e não é o papel familiar.
- Presença e respostas ficam em `public.rsvps`, com detalhes de pessoas em
  `rsvps.guest_data`. A brincadeira não deve gravar seus estados nesses campos.
- Como o jogo estará aberto a todos, papel especial não deve ser usado como
  regra de elegibilidade. A conclusão deve ser guardada separadamente e
  vinculada ao convite.
- A edição de papéis por pessoa no Admin passa a ser opcional para personalizar
  conteúdo. Mensagens e perguntas editáveis podem ficar em configuração própria.
- O RSVP recebe o botão/fluxo da brincadeira; nenhuma outra página precisa mudar
  para liberar o acesso geral.
- Preservar sem alterações o fluxo atual de confirmação de presença, membros,
  acompanhantes, restrições alimentares e mensagens do RSVP.
- Antes de implementar, definir tabelas, identificadores estáveis dos membros,
  RPCs e políticas que limitem a leitura/gravação ao convite autenticado.

## Decisões Ainda Em Aberto

1. A pergunta geral deve ter resposta certa com tentativas ou ser uma interação
   leve sem resposta errada?
2. A classificação de Pais/Padrinhos/Madrinhas deve existir apenas para
   personalizar a mensagem, ou também deve habilitar uma pergunta exclusiva?
3. Para um casal com dois papéis especiais diferentes, usar mensagem geral
   conjunta ou criar conteúdo misto?
4. A ilustração será única para todos, ou haverá uma arte geral e artes
   temáticas?
5. A marcação de conclusão deve ser única por convite ou permitir reiniciar o
   quebra-cabeça após ver a surpresa?

## Próximo Passo

Validar as decisões em aberto antes de atualizar a especificação anterior ou
iniciar mudanças no Admin, RSVP, banco de dados ou assets SVG.
