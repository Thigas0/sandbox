# Créditos das imagens

Imagens em `public/img/cliente/`, baixadas em 2026-11-19 na maior resolução disponível. Todas foram
publicadas pelo próprio Hugão Lanches, no cardápio do bsfood ou no perfil do Instagram, e podem ser
usadas no site demo. Antes de ir ao ar, o Hugo precisa confirmar o uso e mandar originais melhores.
Nenhuma imagem foi gerada por IA neste projeto até agora.

O que cada coluna quer dizer:

- **Real ou IA** é uma revisão visual, não uma garantia:
  - "real" é uma foto do lanche;
  - "provável IA ou render" tem acabamento de render;
  - "banco de imagem" é uma foto genérica que se repete em vários itens.
- **Marcada como ilustrativa** é o campo `isIllustrativeImage` do bsfood: o próprio cadastro marca a
  imagem como ilustrativa.

## Logo e fachada

| Arquivo | Origem | Tamanho | Real ou IA | Observação |
| :- | :- | :- | :- | :- |
| `logo-selo-bsfood.png` | bsfood, logo da empresa: https://bsfoodstorage.blob.core.windows.net/companies/ec3b3c0e-39a7-43d3-9468-244c9573d10a | 150 × 150, PNG com transparência | arte do logo | O maior arquivo achado. Pedir o vetor ao Hugo. |
| `logo-selo-instagram.jpg` | avatar do Instagram @hugao_lanches_oficial: https://www.instagram.com/hugao_lanches_oficial/ | 150 × 150 | arte do logo | O mesmo selo, sem transparência. |
| `fachada-nova-instagram.jpg` | post de 18/06/2026: https://www.instagram.com/hugao_lanches_oficial/p/DZu-t2vxcfo/ | 1402 × 1753 | foto real com arte por cima | Fachada nova à noite, com texto aplicado na parte de baixo. É uma arte de post: serve de referência ou recortada. |

## Versões usadas na página

O site usa versões WebP geradas a partir das fotos do próprio bsfood, sem nenhuma alteração além do
tamanho:

- **Miniaturas:** `cardapio/<id>-p.webp`, com 160 px, para cada item do cardápio que tem foto real
  ou provável IA ou render (69 itens). Ficam de fora as fotos genéricas de banco de imagem e as
  embalagens de bebida.
- **Versões grandes:** `cardapio/<id>.webp`, com 400 px, para os 10 mais pedidos e as 3 fotos da
  seção de tamanhos (90 g: X-Salada 12740; 120 g: X-Tudo 33146; 160 g: Burguer Bacon Gourmet
  12725).
- **Topo:** `fachada-letreiro.webp`, um recorte (962 × 960) da parte de cima de
  `fachada-nova-instagram.jpg`, que tira a arte com texto.

O `<id>` é o `id_bsfood` do item em `cardapio.json`. A URL de origem de cada foto está no campo
`foto_url` do mesmo item.

## Lanches

| Arquivo | Item do cardápio | Origem (bsfood, `imageUrl` do produto) | Tamanho | Real ou IA | Marcada como ilustrativa |
| :- | :- | :- | :- | :- | :- |
| `lanche-america-bacon.jpg` | América Bacon 120 g (id 33148) | `foto_url` em `cardapio.json` | 400 × 400 | real, com texto e bandeira aplicados | sim |
| `lanche-caipira.jpg` | Caipira (12711) | `foto_url` em `cardapio.json` | 400 × 400 | real | sim |
| `lanche-churrasco.jpg` | Churrasco (12754) | `foto_url` em `cardapio.json` | 400 × 400 | real | sim |
| `lanche-churraskito.jpg` | Churraskito (12712) | `foto_url` em `cardapio.json` | 400 × 400 | real (o letreiro antigo "HUGÃO LANCHES" aparece ao fundo) | sim |
| `lanche-hot-dog-prensadinho.jpg` | Hot Dog Prensadinho (12758) | `foto_url` em `cardapio.json` | 400 × 400 | real, com plaquinha | não |
| `lanche-x-bacon.jpg` | X-Bacon 90 g (12742) | `foto_url` em `cardapio.json` | 400 × 400 | real | sim |
| `lanche-x-burguer.jpg` | X-Burguer 90 g (12739) | `foto_url` em `cardapio.json` | 400 × 400 | real | sim |
| `lanche-x-especial.jpg` | X-Especial 90 g (12714) | `foto_url` em `cardapio.json` | 400 × 400 | real | sim |
| `lanche-x-frango.jpg` | X-Frango (12744) | `foto_url` em `cardapio.json` | 400 × 400 | real | sim |
| `lanche-x-salada.jpg` | X-Salada 90 g (12740) | `foto_url` em `cardapio.json` | 400 × 400 | real | sim |
| `lanche-x-tudo.jpg` | X-Tudo 90 g (12743) | `foto_url` em `cardapio.json` | 400 × 400 | real, papel "EU AMO BACON" | sim |
| `lanche-calaqueijo.jpg` | Calaqueijo (12752) | `foto_url` em `cardapio.json` | 400 × 400 | real | sim |
| `lanche-calafrango.jpg` | Calafrango (12720) | `foto_url` em `cardapio.json` | 400 × 400 | real, com plaquinha | sim |
| `lanche-caipiritoz.jpg` | Caipiritoz (12730) | `foto_url` em `cardapio.json` | 400 × 400 | real, com plaquinha "Feito com Doritos" | sim |
| `lanche-vegetarito.jpg` | Vegetarito (12738) | `foto_url` em `cardapio.json` | 400 × 400 | real, com plaquinha | sim |
| `lanche-churrasco-premium.jpg` | Churrasco Premium (12757) | `foto_url` em `cardapio.json` | 400 × 400 | real | sim |
| `lanche-frango-especial.jpg` | Frango Especial (12721) | `foto_url` em `cardapio.json` | 400 × 400 | real | sim |
| `lanche-burguer-bacon-gourmet.jpg` | Burguer Bacon Gourmet (12725) | `foto_url` em `cardapio.json` | 400 × 400 | provável IA ou render | sim |
| `lanche-batata-cheddar-bacon.jpg` | Batata com cheddar e bacon, grande (33070) | `foto_url` em `cardapio.json` | 400 × 400 | provável IA ou render (cuba com o logo aplicado) | sim |
| `lanche-calaqueijo-instagram.jpg` | Calaqueijo | reel de 19/10/2025: https://www.instagram.com/hugao_lanches_oficial/reel/DQAR9Qhj_mA/ (capa) | 640 × 482 | real | não se aplica |

A URL exata de cada foto do bsfood está no campo `foto_url` do item em `cardapio.json`, procurado
pelo `id_bsfood`. As outras fotos do cardápio ficam só como URL no `cardapio.json` e não foram
copiadas, para não inchar o repositório.

## Referências que não vão para o site

Ficam só como referência, porque pertencem a terceiros ou têm origem incerta:

- **Fachada antiga com a onda amarela e o mascote**, e as fotos de lanche do painel do Google (print
  do perfil do Google enviado em 2026-11-19). A galeria do Google não abriu sem login, então não dá para
  saber se foram postadas pelo dono ou por clientes.
- **Foto de cliente no Google Maps**, de set/2017. Pertence a quem postou e não pode ser usada.
- **Reels do perfil @serranegra** (14/03, 29/05 e 01/07/2026). São conteúdo do perfil da cidade,
  feito em parceria. Para usar, é preciso o aval do @serranegra e do Hugo.
- **12 fotos do perfil do Google** (zip enviado pelo desenvolvedor em 2026-11-19, guardado só no
  scratchpad da sessão). O perfil do Google mistura fotos do dono e de clientes, e não dá para saber
  de quem é cada uma. Pela regra do projeto, todas ficam só como referência. Mostram:
  - a fachada antiga com o mascote (723 × 548);
  - o salão vermelho com balcão "HUGÃO";
  - o pergolado novo com bandeirinhas e mesas;
  - o cardápio impresso, com Chicken Supreme a R$ 17,90, anéis de cebola a R$ 19,90 e porção de
    tilápia a R$ 69,90;
  - vários lanches;
  - uma foto com 2 clientes de rosto visível, que nunca deve ser usada.

  Se o Hugo confirmar que alguma é dele, ela pode entrar.
- **Artes do Instagram com texto aplicado** (posts de 09 a 17/06/2026, guardados no scratchpad da
  sessão). São referência de paleta e tipografia, não foto para o site.

## Imagens geradas por IA

Nenhuma. O desenvolvedor não conseguiu conectar o Higgsfield, e por decisão de 2026-11-19 o demo
não usa imagem gerada por IA. Toda imagem gerada entra nesta lista com:

- o modelo e o modo;
- o prompt ou a referência usada;
- o item do cardápio que ela representa;
- a marcação "gerada por IA".
