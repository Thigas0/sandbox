# Estudo de referências e direções (Fase 1)

## Limitação

A rede deste ambiente bloqueia o Fotto, o Behance e os sites de referência (o proxy recusa a
conexão). O estudo foi feito com busca na web, que traz só títulos e resumos, e com os resumos de
181 sites premiados que a taste-skill guarda em `.claude/skills/taste-skill/library/sites.json`.
Nenhum site foi aberto nem fotografado. Quando a rede for liberada, vale abrir as referências abaixo
e conferir.

## O que a busca mostrou

- **Campinas:** os fotógrafos que aparecem fazem casamento e eventos sociais ou corporativos, por
  exemplo Fernando Coutinho Fotografia e Cinema (Campinas, Valinhos, Vinhedo, Jundiaí, Indaiatuba,
  Sumaré) e Studio Soares (casamento e fotojornalismo). Não apareceu ninguém com site próprio
  vendendo foto de festa e de jogo por plataforma. O PDL pode ocupar esse espaço com um site que leva
  direto ao álbum do evento.
- **Fotógrafo de balada no exterior:** o Nicophoto, de Londres, organiza o site pelo evento: arquivo
  de galerias, um "Top 100" dos álbuns mais vistos, portfólio e reserva. É o mesmo trabalho nº 1 do
  PDL: quem esteve lá quer achar o próprio álbum.
- **Fotto:** é da Alboom. O comprador acha as fotos com uma selfie, paga online e pode receber pelo
  WhatsApp. O uso é pessoal: postar e imprimir pode, revender não. O cliente confirmou que os
  eventos do Pedro usam a busca por selfie.
- **Listas de "melhores portfólios":** repetem as plataformas (Squarespace, Format, PhotoShelter) e
  não trazem fotógrafos de esporte nem de evento com desenho editorial.

## Referências de desenho (resumos da taste-skill)

| Site | O que tem de útil para o PDL |
| --- | --- |
| City of Angels | Um título fixo enquanto os retratos trocam por baixo: cada rolagem é uma capa nova. |
| Julien Calot | Recortes em tela cheia, com texto pequeno como etiqueta de museu. |
| Tengile Malamala | Fotos em tamanhos e alturas diferentes, ritmo calmo de galeria. |
| Lovably | Legendas que funcionam como pequenas manchetes, num diário de trabalhos. |
| Gil Huybrecht | O portfólio como folha de contato: muitas miniaturas em ordem. |

## O que isso muda no site

1. O evento vem primeiro: "Encontrar minhas fotos" aparece na primeira tela e o último evento
   está a um toque.
2. As fotos aparecem grandes, nunca em grade de cartões. As legendas são curtas, como etiqueta de
   galeria (evento, cidade, mês).
3. O preço por foto fica visível antes de a pessoa sair para o Fotto. O da cobertura é combinado no
   WhatsApp.

## Sorteio da taste-skill

`draw.mjs --sector studio-portfolio --tone editorial --have photography --sections
list,gallery,how-it-works,faq,contact,footer --options 3` deu três direções:

- **Folha de contato:** descartada. Pede mais de 20 fotos e mostra tudo pequeno, o contrário de
  "fotos protagonistas".
- **A, o nome como monumento** (semente 115947482): o PDL gigante, e a lente que já existe dentro
  do D do logo vira a janela das fotos. Ideia: "a lente do D vira a janela por onde as fotos
  aparecem". Outro fotógrafo não poderia usar a mesma frase.
- **B, fotos em tamanhos irregulares** (semente 243686592): as fotos penduradas como numa exposição,
  com o título "De perto, como foi" (tirado da frase aprovada) em itálico.

Ajustes à ficha sorteada, cada um por um motivo do briefing:

- **A, tipo:** veio Hanken Grotesk, uma sem serifa sem cara de "tipografia de luxo". Ficou Bodoni
  Moda, serifa de alto contraste próxima do logo, para o monumento e os títulos, mais Jost, geométrica
  como "FOTOGRAFIA & IMAGEM", para o texto.
- **A, galeria:** a ficha trouxe molduras pequenas numa faixa, mas as fotos são protagonistas. Ficou
  uma sequência em tela cheia, `gallery-full-bleed-sequence`, uma foto deslizando sobre a outra.
- **A e B, contato:** as fichas não tinham formulário, e o contato escolhido é o mini-formulário do
  WhatsApp. Na A ele virou um cupom, `contact-clip-out-coupon`; na B, o formulário ocupa o lugar dos
  links.
- **B, cores:** veio um cinza médio e, no novo sorteio, verde-garrafa e dourado; o briefing pede
  claro. Valem as cores do logo: tinta quase preta sobre branco de galeria.
- **B, movimento:** a ficha só animava o título ao carregar. Somei o "obturador" da própria direção,
  ligado à rolagem, porque o briefing pede fotos em movimento guiado pela rolagem.

Depois da escolha da A (2026-10-26), a pedido do cliente:

- **Logo no lugar do PDL em Bodoni:** o logo aprovado ocupa a abertura e o rodapé; a foto de capa
  nasce na lente que o logo já tem.
- **Galeria:** a sequência em tela cheia não agradou. Ficou `gallery-staggered-pairs`, uma das
  alternativas da própria direção: pares desencontrados, como numa exposição, e cada foto se abre
  como a lente da abertura.
- **Cobertura:** a escada de frases não agradou. Ficou `how-it-works-tiles-that-grow`, com quatro
  quadros em vez de três e a mesma foto vista por uma lente cada vez mais aberta.
- **Privacidade:** ganhou quatro fotos e entradas, porque o inspetor reprova página sem fotos e sem
  movimento.

Na rodada seguinte (2026-10-26, também a pedido do cliente):

- **Cores:** as da peça da marca "Respeite o trabalho fotográfico" (marfim, tinta quase preta,
  um losango dourado, que saiu na rodada seguinte) no lugar da pedra e do verde da ficha. O inspetor avisa que o fundo é
  creme; fica assim porque a cor é da marca.
- **Profundidade:** grão de papel, faixas de areia, paspatur nas fotos e a moldura dupla da peça
  da marca. A moldura é a única exceção à regra das linhas finas, marcada no CSS.
- **Primeira tela:** composição centralizada dentro da moldura (logo, frase, apoio, duas
  ações, último evento), no lugar do texto num canto e do logo embaixo.

Na rodada de 2026-10-27, a pedido do cliente:

- **Fonte do texto:** a Jost saiu. Entrou a Source Sans 3, a fonte da linha "FOTOGRAFIA & IMAGEM"
  do logo, identificada por sobreposição letra a letra com 70 famílias livres.
- **Tamanhos:** os passos da compra e da Cobertura subiram para um tamanho novo, "destaque", na
  mesma escala de razão 1,25 dos outros.
- **Losango:** saiu de cima do logo.

Na rodada seguinte (2026-10-27), também a pedido do cliente:

- **Compra:** os três passos saíram das três colunas espalhadas e ficaram um embaixo do outro, ao
  lado do título, a partir do meio da página.
- **Moldura:** mais visível (filete grosso e fino, num tom mais escuro), com o menu acima dela.
- **Trabalho:** a lente do logo, enorme, ao fundo; fotos em camadas e rolagem interativa em todo
  navegador (antes, só onde havia `animation-timeline`).
- **Orçamento:** o campo "Cidade" virou "Local".

Na rodada seguinte (2026-10-28), também a pedido do cliente:

- **Compra:** os três passos numerados viraram uma frase corrida embaixo do título, e a seção
  inteira passou a partir da margem esquerda. Antes, foram comparadas três formas em 1440 e 390 px:
  frase corrida (a escolhida), busca em destaque e ficha na margem.
- **Texto que sobe:** os títulos das seções e a frase de Fotos aparecem com as palavras subindo de
  trás da linha, na primeira vez que a página desce até eles.

Na rodada seguinte (2026-10-29), também a pedido do cliente, que escolheu cada caminho entre três:

- **Compra:** "Encontre suas fotos" virou um visor de câmera com a busca no meio, com duas fontes
  só (antes, o aviso cinza parecia uma terceira). As outras opções eram uma folha de contato e
  ingressos.
- **Trabalho:** as fotos se revelam como no laboratório, em vez de abrir num círculo, e a lente do
  fundo cresce até quase o dobro enquanto gira.
- **Cobertura:** um rolo de filme que passa de lado com a rolagem. As outras ideias eram uma conversa
  no WhatsApp, o dia contado em horários e fotos espalhadas na mesa.
- **Texto:** o foco da lente no lugar das palavras que subiam: as letras chegam desfocadas e
  afastadas e entram em foco do centro para as pontas.

Na rodada seguinte (2026-10-29), também a pedido do cliente:

- **Modo escuro:** a "câmara escura", que segue o sistema e tem um botão no topo; a escolha fica no
  aparelho, e a página de privacidade passou a dizer isso.
- **Perguntas:** "Quanto custa uma cobertura?" veio para o topo.
- **Cobertura:** sem as linhas de apoio, e "Combinamos o preço" virou "Combinamos o orçamento".
- **Privacidade:** duas fotos em vez de quatro.
- **Rodapé:** links e crédito centralizados.

As pranchas usam molduras coloridas no lugar das fotos, porque as fotos do Behance ainda não
puderam ser baixadas. As capturas e os GIFs ficaram fora do repositório e foram enviados na
conversa.

## Fontes

- [Fernando Coutinho Fotografia e Cinema](https://www.casamentos.com.br/fotografo-casamento/fernando-coutinho-fotografia-e-cinema--e227660) e [perfil no Speaker Deck](https://speakerdeck.com/fernandocoutinho)
- [Studio Soares Produções e Eventos](https://www.ohub.com.br/empresa/studio-soares-producoes-e-eventos-campinas-sp-43596)
- [Nicophoto](https://nicophoto.co.uk/)
- [Fotto](https://www.fotto.com.br/en) e [ajuda do Fotto](https://ajuda.fotto.com.br/hc/pt-br/articles/22440549254029-Como-preparar-suas-fotos-para-vender-na-Fotto)
- [25 Best Photography Portfolio Websites in 2026](https://expertphotography.com/photography-portfolio-websites) e [Imagely, 15 best photography websites](https://www.imagely.com/best-photography-websites-for-inspiration/)
