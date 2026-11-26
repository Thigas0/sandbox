# Design — Catelle | Reforço Escolar

Direção B, "Sala 02, luz da tarde", sobre a ficha do taste-skill **One motif** (semente 946092719,
`.taste-skill/direction.json`). Tom de referência: `docs/design-library/airbnb`, `notion` e `claude`.

**Ideia.** Na página, o C de Catelle e de Cátia, a primeira curva que a criança traça ao aprender as
letras, vira o arco que recorta cada foto, dá forma ao botão, marca as listas e faz a faixa que divide
a página. O concorrente mais próximo não tem o C, então a ideia é desta cliente.

**O que o visitante faz.** Preenche o cupom e vê a mensagem do WhatsApp sendo montada ao vivo, antes de
decidir enviar.

## Tokens (`src/style.css`)

| Papel | Claro | Escuro |
| :- | :- | :- |
| `--chao` (fundo) | `#e6dccd` areia | `#1c1a17` |
| `--papel` (cartões, bilhetes, campos) | `#f1efea` | `#26231f` |
| `--campo` (cupom, rodapé) | `#cfd3cb` sálvia | `#2e3430` |
| `--tinta` (texto) | `#141414` | `#f1ebe2` |
| `--suave` (notas) | `#4f4a42` | `#b9b0a3` |
| `--acento` (botão, C grande) | `#0f5257` petróleo | `#7cc4c0` |
| `--profundo` (painel "Quem cuida") | `#1d2b29` | `#10201e` |

- **Tipo:** Albert Sans (OFL), variável 400–600, hospedada em `public/fonts/`. Títulos 600, -0.035em,
  leading 1. Corpo de 17 a 19px. Cinco passos (`--passo-*`).
- **Forma:** um raio só (`--raio: 12px`). O botão tem a ponta esquerda arredondada (`--raio-c`), a curva
  do C. A máscara do C fica em `public/img/c.svg`.
- **Voz:** fala como uma professora que conhece cada aluno pelo nome: calma, direta, sem promessa
  milagrosa.

## Seções

hero (cartão de papel + Jaguariúna vista por dentro do C) → quem cuida (painel profundo, cartilha
recortada no C) → o que as mães dizem (bilhetes de papel; redraw de `testimonial-portrait-offset-quote`
para `testimonial-paper-slips`, porque não existem retratos das mães e não devem existir) → onde fica
(faixa de Cs + igreja matriz) → cupom-formulário → rodapé com a marca em blocos.

## Movimento

- **Assinatura:** troca lenta das fotos de Jaguariúna no hero (1,6 s de fade, 5,6 s em cada uma), que
  pausa com a aba oculta ou o hero fora da tela. As fotos extras só baixam depois do `load`.
- **Entrada das partes de cada seção:** `animation-timeline: view()`, com IntersectionObserver como
  alternativa. O conteúdo nasce visível.
- **Faixa de Cs** desliza com o scroll. **Bilhetes** inclinam até 3° sob o cursor, só com
  `(hover: hover) and (pointer: fine)`. Botões e opções respondem em `:active`.
- **`prefers-reduced-motion: reduce`:** nada anima e as fotos extras nem são baixadas.
- **Orçamento:** só `transform` e `opacity`; JS total de 2,5 KB com gzip; nenhuma long task.
