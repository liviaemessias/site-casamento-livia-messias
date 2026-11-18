# Artes Dos Jogos Do RSVP

Cada pasta (`general`, `parents`, `godparents`) contém a arte final `art.svg`
usada pelo tipo correspondente de jogo. O jogo carrega a arte e recorta cada
quadrante no navegador.

Montagem correta:

```text
01 02
03 04
```

Para atualizar uma arte, substitua o `art.svg` do tipo correspondente mantendo
o canvas de `600 × 420` unidades e a proporção 10:7. O jogo continuará
recortando os quatro quadrantes. Se a arte usar outra proporção, ajuste também
a proporção do tabuleiro em `css/rsvp.css`.

As três artes são SVGs e não dependem de imagens externas. A arte geral usa
corações; a arte de Pais usa uma árvore com raízes; a arte de
Padrinhos/Madrinhas usa alianças, coração e flores.
