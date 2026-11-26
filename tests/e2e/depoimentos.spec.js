import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';
import { renderDepoimentos, depoimentosAutorizados } from '../../src/lib/depoimentos.js';

const fonte = 'https://www.google.com/maps/search/?api=1&query=Catelle';

test('só entra depoimento com aceite registrado', () => {
  const dados = {
    fonte,
    depoimentos: [
      { autor: 'Mãe A', texto: 'Texto A', aceite: '2026-11-20' },
      { autor: 'Mãe B', texto: 'Texto B', aceite: null },
      { autor: 'Mãe C', texto: 'Texto C' },
      { autor: 'Mãe D', texto: 'Texto D', aceite: 'sim' },
    ],
  };
  expect(depoimentosAutorizados(dados).map((d) => d.autor)).toEqual(['Mãe A']);
  const html = renderDepoimentos(dados);
  expect(html).toContain('Texto A');
  expect(html).not.toContain('Texto B');
  expect(html).not.toContain('Texto C');
  expect(html).not.toContain('Texto D');
});

test('o texto entra literal, inteiro e escapado', () => {
  const texto = 'Minha filha <b>evoluiu</b> muito & aprendeu a ler.\nRecomendo!';
  const html = renderDepoimentos({
    fonte,
    depoimentos: [{ autor: 'Ana "Mãe" Souza', texto, aceite: '2026-11-20' }],
  });
  expect(html).toContain(
    'Minha filha &lt;b&gt;evoluiu&lt;/b&gt; muito &amp; aprendeu a ler.\nRecomendo!',
  );
  expect(html).toContain('Ana &quot;Mãe&quot; Souza');
});

test('a página mostra exatamente os depoimentos autorizados do arquivo', async ({ page }) => {
  const dados = JSON.parse(readFileSync('src/data/depoimentos.json', 'utf8'));
  const autorizados = depoimentosAutorizados(dados);
  await page.goto('/#maes');
  const exibidos = page.getByTestId('depoimento');
  await expect(exibidos).toHaveCount(autorizados.length);
  for (let i = 0; i < autorizados.length; i += 1) {
    await expect(exibidos.nth(i).locator('blockquote')).toHaveText(autorizados[i].texto, {
      useInnerText: false,
    });
    await expect(exibidos.nth(i).locator('.slip-autor')).toHaveText(autorizados[i].autor);
  }
  if (autorizados.length === 0) {
    await expect(page.getByTestId('depoimentos-pendentes')).toBeVisible();
  }
});
