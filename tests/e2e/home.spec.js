// Os callbacks de page.evaluate rodam no navegador.
/* global window, document, getComputedStyle */
import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { CSP, CSP_META } from '../../src/seguranca.js';

const ORDEM = [
  'abertura',
  'problema',
  'hipotese',
  'agentes',
  'colaboracao',
  'apis',
  'demo',
  'evidencias',
  'limites',
  'proximos',
  'equipe',
];

test('as 11 seções aparecem na ordem do roteiro, cada uma com seu título', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/^Glaux/);
  const ids = await page.locator('[data-secao]').evaluateAll((secoes) => secoes.map((s) => s.id));
  expect(ids).toEqual(ORDEM);
  await expect(page.locator('#abertura h1')).toHaveText('Glaux');
  for (const id of ORDEM.slice(1)) {
    await expect(page.locator(`#${id} h2`)).toHaveCount(1);
  }
});

test('os quatro agentes estão na seção de agentes', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#agentes .cartao h3')).toHaveText([
    'Canvas',
    'Tutor',
    'Gerador',
    'Orquestrador',
  ]);
});

test('a navegação leva às seções, por link e pelas setas do teclado', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('ArrowRight');
  await expect(page).toHaveURL(/#problema$/);
  await expect(page.locator('#titulo-problema')).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(page).toHaveURL(/#hipotese$/);
  await expect(page.locator('#hipotese')).toBeInViewport();
  await page.keyboard.press('ArrowLeft');
  await expect(page).toHaveURL(/#problema$/);

  const nav = page.getByRole('navigation', { name: 'Seções' });
  await nav.getByRole('link', { name: 'Evidências' }).click();
  await expect(page).toHaveURL(/#evidencias$/);
  await expect(page.locator('#titulo-evidencias')).toBeInViewport();
});

test('o simulador reproduz as rotas do Orquestrador', async ({ page }) => {
  await page.goto('/#colaboracao');
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
    await page.locator('#colaboracao').scrollIntoViewIfNeeded();
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

test('sem execução gravada, a demo avisa que é ao vivo', async ({ page }) => {
  await page.goto('/#demo');
  await expect(page.locator('[data-demo-estado]')).toHaveText(/ainda não capturada/);
});

test('com execução gravada, a demo mostra cronograma, resumo e questões como texto', async ({
  page,
}) => {
  // Dados de teste, não são saídas reais do Glaux.
  await page.route('**/demo/manifest.json', (rota) =>
    rota.fulfill({
      json: { capturadoEm: '26/11/2026', video: null, tutor: 't.json', questoes: 'q.json' },
    }),
  );
  await page.route('**/demo/t.json', (rota) =>
    rota.fulfill({
      json: {
        assignments: [
          { priority_level: 'ALTA', title: 'Tarefa de teste', days_remaining: 1 },
          { priority_level: 'BAIXA', title: 'Outra tarefa', days_remaining: null },
        ],
        summaries: [
          {
            topic_title: 'Tema: teste',
            summary_text:
              '# Visão Geral\nUm **conceito** de teste [teste.pdf, p.2-2]\n<img src=x onerror="window.invadido=1">',
          },
        ],
      },
    }),
  );
  await page.route('**/demo/q.json', (rota) =>
    rota.fulfill({
      json: {
        tema: 'teste',
        generated_questions: [
          {
            enunciado: 'Pergunta de teste?',
            alternativas: { A: 'um', B: 'dois', C: 'três', D: 'quatro' },
            correta: 'B',
            trecho_referencia: { arquivo: 'teste.pdf', pagina: 2, pagina_fim: 3 },
          },
        ],
      },
    }),
  );
  await page.goto('/#demo');
  const demo = page.locator('[data-demo]');
  await expect(demo.locator('[data-demo-estado]')).toHaveText('Execução gravada em 26/11/2026.');
  await expect(demo.locator('.demo__tarefas li')).toHaveCount(2);
  await expect(demo.getByText('Tarefa de teste')).toBeVisible();
  await expect(demo.locator('.demo__resumo cite.fonte')).toHaveText('[teste.pdf, p.2-2]');
  await expect(demo.locator('.demo__resumo strong')).toHaveText('conceito');
  await expect(demo.getByText('Pergunta de teste?')).toBeVisible();
  await expect(demo.locator('.correta')).toContainText('B) dois');
  await expect(demo.locator('.demo__questoes cite.fonte')).toHaveText('[teste.pdf, p.2-3]');
  // HTML vindo do JSON vira texto, nunca elemento.
  await expect(demo.locator('img')).toHaveCount(0);
  expect(await page.evaluate(() => window.invadido)).toBeUndefined();
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
  const resultado = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(resultado.violations).toEqual([]);
});
