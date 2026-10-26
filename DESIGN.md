# PDL Fotografia & Imagem: ficha de marca e direção

Direção escolhida em 2026-10-23: **A, "a lente do D"**, o nome como monumento. As outras
direções estudadas e os ajustes feitos à ficha sorteada estão em `docs/estudo-referencias.md`.

## Ideia

A lente que já existe dentro do D do logo vira a janela por onde as fotos aparecem. Na primeira
tela, o logo ocupa a página e a foto de capa aparece na lente do D. Ao rolar, a lente se abre até a
foto cobrir a tela. Em Trabalho, cada foto se abre do mesmo jeito ao entrar na tela; na Cobertura,
a lente se abre um pouco mais a cada passo. A rolagem é de quem lê: nada anda sozinho.

## Cores

| Nome | Hex | Papel | Contraste |
| --- | --- | --- | --- |
| Pedra | `#eeecea` | Fundo da página | |
| Pedra média | `#e4e1dd` | Cupom do orçamento, pergunta aberta, lente sem foto | |
| Pedra escura | `#cdc3b6` | Segundo quadro da Cobertura | |
| Grafite | `#2b2a29` | Tinta; fundo do rodapé | 12,2:1 sobre pedra |
| Grafite suave | `#5f5b57` | Texto secundário (local e data do evento, legendas) | 5,7:1 sobre pedra; 5,2:1 sobre pedra média |
| Verde-mato | `#5c6b54` | Só as ações (botões); `#4a5744` ao passar o mouse | Branco sobre ele 5,7:1 (7,7:1 no escuro) |
| Erro | `#9e2a14` | Mensagens de erro do formulário | 6,4:1 sobre pedra |

Proporção: a pedra cobre quase tudo, o grafite faz o texto e o PDL, e o verde aparece só onde se
clica. As cores fortes vêm das fotos.

## Tipos

- **Bodoni Moda** (`public/fontes/bodoni-moda-latin.woff2`): os títulos. Serifa de alto
  contraste, da mesma família de desenho do logo.
- **Jost** (`public/fontes/jost-latin.woff2`): texto, botões e a lista de eventos. Geométrica, como
  "FOTOGRAFIA & IMAGEM" no logo.

Quatro tamanhos de texto, mais o logo:

| Tamanho | Valor | Onde |
| --- | --- | --- |
| Pequeno | 14–15 px | Rótulos, legendas, passos |
| Corpo | 17–19 px | Texto |
| Linha | 20–30 px | Eventos, perguntas |
| Título | 34–72 px | Títulos de seção, frases da cobertura |
| Logo | largura da tela, até 58svh de altura | Abertura (30svh no celular) e rodapé, de ponta a ponta |

As fontes são servidas pelo próprio site, sem pedido ao Google, o que é melhor para o carregamento
e para a LGPD.

## Voz

Direta e em primeira pessoa quando é o Pedro falando ("No dia, eu fotografo"), com frases curtas e
sem slogan. A frase de referência: "Festas e jogos fotografados de perto, do jeito que aconteceram."

## Elemento assinatura

A lente no miolo do D. Os arquivos:

- **Logo vetorizado (aprovado em 2026-10-26):** `public/marca/pdl-logo.svg`, o logo completo, e
  `public/marca/pdl-marca.svg`, sem "FOTOGRAFIA & IMAGEM". O site usa `pdl-logo-escuro.svg` (grafite,
  na abertura) e `pdl-logo-claro.svg` (pedra, no rodapé), cópias com a cor gravada.
- **A lente no logo:** centro em 50,71% da largura e 49,88% da altura do logo, raio de 16,9% da
  altura, por dentro do anel mais grosso (`src/movimento.js`).
- **Favicon:** `public/favicon.svg`, o D com a câmera e a lente sobre a pedra.
- **Ícone do celular:** `public/apple-touch-icon.png`.

## Seções

| Seção | Forma | Por quê |
| --- | --- | --- |
| Abertura | Logo grande, foto na lente, texto e "Encontrar minhas fotos" | Diz quem é e leva à ação nº 1 |
| Encontre suas fotos | Busca, três passos e uma linha por evento, num tamanho só | O trabalho nº 1: achar o álbum |
| Trabalho | Pares desencontrados sobre o fundo vazio, como numa exposição (`gallery-staggered-pairs`) | Fotos protagonistas, cada uma com espaço |
| Cobertura | Quatro quadros que crescem; a mesma foto vista por uma lente cada vez mais aberta (`how-it-works-tiles-that-grow`) | O processo pela ordem do tamanho, sem numerar |
| Orçamento | Cupom com o mini-formulário do WhatsApp | O trabalho nº 2 |
| Perguntas | Título largo, perguntas recuadas | Responde preço, prazo e remoção de foto |
| Rodapé | Links em cima, logo de ponta a ponta embaixo, cores invertidas | Fecha com a marca |

## Movimento

- **Cena da abertura:** a lente cresce com a rolagem até cobrir a tela; o logo encolhe até 6% e
  some (`src/movimento.js`).
- **Fotos de Trabalho:** cada foto se abre num círculo a partir do seu ponto de foco e assenta
  (de 112% para 100%) enquanto entra na tela, ligada à rolagem (`animation-timeline: view()` em
  `src/style.css`). Onde o navegador não tem isso (o Firefox, hoje), as fotos aparecem inteiras.
- **Cobertura:** a lente de cada quadro termina de abrir ao chegar à tela.
- **Entradas:** título, texto e conteúdo de cada seção sobem 24 px em 700 ms, com 80 ms entre eles,
  uma vez só.
- **Resposta ao toque:** o botão encolhe 3% (140 ms) e o sublinhado do link engrossa (180 ms).
- **Movimento reduzido** (`prefers-reduced-motion`): sem cena e sem entradas, com todo o conteúdo
  visível.
- **WCAG 2.2.2:** não há nada que se mova sozinho.

## Provisório

As fotos são molduras ("Moldura provisória") até chegarem as do Behance. Para trocar, siga
`docs/como-atualizar.md`. O teste de texto falha enquanto alguma moldura continuar publicada.
