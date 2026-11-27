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
  do C. O C recorta as fotos de "Quem cuida" e "Onde fica" (`public/img/c.svg`); a foto do hero é retangular, com o raio da página (decisão do cliente).
- **Voz:** fala como uma professora que conhece cada aluno pelo nome: calma, direta, sem promessa
  milagrosa.

## Seções

hero (cartão de papel com a faixa de Cs + foto de Jaguariúna, retangular) → quem cuida (painel profundo, cartilha
recortada no C) → o que as mães dizem (bilhetes de papel; redraw de `testimonial-portrait-offset-quote`
para `testimonial-paper-slips`, porque não existem retratos das mães e não devem existir) → onde fica
(faixa de Cs + igreja matriz) → cupom-formulário → rodapé com a marca em blocos.

## Movimento

Tudo em `src/style.css` (seção Movimento) e em `src/main.js`. O conteúdo nasce visível; só `transform`,
`translate`, `rotate`, `scale`, `opacity` e `clip-path`; com `prefers-reduced-motion: reduce`, nada anima.

- **Ao carregar:** o título do hero sobe palavra por palavra (800 ms, 70 ms de intervalo), seguido do texto,
  do botão e dos links.
- **Assinatura:** as fotos de Jaguariúna trocam com fade de 1,6 s e aproximam devagar (escala 1 → 1,08 em 9 s)
  enquanto estão em cena. As fotos extras só carregam 2,5 s depois do `load`.
- **Com a rolagem** (`animation-timeline`):
  - a faixa de Cs do hero corre para o lado;
  - os títulos de seção sobem e se revelam da esquerda para a direita;
  - as fotos recortadas no C giram até o lugar, como a letra sendo traçada;
  - cada item da lista entra, e o marcador C dá meia-volta;
  - os bilhetes chegam em leque, um depois do outro;
  - o cupom sobe e se endireita;
  - a faixa larga desliza;
  - a marca do rodapé se ergue bloco a bloco.
- **Com mouse:** os botões seguem o cursor até 6 px (magnéticos) e os bilhetes inclinam até 3°.
- **Formulário:** a prévia da mensagem dá um brilho curto a cada mudança. Botões e opções respondem em
  `:active`.
- **Medido:** 35 elementos em movimento. A rolagem fica a 60 fps com CPU 4x mais lenta, e o LCP no celular
  simulado continua em 2,0 s.
- **Onde não há `animation-timeline`:** fica só a entrada por IntersectionObserver; o conteúdo segue visível.
