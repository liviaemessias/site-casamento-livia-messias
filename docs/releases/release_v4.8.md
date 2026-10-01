# Site de Casamento - L & M - v4.8

Esta release reúne melhorias na experiência pública da Lista de Presentes, na
administração de convidados e RSVPs, nos relatórios consolidados e no Dashboard.
Também adiciona scripts documentados para importar convidados e presentes a
partir de planilhas.

## Concluído

### Lista Pública De Presentes

- O texto dos botões de ação passou a refletir a forma de presentear escolhida:
  "Ver PIX", "Ver cartão" ou "Ver lojas". Quando não há uma forma selecionada,
  a ação apresenta as opções disponíveis.
- Os botões e títulos relacionados à escolha da forma passaram a usar
  "Formas".
- Para presentes individuais já reservados com forma escolhida, o card oferece
  diretamente a ação de visualizar os detalhes do PIX, cartão ou compra externa,
  sem exigir que o convidado abra primeiro os detalhes genéricos.
- No modal de detalhes de presentes individuais com forma já selecionada, a
  área de ações oferece "Formas", os detalhes da opção escolhida e
  "Cancelar reserva".
- A posição dos botões flutuantes de dúvidas e ações pendentes foi corrigida
  para evitar sobreposição.

### Administração De Presentes

- A forma de compra selecionada continua identificada nos cards, sem exibir o
  nome da loja. Os detalhes da opção, como loja, link e observações, ficam no
  modal de detalhes do presente, na seção "Reserva".

### Convidados, RSVP E Relatórios

- A página de Convidados diferencia a contagem de convites da contagem de
  pessoas, respeitando os filtros ativos.
- O filtro de RSVP foi dividido em "Resposta ao convite" (respondido ou sem
  resposta) e "Presença" (comparecerão ou não comparecerão). A coluna antes
  chamada "Confirmado" passou a se chamar "Respondido".
- A página de RSVPs mostra também a quantidade de pessoas esperadas, incluindo
  os membros do convite que comparecerão e os acompanhantes informados.
- O relatório consolidado de Presença e Buffet ganhou a coluna filtrável
  "Save the Date enviado", disponível também nas exportações CSV e XLSX.

### Dashboard

- A situação dos convites e a situação da lista de presentes exibem linhas
  clicáveis que abrem as páginas correspondentes com filtros aplicados.
- A situação dos convites usa os rótulos "Comparecerão", "Não Comparecerão" e
  "Pendentes", com links para os filtros de presença ou resposta apropriados.
- Foi adicionado o card "Capacidade atual", com gráfico percentual comparando
  as pessoas esperadas — incluindo acompanhantes — às pessoas planejadas.
- Os três cards visuais estão ordenados como Presença, Planejamento e Presentes.
- No mobile, Presença e Planejamento mantêm o gráfico à esquerda e os dados à
  direita.
- Os botões de acessos rápidos no rodapé do Dashboard foram removidos.

### Importação Por Planilhas

- Adicionado `scripts/generate_guest_import_sql.py` para validar uma planilha de
  convidados e gerar SQL transacional para `public.guests`, incluindo membros
  do casal, acompanhantes, origem do convite, status de envio e códigos de
  acesso.
- Adicionado `scripts/generate_gift_import_sql.py` para validar planilhas de
  presentes e opções de compra e gerar SQL transacional para `public.gifts` e
  suas opções externas.
- Os guias de uso e dependências estão em
  `docs/operations/guest_spreadsheet_import.md` e
  `docs/operations/gift_spreadsheet_import.md`.
- Os arquivos SQL gerados contêm dados operacionais e devem ser revisados antes
  da execução no SQL Editor do Supabase. O guia de convidados também orienta a
  manter o SQL gerado fora do Git por conter dados pessoais.

## Documentação E Compatibilidade

- README atualizado para a versão 4.8 e alinhado às mudanças do Dashboard,
  contagens, filtros e relatórios.
- Documentação dos fluxos administrativos atualizada para descrever os filtros
  separados de resposta e presença e o cálculo da capacidade no Dashboard.
- Não há migrações de banco de dados obrigatórias nesta release.

## Observações De Fechamento

- Para usar a importação por planilha, siga os guias em `docs/operations/` e
  instale somente a dependência indicada para o script escolhido.
- Revise o SQL gerado antes de executá-lo. A geração do SQL não grava dados no
  Supabase por conta própria.