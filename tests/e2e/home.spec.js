/* global document, getComputedStyle -- usados dentro de page.evaluate, que roda no navegador */
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

test.describe('home da Casa do Anfitrião', () => {
  test('carrega com título, marca e o endereço', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Casa do Anfitrião/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Casa do Anfitrião');
    await expect(page.locator('.visit-address')).toContainText('Av. Getúlio Vargas, 100');
  });

  test('o botão principal abre o WhatsApp da casa com mensagem pronta', async ({ page }) => {
    await page.goto('/');
    const cta = page.getByRole('link', { name: 'Pedir pelo WhatsApp' });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', /^https:\/\/wa\.me\/5519997273330\?text=/);
    await expect(cta).toHaveAttribute('target', '_blank');
  });

  test('todo link externo usa rel="noopener noreferrer"', async ({ page }) => {
    await page.goto('/');
    const externos = page.locator('a[target="_blank"]');
    const total = await externos.count();
    expect(total).toBeGreaterThan(0);
    for (let i = 0; i < total; i += 1) {
      await expect(externos.nth(i)).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });

  test('os links de seção levam ao cardápio, encomendas, eventos e visite', async ({ page }) => {
    await page.goto('/');
    for (const [nome, id] of [
      ['Cardápio', 'cardapio'],
      ['Encomendas', 'encomendas'],
      ['Eventos', 'eventos'],
      ['Visite', 'visite'],
    ]) {
      await page
        .getByRole('navigation', { name: 'Seções' })
        .getByRole('link', { name: nome })
        .click();
      await expect(page).toHaveURL(new RegExp(`#${id}$`));
      await expect(page.locator(`#${id}`)).toBeInViewport();
    }
  });

  test('mostra "Aberto agora" numa terça às 15h de Itapira', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-11-24T15:00:00-03:00'));
    await page.goto('/');
    await expect(page.locator('[data-open-status]')).toHaveText('Aberto agora, até as 19h');
  });

  test('mostra "Fechado agora" numa segunda-feira', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-11-23T15:00:00-03:00'));
    await page.goto('/');
    await expect(page.locator('[data-open-status]')).toHaveText(
      'Fechado agora. Abrimos de terça a sábado',
    );
  });

  test('os dados estruturados trazem o mesmo NAP do Google', async ({ page }) => {
    await page.goto('/');
    const json = await page.locator('script[type="application/ld+json"]').textContent();
    const dados = JSON.parse(json);
    expect(dados['@type']).toBe('CafeOrCoffeeShop');
    expect(dados.name).toBe('Casa do Anfitrião');
    expect(dados.telephone).toBe('+55 19 99727-3330');
    expect(dados.address.streetAddress).toContain('Av. Getúlio Vargas, 100');
    expect(dados.address.postalCode).toBe('13974-110');
  });

  test('não há rolagem horizontal', async ({ page }) => {
    await page.goto('/');
    const larguras = await page.evaluate(() => [
      document.documentElement.scrollWidth,
      document.documentElement.clientWidth,
    ]);
    expect(larguras[0]).toBeLessThanOrEqual(larguras[1]);
  });

  test('com movimento reduzido, todo o conteúdo fica visível sem rolar', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const invisiveis = await page.evaluate(
      () =>
        [...document.querySelectorAll('.reveal')].filter(
          (el) => Number(getComputedStyle(el).opacity) < 1,
        ).length,
    );
    expect(invisiveis).toBe(0);
  });

  test('não há problemas de acessibilidade detectáveis (WCAG A/AA)', async ({ page }) => {
    await page.goto('/');
    const resultado = await new AxeBuilder({ page }).withTags(WCAG).analyze();
    expect(resultado.violations).toEqual([]);
  });
});

test.describe('páginas de apoio', () => {
  test('a política de privacidade abre pelo rodapé e passa no axe', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Política de privacidade' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Política de privacidade');
    const resultado = await new AxeBuilder({ page }).withTags(WCAG).analyze();
    expect(resultado.violations).toEqual([]);
  });

  test('a página 404 leva de volta à home', async ({ page }) => {
    await page.goto('/404.html');
    await page.getByRole('link', { name: 'Ir para a página inicial' }).click();
    await expect(page).toHaveTitle(/Casa do Anfitrião/);
  });
});
