// Renderizador restrito do markdown do Tutor: títulos (#), listas (- ou *), parágrafos, **negrito**
// e citações [arquivo, p.X-Y]. Monta o DOM nó a nó: nenhum HTML do texto é interpretado.
import { el, paginas } from './dom.js';

const CITACAO = /(\[[^\]\n]+?,\s*p\.\s?\d+(?:\s?[-–]\s?\d+)?\])/;
const PARTES = /^\[(.+?),\s*p\.\s?(\d+)(?:\s?[-–]\s?(\d+))?\]$/;

let contador = 0;

function citacao(textoCitacao, fontes) {
  const [, arquivo, ini, fim] = textoCitacao.match(PARTES) || [];
  if (!arquivo) return document.createTextNode(textoCitacao);
  const pagina = Number(ini);
  const paginaFim = Number(fim || ini);
  const conferida = fontes.some(
    (f) => f.arquivo === arquivo && f.pagina <= pagina && paginaFim <= f.pagina_fim,
  );
  const id = `citacao-${++contador}`;
  const botao = el('button', {
    class: 'citacao',
    text: textoCitacao,
    attrs: {
      type: 'button',
      'aria-expanded': 'false',
      'aria-controls': id,
    },
  });
  botao.addEventListener('click', () => {
    const bloco = botao.closest('p, li');
    const existente = document.getElementById(id);
    if (existente) {
      existente.remove();
      botao.setAttribute('aria-expanded', 'false');
      return;
    }
    bloco.append(
      el(
        'span',
        { class: 'citacao-painel', attrs: { id } },
        'Fonte: ',
        el('strong', { text: arquivo }),
        `, ${paginas(pagina, paginaFim)}.`,
        conferida ? ' Está entre os trechos usados pelo Tutor.' : '',
      ),
    );
    botao.setAttribute('aria-expanded', 'true');
  });
  return botao;
}

function linha(texto, fontes) {
  const nos = [];
  for (const parte of texto.split(CITACAO)) {
    if (!parte) continue;
    if (CITACAO.test(parte)) {
      nos.push(citacao(parte, fontes));
      continue;
    }
    parte.split('**').forEach((trecho, i) => {
      if (trecho)
        nos.push(i % 2 ? el('strong', { text: trecho }) : document.createTextNode(trecho));
    });
  }
  return nos;
}

/**
 * @param {string} markdown summary_text do Tutor
 * @param {Array<{arquivo, pagina, pagina_fim}>} fontes sources_used
 * @returns {DocumentFragment}
 */
export function renderizarMarkdown(markdown, fontes = []) {
  const saida = document.createDocumentFragment();
  let lista = null;
  for (const bruta of String(markdown || '').split('\n')) {
    const texto = bruta.trim();
    if (!texto) {
      lista = null;
      continue;
    }
    if (texto.startsWith('#')) {
      lista = null;
      saida.append(el('h3', {}, linha(texto.replace(/^#+\s*/, ''), fontes)));
    } else if (/^[-*]\s+/.test(texto)) {
      if (!lista) {
        lista = el('ul');
        saida.append(lista);
      }
      lista.append(el('li', {}, linha(texto.replace(/^[-*]\s+/, ''), fontes)));
    } else {
      lista = null;
      saida.append(el('p', {}, linha(texto, fontes)));
    }
  }
  return saida;
}
