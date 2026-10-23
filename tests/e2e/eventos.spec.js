import { test, expect, lerDado, normalizar, eventosOrdenados } from './apoio.js';

// Trabalho nº 1 do site: quem esteve no evento acha o álbum e chega ao link exato do Fotto.
const site = lerDado('site.json');
const eventos = eventosOrdenados(lerDado('eventos.json'));
const mensagemVazio = 'src/dados/eventos.json está vazio: adicione os eventos do Fotto';

// O Fotto é simulado: o clique navega para o link certo sem sair de localhost de verdade.
const simularFotto = (page) =>
  page.route(/^https:\/\/([a-z0-9-]+\.)?fotto\.com\.br\//, (rota) =>
    rota.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Fotto</title>' }),
  );

const itemDoEvento = (page, evento) =>
  page.locator('[data-evento]').filter({ has: page.locator(`a[href="${evento.fotto}"]`) });

test('a lista mostra todos os eventos, do mais recente ao mais antigo, com o link exato', async ({
  page,
}) => {
  expect(eventos.length, mensagemVazio).toBeGreaterThan(0);
  await page.goto('/');
  const links = page.locator('[data-evento] a');
  await expect(links).toHaveCount(eventos.length);
  const hrefs = await links.evaluateAll((todos) => todos.map((a) => a.getAttribute('href')));
  expect(hrefs).toEqual(eventos.map((evento) => evento.fotto));
});

test('a primeira tela leva ao álbum do último evento', async ({ page }) => {
  expect(eventos.length, mensagemVazio).toBeGreaterThan(0);
  await page.goto('/');
  const link = page.locator('.ultimo-evento a');
  await expect(link).toHaveAttribute('href', eventos[0].fotto);
  await expect(link).toContainText(eventos[0].nome);
});

test('buscar pelo nome acha o evento e o link abre o álbum certo no Fotto', async ({ page }) => {
  expect(eventos.length, mensagemVazio).toBeGreaterThan(0);
  const alvo = eventos.at(-1);
  await simularFotto(page);
  await page.goto('/');
  await page.getByLabel('Nome do evento, local ou mês').fill(alvo.nome);
  await expect(itemDoEvento(page, alvo)).toBeVisible();
  await expect(page.locator('[data-busca-contagem]')).toContainText('encontrado');
  for (const texto of await page.locator('[data-evento]:visible').allTextContents()) {
    for (const termo of normalizar(alvo.nome).split(/\s+/))
      expect(normalizar(texto)).toContain(termo);
  }
  await itemDoEvento(page, alvo).getByRole('link').click();
  await expect(page).toHaveURL(new URL(alvo.fotto).href);
});

test('buscar pelo local, sem acentos, também acha o evento', async ({ page }) => {
  expect(eventos.length, mensagemVazio).toBeGreaterThan(0);
  const alvo = eventos[0];
  await page.goto('/');
  await page.getByLabel('Nome do evento, local ou mês').fill(normalizar(alvo.local));
  await expect(itemDoEvento(page, alvo)).toBeVisible();
});

test('uma busca sem resultado avisa e oferece todos os álbuns no Fotto', async ({ page }) => {
  expect(eventos.length, mensagemVazio).toBeGreaterThan(0);
  await page.goto('/');
  await page.getByLabel('Nome do evento, local ou mês').fill('zzzz evento que não existe');
  await expect(page.locator('[data-evento]:visible')).toHaveCount(0);
  await expect(page.locator('[data-busca-contagem]')).toHaveText('Nenhum evento encontrado.');
  const aviso = page.locator('[data-busca-vazia]');
  await expect(aviso).toBeVisible();
  await expect(aviso.getByRole('link', { name: 'todos os álbuns no Fotto' })).toHaveAttribute(
    'href',
    site.fotto,
  );
});

test('dá para achar o evento e abrir o álbum só com o teclado', async ({ page }) => {
  expect(eventos.length, mensagemVazio).toBeGreaterThan(0);
  const alvo = eventos.at(-1);
  await simularFotto(page);
  await page.goto('/');
  const busca = page.getByLabel('Nome do evento, local ou mês');
  for (let i = 0; i < 60 && !(await busca.evaluate((el) => el === document.activeElement)); i++) {
    await page.keyboard.press('Tab');
  }
  await expect(busca).toBeFocused();
  await page.keyboard.type(alvo.nome);
  await page.keyboard.press('Tab');
  await expect(itemDoEvento(page, alvo).getByRole('link')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(new URL(alvo.fotto).href);
});

test.describe('sem JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('a lista de eventos continua completa e com os links do Fotto', async ({ page }) => {
    expect(eventos.length, mensagemVazio).toBeGreaterThan(0);
    await page.goto('/');
    await expect(page.locator('[data-evento] a')).toHaveCount(eventos.length);
    await expect(page.locator('[data-busca]')).toBeHidden();
  });
});
