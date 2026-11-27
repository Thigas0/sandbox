import { test, expect } from '@playwright/test';
import { renderDepoimentos } from '../../src/lib/depoimentos.js';

// Dados de pior caso (break-ui). Nada disto vai ao site: o teste injeta o HTML que o build geraria.
const NOME_LONGO = 'Maria-Aparecida-da-Conceição-Albuquerque-Wiśniewska-Kowalczyk-dos-Santos';
const TEXTO_LONGO = `${'Minha filha evoluiu muito na leitura e na escrita. '.repeat(28)}Fim.`;
const SEM_ESPACO = 'Excelente'.repeat(40);

function depoimentos(quantidade) {
  const base = [
    { autor: NOME_LONGO, texto: TEXTO_LONGO },
    { autor: 'Jo', texto: 'Ótima!' },
    { autor: 'Ana', texto: SEM_ESPACO },
    { autor: '李小龍 Lee', texto: '先生はとても親切です。😊👍 Professora incrível!' },
  ];
  return Array.from({ length: quantidade }, (_, i) => ({
    ...base[i % base.length],
    aceite: '2026-11-20',
  }));
}

// No celular emulado a janela se alarga junto com o conteúdo, então a referência é a largura
// configurada do viewport, não window.innerWidth.
async function semRolagemHorizontal(page) {
  const { width } = page.viewportSize();
  const largura = await page.evaluate(() => document.documentElement.scrollWidth);
  return largura <= width;
}

for (const quantidade of [1, 8, 20]) {
  test(`${quantidade} depoimento(s) de pior caso não quebram o layout`, async ({ page }) => {
    await page.goto('/#maes');
    const html = renderDepoimentos({
      fonte: 'https://example.com/',
      depoimentos: depoimentos(quantidade),
    });
    await page.evaluate((conteudo) => {
      const secao = document.querySelector('#maes');
      secao.querySelector('.slips-vazio')?.remove();
      secao.querySelector('.slips')?.remove();
      secao.querySelector('.slips-fonte')?.remove();
      secao.insertAdjacentHTML('beforeend', conteudo);
    }, html);

    await expect(page.getByTestId('depoimento')).toHaveCount(quantidade);
    expect(await semRolagemHorizontal(page)).toBe(true);

    // Nenhum bilhete fica mais largo que a coluna e nenhum texto escapa dele.
    const problemas = await page.$$eval(
      '.slip',
      (bilhetes) =>
        bilhetes.filter((b) => {
          const largo = b.offsetWidth > b.parentElement.clientWidth + 1;
          const vaza = [...b.children].some((c) => c.scrollWidth > c.clientWidth + 1);
          return largo || vaza;
        }).length,
    );
    expect(problemas).toBe(0);
  });
}

test('a prévia da mensagem quebra a linha com um texto longo sem espaços', async ({ page }) => {
  await page.goto('/#conversar');
  await page.getByLabel('Outra').check();
  await page.getByLabel('Qual?').fill('x'.repeat(80));
  const previa = page.locator('[data-previa]');
  await expect(previa).toContainText('x'.repeat(80));
  const { width } = page.viewportSize();
  expect(await previa.evaluate((el) => el.getBoundingClientRect().right)).toBeLessThanOrEqual(
    width,
  );
  expect(await semRolagemHorizontal(page)).toBe(true);
});
