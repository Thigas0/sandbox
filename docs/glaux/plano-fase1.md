# Site do Glaux · Plano da Fase 1 (apresentação em 27/11) e ponte para a Fase 2

> Memória entre sessões. Ao aprovar, este arquivo vira `docs/glaux/plano-fase1.md` no sandbox.
> Fontes, em ordem de prioridade: **código** do Glaux (`/workspace/Residence_AI_Challenge-2`, `main` em
> `9652ce2`, mais o branch `origin/orquestrador` em `5b517bf`); **Doc**, o PDF "Glaux – Documentação",
> 19 páginas, v1.0 de 29/10/2026 (citado como `Doc p.N`); **Entregável**, o PDF "Entregável 27/11",
> 1 página (`Ent p.1`). Os arquivos `.py` são citados como `arquivo:linha`.

## Context
O grupo apresenta o sistema multiagente em 27/11. O entregável pede duas coisas: um sistema multiagente
integrado a APIs externas e agentes trabalhando juntos, com as perguntas "vai ter orquestrador?" e
"vão conversar diretamente?" (`Ent p.1`). O site serve de roteiro para a apresentação ao vivo e, depois,
evolui para o site de produto (Fase 2). Decisões já tomadas pelo usuário:
- versão que vale: `main` mais o orquestrador;
- o site apresenta **4 agentes: Canvas, Tutor, Gerador e Orquestrador**;
- demo **ao vivo (CLI), com gravação de fallback**;
- os PDFs foram enviados.

---

## 1. Dossiê do Glaux

**Grupo:** Glaux. Integrantes segundo a Doc: Caio Peccinato, Douglas Juvêncio, João Antônio, Guilherme
Leal e Lucas Minneh (`Doc p.3`). Autores no git: Thigas0, simplyyn, Lucas Minneh/Lucas, Caio
Peccinato/peccinato4 (`git log`). O mapeamento entre os dois ainda não foi confirmado (ver P1).

**Problema:** os estudos rendem pouco por causa de cronograma mal estruturado, falta de feedback rápido,
material insuficiente e incerteza sobre o que estudar (`Doc p.3`). A Doc liga isso à Big Idea de Bem-Estar
pelo estresse (`Doc p.3`).

**Público:** estudantes do ensino técnico e superior que usam o Canvas LMS (`Doc p.3`, `p.4` BMC).

**Essential Question:** "A IA vai substituir o humano ou ampliar seu potencial?" (`Doc p.3`).

**Hipótese:** integrar a API do Canvas a dois agentes. O primeiro planeja e extrai do Canvas; o
segundo é tutor e gera questões e resumos "através de uma API do Grok", com uma rede neural para corrigir
as respostas (`Doc p.3-4`). A versão curta está no BMC (`Doc p.4`).

**Objetivo geral:** uma plataforma web integrada ao Canvas, com agentes de planejamento e de exercícios
(`Doc p.4`).

**Objetivos específicos:** OAuth2 com o Canvas, planejador que se reajusta, tutor que avalia respostas e
um laço de avaliação que alimenta o planejamento (`Doc p.5`).

### 1.1 Agentes (estado do código)

| Agente | Objetivo | Entradas → saídas | Ferramentas | LLM |
|---|---|---|---|---|
| **Canvas** (`src/agente_canvas/`) | Sincronizar cursos, tarefas e PDFs, e disparar a indexação | Token → `courses`, `downloaded_files`, `data/raw/<id>/assignments.json` e PDFs (`node.py:71-113`, `service.py:165-235`) | API REST do Canvas via `canvasapi` (`service.py:17`); filtro de cursos institucionais (`service.py:139-142`); 3 retentativas, com 2, 5 e 10 s (`service.py:32,87-112`); modo offline (`node.py:46-68`); classificador por regras existe, mas **não é chamado** (`classificador.py`, só usado em `tests/`) | Nenhum |
| **Tutor** (`src/agente_tutor/`) | Cronograma por prazo e resumo com citação por frase | Cursos e tarefas → `assignments` (ALTA até 2 dias, MÉDIA até 7; `service.py:119-170`) e `summaries` com `[arquivo, p.X-Y]` (`service.py:203-310`) | RAG `buscar` com k=3 (`service.py:27`); auditoria e uma reescrita das citações (`service.py:69-86,287-298`) | Groq `openai/gpt-oss-20b`, temperatura 0 (`service.py:94-95`), via `langchain-groq` |
| **Gerador** (`src/agente_gerador/`) | Questões de múltipla escolha e dissertativas ancoradas no material | Tema, curso e N de 1 a 10 → `generated_questions` e status `ok`, `sem_material` ou `erro` (`node.py:20-54`, `service.py:37`) | RAG com k≥10 e score ≥0,80 (`service.py:43-46`); validação Pydantic (`models.py`); embaralha as alternativas (`service.py:208-231`); 2 tentativas | Groq `openai/gpt-oss-20b`, temperatura 0,6, JSON mode, timeout de 60 s (`service.py:50-55,234-271`) |
| **Orquestrador** (branch `origin/orquestrador`) | Montar o plano mínimo de nós para cada ação de botão | `action` (SINCRONIZAR_CANVAS, GERAR_CRONOGRAMA, GERAR_RESUMO, GERAR_QUESTOES, FLUXO_COMPLETO) mais o estado local → `OrchestratorPlan{steps, resolved_course_id, reason}` (`agente_orquestrador/service.py:82-153`, `models.py:14-30`) | Determinístico: confere `data/raw` e os resumos já no estado (`service.py:36-80`) | Nenhum. **`node.py` está vazio e o nó não está ligado ao grafo** |
| *(ABNT, fora do escopo do site, ver P3)* | Formatar Google Docs em ABNT | `DOCUMENT_ID` → documento formatado (`agente_abnt/docs_service.py`) | Google Docs/Drive OAuth (`auth_service.py:7-48`), polling a cada 15 s (`agente_abnt.py:81-131`) | Groq 20b e depois 120b, pelo SDK `openai` (`agente_abnt.py:31-79`) |

### 1.2 Fluxo atual
`main` (`src/graph.py:36-50`): START → `canvas_agent` → `tutor_agent` → `gerador_questoes` → END. O fluxo é
linear e não tem arestas condicionais. A colaboração se dá pelo **estado compartilhado** `GlauxState`
(`src/state.py:32-48`): o Canvas escreve `courses`, o Tutor lê e escreve `assignments`/`summaries`, e o
Gerador lê `tema`/`curso_alvo`. **Os agentes não trocam mensagens diretamente.** O Gerador não roda sem a
opção `--questoes` (`graph.py:42`).

No branch, o Orquestrador escolheria os passos por `action`. Por exemplo, GERAR_QUESTOES com PDFs locais
e sem resumo resulta em `[tutor_agent, question_generator_agent]` (`service.py:122-143`).

**Interface:** só a CLI, com `--tema`, `--curso` e `--questoes` (`graph.py:57-74`), e saída em JSON em
`data/processed/` (`graph.py:130-163`).

### 1.3 RAG / base de conhecimento
Pipeline: PyMuPDF → limpeza (rodapé "N / M", capas repetidas, páginas com menos de 50 caracteres,
separadores, navegação, overlays do Beamer, hifenização) → 1 página por chunk, com até 500 tokens →
E5 `intfloat/multilingual-e5-base` → ChromaDB com cosseno, filtrado por `course_id` (`docs/DECISOES.md:5-18`;
`rag/chunking.py:33-43`; `rag/busca.py:33`). Listas e roteiros ficam fora do índice (`rag/extracao.py:34`).

### 1.4 APIs externas integradas (código)
Canvas LMS REST, Groq (chat completions), Hugging Face (download do modelo E5) e, só no ABNT, Google
Docs/Drive.

### 1.5 Métricas e avaliação
- **RAG**, curso 93527, aulas 00 a 04, 18 perguntas: Recall@5 (Hit Rate@5) de 0,778, ou 14/18; MRR de
  0,657. Por tipo: diretas 1,000, paráfrase 0,714. A janela de 3 páginas ficou com MRR de 0,611
  (`avaliacao/resultados.md:195-222`; `DECISOES.md:12-18,30-31`; mesmos números em `Doc p.15`). Parte do
  gabarito está como "sugerida" (`DECISOES.md:25-29`).
- **Gerador**, curso 94256, 3 questões por tema, rodado em 23/11:
  - dentro do conteúdo: ok 6/10, sem_material 2, erro 2;
  - fora do conteúdo: sem_material 6/6, como esperado;
  - média de 1,8 s e máximo de 7,5 s;
  - posição da correta antes de embaralhar: B 8, C 3, D 1, A 0; depois: 2/2/5/3
  (`avaliacao/gerador_resultados.md:25-33`).
- **Testes:** cerca de 104 funções pytest (gerador e classificador). **Não rodei.**
- A Doc deixa em branco as seções 10 (métricas e metas) e 11 (validação) (`Doc p.17-18`).

### 1.6 Riscos e limitações
- **Doc:** alucinação nas questões e na correção; dependência do aluno em relação à ferramenta (`Doc p.4`);
  sem OCR; `.pptx`/`.docx` fora da base; uma única disciplina avaliada (`Doc p.15`).
- **Código:** sem score mínimo no RAG (`DECISOES.md:21-24`); `user_id` fixo (`graph.py:80`); um arquivo
  atualizado com o mesmo nome não é baixado de novo (`docs/canvas-incremental.md:13-15`); limite de tokens
  do Groq no plano gratuito (`scripts/avaliar_gerador.py`, docstring); dados em `data/` precisam ser
  recriados em cada máquina (`canvas-incremental.md:140`).

---

## 2. Divergências entre código e Doc (nenhuma foi resolvida; ver P2)

| # | Tema | Doc | Código |
|---|---|---|---|
| D1 | Número de agentes | Hipótese: 2 (`p.3`). Tabela: 4 (Canvas, Gerador, Tutor, ABNT) (`p.5`). Nenhuma menção a orquestrador | 3 no grafo (`graph.py:40-43`), mais o ABNT avulso e o orquestrador só no branch. Site: 4, com orquestrador e sem ABNT (decisão do usuário) |
| D2 | Provedor de LLM | "API do Grok" (`p.4`, `p.9`); "Groq" (`p.11`, `p.13`, `p.16`) | Groq: `langchain-groq` (`requirements.txt:16`), `api.groq.com` (`agente_abnt.py:33`) |
| D3 | Numeração "Agente 1/2" | O Tutor usa PDFs "extraídos pelo Agente 1" (logo, Agente 1 = Canvas) e manda ao "agente 2"; o Gerador pede revisão "ao Agente 1", mas quem recebe a revisão do "Agente 2" é o Tutor (logo, Agente 1 = Tutor) (`p.5-6`) | Não há numeração; os nós têm nome |
| D4 | Papéis | Tabela: Tutor = avisos e resumos (`p.5`). Matriz: Tutor = cronograma diário que se redistribui (`p.6`). Gerador "gera questões **e resumos**" (`p.8`) | Tutor = cronograma e resumos; Gerador = só questões |
| D5 | Correção por rede neural | O Gerador avalia as respostas com uma rede neural (`p.4`, `p.8-9`) | Não existe. Só um comentário (`agente_gerador/models.py:63`) |
| D6 | Laço Gerador → Tutor (revisão reforçada) | Objetivo d e matriz (`p.5-6`) | Não existe; o fluxo é de mão única (`graph.py:45-48`) |
| D7 | Autenticação no Canvas | OAuth2 (`p.5`) | Token pessoal (`.env.example:3-4`, `service.py:73`) |
| D8 | Interface | Plataforma web, botão "Sincronizar" (`p.4`, `p.15`) | Só CLI. O branch do orquestrador cita "botões da interface web" |
| D9 | LLM no Agente Canvas | "Não utiliza nenhuma LLM" (`p.7`) **e** usa LLM para classificar arquivos (`p.13-14`) | Nenhuma LLM; classificador só por regras e não integrado; a camada de LLM é "próxima etapa" (`canvas-incremental.md:96-103`) |
| D10 | Dados coletados | Notas, provas, avisos, `announcements.json`, catálogo `_arquivos.json`, subpastas por categoria, download incremental (`p.6-7`, `p.13-15`) | Só tarefas e PDFs, numa estrutura plana. `announcements` não é preenchido (só aparece em `state.py:40`). O download incremental é só um plano (`canvas-incremental.md`) |
| D11 | Busca | `buscar(pergunta, course_id, k, categorias)`; o Tutor busca só em slides (`p.15`) | `buscar(pergunta, course_id, k)`, sem categoria (`rag/busca.py:75`) |
| D12 | Uso das listas | O Gerador usa as listas como referência de formato (`p.15`) | As listas não são indexadas (`rag/extracao.py:34`) |
| D13 | Prompt do Tutor | Estrutura "Visão Geral da Aula … O que costuma cair em provas" e tom "encorajador" (`p.10`) | Prompt diferente, com citação obrigatória e recusa (`prompts/agente_tutor_prompts.py:3-27`) |
| D14 | Prompt do Gerador | Placeholder "(Colocar o prompt correto)" (`p.8`) | Prompt completo (`prompts/agente_gerador_prompts.py:119-161`) |
| D15 | Entradas do Tutor | Horários livres do usuário e notas (`p.9`) | Não usa nenhum dos dois |
| D16 | Seções vazias | Fluxograma, arquitetura, métricas, validação, riscos e próximos passos ainda são template (`p.16-18`) | — |
| D17 | "177 páginas, 44 descartadas" (`p.14`) | — | Não dá para conferir: `data/` não está versionado |
| D18 | Integrantes | 5 nomes (`p.3`) | Os autores do git incluem Thigas0 e simplyyn, que não batem com a lista |

---

## 3. Cobertura do entregável de 27/11 (`Ent p.1`)

| Requisito | Evidência no código | Lacuna |
|---|---|---|
| Sistema multiagente | 3 agentes num `StateGraph` do LangGraph (`graph.py:36-50`) | O orquestrador não está no grafo |
| Integrado a APIs externas | Canvas (`agente_canvas/service.py:17,82`), Groq (`agente_tutor/service.py:109`, `agente_gerador/service.py:253`), Hugging Face/E5 (`rag/embeddings.py:29`) | Nenhuma; os exemplos do slide (Maps, Gov, Spotify, X) são só ilustrativos |
| Agentes trabalhando juntos | Pipeline em sequência sobre estado compartilhado: Canvas → Tutor → Gerador | Sem laço de volta (D6) |
| Vai ter orquestrador? | `OrchestratorService.build_execution_plan` no branch (`service.py:82-153`) | `node.py` vazio, sem arestas condicionais em `graph.py`, branch não mergeado. **Precisa estar ligado até 26/11** para a demo ao vivo (ver P4) |
| Conversam diretamente? | Não. É comunicação indireta pelo estado (padrão supervisor/quadro-negro) | Se o grupo quiser dizer "sim", falta implementar. O site responde com o que o código faz |

---

## 4. Inventário de ferramentas do sandbox

| Ferramenta | Usa? | Fase | Para quê | Pré-requisito |
|---|---|---|---|---|
| taste-skill | Sim | 1 | Direção de arte e o loop de olhar e corrigir screenshots | — |
| pro-design | Sim | 1 | Processo de marca, padrões, motion e verificação | — |
| frontend-design / impeccable | Sim | 1 | Tipografia, hierarquia e polimento (impeccable: critique/polish/harden) | — |
| soft-skill / minimalist-skill / brutalist-skill / redesign-skill | Consulta | 1 | Referências de acabamento; brutalist só se a direção C vencer | — |
| docs/design-library | Sim | 1 | Referências: `claude`, `wired`, `linear.app`, `ollama` (direções A a C) | Usar como referência, sem copiar marcas |
| design-system / design-handoff / design-critique | Sim, parcial | 1 / 2 | Tokens no `DESIGN.md`; crítica antes do ensaio; handoff na Fase 2 | — |
| animate / emil-design-eng / apple-design | Sim | 1 | Construir o fluxo no scroll, as curvas e o cursor | — |
| animation-performance | Sim | 1 | Garantir composite-only e 60 fps | — |
| find-animation-opportunities / review-animations / improve-animations | Sim | 1 / 2 | Revisão antes do congelamento; auditoria na Fase 2 | — |
| animation-vocabulary | Eventual | — | Nomear efeitos | — |
| mobile-native | Sim | 1 | 100svh, safe-area, tap highlight; o projeto "celular" do Playwright | — |
| accessibility-review / web-design-guidelines | Sim | 1 | Auditoria WCAG AA, além do axe | — |
| break-ui | Sim | 1 | Dados extremos nos cards de demo (resumos longos, sem material) | — |
| perf-profiler (+ /perf-audit, /perf-compare) | Sim | 1 | LCP, CLS, INP e tamanho do bundle | Chromium pré-instalado |
| e2e-test-generator (+ /e2e-map, /e2e-write) | Sim | 1 | Testes de seções, navegação, reduced-motion e fallback | — |
| security-review | Sim | 1 | Revisão do diff: CSP, segredos, dependências | — |
| seo-audit / technical-seo / schema-markup / on-page-seo | Mínimo / Sim | 1 / 2 | Fase 1: title, meta, OG e `noindex` opcional. Fase 2: auditoria completa e JSON-LD `SoftwareApplication` | — |
| content-*, keyword-*, internal-linking, ai-visibility, broken-links, content-translation, agentes seo/competitor/content | Não / Sim | 2 | Site de produto; broken-links na Fase 1 é barato, roda antes do deploy | — |
| ux-copy | Sim | 1 | Microcopy e estados de erro da demo | — |
| user-research / research-synthesis | Não | 2 | Validar o produto com estudantes | — |
| output-skill | Não | — | Desnecessária | — |
| higgsfield-* (generate, brandkit, video-explainer…) | Não na Fase 1 | 2? | Assets gerados (marca, vídeo explicativo) | **CLI `higgsfield` não instalada, exige conta e créditos pagos. Perguntar antes** |
| Figma MCP | Opcional | 2 | Handoff e design system | **Não autenticado nesta sessão (OAuth pelo claude.ai)** |
| Canva (conector) | Opcional | 1? | Slides de apoio, se o grupo apresentar com deck | Conta Canva do usuário; perguntar antes de criar qualquer coisa |
| Playwright MCP (plugin) | Sim | 1 | Verificação visual e screenshots em 390 e 1440 px | Conectado. O `.mcp.json` do projeto usa `npx @playwright/mcp@0.0.83` e exige rede e aprovação |
| Vercel (proxy da sessão) | Proposta | 1 | Deploy com cabeçalhos de segurança | **Exige autorização explícita para deploy** |
| Google Drive/Docs (conectores) | Não | — | Não é necessário | — |

---

## 5. Plano

### 5.1 Arquitetura de informação da Fase 1 (roteiro ao vivo, página única com âncoras)
Cada seção funciona como um "slide". Navegação por teclado com setas ou PageDown, mais uma barra de
progresso. Proposta de 10 a 12 minutos (ver P6).

| # | Seção | Mensagem (fonte) |
|---|---|---|
| 0 | **Abertura** | "Glaux: um sistema de agentes que estuda com o material que o seu curso já tem." Nome do grupo e Residência em IA |
| 1 | **Problema** | Estudo pouco eficiente por cronograma, falta de feedback e incerteza; ligação com o bem-estar (`Doc p.3-4`) |
| 2 | **Hipótese e como evoluiu** | De "2 agentes" para "4 agentes coordenados"; honestidade sobre a evolução (`Doc p.3` vs código) |
| 3 | **Os 4 agentes** | Cards com objetivo, entrada, saída e LLM/ferramenta (§1.1) |
| 4 | **Como colaboram** (peça central) | O fluxo do orquestrador se monta no scroll. Responde o entregável: *sim, há orquestrador determinístico; não, os agentes não conversam diretamente, compartilham um estado* (§1.2, `Ent p.1`) |
| 5 | **APIs externas** | Canvas, Groq e Hugging Face, com o que entra e sai de cada uma (§1.4) |
| 6 | **Demo** | Ao vivo no terminal; o site mostra a gravação e as saídas reais capturadas (cronograma, resumo citado, questões) |
| 7 | **Evidências** | Hit@5 de 0,778, MRR de 0,657, gerador 6/10 dentro e 6/6 fora, embaralhamento (§1.5) |
| 8 | **Limites e riscos** | Paráfrase, sem OCR, uma disciplina avaliada, alucinação (§1.6) |
| 9 | **Próximos passos** | Correção das respostas, laço de revisão, OAuth2, interface web (D5 a D8 como roadmap, se aprovado em P2) |
| 10 | **Equipe e repositório** | Integrantes (P1) e link do GitHub (`Doc p.19`) |

**Evolução para a Fase 2:**
- O Vite passa a multi-page (`build.rollupOptions.input`): `/` (produto), `/como-funciona`, `/seguranca`,
  `/equipe`, `/apresentacao` (o roteiro da Fase 1 fica arquivado aqui).
- O conteúdo da Fase 1 já nasce em `src/content/*.js` (dados com o campo `fonte`), de modo que mude a
  apresentação e não o conteúdo.
- A demo gravada vira um tour interativo. Inglês entra na Fase 2.

### 5.2 Direções visuais

**A. "Caderno anotado"** · *recomendada*
- **Referências:** `docs/design-library/claude/DESIGN.md` (canvas creme quente e serifa editorial) com
  rigor de grade de `wired/DESIGN.md`.
- **Tipografia:** Newsreader ou Fraunces (display serifada, auto-hospedada, subconjunto latin) e Inter
  ou IBM Plex Sans no texto; IBM Plex Mono para citações `[arquivo, p.X-Y]` e logs.
- **Paleta:** papel `#F5F1E8`, tinta `#1B1A17`, grafite `#55524B`, acento âmbar "olho de coruja"
  `#C9822B`, verificação `#2F6F5E`; tudo com contraste AA validado.
- **Motion:**
  - o fluxo entre agentes é desenhado a "tinta" (SVG `stroke-dashoffset`) conforme a rolagem;
  - as citações ganham um "marca-texto" quando entram na tela;
  - o cursor vira um pequeno "foco de leitura" sobre os nós do diagrama.

**B. "Coruja noturna"**
- **Referências:** `linear.app/DESIGN.md`.
- **Tipografia:** Inter Display com mono.
- **Paleta:** quase preto `#0B0D12`, tinta `#E8EAF0`, âmbar `#F2A93B` como "olhos".
- **Motion:** os nós acendem como constelação; spotlight radial no cursor.
- **Ponto contra:** apaga em projetor e em sala iluminada.

**C. "Blueprint de terminal"**
- **Referências:** `ollama/DESIGN.md` e a skill brutalist.
- **Tipografia:** IBM Plex Mono e Plex Sans.
- **Paleta:** branco, preto e um azul de blueprint.
- **Motion:** logs da CLI reais sendo "digitados" no ritmo do scroll.
- **Ponto contra:** fria para o público estudante.

**Por que A:** o diferencial verificável do Glaux é **responder citando a fonte** (`agente_tutor_prompts.py:10-14`,
validação do gerador). A estética de caderno anotado transforma isso em linguagem visual. Fundo claro e
de alto contraste se lê melhor em projetor. O tom acadêmico e acolhedor conversa com a Big Idea de
bem-estar. E a direção escala para o site de produto sem precisar de refação.

O nome "Glaux" como referência à coruja é **escolha criativa**: não está nas fontes.

### 5.3 Motion
- **Biblioteca:** nenhuma na Fase 1 (dependência zero).
  - CSS scroll-driven animations (`animation-timeline: view()`) como camada progressiva.
  - Fallback com `IntersectionObserver` mais WAAPI.
  - Só adicionamos a `motion` (motion.dev) se surgir um gesto que o nativo não resolva, com justificativa.
  - Sem scroll-jacking e sem smooth-scroll de biblioteca, por acessibilidade.
- **Fluxo do orquestrador (§4):** seção sticky em 3 ou 4 passos.
  1. Usuário e ação.
  2. O orquestrador escolhe a rota, com as 5 ações reais de `service.py:87-147` num seletor clicável.
  3. Os nós acendem em sequência e o "estado compartilhado" se preenche (`courses`, `assignments`,
     `summaries`, `generated_questions`).
  4. Saídas.
  - O seletor permite mostrar ao vivo que GERAR_QUESTOES com PDFs locais pula o Canvas.
- **Cursor:** só com `(hover: hover) and (pointer: fine)`. Realce magnético leve nos nós e tooltip com a
  fonte. Nada essencial depende do cursor.
- **Orçamento:**
  - animar só `transform` e `opacity`, além do `stroke-dashoffset` de um único SVG pequeno;
  - 60 fps no Pixel 7 emulado, com CPU 4× mais lenta;
  - LCP < 2,5 s: o LCP é o título em texto, com a fonte pré-carregada e `font-display: swap`;
  - CLS < 0,1: dimensões reservadas e `size-adjust` no fallback da fonte;
  - JS ≤ 25 KB gzip; CSS ≤ 25 KB; fontes ≤ 2 arquivos woff2.
- **`prefers-reduced-motion: reduce`:** o diagrama aparece já montado e estático, sem trilhas nem
  marca-texto animado; a navegação continua igual. Um teste e2e cobre isso.

### 5.4 Segurança e confiabilidade
- **Sem segredos:** o site é 100% estático e não chama Canvas nem Groq. Nenhuma variável `VITE_*` com
  chave. As demos são **JSON e vídeo pré-capturados** em `public/demo/`.
- **Sanitização da captura:** sem token, sem `user_id` real, sem a descrição bruta das tarefas, e só
  trechos curtos de slide com permissão (ver P5). O próprio projeto já evita imprimir conteúdo de PDF
  nas avaliações (`avaliar_gerador.py`, docstring).
- **CSP estrita:** `default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:;
  font-src 'self'; media-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self';
  form-action 'none'; frame-ancestors 'none'`.
  - Vai na `<meta http-equiv>` (que vale também no `vite preview`) e nos cabeçalhos do `vercel.json`.
  - Cabeçalhos junto da CSP: `X-Content-Type-Options: nosniff`, `Referrer-Policy:
    strict-origin-when-cross-origin`, `Permissions-Policy` restritiva e `frame-ancestors`/XFO.
  - Fontes auto-hospedadas (sem Google Fonts), sem analytics e sem script inline.
- **Dependências:** nenhuma nova em runtime. O lockfile já existe. O `npm ci` só roda com autorização.
- **Checks a propor no `verify.sh`** (precisam da sua concordância, CLAUDE.md):
  1. `dist/` sem padrões de chave Groq (`gsk_…`) e token Canvas (`\d+~[A-Za-z0-9]{64}`);
  2. `dist/` sem URL externa em `src=` ou `href=` de recurso (garante a CSP);
  3. orçamento de tamanho de JS e CSS gzip em `dist/`.
  Todos seguem o padrão `check NAME FUNCTION` (`scripts/verify.sh:26-38`) e recebem testes em
  `tests/verify_test.sh`.
- **Fallback no dia, em camadas:**
  1. CLI ao vivo;
  2. vídeo gravado da mesma execução;
  3. JSON capturado renderizado no site;
  4. site servido localmente (`npm run preview`) mais um `dist/` copiado num pendrive, caso falte rede.
  - O site nunca depende de rede no dia.
  - O roteiro tem uma frase pronta para cada falha (Groq com limite de taxa, Canvas fora do ar → o modo
    offline do próprio Glaux, `node.py:80-83`).

### 5.5 Preparação do ambiente (proposta; nada instalado)
- **Dependências novas:** nenhuma. Fontes como arquivos woff2 (licença OFL) em `public/fonts/`, que eu
  baixo **só com autorização de rede**.
- **Estrutura:**
  ```
  index.html                 roteiro (seções 0–10)
  DESIGN.md                  tokens e regras da direção escolhida
  src/main.js                bootstrap e navegação por teclado
  src/content/*.js           agentes, métricas, fluxo, equipe (cada fato com `fonte`)
  src/styles/{tokens,base,sections,motion}.css
  src/motion/{flow.js,reveal.js,cursor.js}
  public/demo/*.json, *.mp4, *.vtt, poster
  public/fonts/*.woff2
  vercel.json                cabeçalhos e CSP
  docs/glaux/plano-fase1.md  este plano
  ```
- **Testes e2e iniciais** (`tests/e2e/`, desktop e celular, que já estão no `playwright.config.js`):
  1. as seções 0 a 10 aparecem na ordem, com um `h2` cada;
  2. a navegação por âncoras e por teclado funciona;
  3. o seletor de ação do orquestrador muda a rota exibida conforme `service.py`;
  4. com `reducedMotion: 'reduce'`, o diagrama aparece completo e sem animação;
  5. o fallback da demo renderiza o JSON quando o vídeo falha;
  6. não há rolagem horizontal em 360 px;
  7. não há erro no console;
  8. a meta de CSP está presente;
  9. o axe WCAG 2.1 AA passa, o que já existe e deve ser mantido.
  - O teste atual do contador e do título "Meu site" será substituído.
- **Deploy:** Vercel (P7), via `vercel.json`. Alternativa sem conta: só local mais o pendrive.

### 5.6 Cronograma

| Quando | Marco verificável |
|---|---|
| 25/11, noite | Respostas recebidas; `npm ci` e `./scripts/verify.sh` como linha de base, com autorização; `DESIGN.md` e tokens; esqueleto das 11 seções com o conteúdo real e as fontes. **Marco: verify.sh passa e o e2e 1 está verde** |
| 26/11, manhã | Diagrama do orquestrador (scroll, seletor, reduced-motion) e cursor. **Marco: e2e 3 e 4 verdes, 60 fps no perfil** |
| 26/11, manhã (time) | O time liga o `node.py` do orquestrador ao grafo e **grava a execução real** da CLI, que vira o JSON e o vídeo de fallback |
| 26/11, tarde | Demo e evidências com os dados capturados; CSP e cabeçalhos; checks novos no verify.sh, se aprovados; revisão de a11y, perf e security. **Marco: `verify.sh --full` verde, LCP < 2,5 s, CLS < 0,1, URL de preview no ar se autorizado** |
| 26/11, noite | Ensaio cronometrado; congelamento do conteúdo; cópia offline do `dist/` |
| 27/11 | Só correções de texto. Apresentação |

**Fica para a Fase 2:** multi-page de produto, i18n, tour interativo, SEO completo e JSON-LD, assets
gerados (Higgsfield/Figma), formulário de interesse (exigiria backend e revisão de privacidade).

### 5.7 Critérios de aceite da Fase 1
1. `./scripts/verify.sh --full` sai com 0: formatação, lint, build, self-tests e Playwright com axe em
   desktop e celular.
2. As 11 seções estão na ordem de §5.1, e cada fato sobre o Glaux tem `fonte` em `src/content/`.
   Nenhuma divergência D1 a D18 aparece no site sem a decisão de P2.
3. O site mostra 4 agentes (Canvas, Tutor, Gerador, Orquestrador) e responde por escrito às duas
   perguntas do `Ent p.1`.
4. O seletor do orquestrador reproduz as 5 rotas de `agente_orquestrador/service.py:87-147`.
5. Com reduced-motion, nada se move e todo o conteúdo fica visível (e2e 4).
6. Lighthouse mobile no build: LCP < 2,5 s, CLS < 0,1, TBT < 200 ms. JS ≤ 25 KB e CSS ≤ 25 KB em gzip.
7. `dist/` sem padrões de chave e sem recursos externos; CSP presente (e2e 8, mais os checks propostos).
8. A demo gravada e o JSON rodam com a rede desligada (`npm run preview` offline).
9. Ensaio completo em ≤ 12 minutos, com o fallback testado pelo menos uma vez.

## Verificação
`./scripts/verify.sh` a cada mudança e `./scripts/verify.sh --full` antes de cada commit. Playwright MCP
para screenshots em 390 e 1440 px. `/perf-audit` no build. Comparação com a linha de base do primeiro
`verify.sh`, para não confundir falha antiga com falha nova.

## Próximo passo (aguarda aprovação do plano)
1. Gravar este plano em `docs/glaux/plano-fase1.md` no sandbox.
2. Rodar `npm ci` e `./scripts/verify.sh`. Registrar a linha de base (o que passa e o que falha) antes de
   mudar qualquer coisa.
3. Parar e mostrar a linha de base. A construção do site (`DESIGN.md` da direção A e o esqueleto) começa
   na próxima rodada, com a sua confirmação da direção A.
Sem commit, push ou deploy até você pedir. Os checks novos no `verify.sh` também esperam o seu "ok"
explícito.

## Decisões do usuário (25/11)
- **P2:** o que "funciona hoje" vem só do código; as promessas da Doc (D5 a D11) vão para "Próximos
  passos". Usar "Groq" e os nomes dos agentes, sem "Agente 1/2".
- **P3:** o ABNT **fica fora do site** na Fase 1. Ele sai da §1.4 de APIs do site (Google Docs/Drive) e
  não aparece em nenhuma seção.
- **P4:** planejar os dois casos.
  - O seletor da §4 sempre mostra as rotas reais de `agente_orquestrador/service.py`, rotuladas como
    "lógica de roteamento".
  - Se o time ligar o nó ao grafo até 26/11, a demo ao vivo inclui o orquestrador e o rótulo vira "em
    execução no grafo".
  - Um flag `orquestradorNoGrafo` em `src/content/fluxo.js` controla esse texto.
- **P7:** deploy na Vercel (só quando o usuário pedir). `npm ci` e o download das fontes estão
  autorizados.

## Perguntas ainda abertas (não bloqueiam o ambiente; bloqueiam o conteúdo final)
- **P1:** integrantes e papéis (Doc p.3 × git: Thigas0 e simplyyn). Até lá, a seção 10 usa a lista da Doc.
- **P5:** permissão para exibir trechos de slides e dados reais na demo. Padrão até a resposta: trechos
  curtos, sem descrição de tarefas nem IDs.
- **P6:** duração da apresentação e quem opera o terminal. Padrão: 10 a 12 minutos.

## Progresso

### 25/11, noite: direção A e checks aprovados
Feito:
- Esqueleto das 11 seções com o conteúdo real.
- Fluxo do orquestrador montado na rolagem, com o simulador das 5 rotas.
- Marca-texto, lente do cursor, barra de progresso e setas ← →.
- Fallback da demo lendo `public/demo/manifest.json`.
- CSP no build e no `vercel.json`.
- 3 checks novos no `verify.sh`, com 7 testes do verificador.
- 13 testes e2e (desktop e celular).
- `DESIGN.md` e `docs/glaux/demo-captura.md`.

Desvios do plano:
- **Fontes dos fatos:** aparecem como citações visíveis no próprio HTML (`[arquivo:linha]`,
  `[Doc, p.N]`), no lugar de `src/content/*.js`. Isso é o conceito da direção A e mantém o LCP em texto
  estático. Em `src/content/` ficam só os dados interativos (as rotas do orquestrador).
- **Tipografia:** Newsreader (títulos) e IBM Plex Mono (citações); texto corrido em `system-ui`. Assim
  ficam só 2 arquivos de fonte.
- **Movimento:** IntersectionObserver com transições CSS. Não usei scroll-driven animations.

Medições:
- build: JS 9,4 KB e CSS 12,1 KB, sem gzip;
- LCP de 272 ms e CLS 0 no preview local, com CPU 4× mais lenta, em 412 px. Não é Lighthouse.

Respostas do usuário (25/11):
- **P1:** ignorar por enquanto. A seção 10 fica com a lista da Doc p.3.
- **P5:** permissão concedida para exibir trechos de slides e dados reais na demo. Tokens e `user_id`
  continuam fora.
- **P6:** a apresentação dura **10 minutos**. Ensaio cronometrado com meta de ≤ 10 min (substitui o
  critério 9 da §5.7).

Pendente:
- Captura da demo pelo time.
- Ligar o `ORQUESTRADOR_NO_GRAFO` quando o nó estiver no grafo.
- Deploy na Vercel, quando o usuário pedir.
