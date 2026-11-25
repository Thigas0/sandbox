// Marca-texto: as citações e os trechos marcados ganham o realce quando entram na tela.
// Sem JavaScript, ou com movimento reduzido, o realce já aparece completo.
export function iniciarRevelar(documento = document) {
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const alvos = [...documento.querySelectorAll('.marca, cite.fonte')];
  const observador = new IntersectionObserver(
    (entradas) => {
      for (const entrada of entradas) {
        if (!entrada.isIntersecting) continue;
        entrada.target.classList.remove('pendente');
        observador.unobserve(entrada.target);
      }
    },
    { rootMargin: '0px 0px -10% 0px' },
  );
  for (const alvo of alvos) {
    // Só esconde o que está fora da tela agora, para não apagar o que já está visível.
    if (alvo.getBoundingClientRect().top > window.innerHeight) {
      alvo.classList.add('pendente');
      observador.observe(alvo);
    }
  }
}
