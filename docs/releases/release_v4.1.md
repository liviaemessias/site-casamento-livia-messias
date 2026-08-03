# Site de Casamento - L & M - v4.1

Esta release consolida a evolução das restrições alimentares para o nível de pessoa do convite. A partir dela, o sistema deixa de tratar a restrição como uma informação única do RSVP e passa a considerar convidado principal, membros de casal e acompanhantes individualmente.

O foco principal foi ajustar a experiência completa: formulário público, formulários manuais do Admin, modais, indicadores, e-mails, relatórios, exportações, scripts de banco e documentação de rebuild.

## Concluído

### RSVP E Restrições Alimentares Por Pessoa

- Restrição alimentar passa a ser registrada por pessoa dentro de
  `rsvps.guest_data`.
- Convites individuais usam `rsvps.guest_data.food` e
  `rsvps.guest_data.food_restriction` para o convidado principal.
- Convites de casal usam `rsvps.guest_data.members[].food` e
  `rsvps.guest_data.members[].food_restriction`.
- Acompanhantes usam `rsvps.guest_data.companions[].food` e
  `rsvps.guest_data.companions[].food_restriction`.
- O texto persistido da restrição guarda apenas a descrição informada, sem
  prefixar o nome da pessoa.
- Quando a interface, os e-mails ou os relatórios precisam diferenciar múltiplas
  pessoas, o nome é adicionado somente na apresentação.
- `rsvps.message` permanece como campo de mensagem do RSVP e não faz parte desta
  mudança.

### Formulários E Interface

- RSVP público atualizado para exibir a restrição alimentar do convidado
  principal antes da seção de acompanhantes.
- RSVP manual no painel de RSVPs atualizado com a mesma lógica de ordem e
  preenchimento por pessoa.
- RSVP manual no cadastro de convidados atualizado para manter o comportamento
  consistente com as demais telas.
- Bloco visual da restrição alimentar do convidado principal refinado para não
  parecer uma continuação dos cards de acompanhantes.
- Em convites de casal, o espaçamento entre os radios de presença e a pergunta
  “Possui restrição alimentar?” foi ajustado.
- Modais de detalhes de restrição alimentar remodelados para mostrar a
  restrição da pessoa clicada, sem duplicar nomes no texto salvo.
- Na tabela de RSVPs, acompanhantes com restrição mantêm o símbolo visual, mas o
  detalhe textual fica centralizado no modal.

### E-mails E Notificações

- E-mails automáticos de criação e atualização de RSVP passam a listar
  restrições alimentares por pessoa.
- Reenvios manuais de confirmação de RSVP usam o mesmo padrão.
- Notificações para Admin e para convidados consideram convidado principal,
  membros de casal e acompanhantes.
- Quando houver mais de uma pessoa com restrição, cada item é apresentado como
  `Nome: restrição`.
- Quando a restrição pertence a apenas uma pessoa, o sistema ainda usa o mesmo
  fluxo de apresentação, mantendo consistência entre convites individuais,
  casais e acompanhantes.
- A Edge Function `send-notifications` precisa ser redeployada para aplicar os
  novos templates.

### Relatórios, Métricas E Exportações

- Indicadores e métricas de buffet passam a considerar restrições por pessoa.
- CSV da tabela de RSVPs atualizado para refletir a nova estrutura.
- Relatórios consolidados de presença e buffet mantidos compatíveis com a
  leitura por pessoa.
- Relatórios detalhados por pessoa passam a exibir a restrição individual de
  cada convidado, membro ou acompanhante.
- Lista para Recepção atualizada para incluir a coluna de restrição alimentar
  quando selecionada.
- Resumo Final do Buffet atualizado para usar as restrições individuais.
- Mapa de Mesas atualizado nos relatórios detalhados por pessoa.
- Nas opções de resumo por convite do Mapa de Mesas, as colunas de pessoa,
  criança, idade, categoria do buffet, restrição alimentar e pagante não são
  exibidas por não fazerem sentido nesse nível de agregação.
- O modal de exportação deixa claro que essas colunas pertencem somente às
  opções detalhadas por pessoa.

### Banco, Rebuild E Documentação

- Criada a migração
  `docs/migrations/rsvp_food_restriction_per_person.sql`.
- Criado o script de verificação
  `docs/migrations/rsvp_food_restriction_per_person_verify.sql`.
- As colunas legadas `rsvps.food` e `rsvps.food_restriction` são removidas em
  ambientes existentes pela migração da v4.1.
- O rebuild completo em `docs/rebuild/supabase_rebuild_full_setup.sql` passa a
  criar a tabela `rsvps` já sem as colunas legadas.
- A validação final do rebuild confirma que `rsvps.food` e
  `rsvps.food_restriction` não existem mais.
- README atualizado para indicar a versão atual 4.1 e documentar a nova regra de
  restrição alimentar por pessoa.

## Observações

- A restrição alimentar agora pertence à pessoa, não ao convite inteiro.
- O convite pode aparecer como “com restrição” quando pelo menos uma pessoa do
  convite possuir restrição alimentar.
- O texto salvo no banco não deve incluir o nome da pessoa. O nome é
  responsabilidade da camada de apresentação.
- Em relatórios agregados por convite, algumas colunas detalhadas por pessoa são
  omitidas intencionalmente para evitar informação ambígua.
- Ajustes feitos apenas em interface, templates de e-mail ou exportações não
  exigem nova migração de banco além da migração principal da v4.1.

## Como Aplicar Em Um Projeto Existente

1. Rodar a migração:

   ```sql
   docs/migrations/rsvp_food_restriction_per_person.sql
   ```

2. Rodar a verificação:

   ```sql
   docs/migrations/rsvp_food_restriction_per_person_verify.sql
   ```

3. Redeployar a Edge Function de notificações:

   ```bash
   supabase functions deploy send-notifications
   ```

4. Publicar os arquivos estáticos atualizados do site/Admin.

5. Validar os fluxos principais:

   - convite individual sem restrição;
   - convite individual com restrição;
   - convite individual com acompanhante com restrição;
   - convite de casal com restrição no primeiro membro;
   - convite de casal com restrição no segundo membro;
   - RSVP público;
   - RSVP manual pelo Admin;
   - e-mails automáticos e reenvios manuais;
   - CSV da tabela de RSVPs;
   - Lista para Recepção;
   - Resumo Final do Buffet;
   - Mapa de Mesas em resumo e detalhado;
   - relatórios consolidados de presença e buffet.

## Fora Do Escopo

- Classificação automática do tipo de restrição, como sem lactose,
  vegetariano, vegano ou alergias específicas.
- Padronização obrigatória do texto informado pelo convidado.
- Criação de uma tabela separada de restrições alimentares.
- Alterações adicionais no fluxo de mensagens livres do RSVP.
