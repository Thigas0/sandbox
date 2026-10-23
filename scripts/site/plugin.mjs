// Plugin do Vite: escreve no HTML, no build e no servidor de desenvolvimento, o que vem de
// src/dados/ (eventos, fotos, prévia do link, dados estruturados). A página funciona sem JavaScript
// e a foto de capa não espera script para carregar. Dados inválidos param o build com a lista de
// problemas em português.
import { join, sep } from 'node:path';
import { ErroDeDados, PENDENTE, lerDados } from './dados.mjs';
import { renderizarPagina } from './render.mjs';

// Páginas publicadas, na ordem do sitemap.
const PAGINAS = ['/', '/privacidade.html'];

// robots.txt libera tudo; o sitemap só existe com o endereço do site confirmado (URL absoluta).
export function arquivosDeBusca(site) {
  const base = site.url === PENDENTE ? null : site.url;
  const robots = ['User-agent: *', 'Allow: /', base ? `\nSitemap: ${base}/sitemap.xml` : '']
    .join('\n')
    .trimEnd();
  const arquivos = { 'robots.txt': `${robots}\n` };
  if (base) {
    const urls = PAGINAS.map((pagina) => `  <url><loc>${base}${pagina}</loc></url>`).join('\n');
    arquivos['sitemap.xml'] =
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  }
  return arquivos;
}

export function pdlSite({ raiz }) {
  const pastaDados = join(raiz, 'src', 'dados');
  return {
    name: 'pdl-site',
    generateBundle() {
      for (const [fileName, source] of Object.entries(arquivosDeBusca(lerDados(raiz).site))) {
        this.emitFile({ type: 'asset', fileName, source });
      }
    },
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        try {
          return renderizarPagina(html, lerDados(raiz));
        } catch (erro) {
          if (!(erro instanceof ErroDeDados)) throw erro;
          throw new Error(
            `Os dados do site têm problemas:\n${erro.problemas.map((p) => `  - ${p}`).join('\n')}`,
            { cause: erro },
          );
        }
      },
    },
    configureServer(server) {
      // Editar um JSON de dados recarrega a página aberta no `npm run dev`.
      server.watcher.add(pastaDados);
      server.watcher.on('change', (arquivo) => {
        if (arquivo.startsWith(pastaDados + sep)) server.ws.send({ type: 'full-reload' });
      });
    },
  };
}
