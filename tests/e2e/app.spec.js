// Testes do app (/app/). Os dados do modo demo são fixtures fictícias (src/app/dados/fixtures).
/* global document */
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { CSP_META } from '../../src/seguranca.js';
import { criarApi } from '../../src/app/dados/api.js';

const TOKEN_FALSO = 'token-de-teste-que-nao-pode-sair-1234';
const FIXTURES = /\/assets\/(disciplinas|cronograma|resumos|questoes)-[\w-]+\.js$/;

async function entrarDemo(page) {
  await page.goto('/app/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Seu Canvas vira um plano de estudos.',
  );
  await page.getByLabel('Token de acesso do Canvas').fill(TOKEN_FALSO);
  await page.getByRole('button', { name: 'Explorar com dados de demonstração' }).click();
  await expect(page).toHaveURL(/#\/painel$/);
}

async function semViolacoes(page) {
  const r = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(r.violations).toEqual([]);
}

test('sem sessão, o app abre na entrada', async ({ page }) => {
  await page.goto('/app/#/painel');
  await expect(page).toHaveURL(/#\/entrar$/);
  await expect(page.locator('[data-lateral]')).toBeHidden();
  await expect(page.locator('[data-faixa-demo]')).toBeHidden();
});

test('o modo demo mostra a faixa e o painel com as entregas por prioridade', async ({ page }) => {
  await entrarDemo(page);
  await expect(page.locator('[data-faixa-demo]')).toBeVisible();
  await expect(page.locator('[data-faixa-demo]')).toContainText('Dados de demonstração');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Painel');
  await expect(page.locator('.grupo-prioridade h3')).toHaveText([
    'Alta prioridade',
    'Média prioridade',
    'Baixa prioridade',
  ]);
  await expect(page.locator('.tarefa')).toHaveCount(6);
  await expect(page.locator('.tarefa').first()).toContainText('ALTA');
  await expect(page.locator('.tarefa').first()).toContainText('em 1 dia');
  await expect(page.locator('.tarefa').last()).toContainText('sem prazo');
  await expect(page.locator('.disciplina-link')).toHaveCount(3);
});

test('sincronizar mostra o progresso por agente e a rota do Orquestrador', async ({ page }) => {
  await entrarDemo(page);
  await page.getByRole('button', { name: 'Sincronizar' }).click();
  const canvas = page.locator('[data-agente="canvas_agent"]');
  await expect(canvas).toHaveAttribute('data-estado', 'concluido');
  await expect(page.locator('[data-agente="tutor_agent"]')).toHaveAttribute('data-estado', 'fora');
  await expect(page.locator('[data-agente="question_generator_agent"]')).toHaveAttribute(
    'data-estado',
    'fora',
  );
  await expect(page.locator('.rota')).toContainText('Rota: Canvas');
  await expect(page.locator('.rota')).toContainText('Sincronização explícita');
  await expect(page.locator('.toast')).toContainText('Sincronização concluída: 3 disciplina(s).');
});

test('a disciplina mostra o resumo com citações clicáveis', async ({ page }) => {
  await entrarDemo(page);
  await page.getByRole('link', { name: 'Astronomia Básica (exemplo)' }).click();
  await expect(page).toHaveURL(/#\/disciplina\/9001\/resumo$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Astronomia Básica (exemplo)');
  await expect(page.locator('.resumo h2')).toHaveText('Visão geral: Astronomia Básica');
  await expect(page.locator('.rota')).toContainText('Rota: Tutor');
  const citacao = page.locator('.resumo .citacao').first();
  await expect(citacao).toHaveText('[astro_aula01.pdf, p.3-3]');
  await citacao.click();
  await expect(citacao).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('.citacao-painel')).toContainText('astro_aula01.pdf, p. 3.');
  await expect(page.locator('.citacao-painel')).toContainText('Está entre os trechos usados');
});

test('gerar e praticar: múltipla escolha corrigida na hora e dissertativa com referência', async ({
  page,
}) => {
  await entrarDemo(page);
  await page.getByRole('link', { name: 'Astronomia Básica (exemplo)' }).click();
  await page.getByRole('link', { name: 'Questões' }).click();

  await page.getByLabel('Tema', { exact: true }).fill('sistema solar');
  await page.getByLabel('Quantidade').fill('3');
  await page.getByRole('button', { name: 'Gerar questões' }).click();
  await expect(page.locator('.rota')).toContainText('Rota: Tutor → Gerador');
  await expect(page.getByRole('heading', { name: '3 questões sobre sistema solar' })).toBeVisible();
  await page.getByRole('button', { name: 'Praticar estas questões' }).click();

  await expect(page).toHaveURL(/#\/pratica$/);
  await expect(page.locator('.pratica__contador')).toContainText('Questão 1 de 3');
  await page.getByLabel('A) Júpiter').check();
  await page.getByRole('button', { name: 'Responder' }).click();
  await expect(page.locator('.feedback__titulo')).toHaveText('Incorreta');
  await expect(page.locator('.feedback')).toContainText('A resposta correta é B) Marte.');
  await expect(page.locator('[data-letra="B"]')).toHaveAttribute('data-resultado', 'correta');
  await expect(page.locator('[data-letra="A"]')).toHaveAttribute('data-resultado', 'errada');
  await expect(page.locator('.referencia cite')).toHaveText('astro_aula01.pdf, p. 5');

  await page.getByRole('button', { name: 'Próxima questão' }).click();
  await page.getByLabel('C) Planeta anão').check();
  await page.getByRole('button', { name: 'Responder' }).click();
  await expect(page.locator('.feedback__titulo')).toHaveText('Correta');

  await page.getByRole('button', { name: 'Próxima questão' }).click();
  await expect(page.getByText('Correção automática em breve')).toBeVisible();
  await page.getByLabel('Sua resposta').fill('Os rochosos têm superfície sólida.');
  await page.getByRole('button', { name: 'Ver referência' }).click();
  await expect(page.locator('.referencia cite')).toHaveText('astro_aula01.pdf, p. 6');
  await page.getByRole('button', { name: 'Ver resultado' }).click();
  await expect(page.locator('.placar')).toHaveText('1/2');
});

test('sem_material mostra a mensagem real do Gerador', async ({ page }) => {
  await entrarDemo(page);
  await page.getByRole('link', { name: 'Astronomia Básica (exemplo)' }).click();
  await page.getByRole('link', { name: 'Questões' }).click();
  const tema = page.getByLabel('Tema', { exact: true });
  await tema.fill('buracos negros');
  await page.getByRole('button', { name: 'Gerar questões' }).click();
  await expect(page.locator('.estado--sem-material .estado__mensagem')).toHaveText(
    'Não encontrei material sobre "buracos negros" nesta disciplina. Confira se o tema está escrito como nas aulas.',
  );
  await tema.fill('estrelas');
  await page.getByLabel('Quantidade').fill('5');
  await page.getByRole('button', { name: 'Gerar questões' }).click();
  await expect(page.locator('.estado--sem-material .estado__mensagem')).toHaveText(
    'O material encontrado sobre "estrelas" não é suficiente para 5 questões. Tente um tema mais específico ou peça menos questões.',
  );
});

test('disciplina sem material mostra o estado vazio e a mensagem do Gerador', async ({ page }) => {
  await entrarDemo(page);
  await page.getByRole('link', { name: 'História da Arte (exemplo)' }).click();
  await expect(page.locator('.estado--vazio .estado__titulo')).toHaveText('Matéria não indexada');
  await page.getByRole('link', { name: 'Questões' }).click();
  await page.getByLabel('Tema', { exact: true }).fill('barroco');
  await page.getByRole('button', { name: 'Gerar questões' }).click();
  await expect(page.locator('.estado--sem-material .estado__mensagem')).toHaveText(
    'O material desta disciplina ainda não foi carregado no Glaux. Tente de novo mais tarde ou avise o professor.',
  );
});

test('falha ao carregar os dados mostra o estado de erro com nova tentativa', async ({ page }) => {
  await page.route(FIXTURES, (rota) => rota.abort());
  await entrarDemo(page);
  const erro = page.locator('.estado--erro').first();
  await expect(erro).toContainText('Não foi possível carregar os dados de demonstração.');
  await expect(erro.getByRole('button', { name: 'Tentar de novo' })).toBeVisible();
});

test('no modo demo nada sai da origem, nada é enviado e o token não fica guardado', async ({
  page,
  context,
}) => {
  const requisicoes = [];
  page.on('request', (r) => requisicoes.push(r));
  await entrarDemo(page);
  await page.getByRole('button', { name: 'Sincronizar' }).click();
  await expect(page.locator('.toast')).toBeVisible();
  await page.getByRole('link', { name: 'Biologia Celular (exemplo)' }).click();
  await expect(page.locator('.resumo')).toBeVisible();
  await page.getByRole('link', { name: 'Questões' }).click();
  await page.getByLabel('Tema', { exact: true }).fill('mitocôndria');
  await page.getByLabel('Quantidade').fill('2');
  await page.getByRole('button', { name: 'Gerar questões' }).click();
  await expect(page.getByRole('button', { name: 'Praticar estas questões' })).toBeVisible();

  const origem = new URL(page.url()).origin;
  for (const r of requisicoes) {
    const url = new URL(r.url());
    expect(url.origin, r.url()).toBe(origem);
    expect(r.method(), r.url()).toBe('GET');
    expect(r.url()).not.toContain(TOKEN_FALSO);
    expect(r.postData()).toBeNull();
    // Só a página e os arquivos estáticos do próprio site.
    expect(url.pathname, r.url()).toMatch(/^\/(app\/|assets\/|fonts\/|favicon\.svg$)/);
  }
  const guardado = await page.evaluate(() => ({
    local: localStorage.length,
    sessao: sessionStorage.length,
    cookie: document.cookie,
  }));
  expect(guardado).toEqual({ local: 0, sessao: 0, cookie: '' });
  expect(await context.cookies()).toEqual([]);
  await expect(page.locator('input[type="password"]')).toHaveCount(0);
});

test('conectar sem backend configurado avisa que ele ainda não está disponível', async ({
  page,
}) => {
  await page.goto('/app/');
  await expect(
    page.getByText('O backend do Glaux ainda não está disponível.').first(),
  ).toBeVisible();
  await page.getByLabel('Token de acesso do Canvas').fill(TOKEN_FALSO);
  await page.getByRole('button', { name: 'Conectar' }).click();
  await expect(page.locator('.estado--erro .estado__titulo')).toHaveText(
    'Backend ainda não disponível',
  );
  await expect(page).toHaveURL(/#\/entrar$/);
});

test('sair do modo demo volta para a entrada', async ({ page }) => {
  await entrarDemo(page);
  await page.getByRole('button', { name: 'Sair do modo demo' }).click();
  await expect(page).toHaveURL(/#\/entrar$/);
  await expect(page.locator('[data-faixa-demo]')).toBeHidden();
});

test('o app tem a CSP do site e não libera conexões externas sem backend', async ({ page }) => {
  await page.goto('/app/');
  await expect(page.locator('meta[http-equiv="Content-Security-Policy"]')).toHaveAttribute(
    'content',
    CSP_META,
  );
});

test('a navegação do app vira barra inferior no celular, sem rolagem horizontal', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await entrarDemo(page);
  const barra = page.locator('[data-lateral]');
  await expect(barra).toBeVisible();
  const caixa = await barra.boundingBox();
  expect(caixa.y + caixa.height).toBeGreaterThan(800);
  expect(caixa.width).toBeGreaterThan(380);
  const larguras = await page.evaluate(() => [
    document.documentElement.scrollWidth,
    document.documentElement.clientWidth,
  ]);
  expect(larguras[0]).toBeLessThanOrEqual(larguras[1]);
});

test('sem violações de acessibilidade nas telas do app', async ({ page }) => {
  await page.goto('/app/');
  await semViolacoes(page);
  await page.getByRole('button', { name: 'Explorar com dados de demonstração' }).click();
  await expect(page.locator('.tarefa').first()).toBeVisible();
  await semViolacoes(page);
  await page.getByRole('link', { name: 'Astronomia Básica (exemplo)' }).click();
  await expect(page.locator('.resumo')).toBeVisible();
  await page.locator('.resumo .citacao').first().click();
  await semViolacoes(page);
  await page.getByRole('link', { name: 'Questões' }).click();
  await page.getByLabel('Tema', { exact: true }).fill('estrelas');
  await page.getByRole('button', { name: 'Gerar questões' }).click();
  await page.getByRole('button', { name: 'Praticar estas questões' }).click();
  await page.getByLabel('B) Por fusão nuclear no núcleo').check();
  await page.getByRole('button', { name: 'Responder' }).click();
  await expect(page.locator('.feedback')).toBeVisible();
  await semViolacoes(page);
});

test.describe('implementação "api" da camada de dados (sem navegador)', () => {
  function respostaFalsa(status, corpo) {
    return { ok: status >= 200 && status < 300, status, json: async () => corpo };
  }

  test('envia o token só uma vez, para o backend configurado', async () => {
    const chamadas = [];
    const api = criarApi({
      baseUrl: 'https://api.exemplo.test/',
      fetch: async (url, opcoes) => {
        chamadas.push({ url, ...opcoes });
        return respostaFalsa(204);
      },
    });
    await api.conectar('https://canvas.exemplo.test', TOKEN_FALSO);
    expect(chamadas).toHaveLength(1);
    expect(chamadas[0].url).toBe('https://api.exemplo.test/sessao');
    expect(chamadas[0].method).toBe('POST');
    expect(chamadas[0].credentials).toBe('include');
    expect(JSON.parse(chamadas[0].body)).toEqual({
      canvas_url: 'https://canvas.exemplo.test',
      token: TOKEN_FALSO,
    });
  });

  test('mapeia erros HTTP e valida a forma das respostas', async () => {
    const com = (status, corpo) =>
      criarApi({
        baseUrl: 'https://api.exemplo.test',
        fetch: async () => respostaFalsa(status, corpo),
      });
    await expect(com(500).cronograma()).rejects.toMatchObject({ tipo: 'servidor' });
    await expect(com(401).cronograma()).rejects.toMatchObject({ tipo: 'autenticacao' });
    await expect(com(200, [{ nada: 1 }]).cronograma()).rejects.toMatchObject({ tipo: 'servidor' });
    const offline = criarApi({
      baseUrl: 'https://api.exemplo.test',
      fetch: async () => {
        throw new TypeError('Failed to fetch');
      },
    });
    await expect(offline.listarDisciplinas()).rejects.toMatchObject({ tipo: 'rede' });

    const plano = {
      steps: ['tutor_agent', 'question_generator_agent'],
      resolved_course_id: 1,
      reason: 'x',
    };
    const resultado = { status: 'sem_material', mensagem: 'Sem material.', questoes: [] };
    const eventos = [];
    const r = await com(200, { plano, resultado }).gerarQuestoes(1, 'tema', 3, {
      aoProgresso: (e) => eventos.push(e),
    });
    expect(r.resultado.status).toBe('sem_material');
    expect(eventos.map((e) => e.tipo)).toEqual(['plano', 'agente', 'agente']);
  });

  test('sem URL de backend, a implementação avisa que ele está indisponível', () => {
    expect(() => criarApi({ baseUrl: '' })).toThrow(/ainda não está disponível/);
  });
});
