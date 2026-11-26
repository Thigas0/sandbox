import { test, expect } from '@playwright/test';

const WA = /^https:\/\/wa\.me\//;

test.beforeEach(async ({ page }) => {
  await page.route(WA, (route) =>
    route.fulfill({ status: 200, contentType: 'text/html', body: '<title>wa</title>' }),
  );
  await page.goto('/#conversar');
});

test('enviar vazio mostra os erros, marca os campos e foca o resumo', async ({ page }) => {
  await page.getByRole('button', { name: 'Abrir conversa no WhatsApp' }).click();
  const resumo = page.getByRole('alert');
  await expect(resumo).toBeVisible();
  await expect(resumo).toBeFocused();
  await expect(resumo.getByRole('listitem')).toHaveCount(4);
  await expect(page.getByLabel('Idade da criança')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#idade-erro')).toHaveText('Informe a idade da criança.');
  await expect(page.getByLabel('Série')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByLabel('Melhor horário')).toHaveAttribute('aria-invalid', 'true');
  expect(page.url()).not.toMatch(WA);
});

test('idade fora da faixa é recusada', async ({ page }) => {
  await page.getByLabel('Idade da criança').fill('40');
  await page.getByRole('button', { name: 'Abrir conversa no WhatsApp' }).click();
  await expect(page.locator('#idade-erro')).toHaveText('Use um número de 3 a 17.');
});

test('dados válidos abrem o link exato do WhatsApp, com acentos e símbolos codificados', async ({
  page,
}) => {
  await page.getByLabel('Idade da criança').fill('7');
  await page.getByLabel('Série').selectOption('2º ano');
  await page.getByLabel('Outra').check();
  await page.getByLabel('Qual?').fill('Troca de letras & #sílabas');
  await page.getByLabel('Melhor horário').selectOption('tarde');

  const texto = [
    'Olá, Professora Cátia! Vim pelo site da Catelle e gostaria de saber sobre o reforço.',
    'Idade: 7 anos',
    'Série: 2º ano',
    'Dificuldade: Outra: Troca de letras & #sílabas',
    'Melhor horário: Tarde',
  ].join('\n');
  await expect(page.locator('[data-previa]')).toHaveText(texto);

  const pedido = page.waitForRequest(WA);
  await page.getByRole('button', { name: 'Abrir conversa no WhatsApp' }).click();
  const url = (await pedido).url();

  expect(url).toBe(`https://wa.me/5519996594138?text=${encodeURIComponent(texto)}`);
  expect(url).toContain('%26%20%23s%C3%ADlabas');
  expect(decodeURIComponent(new URL(url).search.slice('?text='.length))).toBe(texto);
});

test('funciona só com o teclado', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Teclado físico só no desktop.');
  await page.getByLabel('Idade da criança').focus();
  await page.keyboard.type('9');
  await page.keyboard.press('Tab');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Space');
  await page.keyboard.press('Tab');
  await page.keyboard.press('ArrowDown');
  await expect(page.getByLabel('Melhor horário')).not.toHaveValue('');

  const pedido = page.waitForRequest(WA);
  await page.getByRole('button', { name: 'Abrir conversa no WhatsApp' }).focus();
  await page.keyboard.press('Enter');
  expect((await pedido).url()).toContain('Idade%3A%209%20anos');
});

test('o formulário não faz nenhuma requisição além de abrir o WhatsApp', async ({ page }) => {
  const externos = [];
  page.on('request', (req) => {
    const host = new URL(req.url()).host;
    if (host !== 'localhost:4173') externos.push(req.url());
  });
  await page.getByLabel('Idade da criança').fill('6');
  await page.getByLabel('Série').selectOption('1º ano');
  await page.getByRole('radio', { name: 'Alfabetização' }).check();
  await page.getByLabel('Melhor horário').selectOption('manha');
  const pedido = page.waitForRequest(WA);
  await page.getByRole('button', { name: 'Abrir conversa no WhatsApp' }).click();
  await pedido;
  expect(externos.every((u) => WA.test(u))).toBe(true);
  expect(await page.evaluate(() => localStorage.length + sessionStorage.length)).toBe(0);
  expect(await page.context().cookies()).toEqual([]);
});
