# DESIGN.md · Glaux, site de produto com a paleta de Atena

Substitui a direção A ("Caderno anotado") a pedido do usuário em 25/11: o foco passa a ser o produto,
com só o essencial da apresentação, nas cores de Atena (azul e dourado). As cores do Canvas não foram
usadas para o site não parecer um produto oficial da Instructure. A coruja do logo é o símbolo de Atena,
uma escolha criativa que conversa com o nome Glaux.

## Estrutura

1. Início (herói escuro): promessa, selo "em desenvolvimento", botões "Veja como funciona" e
   "Código no GitHub"; ilustração das três saídas (cronograma, resumo, questões).
2. Recursos: o problema numa frase e os quatro benefícios.
3. Como funciona (seção escura): os 4 agentes; as duas respostas do entregável (há orquestrador; os
   agentes não conversam diretamente); o fluxo que se monta na rolagem e o simulador de rotas.
4. Integrações: Canvas LMS, Groq e Hugging Face.
5. Resultados: 4 números medidos e a principal limitação.
6. Demo: o comando e a execução gravada.
7. Roadmap: o que a documentação prevê e o código ainda não faz.
8. Rodapé: equipe, repositório e nota sobre as citações.

Regra de honestidade: o site não diz que existe interface web nem login. O produto aparece como "em
desenvolvimento", e as promessas da documentação ficam no roadmap.

## Tokens (fonte da verdade: `src/styles/tokens.css`)

| Token | Valor | Uso |
|---|---|---|
| `--azul-noite` | `#0f1d3d` | topo, herói, "Como funciona", rodapé |
| `--azul-noite-2` | `#172a55` | cartões sobre o azul-noite |
| `--azul` | `#1d3a7a` | números dos resultados, filete das integrações |
| `--azul-nevoa` | `#eef2fa` | seções claras alternadas |
| `--branco` | `#fbfbfd` | fundo padrão |
| `--ouro` | `#d9b75a` | botões, traços do diagrama, rótulos sobre o escuro (9:1) |
| `--ouro-escuro` | `#7a5c12` | dourado para texto sobre o claro (AA) |
| `--sucesso` | `#1f6b52` | alternativa correta |

Os componentes usam tokens semânticos (`--fundo`, `--superficie`, `--borda`, `--texto`, `--texto-2`,
`--acento-texto`). As superfícies escuras (`.heroi`, `.secao--escura`, `.topo`, `.rodape`) os
redefinem, então o mesmo componente funciona no claro e no escuro.

Tipografia:
- Newsreader variável nos títulos (serifa clássica, auto-hospedada);
- `system-ui` no texto;
- IBM Plex Mono em rótulos e citações.
Ambas as fontes são OFL; as licenças estão em `public/fonts/`.

## Regras

- O dourado é acento, não fundo: botão principal, traços, rótulos. Um dourado forte por tela.
- Contraste AA em todo texto. Foco visível com `--acento-texto`.
- As citações (`[arquivo:linha]`, `[Doc, p.N]`) ficam pequenas e discretas: estão lá para quem quiser
  conferir, sem competir com o texto.
- Sem recursos externos: tudo é servido pelo próprio site (CSP `'self'`).

## Movimento

- Só `transform`, `opacity` e o `stroke-dashoffset` do diagrama. Sem biblioteca.
- Curva `--sair` (`cubic-bezier(0.22, 1, 0.36, 1)`); 160 ms em botões, 420 ms em nós, 700 ms em
  traços e marca-texto.
- Painéis do herói sobem em sequência ao carregar (120 ms entre eles). O diagrama se monta por passos
  ao rolar. A lente dourada segue o cursor só com mouse.
- Sem JavaScript, ou com `prefers-reduced-motion: reduce`, tudo aparece completo e parado.

## App (/app/)

O app usa os mesmos tokens. Estilos em `src/styles/app.css`; os botões e o chip de prioridade ficam em
`src/styles/componentes.css`, compartilhado com a landing.

| Componente | Regra |
|---|---|
| Botões | primário dourado (`.botao`), fantasma (`.botao--fantasma`), pequeno (`.botao--pequeno`); carregando com `aria-busy="true"` (gira um anel, sem trocar o texto) |
| Abas | as abas da disciplina são links de rota (`#/disciplina/:id/resumo` e `/questoes`) com `aria-current="page"` e sublinhado dourado. Não usam `role="tablist"`, porque cada aba é uma URL |
| Cartão de tarefa | `.tarefa`, com a borda esquerda pela prioridade (ALTA terracota, MÉDIA dourada, BAIXA neutra), o título, "disciplina · prazo" e o `action_recommendation` do Tutor |
| Chip de prioridade | `.prioridade--alta` / `--média`: valores exatos do Tutor (ALTA, MÉDIA, BAIXA) |
| Campo | rótulo visível, ajuda ligada por `aria-describedby`, entrada com 16 px (sem zoom no iOS); erros como estado de erro logo acima do botão |
| Toast | `.toast` numa região `role="status"`; some em 3,5 s; no celular fica acima da barra inferior |
| Barra lateral | azul-noite, item atual em dourado. Abaixo de 48rem vira barra inferior fixa com 4 itens e `safe-area-inset-bottom` |
| Faixa demo | dourada, fixa no topo, sempre visível no modo demo, com "Sair do modo demo" |
| Progresso dos agentes | bloco azul-noite: Canvas, Tutor e Gerador, cada um com o estado (na fila, rodando, concluído, fora da rota) e a rota e o motivo do Orquestrador. "Fora da rota" usa borda tracejada, nunca opacidade baixa (contraste) |
| Citação | `[arquivo, p.X-Y]` vira botão mono; ao clicar, abre abaixo o painel com o arquivo e as páginas |
| Estados | carregando (anel e texto), vazio (tracejado), erro (terracota, com "Tentar de novo"), sem_material (dourado claro, com a mensagem real do Gerador ou do Tutor) |
| Prática | alternativas como rótulos grandes; depois de responder, a correta fica verde e a escolhida errada terracota; o trecho de referência aparece num bloco com filete dourado |

Movimento no app: o anel de carregamento, a borda do agente que está rodando e a entrada do toast.
Tudo some com `prefers-reduced-motion`.
