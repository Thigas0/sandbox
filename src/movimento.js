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

// Quanto cada foto de Trabalho anda a mais (positivo, parece mais perto) ou a menos (negativo,
// parece mais longe) que a página enquanto atravessa a tela, em pixels, na ordem da grade de oito.
const PROFUNDIDADES = [80, -50, 60, 100, -40, 70, -60, 90];

// Fotos ligadas à rolagem, em todo navegador. Cada foto se abre num círculo a partir do seu ponto
// de foco, como a lente da abertura, passeia um pouco dentro do paspatur, como vista por uma
// janela, e fica a uma distância própria da parede (em Trabalho, onde a lente do fundo gira como o
// anel de foco; na página de privacidade, com um terço do desvio). A rolagem é de quem lê: nada
// anda sozinho. Com movimento reduzido, ou sem JavaScript, as fotos ficam paradas e inteiras.
export function iniciarFotos(raiz = document) {
  if (reduzir.matches) return;
  const fotos = [...raiz.querySelectorAll('[data-revelar] .galeria-foto')].map((figura, i) => {
    const foto = figura.querySelector('.foto');
    return {
      figura,
      foto,
      img: figura.querySelector('img'),
      foco: foto.style.getPropertyValue('--foco').trim() || '50% 50%',
      profundidade:
        PROFUNDIDADES[i % PROFUNDIDADES.length] * (figura.closest('[data-galeria]') ? 1 : 0.35),
      topo: 0,
      altura: 0,
    };
  });
  const lente = raiz.querySelector('[data-lente-fundo]');
  const parede = lente?.closest('[data-galeria]');
  if (!fotos.length && !lente) return;
  const limitar = (valor) => Math.min(1, Math.max(0, valor));
  let pedido = 0;

  // Posição de cada foto na página, sem o deslocamento que este script aplica.
  const medir = () => {
    for (const f of fotos) f.figura.style.transform = '';
    for (const f of fotos) {
      const caixa = f.figura.getBoundingClientRect();
      f.topo = caixa.top + window.scrollY;
      f.altura = caixa.height;
    }
  };

  const atualizar = () => {
    pedido = 0;
    const tela = window.innerHeight;
    const fundo = window.scrollY + tela;
    const fator = window.innerWidth < 768 ? 0.5 : 1;
    for (const f of fotos) {
      if (f.topo > fundo + tela || f.topo + f.altura < window.scrollY - tela) continue;
      const passagem = limitar((fundo - f.topo) / (tela + f.altura));
      const abertura = limitar((fundo - f.topo) / (tela * 0.6));
      f.foto.style.clipPath =
        abertura < 1 ? `circle(${(12 + abertura * 130).toFixed(1)}% at ${f.foco})` : '';
      f.img.style.transform = `translate3d(0, ${((passagem - 0.5) * 9).toFixed(2)}%, 0) scale(1.14)`;
      if (f.profundidade) {
        const desvio = (0.5 - passagem) * f.profundidade * fator;
        f.figura.style.transform = `translate3d(0, ${desvio.toFixed(1)}px, 0)`;
      }
    }
    if (lente) {
      const caixa = parede.getBoundingClientRect();
      const percurso = limitar(-caixa.top / Math.max(1, caixa.height - tela));
      lente.style.transform = `rotate(${(percurso * 160).toFixed(1)}deg) scale(${(0.92 + percurso * 0.16).toFixed(3)})`;
    }
  };
  const agendar = () => {
    if (!pedido) pedido = requestAnimationFrame(atualizar);
  };
  const remedir = () => {
    medir();
    agendar();
  };
  const desligar = () => {
    window.removeEventListener('scroll', agendar);
    window.removeEventListener('resize', remedir);
    for (const f of fotos) {
      f.figura.style.transform = '';
      f.foto.style.clipPath = '';
      f.img.style.transform = '';
    }
    if (lente) lente.style.transform = '';
  };

  medir();
  atualizar();
  document.fonts?.ready.then(remedir);
  window.addEventListener('load', remedir, { once: true });
  window.addEventListener('scroll', agendar, { passive: true });
  window.addEventListener('resize', remedir);
  reduzir.addEventListener('change', () => reduzir.matches && desligar());
}
