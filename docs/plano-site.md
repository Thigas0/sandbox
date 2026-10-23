# Plano: site da PDL Fotografia & Imagem

## Contexto

Hoje o repositório é o site-modelo do Vite ("Meu site", contador). O novo site atende um fotógrafo de
festas/eventos e jogos esportivos e tem dois trabalhos, nesta ordem:
1. levar quem esteve num evento até as próprias fotos à venda no Fotto
   (https://www.fotto.com.br/pdl_fotografia_imagem);
2. gerar pedidos de orçamento para novas coberturas.
O Behance (https://www.behance.net/pedrodelucca2) continua sendo o portfólio completo; o site mostra só
a melhor seleção. A direção é clara e editorial (galeria ou revista), com tipografia de luxo. As fotos
se movem com fluidez e a interface fica em silêncio. Publicar e configurar domínio está fora do escopo.

## Decisões tomadas (entrevista e segunda rodada, 2026-10-23)

- **Público:** chega pelo Instagram e por indicação. Por isso o site é pensado primeiro para celular,
  com a prévia do link no WhatsApp e os eventos recentes no topo.
- **O que vende:** festa espontânea é o que mais vende; a dúvida que trava a compra é o preço.
- **Preço:** o site mostra o preço por foto no Fotto. A cobertura aparece como "preço combinado no
  WhatsApp".
- **Frase (provisória, você ajusta):** "Festas e jogos fotografados de perto, do jeito que
  aconteceram."
- **Contato:** WhatsApp com mini-formulário (tipo de evento, data, cidade, nome e detalhes opcionais).
  O formulário valida e abre `wa.me` com a mensagem pronta. Se a janela for bloqueada, mostra o link e
  um botão "Copiar mensagem". O e-mail fica como link secundário. O site não guarda dados. O número
  fica fora do HTML e do JSON-LD; só o script do formulário o conhece.
- **Fotos:** o Behance é a fonte inicial, e você troca as imagens depois conforme o gosto do cliente.
  As imagens baixadas ficam em `fotos-originais/` (fora do Git) e o processo de publicação parte
  sempre dessa pasta.
- **Estudo:** 3 a 5 referências do setor no lugar de concorrentes locais.

## Fatos confirmados

- Fotógrafo (Person): Pedro De Lucca.
- Cidade (LocalBusiness): Campinas, SP, Brasil (`addressLocality`, `addressRegion`, `addressCountry`).
- WhatsApp: +55 15 99698-8578, que vira `https://wa.me/5515996988578`.
- Instagram: @pdl_fotografia_imagem. Fotto: `pdl_fotografia_imagem`. Behance: `pedrodelucca2`.
- Autorizações de imagem: o cliente providencia antes de publicar. A seleção continua marcando quem é
  identificável, mas isso não trava nada.
- Fotto, pelo que a busca na web mostrou (confirmar na página de um evento): é uma plataforma da
  Alboom. O comprador acha as próprias fotos com uma selfie (reconhecimento facial), compra online e
  pode receber pelo WhatsApp. O uso é pessoal: postar e imprimir pode, revender não.

## Fatos que ainda faltam

Ficam no texto do site (`docs/texto-do-site.md`) marcados como "A CONFIRMAR". Um teste falha enquanto
algum ficar sem resposta:
- e-mail;
- preço por foto no Fotto;
- prazo de entrega das fotos;
- domínio pretendido (a prévia do WhatsApp exige URL absoluta);
- logo vetorial (SVG, PDF ou AI). Se não houver, vetorizo o PNG e você aprova.

## Ambiente (achados desta sessão)

- **Rede:** o proxy recusa `www.fotto.com.br` e `www.behance.net`. Você precisa liberar esses
  domínios, mais `mir-s3-cdn-cf.behance.net` e as referências, ou usar um nível de rede mais amplo
  durante a Fase 1 (Network access do ambiente). O npm já está liberado. Se a mudança só valer para
  sessões novas, uma nova sessão retoma pela branch, porque o plano vai para `docs/plano-site.md` no
  primeiro commit.
- **Fotos:** `fotos-originais/` não existe no container e ainda não está no `.gitignore`.
- **Navegador:** os dois MCPs do Playwright não acham o navegador. Uso o Playwright do projeto com
  `PLAYWRIGHT_CHROMIUM_PATH=/opt/pw-browsers/chromium`. Não há bubblewrap, então o Chromium roda aqui.
- **Dependências:** falta `node_modules/`. Rodo `npm ci` antes de tudo e peço permissão.
- **Commits:** a identidade git do container é "Claude". Todo commit sai com
  `git -c user.name=Thigas0 -c user.email=162125902+Thigas0@users.noreply.github.com`. Nenhuma
  mensagem de commit menciona o Claude ou IA, e não há trailers. Faço staging por caminho explícito,
  cada commit e push pede sua confirmação, e tudo vai para a branch
  `claude/pdl-fotografia-site-lpctv0`.

## Fase 0: preparação

1. `npm ci`; `npm install -D sharp` e as fontes escolhidas (ver Dependências).
2. `.gitignore` passa a incluir `fotos-originais/` e `.taste-skill/`.
3. Commit do plano em `docs/plano-site.md`.

## Fase 1: estudo, fotos e 2 direções (você escolhe uma no fim)

1. **Fotto:** leio o perfil e preencho `src/dados/eventos.json` com eventos reais (nome, data, local e o
   link exato de cada um). Nada inventado.
2. **Behance:** um script descartável, fora do repositório, baixa o maior tamanho disponível de cada
   imagem para `fotos-originais/behance/` e registra a origem de cada arquivo em
   `fotos-originais/FONTES.md`. Se o Behance bloquear robôs, você salva as candidatas nessa pasta.
3. **Estudo das referências do setor (3 a 5):**
   - um arquivo de festas com "ache seu evento" (ex.: nicophoto.co.uk);
   - um ou dois portfólios de fotografia esportiva;
   - o fluxo do Fotto de ponta a ponta;
   - os sites fotográficos estudados pela taste-skill (City of Angels, Julien Calot, Tengile).

   As notas ficam em `docs/estudo-referencias.md`. As capturas desses sites ficam fora do repositório
   e eu envio para você.
4. **Inventário e argumento (taste-skill, passos 1, 2 e 5):** escrevo o rascunho de todo o texto em
   `docs/texto-do-site.md`. Sementes de ideia: a lente dentro do D do logo, o contorno da câmera, a
   pulseira ou ingresso da festa, o placar do jogo.
5. **Seleção:** monto folhas de contato das candidatas e proponho de 12 a 20 fotos em sequência, com o
   motivo de cada uma e marcando quem é identificável. Você confirma.
6. **Direções:**
   - Rodo `draw.mjs --sector studio-portfolio --tone editorial --have photography --sections
     list,gallery,how-it-works,faq,contact,footer --options 3`.
   - Fico com as 2 direções guiadas por fotografia. Se vierem menos de 2, faço um único novo sorteio e
     registro o motivo.
   - Cada direção vira uma prancha com a primeira tela, a busca de eventos e uma cena da seleção, usando
     as fotos do Behance e o movimento-assinatura, em 1440 e 390 px.
   - Você escolhe uma. A ficha de marca (pro-design §1: cores com nome, 2 fontes, voz e elemento
     assinatura) vai para `DESIGN.md`.

## Fase 2: base (não depende da direção)

**Dados**, que você edita sem mexer em código:
- `src/dados/site.json`: contato, links, preço por foto, URL e crédito;
- `src/dados/eventos.json`: `nome`, `data` (AAAA-MM-DD), `local`, `fotto`;
- `src/dados/fotos.json`: o manifesto da seleção, com `id`, `arquivo`, `alt`, `legenda`,
  `pessoasIdentificaveis` e `foco`.

**Fotos:** `scripts/fotos/gerar.mjs` (`npm run fotos`), com sharp:
- corrige a rotação pelo EXIF e converte para sRGB;
- gera 4 larguras pelo lado maior (640, 960, 1440 e 2000 px), sem ampliar, em AVIF e WebP, dentro de
  `public/fotos/`;
- regrava o EXIF só com Artist e Copyright: usa o crédito do original quando existe, senão o do
  `site.json`. O GPS sai;
- calcula a cor dominante de cada foto para o fundo enquanto ela carrega;
- grava `src/dados/fotos.gerado.json` com width e height;
- gera `public/og.jpg` em 1200×630, com menos de 300 KB.

`scripts/fotos/verificar.mjs` (`npm run fotos:verificar`) confere que cada arquivo existe, que o lado
maior não passa de 2000 px, que não há GPS, que o crédito está presente e que o manifesto bate com os
arquivos.

**Render em build:** `vite.config.js` ganha um plugin pequeno (`transformIndexHtml`) que escreve no HTML:
- a lista de eventos;
- os `<picture>` com width, height, srcset e sizes;
- o preload com `fetchpriority` da foto principal;
- as metatags OG;
- o JSON-LD (Person e LocalBusiness).

O mesmo plugin valida os JSON com erros em português, por exemplo "eventos.json, item 3: data deve ser
AAAA-MM-DD". O site funciona sem JS e o LCP não espera script.

**Páginas:**
- `index.html`, com estas seções:
  - cabeçalho;
  - primeira tela com "Encontrar minhas fotos", "Pedir orçamento" e o último evento;
  - busca de eventos, com o preço por foto e os 3 passos no Fotto;
  - seleção;
  - cobertura;
  - orçamento;
  - perguntas;
  - rodapé com a marca.
- `privacidade.html`, com LGPD e o pedido de remoção de foto. O build passa a ser multi-página.

**Scripts:**
- `src/eventos.js`: busca sem acento sobre a lista já renderizada, contagem de resultados em
  `aria-live` e estado vazio com atalho para o WhatsApp.
- `src/orcamento.js`: valida (obrigatórios, data futura, foco no primeiro erro, mensagem ligada ao
  campo), monta `https://wa.me/<número>?text=<mensagem>` e trata a janela bloqueada.

**README:** "Como adicionar um evento" e "Como trocar uma foto". Trocar uma foto é substituir o arquivo,
editar `fotos.json` e rodar `npm run fotos`.

## Fase 3: direção visual e movimento

- Tokens de cor, tipo e espaço em variáveis CSS; nada fixo nos componentes.
- Fontes servidas pelo próprio site, sem pedido ao Google: melhor para o LCP e para a LGPD.
- Uma cena guiada pela rolagem (CSS scroll-driven com `position: sticky`, sem sequestrar a rolagem) ou
  uma faixa com botão de pausa, conforme a direção escolhida. Nada se move sozinho sem controle
  (WCAG 2.2.2).
- Com `prefers-reduced-motion`, os deslocamentos saem e o conteúdo fica. Nada fica escondido se o JS
  falhar (`html.js`).
- Gates: `lint.mjs` e `inspect.mjs` da taste-skill, depois o loop da pro-design (capturas 1440 e 390,
  no máximo 2 rodadas).

## Fase 4: testes, evidência e roteiro

Playwright nos projetos desktop e celular. Uma trava faz qualquer teste falhar se uma requisição sair
de localhost.
- `eventos.spec.js`:
  - lê `eventos.json`, busca por nome e por local, e confere que o item certo aparece com `href` igual
    ao link exato do Fotto;
  - faz o caminho só por teclado (Tab até a busca, digitar, Tab até o link, Enter), com a navegação
    interceptada;
  - confere a mensagem de "nenhum evento".
- `orcamento.spec.js`:
  - validação: formulário vazio e data passada;
  - sucesso: `window.open` simulado captura a URL `wa.me` com número e texto certos;
  - erro: `window.open` simulado devolve `null`, e aparecem o link e o "Copiar mensagem".
- `acessibilidade.spec.js`:
  - axe com wcag2a, 2aa, 21a, 21aa e 22aa em `index.html` e `privacidade.html`, também com movimento
    reduzido;
  - percurso inteiro por Tab, medindo o foco visível em cada elemento;
  - link "pular para o conteúdo".
- `layout.spec.js`: em 1440×900 e 390×844, confere que não há rolagem lateral nem texto cortado e salva
  capturas da página inteira.
- `movimento.spec.js`: com movimento reduzido, nenhuma animação roda e todo o conteúdo fica visível. Se
  houver faixa, o botão pausa.
- `seo.spec.js`: title, description, og:* com URLs absolutas, `og.jpg` em 1200×630 com menos de 300 KB,
  JSON-LD válido com Person e LocalBusiness.
- `texto.spec.js`: nenhum "A CONFIRMAR", colchete de espaço reservado ou "lorem" no texto visível.
- `home.spec.js` é substituído por esses arquivos.

Também nesta fase:
- **`scripts/verify.sh`** ganha a checagem "Fotos publicadas" (`npm run fotos:verificar`). É uma
  mudança de checagem: aprovar este plano é o seu de acordo.
- **`CLAUDE.md`:** mapa e comandos atualizados.
- **Desempenho:** `/perf-audit` para celular com `npx lighthouse` (peço permissão) contra o
  `vite preview`, 3 rodadas, mediana do LCP e do CLS.
- **Roteiro:** `docs/roteiro-teste-clientes.md`, para você aplicar com 3 clientes em 5 minutos:
  - preparação: site em `npm run preview -- --host`, com o celular da pessoa na mesma rede;
  - tarefa 1: achar o evento e chegar à compra no Fotto;
  - tarefa 2: pedir um orçamento;
  - o que observar: tempo até o evento certo, se usa a busca, se nota o preço, se entende a passagem
    para o Fotto, a mensagem que chega no WhatsApp e onde hesita;
  - perguntas finais (nota de facilidade de 1 a 7, "o que quase te fez desistir?") e uma folha de
    anotação.

## Dependências novas (justificadas)

- **`sharp`** (dev): o Node não codifica AVIF/WebP nem redimensiona sozinho. O sharp tem binário pronto
  para Linux, WSL e CI e controla o EXIF. O ImageMagick depende da instalação de cada máquina e o
  suporte a AVIF varia; o squoosh está abandonado.
- **Fontes `@fontsource-variable/*`** (dev, duas no máximo, definidas pela direção): WOFF2 com licença
  e versão no lockfile, sem requisição a terceiros.
- **Nada mais:** sem framework, sem GSAP, sem serviço de formulário. O Lighthouse roda via `npx` só na
  auditoria.

## Verificação (critério → evidência)

1. `./scripts/verify.sh` passando (saída no relatório). Rodo `--full` aqui também, mas o oficial é você
   rodar no seu terminal.
2. `eventos.spec.js` e `orcamento.spec.js` passando nos dois projetos.
3. `acessibilidade.spec.js` com zero violações, mais o percurso por Tab com foco visível.
4. `layout.spec.js` e as capturas 1440/390 enviadas para você, conferidas no loop da pro-design.
5. `/perf-audit` para celular com LCP ≤ 2,5 s e CLS ≤ 0,1 (mediana de 3 rodadas, números no relatório).
6. `seo.spec.js` e o JSON-LD no validator.schema.org, se a rede permitir. A prévia real do WhatsApp só
   aparece com o site publicado (fora do escopo); localmente valido as tags e a imagem.
7. `texto.spec.js` passando, com `docs/texto-do-site.md` aprovado por você.
8. `docs/roteiro-teste-clientes.md` entregue.

## Riscos

- O Behance ou o Fotto podem bloquear robôs. Nesse caso você coloca as imagens e os eventos à mão.
- O Firefox não tem animação guiada pela rolagem, então mostra a versão estática.
- O LCP depende do peso da foto principal. A primeira tela usa a largura de 960 px no celular.
