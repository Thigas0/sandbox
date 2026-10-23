// Busca de eventos. A lista já vem pronta no HTML (funciona sem JavaScript); aqui só filtramos,
// sem diferenciar acentos nem maiúsculas: "sao joao" acha "São João".
export const normalizar = (texto) =>
  texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

const contar = (quantos) => {
  if (quantos === 0) return 'Nenhum evento encontrado.';
  return quantos === 1 ? '1 evento encontrado.' : `${quantos} eventos encontrados.`;
};

export function iniciarBuscaDeEventos(raiz = document) {
  const caixa = raiz.querySelector('[data-busca]');
  const campo = raiz.querySelector('[data-busca-campo]');
  const contagem = raiz.querySelector('[data-busca-contagem]');
  const vazia = raiz.querySelector('[data-busca-vazia]');
  const itens = [...raiz.querySelectorAll('[data-evento]')].map((item) => ({
    item,
    texto: normalizar(item.textContent),
  }));
  if (!caixa || !campo || itens.length === 0) return;
  caixa.hidden = false;

  campo.addEventListener('input', () => {
    const termos = normalizar(campo.value).split(' ').filter(Boolean);
    let visiveis = 0;
    for (const { item, texto } of itens) {
      const aparece = termos.every((termo) => texto.includes(termo));
      item.hidden = !aparece;
      if (aparece) visiveis += 1;
    }
    vazia.hidden = visiveis > 0;
    contagem.textContent = termos.length ? contar(visiveis) : '';
  });
}
