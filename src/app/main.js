// Shell do app: escolhe a tela pela rota, mostra a navegação e a faixa de demonstração.
import { navegar, rotaAtual } from './roteador.js';
import { sessao } from './sessao.js';
import { el, limpar } from './ui/dom.js';
import * as entrada from './telas/entrada.js';
import * as painel from './telas/painel.js';
import * as disciplinas from './telas/disciplinas.js';
import * as disciplina from './telas/disciplina.js';
import * as pratica from './telas/pratica.js';

const TELAS = { entrada, painel, disciplinas, disciplina, pratica };
const raiz = document.querySelector('#tela');
const lateral = document.querySelector('[data-lateral]');
const faixa = document.querySelector('[data-faixa-demo]');

let geracao = 0; // descarta renderizações antigas quando a rota muda no meio de um carregamento

function atualizarShell(nomeRota) {
  const ativa = sessao.ativa;
  lateral.hidden = !ativa;
  faixa.hidden = sessao.modo !== 'demo';
  document.body.classList.toggle('com-sessao', ativa);
  document.body.classList.toggle('modo-demo', sessao.modo === 'demo');
  for (const link of lateral.querySelectorAll('[data-nav]')) {
    const atual =
      link.dataset.nav === nomeRota ||
      (nomeRota === 'disciplina' && link.dataset.nav === 'disciplinas');
    if (atual) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
}

async function renderizar() {
  if (!location.hash) {
    navegar('/entrar', { substituir: true });
    return;
  }
  const { nome, params } = rotaAtual();
  if (!sessao.ativa && nome !== 'entrar') {
    navegar('/entrar', { substituir: true });
    return;
  }
  if (sessao.ativa && nome === 'entrar') {
    navegar('/painel', { substituir: true });
    return;
  }
  const minha = ++geracao;
  atualizarShell(nome);
  limpar(raiz);
  const tela = TELAS[nome === 'entrar' ? 'entrada' : nome];
  if (!tela) {
    raiz.append(
      el('h1', { text: 'Página não encontrada' }),
      el('p', {}, el('a', { attrs: { href: '#/painel' }, text: 'Voltar ao painel' })),
    );
    focarTitulo();
    return;
  }
  const ctx = {
    sessao,
    navegar,
    ativa: () => minha === geracao,
    definirTitulo: (titulo) => {
      document.title = `${titulo} · Glaux`;
    },
  };
  // Cada tela monta o título e a moldura de forma síncrona e carrega os dados depois; se a rota
  // mudar no meio, o que ela ainda escrever vai para nós já fora do documento.
  const pronto = tela.render(raiz, params, ctx);
  focarTitulo();
  await pronto;
}

function focarTitulo() {
  const titulo = raiz.querySelector('h1');
  if (!titulo) return;
  titulo.setAttribute('tabindex', '-1');
  titulo.focus({ preventScroll: true });
  window.scrollTo(0, 0);
}

for (const botao of document.querySelectorAll('[data-sair]')) {
  botao.addEventListener('click', async () => {
    await sessao.encerrar();
    navegar('/entrar', { substituir: true });
  });
}

window.addEventListener('hashchange', renderizar);
renderizar();
