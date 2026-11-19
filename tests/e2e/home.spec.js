import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { secoesDoCardapio, preco } from '../../src/render.js';

const dados = JSON.parse(
  readFileSync(new URL('../../docs/cliente/cardapio.json', import.meta.url), 'utf-8'),
);
const totalPratos = secoesDoCardapio(dados).reduce((t, s) => t + s.itens.length, 0);
const BSFOOD = 'https://hugaolanches.bsfood.com.br';

// Horário de Serra Negra (UTC-3, sem horário de verão).
const em = (iso) => new Date(`${iso}-03:00`);

test('o primeiro screen mostra o nome e o botão de pedir no bsfood', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Hugão Lanches & Burgers/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Hugão');
  const pedir = page.locator('.topo').getByRole('link', { name: 'Pedir no bsfood' });
  await expect(pedir).toBeInViewport();
  await expect(pedir).toHaveAttribute('href', BSFOOD);
});

test('o cardápio inteiro está na página, com os preços do bsfood', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.cardapio .prato')).toHaveCount(totalPratos);
  const xSalada = dados.categorias
    .flatMap((c) => c.itens)
    .find((i) => i.nome === 'X-Salada' && /90 g/.test(i.variante || ''));
  const linha = page.locator('#tradicionais .prato', { hasText: 'X-Salada' });
  await expect(linha).toContainText(preco(xSalada.preco_centavos));
  await expect(page.locator('.tabela__linha')).toHaveCount(10);
});

test('escolher o bairro mostra a taxa e o tempo de entrega', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Escolha seu bairro').selectOption({ label: 'Centro' });
  await expect(page.locator('[data-resultado]')).toContainText('Centro: taxa de R$ 3,00');
  await expect(page.locator('[data-resultado]')).toContainText('50 minutos');
});

test('o letreiro acende no horário de funcionamento', async ({ page }) => {
  await page.clock.setFixedTime(em('2026-11-19T20:00:00'));
  await page.goto('/');
  await expect(page.locator('[data-status]')).toHaveText('Aceso agora: aberto até as 23h.');
  await expect(page.locator('[data-monumento]')).toHaveAttribute('data-aceso', 'true');
});

test('antes das 18h o letreiro está apagado e diz quando acende', async ({ page }) => {
  await page.clock.setFixedTime(em('2026-11-16T15:00:00'));
  await page.goto('/');
  await expect(page.locator('[data-status]')).toHaveText('Apagado agora: acende hoje às 18h.');
  await expect(page.locator('[data-monumento]')).toHaveAttribute('data-aceso', 'false');
});

test('depois de fechar no sábado, o letreiro avisa que acende amanhã', async ({ page }) => {
  await page.clock.setFixedTime(em('2026-11-21T23:45:00'));
  await page.goto('/');
  await expect(page.locator('[data-status]')).toHaveText('Apagado agora: acende amanhã às 18h.');
});

test('as abas de peso trocam a linha do hambúrguer, também pelo teclado', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('tab', { name: '160 g' }).click();
  await expect(page.locator('[data-peso-titulo]')).toHaveText('Gourmet no brioche');
  await expect(page.getByRole('tab', { name: '160 g' })).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('[data-peso-titulo]')).toHaveText('Artesanal da casa');
  await expect(page.getByRole('tab', { name: '120 g' })).toBeFocused();
});

test('os botões de WhatsApp e de ligar apontam para o número da loja', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Pedir pelo WhatsApp' })).toHaveAttribute(
    'href',
    /^https:\/\/wa\.me\/5519971681738/,
  );
  await expect(page.getByRole('link', { name: '(19) 97168-1738', exact: true })).toHaveAttribute(
    'href',
    'tel:+5519971681738',
  );
});

test.describe('sem JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('o cardápio e os bairros continuam visíveis', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.cardapio .prato').first()).toBeVisible();
    await expect(page.locator('.tabela__linha').first()).toBeVisible();
    await expect(page.locator('.bairros__lista li')).toHaveCount(dados.loja.bairros_entrega.length);
  });
});

test('não há problemas de acessibilidade detectáveis (WCAG A/AA)', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const resultado = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(resultado.violations).toEqual([]);
});
