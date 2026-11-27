import { validar, montarMensagem, montarLink } from './lib/whatsapp.js';

const reduzMovimento = window.matchMedia('(prefers-reduced-motion: reduce)');
const ponteiroFino = window.matchMedia('(hover: hover) and (pointer: fine)');

/* ---------- Formulário → WhatsApp ---------- */

const ROTULOS = {
  idade: 'Idade da criança',
  serie: 'Série',
  dificuldade: 'Dificuldade principal',
  outra: 'Qual dificuldade',
  horario: 'Melhor horário',
};

const ALVO_FOCO = {
  idade: 'idade',
  serie: 'serie',
  dificuldade: 'dif-alfabetizacao',
  outra: 'outra',
  horario: 'horario',
};

function iniciarFormulario(form) {
  const previa = document.querySelector('[data-previa]');
  const caixaErros = form.querySelector('[data-erros]');
  const listaErros = form.querySelector('[data-erros-lista]');
  const campoOutra = form.querySelector('[data-outra]');
  const fallback = form.querySelector('[data-fallback]');
  const fallbackLink = form.querySelector('[data-fallback-link]');
  let tentouEnviar = false;

  const ler = () => {
    const dados = Object.fromEntries(new FormData(form));
    if (dados.dificuldade !== 'outra') delete dados.outra;
    return dados;
  };

  const marcarErros = (erros) => {
    for (const campo of Object.keys(ROTULOS)) {
      const mensagem = erros[campo];
      const elErro = form.querySelector(`#${campo}-erro`);
      const controles =
        campo === 'dificuldade'
          ? form.querySelectorAll('input[name="dificuldade"]')
          : form.querySelectorAll(`[name="${campo}"]`);
      if (elErro) {
        elErro.textContent = mensagem ?? '';
        elErro.hidden = !mensagem;
      }
      controles.forEach((c) => {
        if (mensagem) c.setAttribute('aria-invalid', 'true');
        else c.removeAttribute('aria-invalid');
      });
    }
  };

  const mostrarResumo = (erros) => {
    listaErros.replaceChildren(
      ...Object.entries(erros).map(([campo, mensagem]) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#${ALVO_FOCO[campo]}`;
        a.textContent = `${ROTULOS[campo]}: ${mensagem}`;
        a.addEventListener('click', (evento) => {
          evento.preventDefault();
          document.getElementById(ALVO_FOCO[campo])?.focus();
        });
        li.append(a);
        return li;
      }),
    );
    caixaErros.hidden = Object.keys(erros).length === 0;
  };

  const atualizar = () => {
    const dados = ler();
    campoOutra.hidden = dados.dificuldade !== 'outra';
    const mensagem = montarMensagem(dados);
    if (previa.textContent !== mensagem) {
      previa.textContent = mensagem;
      piscar(previa.closest('.previa'));
    }
    if (tentouEnviar) {
      const erros = validar(dados);
      marcarErros(erros);
      mostrarResumo(erros);
    }
  };

  form.addEventListener('input', atualizar);
  form.addEventListener('change', atualizar);

  form.addEventListener('submit', (evento) => {
    evento.preventDefault();
    tentouEnviar = true;
    const dados = ler();
    const erros = validar(dados);
    marcarErros(erros);
    mostrarResumo(erros);

    if (Object.keys(erros).length > 0) {
      caixaErros.focus();
      return;
    }

    const link = montarLink(dados);
    fallbackLink.href = link;
    fallback.hidden = false;
    window.location.assign(link);
  });

  atualizar();
}

/* ---------- Troca lenta das fotos do hero ("luz da tarde") ---------- */

function iniciarCrossfade(palco) {
  if (reduzMovimento.matches) return;
  const molde = palco.querySelector('template[data-crossfade-extra]');
  if (!molde) return;
  const imagens = [palco.querySelector('.hero-img')];

  // As outras fotos só são baixadas depois que a página carregou, para não disputar com o LCP.
  const carregar = () => {
    for (const img of molde.content.querySelectorAll('img')) {
      const copia = document.importNode(img, true);
      copia.decoding = 'async';
      copia.fetchPriority = 'low';
      palco.append(copia);
      imagens.push(copia);
    }
  };

  let atual = 0;
  let timer = 0;
  let visivel = true;

  const proxima = () => {
    const prontas = imagens.filter((img) => img.complete && img.naturalWidth > 0);
    if (prontas.length > 1) {
      const indice = (prontas.indexOf(imagens[atual]) + 1) % prontas.length;
      imagens[atual].classList.remove('is-ativa');
      atual = imagens.indexOf(prontas[indice]);
      imagens[atual].classList.add('is-ativa');
    }
    agendar();
  };

  const agendar = () => {
    clearTimeout(timer);
    if (visivel && !document.hidden && !reduzMovimento.matches) {
      timer = setTimeout(proxima, 5600);
    }
  };

  new IntersectionObserver(([entrada]) => {
    visivel = entrada.isIntersecting;
    agendar();
  }).observe(palco);

  document.addEventListener('visibilitychange', agendar);
  reduzMovimento.addEventListener('change', agendar);

  // Espera a página assentar: a primeira troca só acontece depois de 5,6 s, então não há pressa.
  const adiar = () => setTimeout(carregar, 2500);
  if (document.readyState === 'complete') adiar();
  else window.addEventListener('load', adiar, { once: true });
  agendar();
}

/* ---------- Bilhetes que se inclinam sob o cursor (só com mouse) ---------- */

function iniciarInclinacao() {
  if (!ponteiroFino.matches || reduzMovimento.matches) return;
  const MAX = 3;

  for (const bilhete of document.querySelectorAll('.slip')) {
    let quadro = 0;
    bilhete.addEventListener('pointermove', (evento) => {
      cancelAnimationFrame(quadro);
      quadro = requestAnimationFrame(() => {
        const r = bilhete.getBoundingClientRect();
        const x = (evento.clientX - r.left) / r.width - 0.5;
        const y = (evento.clientY - r.top) / r.height - 0.5;
        bilhete.style.setProperty('--ix', `${(-y * MAX * 2).toFixed(2)}deg`);
        bilhete.style.setProperty('--iy', `${(x * MAX * 2).toFixed(2)}deg`);
      });
    });
    bilhete.addEventListener('pointerleave', () => {
      cancelAnimationFrame(quadro);
      bilhete.style.setProperty('--ix', '0deg');
      bilhete.style.setProperty('--iy', '0deg');
    });
  }
}

/* ---------- Entrada das seções onde não há animation-timeline ---------- */

function iniciarRevelaFallback() {
  if (reduzMovimento.matches || CSS.supports('animation-timeline: view()')) return;
  const alvos = [...document.querySelectorAll('.revela')];
  if (!('IntersectionObserver' in window) || alvos.length === 0) return;

  const grupos = new Map();
  for (const el of alvos) {
    const secao = el.closest('section') ?? document.body;
    const n = grupos.get(secao) ?? 0;
    el.style.setProperty('--atraso', `${Math.min(n, 4) * 80}ms`);
    grupos.set(secao, n + 1);
  }

  const observador = new IntersectionObserver(
    (entradas) => {
      for (const entrada of entradas) {
        if (entrada.isIntersecting) {
          entrada.target.classList.add('is-dentro');
          observador.unobserve(entrada.target);
        }
      }
    },
    { rootMargin: '0px 0px -10% 0px' },
  );

  document.documentElement.classList.add('js-revela');
  alvos.forEach((el) => observador.observe(el));
}

/* ---------- Brilho curto quando a prévia muda ---------- */

function piscar(el) {
  if (!el || reduzMovimento.matches) return;
  el.classList.remove('is-atualizada');
  void el.offsetWidth; // reinicia a animação
  el.classList.add('is-atualizada');
}

/* ---------- Botões magnéticos (só com mouse) ---------- */

function iniciarMagnetismo() {
  if (!ponteiroFino.matches || reduzMovimento.matches) return;
  const ALCANCE = 6;
  for (const botao of document.querySelectorAll('.botao')) {
    let quadro = 0;
    botao.addEventListener('pointermove', (evento) => {
      cancelAnimationFrame(quadro);
      quadro = requestAnimationFrame(() => {
        const r = botao.getBoundingClientRect();
        const x = ((evento.clientX - r.left) / r.width - 0.5) * 2;
        const y = ((evento.clientY - r.top) / r.height - 0.5) * 2;
        botao.style.translate = `${(x * ALCANCE).toFixed(1)}px ${(y * ALCANCE * 0.6).toFixed(1)}px`;
      });
    });
    botao.addEventListener('pointerleave', () => {
      cancelAnimationFrame(quadro);
      botao.style.translate = '';
    });
  }
}

const form = document.querySelector('[data-form-whatsapp]');
if (form) iniciarFormulario(form);

const palco = document.querySelector('[data-crossfade]');
if (palco) iniciarCrossfade(palco);

iniciarInclinacao();
iniciarRevelaFallback();
iniciarMagnetismo();
