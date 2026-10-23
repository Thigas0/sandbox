// Lê e valida os arquivos de dados do site (src/dados/*.json).
// Cada problema vira uma mensagem em português que diz o arquivo, o item e o que corrigir,
// para que quem atualiza os eventos sozinho entenda o erro sem abrir o código.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Valor provisório aceito nos campos de texto do site.json enquanto o cliente não confirma.
export const PENDENTE = 'A CONFIRMAR';

export class ErroDeDados extends Error {
  constructor(problemas) {
    const lista = [].concat(problemas);
    super(lista.join('\n'));
    this.name = 'ErroDeDados';
    this.problemas = lista;
  }
}

const preenchido = (valor) => typeof valor === 'string' && valor.trim() !== '';
const objeto = (valor) => valor !== null && typeof valor === 'object' && !Array.isArray(valor);

// Diz onde está o erro de sintaxe: o V8 informa a posição, e a pessoa precisa da linha.
function ondeQuebrou(texto, erro) {
  const linhaColuna = /line (\d+) column (\d+)/.exec(erro.message);
  if (linhaColuna) return `, linha ${linhaColuna[1]}, coluna ${linhaColuna[2]}`;
  const posicao = /position (\d+)/.exec(erro.message);
  if (!posicao) return '';
  const antes = texto.slice(0, Number(posicao[1])).split('\n');
  return `, linha ${antes.length}, coluna ${antes.at(-1).length + 1}`;
}

export function lerJson(caminho, nome) {
  let texto;
  try {
    texto = readFileSync(caminho, 'utf8');
  } catch {
    throw new ErroDeDados(`${nome}: arquivo não encontrado.`);
  }
  try {
    return JSON.parse(texto);
  } catch (erro) {
    throw new ErroDeDados(
      `${nome}: JSON inválido${ondeQuebrou(texto, erro)}. Confira vírgulas (nenhuma depois do último item) e aspas duplas.`,
    );
  }
}

const CAMPOS_SITE = [
  'nome',
  'fotografo',
  'frase',
  'cidade',
  'estado',
  'pais',
  'whatsapp',
  'email',
  'instagram',
  'behance',
  'fotto',
  'url',
  'precoFoto',
  'prazoEntrega',
  'credito',
];

export function validarSite(site) {
  if (!objeto(site)) throw new ErroDeDados('site.json: o arquivo deve ser um objeto { ... }.');
  const problemas = [];
  const problema = (campo, texto) => problemas.push(`site.json, "${campo}": ${texto}`);
  for (const campo of Object.keys(site)) {
    if (!CAMPOS_SITE.includes(campo)) problema(campo, 'campo desconhecido (confira a grafia).');
  }
  for (const campo of CAMPOS_SITE) {
    if (!preenchido(site[campo]))
      problema(campo, `preencha este campo (ou escreva "${PENDENTE}").`);
  }
  if (problemas.length) throw new ErroDeDados(problemas);

  if (!/^55\d{10,11}$/.test(site.whatsapp)) {
    problema('whatsapp', 'use só números, com 55 e o DDD, por exemplo 5519999998888.');
  }
  if (!/^[A-Za-z0-9._]+$/.test(site.instagram)) {
    problema('instagram', 'escreva só o nome do perfil, sem @ e sem link.');
  }
  for (const campo of ['behance', 'fotto']) {
    if (!linkHttps(site[campo]))
      problema(campo, 'deve ser um link completo, começando com https://.');
  }
  if (!linkDoFotto(site.fotto)) problema('fotto', 'deve ser um link do Fotto (fotto.com.br).');
  if (site.url !== PENDENTE && !/^https:\/\/[a-z0-9.-]+\.[a-z]{2,}$/i.test(site.url)) {
    problema(
      'url',
      'use o endereço do site sem barra no fim, por exemplo https://www.exemplo.com.br.',
    );
  }
  if (site.email !== PENDENTE && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(site.email)) {
    problema('email', 'e-mail inválido.');
  }
  if (!/^[A-Z]{2}$/.test(site.estado)) problema('estado', 'use a sigla, por exemplo SP.');
  if (!/^[A-Z]{2}$/.test(site.pais)) problema('pais', 'use o código do país, por exemplo BR.');
  if (problemas.length) throw new ErroDeDados(problemas);
  return site;
}

function linkHttps(texto) {
  try {
    return new URL(texto).protocol === 'https:';
  } catch {
    return false;
  }
}

export function linkDoFotto(texto) {
  try {
    const { protocol, hostname } = new URL(texto);
    return (
      protocol === 'https:' && (hostname === 'fotto.com.br' || hostname.endsWith('.fotto.com.br'))
    );
  } catch {
    return false;
  }
}

export function dataValida(texto) {
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(texto);
  if (!partes) return false;
  const [ano, mes, dia] = partes.slice(1).map(Number);
  const data = new Date(Date.UTC(ano, mes - 1, dia));
  return (
    data.getUTCFullYear() === ano && data.getUTCMonth() === mes - 1 && data.getUTCDate() === dia
  );
}

const CAMPOS_EVENTO = ['nome', 'data', 'local', 'fotto'];

export function validarEventos(eventos) {
  if (!Array.isArray(eventos)) {
    throw new ErroDeDados('eventos.json: o arquivo deve ser uma lista [ ... ].');
  }
  const problemas = [];
  const links = new Map();
  eventos.forEach((evento, i) => {
    const nome = objeto(evento) && preenchido(evento.nome) ? ` ("${evento.nome}")` : '';
    const ref = `eventos.json, item ${i + 1}${nome}`;
    if (!objeto(evento)) {
      problemas.push(`${ref}: cada evento é um objeto com "nome", "data", "local" e "fotto".`);
      return;
    }
    for (const campo of Object.keys(evento)) {
      if (!CAMPOS_EVENTO.includes(campo)) {
        problemas.push(
          `${ref}: campo desconhecido "${campo}" (os campos são nome, data, local e fotto).`,
        );
      }
    }
    for (const campo of CAMPOS_EVENTO) {
      if (!preenchido(evento[campo])) problemas.push(`${ref}: falta "${campo}".`);
    }
    if (preenchido(evento.data) && !dataValida(evento.data)) {
      problemas.push(
        `${ref}: "data" deve ser AAAA-MM-DD, por exemplo 2026-10-18 (recebi "${evento.data}").`,
      );
    }
    if (preenchido(evento.fotto)) {
      if (!linkDoFotto(evento.fotto)) {
        problemas.push(
          `${ref}: "fotto" deve ser um link https do Fotto (recebi "${evento.fotto}").`,
        );
      } else if (links.has(evento.fotto)) {
        problemas.push(`${ref}: o link do Fotto é o mesmo do item ${links.get(evento.fotto)}.`);
      } else {
        links.set(evento.fotto, i + 1);
      }
    }
  });
  if (problemas.length) throw new ErroDeDados(problemas);
  return eventos;
}

const CAMPOS_FOTO = ['id', 'arquivo', 'alt', 'legenda', 'pessoasIdentificaveis', 'foco', 'capa'];

export function validarFotos(fotos) {
  if (!Array.isArray(fotos))
    throw new ErroDeDados('fotos.json: o arquivo deve ser uma lista [ ... ].');
  const problemas = [];
  const ids = new Set();
  let capas = 0;
  fotos.forEach((foto, i) => {
    const ref = `fotos.json, item ${i + 1}${objeto(foto) && preenchido(foto.id) ? ` ("${foto.id}")` : ''}`;
    if (!objeto(foto)) {
      problemas.push(
        `${ref}: cada foto é um objeto com "id", "arquivo", "alt" e "pessoasIdentificaveis".`,
      );
      return;
    }
    for (const campo of Object.keys(foto)) {
      if (!CAMPOS_FOTO.includes(campo)) problemas.push(`${ref}: campo desconhecido "${campo}".`);
    }
    if (!preenchido(foto.id) || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(foto.id)) {
      problemas.push(
        `${ref}: "id" usa só letras minúsculas, números e hífens, por exemplo festa-pista-01.`,
      );
    } else if (ids.has(foto.id)) {
      problemas.push(`${ref}: o "id" ${foto.id} já foi usado.`);
    } else {
      ids.add(foto.id);
    }
    if (!preenchido(foto.arquivo) || foto.arquivo.startsWith('/') || foto.arquivo.includes('..')) {
      problemas.push(
        `${ref}: "arquivo" é o caminho dentro de fotos-originais/, por exemplo festas/IMG_0123.jpg.`,
      );
    }
    if (!preenchido(foto.alt))
      problemas.push(`${ref}: falta "alt", a descrição da foto para quem não enxerga.`);
    if (foto.legenda !== undefined && typeof foto.legenda !== 'string') {
      problemas.push(`${ref}: "legenda" deve ser um texto.`);
    }
    if (typeof foto.pessoasIdentificaveis !== 'boolean') {
      problemas.push(`${ref}: "pessoasIdentificaveis" deve ser true ou false.`);
    }
    if (foto.foco !== undefined && !/^\d{1,3}% \d{1,3}%$/.test(foto.foco)) {
      problemas.push(
        `${ref}: "foco" é o ponto que não pode ser cortado, como "50% 30%" (horizontal vertical).`,
      );
    }
    if (foto.capa !== undefined && typeof foto.capa !== 'boolean') {
      problemas.push(`${ref}: "capa" deve ser true ou false.`);
    }
    if (foto.capa === true) capas += 1;
  });
  if (capas > 1) problemas.push('fotos.json: só uma foto pode ter "capa": true.');
  if (problemas.length) throw new ErroDeDados(problemas);
  return fotos;
}

// fotos.gerado.json é escrito por `npm run fotos`; aqui só confirmamos que acompanha o manifesto.
export function validarGerado(fotos, gerado) {
  if (!objeto(gerado)) throw new ErroDeDados('fotos.gerado.json: rode `npm run fotos` de novo.');
  const problemas = [];
  for (const foto of fotos) {
    const info = gerado[foto.id];
    if (!info) {
      problemas.push(
        `fotos.json, "${foto.id}": versões publicadas não encontradas. Rode \`npm run fotos\`.`,
      );
      continue;
    }
    const valido =
      Array.isArray(info.larguras) &&
      info.larguras.length > 0 &&
      Number.isInteger(info.largura) &&
      Number.isInteger(info.altura) &&
      /^#[0-9a-f]{6}$/.test(info.cor);
    if (!valido)
      problemas.push(`fotos.gerado.json, "${foto.id}": dados incompletos. Rode \`npm run fotos\`.`);
  }
  for (const id of Object.keys(gerado)) {
    if (!fotos.some((foto) => foto.id === id)) {
      problemas.push(`fotos.gerado.json: "${id}" saiu de fotos.json. Rode \`npm run fotos\`.`);
    }
  }
  if (problemas.length) throw new ErroDeDados(problemas);
  return gerado;
}

// A foto de capa abre a página e vira a imagem da prévia do link; sem "capa", vale a primeira.
export const fotoDeCapa = (fotos) => fotos.find((foto) => foto.capa) ?? fotos[0] ?? null;

// Eventos do mais recente para o mais antigo; empate pelo nome, para a ordem não variar.
export const ordenarEventos = (eventos) =>
  [...eventos].sort(
    (a, b) => b.data.localeCompare(a.data) || a.nome.localeCompare(b.nome, 'pt-BR'),
  );

export function lerDados(raiz) {
  const pasta = join(raiz, 'src', 'dados');
  const problemas = [];
  const tentar = (fn) => {
    try {
      return fn();
    } catch (erro) {
      if (!(erro instanceof ErroDeDados)) throw erro;
      problemas.push(...erro.problemas);
      return null;
    }
  };
  const site = tentar(() => validarSite(lerJson(join(pasta, 'site.json'), 'site.json')));
  const eventos = tentar(() =>
    validarEventos(lerJson(join(pasta, 'eventos.json'), 'eventos.json')),
  );
  const fotos = tentar(() => validarFotos(lerJson(join(pasta, 'fotos.json'), 'fotos.json')));
  const gerado = fotos
    ? tentar(() =>
        validarGerado(fotos, lerJson(join(pasta, 'fotos.gerado.json'), 'fotos.gerado.json')),
      )
    : null;
  if (problemas.length) throw new ErroDeDados(problemas);
  return { site, eventos: ordenarEventos(eventos), fotos, gerado };
}
