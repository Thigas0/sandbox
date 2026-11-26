// Monta a seção de depoimentos no build, a partir de src/data/depoimentos.json.
// Regras: o texto entra exatamente como está no Google (sem cortar, sem resumir) e só aparece
// o depoimento cuja autora deu o aceite por escrito (campo "aceite" com a data, AAAA-MM-DD).

const ACEITE = /^\d{4}-\d{2}-\d{2}$/;

export function escapeHtml(valor) {
  return String(valor)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function depoimentosAutorizados(dados) {
  const lista = Array.isArray(dados?.depoimentos) ? dados.depoimentos : [];
  return lista.filter(
    (d) =>
      d &&
      typeof d.autor === 'string' &&
      d.autor.trim() !== '' &&
      typeof d.texto === 'string' &&
      d.texto.trim() !== '' &&
      typeof d.aceite === 'string' &&
      ACEITE.test(d.aceite),
  );
}

export function renderDepoimentos(dados) {
  const autorizados = depoimentosAutorizados(dados);
  const fonte = escapeHtml(dados?.fonte ?? '');

  if (autorizados.length === 0) {
    return `<div class="slips-vazio" data-testid="depoimentos-pendentes">
          <p>As palavras das mães entram aqui exatamente como estão no Google, assim que cada uma autorizar.</p>
          <p><a href="${fonte}" rel="noopener" target="_blank">Ler as avaliações no Google<span class="sr-only"> (abre em nova aba)</span></a></p>
        </div>`;
  }

  const itens = autorizados
    .map(
      (d) => `<li class="slip" data-testid="depoimento">
            <blockquote class="slip-texto">${escapeHtml(d.texto)}</blockquote>
            <p class="slip-autor">${escapeHtml(d.autor)}</p>
          </li>`,
    )
    .join('\n          ');

  return `<ul class="slips" role="list">
          ${itens}
        </ul>
        <p class="slips-fonte"><a href="${fonte}" rel="noopener" target="_blank">Ver todas as avaliações no Google<span class="sr-only"> (abre em nova aba)</span></a></p>`;
}
