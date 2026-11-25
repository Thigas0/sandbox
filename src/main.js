import { iniciarDemo } from './demo.js';
import { iniciarCursor } from './motion/cursor.js';
import { iniciarFluxo } from './motion/fluxo.js';
import { iniciarRevelar } from './motion/revelar.js';

const reduzido = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const secoes = [...document.querySelectorAll('[data-secao]')];

// Barra de progresso de leitura: um transform por quadro, no máximo.
const barra = document.querySelector('.progresso__barra');
let quadro = 0;
function atualizarProgresso() {
  quadro = 0;
  const total = document.documentElement.scrollHeight - window.innerHeight;
  const fracao = total > 0 ? Math.min(1, window.scrollY / total) : 0;
  barra.style.transform = `scaleX(${fracao})`;
}
if (barra) {
  window.addEventListener(
    'scroll',
    () => {
      if (!quadro) quadro = requestAnimationFrame(atualizarProgresso);
    },
    { passive: true },
  );
  atualizarProgresso();
}

// Seção atual: a última cujo topo já passou de 40% da altura da tela.
function indiceAtual() {
  const linha = window.innerHeight * 0.4;
  let atual = 0;
  secoes.forEach((secao, i) => {
    if (secao.getBoundingClientRect().top <= linha) atual = i;
  });
  return atual;
}

// Durante a rolagem suave a posição ainda é a antiga: a próxima seta parte do destino anterior.
let destino = null;
let fimDaRolagem = 0;

function irPara(indice) {
  const alvo = Math.max(0, Math.min(secoes.length - 1, indice));
  const secao = secoes[alvo];
  if (!secao) return;
  destino = alvo;
  clearTimeout(fimDaRolagem);
  fimDaRolagem = setTimeout(() => {
    destino = null;
  }, 900);
  secao.scrollIntoView({ behavior: reduzido() ? 'auto' : 'smooth', block: 'start' });
  history.replaceState(null, '', `#${secao.id}`);
  const titulo = secao.querySelector('h1, h2');
  if (titulo) {
    titulo.setAttribute('tabindex', '-1');
    titulo.focus({ preventScroll: true });
  }
}

// → e ← passam de seção, como num slide. Não interferem em campos de formulário.
document.addEventListener('keydown', (evento) => {
  if (evento.altKey || evento.ctrlKey || evento.metaKey || evento.shiftKey) return;
  if (evento.target.closest('input, textarea, select, [contenteditable], video')) return;
  const base = destino ?? indiceAtual();
  if (evento.key === 'ArrowRight') {
    evento.preventDefault();
    irPara(base + 1);
  } else if (evento.key === 'ArrowLeft') {
    evento.preventDefault();
    irPara(base - 1);
  }
});

iniciarFluxo();
iniciarRevelar();
iniciarCursor();
const demo = document.querySelector('[data-demo]');
if (demo) iniciarDemo(demo);
