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
// CSS). A lente do fundo gira e cresce, e as fotos se revelam e mudam de lugar conforme a página
// desce.

test('em Trabalho, rolar gira e aumenta a lente do fundo e revela as fotos', async ({ page }) => {
  await page.goto('/');
  const estado = () =>
    page.evaluate(() => ({
      lente: (({ style }) => ({
        giro: style.getPropertyValue('--giro'),
        escala: Number(style.getPropertyValue('--escala')),
      }))(document.querySelector('[data-lente-fundo]')),
      fotos: [...document.querySelectorAll('#trabalho .galeria-foto')].map((figura) => ({
        revelacao: figura.querySelector('img').style.filter,
        lugar: figura.style.transform,
      })),
    }));
  const { topo, fim } = await page.evaluate(() => {
    const secao = document.querySelector('#trabalho');
    const topo = secao.getBoundingClientRect().top + window.scrollY;
    return { topo, fim: topo + secao.offsetHeight - window.innerHeight };
  });
  const rolar = (y) => page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), y);
  await rolar(topo);
  await expect.poll(async () => (await estado()).lente.giro).toMatch(/deg$/);
  const antes = await estado();
  await rolar(topo + 1.5 * (await page.evaluate(() => window.innerHeight)));
  await expect.poll(async () => (await estado()).lente.giro).not.toBe(antes.lente.giro);
  const depois = await estado();
  // Uma foto que ainda estava no revelador (com filtro) ficou pronta, e alguma foto mudou de lugar.
  expect(antes.fotos.some((f, i) => f.revelacao && !depois.fotos[i].revelacao)).toBe(true);
  expect(depois.fotos.some((f, i) => f.lugar !== antes.fotos[i].lugar)).toBe(true);
  // No fim da seção, a lente tem mais que o dobro do tamanho do começo.
  await rolar(fim);
  await expect
    .poll(async () => (await estado()).lente.escala)
    .toBeGreaterThan(antes.lente.escala * 2);
});

test('com movimento reduzido, Trabalho fica parado e as fotos reveladas', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await percorrer(page);
  const estilos = await page.evaluate(() =>
    [
      document.querySelector('[data-lente-fundo]'),
      ...document.querySelectorAll('.galeria-foto, .galeria-foto .foto, .galeria-foto img'),
    ]
      .map((el) => el.getAttribute('style') ?? '')
      .filter((estilo) => /transform|clip-path|filter|--giro|--escala/.test(estilo)),
  );
  expect(estilos).toEqual([]);
});

// Foco da lente: na primeira vez que a página desce até um título (ou até a frase de Fotos), as
// letras chegam desfocadas e afastadas e entram em foco. Enquanto isso, o leitor de tela ouve o
// texto inteiro numa cópia oculta; no fim, o elemento volta a ser só texto, no mesmo lugar, e o
// efeito não se repete.
const estadoDoTexto = (page, seletor) =>
  page.locator(seletor).evaluate((el) => {
    const { left, top, width, height } = el.getBoundingClientRect();
    return {
      letras: el.querySelectorAll('.foco-letra').length,
      opacidade: Number(getComputedStyle(el).opacity),
      texto: el.textContent.trim().replace(/\s+/g, ' '),
      caixa: { left, top: top + window.scrollY, width, height },
    };
  });

// Anota cada vez que o título se divide em letras: quantas, quantas o leitor de tela não ouve e o
// que ele ouve no lugar.
const anotarDivisoes = (page, seletor) =>
  page.evaluate((seletor) => {
    const el = document.querySelector(seletor);
    window.divisoes = [];
    new MutationObserver(() => {
      const letras = el.querySelectorAll('.foco-letra').length;
      if (!letras) return;
      window.divisoes.push({
        letras,
        ocultas: el.querySelectorAll('[aria-hidden="true"] .foco-letra').length,
        lido: el.querySelector('.visualmente-oculto')?.textContent,
      });
    }).observe(el, { childList: true });
  }, seletor);

test('ao descer a página, os títulos entram em foco uma vez e voltam a ser texto', async ({
  page,
}) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const antes = await estadoDoTexto(page, '#fotos-titulo');
  // Ainda fora da tela, o título espera escondido e inteiro.
  expect(antes).toMatchObject({ letras: 0, opacidade: 0, texto: 'Encontre suas fotos' });
  await anotarDivisoes(page, '#fotos-titulo');

  const irParaFotos = () =>
    page
      .locator('#fotos')
      .evaluate((secao) => window.scrollTo({ top: secao.offsetTop, behavior: 'instant' }));
  await irParaFotos();
  await expect.poll(() => page.evaluate(() => window.divisoes.length)).toBe(1);
  expect(await page.evaluate(() => window.divisoes[0])).toEqual({
    letras: 17,
    ocultas: 17,
    lido: 'Encontre suas fotos',
  });
  // No fim, só o texto de antes, visível e no mesmo lugar.
  await expect.poll(async () => (await estadoDoTexto(page, '#fotos-titulo')).letras).toBe(0);
  const depois = await estadoDoTexto(page, '#fotos-titulo');
  expect(depois).toMatchObject({ opacidade: 1, texto: 'Encontre suas fotos' });
  for (const lado of ['left', 'top', 'width', 'height']) {
    expect(depois.caixa[lado]).toBeCloseTo(antes.caixa[lado], 0);
  }

  // Subir e descer de novo não repete o efeito.
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await irParaFotos();
  await page.waitForTimeout(400);
  expect(await page.evaluate(() => window.divisoes.length)).toBe(1);
  expect((await estadoDoTexto(page, '#fotos-titulo')).opacidade).toBe(1);
});

test('com movimento reduzido, os títulos já estão inteiros e parados', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const opacidades = await page
    .locator('[data-foco]')
    .evaluateAll((todos) => todos.map((el) => getComputedStyle(el).opacity));
  expect(opacidades.length).toBeGreaterThan(3);
  expect(new Set(opacidades)).toEqual(new Set(['1']));
  await percorrer(page);
  await expect(page.locator('.foco-letra')).toHaveCount(0);
});

// O visor de Fotos: as marcas de foco chegam de fora e se fecham no lugar; com o foco num controle
// dentro do visor (a busca, ou o link do aviso enquanto não há eventos), elas se apertam mais.
const cantos = (page) =>
  page.locator('.visor-canto').evaluateAll((todos) =>
    todos.map((el) => {
      const estilo = getComputedStyle(el);
      const matriz = new DOMMatrix(estilo.transform);
      return { x: Math.round(matriz.m41), y: Math.round(matriz.m42), opacidade: estilo.opacity };
    }),
  );

test('o visor mira ao chegar à tela e aperta as marcas quando algo nele tem foco', async ({
  page,
}) => {
  await page.goto('/');
  // Fora da tela, as marcas esperam afastadas para fora dos cantos e apagadas.
  const antes = await cantos(page);
  expect(antes).toHaveLength(4);
  expect(antes[0].x < -10 && antes[0].y < -10 && antes[3].x > 10 && antes[3].y > 10).toBe(true);
  expect(antes.every((canto) => canto.opacidade === '0')).toBe(true);

  await page.locator('.visor').evaluate((visor) => {
    visor.scrollIntoView({ block: 'center', behavior: 'instant' });
  });
  await expect
    .poll(async () =>
      (await cantos(page)).every((c) => c.x === 0 && c.y === 0 && c.opacidade === '1'),
    )
    .toBe(true);

  await page.locator('.visor').locator('input:visible, a:visible').first().focus();
  await expect.poll(async () => (await cantos(page))[0].x).toBeGreaterThan(5);
  const focado = await cantos(page);
  // Para dentro: o canto de cima, à esquerda, desce para a direita; o de baixo, à direita, sobe
  // para a esquerda.
  expect(focado[0].y).toBeGreaterThan(5);
  expect(focado[3].x).toBeLessThan(-5);
  expect(focado[3].y).toBeLessThan(-5);
});

// Cobertura: a seção fica presa na tela e o filme passa de lado na medida da rolagem, até o último
// quadro. Com movimento reduzido, o filme fica parado e inteiro.
test('na Cobertura, o filme passa de lado enquanto a página desce', async ({ page }) => {
  await page.goto('/');
  const secao = page.locator('#cobertura');
  await expect(secao).toHaveClass(/rolando/);
  const { topo, percurso } = await secao.evaluate((s) => ({
    topo: s.getBoundingClientRect().top + window.scrollY,
    percurso: parseFloat(getComputedStyle(s).getPropertyValue('--percurso')),
  }));
  expect(percurso).toBeGreaterThan(0);
  const deslocamento = () =>
    page
      .locator('#cobertura .filme')
      .evaluate((filme) => new DOMMatrix(getComputedStyle(filme).transform).m41);
  const rolar = (y) => page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), y);

  // A rolagem vai para pixels inteiros, e a seção pode começar no meio de um: meio pixel de folga.
  await rolar(topo);
  await expect.poll(deslocamento).toBeCloseTo(0, -1);
  await rolar(topo + percurso / 2);
  await expect.poll(deslocamento).toBeCloseTo(-percurso / 2, -1);
  await rolar(topo + percurso);
  await expect.poll(deslocamento).toBeCloseTo(-percurso, -1);

  // O palco continua preso no alto da tela, e o último quadro está inteiro à vista.
  const palco = await page
    .locator('#cobertura .cobertura-palco')
    .evaluate((el) => el.getBoundingClientRect().top);
  expect(Math.abs(palco)).toBeLessThan(1);
  const largura = await page.evaluate(() => document.documentElement.clientWidth);
  const ultimo = await page.locator('#cobertura .passo').last().boundingBox();
  expect(ultimo.x).toBeGreaterThanOrEqual(0);
  expect(ultimo.x + ultimo.width).toBeLessThanOrEqual(largura);
});

test('com movimento reduzido, o filme da Cobertura fica parado e inteiro', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('#cobertura')).not.toHaveClass(/rolando/);
  expect(
    await page.locator('#cobertura .filme').evaluate((filme) => getComputedStyle(filme).transform),
  ).toBe('none');
  const largura = await page.evaluate(() => document.documentElement.clientWidth);
  for (const passo of await page.locator('#cobertura .passo').all()) {
    const caixa = await passo.boundingBox();
    expect(caixa.x).toBeGreaterThanOrEqual(0);
    expect(caixa.x + caixa.width).toBeLessThanOrEqual(largura);
  }
});
