import { test, expect, PAGINAS, percorrer } from './apoio.js';

// Nada cortado e nenhuma rolagem lateral em 1440 px e 390 px. As capturas de página inteira ficam
// em test-results/ (anexadas ao relatório) para a conferência visual.
const TAMANHOS = [
  { nome: '1440', width: 1440, height: 900 },
  { nome: '390', width: 390, height: 844 },
];

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
      // Uma foto ampliada dentro de uma moldura que a recorta não aparece fora da moldura.
      const moldura = el.parentElement?.closest('picture');
      const recortada = moldura && /hidden|clip/.test(getComputedStyle(moldura).overflow);
      if (!recortada && (caixa.right > largura + 1 || caixa.left < -1)) {
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
      test.setTimeout(90_000);
      await page.setViewportSize({ width: tamanho.width, height: tamanho.height });
      await page.goto(caminho);
      await percorrer(page);
      expect(await problemasDeLayout(page)).toEqual([]);
      // Só para a captura de página inteira: a abertura vira um bloco comum e as fotos ligadas à
      // rolagem aparecem abertas, como ficam quando chegam à tela. As medições acima foram feitas
      // na página como ela é.
      await page.addStyleTag({
        content:
          '.abertura{height:auto}.abertura-palco{position:relative}.galeria-foto .foto,.galeria-foto img,.passo-quadro .foto,.passo-quadro img{animation:none}',
      });
      await percorrer(page);
      const nome = `${caminho === '/' ? 'inicio' : 'privacidade'}-${tamanho.nome}-${info.project.name}.png`;
      const captura = await page.screenshot({
        path: info.outputPath(nome),
        fullPage: true,
        scale: 'css',
      });
      await info.attach(nome, { body: captura, contentType: 'image/png' });
    });
  }
}
