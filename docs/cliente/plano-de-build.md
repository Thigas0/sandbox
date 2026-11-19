# Plano de build: site demo do Hugão Lanches & Burgers

Base: `dossie.md`, `cardapio.json`, `avaliacoes.md` e o `DESIGN.md` da raiz. Preparado em
2026-11-19. A construção é o próximo pedido.

## Público e objetivo

- **Público:** quem está em Serra Negra à noite e quer lanche. São moradores pedindo delivery e
  turistas depois do passeio, cerca de 15 mil por fim de semana, e quase sempre no celular.
- **Objetivo:** mostrar ao Hugo que o Hugão merece um site à altura da nota 4,5 com mais de 300
  avaliações. A página deve parecer dele: o selo, a fachada nova, os lanches reais e "vem com
  batata".
- **Ação principal:** montar o pedido no próprio site (tamanho, adicionais, observação, entrega
  ou retirada, pagamento) e enviá-lo pronto para o WhatsApp da loja. Decisão do desenvolvedor em
  19/11/2026. Não há pagamento online: o cliente paga na entrega ou na retirada. **Ação
  secundária:** saber como chegar, com endereço, mapa e horário.

## Mapa do site

É uma página só. A ordem segue o argumento da página, não um modelo pronto. A taste-skill vai
reordenar as seções no passo 2 se o argumento pedir.

| Seção | Padrão | Conteúdo vem de |
| :- | :- | :- |
| Topo | Liderado pelo produto: um lanche real cortado ao meio, recortado na cúpula do pão (a assinatura), mais o nome, "aberto hoje até 23h" e os botões "Pedir no bsfood" e "Chamar no WhatsApp" | `DESIGN.md`, `cardapio.json` (`loja.horarios`), `public/img/cliente/` |
| Prova | Nota 4,5 no Google, com mais de 300 avaliações e link para o perfil, mais 2 ou 3 trechos de avaliações aprovados | `avaliacoes.md` (depois dos prints e do aval do dono) |
| Mais vendidos | Fileira com os 10 itens da aba "Mais vendidos": foto real, ingredientes e preço com algarismos tabulares | `cardapio.json` (`mais_vendido: true`) |
| Cardápio | Em HTML, legível pelo Google, com abas ou âncoras por categoria (Clássicos, Gourmet, Tradicionais, Kids, Porções, Bebidas). Variantes de 90, 120 e 160 g agrupadas no mesmo item | `cardapio.json` (`categorias`, `grupos_adicionais`) |
| Pedir e entrega | Lista de bairros com busca e taxa, tempo médio de 50 min, formas de pagamento e botões de pedido | `cardapio.json` (`loja`) |
| Sobre | Texto curto e neutro, sem "20 anos" até o Hugo confirmar: o Hugão de Serra Negra, agora na R. Irmã Dulce, com a fachada nova | `dossie.md` e `perguntas-para-o-dono.md` |
| Como chegar | Endereço em texto, mapa estático com link "Abrir no Google Maps" e horários da semana com "por enquanto" visível | `dossie.md` (Ficha) e `cardapio.json` (`loja.horarios`) |
| Rodapé | Nome, endereço, telefone, Instagram e o crédito "cardápio e preços do bsfood em 19/11/2026" | `dossie.md` |

## Sequência de skills da construção

| # | Etapa | Skill | Entrada | Saída esperada |
| :- | :- | :- | :- | :- |
| 1 | Direção de arte | `taste-skill`, com `pro-design` §1–2 e `frontend-design` | `DESIGN.md`, inventário do assunto (selo, fachada nova, cordão de luzes, papel "EU AMO BACON", R. Irmã Dulce, "vem com batata", linhas de 90, 120 e 160 g) e as seções acima | Direção escolhida entre as 3 do `draw.mjs`, o argumento da página e os tokens finais em `:root` |
| 2 | Texto | `ux-copy` | Direção, `cardapio.json` e `dossie.md` (voz da marca) | Títulos, textos dos botões, microtexto de entrega e horário e o texto do "Sobre", sem prometer o que o dono não confirmou |
| 3 | Imagens | sem IA, por decisão de 2026-11-19 | `public/img/cliente/` | Recortes e versões AVIF/WebP das fotos reais, e a fachada nova recortada sem o texto da arte |
| 4 | Construção | `pro-design` §4 e `impeccable` (craft-floor) | Direção, texto e imagens | `index.html`, `src/style.css` e `src/main.js`, com o cardápio renderizado a partir do JSON e todas as cores e fontes em variáveis |
| 5 | Movimento | `animate` e `emil-design-eng` | Página construída | Um momento orquestrado no topo (600 a 900 ms), respostas a hover, foco e abertura de 150 a 250 ms, e `prefers-reduced-motion` respeitado |
| 6 | Celular | `mobile-native` | Página em 390 px | Botão de pedir fixo, área segura, `100dvh`, alvos de 44 px e nada de zoom em campo de busca |
| 7 | SEO local e dados estruturados | `on-page-seo`, `schema-markup` e `technical-seo` | Grupos de busca do `dossie.md` e Ficha | Title, meta description e H1 locais. JSON-LD `Restaurant` com endereço, `geo`, `openingHoursSpecification`, `priceRange`, `servesCuisine`, `hasMenu`, `telephone` e `sameAs`, sem `aggregateRating` da própria loja. Mais robots e sitemap |
| 8 | Acessibilidade | `accessibility-review` | Página pronta | Auditoria WCAG 2.1 AA. Os contrastes da paleta já foram conferidos no `DESIGN.md` |
| 9 | Performance | `perf-profiler` e `/perf-audit` | Build de produção | Lighthouse antes e depois (`/perf-compare`). Imagens em AVIF ou WebP com `srcset` e fontes com `display=swap` |
| 10 | Testes | `e2e-test-generator` (`/e2e-map`, `/e2e-write`) e `break-ui` | Página pronta | Testes Playwright: botões de pedir apontam para o bsfood e para o wa.me, o cardápio mostra 152 itens, a busca de bairro funciona e o axe passa. Teste de pior caso: nome longo, item sem foto, categoria vazia |
| 11 | Revisão final | `design-critique`, `web-design-guidelines`, `seo-audit` e `broken-links` | Telas de 390 e 1440 px | No máximo duas rodadas de ajuste, mais o relatório final |

## Critérios de pronto do site

- **Lighthouse no celular:** Performance 90 ou mais, e Acessibilidade, Boas práticas e SEO 95 ou
  mais.
- **axe:** sem violações WCAG 2.1 A e AA, no desktop e no celular, no teste de `tests/e2e/`.
- **`./scripts/verify.sh --full`:** aprovado, sem falha nova em relação à linha de base abaixo.
- **Telas conferidas em 390 e 1440 px:**
  - sem rolagem horizontal e sem texto cortado;
  - foco visível;
  - topo visível na primeira tela;
  - sem erro no console.
- **Botões de pedir:** funcionam (bsfood e `https://wa.me/5519971681738`). Nenhum link `#` vazio.
- **Avisos visíveis no site:**
  - preços e horário são do bsfood em 19/11/2026;
  - o horário está "por enquanto";
  - as avaliações só aparecem se aprovadas.

## Linha de base (2026-11-19, antes de qualquer mudança)

Rodado com `PLAYWRIGHT_CHROMIUM_PATH=/opt/pw-browsers/chromium`, que aponta para o Chromium 1243
pré-instalado. O Playwright 1.64.1 do projeto espera o build 1248.

```text
PASS  Claude Code guardrails (.claude/settings.json)
PASS  Shell scripts parse (bash -n)
PASS  No secret or personal files in the commit set
PASS  No secret-looking content
PASS  No whitespace errors or conflict markers in uncommitted changes
PASS  Formatting (prettier --check)
PASS  Lint (eslint)
PASS  Build (vite build)
PASS  Verifier self-tests (tests/verify_test.sh)
PASS  Browser and accessibility tests (playwright + axe)

All checks passed.   (10,2 s)
```

## Riscos e o que depende do Hugo

**Depende do Hugo** (lista completa em `perguntas-para-o-dono.md`):

- o ano de fundação e a história do recomeço;
- os dias e o horário de fechamento;
- a grafia Burgers ou Burguers;
- se o bsfood continua como canal de pedidos;
- logo em vetor e fotos em alta;
- o aval para usar as avaliações.

**Riscos:**

- **Fotos do bsfood têm 400 px.** Servem para o cardápio, não para o topo em 1440 px. Parte delas
  parece IA, e o Super Hugão usa foto genérica. Mitigação: usar as fotos reais pequenas, pedir
  originais e só depois considerar gerar imagem.
- **Preços e itens mudam no bsfood.** O demo congela os dados de 19/11/2026. Um site em produção
  precisaria sincronizar com a API do bsfood ou ter um processo de atualização.
- **Rival na mesma rua.** A Taverna Burger tem 4,9, com cerca de 580 avaliações. O demo não deve
  prometer "a melhor hamburgueria". Pode citar o @serranegra, com aval.
- **Endereço antigo em diretórios.** O Google mistura o histórico. Vale oferecer a correção dos
  perfis no TripAdvisor e no Guia Pinzon como serviço extra.
- **Imagens geradas por IA:** não serão usadas. O desenvolvedor não conseguiu conectar o
  Higgsfield, e a decisão de 2026-11-19 foi não buscar substituto. O topo usa a foto da fachada nova
  do Instagram e as fotos reais do bsfood, e as lacunas são cobertas com tipografia e forma (a
  cúpula do pão), não com foto inventada.
