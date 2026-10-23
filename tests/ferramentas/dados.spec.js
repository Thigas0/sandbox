import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { test, expect } from '@playwright/test';
import {
  ErroDeDados,
  lerDados,
  lerJson,
  validarEventos,
  validarFotos,
  validarSite,
} from '../../scripts/site/dados.mjs';
import { arquivosDeBusca } from '../../scripts/site/plugin.mjs';
import { renderizarPagina } from '../../scripts/site/render.mjs';

// Quem atualiza os eventos sozinho precisa de erros que digam o arquivo, o item e o que corrigir.
const problemas = (fn) => {
  try {
    fn();
  } catch (erro) {
    if (erro instanceof ErroDeDados) return erro.problemas;
    throw erro;
  }
  return [];
};

const evento = (campos = {}) => ({
  nome: 'Festa de Formatura',
  data: '2026-10-18',
  local: 'Clube Tal, Campinas',
  fotto: 'https://www.fotto.com.br/pdl_fotografia_imagem/festa',
  ...campos,
});

test('os arquivos de dados do repositório são válidos', () => {
  expect(problemas(() => lerDados(new URL('../..', import.meta.url).pathname))).toEqual([]);
});

test('eventos: data fora do formato, link de outro site, campo errado e link repetido', () => {
  expect(
    problemas(() =>
      validarEventos([
        evento({ data: '18/10/2026' }),
        evento({ nome: 'Jogo', fotto: 'https://www.instagram.com/x' }),
        { ...evento({ nome: 'Copa', fotto: 'https://www.fotto.com.br/a' }), lugar: 'Ginásio' },
        evento({ nome: 'Outra', fotto: 'https://www.fotto.com.br/a' }),
        evento({ nome: 'Sem data', data: '' }),
        evento({
          nome: 'Dia que não existe',
          data: '2026-02-30',
          fotto: 'https://www.fotto.com.br/b',
        }),
      ]),
    ),
  ).toEqual([
    'eventos.json, item 1 ("Festa de Formatura"): "data" deve ser AAAA-MM-DD, por exemplo 2026-10-18 (recebi "18/10/2026").',
    'eventos.json, item 2 ("Jogo"): "fotto" deve ser um link https do Fotto (recebi "https://www.instagram.com/x").',
    'eventos.json, item 3 ("Copa"): campo desconhecido "lugar" (os campos são nome, data, local e fotto).',
    'eventos.json, item 4 ("Outra"): o link do Fotto é o mesmo do item 3.',
    'eventos.json, item 5 ("Sem data"): falta "data".',
    'eventos.json, item 5 ("Sem data"): o link do Fotto é o mesmo do item 1.',
    'eventos.json, item 6 ("Dia que não existe"): "data" deve ser AAAA-MM-DD, por exemplo 2026-10-18 (recebi "2026-02-30").',
  ]);
});

test('eventos: subdomínio do Fotto é aceito', () => {
  expect(
    problemas(() => validarEventos([evento({ fotto: 'https://pdl.fotto.com.br/evento/123' })])),
  ).toEqual([]);
});

test('um JSON com vírgula sobrando diz a linha do erro', ({}, info) => {
  const pasta = info.outputPath();
  mkdirSync(pasta, { recursive: true });
  const arquivo = join(pasta, 'eventos.json');
  writeFileSync(arquivo, '[\n  {\n    "nome": "Festa",\n  },\n]\n');
  const [mensagem] = problemas(() => lerJson(arquivo, 'eventos.json'));
  expect(mensagem).toMatch(/^eventos\.json: JSON inválido, linha 4, coluna \d+\./);
});

test('site.json: WhatsApp sem o 55 e Instagram com @ são recusados', () => {
  const site = {
    nome: 'PDL',
    fotografo: 'Pedro',
    frase: 'Frase',
    cidade: 'Campinas',
    atendimento: 'Campinas e região',
    estado: 'SP',
    pais: 'BR',
    whatsapp: '(15) 99698-8578',
    email: 'A CONFIRMAR',
    instagram: '@pdl',
    behance: 'https://www.behance.net/x',
    fotto: 'https://www.fotto.com.br/x',
    url: 'A CONFIRMAR',
    precoFoto: 'R$ 15',
    prazoEntrega: '3 dias',
    credito: 'Pedro',
  };
  expect(problemas(() => validarSite(site))).toEqual([
    'site.json, "whatsapp": use só números, com 55 e o DDD, por exemplo 5519999998888.',
    'site.json, "instagram": escreva só o nome do perfil, sem @ e sem link.',
  ]);
});

test('fotos: id inválido, duas capas e pessoasIdentificaveis ausente', () => {
  const foto = { id: 'a', arquivo: 'x.jpg', alt: 'Foto', pessoasIdentificaveis: false, capa: true };
  expect(
    problemas(() =>
      validarFotos([
        foto,
        { ...foto, id: 'B C' },
        { id: 'c', arquivo: 'y.jpg', alt: 'Y', capa: true },
      ]),
    ),
  ).toEqual([
    'fotos.json, item 2 ("B C"): "id" usa só letras minúsculas, números e hífens, por exemplo festa-pista-01.',
    'fotos.json, item 3 ("c"): "pessoasIdentificaveis" deve ser true ou false.',
    'fotos.json: só uma foto pode ter "capa": true.',
  ]);
});

test('o HTML gerado traz cada evento com o link exato, do mais recente ao mais antigo', () => {
  const dados = lerDados(new URL('../..', import.meta.url).pathname);
  const eventos = [
    evento({ nome: 'Antigo', data: '2026-01-10', fotto: 'https://www.fotto.com.br/x/antigo' }),
    evento({ nome: 'Novo', data: '2026-10-18', fotto: 'https://www.fotto.com.br/x/novo' }),
  ];
  const html = renderizarPagina('<!-- pdl:ultimo-evento --><!-- pdl:eventos -->', {
    ...dados,
    eventos: [...eventos].sort((a, b) => b.data.localeCompare(a.data)),
  });
  const links = [...html.matchAll(/class="evento-link" href="([^"]+)"/g)].map((m) => m[1]);
  expect(links).toEqual(['https://www.fotto.com.br/x/novo', 'https://www.fotto.com.br/x/antigo']);
  expect(html).toContain('Último evento: <a href="https://www.fotto.com.br/x/novo">Novo');
  expect(html).toContain('<time datetime="2026-10-18">18 de outubro de 2026</time>');
});

test('a seleção põe a capa na lente e divide o resto entre tela cheia e pares', () => {
  const dados = lerDados(new URL('../..', import.meta.url).pathname);
  const info = { larguras: [640, 960], largura: 960, altura: 640, cor: '#123456' };
  const foto = (id, extra = {}) => ({
    id,
    arquivo: `${id}.jpg`,
    alt: `Foto ${id}`,
    pessoasIdentificaveis: false,
    ...extra,
  });
  const fotos = [foto('a'), foto('capa', { capa: true }), foto('b'), foto('c')];
  const gerado = Object.fromEntries(fotos.map((f) => [f.id, info]));
  const html = renderizarPagina(
    '<!-- pdl:capa sizes="100vw" -->|<!-- pdl:selecao sequencia="2" sizes="100vw" sizes-resto="50vw" -->',
    { ...dados, fotos, gerado },
  );
  const [capa, selecao] = html.split('|');
  expect(capa).toContain('alt="Foto capa" fetchpriority="high"');
  expect(capa).not.toContain('loading="lazy"');
  const ids = (classe) =>
    [...selecao.matchAll(new RegExp(`class="${classe}" data-foto="([^"]+)"`, 'g'))].map(
      (m) => m[1],
    );
  expect(ids('selecao-lamina')).toEqual(['a', 'b']);
  expect(ids('selecao-par')).toEqual(['c']);
  expect(selecao).toContain('sizes="50vw" width="960" height="640" alt="Foto c" loading="lazy"');
});

test('uma chave {{...}} que não existe para o build', () => {
  const dados = lerDados(new URL('../..', import.meta.url).pathname);
  expect(problemas(() => renderizarPagina('<p>{{telefone}}</p>', dados))[0]).toMatch(
    /^HTML: \{\{telefone\}\} não existe/,
  );
});

test('robots.txt sempre; sitemap só com o domínio confirmado', () => {
  expect(arquivosDeBusca({ url: 'A CONFIRMAR' })).toEqual({
    'robots.txt': 'User-agent: *\nAllow: /\n',
  });
  const comDominio = arquivosDeBusca({ url: 'https://www.exemplo.com.br' });
  expect(comDominio['robots.txt']).toBe(
    'User-agent: *\nAllow: /\n\nSitemap: https://www.exemplo.com.br/sitemap.xml\n',
  );
  expect(comDominio['sitemap.xml']).toContain('<loc>https://www.exemplo.com.br/</loc>');
  expect(comDominio['sitemap.xml']).toContain(
    '<loc>https://www.exemplo.com.br/privacidade.html</loc>',
  );
});
