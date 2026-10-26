// Transforma os dados do site em HTML. O plugin do Vite (plugin.mjs) chama `renderizarPagina`
// para cada página: troca {{chave}} pelos textos de site.json e <!-- pdl:bloco --> pelos blocos.
import { ErroDeDados, PENDENTE, fotoDaCobertura, fotoDeCapa, fotosDaSelecao } from './dados.mjs';

const ENTIDADES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const escapar = (texto) => String(texto).replace(/[&<>"']/g, (c) => ENTIDADES[c]);

const formatoData = new Intl.DateTimeFormat('pt-BR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});
export const dataPorExtenso = (iso) => formatoData.format(new Date(`${iso}T00:00:00Z`));

// Endereço público do site, ou vazio enquanto o domínio não for confirmado.
const enderecoBase = (site) => (site.url === PENDENTE ? '' : site.url);

export function textos(site, agora = new Date()) {
  return {
    nome: site.nome,
    fotografo: site.fotografo,
    frase: site.frase,
    cidade: site.cidade,
    atendimento: site.atendimento,
    estado: site.estado,
    precoFoto: site.precoFoto,
    prazoEntrega: site.prazoEntrega,
    email: site.email,
    mailto: `mailto:${site.email}`,
    credito: site.credito,
    instagram: `@${site.instagram}`,
    instagramUrl: `https://www.instagram.com/${site.instagram}/`,
    behance: site.behance,
    fotto: site.fotto,
    ano: String(agora.getFullYear()),
  };
}

const srcset = (id, larguras, extensao) =>
  larguras.map((largura) => `/fotos/${id}-${largura}w.${extensao} ${largura}w`).join(', ');

// Versão usada por navegadores sem srcset: a primeira de 960 px ou mais, ou a maior que houver.
const larguraPadrao = (larguras) => larguras.find((largura) => largura >= 960) ?? larguras.at(-1);

// `decorativa`: a mesma foto repetida como ilustração; o leitor de tela não a lê de novo.
export function picture(foto, info, { sizes, prioridade = false, decorativa = false }) {
  const estilo = [`--cor: ${info.cor}`, foto.foco ? `--foco: ${foto.foco}` : null]
    .filter(Boolean)
    .join('; ');
  const carregamento = prioridade ? 'fetchpriority="high"' : 'loading="lazy"';
  return [
    `<picture class="foto" style="${estilo}">`,
    `<source type="image/avif" srcset="${srcset(foto.id, info.larguras, 'avif')}" sizes="${sizes}">`,
    `<img src="/fotos/${foto.id}-${larguraPadrao(info.larguras)}w.webp" srcset="${srcset(foto.id, info.larguras, 'webp')}" sizes="${sizes}" width="${info.largura}" height="${info.altura}" alt="${decorativa ? '' : escapar(foto.alt)}" ${carregamento} decoding="async">`,
    '</picture>',
  ].join('');
}

function blocoCapa({ fotos, gerado }, { sizes = '100vw' }) {
  const capa = fotoDeCapa(fotos);
  return capa ? picture(capa, gerado[capa.id], { sizes, prioridade: true }) : '';
}

// Trabalho: pares desencontrados que se repetem a cada oito fotos (a grade de .galeria em
// style.css). Cada posição tem a sua largura, no computador (fração da tela) e no celular.
const LARGURAS_GALERIA = {
  computador: [31, 47, 47, 23, 31, 47, 47, 23],
  celular: [66, 80, 52, 100],
};

// `quantas`: só as primeiras fotos da seleção (a página de privacidade mostra quatro).
function blocoSelecao({ fotos, gerado }, { quantas }) {
  const selecao = fotosDaSelecao(fotos);
  return selecao
    .slice(0, quantas === undefined ? selecao.length : Number(quantas))
    .map((foto, i) => {
      const computador = LARGURAS_GALERIA.computador[i % 8];
      const celular = LARGURAS_GALERIA.celular[i % 4];
      const sizes = `(min-width: 48.01em) ${computador}vw, ${celular}vw`;
      const legenda = foto.legenda ? `<figcaption>${escapar(foto.legenda)}</figcaption>` : '';
      return `<figure class="galeria-foto" data-foto="${foto.id}">${picture(foto, gerado[foto.id], { sizes })}${legenda}</figure>`;
    })
    .join('\n');
}

// Cobertura: a mesma foto em cada passo, vista por uma lente cada vez mais aberta.
function blocoFotoCobertura({ fotos, gerado }, { sizes = '100vw' }) {
  const foto = fotoDaCobertura(fotos);
  return foto ? picture(foto, gerado[foto.id], { sizes, decorativa: true }) : '';
}

function blocoEventos({ eventos, site }) {
  if (!eventos.length) {
    return `<p class="eventos-vazio">Os álbuns aparecem aqui assim que as fotos entram no Fotto. Enquanto isso, veja <a href="${escapar(site.fotto)}">todos os álbuns no Fotto</a>.</p>`;
  }
  const itens = eventos.map(
    (evento) =>
      `<li class="evento" data-evento><a class="evento-link" href="${escapar(evento.fotto)}"><span class="evento-nome">${escapar(evento.nome)}</span> <span class="evento-local">${escapar(evento.local)}</span> <time class="evento-data" datetime="${evento.data}">${dataPorExtenso(evento.data)}</time><span class="visualmente-oculto">, ver fotos no Fotto</span></a></li>`,
  );
  return `<ol class="eventos" data-eventos>\n${itens.join('\n')}\n</ol>`;
}

function blocoUltimoEvento({ eventos, site }) {
  const ultimo = eventos[0];
  if (!ultimo) {
    return `<p class="ultimo-evento"><a href="${escapar(site.fotto)}">Ver os álbuns no Fotto</a></p>`;
  }
  return `<p class="ultimo-evento">Último evento: <a href="${escapar(ultimo.fotto)}">${escapar(ultimo.nome)}, <time datetime="${ultimo.data}">${dataPorExtenso(ultimo.data)}</time></a></p>`;
}

// Sem domínio confirmado, os @id ficam relativos à própria página e url/image saem do JSON-LD.
export function dadosEstruturados(site, { comImagem }) {
  const base = enderecoBase(site);
  const instagram = `https://www.instagram.com/${site.instagram}/`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'LocalBusiness',
        '@id': `${base}/#negocio`,
        name: site.nome,
        description: site.frase,
        url: base ? `${base}/` : undefined,
        image: base && comImagem ? `${base}/og.jpg` : undefined,
        address: {
          '@type': 'PostalAddress',
          addressLocality: site.cidade,
          addressRegion: site.estado,
          addressCountry: site.pais,
        },
        areaServed: site.atendimento,
        founder: { '@id': `${base}/#fotografo` },
        sameAs: [instagram, site.behance, site.fotto],
      },
      {
        '@type': 'Person',
        '@id': `${base}/#fotografo`,
        name: site.fotografo,
        jobTitle: 'Fotógrafo',
        worksFor: { '@id': `${base}/#negocio` },
        sameAs: [instagram, site.behance],
      },
    ],
  };
}

const conteudo = (html, padrao) => padrao.exec(html)?.[1]?.trim() ?? '';

// Metatags da prévia do link (WhatsApp, redes), canônico, preload da capa e JSON-LD.
// A prévia exige URLs absolutas: sem domínio confirmado, canônico, og:url e og:image ficam de fora
// (e o teste de SEO acusa a falta).
function blocoHead(dados, html) {
  const { site, fotos, gerado } = dados;
  const base = enderecoBase(site);
  const capa = fotoDeCapa(fotos);
  const titulo = conteudo(html, /<title>([\s\S]*?)<\/title>/);
  const descricao = conteudo(html, /<meta\s+name="description"\s+content="([^"]*)"/);
  const linhas = [
    '<meta property="og:type" content="website">',
    '<meta property="og:locale" content="pt_BR">',
    `<meta property="og:site_name" content="${escapar(site.nome)}">`,
    `<meta property="og:title" content="${titulo}">`,
    `<meta property="og:description" content="${descricao}">`,
  ];
  if (base) {
    linhas.push(
      `<link rel="canonical" href="${base}/">`,
      `<meta property="og:url" content="${base}/">`,
    );
  }
  if (capa && base) {
    linhas.push(
      `<meta property="og:image" content="${base}/og.jpg">`,
      '<meta property="og:image:type" content="image/jpeg">',
      '<meta property="og:image:width" content="1200">',
      '<meta property="og:image:height" content="630">',
      `<meta property="og:image:alt" content="${escapar(capa.alt)}">`,
      '<meta name="twitter:card" content="summary_large_image">',
    );
  }
  if (capa) {
    // O preload precisa anunciar o mesmo sizes da capa, senão o navegador baixa duas versões.
    const sizes = /<!--\s*pdl:capa[^>]*?\ssizes="([^"]*)"/.exec(html)?.[1] ?? '100vw';
    const info = gerado[capa.id];
    linhas.push(
      `<link rel="preload" as="image" type="image/avif" imagesrcset="${srcset(capa.id, info.larguras, 'avif')}" imagesizes="${sizes}" fetchpriority="high">`,
    );
  }
  // "<" escapado para que nenhum texto feche o <script> antes da hora.
  const json = JSON.stringify(dadosEstruturados(site, { comImagem: Boolean(capa) })).replace(
    /</g,
    '\\u003c',
  );
  linhas.push(`<script type="application/ld+json">${json}</script>`);
  return linhas.join('\n');
}

const BLOCOS = {
  head: (dados, opcoes, html) => blocoHead(dados, html),
  capa: blocoCapa,
  selecao: blocoSelecao,
  'foto-cobertura': blocoFotoCobertura,
  eventos: blocoEventos,
  'ultimo-evento': blocoUltimoEvento,
};

const MARCADOR = /<!--\s*pdl:([a-z-]+)((?:\s+[a-z-]+="[^"]*")*)\s*-->/g;
const CHAVE = /\{\{\s*([A-Za-z]+)\s*\}\}/g;

export function renderizarPagina(html, dados, { agora } = {}) {
  const problemas = [];
  const mapa = textos(dados.site, agora);
  let saida = html.replace(CHAVE, (trecho, chave) => {
    if (chave in mapa) return escapar(mapa[chave]);
    problemas.push(
      `HTML: {{${chave}}} não existe (as chaves são: ${Object.keys(mapa).join(', ')}).`,
    );
    return trecho;
  });
  saida = saida.replace(MARCADOR, (trecho, nome, atributos) => {
    const bloco = BLOCOS[nome];
    if (!bloco) {
      problemas.push(`HTML: bloco <!-- pdl:${nome} --> não existe.`);
      return trecho;
    }
    const opcoes = Object.fromEntries(
      [...atributos.matchAll(/([a-z-]+)="([^"]*)"/g)].map(([, chave, valor]) => [chave, valor]),
    );
    return bloco(dados, opcoes, saida);
  });
  if (problemas.length) throw new ErroDeDados(problemas);
  return saida;
}
