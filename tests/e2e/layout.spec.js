import { test, expect, PAGINAS } from './apoio.js';

// Nada cortado e nenhuma rolagem lateral em 1440 px e 390 px. As capturas de página inteira ficam
// em test-results/ (anexadas ao relatório) para a conferência visual.
const TAMANHOS = [
  { nome: '1440', width: 1440, height: 900 },
  { nome: '390', width: 390, height: 844 },
];

// Rola até o fim para carregar as fotos com loading="lazy" antes de medir e fotografar.
async function percorrer(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight / 2) {
      window.scrollTo(0, y);
      await new Promise((pronto) => requestAnimationFrame(() => setTimeout(pronto, 30)));
    }
    window.scrollTo(0, 0);
  });
}

const problemasDeLayout = (page) =>
  page.evaluate(() => {
    const largura = document.documentElement.clientWidth;
    const problemas = [];
    if (document.documentElement.scrollWidth > largura) {
      problemas.push(`rolagem lateral: ${document.documentElement.scrollWidth}px > ${largura}px`);
    }
    const descrever = (el) =>
      `${el.tagName.toLowerCase()}${el.className ? '.' + String(el.className).split(' ')[0] : ''} "${el.textContent.trim().slice(0, 30)}"`;
    for (const el of document.body.querySelectorAll('*')) {
      if (el.closest('.visualmente-oculto, .pular, [hidden], noscript')) continue;
      const caixa = el.getBoundingClientRect();
      if (caixa.width === 0 || caixa.height === 0) continue;
      if (caixa.right > largura + 1 || caixa.left < -1) {
        problemas.push(
          `${descrever(el)} sai da tela (${Math.round(caixa.left)}–${Math.round(caixa.right)})`,
        );
      }
      const estilo = getComputedStyle(el);
      const corta = /hidden|clip/.test(estilo.overflowX) || /hidden|clip/.test(estilo.overflowY);
      const temTexto = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
      if (
        corta &&
        temTexto &&
        (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1)
      ) {
        problemas.push(`${descrever(el)} tem texto cortado`);
      }
    }
    return problemas;
  });

for (const tamanho of TAMANHOS) {
  for (const caminho of PAGINAS) {
    test(`${caminho} em ${tamanho.nome} px: nada cortado, sem rolagem lateral`, async ({
      page,
    }, info) => {
      await page.setViewportSize({ width: tamanho.width, height: tamanho.height });
      await page.goto(caminho);
      await percorrer(page);
      expect(await problemasDeLayout(page)).toEqual([]);
      const nome = `${caminho === '/' ? 'inicio' : 'privacidade'}-${tamanho.nome}-${info.project.name}.png`;
      const captura = await page.screenshot({ path: info.outputPath(nome), fullPage: true });
      await info.attach(nome, { body: captura, contentType: 'image/png' });
    });
  }
}
