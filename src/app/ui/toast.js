// Avisos curtos no canto da tela; a região é aria-live, então leitores de tela também ouvem.
import { el } from './dom.js';

export function toast(texto, { duracaoMs = 3500 } = {}) {
  const regiao = document.querySelector('[data-toasts]');
  if (!regiao) return;
  const aviso = el('p', { class: 'toast', text: texto });
  regiao.append(aviso);
  setTimeout(() => {
    aviso.classList.add('toast--saindo');
    setTimeout(() => aviso.remove(), 300);
  }, duracaoMs);
}
