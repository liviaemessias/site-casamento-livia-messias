# Rebuild

Esta pasta contém o caminho recomendado para recriar a solução atual em um
projeto Supabase vazio.

Use estes arquivos quando a intenção for montar o ambiente do zero:

1. `supabase_rebuild_full_setup.sql`
2. `supabase_rebuild_runbook.md`
3. `supabase_rebuild_environment_inventory.md`
4. `supabase_rebuild_verify_final.sql`

## Arquivo Principal

`supabase_rebuild_full_setup.sql` é a fonte principal para projeto novo. Ele
consolida schema, tabelas auxiliares, RPCs, triggers, grants, RLS, notificações,
preferências, reenvios manuais e a fundação do módulo `Financeiro`. O modelo
atual de RSVP não usa mais `rsvps.food` nem `rsvps.food_restriction`;
restrições alimentares ficam por pessoa dentro de `rsvps.guest_data`.

O módulo `Financeiro` já é criado com:

- contextos para `Casamento` e `Lua de Mel`;
- cenários de orçamento, incluindo `Planejado` como referência inicial;
- categorias e pagadores editáveis com seed inicial;
- itens de orçamento previsto;
- gastos reais com vínculo opcional aos itens previstos;
- parcelas e pagamentos;
- RPCs administrativas e verificações de RLS/grants.

Depois de executar o setup consolidado, siga o runbook para configurar Auth,
secrets, Edge Functions, frontend e testes funcionais.

## Arquivos de Apoio

`supabase_rebuild_01_base_schema.sql` é um bloco interno do rebuild. Ele ajuda a
manter o consolidado legível, mas não deve ser usado sozinho como instalação
completa.

`supabase_rebuild_verify_final.sql` deve ser executado depois do setup e das
configurações operacionais. Todas as linhas devem retornar `check_passed = true`.

## Quando não Usar

Não use esta pasta para atualizar um projeto existente em produção. Para esse
caso, use os scripts incrementais documentados em `docs/migrations/`.
