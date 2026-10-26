# PDL Fotografia & Imagem: ficha de marca e direção

Direção escolhida em 2026-10-23: **A, "a lente do D"**, o nome como monumento. As outras
direções estudadas e os ajustes feitos à ficha sorteada estão em `docs/estudo-referencias.md`.

## Ideia

A lente que já existe dentro do D do logo vira a janela por onde as fotos aparecem. Na primeira
tela, o logo fica no centro de um quadro de moldura dupla e a foto de capa aparece na lente do D. Ao rolar, a lente se abre até a
foto cobrir a tela. Em Trabalho, cada foto se abre do mesmo jeito ao entrar na tela; na Cobertura,
a lente se abre um pouco mais a cada passo. A rolagem é de quem lê: nada anda sozinho.

## Cores

Desde 2026-10-26, as cores seguem a peça da marca que o cliente enviou ("Respeite o trabalho
fotográfico. Valorize quem cria."): papel marfim, tinta quase preta, uma moldura de duas linhas
finas e um losango dourado.

| Nome | Hex | Papel | Contraste |
| --- | --- | --- | --- |
| Marfim | `#f4efe6` | Fundo da página, com grão de papel | |
| Papel | `#faf7f1` | Paspatur das fotos, cartão do orçamento | |
| Areia | `#ebe4d6` | Faixas de Trabalho e do orçamento, pergunta aberta | |
| Areia escura | `#ddd3c1` | Segundo quadro da Cobertura | |
| Linha | `#d3c9b6` | A moldura dupla (abertura e orçamento) | Decorativa |
| Dourado | `#b09b74` | Só o losango sobre o logo | Decorativo |
| Tinta | `#24211d` | Texto, botão principal, fundo do rodapé | 14,0:1 sobre marfim; 12,7:1 sobre areia |
| Tinta suave | `#5f574b` | Texto secundário (local e data, legendas, apoio) | 6,2:1 sobre marfim; 5,6:1 sobre areia |
| Tinta clara | `#cfc6b5` | Texto secundário no rodapé escuro | 9,5:1 sobre tinta |
| Erro | `#9e2a14` | Mensagens de erro do formulário | 6,6:1 sobre marfim |

O botão principal é tinta com letra marfim (14,0:1) e escurece para `#4a4032` ao passar o mouse; o
secundário tem só o contorno. As cores fortes vêm das fotos.

## Profundidade, sem perder a calma

- **Grão de papel:** um ruído fino e quente (`--grao` em `src/style.css`) sobre o marfim e as faixas
  de areia, para o fundo não parecer branco chapado.
- **Moldura dupla:** a mesma da peça da marca, em volta da primeira tela e do cartão do orçamento.
  É uma exceção pedida pelo cliente à regra da taste-skill que proíbe linhas finas.
- **Faixas de tom:** Trabalho e Orçamento ficam sobre areia; o resto, sobre marfim; o rodapé, na
  tinta.
- **Paspatur:** em Trabalho e na página de privacidade, cada foto vem montada num papel mais claro,
  como numa exposição. É um passo de tom, sem linha e sem sombra.

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
| Logo | até 60% da largura e 40svh de altura | Abertura, no centro (84% da largura no celular); rodapé, de ponta a ponta |

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
| Abertura | Quadro de moldura dupla: losango, logo com a foto na lente, frase, apoio, "Encontrar minhas fotos" e "Pedir orçamento", último evento; tudo centralizado | Diz quem é e leva às duas ações |
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
