import { test, expect } from '@playwright/test';

// Alvos de toque no celular: pelo menos 44 × 44 px (WCAG 2.5.5 / Apple HIG). Links dentro de um
// parágrafo de texto corrido ficam de fora, como a WCAG 2.5.8 permite.
const ALVOS = [
  '.topo .botao',
  '.hero .botao',
  '.hero-links a',
  '#quem-cuida .botao',
  '.slips-fonte a',
  '#onde .link-forte',
  '#idade',
  '#serie',
  '.opcao',
  '#horario',
  '.cupom-form button[type="submit"]',
];

test('controles e links soltos têm alvo de toque de pelo menos 44 px', async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, 'Alvos de toque são medidos no celular.');
  await page.goto('/');
  const pequenos = [];
  for (const seletor of ALVOS) {
    const elementos = page.locator(seletor);
    const total = await elementos.count();
    expect(total, seletor).toBeGreaterThan(0);
    for (let i = 0; i < total; i += 1) {
      const caixa = await elementos.nth(i).boundingBox();
      if (!caixa || caixa.width < 44 || caixa.height < 44) {
        pequenos.push(`${seletor}[${i}] ${caixa?.width}×${caixa?.height}`);
      }
    }
  }
  expect(pequenos).toEqual([]);
});

test('o foco do teclado segue a ordem visual e é sempre visível', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Teclado físico só no desktop.');
  await page.goto('/');
  const ordem = [];
  for (let i = 0; i < 8; i += 1) {
    await page.keyboard.press('Tab');
    const info = await page.evaluate(() => {
      const el = document.activeElement;
      const estilo = getComputedStyle(el);
      return { texto: el.textContent.trim(), contorno: estilo.outlineStyle !== 'none' };
    });
    expect(info.contorno, info.texto).toBe(true);
    ordem.push(info.texto);
  }
  expect(ordem.slice(0, 6)).toEqual([
    'Pular para o conteúdo',
    'Catelle',
    'Quem cuida',
    'O que as mães dizem',
    'Onde fica',
    'Chamar no WhatsApp',
  ]);
});
