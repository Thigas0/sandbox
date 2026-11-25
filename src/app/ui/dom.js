// Criação de DOM sem innerHTML: todo texto entra por textContent ou por nós de texto.

/**
 * el('p', {class: 'x', text: 'oi', attrs: {id: 'a'}, on: {click}}, filho1, 'texto', ...)
 */
export function el(tag, props = {}, ...filhos) {
  const no = document.createElement(tag);
  const { class: classe, text, attrs, on, ...resto } = props;
  if (classe) no.className = classe;
  if (text !== undefined && text !== null) no.textContent = String(text);
  for (const [nome, valor] of Object.entries(attrs || {})) {
    if (valor === false || valor === null || valor === undefined) continue;
    no.setAttribute(nome, valor === true ? '' : String(valor));
  }
  for (const [evento, fn] of Object.entries(on || {})) no.addEventListener(evento, fn);
  Object.assign(no, resto);
  anexar(no, filhos);
  return no;
}

export function anexar(no, filhos) {
  for (const f of filhos.flat()) {
    if (f === null || f === undefined || f === false) continue;
    no.append(f instanceof Node ? f : document.createTextNode(String(f)));
  }
  return no;
}

export function limpar(no) {
  no.replaceChildren();
  return no;
}

/** "p. 3" ou "p. 3–5", como o Gerador mostra (src/agente_gerador/apresentacao.py:34-36). */
export function paginas(inicio, fim) {
  return inicio === fim ? `p. ${inicio}` : `p. ${inicio}–${fim}`;
}

/** "em 1 dia", "em 4 dias", "hoje", "sem prazo". */
export function prazo(dias) {
  if (dias === null || dias === undefined) return 'sem prazo';
  if (dias === 0) return 'vence hoje';
  return dias === 1 ? 'em 1 dia' : `em ${dias} dias`;
}
