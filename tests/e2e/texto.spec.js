import { test, expect, PAGINAS } from './apoio.js';

// O texto publicado é real: nenhum dado provisório, chave sem trocar ou texto de enchimento,
// nem no que se lê na tela, nem nas descrições das fotos, nas metatags e nos dados estruturados.
// "Moldura provisória" marca as fotos que ainda esperam as do Behance.
const PROIBIDOS = [
  /A CONFIRMAR/i,
  /Moldura provisória/i,
  /\{\{/,
  /lorem ipsum/i,
  /\bTODO\b/,
  /\[(nome|cidade|prazo)\]/i,
];

for (const caminho of PAGINAS) {
  test(`${caminho}: nenhum texto provisório`, async ({ page }) => {
    await page.goto(caminho);
    for (const pergunta of await page.locator('summary').all()) await pergunta.click();
    const visivel = await page.locator('body').innerText();
    const descricoes = (
      await page.locator('img').evaluateAll((imgs) => imgs.map((i) => i.alt))
    ).join('\n');
    const cabecalho = await page.locator('head').innerHTML();
    for (const padrao of PROIBIDOS) {
      expect(visivel, `texto visível com ${padrao}`).not.toMatch(padrao);
      expect(descricoes, `descrição de foto com ${padrao}`).not.toMatch(padrao);
      expect(cabecalho, `metatags com ${padrao}`).not.toMatch(padrao);
    }
  });
}
