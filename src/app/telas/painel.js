// Painel: próximas entregas por prioridade, disciplinas e "Sincronizar" com a rota do Orquestrador.
import { PRIORIDADES } from '../dados/contrato.js';
import { el, prazo } from '../ui/dom.js';
import { carregando, erro, vazio } from '../ui/estados.js';
import { criarProgresso } from '../ui/progresso.js';
import { toast } from '../ui/toast.js';

const ROTULO_GRUPO = {
  ALTA: 'Alta prioridade',
  MÉDIA: 'Média prioridade',
  BAIXA: 'Baixa prioridade',
};

function cartaoTarefa(t) {
  return el(
    'li',
    { class: 'tarefa', attrs: { 'data-prioridade': t.priority_level } },
    el('span', {
      class: `prioridade prioridade--${t.priority_level.toLowerCase()}`,
      text: t.priority_level,
    }),
    el('p', { class: 'tarefa__titulo', text: t.title }),
    el('p', { class: 'tarefa__meta', text: `${t.course_name} · ${prazo(t.days_remaining)}` }),
    el('p', { class: 'tarefa__acao', text: t.action_recommendation }),
  );
}

export function listaDisciplinas(disciplinas) {
  return el(
    'ul',
    { class: 'disciplinas-lista', attrs: { role: 'list' } },
    disciplinas.map((d) =>
      el(
        'li',
        {},
        el('a', {
          class: 'disciplina-link',
          attrs: { href: `#/disciplina/${d.id}/resumo` },
          text: d.name,
        }),
      ),
    ),
  );
}

export function render(raiz, _params, ctx) {
  ctx.definirTitulo('Painel');
  const { fonte } = ctx.sessao;

  const areaSync = el('div', { class: 'sincronizar' });
  const botaoSync = el('button', {
    class: 'botao',
    attrs: { type: 'button' },
    text: 'Sincronizar',
  });
  const areaTarefas = el('div');
  const areaDisciplinas = el('div');

  raiz.append(
    el(
      'header',
      { class: 'tela__topo' },
      el(
        'div',
        {},
        el('h1', { text: 'Painel' }),
        el('p', { text: 'Suas próximas entregas e disciplinas, organizadas pelo Tutor.' }),
      ),
      botaoSync,
    ),
    areaSync,
    el(
      'div',
      { class: 'painel-grade' },
      el(
        'section',
        { class: 'bloco', attrs: { 'aria-labelledby': 'titulo-entregas' } },
        el('h2', { attrs: { id: 'titulo-entregas' }, text: 'Próximas entregas' }),
        areaTarefas,
      ),
      el(
        'section',
        { class: 'bloco', attrs: { 'aria-labelledby': 'titulo-disciplinas' } },
        el('h2', { attrs: { id: 'titulo-disciplinas' }, text: 'Disciplinas' }),
        areaDisciplinas,
      ),
    ),
  );

  async function carregarTarefas() {
    areaTarefas.replaceChildren(carregando('Carregando o cronograma…'));
    try {
      const tarefas = await fonte.cronograma();
      if (!tarefas.length) {
        areaTarefas.replaceChildren(
          vazio({
            titulo: 'Nenhuma entrega pendente',
            texto: 'Quando houver tarefas no Canvas, elas aparecem aqui.',
          }),
        );
        return;
      }
      areaTarefas.replaceChildren(
        ...PRIORIDADES.map((p) => {
          const doGrupo = tarefas.filter((t) => t.priority_level === p);
          if (!doGrupo.length) return null;
          return el(
            'div',
            { class: 'grupo-prioridade' },
            el('h3', { text: ROTULO_GRUPO[p] }),
            el('ul', { class: 'tarefas', attrs: { role: 'list' } }, doGrupo.map(cartaoTarefa)),
          );
        }).filter(Boolean),
      );
    } catch (e) {
      areaTarefas.replaceChildren(erro({ texto: e.message, aoTentar: carregarTarefas }));
    }
  }

  async function carregarDisciplinas() {
    areaDisciplinas.replaceChildren(carregando('Carregando as disciplinas…'));
    try {
      const disciplinas = await fonte.listarDisciplinas();
      areaDisciplinas.replaceChildren(
        disciplinas.length
          ? listaDisciplinas(disciplinas)
          : vazio({
              titulo: 'Nenhuma disciplina',
              texto: 'Sincronize com o Canvas para trazer suas disciplinas.',
            }),
      );
    } catch (e) {
      areaDisciplinas.replaceChildren(erro({ texto: e.message, aoTentar: carregarDisciplinas }));
    }
  }

  botaoSync.addEventListener('click', async () => {
    const progresso = criarProgresso();
    areaSync.replaceChildren(progresso.no);
    botaoSync.setAttribute('aria-busy', 'true');
    botaoSync.disabled = true;
    try {
      const { disciplinas } = await fonte.sincronizar({ aoProgresso: progresso.atualizar });
      toast(`Sincronização concluída: ${disciplinas.length} disciplina(s).`);
      if (ctx.ativa()) await Promise.all([carregarTarefas(), carregarDisciplinas()]);
    } catch (e) {
      areaSync.replaceChildren(erro({ titulo: 'Não foi possível sincronizar', texto: e.message }));
    } finally {
      botaoSync.removeAttribute('aria-busy');
      botaoSync.disabled = false;
    }
  });

  return Promise.all([carregarTarefas(), carregarDisciplinas()]);
}
