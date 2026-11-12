# Site de Casamento - L & M - v5.1 (em andamento)

Esta release está em desenvolvimento. Este documento registra as mudanças já
implementadas e será atualizado conforme novas alterações forem concluídas.

## Implementado Até Agora

### Efeitos Visuais Nos Heros

- Criado um efeito atmosférico reutilizável com névoa suave e pontos de luz que
  sobem em velocidades variadas.
- Aplicado aos heros da página inicial, Nossa História, Pré-Wedding, RSVP,
  Manual dos Convidados, Programação, Mural de Recados e Fornecedores.
- Centralizadas as regras visuais em `css/hero-atmosphere.css` e a criação das
  camadas decorativas em `js/hero-atmosphere.js`, evitando manter implementações
  separadas em cada página.
- A animação respeita a preferência do sistema por movimento reduzido.

### Efeitos De Entrada Na Página Inicial

- Adicionados estouros decorativos em tons de lilás e roxo quando as seções da
  página inicial entram na área visível.
- Cada entrada apresenta três estouros em sequência, distribuídos em diferentes
  alturas da tela. O efeito não bloqueia cliques nem a rolagem.
- Para quem prefere movimento reduzido, os estouros aparecem sem animação.

## Banco De Dados E Compatibilidade

- As alterações registradas nesta versão são visuais e executadas no frontend.
- Não exigem migrations, mudanças de tabelas ou ajustes de configuração do
  Supabase.

## Estado Da Release

- A v5.1 permanece aberta para novas mudanças.
- Atualizar este documento e o README conforme outras alterações da release
  forem implementadas.
- Registrar o fechamento e eventuais passos de publicação somente quando o
  escopo da v5.1 estiver concluído.
