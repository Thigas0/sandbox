// Apoio comum aos testes de navegador.
// - Nenhuma requisição sai de localhost: nada chega de verdade ao WhatsApp, ao Fotto ou a terceiros.
//   Um teste que precisa simular o Fotto registra page.route(), que tem precedência sobre esta trava.
// - Os dados esperados vêm dos mesmos JSON que geram o site.
import { readFileSync } from 'node:fs';
import { test as base, expect } from '@playwright/test';

export const lerDado = (nome) =>
  JSON.parse(readFileSync(new URL(`../../src/dados/${nome}`, import.meta.url), 'utf8'));

export const PAGINAS = ['/', '/privacidade.html'];

export const test = base.extend({
  requisicoesExternas: [
    async ({ context }, use) => {
      const tentativas = [];
      await context.route(/^https?:\/\/(?!localhost[:/]|127\.0\.0\.1[:/])/, (rota) => {
        tentativas.push(rota.request().url());
        return rota.abort();
      });
      await use(tentativas);
      expect(tentativas, 'nenhuma requisição deve sair de localhost').toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };

// Rola a página até o fim, em passos instantâneos (o site usa rolagem suave), para carregar as fotos
// e disparar as entradas; depois volta ao topo e espera toda animação terminar. Medições de contraste
// e capturas devem ver a página parada, não uma seção no meio da entrada.
export async function percorrer(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight / 2) {
      window.scrollTo({ top: y, behavior: 'instant' });
      await new Promise((pronto) => requestAnimationFrame(() => setTimeout(pronto, 40)));
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  // Só as animações que correm no tempo terminam; as ligadas à rolagem acompanham a posição.
  await page.waitForFunction(() =>
    document
      .getAnimations()
      .filter((animacao) => animacao.timeline instanceof DocumentTimeline)
      .every((animacao) => animacao.playState !== 'running'),
  );
}

// Mesmo critério do site: sem acento, minúsculas.
export const normalizar = (texto) =>
  texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

// Ordem em que o build mostra os eventos: do mais recente ao mais antigo.
export const eventosOrdenados = (eventos) =>
  [...eventos].sort(
    (a, b) => b.data.localeCompare(a.data) || a.nome.localeCompare(b.nome, 'pt-BR'),
  );
