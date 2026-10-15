import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('a página inicial carrega com título e cabeçalho', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Meu site');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('o contador soma um a cada clique', async ({ page }) => {
  await page.goto('/');
  const botao = page.getByRole('button', { name: /Cliques/ });
  await botao.click();
  await botao.click();
  await expect(botao).toHaveText('Cliques: 2');
});

test('não há problemas de acessibilidade detectáveis (WCAG A/AA)', async ({ page }) => {
  await page.goto('/');
  const resultado = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(resultado.violations).toEqual([]);
});
