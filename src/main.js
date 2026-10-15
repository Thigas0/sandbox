const botao = document.querySelector('#contador');
let cliques = 0;

botao.addEventListener('click', () => {
  cliques += 1;
  botao.textContent = `Cliques: ${cliques}`;
});
