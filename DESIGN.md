# PDL Fotografia & Imagem: ficha de marca e direção

Direção escolhida em 2026-10-23: **A, "a lente do D"**, o nome como monumento. As outras
direções estudadas e os ajustes feitos à ficha sorteada estão em `docs/estudo-referencias.md`.

## Ideia

A lente que já existe dentro do D do logo vira a janela por onde as fotos aparecem. Na primeira
tela, o PDL ocupa a largura da página e a foto de capa aparece no miolo do D. Ao rolar, a lente se
abre até a foto cobrir a tela, e as fotos seguintes deslizam uma sobre a outra, em tela cheia. A
rolagem é de quem lê: nada anda sozinho.

## Cores

| Nome | Hex | Papel | Contraste |
| --- | --- | --- | --- |
| Pedra | `#eeecea` | Fundo da página | |
| Pedra média | `#e4e1dd` | Cupom do orçamento, pergunta aberta, lente sem foto | |
| Grafite | `#2b2a29` | Tinta; fundo do rodapé | 12,2:1 sobre pedra |
| Grafite suave | `#5f5b57` | Texto secundário (local e data do evento, legendas) | 5,7:1 sobre pedra; 5,2:1 sobre pedra média |
| Verde-mato | `#5c6b54` | Só as ações (botões); `#4a5744` ao passar o mouse | Branco sobre ele 5,7:1 (7,7:1 no escuro) |
| Erro | `#9e2a14` | Mensagens de erro do formulário | 6,4:1 sobre pedra |

Proporção: a pedra cobre quase tudo, o grafite faz o texto e o PDL, e o verde aparece só onde se
clica. As cores fortes vêm das fotos.

## Tipos

- **Bodoni Moda** (`public/fontes/bodoni-moda-latin.woff2`): o PDL monumental e os títulos.
  Serifa de alto contraste, da mesma família de desenho do logo.
- **Jost** (`public/fontes/jost-latin.woff2`): texto, botões e a lista de eventos. Geométrica, como
  "FOTOGRAFIA & IMAGEM" no logo.

Cinco tamanhos:

| Tamanho | Valor | Onde |
| --- | --- | --- |
| Pequeno | 14–15 px | Rótulos, legendas, passos |
| Corpo | 17–19 px | Texto |
| Linha | 20–30 px | Eventos, perguntas |
| Título | 34–72 px | Títulos de seção, frases da cobertura |
| Monumento | `min(39vw, 60svh)` | PDL na abertura e no rodapé (44vw no celular) |

As fontes são servidas pelo próprio site, sem pedido ao Google, o que é melhor para o carregamento
e para a LGPD.

## Voz

Direta e em primeira pessoa quando é o Pedro falando ("No dia, eu fotografo"), com frases curtas e
sem slogan. A frase de referência: "Festas e jogos fotografados de perto, do jeito que aconteceram."

## Elemento assinatura

A lente no miolo do D. Os arquivos:

- **Logo vetorizado:** `public/marca/pdl-logo.svg`, o logo completo, e
  `public/marca/pdl-marca.svg`, sem "FOTOGRAFIA & IMAGEM". Foram traçados a partir do PNG enviado
  e precisam da sua aprovação.
- **Favicon:** `public/favicon.svg`, o D com a câmera e a lente sobre a pedra.
- **Ícone do celular:** `public/apple-touch-icon.png`.

## Seções

| Seção | Forma | Por quê |
| --- | --- | --- |
| Abertura | PDL monumental, foto na lente, texto e "Encontrar minhas fotos" | Diz quem é e leva à ação nº 1 |
| Encontre suas fotos | Busca, três passos e uma linha por evento, num tamanho só | O trabalho nº 1: achar o álbum |
| Trabalho | Quatro fotos em tela cheia deslizando, depois pares | Fotos protagonistas, em movimento pela rolagem |
| Cobertura | Quatro frases em escada | O processo, sem numerar |
| Orçamento | Cupom com o mini-formulário do WhatsApp | O trabalho nº 2 |
| Perguntas | Título largo, perguntas recuadas | Responde preço, prazo e remoção de foto |
| Rodapé | Links em cima, PDL de ponta a ponta embaixo, cores invertidas | Fecha com a marca |

## Movimento

- **Cena da abertura:** a lente cresce com a rolagem até cobrir a tela; o PDL encolhe até 6% e some
  (`src/movimento.js`).
- **Sequência do trabalho:** as quatro primeiras fotos ficam presas no topo (`position: sticky`) e
  a seguinte desliza por cima.
- **Entradas:** título, texto e conteúdo de cada seção sobem 24 px em 700 ms, com 80 ms entre eles,
  uma vez só.
- **Resposta ao toque:** o botão encolhe 3% (140 ms) e o sublinhado do link engrossa (180 ms).
- **Movimento reduzido** (`prefers-reduced-motion`): sem cena e sem entradas, com todo o conteúdo
  visível.
- **WCAG 2.2.2:** não há nada que se mova sozinho.

## Provisório

As fotos são molduras ("Moldura provisória") até chegarem as do Behance. Para trocar, siga
`docs/como-atualizar.md`. O teste de texto falha enquanto alguma moldura continuar publicada.
