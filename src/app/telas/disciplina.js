// Disciplina: abas Resumo (markdown com citações clicáveis) e Questões (tema e quantidade).
import { MENSAGENS, TETO_QUESTOES } from '../dados/contrato.js';
import { el } from '../ui/dom.js';
import { carregando, erro, semMaterial, vazio } from '../ui/estados.js';
import { renderizarMarkdown } from '../ui/markdown.js';
import { criarProgresso } from '../ui/progresso.js';

const TIPO = { multipla_escolha: 'Múltipla escolha', dissertativa: 'Dissertativa' };

function campoTema({ id, temas, obrigatorio, rotulo, ajuda }) {
  const listaId = `${id}-sugestoes`;
  const entrada = el('input', {
    class: 'campo__entrada',
    attrs: {
      id,
      name: 'tema',
      type: 'text',
      list: listaId,
      required: obrigatorio,
      autocomplete: 'off',
      'aria-describedby': `${id}-ajuda`,
    },
  });
  return {
    entrada,
    no: el(
      'div',
      { class: 'campo' },
      el('label', { class: 'campo__rotulo', attrs: { for: id }, text: rotulo }),
      entrada,
      el(
        'datalist',
        { attrs: { id: listaId } },
        temas.map((t) => el('option', { attrs: { value: t } })),
      ),
      el('p', {
        class: 'campo__ajuda',
        attrs: { id: `${id}-ajuda` },
        text: temas.length ? `${ajuda} Sugestões: ${temas.join(', ')}.` : ajuda,
      }),
    ),
  };
}

function abaResumo(area, d, ctx) {
  const tema = campoTema({
    id: 'tema-resumo',
    temas: d.temas || [],
    obrigatorio: false,
    rotulo: 'Tema (opcional)',
    ajuda: 'Deixe em branco para a visão geral da disciplina.',
  });
  const gerar = el('button', { class: 'botao', attrs: { type: 'submit' }, text: 'Gerar resumo' });
  const saida = el('div');
  const form = el('form', { class: 'formulario-tema campos-linha' }, tema.no, gerar);
  form.classList.add('campos-linha--dois');
  area.replaceChildren(form, saida);

  async function gerarResumo() {
    const progresso = criarProgresso();
    saida.replaceChildren(progresso.no, carregando('O Tutor está lendo o material…'));
    gerar.setAttribute('aria-busy', 'true');
    try {
      const { resumo } = await ctx.sessao.fonte.resumo(d.id, tema.entrada.value.trim() || null, {
        aoProgresso: progresso.atualizar,
      });
      let conteudo;
      if (resumo.topic_title === 'Matéria não indexada') {
        conteudo = vazio({ titulo: resumo.topic_title, texto: resumo.summary_text });
      } else if (resumo.summary_text.trim() === MENSAGENS.recusaTutor) {
        conteudo = semMaterial({ titulo: resumo.topic_title, texto: resumo.summary_text });
      } else {
        conteudo = el(
          'article',
          { class: 'resumo', attrs: { 'aria-labelledby': 'titulo-resumo' } },
          el('h2', { attrs: { id: 'titulo-resumo' }, text: resumo.topic_title }),
          renderizarMarkdown(resumo.summary_text, resumo.sources_used),
        );
      }
      saida.replaceChildren(progresso.no, conteudo);
    } catch (e) {
      saida.replaceChildren(erro({ texto: e.message, aoTentar: gerarResumo }));
    } finally {
      gerar.removeAttribute('aria-busy');
    }
  }

  form.addEventListener('submit', (evento) => {
    evento.preventDefault();
    gerarResumo();
  });
  return gerarResumo();
}

function abaQuestoes(area, d, ctx) {
  const tema = campoTema({
    id: 'tema-questoes',
    temas: d.temas || [],
    obrigatorio: true,
    rotulo: 'Tema',
    ajuda: 'Escreva o tema como nas aulas.',
  });
  const quantidade = el('input', {
    class: 'campo__entrada',
    attrs: {
      id: 'quantidade',
      name: 'quantidade',
      type: 'number',
      min: 1,
      max: TETO_QUESTOES,
      value: 3,
      required: true,
    },
  });
  const gerar = el('button', { class: 'botao', attrs: { type: 'submit' }, text: 'Gerar questões' });
  const saida = el('div');
  const form = el(
    'form',
    { class: 'formulario-tema campos-linha', attrs: { novalidate: true } },
    tema.no,
    el(
      'div',
      { class: 'campo' },
      el('label', { class: 'campo__rotulo', attrs: { for: 'quantidade' }, text: 'Quantidade' }),
      quantidade,
      el('p', { class: 'campo__ajuda', text: `De 1 a ${TETO_QUESTOES}.` }),
    ),
    gerar,
  );
  area.replaceChildren(form, saida);
  saida.append(
    vazio({
      titulo: 'Nenhuma questão ainda',
      texto: 'Escolha um tema e a quantidade para o Gerador criar as questões.',
    }),
  );

  async function gerarQuestoes() {
    const t = tema.entrada.value.trim();
    const n = Number(quantidade.value);
    if (!t) {
      saida.replaceChildren(
        erro({ titulo: 'Falta o tema', texto: 'Escreva um tema para gerar as questões.' }),
      );
      tema.entrada.focus();
      return;
    }
    if (!Number.isInteger(n) || n < 1 || n > TETO_QUESTOES) {
      saida.replaceChildren(
        erro({
          titulo: 'Quantidade inválida',
          texto: `Escolha um número de 1 a ${TETO_QUESTOES}.`,
        }),
      );
      quantidade.focus();
      return;
    }
    const progresso = criarProgresso();
    saida.replaceChildren(progresso.no, carregando('O Gerador está criando as questões…'));
    gerar.setAttribute('aria-busy', 'true');
    try {
      const { resultado } = await ctx.sessao.fonte.gerarQuestoes(d.id, t, n, {
        aoProgresso: progresso.atualizar,
      });
      if (resultado.status === 'sem_material') {
        saida.replaceChildren(progresso.no, semMaterial({ texto: resultado.mensagem }));
        return;
      }
      if (resultado.status === 'erro') {
        saida.replaceChildren(
          progresso.no,
          erro({
            titulo: 'O Gerador não conseguiu',
            texto: resultado.mensagem,
            aoTentar: gerarQuestoes,
          }),
        );
        return;
      }
      const praticar = el('button', {
        class: 'botao',
        attrs: { type: 'button' },
        text: 'Praticar estas questões',
        on: {
          click: () => {
            ctx.sessao.definirPratica({
              cursoId: d.id,
              disciplina: d.name,
              tema: t,
              questoes: resultado.questoes,
            });
            ctx.navegar('/pratica');
          },
        },
      });
      saida.replaceChildren(
        progresso.no,
        el('h2', {
          class: 'questoes__titulo',
          text: `${resultado.questoes.length} questões sobre ${t}`,
        }),
        el(
          'ol',
          { class: 'lista-questoes' },
          resultado.questoes.map((q) =>
            el('li', {}, el('span', { class: 'tipo', text: TIPO[q.tipo] }), q.enunciado),
          ),
        ),
        praticar,
      );
    } catch (e) {
      saida.replaceChildren(erro({ texto: e.message, aoTentar: gerarQuestoes }));
    } finally {
      gerar.removeAttribute('aria-busy');
    }
  }

  form.addEventListener('submit', (evento) => {
    evento.preventDefault();
    gerarQuestoes();
  });
}

export function render(raiz, { id, aba }, ctx) {
  const titulo = el('h1', { text: 'Disciplina' });
  const area = el('div');
  const linkAba = (nome, rotulo) =>
    el('a', {
      text: rotulo,
      attrs: { href: `#/disciplina/${id}/${nome}`, 'aria-current': aba === nome ? 'page' : false },
    });
  raiz.append(
    el('a', { class: 'voltar', attrs: { href: '#/disciplinas' }, text: '← Disciplinas' }),
    titulo,
    el(
      'nav',
      { class: 'abas', attrs: { 'aria-label': 'Seções da disciplina' } },
      linkAba('resumo', 'Resumo'),
      linkAba('questoes', 'Questões'),
    ),
    area,
  );
  ctx.definirTitulo(aba === 'resumo' ? 'Resumo' : 'Questões');

  async function carregar() {
    area.replaceChildren(carregando('Carregando a disciplina…'));
    try {
      const disciplinas = await ctx.sessao.fonte.listarDisciplinas();
      const d = disciplinas.find((x) => String(x.id) === id);
      if (!d) {
        area.replaceChildren(
          vazio({ titulo: 'Disciplina não encontrada', texto: 'Volte à lista e escolha outra.' }),
        );
        return;
      }
      titulo.textContent = d.name;
      ctx.definirTitulo(`${aba === 'resumo' ? 'Resumo' : 'Questões'} · ${d.name}`);
      return aba === 'resumo' ? abaResumo(area, d, ctx) : abaQuestoes(area, d, ctx);
    } catch (e) {
      area.replaceChildren(erro({ texto: e.message, aoTentar: carregar }));
    }
  }
  return carregar();
}
