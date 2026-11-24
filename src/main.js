// Casa do Anfitrião: comportamentos pequenos e progressivos. Sem este script, a página funciona inteira.

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// Horário da casa, no fuso de Itapira. Minutos desde a meia-noite: [abre, fecha].
const HOURS = {
  ter: [720, 1140],
  qua: [720, 1140],
  qui: [720, 1140],
  sex: [720, 1140],
  sáb: [540, 1080],
};

export function openStatus(date = new Date()) {
  const parts = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(date);
  const get = (type) => parts.find((p) => p.type === type)?.value ?? '';
  const day = get('weekday').slice(0, 3).toLowerCase();
  const minutes = Number(get('hour')) * 60 + Number(get('minute'));
  const today = HOURS[day];
  if (today && minutes >= today[0] && minutes < today[1]) {
    return `Aberto agora, até as ${today[1] / 60}h`;
  }
  return 'Fechado agora. Abrimos de terça a sábado';
}

function showOpenStatus() {
  const el = document.querySelector('[data-open-status]');
  if (el) el.textContent = openStatus();
}

// Defasagem das barras do toldo.
function staggerAwning() {
  document.querySelectorAll('.hero-card .awning span').forEach((bar, i) => {
    bar.style.setProperty('--i', String(i));
  });
}

// Entradas das seções: só quando o navegador não tem view timelines no CSS.
function revealFallback() {
  if (CSS.supports('animation-timeline: view()') || reduceMotion.matches) return;
  if (!('IntersectionObserver' in window)) return;
  const items = document.querySelectorAll('.reveal');
  document.documentElement.classList.add('js-reveal');
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        }
      }
    },
    { rootMargin: '0px 0px -10% 0px' },
  );
  items.forEach((item, i) => {
    item.style.setProperty('--i', String(i % 4));
    observer.observe(item);
  });
}

// Parallax sutil da pintura do hero, só com mouse e sem reduced-motion.
function cursorParallax() {
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const img = document.querySelector('[data-parallax]');
  const frame = img?.closest('figure');
  if (!img || !frame || !fine.matches || reduceMotion.matches) return;
  let frameRequest = 0;
  frame.addEventListener('pointermove', (event) => {
    cancelAnimationFrame(frameRequest);
    frameRequest = requestAnimationFrame(() => {
      const box = frame.getBoundingClientRect();
      const x = ((event.clientX - box.left) / box.width - 0.5) * -16;
      const y = ((event.clientY - box.top) / box.height - 0.5) * -16;
      img.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(1.03)`;
    });
  });
  frame.addEventListener('pointerleave', () => {
    cancelAnimationFrame(frameRequest);
    img.style.transform = '';
  });
}

showOpenStatus();
staggerAwning();
revealFallback();
cursorParallax();
