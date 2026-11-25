# DESIGN.md · Glaux, direção A "Caderno anotado"

Referências: `docs/design-library/claude/DESIGN.md` (canvas creme, serifa editorial) e o rigor de grade
de `docs/design-library/wired/DESIGN.md`. Referência, não cópia: nenhuma marca, nome ou logo de terceiros.

## Ideia

O diferencial comprovado do Glaux é citar a fonte de cada frase (`[arquivo, p.X-Y]`). O site é um
caderno anotado: texto editorial em papel, e cada fato carrega a sua citação em mono, com marca-texto.

## Tokens (fonte da verdade: `src/styles/tokens.css`)

| Token | Valor | Uso |
|---|---|---|
| `--papel` | `#f5f1e8` | fundo |
| `--papel-2` / `--papel-3` | `#ede6d6` / `#e4dbc6` | cartões, nós do diagrama, estado |
| `--tinta` | `#1b1a17` | texto, traços do diagrama |
| `--grafite` | `#55524b` | texto secundário, citações (6,9:1 sobre o papel) |
| `--regua` | `#d3c9b3` | linhas e bordas |
| `--ambar` | `#c9822b` | só decoração: barra de progresso, bordas, realces. Nunca texto pequeno |
| `--ambar-texto` | `#8a5414` | âmbar para texto e foco (AA sobre o papel) |
| `--marca` | âmbar a 28% | marca-texto das citações |
| `--verde` | `#2f6f5e` | alternativa correta na demo |

Tipografia:
- Newsreader variável (títulos e destaques, auto-hospedada, latin, 58 KB);
- IBM Plex Mono 400 (citações, rótulos, código, 15 KB);
- texto corrido em `system-ui`. Ambas as fontes OFL, licenças em `public/fonts/`.

## Regras

- Todo fato sobre o Glaux tem citação visível: `[arquivo:linha]` para o código e `[Doc, p.N]` para a
  documentação. O que "funciona hoje" vem só do código; promessas da documentação vão para "Próximos
  passos".
- Um acento de cor por tela. Sem gradientes decorativos, sem sombras pesadas.
- Contraste AA em todo texto. Foco visível com `--ambar-texto`.
- Sem recursos externos: fontes, imagens e vídeo são servidos pelo próprio site (CSP `'self'`).

## Movimento

- Só `transform`, `opacity` e o `stroke-dashoffset` do diagrama. Sem biblioteca.
- Curva `--sair` (`cubic-bezier(0.22, 1, 0.36, 1)`); 160 ms em micro-interações, 420 ms em nós, 700 ms
  em traços e marca-texto.
- O diagrama da seção 4 se monta por passos ao rolar. O marca-texto aparece quando a citação entra na
  tela. A lente segue o cursor só com mouse.
- Sem JavaScript, ou com `prefers-reduced-motion: reduce`, tudo aparece completo e parado.
