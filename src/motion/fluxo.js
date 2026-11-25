// Seção 4: o diagrama se monta conforme os passos cruzam o meio da tela, e o simulador
// mostra a rota que o Orquestrador escolheria para cada ação.
import { NOMES, ORQUESTRADOR_NO_GRAFO, planejar } from '../content/orquestrador.js';

const LEGENDAS = {
  0: 'Role a página para montar o fluxo.',
  1: 'Passo 1: o pedido chega ao Orquestrador.',
  2: 'Passo 2: o Orquestrador escolhe a rota.',
  3: 'Passo 3: os agentes rodam em sequência.',
  4: 'Passo 4: todos leem e escrevem no estado compartilhado.',
  5: 'Rota simulada: os agentes fora da rota ficam apagados.',
};

function marcarPasso(figura, n) {
  figura.classList.add('montando');
  for (let i = 1; i <= 4; i += 1) figura.classList.toggle(`ate-${i}`, i <= n);
  figura.classList.toggle('simulando', n >= 5);
  const legenda = figura.querySelector('.fluxo__legenda');
  if (legenda) legenda.textContent = LEGENDAS[n] ?? LEGENDAS[4];
}

function aplicarRota(figura, saida, form) {
  const dados = new FormData(form);
  const { passos, motivo } = planejar({
    acao: dados.get('acao'),
    dadosLocais: dados.has('dadosLocais'),
    resumoNoEstado: dados.has('resumoNoEstado'),
    forcarSync: dados.has('forcarSync'),
  });
  const naRota = new Set(passos);
  for (const no of figura.querySelectorAll('[data-no]')) {
    const id = no.dataset.no;
    if (id in NOMES) no.classList.toggle('fora-da-rota', !naRota.has(id));
  }
  for (const aresta of figura.querySelectorAll('[data-para]')) {
    aresta.classList.toggle('fora-da-rota', !naRota.has(aresta.dataset.para));
  }
  const [canvasTutor, tutorGerador] = figura.querySelectorAll('.aresta.p3');
  canvasTutor?.classList.toggle(
    'fora-da-rota',
    !(naRota.has('canvas_agent') && naRota.has('tutor_agent')),
  );
  tutorGerador?.classList.toggle(
    'fora-da-rota',
    !(naRota.has('tutor_agent') && naRota.has('question_generator_agent')),
  );
  saida.rota.textContent = passos.map((p) => NOMES[p]).join(' → ');
  saida.motivo.textContent = motivo;
}

export function iniciarFluxo(documento = document) {
  const estado = documento.querySelector('[data-estado-orquestrador]');
  if (estado) {
    estado.textContent = ORQUESTRADOR_NO_GRAFO
      ? 'No código: em execução no grafo.'
      : 'No código: a lógica de roteamento está pronta no branch orquestrador e está sendo ligada ao grafo. Hoje, main roda Canvas → Tutor → Gerador em sequência fixa.';
  }
  if (ORQUESTRADOR_NO_GRAFO) documento.querySelector('[data-roadmap-orquestrador]')?.remove();

  const figura = documento.querySelector('[data-fluxo]');
  if (!figura) return;

  const form = documento.querySelector('[data-simulador]');
  const saida = {
    rota: documento.querySelector('[data-rota]'),
    motivo: documento.querySelector('[data-motivo]'),
  };
  if (form && saida.rota && saida.motivo) {
    aplicarRota(figura, saida, form);
    form.addEventListener('change', () => {
      aplicarRota(figura, saida, form);
      marcarPasso(figura, 5);
    });
  }

  // Com movimento reduzido (ou sem IntersectionObserver) o diagrama fica sempre completo.
  const passos = [...documento.querySelectorAll('.passo[data-passo]')];
  const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduzido || !('IntersectionObserver' in window) || !passos.length) return;

  // Sem JavaScript o diagrama fica completo. Só o escondemos se ele estiver fora da tela agora,
  // para não haver piscada.
  const visivel = figura.getBoundingClientRect().top < window.innerHeight;
  marcarPasso(figura, visivel ? 4 : 0);

  const observador = new IntersectionObserver(
    (entradas) => {
      for (const entrada of entradas) {
        if (entrada.isIntersecting) marcarPasso(figura, Number(entrada.target.dataset.passo));
      }
    },
    { rootMargin: '-45% 0px -45% 0px' },
  );
  passos.forEach((p) => observador.observe(p));
}
