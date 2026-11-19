import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import { renderPage } from './src/render.js';

// O cardápio, os bairros e os horários vêm de docs/cliente/cardapio.json e entram no HTML
// na hora do build: a página fica legível pelo Google e funciona sem JavaScript.
function cardapio() {
  const arquivo = new URL('./docs/cliente/cardapio.json', import.meta.url);
  return {
    name: 'hugao-cardapio',
    configureServer(server) {
      server.watcher.add(arquivo.pathname);
    },
    transformIndexHtml(html) {
      const dados = JSON.parse(readFileSync(arquivo, 'utf-8'));
      return renderPage(html, dados);
    },
  };
}

export default defineConfig({
  plugins: [cardapio()],
});
