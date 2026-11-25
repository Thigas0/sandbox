// Os estados que toda tela mostra: carregando, vazio, erro e sem_material. "Sucesso" é o conteúdo.
import { el } from './dom.js';

export function carregando(texto = 'Carregando…') {
  return el(
    'div',
    { class: 'estado estado--carregando', attrs: { role: 'status' } },
    el('span', { class: 'estado__indicador', attrs: { 'aria-hidden': 'true' } }),
    el('p', { text: texto }),
  );
}

export function vazio({ titulo, texto, acao }) {
  return el(
    'div',
    { class: 'estado estado--vazio' },
    el('p', { class: 'estado__titulo', text: titulo }),
    texto ? el('p', { text: texto }) : null,
    acao || null,
  );
}

export function erro({ titulo = 'Algo deu errado.', texto, aoTentar }) {
  return el(
    'div',
    { class: 'estado estado--erro', attrs: { role: 'alert' } },
    el('p', { class: 'estado__titulo', text: titulo }),
    texto ? el('p', { text: texto }) : null,
    aoTentar
      ? el('button', {
          class: 'botao botao--fantasma botao--pequeno',
          attrs: { type: 'button' },
          text: 'Tentar de novo',
          on: { click: aoTentar },
        })
      : null,
  );
}

/** O Gerador (ou o Tutor) disse que o material não sustenta o pedido: mostra a mensagem real. */
export function semMaterial({ titulo = 'Sem material suficiente', texto }) {
  return el(
    'div',
    { class: 'estado estado--sem-material', attrs: { role: 'status' } },
    el('p', { class: 'estado__titulo', text: titulo }),
    el('p', { class: 'estado__mensagem', text: texto }),
  );
}
