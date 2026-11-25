// Lista de disciplinas (atalho da barra inferior no celular).
import { el } from '../ui/dom.js';
import { carregando, erro, vazio } from '../ui/estados.js';
import { listaDisciplinas } from './painel.js';

export function render(raiz, _params, ctx) {
  ctx.definirTitulo('Disciplinas');
  const area = el('div');
  raiz.append(
    el(
      'header',
      { class: 'tela__topo' },
      el(
        'div',
        {},
        el('h1', { text: 'Disciplinas' }),
        el('p', { text: 'Escolha uma disciplina para ver o resumo ou praticar.' }),
      ),
    ),
    area,
  );

  async function carregar() {
    area.replaceChildren(carregando('Carregando as disciplinas…'));
    try {
      const disciplinas = await ctx.sessao.fonte.listarDisciplinas();
      area.replaceChildren(
        disciplinas.length
          ? listaDisciplinas(disciplinas)
          : vazio({ titulo: 'Nenhuma disciplina', texto: 'Sincronize com o Canvas no Painel.' }),
      );
    } catch (e) {
      area.replaceChildren(erro({ texto: e.message, aoTentar: carregar }));
    }
  }
  return carregar();
}
