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
// elas, contando o título, que entra em foco). Sem JavaScript, ou com movimento reduzido, a classe
// não entra e nada fica escondido.
export function iniciarEntradas(raiz = document) {
  if (reduzir.matches || !('IntersectionObserver' in window)) return;
  const alvos = [...raiz.querySelectorAll('[data-entrada]')];
  if (!alvos.length) return;
  const ordem = new Map();
  for (const parte of raiz.querySelectorAll('[data-entrada], [data-foco]')) {
    const secao = parte.closest('section') ?? document.body;
    const posicao = ordem.get(secao) ?? 0;
    if (parte.hasAttribute('data-entrada')) {
      parte.style.setProperty('--atraso', `${posicao * 80}ms`);
    }
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

// O visor de Fotos chega mirando, uma vez: as marcas de foco vêm de fora e se fecham no lugar, e o
// ponteiro do fotômetro corre até o zero (o desenho e os tempos estão em style.css).
export function iniciarVisor(raiz = document) {
  if (reduzir.matches || !('IntersectionObserver' in window)) return;
  const visores = [...raiz.querySelectorAll('[data-visor]')];
  if (!visores.length) return;
  const observador = new IntersectionObserver(
    (entradas) => {
      for (const entrada of entradas) {
        if (!entrada.isIntersecting) continue;
        entrada.target.classList.add('mirou');
        observador.unobserve(entrada.target);
      }
    },
    { rootMargin: '0px 0px -15% 0px' },
  );
  document.documentElement.classList.add('visores');
  visores.forEach((visor) => observador.observe(visor));
}

// Foco da lente: os títulos das seções e a frase de Fotos ([data-foco]) aparecem uma vez, quando
// chegam à tela. Cada linha começa desfocada e com as letras afastadas do meio; as letras se
// aproximam e entram em foco do centro para fora, como a lente acertando o foco, e as linhas
// seguem uma depois da outra. Enquanto isso, o leitor de tela lê o texto inteiro numa cópia oculta;
// no fim, o elemento volta a ter só o texto de antes. Sem JavaScript, ou com movimento reduzido, o
// texto já está lá, parado.
const FOCO = {
  duracao: 1000,
  linha: 110, // ms entre uma linha e a seguinte
  bordas: 380, // ms a mais para as letras das pontas da linha, que chegam por último
  afastamento: 0.3, // quanto cada letra começa mais longe do meio da linha, em fração da distância
  desfoque: 0.16, // em fração do tamanho da letra
  segundo: 200, // ms de espera do segundo texto de uma seção (a frase, depois do título)
};

export function iniciarFoco(raiz = document) {
  if (reduzir.matches || !('IntersectionObserver' in window) || !Element.prototype.animate) return;
  const alvos = [...raiz.querySelectorAll('[data-foco]')].filter(
    (alvo) => !alvo.children.length && alvo.textContent.trim(),
  );
  if (!alvos.length) return;
  const esperas = new Map();
  const ordem = new Map();
  for (const alvo of alvos) {
    const secao = alvo.closest('section') ?? document.body;
    const posicao = ordem.get(secao) ?? 0;
    esperas.set(alvo, posicao * FOCO.segundo);
    ordem.set(secao, posicao + 1);
  }

  const focar = (alvo) => {
    const texto = alvo.textContent.trim().replace(/\s+/g, ' ');
    alvo.textContent = texto;
    const base = alvo.getBoundingClientRect();
    const intervalo = document.createRange();
    // Onde cada letra está no texto comum (com o ajuste entre pares de letras da fonte) e em que
    // linha. As letras divididas terminam exatamente ali, e a troca de volta não se vê.
    const letras = [];
    for (let i = 0; i < texto.length; i++) {
      if (texto[i] === ' ') continue;
      intervalo.setStart(alvo.firstChild, i);
      intervalo.setEnd(alvo.firstChild, i + 1);
      const caixa = intervalo.getBoundingClientRect();
      letras.push({
        i,
        esquerda: caixa.left - base.left,
        direita: caixa.right - base.left,
        topo: Math.round(caixa.top),
      });
    }
    const linhas = [];
    for (const letra of letras) {
      if (!linhas.length || letra.topo > linhas.at(-1).topo + 2)
        linhas.push({ topo: letra.topo, letras: [] });
      letra.linha = linhas.length - 1;
      linhas.at(-1).letras.push(letra);
    }

    const oculto = document.createElement('span');
    oculto.className = 'visualmente-oculto';
    oculto.textContent = texto;
    const visivel = document.createElement('span');
    visivel.className = 'foco-linhas';
    visivel.setAttribute('aria-hidden', 'true');
    let anterior = null;
    for (const letra of letras) {
      if (anterior) {
        if (letra.linha !== anterior.linha) visivel.append(document.createElement('br'));
        else if (letra.i > anterior.i + 1) visivel.append(' ');
      }
      letra.caixa = document.createElement('span');
      letra.caixa.className = 'foco-letra';
      letra.caixa.textContent = texto[letra.i];
      visivel.append(letra.caixa);
      anterior = letra;
    }
    alvo.replaceChildren(oculto, visivel);
    alvo.classList.add('focado');

    const desfoque = parseFloat(getComputedStyle(alvo).fontSize) * FOCO.desfoque;
    const espera = esperas.get(alvo);
    const novaBase = alvo.getBoundingClientRect();
    const tela = document.documentElement.clientWidth;
    const animacoes = [];
    for (const linha of linhas) {
      const inicio = linha.letras[0].esquerda;
      const fim = linha.letras.at(-1).direita;
      const meio = (inicio + fim) / 2;
      const metade = Math.max(1, (fim - inicio) / 2);
      // Afastadas, as letras não saem da tela: a linha abre menos se não couber e, se uma ponta
      // passaria da borda, a linha inteira começa um pouco para dentro.
      const abertura = Math.min(FOCO.afastamento, Math.max(0, (tela - 8) / (2 * metade) - 1));
      const esquerda = novaBase.left + inicio - metade * abertura;
      const direita = novaBase.left + fim + metade * abertura;
      const recuo = Math.max(0, 4 - esquerda) + Math.min(0, tela - 4 - direita);
      for (const letra of linha.letras) {
        const ajuste = letra.esquerda - (letra.caixa.getBoundingClientRect().left - novaBase.left);
        const distancia = (letra.esquerda + letra.direita) / 2 - meio;
        const lugar = `translateX(${ajuste.toFixed(2)}px)`;
        const longe = `translateX(${(ajuste + distancia * abertura + recuo).toFixed(2)}px)`;
        animacoes.push(
          letra.caixa.animate(
            [
              { transform: longe, filter: `blur(${desfoque.toFixed(1)}px)`, opacity: 0 },
              { opacity: 1, offset: 0.35 },
              { transform: lugar, filter: 'blur(0px)', opacity: 1 },
            ],
            {
              duration: FOCO.duracao,
              delay:
                espera + letra.linha * FOCO.linha + (Math.abs(distancia) / metade) * FOCO.bordas,
              easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
              fill: 'both',
            },
          ),
        );
      }
    }
    Promise.allSettled(animacoes.map((animacao) => animacao.finished)).then(() => {
      alvo.textContent = texto;
    });
  };

  const observador = new IntersectionObserver(
    (entradas) => {
      for (const entrada of entradas) {
        if (!entrada.isIntersecting) continue;
        observador.unobserve(entrada.target);
        const alvo = entrada.target;
        (document.fonts?.ready ?? Promise.resolve()).then(() => focar(alvo));
      }
    },
    { rootMargin: '0px 0px -10% 0px' },
  );
  document.documentElement.classList.add('foco');
  alvos.forEach((alvo) => observador.observe(alvo));
  reduzir.addEventListener('change', () => {
    if (!reduzir.matches) return;
    observador.disconnect();
    document.documentElement.classList.remove('foco');
  });
}

// O rolo de filme da Cobertura: a seção ganha a altura do caminho do filme e fica presa na tela
// enquanto o filme passa de lado, na mesma medida da rolagem (a rolagem é de quem lê). Com
// movimento reduzido, ou sem JavaScript, o filme fica em pé e inteiro.
export function iniciarFilme(raiz = document) {
  if (reduzir.matches) return;
  const secao = raiz.querySelector('[data-filme]');
  const palco = secao?.querySelector('.cobertura-palco');
  const filme = secao?.querySelector('.filme');
  if (!secao || !palco || !filme) return;
  let percurso = 0;
  let pedido = 0;

  const atualizar = () => {
    pedido = 0;
    const andado = -secao.getBoundingClientRect().top / Math.max(1, percurso);
    const p = Math.min(1, Math.max(0, andado));
    filme.style.transform = `translate3d(${(-p * percurso).toFixed(1)}px, 0, 0)`;
  };
  const agendar = () => {
    if (!pedido) pedido = requestAnimationFrame(atualizar);
  };
  const medir = () => {
    secao.classList.add('rolando');
    percurso = Math.max(0, filme.offsetWidth - palco.clientWidth);
    secao.style.setProperty('--percurso', `${percurso}px`);
    atualizar();
  };
  const desligar = () => {
    window.removeEventListener('scroll', agendar);
    window.removeEventListener('resize', medir);
    secao.classList.remove('rolando');
    secao.style.removeProperty('--percurso');
    filme.style.transform = '';
  };

  medir();
  document.fonts?.ready.then(medir);
  window.addEventListener('load', medir, { once: true });
  window.addEventListener('scroll', agendar, { passive: true });
  window.addEventListener('resize', medir);
  reduzir.addEventListener('change', () => reduzir.matches && desligar());
}

// Quanto cada foto de Trabalho anda a mais (positivo, parece mais perto) ou a menos (negativo,
// parece mais longe) que a página enquanto atravessa a tela, em pixels, na ordem da grade de oito.
const PROFUNDIDADES = [80, -50, 60, 100, -40, 70, -60, 90];

// A revelação: a foto entra clara, lavada e um pouco quente, como o papel quando cai no revelador,
// e ganha contraste e cor até ficar como é ao chegar a 60% da tela. `r` vai de 0 (papel) a 1
// (revelada); a curva suave faz a imagem surgir devagar e assentar devagar.
const revelar = (r) => {
  const s = r * r * (3 - 2 * r);
  if (s >= 1) return '';
  const contraste = 0.35 + 0.65 * s;
  const brilho = 1 + 0.85 * (1 - s);
  return `contrast(${contraste.toFixed(3)}) brightness(${brilho.toFixed(3)}) saturate(${s.toFixed(3)}) sepia(${(0.35 * (1 - s)).toFixed(3)})`;
};

// Fotos ligadas à rolagem, em todo navegador. Cada foto se revela enquanto entra na tela, passeia
// um pouco dentro do paspatur, como vista por uma janela, e fica a uma distância própria da parede
// (em Trabalho, onde a lente do fundo gira como o anel de foco e cresce até quase o dobro; na
// página de privacidade, com um terço do desvio). A rolagem é de quem lê: nada anda sozinho. Com
// movimento reduzido, ou sem JavaScript, as fotos ficam paradas e reveladas.
export function iniciarFotos(raiz = document) {
  if (reduzir.matches) return;
  const fotos = [...raiz.querySelectorAll('[data-revelar] .galeria-foto')].map((figura, i) => {
    const foto = figura.querySelector('.foto');
    return {
      figura,
      img: foto.querySelector('img'),
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
      f.img.style.filter = revelar(limitar((fundo - f.topo) / (tela * 0.6)));
      f.img.style.transform = `translate3d(0, ${((passagem - 0.5) * 9).toFixed(2)}%, 0) scale(1.14)`;
      if (f.profundidade) {
        const desvio = (0.5 - passagem) * f.profundidade * fator;
        f.figura.style.transform = `translate3d(0, ${desvio.toFixed(1)}px, 0)`;
      }
    }
    if (lente) {
      const caixa = parede.getBoundingClientRect();
      const percurso = limitar(-caixa.top / Math.max(1, caixa.height - tela));
      lente.style.setProperty('--giro', `${(percurso * 160).toFixed(1)}deg`);
      lente.style.setProperty('--escala', (0.78 + percurso * 1.12).toFixed(3));
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
      f.img.style.filter = '';
      f.img.style.transform = '';
    }
    lente?.style.removeProperty('--giro');
    lente?.style.removeProperty('--escala');
  };

  medir();
  atualizar();
  document.fonts?.ready.then(remedir);
  window.addEventListener('load', remedir, { once: true });
  window.addEventListener('scroll', agendar, { passive: true });
  window.addEventListener('resize', remedir);
  reduzir.addEventListener('change', () => reduzir.matches && desligar());
}
