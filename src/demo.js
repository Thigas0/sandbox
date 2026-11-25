// Fallback da demonstração: mostra a execução gravada da CLI do Glaux.
// public/demo/manifest.json diz quais arquivos existem, para nunca pedir um arquivo ausente.
// Os JSON seguem o formato que src/graph.py grava em data/processed/ (tutor_output.json e
// questoes_output.json), já sanitizados (ver docs/glaux/demo-captura.md).
// Todo texto entra por textContent: nada vindo do JSON vira HTML.

const CITACAO = /(\[[^\]]+,\s*p\.\d+(?:-\d+)?\])/;

function el(tag, classe, texto) {
  const no = document.createElement(tag);
  if (classe) no.className = classe;
  if (texto !== undefined && texto !== null) no.textContent = String(texto);
  return no;
}

// Uma linha do resumo: **negrito** e citações [arquivo, p.X-Y] viram elementos, o resto é texto.
function linhaComCitacoes(linha) {
  const p = el('p');
  for (const parte of linha.split(CITACAO)) {
    if (!parte) continue;
    if (CITACAO.test(parte)) {
      p.append(el('cite', 'fonte', parte));
      continue;
    }
    parte.split(/\*\*/).forEach((trecho, i) => {
      if (trecho) p.append(i % 2 ? el('strong', null, trecho) : document.createTextNode(trecho));
    });
  }
  return p;
}

function renderizarTutor(dados, destino) {
  const tarefas = (dados.assignments || []).slice(0, 3);
  if (tarefas.length) {
    const bloco = el('div', 'demo__bloco');
    bloco.append(el('h3', null, 'Cronograma'));
    const lista = el('ul', 'demo__tarefas');
    for (const t of tarefas) {
      const item = el('li');
      item.append(
        el(
          'span',
          `prioridade prioridade--${String(t.priority_level).toLowerCase()}`,
          t.priority_level,
        ),
      );
      item.append(el('span', 'demo__tarefa', t.title));
      const dias =
        t.days_remaining === null || t.days_remaining === undefined
          ? 'sem prazo'
          : `${t.days_remaining} dia(s)`;
      item.append(el('span', 'demo__dias', dias));
      lista.append(item);
    }
    bloco.append(lista);
    destino.append(bloco);
  }
  const resumo = (dados.summaries || [])[0];
  if (resumo) {
    const bloco = el('div', 'demo__bloco demo__resumo');
    bloco.append(el('h3', null, resumo.topic_title || 'Resumo'));
    for (const bruta of String(resumo.summary_text || '').split('\n')) {
      const linha = bruta.trim();
      if (!linha) continue;
      if (linha.startsWith('#')) bloco.append(el('h4', null, linha.replace(/^#+\s*/, '')));
      else bloco.append(linhaComCitacoes(linha.replace(/^[-*]\s+/, '')));
    }
    destino.append(bloco);
  }
}

function renderizarQuestoes(dados, destino) {
  const bloco = el('div', 'demo__bloco');
  bloco.append(el('h3', null, dados.tema ? `Questões: ${dados.tema}` : 'Questões'));
  const questoes = dados.generated_questions || [];
  if (!questoes.length) {
    bloco.append(el('p', 'demo__estado', dados.generation_message || 'Nenhuma questão gerada.'));
    destino.append(bloco);
    return;
  }
  const lista = el('ol', 'demo__questoes');
  for (const q of questoes) {
    const item = el('li');
    item.append(el('p', 'demo__enunciado', q.enunciado));
    if (q.alternativas) {
      const alts = el('ul', 'demo__alternativas');
      for (const [letra, texto] of Object.entries(q.alternativas)) {
        const alt = el('li', letra === q.correta ? 'correta' : null, `${letra}) ${texto}`);
        if (letra === q.correta) alt.append(el('span', 'sr-only', ' (correta)'));
        alts.append(alt);
      }
      item.append(alts);
    }
    const ref = q.trecho_referencia;
    if (ref) {
      const paginas =
        ref.pagina === ref.pagina_fim ? ref.pagina : `${ref.pagina}-${ref.pagina_fim}`;
      item.append(el('cite', 'fonte', `[${ref.arquivo}, p.${paginas}]`));
    }
    lista.append(item);
  }
  bloco.append(lista);
  destino.append(bloco);
}

async function buscarJson(caminho) {
  const resposta = await fetch(caminho, { cache: 'no-store' });
  if (!resposta.ok) throw new Error(`${caminho}: ${resposta.status}`);
  return resposta.json();
}

export async function iniciarDemo(raiz) {
  const estado = raiz.querySelector('[data-demo-estado]');
  let manifesto;
  try {
    manifesto = await buscarJson('/demo/manifest.json');
  } catch {
    estado.textContent = 'Não foi possível carregar a execução gravada.';
    return;
  }
  const { video, tutor, questoes, capturadoEm } = manifesto;
  if (!video && !tutor && !questoes) {
    estado.textContent =
      'Execução gravada ainda não capturada. A demonstração é feita ao vivo no terminal.';
    return;
  }
  estado.textContent = capturadoEm ? `Execução gravada em ${capturadoEm}.` : 'Execução gravada.';
  if (video) {
    const v = el('video', 'demo__video');
    v.controls = true;
    v.preload = 'none';
    v.playsInline = true;
    v.src = `/demo/${video}`;
    if (manifesto.poster) v.poster = `/demo/${manifesto.poster}`;
    raiz.append(v);
  }
  try {
    if (tutor) renderizarTutor(await buscarJson(`/demo/${tutor}`), raiz);
    if (questoes) renderizarQuestoes(await buscarJson(`/demo/${questoes}`), raiz);
  } catch {
    raiz.append(el('p', 'demo__estado', 'Parte da execução gravada não pôde ser lida.'));
  }
}
