import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import { cspParaMeta, montarCsp, origemDaApi } from './src/seguranca.js';

// A CSP entra como <meta> só no build: o servidor de desenvolvimento do Vite injeta estilos
// inline para o hot reload, e a política os bloquearia. O app (/app/) libera no connect-src só a
// origem do backend, quando VITE_GLAUX_API_URL estiver definida.
function cspNoBuild(origemApi) {
  return {
    name: 'glaux-csp',
    apply: 'build',
    transformIndexHtml(_html, contexto) {
      const doApp = contexto.path.startsWith('/app/');
      const csp = montarCsp(doApp && origemApi ? [origemApi] : []);
      return [
        {
          tag: 'meta',
          attrs: { 'http-equiv': 'Content-Security-Policy', content: cspParaMeta(csp) },
          injectTo: 'head-prepend',
        },
      ];
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  return {
    plugins: [cspNoBuild(origemDaApi(env.VITE_GLAUX_API_URL))],
    build: {
      // Sem data: URIs embutidas no JS ou CSS; fontes e imagens ficam como arquivos.
      assetsInlineLimit: 0,
      rollupOptions: {
        input: {
          landing: fileURLToPath(new URL('./index.html', import.meta.url)),
          app: fileURLToPath(new URL('./app/index.html', import.meta.url)),
        },
      },
    },
  };
});
