import { test, expect } from './apoio.js';

// WCAG 2.2.2 e prefers-reduced-motion: nada se move sozinho sem controle, e quem pede menos
// movimento vê todo o conteúdo parado.
async function percorrer(page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight / 2) {
      window.scrollTo(0, y);
      await new Promise((pronto) => requestAnimationFrame(() => setTimeout(pronto, 40)));
    }
  });
}

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
