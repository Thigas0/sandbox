import { test, expect, lerDado } from './apoio.js';

// Título, descrição, prévia do link (Open Graph, usada pelo WhatsApp) e dados estruturados.
const site = lerDado('site.json');
const dominio = 'defina "url" em src/dados/site.json: a prévia do WhatsApp exige URL absoluta';

const meta = (page, atributo, valor) =>
  page.locator(`meta[${atributo}="${valor}"]`).getAttribute('content');

test('título e descrição existem e cabem no resultado de busca', async ({ page }) => {
  await page.goto('/');
  const titulo = await page.title();
  expect(titulo.length).toBeGreaterThan(10);
  expect(titulo.length).toBeLessThanOrEqual(60);
  const descricao = await meta(page, 'name', 'description');
  expect(descricao.length).toBeGreaterThanOrEqual(70);
  expect(descricao.length).toBeLessThanOrEqual(160);
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
  await expect(page.locator('h1')).toHaveCount(1);
});

test('a prévia do link tem título, descrição, URL e imagem absolutas', async ({
  page,
  request,
}) => {
  await page.goto('/');
  expect(await meta(page, 'property', 'og:title')).toBe(await page.title());
  expect(await meta(page, 'property', 'og:description')).toBe(
    await meta(page, 'name', 'description'),
  );
  expect(await meta(page, 'property', 'og:type')).toBe('website');
  expect(await meta(page, 'property', 'og:locale')).toBe('pt_BR');
  expect(site.url, dominio).toMatch(/^https:\/\//);
  expect(await meta(page, 'property', 'og:url')).toBe(`${site.url}/`);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${site.url}/`);
  const imagem = await meta(page, 'property', 'og:image');
  expect(imagem).toBe(`${site.url}/og.jpg`);
  expect(await meta(page, 'property', 'og:image:width')).toBe('1200');
  expect(await meta(page, 'property', 'og:image:height')).toBe('630');

  // A imagem servida é a do próprio build: JPEG de até 300 KB (limite prático do WhatsApp).
  const resposta = await request.get('/og.jpg');
  expect(resposta.ok()).toBe(true);
  expect(resposta.headers()['content-type']).toContain('image/jpeg');
  expect((await resposta.body()).length).toBeLessThanOrEqual(300 * 1024);
});

test('dados estruturados descrevem o negócio (LocalBusiness) e o fotógrafo (Person)', async ({
  page,
}) => {
  await page.goto('/');
  const blocos = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(blocos).toHaveLength(1);
  const { '@context': contexto, '@graph': grafo } = JSON.parse(blocos[0]);
  expect(contexto).toBe('https://schema.org');
  const negocio = grafo.find((item) => item['@type'] === 'LocalBusiness');
  const pessoa = grafo.find((item) => item['@type'] === 'Person');
  expect(negocio).toMatchObject({
    name: site.nome,
    address: {
      '@type': 'PostalAddress',
      addressLocality: site.cidade,
      addressRegion: site.estado,
      addressCountry: site.pais,
    },
    founder: { '@id': pessoa['@id'] },
  });
  expect(pessoa).toMatchObject({ name: site.fotografo, worksFor: { '@id': negocio['@id'] } });
  expect(negocio.sameAs).toContain(site.fotto);
  expect(negocio.areaServed).toBe(site.atendimento);
  expect(site.url, dominio).toMatch(/^https:\/\//);
  expect(negocio.url).toBe(`${site.url}/`);
  expect(negocio.image).toBe(`${site.url}/og.jpg`);
});
