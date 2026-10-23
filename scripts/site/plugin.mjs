// Plugin do Vite: escreve no HTML, no build e no servidor de desenvolvimento, o que vem de
// src/dados/ (eventos, fotos, prévia do link, dados estruturados). A página funciona sem JavaScript
// e a foto de capa não espera script para carregar. Dados inválidos param o build com a lista de
// problemas em português.
import { join, sep } from 'node:path';
import { ErroDeDados, lerDados } from './dados.mjs';
import { renderizarPagina } from './render.mjs';

export function pdlSite({ raiz }) {
  const pastaDados = join(raiz, 'src', 'dados');
  return {
    name: 'pdl-site',
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
