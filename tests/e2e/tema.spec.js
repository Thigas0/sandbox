import { test, expect } from './apoio.js';

// Modo claro e modo escuro: o site segue o sistema até alguém escolher no botão do topo; a escolha
// fica neste aparelho e vale nas outras páginas. Sem JavaScript, o site fica no claro.
const CLARO = 'rgb(244, 239, 230)';
const ESCURO = 'rgb(25, 23, 20)';
const fundo = (page) => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
const botaoDoTema = (page) => page.getByRole('button', { name: 'Modo escuro' });

test('com o sistema no escuro, o site abre no modo escuro', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-tema', 'escuro');
  expect(await fundo(page)).toBe(ESCURO);
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#191714');
  await expect(botaoDoTema(page)).toHaveAttribute('aria-pressed', 'true');
});

test('o botão troca o tema, diz o estado e a escolha vale nas outras páginas', async ({ page }) => {
  await page.goto('/');
  const botao = botaoDoTema(page);
  await expect(botao).toBeVisible();
  await expect(botao).toHaveAttribute('aria-pressed', 'false');
  expect(await fundo(page)).toBe(CLARO);

  await botao.click();
  await expect(page.locator('html')).toHaveAttribute('data-tema', 'escuro');
  await expect(botao).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => fundo(page)).toBe(ESCURO);

  // A escolha fica guardada: recarregar e trocar de página mantêm o escuro, desde a primeira pintura.
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-tema', 'escuro');
  await page.goto('/privacidade.html');
  await expect(page.locator('html')).toHaveAttribute('data-tema', 'escuro');
  expect(await fundo(page)).toBe(ESCURO);

  await botaoDoTema(page).click();
  await expect(page.locator('html')).toHaveAttribute('data-tema', 'claro');
  await expect.poll(() => fundo(page)).toBe(CLARO);
});

test('a escolha do botão vale mais que o sistema', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  await botaoDoTema(page).click();
  await expect(page.locator('html')).toHaveAttribute('data-tema', 'claro');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-tema', 'claro');
  expect(await fundo(page)).toBe(CLARO);
});

test.describe('sem JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('o site fica no claro e o botão do tema não aparece', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    expect(await fundo(page)).toBe(CLARO);
    await expect(page.locator('[data-tema-botao]')).toBeHidden();
  });
});
