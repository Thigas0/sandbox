// Movimento da página. Com prefers-reduced-motion, nada anima e todo o conteúdo fica visível.
const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)');

// A lente do logo em relação à caixa da imagem (public/marca/pdl-logo-escuro.svg): o centro e o
// raio por dentro do anel mais grosso, que esconde a borda da foto.
const LENTE = { x: 0.5071, y: 0.4988, raio: 0.169 };

// A lente do D: a foto de capa aparece na lente do logo e se abre com a rolagem até cobrir a tela.
// A rolagem é de quem lê: nada anda sozinho.
export function iniciarLente(raiz = document) {
  const cena = raiz.querySelector('[data-cena]');
  const lente = raiz.querySelector('[data-lente]');
  const logo = raiz.querySelector('[data-logo]');
  if (!cena || !lente || !logo) return;
  let pedido = 0;

  const atualizar = () => {
    pedido = 0;
    const d = logo.getBoundingClientRect();
    const palco = lente.getBoundingClientRect();
    const percurso = cena.offsetHeight - window.innerHeight;
    const progresso =
      reduzir.matches || percurso <= 0
        ? 0
        : Math.min(1, Math.max(0, -cena.getBoundingClientRect().top / percurso));
    const raio = d.height * LENTE.raio;
    const maximo = Math.hypot(palco.width, palco.height);
    cena.style.setProperty('--p', progresso.toFixed(3));
    lente.style.setProperty('--x', `${(d.left - palco.left + d.width * LENTE.x).toFixed(1)}px`);
    lente.style.setProperty('--y', `${(d.top - palco.top + d.height * LENTE.y).toFixed(1)}px`);
    lente.style.setProperty('--r', `${(raio + progresso * (maximo - raio)).toFixed(1)}px`);
  };
  const agendar = () => {
    if (!pedido) pedido = requestAnimationFrame(atualizar);
  };

  atualizar();
  if (!logo.complete) logo.addEventListener('load', atualizar, { once: true });
  window.addEventListener('scroll', agendar, { passive: true });
  window.addEventListener('resize', agendar);
  reduzir.addEventListener('change', agendar);
}

// Entradas: as partes de cada seção sobem uma vez ao aparecer, em ordem de leitura (80 ms entre
// elas). Sem JavaScript, ou com movimento reduzido, a classe não entra e nada fica escondido.
export function iniciarEntradas(raiz = document) {
  if (reduzir.matches || !('IntersectionObserver' in window)) return;
  const alvos = [...raiz.querySelectorAll('[data-entrada]')];
  if (!alvos.length) return;
  const ordem = new Map();
  for (const alvo of alvos) {
    const secao = alvo.closest('section') ?? document.body;
    const posicao = ordem.get(secao) ?? 0;
    alvo.style.setProperty('--atraso', `${posicao * 80}ms`);
    ordem.set(secao, posicao + 1);
  }
  const observador = new IntersectionObserver(
    (entradas) => {
      for (const entrada of entradas) {
        if (!entrada.isIntersecting) continue;
        entrada.target.classList.add('entrou');
        observador.unobserve(entrada.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px' },
  );
  document.documentElement.classList.add('entradas');
  alvos.forEach((alvo) => observador.observe(alvo));
}
