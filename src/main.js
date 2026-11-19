// O que muda a cada visita: o letreiro aceso ou apagado, a taxa do bairro e o peso do hambúrguer.
// Sem este script a página continua completa: o cardápio, os bairros e os horários vêm no HTML.

const DIAS = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
const FUSO = 'America/Sao_Paulo';

function lerDados() {
  const bloco = document.getElementById('dados-loja');
  if (!bloco) return null;
  try {
    return JSON.parse(bloco.textContent);
  } catch {
    return null;
  }
}

// Dia da semana e minutos desde a meia-noite no horário de Serra Negra.
export function agoraEmSerraNegra(data = new Date()) {
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone: FUSO,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(data);
  const valor = (tipo) => partes.find((p) => p.type === tipo)?.value;
  const dia = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(valor('weekday'));
  return { dia, minutos: Number(valor('hour')) * 60 + Number(valor('minute')) };
}

function paraMinutos(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function hora(hhmm) {
  const [h, m] = hhmm.split(':');
  return m === '00' ? `${Number(h)}h` : `${Number(h)}h${m}`;
}

// Diz se o letreiro está aceso agora e o que dizer a quem chega.
export function situacao(horarios, agora) {
  const hoje = horarios[DIAS[agora.dia]];
  if (hoje) {
    const [abre, fecha] = hoje.split('-');
    if (agora.minutos >= paraMinutos(abre) && agora.minutos < paraMinutos(fecha)) {
      return { aceso: true, texto: `Aceso agora: aberto até as ${hora(fecha)}.` };
    }
    if (agora.minutos < paraMinutos(abre)) {
      return { aceso: false, texto: `Apagado agora: acende hoje às ${hora(abre)}.` };
    }
  }
  for (let passo = 1; passo <= 7; passo += 1) {
    const dia = (agora.dia + passo) % 7;
    const prox = horarios[DIAS[dia]];
    if (prox) {
      const quando =
        passo === 1
          ? 'amanhã'
          : `na ${DIAS[dia].replace('terca', 'terça').replace('sabado', 'sábado')}`;
      return {
        aceso: false,
        texto: `Apagado agora: acende ${quando} às ${hora(prox.split('-')[0])}.`,
      };
    }
  }
  return { aceso: false, texto: 'Confira o horário no bsfood.' };
}

function mostrarLetreiro(dados) {
  const status = document.querySelector('[data-status]');
  const monumento = document.querySelector('[data-monumento]');
  if (!status || !dados) return;
  const atualizar = () => {
    const s = situacao(dados.horarios, agoraEmSerraNegra());
    status.textContent = s.texto;
    status.dataset.aceso = String(s.aceso);
    if (monumento) monumento.dataset.aceso = String(s.aceso);
    return s;
  };
  atualizar();
  setInterval(atualizar, 60_000);
}

function reais(centavos) {
  return `R$ ${(centavos / 100).toFixed(2).replace('.', ',')}`;
}

function calcularBairro(dados) {
  const select = document.querySelector('[data-bairro]');
  const saida = document.querySelector('[data-resultado]');
  if (!select || !saida) return;
  const tempo = dados?.entregaMin ?? 50;
  select.addEventListener('change', () => {
    if (!select.value) {
      saida.textContent = 'Taxa de R$ 3,00 a R$ 20,00, conforme o bairro.';
      return;
    }
    const nome = select.selectedOptions[0].textContent;
    const agora = dados ? situacao(dados.horarios, agoraEmSerraNegra()) : null;
    const quando = agora && !agora.aceso ? ' O pedido fica para quando abrir.' : '';
    saida.innerHTML = '';
    const forte = document.createElement('strong');
    forte.textContent = reais(Number(select.value));
    saida.append(`${nome}: taxa de `, forte, `, em cerca de ${tempo} minutos.${quando}`);
  });
}

function trocarPeso() {
  const abas = [...document.querySelectorAll('[role="tab"][data-peso]')];
  const modelo = document.querySelector('template[data-pesos]');
  const foto = document.querySelector('[data-peso-foto]');
  const titulo = document.querySelector('[data-peso-titulo]');
  const desc = document.querySelector('[data-peso-desc]');
  const painel = document.querySelector('[data-painel]');
  if (!abas.length || !modelo || !foto || !titulo || !desc) return;
  const opcoes = new Map(
    [...modelo.content.querySelectorAll('[data-peso]')].map((el) => [el.dataset.peso, el]),
  );

  const escolher = (aba, focar = false) => {
    const dados = opcoes.get(aba.dataset.peso);
    if (!dados) return;
    for (const a of abas) {
      const ativa = a === aba;
      a.setAttribute('aria-selected', String(ativa));
      a.tabIndex = ativa ? 0 : -1;
    }
    painel?.setAttribute('aria-labelledby', aba.id);
    titulo.textContent = dados.dataset.titulo;
    desc.textContent = dados.textContent.replace(/\s+/g, ' ').trim();
    foto.src = dados.dataset.foto;
    foto.alt = dados.dataset.alt;
    if (focar) aba.focus();
  };

  abas.forEach((aba, i) => {
    aba.addEventListener('click', () => escolher(aba));
    aba.addEventListener('keydown', (evento) => {
      const passo = { ArrowRight: 1, ArrowLeft: -1 }[evento.key];
      if (!passo) return;
      evento.preventDefault();
      escolher(abas[(i + passo + abas.length) % abas.length], true);
    });
  });
}

function entradas() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.documentElement.classList.add('movimento');
  const alvos = [...document.querySelectorAll('[data-entra], [data-lista], .cardapio__itens')];
  for (const lista of document.querySelectorAll('[data-lista], .cardapio__itens')) {
    [...lista.children].forEach((item, i) => item.style.setProperty('--ordem', String(i % 8)));
  }
  for (const secao of document.querySelectorAll('main > section')) {
    [...secao.querySelectorAll('[data-entra]')].forEach((el, i) =>
      el.style.setProperty('--ordem', String(i)),
    );
  }
  if (!('IntersectionObserver' in window)) {
    alvos.forEach((el) => el.classList.add('visto'));
    return;
  }
  const observador = new IntersectionObserver(
    (entradasVistas) => {
      for (const entrada of entradasVistas) {
        if (entrada.isIntersecting) {
          entrada.target.classList.add('visto');
          observador.unobserve(entrada.target);
        }
      }
    },
    { rootMargin: '0px 0px -10% 0px' },
  );
  alvos.forEach((el) => observador.observe(el));
}

const dados = lerDados();
mostrarLetreiro(dados);
calcularBairro(dados);
trocarPeso();
entradas();
