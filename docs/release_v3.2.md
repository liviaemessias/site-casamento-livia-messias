# Site de Casamento - L & M - v3.2

Esta release conclui a revisão das páginas públicas e amplia a segurança das operações realizadas no Supabase. Os fluxos de RSVP, presentes, convidados e configurações passam a contar com validações no banco, enquanto a experiência dos convidados recebe ajustes de responsividade, conteúdo e formas de presentear.

## Funcionalidades

- Acesso dos convidados por código de convite.
- RSVP individual e para convites de casal, com confirmação separada dos membros.
- Cadastro de acompanhantes, crianças, restrições alimentares e mensagens.
- Idade das crianças padronizada com referência à data do casamento.
- Regra configurável de idade mínima pagante para o buffet.
- Lista de presentes com reservas individuais ou por cotas.
- Área de acompanhamento dos presentes do convite que ainda possuem ações pendentes.
- Formas de presentear por PIX, cartão via checkout externo, compra online e loja física.
- Lojas online e físicas apresentadas como sugestões opcionais de compra.
- QR Code e PIX Copia e Cola gerados no frontend.
- Envio de comprovante via WhatsApp.
- Painel administrativo com Dashboard, Presentes, Convidados, RSVPs e Configurações.
- Dashboard com métricas e gráficos de convidados, buffet, presentes e valores.
- Filtros, ordenação e exportações CSV/XLSX nas áreas administrativas.
- Relatórios consolidados com seleção de colunas e modos resumido ou detalhado.
- Login administrativo com e-mail e senha pelo Supabase Auth.
- Login seguro dos convidados com sessão anônima, Edge Function e Cloudflare Turnstile.
- Row Level Security e RPCs restritas para isolamento e validação dos dados.

## Novidades

- Adicionada geração segura dos códigos de convite pelo Supabase.
- Adicionados links externos para localização da cerimônia e recepção no Google Maps.
- Adicionados placeholders mais claros e acolhedores aos campos opcionais do RSVP.
- Permitido o cadastro de presentes externos ou híbridos sem lojas configuradas.
- Permitida a confirmação de compras online ou físicas realizadas fora das lojas sugeridas.

## Melhorias

- Operações administrativas de convidados, RSVPs, presentes e configurações migradas para RPCs protegidas.
- Operações públicas de RSVP e presentes validadas diretamente no banco.
- Regras de reserva e confirmação reforçadas contra alterações incompatíveis ou concorrentes.
- Formas de presentear validadas conforme a configuração de cada presente.
- Lojas cadastradas tratadas como referências opcionais, sem limitar a escolha do convidado.
- Contagem regressiva, lista de presentes e linha do tempo aprimoradas no mobile.
- Cabeçalho e espaçamentos da página de RSVP ajustados para telas menores.
- Texto de confirmação de presença e botão principal melhor distribuídos na página inicial.

## Segurança

- Geração de códigos de convite realizada por função segura no banco.
- Criação, edição, ativação e desativação de convidados protegidas por RPCs administrativas.
- Criação, edição e exclusão de presentes protegidas por RPCs administrativas.
- Respostas e exclusões de RSVPs administrativos protegidas por RPCs.
- Atualização das configurações globais protegida por função administrativa.
- Dados públicos de RSVP validados conforme os membros e limites do convite.
- Reservas, formas de presentear e confirmações de pagamento validadas no Supabase.
- Alterações diretas nas tabelas protegidas removidas dos papéis públicos.
- Mantidos Supabase Auth, sessões anônimas, Edge Function, RLS e Cloudflare Turnstile.

## Correções

- Corrigido o salvamento das formas de compra online e em loja física.
- Corrigido o cadastro de presentes externos e híbridos sem lojas.
- Corrigida a atualização da lista quando um presente removido ainda estava visível em outra sessão.
- Corrigidas mensagens de indisponibilidade em reservas simultâneas de presentes e cotas.
- Corrigidos textos, concordâncias e comportamentos responsivos nas páginas públicas.

## Documentação

- Atualizados os scripts SQL de segurança e reconstrução do Supabase.
- Atualizada a modelagem das operações administrativas e públicas.
- Atualizado o guia de reconstrução com a ordem das novas funções protegidas.
- Registradas as regras flexíveis para presentes externos e híbridos.

## Próximos Endurecimentos

- Automatizar a limpeza de contas anônimas e tentativas antigas.
- Revisar Content Security Policy, dependências CDN e usos de `innerHTML`.
- Rotacionar os códigos de convite antes da publicação definitiva.
