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
fotográfico. Valorize quem cria."): papel marfim, tinta quase preta e uma moldura de duas
linhas finas. O losango dourado da peça saiu em 2026-10-27, a pedido do cliente.

| Nome | Hex | Papel | Contraste |
| --- | --- | --- | --- |
| Marfim | `#f4efe6` | Fundo da página, com grão de papel | |
| Papel | `#faf7f1` | Paspatur das fotos, cartão do orçamento | |
| Areia | `#ebe4d6` | Faixas de Trabalho e do orçamento, pergunta aberta | |
| Areia escura | `#ddd3c1` | Segundo quadro da Cobertura | |
| Linha | `#b3a385` | A moldura dupla (abertura e orçamento): filete de 2 px por fora e de 1 px por dentro | Decorativa |
| Tinta | `#24211d` | Texto, botão principal, fundo do rodapé | 14,0:1 sobre marfim; 12,7:1 sobre areia |
| Tinta suave | `#5f574b` | Texto secundário (local e data, legendas, apoio) | 6,2:1 sobre marfim; 5,6:1 sobre areia |
| Tinta clara | `#cfc6b5` | Texto secundário no rodapé escuro | 9,5:1 sobre tinta |
| Erro | `#9e2a14` | Mensagens de erro do formulário | 6,6:1 sobre marfim |

O botão principal é tinta com letra marfim (14,0:1) e escurece para `#4a4032` ao passar o mouse; o
secundário tem só o contorno. As cores fortes vêm das fotos.

## Profundidade, sem perder a calma

- **Grão de papel:** um ruído fino e quente (`--grao` em `src/style.css`) sobre o marfim e as faixas
  de areia, para o fundo não parecer branco chapado.
- **Moldura dupla:** a mesma da peça da marca, em volta da primeira tela e do cartão do orçamento:
  um filete de 2 px por fora e um de 1 px por dentro, 5 px entre eles. Na abertura, o menu fica numa
  faixa acima da moldura, para não cruzar a linha quando a página rola. É uma exceção pedida pelo
  cliente à regra da taste-skill que proíbe linhas finas.
- **Faixas de tom:** Trabalho e Orçamento ficam sobre areia; o resto, sobre marfim; o rodapé, na
  tinta.
- **Paspatur:** em Trabalho e na página de privacidade, cada foto vem montada num papel mais claro,
  como numa exposição. É um passo de tom, sem linha e sem sombra.
- **A lente ao fundo de Trabalho:** a lente do logo (`public/marca/pdl-lente.svg`, recortada do
  logo traçado), enorme e um tom mais escura que a parede de areia, fica presa no meio da tela
  enquanto as fotos passam na frente dela. As fotos andam em velocidades diferentes (umas parecem
  mais perto, outras mais longe), e a lente gira com a rolagem, como o anel de foco.

## Tipos

- **Bodoni Moda** (`public/fontes/bodoni-moda-latin.woff2`): os títulos. Serifa de alto
  contraste, da mesma família de desenho do logo.
- **Source Sans 3** (`public/fontes/source-sans-3-latin.woff2`): texto, botões, menu e a lista de
  eventos. É a fonte da linha "FOTOGRAFIA & IMAGEM" do logo: a Source Sans (antes chamada Source
  Sans Pro), no peso regular. Foi identificada em 2026-10-27 comparando, letra a letra, essa linha
  do logo original com 70 famílias de fontes livres; foi a que mais coincidiu (a Jost, usada antes,
  ficou bem atrás).

Cinco tamanhos de texto, numa escala de razão 1,25 a partir do corpo, mais o logo:

| Tamanho | Valor | Onde |
| --- | --- | --- |
| Pequeno | 14–15 px (corpo ÷ 1,25) | Menu, rótulos, legendas, último evento |
| Corpo | 17–19 px | Texto, botões, apoio da abertura |
| Destaque | 19–24 px (corpo × 1,25) | Os passos da Cobertura |
| Linha | 21–30 px (corpo × 1,25²) | Eventos, perguntas, frase da abertura, frase de Fotos |
| Título | 34–72 px (corpo × 1,25⁶) | Títulos de seção |
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
| Abertura | Quadro de moldura dupla: logo com a foto na lente, frase, apoio, "Encontrar minhas fotos" e "Pedir orçamento", último evento; tudo centralizado | Diz quem é e leva às duas ações |
| Encontre suas fotos | Tudo a partir da margem esquerda: o título, uma frase corrida que conta como comprar ("Abra o seu evento na lista. No Fotto, uma selfie mostra só as fotos em que você aparece: escolha as suas e pague ali mesmo."), a busca e uma linha por evento | O trabalho nº 1: achar o álbum, lendo de cima para baixo, sem tópicos numerados |
| Trabalho | Pares desencontrados sobre uma parede de areia, como numa exposição (`gallery-staggered-pairs`), com a lente do logo ao fundo | Fotos protagonistas, cada uma com espaço e profundidade |
| Cobertura | Quatro quadros que crescem; a mesma foto vista por uma lente cada vez mais aberta (`how-it-works-tiles-that-grow`) | O processo pela ordem do tamanho, sem numerar |
| Orçamento | Cupom com o mini-formulário do WhatsApp | O trabalho nº 2 |
| Perguntas | Título largo, perguntas recuadas | Responde preço, prazo e remoção de foto |
| Rodapé | Links em cima, logo de ponta a ponta embaixo, cores invertidas | Fecha com a marca |

## Movimento

- **Cena da abertura:** a lente cresce com a rolagem até cobrir a tela; o logo encolhe até 6% e
  some (`src/movimento.js`).
- **Fotos de Trabalho** (`iniciarFotos` em `src/movimento.js`, em todo navegador): ligadas à
  rolagem, cada foto se abre num círculo a partir do seu ponto de foco enquanto entra na tela e
  passeia um pouco dentro do paspatur, como vista por uma janela. Cada uma anda até 100 px a mais
  ou a menos que a página (metade no celular), o que as separa em camadas, e a lente do fundo gira
  até 160° e cresce de 92% para 108%. As quatro fotos da página de privacidade se abrem do mesmo
  jeito, com um terço do desvio.
- **Cobertura:** a lente de cada quadro termina de abrir ao chegar à tela.
- **Texto que sobe** (`iniciarPalavras` em `src/movimento.js`): na primeira vez que a página desce
  até eles, os títulos das seções e a frase de Fotos aparecem com cada palavra subindo de trás da
  própria linha, como numa máscara, em 800 ms. As linhas sobem uma depois da outra (120 ms). Nos
  títulos, as palavras de cada linha vêm da esquerda para a direita (40 ms); a frase de Fotos sobe
  linha a linha, 200 ms depois do título, para ser lida logo. O leitor de tela ouve cada texto
  inteiro, e no fim o elemento volta a ser só texto, no mesmo lugar.
- **Entradas:** o texto e o conteúdo de cada seção sobem 24 px em 700 ms, com 80 ms entre eles,
  depois do título, uma vez só.
- **Resposta ao toque:** o botão encolhe 3% (140 ms) e o sublinhado do link engrossa (180 ms).
- **Movimento reduzido** (`prefers-reduced-motion`): sem cena, sem entradas, sem texto que sobe e
  com Trabalho parado, com todo o conteúdo visível.
- **WCAG 2.2.2:** não há nada que se mova sozinho.

## Provisório

As fotos são molduras ("Moldura provisória") até chegarem as do Behance. Para trocar, siga
`docs/como-atualizar.md`. O teste de texto falha enquanto alguma moldura continuar publicada.
