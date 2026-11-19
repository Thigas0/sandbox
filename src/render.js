// Monta, na hora do build, as partes da página que vêm de docs/cliente/cardapio.json.
// Roda no Node (vite.config.js) e não usa nada do navegador.

const DIAS = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
const DIAS_SCHEMA = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const LINKS = {
  bsfood: 'https://hugaolanches.bsfood.com.br',
  whatsapp:
    'https://wa.me/5519971681738?text=Ol%C3%A1%2C%20Hug%C3%A3o!%20Quero%20fazer%20um%20pedido.',
  telefone: 'tel:+5519971681738',
  mapa: 'https://www.google.com/maps/place/Hug%C3%A3o+Lanches/@-22.6140673,-46.6972452,17z/data=!3m1!4b1!4m6!3m5!1s0x94c91879d2927499:0x7ddee9830273a063!8m2!3d-22.6140673!4d-46.6972452!16s%2Fg%2F11c2y3y2gx',
  instagram: 'https://www.instagram.com/hugao_lanches_oficial/',
};

// Agrupa categorias do bsfood em seções mais curtas para quem lê no celular.
const SECOES = [
  {
    id: 'classicos',
    titulo: 'Clássicos do Hugão',
    nota: 'Os lanches que fizeram o nome da casa. Vêm com batata frita.',
    de: ['Clássicos do Hugão'],
  },
  {
    id: 'gourmet',
    titulo: 'Gourmet no brioche',
    nota: 'Hambúrguer de 160 g, pão brioche e maionese defumada.',
    de: ['Artesanais Gourmetizados do Hugão'],
  },
  {
    id: 'novidades',
    titulo: 'Novidades',
    nota: 'O que entrou por último no cardápio.',
    de: ['Novidades do Hugão'],
  },
  {
    id: 'tradicionais',
    titulo: 'Tradicionais',
    nota: 'O x-burguer de sempre, em 90 g ou 120 g, com batata.',
    de: ['Lanches Tradicionais'],
  },
  {
    id: 'calabresa-e-contra-file',
    titulo: 'Calabresa e contra-filé',
    nota: 'No pão francês especial, com batata.',
    de: ['Lanches de Linguiça Calabresa Defumada', 'Lanches Contra-filé'],
  },
  {
    id: 'hot-dogs-e-vegetarianos',
    titulo: 'Hot dogs e vegetarianos',
    nota: 'Prensados na chapa. Os vegetarianos levam ovo e queijo.',
    de: ["Hot Dog's", 'Vegetarianos'],
  },
  {
    id: 'kids',
    titulo: 'Lanchinho kids',
    nota: 'Acompanha água, suco de caixinha ou mini refrigerante.',
    de: ['Lanchinho Kids'],
  },
  {
    id: 'porcoes',
    titulo: 'Porções',
    nota: 'Batata individual, média ou grande.',
    de: ['Porções', 'Entradinhas'],
  },
  {
    id: 'bebidas',
    titulo: 'Bebidas',
    nota: 'Sucos de polpa com água ou com leite (+ R$ 2,00).',
    de: [
      'Soda italiana',
      'Sucos Natural',
      'Sucos Polpa',
      'Vitaminas',
      'Refrigerantes Lata',
      'Refrigerantes 600ml',
      'Refrigerantes 1 Lt',
      'Refrigerantes KS',
      'Sucos Lata',
      'Água',
      "Cervejas Long Neck's",
      'Cervejas Lata',
    ],
  },
  {
    id: 'sobremesas',
    titulo: 'Sobremesas e doces',
    nota: 'Picolés e chocolates para fechar.',
    de: ['Sobremesa', 'DOCES'],
  },
];

export function esc(texto) {
  return String(texto ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function preco(centavos) {
  return `R$ ${(centavos / 100).toFixed(2).replace('.', ',')}`;
}

// "X-BACON" vira "X-Bacon"; "CHEDDAR BURG ESPECIAL" vira "Cheddar Burg Especial".
export function nomeLimpo(nome) {
  const ligacoes = new Set(['da', 'das', 'de', 'do', 'dos', 'e']);
  return nome
    .split(' ')
    .map((palavra, i) => {
      const caixaAlta = palavra === palavra.toUpperCase() && /\p{Lu}{2}/u.test(palavra);
      if (i > 0 && ligacoes.has(palavra.toLowerCase())) return palavra.toLowerCase();
      if (!caixaAlta) return palavra;
      return palavra
        .toLowerCase()
        .replace(/(^|[-/])(\p{L})/gu, (m, sep, letra) => sep + letra.toUpperCase());
    })
    .join(' ');
}

// Algumas descrições do bsfood vêm sem espaço depois da vírgula.
export function descricaoLimpa(texto) {
  return texto
    .replace(/,(?=\S)/g, ', ')
    .replace(/\s+/g, ' ')
    .trim();
}

function gramas(variante) {
  const m = /(\d+)\s*g/.exec(variante || '');
  return m ? `${m[1]} g` : null;
}

// Junta as variantes de 90 g e 120 g de um mesmo lanche numa linha só.
export function agrupar(itens) {
  const grupos = new Map();
  for (const item of itens) {
    if (item.duplicado_de) continue;
    // "Cheddar Burg Especial tradicional" (90 g) é o mesmo lanche do de 120 g.
    const nome = nomeLimpo(item.nome).replace(/\s+tradicional$/i, '');
    const chave = nome.toLowerCase();
    if (!grupos.has(chave)) grupos.set(chave, { ...item, nome, precos: [] });
    const grupo = grupos.get(chave);
    grupo.precos.push({ rotulo: gramas(item.variante), centavos: item.preco_centavos });
    grupo.mais_vendido ||= item.mais_vendido;
  }
  for (const grupo of grupos.values()) {
    grupo.precos.sort((a, b) => a.centavos - b.centavos);
  }
  return [...grupos.values()];
}

export function secoesDoCardapio(dados) {
  const porNome = new Map(dados.categorias.map((c) => [c.categoria, c.itens]));
  return SECOES.map((secao) => ({
    ...secao,
    itens: agrupar(secao.de.flatMap((nome) => porNome.get(nome) || [])),
  }));
}

function linhaPreco(precos) {
  return precos
    .map(
      (p) =>
        `<span class="preco">${p.rotulo ? `<span class="preco__peso">${p.rotulo}</span> ` : ''}${preco(p.centavos)}</span>`,
    )
    .join('');
}

function renderCardapio(dados) {
  return secoesDoCardapio(dados)
    .map(
      (secao) => `
      <section class="cardapio__grupo" id="${secao.id}" aria-labelledby="${secao.id}-titulo">
        <div class="cardapio__cabeca">
          <h3 id="${secao.id}-titulo">${esc(secao.titulo)}</h3>
          <p>${esc(secao.nota)}</p>
        </div>
        <ul class="cardapio__itens" role="list">
          ${secao.itens
            .map(
              (item) => `
          <li class="prato">
            <p class="prato__nome">${esc(item.nome)}${item.mais_vendido ? ' <span class="prato__selo">mais pedido</span>' : ''}</p>
            <p class="prato__precos">${linhaPreco(item.precos)}</p>
            ${item.descricao ? `<p class="prato__desc">${esc(descricaoLimpa(item.descricao))}</p>` : ''}
          </li>`,
            )
            .join('')}
        </ul>
      </section>`,
    )
    .join('');
}

function renderMaisVendidos(dados) {
  const itens = dados.categorias.flatMap((c) => c.itens).filter((i) => i.mais_vendido);
  return itens
    .map(
      (item) => `
        <li class="tabela__linha">
          <span class="tabela__nome">${esc(nomeLimpo(item.nome))}${gramas(item.variante) ? ` <span class="tabela__peso">${gramas(item.variante)}</span>` : ''}</span>
          <span class="tabela__desc">${esc(descricaoLimpa(item.descricao || ''))}</span>
          <span class="tabela__preco">${preco(item.preco_centavos)}</span>
        </li>`,
    )
    .join('');
}

function bairrosOrdenados(dados) {
  return [...dados.loja.bairros_entrega]
    .map((b) => ({ ...b, nome: nomeLimpo(b.bairro.trim()) }))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
}

function renderBairrosOpcoes(dados) {
  return bairrosOrdenados(dados)
    .map((b) => `<option value="${b.taxa_centavos}">${esc(b.nome)}</option>`)
    .join('');
}

function renderBairrosLista(dados) {
  return bairrosOrdenados(dados)
    .map(
      (b) =>
        `<li><span>${esc(b.nome)}</span> <span class="taxa">${preco(b.taxa_centavos)}</span></li>`,
    )
    .join('');
}

function renderBairrosFaixa(dados) {
  const nomes = bairrosOrdenados(dados).map((b) => esc(b.nome));
  const linha = nomes.join('<span class="faixa__ponto" aria-hidden="true"></span>');
  return `<span>${linha}</span><span aria-hidden="true">${linha}</span>`;
}

function renderJsonLd(dados) {
  const loja = dados.loja;
  const abertura = DIAS.map((dia, i) => {
    const [abre, fecha] = loja.horarios[dia].split('-');
    return {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: `https://schema.org/${DIAS_SCHEMA[i]}`,
      opens: abre,
      closes: fecha,
    };
  });
  const json = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: 'Hugão Lanches & Burgers',
    alternateName: ['Hugão Lanches', 'Hugão Lanches & Burguers'],
    image: '/img/cliente/fachada-letreiro.webp',
    telephone: '+55-19-97168-1738',
    priceRange: 'R$ 40–60',
    servesCuisine: ['Lanches', 'Hambúrguer', 'Hot dog'],
    acceptsReservations: false,
    paymentAccepted: 'Cartão de crédito, cartão de débito, dinheiro, PIX',
    hasMenu: LINKS.bsfood,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'R. Irmã Dulce, 153',
      addressLocality: 'Serra Negra',
      addressRegion: 'SP',
      postalCode: '13930-000',
      addressCountry: 'BR',
    },
    geo: { '@type': 'GeoCoordinates', latitude: -22.6140673, longitude: -46.6972452 },
    openingHoursSpecification: abertura,
    sameAs: [LINKS.instagram, LINKS.bsfood],
  };
  return `<script type="application/ld+json">${JSON.stringify(json).replaceAll('<', '\\u003c')}</script>`;
}

function renderDadosLoja(dados) {
  const loja = { horarios: dados.loja.horarios, entregaMin: dados.loja.tempo_medio_entrega_min };
  return `<script type="application/json" id="dados-loja">${JSON.stringify(loja)}</script>`;
}

function contarItens(dados) {
  return secoesDoCardapio(dados).reduce((total, s) => total + s.itens.length, 0);
}

function menorPreco(dados, regra) {
  const itens = dados.categorias.flatMap((c) => c.itens).filter(regra);
  return preco(Math.min(...itens.map((i) => i.preco_centavos)));
}

export function renderPage(html, dados) {
  const trocas = {
    'mais-vendidos': renderMaisVendidos(dados),
    cardapio: renderCardapio(dados),
    'bairros-opcoes': renderBairrosOpcoes(dados),
    'bairros-lista': renderBairrosLista(dados),
    'bairros-faixa': renderBairrosFaixa(dados),
    'bairros-total': String(dados.loja.bairros_entrega.length),
    'itens-total': String(contarItens(dados)),
    'preco-90': menorPreco(dados, (i) => /90 g/.test(i.variante || '')),
    'preco-120': menorPreco(dados, (i) => /120 g/.test(i.variante || '')),
    'preco-160': menorPreco(dados, (i) => /160g/i.test(i.descricao || '')),
    jsonld: renderJsonLd(dados),
    'dados-loja': renderDadosLoja(dados),
  };
  return html.replace(/<!--\s*([a-z0-9-]+)\s*-->/g, (marca, nome) =>
    nome in trocas ? trocas[nome] : marca,
  );
}
