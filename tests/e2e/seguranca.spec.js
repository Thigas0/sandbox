import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';

const vercel = JSON.parse(readFileSync('vercel.json', 'utf8'));
const csp = vercel.headers
  .find((r) => r.source === '/(.*)')
  .headers.find((h) => h.key === 'Content-Security-Policy').value;

test('a CSP é restritiva e não libera terceiros', () => {
  expect(csp).toContain("default-src 'none'");
  expect(csp).toContain("script-src 'self'");
  expect(csp).toContain("frame-ancestors 'none'");
  expect(csp).not.toMatch(/unsafe-inline|unsafe-eval|https?:\/\//);
});

test('o preview serve os cabeçalhos do vercel.json e a página roda sem violar a CSP', async ({
  page,
}) => {
  const violacoes = [];
  page.on('console', (msg) => {
    if (/Content Security Policy|Refused to/i.test(msg.text())) violacoes.push(msg.text());
  });
  const resposta = await page.goto('/');
  const cabecalhos = resposta.headers();
  expect(cabecalhos['content-security-policy']).toBe(csp);
  expect(cabecalhos['x-content-type-options']).toBe('nosniff');
  expect(cabecalhos['referrer-policy']).toBe('strict-origin-when-cross-origin');
  expect(cabecalhos['strict-transport-security']).toContain('max-age=');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForLoadState('networkidle');
  expect(violacoes).toEqual([]);
});

test('o JSON-LD é válido e não tem avaliação autodeclarada', async ({ page }) => {
  await page.goto('/');
  const bruto = await page.locator('script[type="application/ld+json"]').textContent();
  const dados = JSON.parse(bruto);
  expect(dados['@type']).toEqual(['LocalBusiness', 'EducationalOrganization']);
  expect(dados.address.addressLocality).toBe('Jaguariúna');
  expect(dados.telephone).toBe('+55-19-99659-4138');
  expect(bruto).not.toMatch(/aggregateRating|"review"/i);
});

test('nenhum script, folha de estilo ou fonte vem de fora', async ({ page }) => {
  await page.goto('/');
  const externos = await page.$$eval('script[src], link[href]', (els) =>
    els
      .map((el) => el.getAttribute('src') ?? el.getAttribute('href'))
      .filter((u) => /^https?:\/\//.test(u) && !u.startsWith('https://catelle.com.br/')),
  );
  expect(externos).toEqual([]);
});
