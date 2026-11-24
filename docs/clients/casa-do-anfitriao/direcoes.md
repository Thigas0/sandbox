# Direções visuais — Casa do Anfitrião (Fase 3)

24/11/2026. As 3 direções seguem a marca observada: **preto, dourado e flor-de-lis**, com o conceito
"a Casa mais Francesa da Cidade". O que muda entre elas é a composição, a tipografia e o motion. As
composições foram sorteadas com o `taste-skill` (setor `restaurant`, paleta fixa) e depois ajustadas
ao inventário do cliente.

Mockups estáticos da hero (abra o `hero.html` no navegador). As capturas estão em 1440 px e 390 px,
na pasta de cada direção.

## Paleta comum (contraste WCAG medido)

| Nome    | Hex       | Uso                                         | Contraste                                   |
| ------- | --------- | ------------------------------------------- | ------------------------------------------- |
| Noir    | `#14110D` | Fundo escuro, tinta sobre papel             | 16,3:1 com Ivoire                           |
| Or      | `#C9A55A` | Flor-de-lis, faixa, botão sobre preto       | 8,1:1 sobre Noir · **2,0:1 sobre Ivoire, nunca texto** |
| Ivoire  | `#F2EEE6` | Papel, fundo claro                          | —                                           |
| Crème   | `#EDE6D6` | Texto sobre preto (direção B)               | 15,1:1 sobre Noir                           |
| Sépia   | `#5C5346` | Texto secundário sobre papel                | 6,5:1 sobre Ivoire                          |
| Or foncé | `#7A5A1E` | Links sobre papel (direção C)              | 5,5:1 sobre Ivoire                          |

O `#14110D` é um preto quente escolhido de propósito, para conversar com o dourado. Se o cliente
tiver o preto exato do logo, ele substitui este.

## A — O cartão da casa

- **Conceito:** neste site, **o cartão impresso de uma casa francesa, com o toldo listrado da
  fachada**, vira **a própria página**.
- **Composição:** a tela é dividida ao meio. À esquerda fica um cartão marfim com a faixa listrada
  preto e dourado (eco dos toldos) e a flor-de-lis. À direita, uma pintura fixa em tela cheia.
- **Tipografia:** Imbue (didone condensada, em caixa alta, como letreiro de fachada) com Albert Sans
  no texto.
- **Imagem:** _A brioche_, de Édouard Manet (1870), The Met, domínio público.
- **Referência da design-library:** `docs/design-library/starbucks/DESIGN.md`: café com fundo
  quente que remete aos materiais da loja e ritmo de blocos de cor alternando claro e escuro.
- **Motion da hero:** a pintura entra num crossfade lento (900 ms) enquanto a faixa do toldo
  "desenrola" da esquerda para a direita (scaleX, 600 ms). No scroll, a pintura fica fixa
  (`position: sticky`) e o cartão rola. Com `prefers-reduced-motion`, tudo aparece já no lugar.
- **Captura:** `direcoes/a/hero-desktop.png`, `direcoes/a/hero-mobile.png`

## B — A flor-de-lis

- **Conceito:** neste site, **a flor-de-lis do logo** vira **o único desenho de todo o sistema**: a
  forma gigante da hero, a máscara das fotos, o formato do botão e o marcador das listas.
- **Composição:** fundo preto com a flor-de-lis dourada a cerca de 120% da altura da tela, cortada
  pela direita. A manchete fica à esquerda, em creme.
- **Tipografia:** Young Serif (serifa pesada e redonda, calorosa) com Source Serif 4 no texto.
  O sorteio original trazia General Sans (Fontshare); troquei por esta para manter as fontes no
  Google Fonts.
- **Imagem:** nenhuma foto na hero, só o desenho da marca. Nas seções seguintes, as fotos do
  cliente entrariam recortadas no formato da pétala.
- **Referência da design-library:** `docs/design-library/ferrari/DESIGN.md`: fundo quase preto,
  editorial e cinematográfico, com um único acento de marca.
- **Motion da hero:** a flor-de-lis desliza 8% da direita para dentro e as pétalas abrem por
  `clip-path` (800 ms). Com cursor (`(hover: hover) and (pointer: fine)`), ela gira até 3° acompanhando
  o mouse. No scroll (CSS `animation-timeline: scroll()`), ela sobe mais devagar que o texto.
  Com reduced-motion, fica parada.
- **Captura:** `direcoes/b/hero-desktop.png`, `direcoes/b/hero-mobile.png`

## C — Lembranças de viagem

- **Conceito:** neste site, **as viagens dos anfitriões** (os destaques do Instagram mostram
  Argentina, Uruguai, Chile, Veneza e Toscana) viram **uma parede de gravuras e pinturas em tamanhos
  desiguais**, como lembranças trazidas para a Getúlio Vargas.
- **Composição:** fundo marfim, título em degrau ("Paris fica / em Itapira"), uma paisagem pequena no
  alto à direita e um retrato alto à esquerda, cortado pela tela.
- **Tipografia:** STIX Two Text (romana clássica, de livro), uma só família.
- **Imagens:** _Terraço do Café de la Paix_, de János Vaszary (1925), Wikimedia Commons, domínio
  público, com toldo vermelho como a fachada; _Vendedor de pastéis_, do conde de Caylus (1738), The
  Met, domínio público.
- **Referência da design-library:** `docs/design-library/airbnb/DESIGN.md`: a fotografia conduz e o
  texto fica contido.
- **Motion da hero:** o título é revelado por máscara, linha a linha (700 ms, defasagem de 120 ms). As
  imagens sobem com parallax leve por CSS Scroll-Driven Animations, com fallback estático. Com
  reduced-motion, não há deslocamento.
- **Captura:** `direcoes/c/hero-desktop.png`, `direcoes/c/hero-mobile.png`

## Elemento vivo (nas 3)

Ao lado do botão, a página diz **"Aberto agora, até as 19h"** ou **"Fechado agora. Abrimos de terça a
sábado"**, calculado pelo horário de Itapira (terça a sexta 12h–19h, sábado 9h–18h). Sem JavaScript,
aparece o horário fixo.

## Verificação feita (24/11/2026)

- Playwright, 1440×900 e 390×844 (deviceScaleFactor 2): sem scroll horizontal, manchete em até 2
  linhas nas duas larguras, fontes carregadas, nenhum erro de console.
- axe (WCAG 2.0/2.1 A e AA): **nenhuma violação** nos 6 cenários.
- Ajustes feitos na revisão: a manchete da B estava com 4 linhas (reduzi o tamanho e alarguei a
  coluna); o menu da B estava sobre o dourado (movi para junto da marca); no celular, o status da B
  encostava na flor-de-lis e a legenda da A era coberta pelo cartão.

## Pontos a confirmar com o cliente

- O texto da C diz que os doces foram "trazidos das viagens dos anfitriões". É uma **inferência**
  tirada dos destaques do Instagram e precisa ser confirmada.
- "Um barista que recebe você pelo nome" (B) é um copy de exemplo.
- O preto e o dourado exatos do logo, e o arquivo vetorial.
- Os toldos listrados da fachada (direção A) são uma **inferência** feita a partir de uma miniatura de
  busca e precisam ser confirmados.
- As pinturas e gravuras são de acervo e mostram o mundo francês, **não** os produtos da casa. Fotos
  reais dos produtos devem substituí-las ou acompanhá-las.

## Créditos das imagens

- "The Brioche", Edouard Manet, 1870. Public domain (CC0), The Metropolitan Museum of Art.
  https://www.metmuseum.org/art/collection/search/436946
- "Terrace of the Cafe de la Paix, Paris", János Vaszary, 1925. Public domain, Wikimedia Commons.
  https://commons.wikimedia.org/wiki/File:Vaszary_-_Terrace_of_the_Cafe_de_la_Paix,_Paris.jpg
- "Pastry Seller", Anne Claude Philippe de Tubières, comte de Caylus, 1738. Public domain (CC0), The
  Metropolitan Museum of Art. https://www.metmuseum.org/art/collection/search/398839

As imagens foram reduzidas para no máximo 1600 px e salvas em `direcoes/assets/`.

## Recomendação

**A — O cartão da casa.** É a única das três que usa algo que só este cliente tem (os toldos
listrados e o "receber em casa"), mostra uma imagem forte já na primeira tela e funciona bem quando
as fotos reais chegarem, porque a pintura dá lugar a uma foto do salão sem mudar a composição.
A **B** é a mais marcante e a mais barata de manter, porque não depende de fotos. A **C** é a mais
editorial, mas depende de confirmar a história das viagens.
