# Arquitetura e mapa de conteúdo — Casa do Anfitrião

Fase 4, 24/11/2026. Base: direção **A — O cartão da casa** (`direcoes.md`), decisões do dossiê (§11)
e da rodada de 24/11:

- Página única + `/privacidade`.
- Seções: A Casa, Cardápio (sem preços), Encomendas e datas, Eventos, Avaliações, Visite.
- Nenhuma dependência nova.
- O boilerplate atual (`index.html` "Meu site", contador e testes do contador) será substituído na
  Fase 5.

## 1. Mapa do site

```
/                 Home (página única, âncoras)
  #inicio         Hero: o cartão + pintura fixa
  #a-casa         A Casa: quem recebe e como
  #cardapio       Cardápio, sem preços
  #encomendas     Encomendas e datas
  #eventos        Eventos
  #avaliacoes     Avaliações (nota do Google)
  #visite         Visite: endereço, horário, mapa por link, contato
/privacidade      Política de privacidade (checklist-lgpd.md)
/404              Página de erro no mesmo cartão
```

Navegação (como construída na Fase 5): os 4 links (Cardápio, Encomendas, Eventos, Visite) ficam
no pé do cartão do hero, como no blueprint da direção A, e quebram linha no celular. O botão
"Pedir pelo WhatsApp" fica no cartão. Não há barra fixa nem menu escondido.

## 2. Argumento da página (afirmação → prova)

| Seção      | Afirmação                                         | Prova (fonte)                                                                                 |
| ---------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Hero       | É a casa mais francesa da cidade, e você é recebido | Tagline da marca, nome "Anfitrião", Getúlio Vargas, 100, horário ao vivo                     |
| A Casa     | Quem recebe é anfitrião de verdade                | Hotelaria e barista; origem "dentro de casa"; espaço próprio desde 11/04/2025 (pacote, imprensa) |
| Cardápio   | Doces franceses feitos na casa                    | Torta Cappuccino, crème brûlée, croissant francês, quiche… (pacote, Instagram)               |
| Encomendas | Dá para levar a casa para a sua mesa              | Páscoa, Dia das Mães, Natal, enxoval de mesa (pacote)                                         |
| Eventos    | A casa também é palco                             | Aula-show de risotto, Wine Class, jantares, música ao vivo (pacote)                           |
| Avaliações | Quem vem, volta                                   | Nota 4,9 no Google (pacote, 24/11/2026)                                                       |
| Visite     | Fácil de chegar e de ficar                        | Endereço, estacionamento, Wi-Fi, acessibilidade, aceita cães (Maps)                           |

## 3. Composição por seção (direção A, sem repetir vizinhas)

O cartão é a página. Cada seção é **outra peça da mesma papelaria**, sempre uma forma preenchida
com borda real, nunca uma caixa com contorno.

| Seção      | Composição                                                                                                                       | Imagem                                                                     |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Hero       | Tela dividida: cartão marfim com faixa do toldo à esquerda e pintura fixa à direita (já aprovado)                                | _A brioche_ (Manet) até chegar a foto real do salão                        |
| A Casa     | "Carta do anfitrião": folha marfim larga com texto em primeira pessoa e uma assinatura cursiva no fim, sobre o fundo preto      | Foto dos anfitriões (pedir) ou gravura de acervo                           |
| Cardápio   | "Carte" em colunas: uma folha alta e estreita, com os grupos em colunas alinhadas, como cardápio impresso de bistrô             | Pequenas pranchas em cada grupo (fotos dos produtos, a pedir)              |
| Encomendas | "Cartão de encomenda" destacável: um canhoto destacado por uma linha de picote (`border` pontilhada de 4 px), com datas e botão      | Nenhuma                                                                    |
| Eventos    | "Convites": cartões 5:7 empilhados com leve sobreposição, um por tipo de evento                                                  | Gravura de acervo por tipo (vinho, música) até haver fotos                 |
| Avaliações | Nota grande "4,9" em Imbue sobre preto, ligada à ficha do Google, com 1 a 3 trechos só se autorizados                           | Nenhuma                                                                    |
| Visite     | "Verso do cartão": endereço, horário em tabela real, comodidades e o link "Como chegar"                                         | Mapa estático desenhado em SVG das ruas próximas (sem iframe do Google)    |
| Rodapé     | O nome volta em largura total, em Imbue, com a faixa do toldo de 8 px acima, os créditos das imagens e o link da privacidade   | —                                                                          |

## 4. Copy deck (rascunho, linguagem dos clientes)

Palavras reais das avaliações: **atendimento, aconchegante, sofisticado, clássico, produtos de
primeira, qualidade**. Os textos marcados com ⚑ precisam ser confirmados pelo cliente.

- **Hero.** Marca: "Casa do Anfitrião" / "a casa mais francesa da cidade". Texto: "Confeitaria, café e
  delicatessen na Getúlio Vargas, 100. Torta Cappuccino, crème brûlée e croissant francês, servidos
  como numa casa que recebe." Botão: "Pedir pelo WhatsApp".
- **A Casa.** Título: "Receber é o que a gente faz". Texto: começou dentro de casa, em São Paulo,
  com música ao vivo ⚑ (data); ganhou espaço próprio em Itapira em 11 de abril de 2025; um anfitrião
  vindo da hotelaria e um barista. O quadro "Receita para viver bem" vira a lista desta seção.
- **Cardápio.** Grupos: Tortas e sobremesas (Torta Cappuccino, Torta rústica de chocolate, crème
  brûlée, brigadeiro, caracol de canela); Padaria e café (croissant francês, bolo de fubá com
  erva-doce, quiche, cappuccino, expresso); À mesa (salada de folhas com queijo boursin, refeição do
  dia ⚑). Nota: "Preços e disponibilidade do dia pelo WhatsApp." Sazonais: Torta Dubai e Fleur de
  Mãe, com "quando voltam" ⚑.
- **Encomendas.** Título: "Leve a casa para a sua mesa". Texto: "Páscoa, Dia das Mães, Dia dos Pais
  e Natal: tortas, ceia e enxoval de mesa sob encomenda." Prazo ⚑. Botão com mensagem pronta:
  "Olá! Quero fazer uma encomenda para…".
- **Eventos.** Título: "A casa também é palco". Convites: Aula-show de risotto, Wine Class, Jantares
  temáticos, Música ao vivo. Sem datas fixas. Botão: "Quero saber da próxima" (WhatsApp).
- **Avaliações.** "4,9 no Google." Link: "Ler as avaliações no Google". Trechos só com autorização
  (combinado de 24/11). Sem autorização, só a nota e o link.
- **Visite.** Av. Getúlio Vargas, 100 – Bela Vista, Itapira – SP, 13974-110 · (19) 99727-3330 ·
  Terça a sexta 12h–19h · Sábado 9h–18h · Domingo e segunda fechado. Comodidades: estacionamento no
  local, Wi-Fi, acessível para cadeira de rodas, aceita cães. Link: "Como chegar" (Google Maps).

## 5. SEO por seção (dossiê §8)

| Alvo                                          | Onde                                                     |
| --------------------------------------------- | -------------------------------------------------------- |
| `<title>`                                     | "Casa do Anfitrião · Confeitaria e café francês em Itapira" |
| `meta description`                            | Confeitaria, cafeteria e delicatessen na Getúlio Vargas, 100, em Itapira-SP, com o horário |
| Cluster "confeitaria em Itapira"              | h2 do Cardápio e da Encomendas                           |
| Cluster "cafeteria em Itapira"                | Texto do hero e da Visite                                |
| Cluster francês / delicatessen                | A Casa e Cardápio (croissant, crème brûlée)              |
| Cluster regional (Mogi Mirim, Mogi Guaçu, Amparo) | Uma linha na Visite ("a 25 min de Mogi Mirim" ⚑ distâncias) |
| Schema.org                                    | `CafeOrCoffeeShop` com NAP igual ao Google, horário, geo, `sameAs` Instagram, `url` como placeholder |
| Técnico                                       | `sitemap.xml`, `robots.txt`, canonical (placeholder), Open Graph com imagem 1200×630 |

## 6. Arquivos da Fase 5 (planejado)

- `index.html`: a home inteira (substitui o boilerplate).
- `privacidade.html`: entra como segunda página no `build.rollupOptions.input`. Hoje não há
  `vite.config.js`; criar um é mudança de stack e exige atualizar o CLAUDE.md.
- `src/tokens.css` (feito nesta fase), `src/style.css` (componentes), `src/main.js` (status ao vivo,
  fallback de reveal, cursor).
- `public/fonts/`: Imbue e Albert Sans em woff2 auto-hospedados (licença OFL), `public/assets/`
  (imagens otimizadas).
- `tests/e2e/home.spec.js`: reescrito para os fluxos novos (título, CTA WhatsApp, menu no celular,
  status ao vivo, reduced-motion, axe).

## 7. Pendências que dependem do cliente

Logo em vetor e cores exatas · fotos reais (salão, produtos, anfitriões) · autorização dos trechos
de avaliação · prazos de encomenda · data da origem em SP · domínio · distâncias para a região.
