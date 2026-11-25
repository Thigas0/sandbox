import { defineConfig } from 'vite';
import { CSP_META } from './src/seguranca.js';

// A CSP entra como <meta> só no build: o servidor de desenvolvimento do Vite injeta estilos
// inline para o hot reload, e a política os bloquearia.
function cspNoBuild() {
  return {
    name: 'glaux-csp',
    apply: 'build',
    transformIndexHtml() {
      return [
        {
          tag: 'meta',
          attrs: { 'http-equiv': 'Content-Security-Policy', content: CSP_META },
          injectTo: 'head-prepend',
        },
      ];
    },
  };
}

export default defineConfig({
  plugins: [cspNoBuild()],
  build: {
    // Sem data: URIs embutidas no JS ou CSS; fontes e imagens ficam como arquivos.
    assetsInlineLimit: 0,
  },
});
