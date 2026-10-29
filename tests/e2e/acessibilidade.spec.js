import AxeBuilder from '@axe-core/playwright';
import { test, expect, PAGINAS, percorrer } from './apoio.js';

const REGRAS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const analisar = (page) => new AxeBuilder({ page }).withTags(REGRAS).analyze();

for (const caminho of PAGINAS) {
  test(`axe não acusa violações em ${caminho}`, async ({ page }) => {
    await page.goto(caminho);
    await percorrer(page);
    expect((await analisar(page)).violations).toEqual([]);
  });

  test(`axe não acusa violações em ${caminho} no modo escuro`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto(caminho);
    await expect(page.locator('html')).toHaveAttribute('data-tema', 'escuro');
    await percorrer(page);
    expect((await analisar(page)).violations).toEqual([]);
  });

  test(`axe não acusa violações em ${caminho} com movimento reduzido`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(caminho);
    await percorrer(page);
    expect((await analisar(page)).violations).toEqual([]);
  });
}

// Enquanto um título entra em foco (src/movimento.js), as letras soltas ficam escondidas do leitor
// de tela, que ouve o título inteiro numa cópia oculta, e a seção continua com nome. As animações
// param assim que o título se divide, para o axe ver esse estado. O contraste fica com os testes
// acima, com a página parada: as letras ainda transparentes reprovariam, e para medi-lo o axe rola a
// página, o que dispararia as outras entradas no meio da medição.
test('axe não acusa violações com um título entrando em foco', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    const titulo = document.querySelector('#fotos-titulo');
    new MutationObserver((_, observador) => {
      if (!titulo.querySelector('.foco-letra')) return;
      document.getAnimations().forEach((animacao) => animacao.pause());
      observador.disconnect();
    }).observe(titulo, { childList: true });
  });
  await page
    .locator('#fotos')
    .evaluate((secao) => window.scrollTo({ top: secao.offsetTop, behavior: 'instant' }));
  await expect(page.locator('#fotos-titulo .foco-letra').first()).toBeAttached();
  const nome = { name: 'Encontre suas fotos', exact: true };
  await expect(page.getByRole('heading', nome)).toHaveCount(1);
  await expect(page.getByRole('region', nome)).toHaveCount(1);
  const resultado = await new AxeBuilder({ page })
    .withTags(REGRAS)
    .disableRules(['color-contrast'])
    .analyze();
  expect(resultado.violations).toEqual([]);
  await expect(page.locator('#fotos-titulo .foco-letra').first()).toBeAttached();
});

for (const esquema of ['light', 'dark']) {
  test(`axe não acusa violações com as perguntas abertas e os erros do formulário à mostra (${esquema === 'dark' ? 'escuro' : 'claro'})`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: esquema });
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute(
      'data-tema',
      esquema === 'dark' ? 'escuro' : 'claro',
    );
    await percorrer(page);
    for (const pergunta of await page.locator('summary').all()) await pergunta.click();
    await page.getByRole('button', { name: 'Enviar pelo WhatsApp' }).click();
    await expect(page.getByText('Informe o seu nome.')).toBeVisible();
    expect((await analisar(page)).violations).toEqual([]);
  });
}

test('o primeiro Tab mostra "Pular para o conteúdo", que leva ao conteúdo', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const pular = page.getByRole('link', { name: 'Pular para o conteúdo' });
  await expect(pular).toBeFocused();
  await expect(pular).toBeInViewport();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Tab');
  expect(await page.evaluate(() => document.activeElement.closest('main') !== null)).toBe(true);
});

// Percorre a página só com Tab: cada parada é um elemento interativo visível na tela, com contorno
// de foco de pelo menos 2 px, e nenhum elemento interativo visível fica de fora. O campo de data
// recebe um Tab por parte (dia, mês, ano), então paradas seguidas no mesmo elemento contam uma vez.
const INTERATIVOS = 'a[href], button, input, select, textarea, summary, [tabindex]';

for (const caminho of PAGINAS) {
  test(`${caminho}: todo elemento interativo recebe foco visível pelo Tab`, async ({ page }) => {
    await page.goto(caminho);
    const esperados = await page.evaluate((seletor) => {
      // checkVisibility() também descarta o que está dentro de um <details> fechado.
      return [...document.querySelectorAll(seletor)].filter((el) => {
        if (el.tabIndex < 0 || el.closest('[hidden], noscript')) return false;
        return el.checkVisibility() || el.classList.contains('pular');
      }).length;
    }, INTERATIVOS);
    const paradas = [];
    for (let i = 0; i < esperados * 3 + 5; i++) {
      await page.keyboard.press('Tab');
      const parada = await page.evaluate((seletor) => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        const estilo = getComputedStyle(el);
        return {
          chave: [...document.querySelectorAll(seletor)].indexOf(el),
          descricao: `${el.tagName.toLowerCase()} "${(el.textContent || el.id).trim().slice(0, 40)}"`,
          contorno: estilo.outlineStyle !== 'none' ? parseFloat(estilo.outlineWidth) : 0,
        };
      }, INTERATIVOS);
      // Fim do percurso: o foco saiu da página ou deu a volta até a primeira parada.
      if (!parada || (paradas.length && parada.chave === paradas[0].chave)) break;
      if (parada.chave === paradas.at(-1)?.chave) continue;
      // A rolagem até o elemento focado pode ser suave: espera ele chegar à tela.
      await expect
        .poll(
          () =>
            page.evaluate(() => {
              const caixa = document.activeElement.getBoundingClientRect();
              return (
                caixa.bottom > 0 &&
                caixa.top < window.innerHeight &&
                caixa.right > 0 &&
                caixa.left < window.innerWidth
              );
            }),
          { message: `${parada.descricao} visível ao receber foco`, timeout: 3000 },
        )
        .toBe(true);
      expect(parada.contorno, `contorno de foco em ${parada.descricao}`).toBeGreaterThanOrEqual(2);
      paradas.push(parada);
    }
    expect(paradas.length).toBe(esperados);
  });
}
