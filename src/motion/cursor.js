// Lente de leitura sobre o diagrama: só com mouse (ponteiro fino) e sem movimento reduzido.
// É decoração; nada depende dela.
export function iniciarCursor(documento = document) {
  const figura = documento.querySelector('[data-fluxo]');
  if (!figura) return;
  const fino = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!fino.matches || reduzido.matches) return;

  const lente = documento.createElement('span');
  lente.className = 'lente';
  lente.setAttribute('aria-hidden', 'true');
  figura.append(lente);

  let quadro = 0;
  let x = 0;
  let y = 0;
  figura.addEventListener('pointermove', (evento) => {
    const caixa = figura.getBoundingClientRect();
    x = evento.clientX - caixa.left;
    y = evento.clientY - caixa.top;
    if (quadro) return;
    quadro = requestAnimationFrame(() => {
      lente.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      quadro = 0;
    });
  });
  figura.addEventListener('pointerenter', () => lente.classList.add('ativa'));
  figura.addEventListener('pointerleave', () => lente.classList.remove('ativa'));
}
