// Os callbacks de page.evaluate rodam no navegador.
/* global document, getComputedStyle */
import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { CSP, CSP_META } from '../../src/seguranca.js';

const ORDEM = ['inicio', 'como-funciona', 'abrir'];

test('as seções aparecem na ordem, cada uma com seu título', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/^Glaux/);
  const ids = await page.locator('[data-secao]').evaluateAll((secoes) => secoes.map((s) => s.id));
  expect(ids).toEqual(ORDEM);
  await expect(page.locator('#inicio h1')).toHaveText('Seu Canvas vira um plano de estudos.');
  for (const id of ORDEM.slice(1)) {
    await expect(page.locator(`#${id} h2`)).toHaveCount(1);
  }
});

test('os quatro agentes estão em como funciona', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#como-funciona .cartao h3')).toHaveText([
    'Canvas',
    'Tutor',
    'Gerador',
    'Orquestrador',
  ]);
});

test('a navegação leva às seções, por link e pelas setas do teclado', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('ArrowRight');
  await expect(page).toHaveURL(/#como-funciona$/);
  await expect(page.locator('#titulo-como-funciona')).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(page).toHaveURL(/#abrir$/);
  await expect(page.locator('#titulo-abrir')).toBeInViewport();
  await page.keyboard.press('ArrowLeft');
  await expect(page).toHaveURL(/#como-funciona$/);

  const nav = page.getByRole('navigation', { name: 'Seções' });
  await page.goto('/');
  await nav.getByRole('link', { name: 'Como funciona' }).click();
  await expect(page).toHaveURL(/#como-funciona$/);
  await expect(page.locator('#titulo-como-funciona')).toBeInViewport();
});

test('a landing leva ao app', async ({ page }) => {
  await page.goto('/');
  for (const link of await page.getByRole('link', { name: 'Abrir o app' }).all()) {
    await expect(link).toHaveAttribute('href', '/app/');
  }
  await page.locator('#abrir').getByRole('link', { name: 'Abrir o app' }).click();
  await expect(page).toHaveURL(/\/app\/#\/entrar$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('o simulador reproduz as rotas do Orquestrador', async ({ page }) => {
  await page.goto('/#como-funciona');
  const rota = page.locator('[data-rota]');
  const dadosLocais = page.getByLabel(/PDFs e tarefas/);
  const resumo = page.getByLabel('Resumo já no estado');
  const forcar = page.getByLabel('Forçar sincronização');

  // Padrão: gerar questões, com dados locais e sem resumo.
  await expect(rota).toHaveText('Tutor → Gerador');
  await resumo.check();
  await expect(rota).toHaveText('Gerador');
  await forcar.check();
  await expect(rota).toHaveText('Canvas → Tutor → Gerador');
  await forcar.uncheck();
  await dadosLocais.uncheck();
  await expect(rota).toHaveText('Canvas → Tutor → Gerador');

  await page.getByLabel('Gerar resumo').check();
  await expect(rota).toHaveText('Canvas → Tutor');
  await dadosLocais.check();
  await expect(rota).toHaveText('Tutor');
  await page.getByLabel('Gerar cronograma').check();
  await expect(rota).toHaveText('Tutor');
  await page.getByLabel('Sincronizar Canvas').check();
  await expect(rota).toHaveText('Canvas');
  await page.getByLabel('Fluxo completo').check();
  await expect(rota).toHaveText('Canvas → Tutor');

  // Na rota simulada, quem fica de fora é apagado no diagrama.
  await expect(page.locator('[data-no="question_generator_agent"]')).toHaveClass(/fora-da-rota/);
  await expect(page.locator('[data-no="tutor_agent"]')).not.toHaveClass(/fora-da-rota/);
});

test('o fluxo se monta conforme a rolagem', async ({ page }) => {
  await page.goto('/');
  const figura = page.locator('[data-fluxo]');
  await expect(figura).toHaveClass(/montando/);
  await expect(figura).not.toHaveClass(/ate-1/);
  await page.locator('.passo[data-passo="4"]').scrollIntoViewIfNeeded();
  await expect(figura).toHaveClass(/ate-4/);
});

test.describe('com movimento reduzido', () => {
  test.use({ reducedMotion: 'reduce' });

  test('o diagrama aparece completo e parado', async ({ page }) => {
    await page.goto('/');
    await page.locator('#como-funciona').scrollIntoViewIfNeeded();
    const figura = page.locator('[data-fluxo]');
    await expect(figura).not.toHaveClass(/montando/);
    const estilos = await figura.locator('.aresta, .no').evaluateAll((elementos) =>
      elementos.map((e) => {
        const s = getComputedStyle(e);
        return { opacidade: s.opacity, deslocamento: s.strokeDashoffset };
      }),
    );
    expect(estilos.length).toBeGreaterThan(10);
    for (const { opacidade, deslocamento } of estilos) {
      expect(opacidade).toBe('1');
      expect(['0', '0px']).toContain(deslocamento);
    }
  });
});

test('não há rolagem horizontal em 360 px', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('/');
  const larguras = await page.evaluate(() => ({
    rolavel: document.documentElement.scrollWidth,
    visivel: document.documentElement.clientWidth,
  }));
  expect(larguras.rolavel).toBeLessThanOrEqual(larguras.visivel);
});

test('a página percorre do início ao fim sem erro no console', async ({ page }) => {
  const erros = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') erros.push(msg.text());
  });
  page.on('pageerror', (erro) => erros.push(erro.message));
  await page.goto('/');
  for (const id of ORDEM) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
  }
  await page.getByLabel('Gerar resumo').check();
  expect(erros).toEqual([]);
});

test('a CSP está no build e é a mesma do deploy', async ({ page }) => {
  await page.goto('/');
  const meta = page.locator('meta[http-equiv="Content-Security-Policy"]');
  await expect(meta).toHaveAttribute('content', CSP_META);
  const vercel = JSON.parse(readFileSync(new URL('../../vercel.json', import.meta.url), 'utf8'));
  const cabecalhos = vercel.headers.find((h) => h.source === '/(.*)').headers;
  const csp = cabecalhos.find((h) => h.key === 'Content-Security-Policy');
  expect(csp.value).toBe(CSP);
});

test('não há problemas de acessibilidade detectáveis (WCAG A/AA)', async ({ page }) => {
  await page.goto('/');
  // Os painéis do herói entram com uma animação de opacidade; o axe mede o contraste final.
  await page.waitForFunction(() =>
    document.getAnimations().every((a) => a.playState !== 'running'),
  );
  const resultado = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(resultado.violations).toEqual([]);
});
