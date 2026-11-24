# Plano de motion — Casa do Anfitrião (direção A)

Fase 4, 24/11/2026. Princípios aplicados das skills `animate` e `emil-design-eng`
(portão de frequência e propósito, curvas e durações), `animation-performance` (só `transform`,
`opacity` e `clip-path`, CSS fora da thread principal), `apple-design` (reduced-motion significa
menos e mais suave, não zero) e `find-animation-opportunities` (rejeitar o que não tem propósito).
**Nenhuma dependência nova:** CSS nativo + um JS próprio pequeno.

## Tokens de motion (em `src/tokens.css`)

```css
--ease-out: cubic-bezier(0.23, 1, 0.32, 1); /* entradas e UI */
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1); /* movimento na tela */
--dur-press: 120ms;
--dur-ui: 200ms;
--dur-reveal: 600ms;
--dur-hero: 900ms;
--stagger: 70ms;
```

## Oportunidades aprovadas

| #   | Onde                                   | O quê                                                                                                                                                                   | Propósito                | Frequência         | Ferramenta e valores                                                                                                         |
| --- | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | ------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| 1   | Hero: faixa do toldo                   | As barras "desenrolam" da esquerda para a direita, uma a uma                                                                                                            | Explicação (a assinatura da marca) | Uma vez por visita | CSS `@keyframes` em `transform: scaleY(0 → 1)` com `transform-origin: top`, 600 ms `--ease-out`, 24 ms de defasagem por barra |
| 2   | Hero: pintura                          | Crossfade lento ao carregar (a foto real substituirá a pintura)                                                                                                         | Evitar mudança brusca    | Uma vez            | CSS `opacity 0 → 1` + `transform: scale(1.04 → 1)`, 900 ms `--ease-out`. Nada fica oculto se o CSS falhar (o estado final é o padrão) |
| 3   | Hero → resto da página                 | Pintura fixa (`position: sticky`) enquanto o cartão rola. No fim do hero, a pintura escurece levemente                                                                  | Consistência espacial    | Por rolagem        | `animation-timeline: view()` em `opacity` de um véu preto (0 → 0,35). Fallback: sem véu                                    |
| 4   | Entrada de cada seção                  | Título, depois texto, depois peça (cartão ou convite), subindo 24 px com opacidade                                                                                      | Evitar mudança brusca    | Uma vez por seção  | `@supports (animation-timeline: view())`: CSS com `animation-range: entry 10% cover 30%`. Senão, `IntersectionObserver` adiciona `.is-in` (600 ms `--ease-out`, 70 ms de defasagem). Sem JS, o conteúdo já está visível |
| 5   | Eventos: convites empilhados           | Os cartões se afastam levemente (`translateY` e `rotate` de ±2°) conforme a seção atravessa a tela                                                                      | Explicação (são vários convites) | Por rolagem | Scroll-driven com `animation-timeline: view()`. Fallback: já espaçados                                                     |
| 6   | Encomendas: canhoto                    | Ao passar o mouse, o canhoto "destaca" 6 px pela linha de picote                                                                                                         | Feedback                 | Dezenas por visita | `transition: transform 200ms --ease-out` só em `(hover: hover) and (pointer: fine)`                                         |
| 7   | Botões e links                         | Pressionar: `scale(0.97)`. Hover: troca de fundo preto → dourado                                                                                                         | Feedback                 | Dezenas            | `transform 120ms --ease-out`; `background-color 200ms ease`. Nunca `transition: all`                                         |
| 8   | Cursor (só desktop com mouse)          | Sobre a pintura do hero, ela acompanha o mouse em até 8 px (parallax sutil)                                                                                              | Deleite (primeira tela, rara) | Uma vez por visita | JS com `pointermove` + `requestAnimationFrame`, `transform` direto no elemento, só em `matchMedia('(hover: hover) and (pointer: fine)')` e sem reduced-motion |
| 9   | Status "Aberto agora"                  | Nenhum motion. A troca de texto é instantânea                                                                                                                            | —                        | —                  | —                                                                                                                            |

**Movimentos que passam por load ou scroll:** faixa (24 barras), pintura, véu, cerca de 18 entradas
de seção e 4 convites, o que atende ao mínimo de 8 elementos em movimento do inspector do taste-skill.

## Rejeitadas

| Candidata                                   | Motivo                                                                                       |
| ------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Smooth scroll com biblioteca (Lenis)        | Sequestra a rolagem nativa, piora a acessibilidade e o INP, e seria uma dependência. Âncoras usam `scroll-behavior: smooth` só sem reduced-motion |
| Hover que aumenta cada item do cardápio     | Lista de leitura não se move por estilo (portão de função)                                    |
| Animação no menu do celular                 | Aberto várias vezes. Fica instantâneo (`<details>`)                                           |
| Cursor personalizado                        | Sem propósito, atrapalha a precisão e a acessibilidade                                        |
| Texto da manchete letra a letra             | Atrasa a leitura do NAP e da proposta; seria o LCP                                            |
| Blur no crossfade                           | Custo de pintura no celular; opacidade basta                                                 |

## Reduced motion (`prefers-reduced-motion: reduce`)

Fica: os crossfades de opacidade (a 200 ms) e as trocas de cor dos botões. Sai: todo deslocamento
(entradas, faixa, convites, parallax de cursor, smooth scroll). A faixa aparece pronta e o conteúdo
aparece de uma vez.

## Performance (metas da Fase 5: LCP < 2,5 s, CLS < 0,1, INP < 200 ms no celular)

- O LCP é o nome "Casa do Anfitrião" em Imbue: preload do woff2 e `font-display: swap` com fallback
  métrico (`size-adjust`) para não causar CLS.
- A pintura do hero tem `width`/`height` declarados, `fetchpriority="high"` e AVIF/WebP com
  `srcset` (até 1600 px).
- Nenhuma animação em `width`, `height`, `top` ou `left`. `will-change` só se aparecer salto de 1 px.
- O JS de motion é carregado com `type="module"` (defer), tem menos de 2 KB e não bloqueia a
  renderização.
