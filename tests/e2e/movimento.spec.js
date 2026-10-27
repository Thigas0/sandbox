import { test, expect, percorrer } from './apoio.js';

// WCAG 2.2.2 e prefers-reduced-motion: nada se move sozinho sem controle, e quem pede menos
// movimento vê todo o conteúdo parado.
const animacoesRodando = (page) =>
  page.evaluate(() =>
    document
      .getAnimations()
      .filter((animacao) => animacao.playState === 'running')
      .map((animacao) => animacao.animationName ?? animacao.constructor.name),
  );

test('com movimento reduzido, nada anima e todo o conteúdo fica visível', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await percorrer(page);
  expect(await animacoesRodando(page)).toEqual([]);
  const escondidos = await page.evaluate(() =>
    [...document.querySelectorAll('main h1, main h2, main p, main li, main figure, main picture')]
      .filter((el) => !el.closest('[hidden]') && Number(getComputedStyle(el).opacity) < 1)
      .map((el) => el.textContent.trim().slice(0, 40) || el.tagName),
  );
  expect(escondidos).toEqual([]);
});

test('nada que se mova sozinho fica sem botão de pausa', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(1500);
  // Animações infinitas são as que "passam sozinhas"; cada uma precisa de um controle de pausa.
  const infinitas = await page.evaluate(
    () =>
      document
        .getAnimations()
        .filter(
          (animacao) =>
            animacao.playState === 'running' &&
            animacao.effect?.getComputedTiming().iterations === Infinity,
        ).length,
  );
  if (infinitas === 0) return;
  const pausar = page.getByRole('button', { name: /pausar/i });
  await expect(pausar).toBeVisible();
  await pausar.click();
  expect(
    await page.evaluate(() =>
      document.getAnimations().some((animacao) => animacao.playState === 'running'),
    ),
  ).toBe(false);
});

// Trabalho: a rolagem é interativa em qualquer navegador (o script não depende de recursos novos de
// CSS). A lente do fundo gira e as fotos se abrem e mudam de lugar conforme a página desce.
test('em Trabalho, rolar gira a lente do fundo e abre as fotos', async ({ page }) => {
  await page.goto('/');
  const estado = () =>
    page.evaluate(() => ({
      lente: document.querySelector('[data-lente-fundo]').style.transform,
      fotos: [...document.querySelectorAll('#trabalho .galeria-foto')].map((figura) => ({
        recorte: figura.querySelector('.foto').style.clipPath,
        lugar: figura.style.transform,
      })),
    }));
  const topo = await page.evaluate(
    () => document.querySelector('#trabalho').getBoundingClientRect().top + window.scrollY,
  );
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), topo);
  await expect.poll(async () => (await estado()).lente).toMatch(/rotate/);
  const antes = await estado();
  await page.evaluate(
    (y) => window.scrollTo({ top: y + window.innerHeight * 1.5, behavior: 'instant' }),
    topo,
  );
  await expect.poll(async () => (await estado()).lente).not.toBe(antes.lente);
  const depois = await estado();
  // Uma foto que estava fechada (recortada num círculo) se abriu, e alguma foto mudou de lugar.
  expect(antes.fotos.some((f, i) => f.recorte && !depois.fotos[i].recorte)).toBe(true);
  expect(depois.fotos.some((f, i) => f.lugar !== antes.fotos[i].lugar)).toBe(true);
});

test('com movimento reduzido, Trabalho fica parado e as fotos inteiras', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await percorrer(page);
  const estilos = await page.evaluate(() =>
    [
      document.querySelector('[data-lente-fundo]'),
      ...document.querySelectorAll('.galeria-foto, .galeria-foto .foto, .galeria-foto img'),
    ]
      .map((el) => el.getAttribute('style') ?? '')
      .filter((estilo) => /transform|clip-path/.test(estilo)),
  );
  expect(estilos).toEqual([]);
});
