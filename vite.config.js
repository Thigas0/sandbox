import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import { renderDepoimentos } from './src/lib/depoimentos.js';

const lerJson = (caminho) => JSON.parse(readFileSync(new URL(caminho, import.meta.url), 'utf8'));

// Os cabeçalhos de segurança vivem em vercel.json. O `vite preview` (usado pelos testes) aplica os
// mesmos, para que a CSP seja testada no navegador antes de ir ao ar.
const vercel = lerJson('./vercel.json');
const cabecalhosDoSite = Object.fromEntries(
  vercel.headers.find((regra) => regra.source === '/(.*)').headers.map((h) => [h.key, h.value]),
);

const depoimentos = {
  name: 'catelle-depoimentos',
  transformIndexHtml(html) {
    const dados = lerJson('./src/data/depoimentos.json');
    return html.replace('<!-- DEPOIMENTOS -->', renderDepoimentos(dados));
  },
};

export default defineConfig({
  plugins: [depoimentos],
  preview: { headers: cabecalhosDoSite },
});
