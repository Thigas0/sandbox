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

// Cardápio em abas: mostra uma categoria por vez. Sem script, todas ficam visíveis.
function abasDoCardapio() {
  const abas = [...document.querySelectorAll('[data-aba]')];
  const grupos = [...document.querySelectorAll('[data-cardapio] > .cardapio__grupo')];
  if (!abas.length || !grupos.length) return;

  const mostrar = (id) => {
    for (const grupo of grupos) grupo.hidden = grupo.id !== id;
    for (const aba of abas) {
      if (aba.dataset.aba === id) aba.setAttribute('aria-current', 'true');
      else aba.removeAttribute('aria-current');
    }
  };

  for (const aba of abas) {
    aba.addEventListener('click', (evento) => {
      evento.preventDefault();
      mostrar(aba.dataset.aba);
      aba.scrollIntoView({ block: 'nearest', inline: 'center' });
      const cardapio = document.getElementById('cardapio');
      if (cardapio && cardapio.getBoundingClientRect().top < 0) {
        cardapio.scrollIntoView({ block: 'start' });
      }
    });
  }

  const inicial = grupos.find((g) => `#${g.id}` === location.hash)?.id ?? grupos[0].id;
  mostrar(inicial);
}

function entradas() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const alvos = [...document.querySelectorAll('[data-entra]')];
  if (!alvos.length || !('IntersectionObserver' in window)) return;
  document.documentElement.classList.add('movimento');
  alvos.forEach((el, i) => el.style.setProperty('--ordem', String(i % 4)));
  const observador = new IntersectionObserver(
    (vistas) => {
      for (const v of vistas) {
        if (v.isIntersecting) {
          v.target.classList.add('visto');
          observador.unobserve(v.target);
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
abasDoCardapio();
entradas();
