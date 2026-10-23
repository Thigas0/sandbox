import { test, expect, lerDado } from './apoio.js';

// Trabalho nº 2: pedido de orçamento pelo WhatsApp. Nada é enviado de verdade: window.open é
// substituído e só registramos para onde o site tentou ir.
const { whatsapp, email } = lerDado('site.json');
const HOJE = new Date('2026-11-02T10:00:00');

async function simularJanela(page, { bloqueada }) {
  await page.addInitScript((bloqueada) => {
    window.__aberturas = [];
    window.open = (url, alvo) => {
      window.__aberturas.push({ url, alvo });
      return bloqueada ? null : {};
    };
  }, bloqueada);
}

async function preencher(page, campos = {}) {
  const pedido = {
    tipo: 'Festa',
    data: '2026-12-12',
    cidade: 'Campinas',
    nome: 'Ana',
    detalhes: '',
    ...campos,
  };
  await page.getByLabel('Tipo de evento').selectOption(pedido.tipo);
  await page.getByLabel('Data do evento').fill(pedido.data);
  await page.getByLabel('Cidade', { exact: true }).fill(pedido.cidade);
  await page.getByLabel('Seu nome').fill(pedido.nome);
  if (pedido.detalhes) await page.getByLabel('Detalhes (opcional)').fill(pedido.detalhes);
}

const enviar = (page) => page.getByRole('button', { name: 'Enviar pelo WhatsApp' }).click();
const aberturas = (page) => page.evaluate(() => window.__aberturas);
const linkEsperado = (mensagem) => `https://wa.me/${whatsapp}?text=${encodeURIComponent(mensagem)}`;

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(HOJE);
});

test('validação: campos vazios mostram as mensagens e o foco vai para o primeiro', async ({
  page,
}) => {
  await simularJanela(page, { bloqueada: false });
  await page.goto('/#orcamento');
  await enviar(page);
  await expect(page.getByText('Escolha o tipo de evento.')).toBeVisible();
  await expect(page.getByText('Informe a data do evento.')).toBeVisible();
  await expect(page.getByText('Informe a cidade do evento.')).toBeVisible();
  await expect(page.getByText('Informe o seu nome.')).toBeVisible();
  await expect(page.getByLabel('Tipo de evento')).toBeFocused();
  await expect(page.getByLabel('Seu nome')).toHaveAttribute('aria-invalid', 'true');
  expect(await aberturas(page)).toEqual([]);
});

test('validação: uma data que já passou é recusada', async ({ page }) => {
  await simularJanela(page, { bloqueada: false });
  await page.goto('/#orcamento');
  await preencher(page, { data: '2026-10-01' });
  await enviar(page);
  await expect(page.getByText('A data precisa ser hoje ou depois.')).toBeVisible();
  await expect(page.getByLabel('Data do evento')).toBeFocused();
  expect(await aberturas(page)).toEqual([]);
});

test('sucesso: abre o WhatsApp com o número e a mensagem certos', async ({ page }) => {
  await simularJanela(page, { bloqueada: false });
  await page.goto('/#orcamento');
  await preencher(page, { detalhes: 'Das 20h à meia-noite.' });
  await enviar(page);
  const mensagem =
    'Olá! Sou Ana. Quero um orçamento de cobertura: Festa, 12/12/2026, Campinas. Detalhes: Das 20h à meia-noite.';
  expect(await aberturas(page)).toEqual([{ url: linkEsperado(mensagem), alvo: '_blank' }]);
  await expect(page.locator('[data-orcamento-status]')).toHaveText(
    'O WhatsApp abriu em outra aba com a sua mensagem. É só enviar.',
  );
  await expect(page.locator('[data-orcamento-alternativa]')).toBeHidden();
});

test.describe('erro: janela bloqueada', () => {
  test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

  test('mostra o link certo e copia a mensagem', async ({ page }) => {
    await simularJanela(page, { bloqueada: true });
    await page.goto('/#orcamento');
    await preencher(page, { tipo: 'Jogo ou campeonato', cidade: 'Valinhos', nome: 'Rui' });
    await enviar(page);
    const mensagem =
      'Olá! Sou Rui. Quero um orçamento de cobertura: Jogo ou campeonato, 12/12/2026, Valinhos.';
    await expect(page.locator('[data-orcamento-status]')).toContainText('bloqueou a nova janela');
    const link = page.getByRole('link', { name: 'Abrir o WhatsApp' });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', linkEsperado(mensagem));
    await expect(link).toBeFocused();
    await page.getByRole('button', { name: 'Copiar mensagem' }).click();
    await expect(page.locator('[data-orcamento-status]')).toHaveText(
      'Mensagem copiada. Agora é só colar no WhatsApp.',
    );
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(mensagem);
  });
});

test.describe('sem JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('o formulário dá lugar ao e-mail e ao Instagram', async ({ page }) => {
    await page.goto('/#orcamento');
    await expect(page.locator('[data-orcamento]')).toBeHidden();
    await expect(
      page.locator('#orcamento').getByRole('link', { name: email }).first(),
    ).toBeVisible();
  });
});
