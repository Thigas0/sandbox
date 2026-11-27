// Monta a seção de depoimentos no build, a partir de src/data/depoimentos.json.
// Regras: o texto entra exatamente como está no Google (sem cortar, sem resumir), com o nome
// como aparece lá e o link para a ficha. Por decisão do dono do projeto, o aceite por escrito não
// é exigido ("exigirAceite": false no JSON). Com "exigirAceite": true, só aparece quem tem o
// campo "aceite" com a data (AAAA-MM-DD).

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
  const exigirAceite = dados?.exigirAceite !== false;
  return lista.filter(
    (d) =>
      d &&
      typeof d.autor === 'string' &&
      d.autor.trim() !== '' &&
      typeof d.texto === 'string' &&
      d.texto.trim() !== '' &&
      (!exigirAceite || (typeof d.aceite === 'string' && ACEITE.test(d.aceite))),
  );
}

const ESTRELAS = (nota) =>
  Number.isInteger(nota) && nota >= 1 && nota <= 5
    ? `<p class="slip-nota"><span aria-hidden="true">${'★'.repeat(nota)}</span><span class="sr-only">Nota ${nota} de 5</span></p>`
    : '';

// O bilhete acompanha o texto: o longo fica mais largo e com letra de leitura, o curto vira citação grande.
const tamanho = (texto) =>
  texto.length > 200 ? ' slip-longo' : texto.length < 60 ? ' slip-curto' : '';

export function renderDepoimentos(dados) {
  const autorizados = depoimentosAutorizados(dados);
  const fonte = escapeHtml(dados?.fonte ?? '');

  if (autorizados.length === 0) {
    return `<div class="slips-vazio" data-testid="depoimentos-pendentes">
          <p>As palavras das mães entram aqui exatamente como estão no Google.</p>
          <p><a href="${fonte}" rel="noopener" target="_blank">Ler as avaliações no Google<span class="sr-only"> (abre em nova aba)</span></a></p>
        </div>`;
  }

  const itens = autorizados
    .map(
      (d) =>
        `<li class="slip${tamanho(d.texto)}${d.celular === false ? ' slip-so-desktop' : ''}" data-testid="depoimento">
            ${ESTRELAS(d.nota)}
            <blockquote class="slip-texto">${escapeHtml(d.texto)}</blockquote>
            <p class="slip-autor">${escapeHtml(d.autor)}</p>
          </li>`,
    )
    .join('\n          ');

  return `<ul class="slips" role="list">
          ${itens}
        </ul>`;
}
