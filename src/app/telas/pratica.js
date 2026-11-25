// Prática: uma questão por vez. Múltipla escolha com correção local imediata e o trecho de
// referência; dissertativa com campo de resposta (a correção automática está no roadmap).
import { el, paginas } from '../ui/dom.js';
import { vazio } from '../ui/estados.js';

function referencia(ref) {
  return el(
    'blockquote',
    { class: 'referencia' },
    el('cite', { text: `${ref.arquivo}, ${paginas(ref.pagina, ref.pagina_fim)}` }),
    el('p', { text: ref.texto }),
  );
}

export function render(raiz, _params, ctx) {
  ctx.definirTitulo('Prática');
  const pratica = ctx.sessao.pratica;
  const titulo = el('h1', { text: 'Prática' });
  const area = el('div', { class: 'pratica' });
  raiz.append(titulo, area);

  if (!pratica || !pratica.questoes.length) {
    area.append(
      vazio({
        titulo: 'Nenhuma questão para praticar',
        texto: 'Gere questões em uma disciplina e volte aqui.',
        acao: el('a', {
          class: 'botao botao--pequeno',
          attrs: { href: '#/disciplinas' },
          text: 'Escolher disciplina',
        }),
      }),
    );
    return;
  }

  titulo.textContent = `Prática · ${pratica.tema}`;
  const respostas = new Map(); // id → {correta: boolean} (só múltipla escolha)
  let indice = 0;

  function mostrar() {
    const q = pratica.questoes[indice];
    const total = pratica.questoes.length;
    const corpo = [];
    corpo.push(
      el('p', {
        class: 'pratica__contador',
        text: `Questão ${indice + 1} de ${total} · ${pratica.disciplina}`,
      }),
      el('p', { class: 'pratica__enunciado', attrs: { id: 'enunciado' }, text: q.enunciado }),
    );
    const feedback = el('div', { attrs: { 'aria-live': 'polite' } });

    if (q.tipo === 'multipla_escolha') {
      const opcoes = Object.entries(q.alternativas).map(([letra, texto]) => {
        const entrada = el('input', {
          attrs: { type: 'radio', name: `alt-${q.id}`, value: letra },
        });
        const rotulo = el(
          'label',
          { class: 'alternativa', attrs: { 'data-letra': letra } },
          entrada,
          `${letra}) ${texto}`,
        );
        return { letra, entrada, rotulo };
      });
      const responder = el('button', {
        class: 'botao',
        attrs: { type: 'submit' },
        text: 'Responder',
      });
      const form = el(
        'form',
        {},
        el(
          'fieldset',
          { class: 'alternativas', attrs: { 'aria-labelledby': 'enunciado' } },
          opcoes.map((o) => o.rotulo),
        ),
        feedback,
        responder,
      );
      form.addEventListener('submit', (evento) => {
        evento.preventDefault();
        const escolhida = opcoes.find((o) => o.entrada.checked);
        if (!escolhida) {
          feedback.replaceChildren(
            el('p', { class: 'nota-app', text: 'Escolha uma alternativa antes de responder.' }),
          );
          return;
        }
        const acertou = escolhida.letra === q.correta;
        respostas.set(q.id, { correta: acertou });
        for (const o of opcoes) {
          o.entrada.disabled = true;
          if (o.letra === q.correta) o.rotulo.dataset.resultado = 'correta';
          else if (o === escolhida) o.rotulo.dataset.resultado = 'errada';
        }
        feedback.replaceChildren(
          el(
            'div',
            { class: 'feedback', attrs: { 'data-resultado': acertou ? 'correta' : 'errada' } },
            el('p', { class: 'feedback__titulo', text: acertou ? 'Correta' : 'Incorreta' }),
            el('p', {
              text: acertou
                ? `A resposta é ${q.correta}.`
                : `A resposta correta é ${q.correta}) ${q.alternativas[q.correta]}.`,
            }),
            referencia(q.trecho_referencia),
          ),
        );
        responder.remove();
        form.append(navegacao());
      });
      corpo.push(form);
    } else {
      const resposta = el('textarea', {
        class: 'campo__entrada',
        attrs: { id: `resposta-${q.id}`, rows: 6 },
      });
      const verRef = el('button', {
        class: 'botao botao--fantasma',
        attrs: { type: 'button', 'aria-expanded': 'false' },
        text: 'Ver referência',
      });
      verRef.addEventListener('click', () => {
        feedback.replaceChildren(referencia(q.trecho_referencia));
        verRef.setAttribute('aria-expanded', 'true');
        verRef.disabled = true;
      });
      corpo.push(
        el('p', { class: 'selo-breve', text: 'Correção automática em breve' }),
        el(
          'div',
          { class: 'campo' },
          el('label', {
            class: 'campo__rotulo',
            attrs: { for: `resposta-${q.id}` },
            text: 'Sua resposta',
          }),
          resposta,
          el('p', {
            class: 'campo__ajuda',
            text: 'A correção das dissertativas está no roadmap. Compare sua resposta com o trecho da aula.',
          }),
        ),
        feedback,
        el('div', { class: 'acoes' }, verRef, navegacao()),
      );
    }
    area.replaceChildren(...corpo);
  }

  function navegacao() {
    const ultima = indice === pratica.questoes.length - 1;
    return el('button', {
      class: 'botao botao--fantasma',
      attrs: { type: 'button' },
      text: ultima ? 'Ver resultado' : 'Próxima questão',
      on: {
        click: () => {
          if (ultima) final();
          else {
            indice += 1;
            mostrar();
          }
          titulo.focus({ preventScroll: true });
        },
      },
    });
  }

  function final() {
    const objetivas = pratica.questoes.filter((q) => q.tipo === 'multipla_escolha');
    const acertos = [...respostas.values()].filter((r) => r.correta).length;
    area.replaceChildren(
      el('p', { class: 'placar', text: `${acertos}/${objetivas.length}` }),
      el('p', { text: 'acertos nas questões de múltipla escolha.' }),
      el(
        'div',
        { class: 'acoes' },
        el('button', {
          class: 'botao',
          attrs: { type: 'button' },
          text: 'Praticar de novo',
          on: {
            click: () => {
              respostas.clear();
              indice = 0;
              mostrar();
            },
          },
        }),
        el('a', {
          class: 'botao botao--fantasma',
          attrs: { href: `#/disciplina/${pratica.cursoId}/questoes` },
          text: 'Gerar outras questões',
        }),
      ),
    );
  }

  mostrar();
}
