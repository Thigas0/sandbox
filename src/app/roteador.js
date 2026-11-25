// Roteamento por hash: funciona em qualquer hospedagem estática, sem regras de rewrite.
const ROTAS = [
  { nome: 'entrar', padrao: /^\/entrar$/ },
  { nome: 'painel', padrao: /^\/painel$/ },
  { nome: 'disciplinas', padrao: /^\/disciplinas$/ },
  { nome: 'disciplina', padrao: /^\/disciplina\/(\d+)\/(resumo|questoes)$/, params: ['id', 'aba'] },
  { nome: 'pratica', padrao: /^\/pratica$/ },
];

export function rotaAtual() {
  const caminho = decodeURIComponent(location.hash.replace(/^#/, '')) || '/entrar';
  for (const rota of ROTAS) {
    const achou = caminho.match(rota.padrao);
    if (achou) {
      const params = Object.fromEntries((rota.params || []).map((p, i) => [p, achou[i + 1]]));
      return { nome: rota.nome, params };
    }
  }
  return { nome: 'nao-encontrada', params: {} };
}

export function navegar(caminho, { substituir = false } = {}) {
  const alvo = `#${caminho}`;
  if (location.hash === alvo) {
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  } else if (substituir) {
    location.replace(alvo);
  } else {
    location.hash = alvo;
  }
}
