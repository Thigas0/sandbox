# DESIGN.md: Hugão Lanches & Burgers (rascunho)

Rascunho de marca tirado do material real do Hugão, em 2026-11-19. A direção final sai das skills de
design na construção (taste-skill, pro-design, frontend-design). Fontes do material: o selo do
bsfood, o avatar e as artes do Instagram, a fachada nova (post de 18/06/2026) e a fachada antiga
(print do perfil do Google). Origem de cada imagem: `docs/cliente/creditos-imagens.md`.

## A marca que já existe

- **Selo redondo.** Disco vermelho, letras "HUGÃO" em laranja e amarelo com contorno grosso, sobre
  a cúpula de um pão de hambúrguer com gergelim. Embaixo vem "LANCHES & BURGUERS". Aparece no
  bsfood, no avatar do Instagram, em todas as artes e no luminoso redondo da fachada nova.
- **Fachada nova** (Instagram, jun/2026). Parede escura, letreiro "HUGÃO LANCHES & BURGERS" em
  letras brancas quentes iluminadas, pergolado com cordão de lâmpadas e plantas na frente.
- **Fachada antiga** (print do Google). Faixa vermelha com o logo "HUGÃO LANCHES", onda amarela na
  vitrine e mascote em cartoon. Não aparece em nenhum material atual. É preciso confirmar com o
  Hugo se ela é da R. Irmã Dulce ou do endereço antigo.
- **Grafia.** O selo diz "Burguers" e o letreiro diz "Burgers". O site demo usa "Hugão Lanches &
  Burgers", por decisão de 2026-11-19, e a grafia final fica com o Hugo.

## Cores

Amostradas em pixels do selo do bsfood, do avatar do Instagram e da foto da fachada nova. As
razões de contraste são WCAG 2.1, calculadas.

| Nome | Hex | De onde vem | Papel |
| :- | :- | :- | :- |
| Vermelho Hugão | `#DF0209` | disco do selo | Cor da marca. Fundos grandes e botão principal ("Pedir agora"), com texto branco (5,06:1). Não usar como texto sobre o carvão (3,52:1). |
| Brasa | `#B5060B` | sombra do vermelho no luminoso | Texto e links vermelhos sobre o creme (5,96:1), estado pressionado do botão e texto branco sobre ela (7,01:1). |
| Amarelo Selo | `#FDB900` | anel amarelo do avatar e das artes | Destaque: preço em evidência, selo "Mais vendido" e botão secundário com texto carvão (10,27:1). Nunca texto sobre o creme. |
| Laranja Letreiro | `#E86300` | letras "HUGÃO" | Só decoração e texto grande (24 px ou mais). Texto branco sobre ele dá 3,38:1, insuficiente para texto pequeno. |
| Carvão da Noite | `#1B1510` | parede da fachada nova à noite | Texto principal e seções escuras (o "lado da noite" do site). Sobre o creme dá 15,1:1. |
| Creme do Pão | `#FCEBC8` | contorno do logo e luz das lâmpadas | Fundo claro principal, mais quente que o branco. |

Os tokens sugeridos para o CSS estão em `:root`. Nenhuma cor fica fixa dentro de componente.

- `--cor-vermelho: #DF0209`
- `--cor-brasa: #B5060B`
- `--cor-amarelo: #FDB900`
- `--cor-laranja: #E86300`
- `--cor-carvao: #1B1510`
- `--cor-creme: #FCEBC8`

## Fontes

Duas famílias do Google Fonts. As duas têm Ã, Õ, Ç e acentos.

| Família | Papel | Por quê |
| :- | :- | :- |
| **Lilita One** | Títulos e nomes de seção, sempre grandes e em caixa normal. | É pesada e arredondada, com cantos macios, a mesma família visual das letras "HUGÃO" do selo. Liga o site ao logo sem copiá-lo. Tem um peso só, então é só para títulos. |
| **Barlow** (400, 600, 800, mais a Barlow Semi Condensed) | Texto, nomes dos lanches, ingredientes e preços. Os preços usam algarismos tabulares (`font-variant-numeric: tabular-nums`). | É uma grotesca desenhada a partir de placas de estrada: tem cara de cardápio de parede e de letreiro, e é legível em 14 px. A versão semicondensada cabe nomes longos como "Framburguer Especial" numa linha de celular. |

Evitado de propósito: Anton e Bebas Neue, o clichê de hamburgueria, e serifas de "gourmet", que
destoam do preço de lanchonete.

## Voz da marca

Fala como o balcão do Hugão numa sexta à noite: direto, caloroso e generoso. Diz o nome do lanche, o
que vem dentro, quanto custa e que "vem com batata".

## Elemento-assinatura

Escolhido: **o pão do logo**, a cúpula com gergelim. É o único elemento presente nas duas fases da
marca, a fachada antiga e a nova, e em todas as artes atuais. Pode virar o recorte da foto
principal, o topo de cartões do cardápio ou o selo "Mais vendido". É para usar em um lugar só, com
força.

Candidatos descartados por enquanto:

- **Mascote.** Só existe na fachada antiga, sem imagem em boa resolução. Precisa do aval do Hugo
  para uso e de um arquivo original.
- **Onda amarela.** Também é da fachada antiga e não aparece nas artes atuais. Pode voltar como
  detalhe se o Hugo disser que ainda faz parte da loja.

## Imagens disponíveis (resumo)

- **Fotos reais de lanche** (bsfood, 400 × 400 px): lanche cortado ao meio sobre tábua, com o papel
  "EU AMO BACON" e o cordão de luzes ao fundo. Servem para o cardápio, não para foto de fundo
  grande.
- **Artes do Instagram** (1.254 a 1.448 px): têm texto aplicado. Servem de referência de marca. A
  fachada nova (post de 18/06/2026) é a melhor imagem de ambiente.
- **Lacunas:**
  - logo em vetor ou em alta (o maior arquivo tem 150 px);
  - foto real do Super Hugão (o bsfood usa uma foto genérica);
  - foto horizontal do salão ou da fachada para o topo da página.
