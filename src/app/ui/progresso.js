// Progresso por agente (Canvas → Tutor → Gerador) e a rota escolhida pelo Orquestrador.
import { NOMES } from '../../content/orquestrador.js';
import { el } from './dom.js';

const AGENTES = ['canvas_agent', 'tutor_agent', 'question_generator_agent'];
const ROTULOS = {
  fila: 'na fila',
  fora: 'fora da rota',
  rodando: 'rodando',
  concluido: 'concluído',
};

export function criarProgresso() {
  const linhas = {};
  const lista = el('ol', { class: 'agentes' });
  for (const id of AGENTES) {
    const estado = el('span', { class: 'agente__estado', text: ROTULOS.fila });
    const item = el(
      'li',
      { class: 'agente', attrs: { 'data-agente': id, 'data-estado': 'fila' } },
      el('span', { class: 'agente__ponto', attrs: { 'aria-hidden': 'true' } }),
      el('span', { class: 'agente__nome', text: NOMES[id] }),
      estado,
    );
    linhas[id] = { item, estado };
    lista.append(item);
  }
  const rota = el('p', { class: 'rota', attrs: { 'data-rota': '' } });
  const no = el(
    'div',
    {
      class: 'progresso-agentes',
      attrs: { role: 'status', 'aria-label': 'Progresso dos agentes' },
    },
    el('p', { class: 'progresso-agentes__titulo', text: 'Orquestrador' }),
    lista,
    rota,
  );

  function marcar(id, estado) {
    const linha = linhas[id];
    if (!linha) return;
    linha.item.dataset.estado = estado;
    linha.estado.textContent = ROTULOS[estado];
  }

  return {
    no,
    /** Recebe os eventos de aoProgresso do contrato de dados. */
    atualizar(evento) {
      if (evento.tipo === 'plano') {
        const naRota = new Set(evento.plano.steps);
        AGENTES.forEach((id) => marcar(id, naRota.has(id) ? 'fila' : 'fora'));
        rota.replaceChildren(
          el('strong', {
            text: `Rota: ${evento.plano.steps.map((s) => NOMES[s] || s).join(' → ')}`,
          }),
          el('span', { text: ` · ${evento.plano.reason}` }),
        );
      } else if (evento.tipo === 'agente') {
        marcar(evento.agente, evento.estado);
      }
    },
  };
}
