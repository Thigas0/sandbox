import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { secoesDoCardapio, preco, indicePedido } from '../../src/render.js';
import {
  precoUnitario,
  validarEscolha,
  validarDados,
  mensagemWhatsApp,
  totais,
} from '../../src/pedido/regras.js';

const dados = JSON.parse(
  readFileSync(new URL('../../docs/cliente/cardapio.json', import.meta.url), 'utf-8'),
);
const totalPratos = secoesDoCardapio(dados).reduce((t, s) => t + s.itens.length, 0);

// Horário de Serra Negra (UTC-3, sem horário de verão).
const em = (iso) => new Date(`${iso}-03:00`);

test('o primeiro screen mostra o nome e o botão de montar o pedido', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Hugão Lanches & Burgers/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Hugão');
  const pedir = page.locator('.topo').getByRole('link', { name: 'Montar meu pedido' });
  await expect(pedir).toBeInViewport();
  await expect(pedir).toHaveAttribute('href', '#cardapio');
});

test('o cardápio inteiro está na página, com os preços do bsfood', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.cardapio .prato')).toHaveCount(totalPratos);
  const xSalada = dados.categorias
    .flatMap((c) => c.itens)
    .find((i) => i.nome === 'X-Salada' && /90 g/.test(i.variante || ''));
  const linha = page.locator('#tradicionais .prato', { hasText: 'X-Salada' });
  await expect(linha).toContainText(preco(xSalada.preco_centavos));
  await expect(page.locator('.tabela__linha')).toHaveCount(10);
});

test('escolher o bairro mostra a taxa e o tempo de entrega', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Escolha seu bairro').selectOption({ label: 'Centro' });
  await expect(page.locator('[data-resultado]')).toContainText('Centro: taxa de R$ 3,00');
  await expect(page.locator('[data-resultado]')).toContainText('50 minutos');
});

test('o letreiro acende no horário de funcionamento', async ({ page }) => {
  await page.clock.setFixedTime(em('2026-11-19T20:00:00'));
  await page.goto('/');
  await expect(page.locator('[data-status]')).toHaveText('Aceso agora: aberto até as 23h.');
  await expect(page.locator('[data-monumento]')).toHaveAttribute('data-aceso', 'true');
});

test('antes das 18h o letreiro está apagado e diz quando acende', async ({ page }) => {
  await page.clock.setFixedTime(em('2026-11-16T15:00:00'));
  await page.goto('/');
  await expect(page.locator('[data-status]')).toHaveText('Apagado agora: acende hoje às 18h.');
  await expect(page.locator('[data-monumento]')).toHaveAttribute('data-aceso', 'false');
});

test('depois de fechar no sábado, o letreiro avisa que acende amanhã', async ({ page }) => {
  await page.clock.setFixedTime(em('2026-11-21T23:45:00'));
  await page.goto('/');
  await expect(page.locator('[data-status]')).toHaveText('Apagado agora: acende amanhã às 18h.');
});

test('o cardápio mostra uma categoria por vez e troca pela aba', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#classicos')).toBeVisible();
  await expect(page.locator('#bebidas')).toBeHidden();
  await page.locator('[data-aba="bebidas"]').click();
  await expect(page.locator('#bebidas')).toBeVisible();
  await expect(page.locator('#classicos')).toBeHidden();
  await expect(page.locator('[data-aba="bebidas"]')).toHaveAttribute('aria-current', 'true');
});

test('os lanches com foto do bsfood mostram a foto no cardápio', async ({ page }) => {
  await page.goto('/');
  const foto = page.locator('#classicos .prato__foto').first();
  await foto.scrollIntoViewIfNeeded();
  await expect(foto).toHaveJSProperty('complete', true);
  expect(await foto.evaluate((img) => img.naturalWidth)).toBeGreaterThan(0);
});

test('os links de WhatsApp e de ligar apontam para o número da loja', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.rodape').getByRole('link', { name: 'WhatsApp' })).toHaveAttribute(
    'href',
    /^https:\/\/wa\.me\/5519971681738/,
  );
  await expect(page.getByRole('link', { name: '(19) 97168-1738', exact: true })).toHaveAttribute(
    'href',
    'tel:+5519971681738',
  );
});

// ---------- Pedido ----------
const indice = indicePedido(dados);
const cardapio = { itens: indice.itens, grupos: indice.grupos };
const americaBacon = Object.entries(cardapio.itens).find(([, i]) => i.nome === 'América Bacon');

test('regras: preço soma o tamanho e os adicionais', () => {
  const [, item] = americaBacon;
  const bacon = cardapio.grupos.adicionais.opcoes.findIndex((o) => o.nome === 'Bacon');
  const escolha = { variante: 1, adicionais: { [`adicionais:${bacon}`]: 2 }, qtd: 1 };
  expect(precoUnitario(item, escolha, cardapio.grupos)).toBe(
    item.precos[1].centavos + 2 * cardapio.grupos.adicionais.opcoes[bacon].preco_centavos,
  );
});

test('regras: escolha obrigatória e limite de adicionais', () => {
  const kids = Object.values(cardapio.itens).find((i) => i.grupos.includes('acompanhamento-kids'));
  expect(validarEscolha(kids, { adicionais: {}, qtd: 1 }, cardapio.grupos)).toContain(
    'Escolha acompanhamento kids.',
  );
  const [, item] = americaBacon;
  const muitos = Object.fromEntries([0, 1, 2].map((i) => [`adicionais:${i}`, 2]));
  expect(validarEscolha(item, { adicionais: muitos, qtd: 1 }, cardapio.grupos)).toContain(
    'Até 5 em adicionais.',
  );
});

test('regras: dados de entrega obrigatórios e mensagem completa', () => {
  expect(Object.keys(validarDados({ tipo: 'entrega' }))).toEqual(
    expect.arrayContaining(['nome', 'telefone', 'bairro', 'rua', 'numero', 'pagamento']),
  );
  expect(
    validarDados({ tipo: 'retirada', nome: 'Ana', telefone: '19999990000', pagamento: 'PIX' }),
  ).toEqual({});
  const [chave] = americaBacon;
  const carrinho = [{ item: chave, variante: 0, adicionais: {}, obs: 'sem cebola', qtd: 2 }];
  const dadosCliente = {
    tipo: 'entrega',
    bairro: 'Centro',
    taxa: 300,
    rua: 'R. Teste',
    numero: '10',
    nome: 'Ana',
    telefone: '(19) 99999-0000',
    pagamento: 'Dinheiro',
    troco: 'R$ 100',
  };
  const msg = mensagemWhatsApp({ carrinho, cardapio, dados: dadosCliente, codigo: 'H1' });
  const t = totais(carrinho, cardapio, { tipo: 'entrega', taxa: 300 });
  expect(msg).toContain('2x América Bacon');
  expect(msg).toContain('Obs.: sem cebola');
  expect(msg).toContain('Entrega (Centro): R$ 3,00');
  expect(msg).toContain(`*Total: ${preco(t.total)}*`);
  expect(msg).toContain('troco para R$ 100');
});

test('pedido completo: escolher, ajustar e enviar pelo WhatsApp', async ({ page, context }) => {
  await context.route('https://wa.me/**', (rota) => rota.fulfill({ body: 'ok' }));
  await page.goto('/');
  await page.locator('#classicos .prato', { hasText: 'América Bacon' }).getByRole('button').click();
  const janela = page.locator('[data-item-janela]');
  await expect(janela).toBeVisible();
  await janela.getByRole('radio', { name: /120 g/ }).check();
  await janela.getByRole('button', { name: 'Adicionar Bacon' }).click();
  await janela.locator('textarea[name="obs"]').fill('sem cebola');
  await janela.locator('[data-item-adicionar]').click();
  await expect(janela).toBeHidden();
  await expect(page.locator('[data-sacola]')).toBeVisible();
  await expect(page.locator('[data-sacola-conta]')).toHaveText('1 item');

  await page.locator('[data-sacola]').click();
  const gaveta = page.locator('[data-gaveta]');
  await expect(gaveta.locator('.linha')).toHaveCount(1);
  await gaveta.getByRole('button', { name: 'Enviar pedido pelo WhatsApp' }).click();
  await expect(gaveta.locator('[data-erro="nome"]')).toHaveText('Diga o seu nome.');

  await gaveta.locator('select[name="bairro"]').selectOption('Centro');
  await expect(gaveta.locator('[data-resumo-taxa]')).toHaveText('R$ 3,00');
  await gaveta.locator('input[name="rua"]').fill('R. das Flores');
  await gaveta.locator('input[name="numero"]').fill('42');
  await gaveta.locator('input[name="nome"]').fill('Ana');
  await gaveta.locator('input[name="telefone"]').fill('(19) 99999-0000');
  await gaveta.getByRole('radio', { name: 'PIX' }).check();
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    gaveta.getByRole('button', { name: 'Enviar pedido pelo WhatsApp' }).click(),
  ]);
  const texto = decodeURIComponent(new URL(popup.url()).searchParams.get('text'));
  expect(popup.url()).toContain('wa.me/5511988107510');
  expect(texto).toContain('1x América Bacon');
  expect(texto).toContain('120 g, + Bacon');
  expect(texto).toContain('Entregar em: R. das Flores, 42 — Centro');
  expect(texto).toContain('Pagamento: PIX');
  await expect(gaveta.locator('[data-confirmacao]')).toBeVisible();
});

test('o pedido continua no navegador depois de recarregar', async ({ page }) => {
  await page.goto('/');
  await page.locator('.tabela [data-adicionar]').first().click();
  await page.locator('[data-item-adicionar]').click();
  await expect(page.locator('[data-sacola-conta]')).toHaveText('1 item');
  await page.reload();
  await expect(page.locator('[data-sacola-conta]')).toHaveText('1 item');
  await expect(page.locator('[data-conta]')).toHaveText('1');
});

test.describe('sem JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('o cardápio e os bairros continuam visíveis', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.cardapio .prato').first()).toBeVisible();
    await expect(page.locator('.tabela__linha').first()).toBeVisible();
    await expect(page.locator('.bairros__lista li')).toHaveCount(dados.loja.bairros_entrega.length);
  });
});

test('não há problemas de acessibilidade detectáveis (WCAG A/AA)', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const resultado = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(resultado.violations).toEqual([]);
});

test('a janela do lanche e a gaveta do pedido passam no axe', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.locator('.tabela [data-adicionar]').first().click();
  const regras = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
  let r = await new AxeBuilder({ page }).include('[data-item-janela]').withTags(regras).analyze();
  expect(r.violations).toEqual([]);
  await page.locator('[data-item-adicionar]').click();
  await page.locator('[data-sacola]').click();
  r = await new AxeBuilder({ page }).include('[data-gaveta]').withTags(regras).analyze();
  expect(r.violations).toEqual([]);
});
