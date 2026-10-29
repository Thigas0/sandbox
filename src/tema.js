// Modo claro e modo escuro. O tema é a escolha guardada neste aparelho ou, sem escolha, o do
// sistema; o script do <head> o aplica antes da primeira pintura. Aqui fica o botão do topo, que
// troca o tema (o novo se abre num círculo a partir dele, como a lente) e guarda a escolha, e a
// escuta do sistema enquanto ninguém escolheu. Sem JavaScript, o site fica no claro e o botão some.
const CHAVE = 'tema';
// A cor da barra do navegador no celular, a mesma do chão da página em cada tema.
const COR_DO_NAVEGADOR = { claro: '#f4efe6', escuro: '#191714' };
const sistemaEscuro = window.matchMedia('(prefers-color-scheme: dark)');
const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)');

const escolhaGuardada = () => {
  try {
    const tema = localStorage.getItem(CHAVE);
    return tema === 'claro' || tema === 'escuro' ? tema : null;
  } catch {
    return null;
  }
};

const guardar = (tema) => {
  try {
    localStorage.setItem(CHAVE, tema);
  } catch {
    // Sem armazenamento (navegação privada em alguns navegadores), a escolha vale até sair.
  }
};

export const temaAtual = () =>
  document.documentElement.dataset.tema === 'escuro' ? 'escuro' : 'claro';

function aplicar(tema, botoes) {
  document.documentElement.dataset.tema = tema;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', COR_DO_NAVEGADOR[tema]);
  for (const botao of botoes) botao.setAttribute('aria-pressed', String(tema === 'escuro'));
  document.dispatchEvent(new CustomEvent('tema', { detail: tema }));
}

// A troca abre o tema novo num círculo que cresce a partir do botão até cobrir a tela. Com movimento
// reduzido, ou num navegador sem transição de página, a troca é imediata.
function trocar(tema, botao, botoes) {
  if (reduzir.matches || !document.startViewTransition) {
    aplicar(tema, botoes);
    return;
  }
  const transicao = document.startViewTransition(() => aplicar(tema, botoes));
  transicao.ready
    .then(() => {
      const caixa = botao.getBoundingClientRect();
      const x = caixa.left + caixa.width / 2;
      const y = caixa.top + caixa.height / 2;
      const raio = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${raio}px at ${x}px ${y}px)`] },
        {
          duration: 700,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          pseudoElement: '::view-transition-new(root)',
        },
      );
    })
    .catch(() => {});
}

export function iniciarTema(raiz = document) {
  const botoes = [...raiz.querySelectorAll('[data-tema-botao]')];
  aplicar(escolhaGuardada() ?? (sistemaEscuro.matches ? 'escuro' : 'claro'), botoes);
  sistemaEscuro.addEventListener('change', (evento) => {
    if (!escolhaGuardada()) aplicar(evento.matches ? 'escuro' : 'claro', botoes);
  });
  for (const botao of botoes) {
    botao.hidden = false;
    botao.addEventListener('click', () => {
      const tema = temaAtual() === 'escuro' ? 'claro' : 'escuro';
      guardar(tema);
      trocar(tema, botao, botoes);
    });
  }
}
