import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const TAGS_WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

test('a página diz o que é, onde fica e como chamar, logo de cara', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Catelle | Reforço Escolar e Alfabetização em Jaguariúna');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Reforço escolar e alfabetização',
  );
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(page.getByRole('banner')).toBeVisible();
  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.getByRole('contentinfo')).toBeVisible();
  await expect(
    page.getByRole('main').getByRole('link', { name: 'Chamar no WhatsApp' }),
  ).toBeVisible();
  await expect(page.locator('#onde address')).toContainText('R. Egas Bueno, 388, sala 02');
  await expect(page.getByRole('contentinfo')).toContainText(
    'Professora Cátia Adriana Silva Muller',
  );
  await expect(page.getByRole('contentinfo')).toContainText('CNPJ 48.987.232/0001-01');
});

test('dados internos nunca aparecem, nem na página nem no build', async ({ page }) => {
  await page.goto('/');
  const texto = await page.locator('html').innerHTML();
  expect(texto).not.toMatch(/\b2084\b/);
  expect(texto).not.toMatch(/faixa\s*C\b/i);

  const arquivos = [];
  const listar = (pasta) => {
    for (const nome of readdirSync(pasta)) {
      const caminho = join(pasta, nome);
      if (statSync(caminho).isDirectory()) listar(caminho);
      else if (/\.(html|js|css|json|txt|xml|svg)$/.test(nome)) arquivos.push(caminho);
    }
  };
  listar('dist');
  expect(arquivos.length).toBeGreaterThan(0);
  for (const arquivo of arquivos) {
    const conteudo = readFileSync(arquivo, 'utf8');
    expect(conteudo, arquivo).not.toMatch(/\b2084\b/);
    expect(conteudo, arquivo).not.toMatch(/faixa\s*C\b/i);
  }
});

test('todas as imagens são locais, com alt e dimensões', async ({ page }) => {
  await page.goto('/');
  const imagens = page.locator('img');
  const total = await imagens.count();
  expect(total).toBeGreaterThanOrEqual(3);
  const doMolde = await page.$$eval('template[data-crossfade-extra]', (moldes) =>
    moldes.flatMap((m) =>
      [...m.content.querySelectorAll('img')].map((img) => ({
        src: img.getAttribute('src'),
        alt: img.getAttribute('alt'),
        largura: img.getAttribute('width'),
      })),
    ),
  );
  expect(doMolde).toHaveLength(3);
  for (const img of doMolde) {
    expect(img.src).toMatch(/^\/img\//);
    expect(img.alt).toMatch(/.+/);
    expect(img.largura).toMatch(/^\d+$/);
  }
  for (let i = 0; i < total; i += 1) {
    const img = imagens.nth(i);
    await expect(img).toHaveAttribute('alt', /.+/);
    await expect(img).toHaveAttribute('width', /^\d+$/);
    await expect(img).toHaveAttribute('height', /^\d+$/);
    await expect(img).toHaveAttribute('src', /^\/img\//);
  }
});

for (const tema of ['light', 'dark']) {
  test(`não há problemas de acessibilidade detectáveis no tema ${tema}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: tema, reducedMotion: 'reduce' });
    await page.goto('/');
    const resultado = await new AxeBuilder({ page }).withTags(TAGS_WCAG).analyze();
    expect(resultado.violations).toEqual([]);
  });
}

test('com movimento reduzido, nada anima e todo o conteúdo fica visível', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  const animando = await page.evaluate(
    () => document.getAnimations().filter((a) => a.playState === 'running').length,
  );
  expect(animando).toBe(0);
  const invisiveis = await page.$$eval(
    '.revela',
    (els) => els.filter((el) => Number(getComputedStyle(el).opacity) < 1).length,
  );
  expect(invisiveis).toBe(0);
  // A troca de fotos não roda: as outras fotos do hero nem são baixadas.
  await expect(page.locator('.hero-img')).toHaveCount(1);
});
