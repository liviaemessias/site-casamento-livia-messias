# Artes De Exemplo Para Os Jogos Do RSVP

Cada pasta (`general`, `parents`, `godparents`) contém uma arte de exemplo
`art.svg`. O jogo carrega essa arte e recorta cada quadrante no navegador.

Montagem correta:

```text
01 02
03 04
```

Para trocar a ilustração pelo desenho final, substitua `art.svg` mantendo o
canvas de `600 × 420` unidades e a proporção 10:7. O jogo continuará recortando
os quatro quadrantes. Se a arte final usar outra proporção, ajuste também a
proporção do tabuleiro em `css/rsvp.css`.

Os desenhos atuais são apenas exemplos vetoriais, sem dependências de fontes ou
imagens externas. A arte geral usa corações; a arte de Pais usa uma árvore com
raízes; a arte de Padrinhos/Madrinhas usa alianças, coração e flores.
