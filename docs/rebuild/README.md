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
preferencias e reenvios manuais.

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
