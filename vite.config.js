import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// Site estático com três páginas: a home, a política de privacidade e a página 404.
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        privacidade: resolve(import.meta.dirname, 'privacidade.html'),
        404: resolve(import.meta.dirname, '404.html'),
      },
    },
  },
});
