import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { pdlSite } from './scripts/site/plugin.mjs';

const raiz = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [pdlSite({ raiz })],
  build: {
    rollupOptions: {
      input: {
        inicio: fileURLToPath(new URL('index.html', import.meta.url)),
        privacidade: fileURLToPath(new URL('privacidade.html', import.meta.url)),
      },
    },
  },
});
