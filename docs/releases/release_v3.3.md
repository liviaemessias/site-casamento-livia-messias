# Site de Casamento - L & M - v3.3

Esta release torna o conteúdo público do casamento configurável pelo banco,
reforça a segurança do frontend e melhora a descoberta da lista de presentes.
A página inicial também passa a contar com metadados completos para mecanismos
de busca e compartilhamento em redes sociais.

## Funcionalidades

- Acesso dos convidados por código de convite.
- RSVP individual e para convites de casal, com confirmação separada dos membros.
- Cadastro de acompanhantes, crianças, restrições alimentares e mensagens.
- Idade das crianças padronizada com opções até 12 anos na data do casamento.
- Regra configurável de idade mínima pagante para o buffet.
- Lista de presentes com reservas individuais ou por cotas.
- Formas de presentear por PIX, cartão via checkout externo, compra online e loja física.
- Seção da lista de presentes na página inicial, com acesso pelo login do convite.
- Painel administrativo com Dashboard, Indicadores, Relatórios, Presentes, Convidados, RSVPs e Configurações.
- Nomes dos noivos, datas, prazo do RSVP, cerimônia e recepção configuráveis no painel.
- Metadados de SEO e compartilhamento social na página inicial.
- Login administrativo pelo Supabase Auth e login seguro dos convidados com sessão anônima, Edge Function e Cloudflare Turnstile.
- Row Level Security e RPCs restritas para isolamento e validação dos dados.

## Novidades

- Adicionada uma seção de chamada para a lista de presentes na página inicial.
- Adicionado gerenciamento dos dados do casamento em `settings`.
- Integrados os dados configuráveis do evento às páginas públicas e administrativas.
- Adicionados título, descrição, URL canônica, Open Graph e Twitter Cards à página inicial.
- Adicionada atualização dos metadados da página inicial conforme as configurações públicas do evento.
- Ampliadas as opções de idade das crianças até 12 anos.
- Adicionada mensagem personalizada do convite aos fluxos dos convidados.
- Separados o resumo operacional, os indicadores detalhados e os relatórios em páginas administrativas dedicadas.

## Repaginada do Painel Administrativo

- Redesenhada a área administrativa com navegação lateral, ícones, identidade visual consistente e menu adaptado para dispositivos móveis.
- Transformado o Dashboard inicial em uma visão operacional enxuta, voltada às informações e pendências mais importantes do casamento.
- Adicionados indicadores clicáveis de pessoas confirmadas, capacidade planejada, convidados pagantes, RSVPs pendentes, presentes informados, presentes reservados e valor confirmado.
- Adicionados resumos visuais da distribuição dos RSVPs e da situação da lista de presentes.
- Adicionados atalhos para RSVPs pendentes, relatórios consolidados e indicadores detalhados.
- Criada a página de Indicadores com métricas e gráficos separados por presença, buffet, presentes e valores financeiros.
- Detalhadas as categorias do buffet entre adultos, crianças pagantes, crianças não pagantes e crianças sem idade válida.
- Aprimoradas as métricas de presentes para contemplar disponibilidade, reservas parciais, reservas completas, pagamentos informados e confirmações.
- Criada a página de Relatórios com exportações consolidadas de presença e buffet, financeiro e ações pendentes.
- Mantidas opções CSV e XLSX, seleção de colunas e relatórios de presença resumidos por convite ou detalhados por pessoa.
- Adicionados estados de carregamento, mensagens de status, tooltips explicativos e melhorias de acessibilidade nos componentes administrativos.

## Segurança

- Adicionada Content Security Policy a todas as páginas HTML.
- Removidos estilos e manipuladores de evento inline incompatíveis com a política de segurança.
- Centralizada a validação de textos, URLs e fragmentos HTML em `js/security-utils.js`.
- Substituídas inserções diretas com `innerHTML` por APIs do DOM ou conteúdo sanitizado.
- Bloqueados scripts, estilos, frames, objetos e atributos de evento em fragmentos HTML dinâmicos.
- Restringida a leitura pública das configurações a RPCs com campos explicitamente permitidos.
- Removido o antigo sinalizador administrativo do fluxo legado de convidados.

## Melhorias

- Dados do casamento reutilizados de forma consistente na home, RSVP, presentes e painel administrativo.
- Datas, locais, horários, links do Google Maps e textos do evento atualizados a partir das configurações públicas.
- Normalização das idades alinhada entre RSVP, administração, relatórios e métricas do buffet.
- Dashboard inicial simplificado para uma visão operacional, mantendo análises completas na página de Indicadores.
- Acessibilidade de menus, modais, indicadores de rolagem e bloqueio de scroll aprimorada.
- Métricas de presentes atualizadas para distinguir reservas parciais e presentes informados.
- Organização dos documentos em diretórios de migrações, modelagem, operações, reconstrução e releases.

## Documentação

- Adicionados scripts de migração e verificação dos dados configuráveis do casamento.
- Documentado o acesso restrito às configurações públicas por RPC.
- Adicionado setup consolidado para reconstrução completa do projeto Supabase.
- Adicionados runbook, inventário de ambiente e verificações finais de reconstrução.
- Atualizados a modelagem do banco, os fluxos de negócio e o README para o estado da versão 3.3.

## Próximos Endurecimentos

- Automatizar a limpeza de contas anônimas e tentativas antigas.
- Rotacionar os códigos de convite antes da publicação definitiva.
- Avaliar a redução futura das dependências carregadas por CDN.
