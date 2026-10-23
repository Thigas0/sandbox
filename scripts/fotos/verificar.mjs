#!/usr/bin/env node
// Confere as fotos publicadas contra o manifesto, sem precisar dos originais (roda no CI):
// cada versão existe, tem a largura anunciada, lado maior até 2000 px, crédito no EXIF e nenhum
// GPS, XMP ou IPTC; public/og.jpg tem 1200×630 e menos de 300 KB. Sai com 1 se algo falhar.
//
//   npm run fotos:verificar
//   node scripts/fotos/verificar.mjs --raiz DIR
import { existsSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { ErroDeDados, lerJson, validarFotos, validarGerado } from '../site/dados.mjs';
import { lerExif } from './exif.mjs';
import { LADOS, NOME_PUBLICADO, OG } from './gerar.mjs';

const FORMATO = { avif: 'heif', webp: 'webp' };

async function conferirArquivo(caminho, nome, esperado) {
  const problemas = [];
  const meta = await sharp(caminho).metadata();
  if (meta.format !== esperado.formato)
    problemas.push(`${nome}: formato ${meta.format}, esperado ${esperado.formato}.`);
  if (esperado.largura && meta.width !== esperado.largura) {
    problemas.push(
      `${nome}: largura ${meta.width} px, o manifesto diz ${esperado.largura}. Rode \`npm run fotos\`.`,
    );
  }
  if (esperado.altura && meta.height !== esperado.altura) {
    problemas.push(`${nome}: altura ${meta.height} px, esperado ${esperado.altura}.`);
  }
  if (Math.max(meta.width, meta.height) > LADOS.at(-1)) {
    problemas.push(
      `${nome}: lado maior de ${Math.max(meta.width, meta.height)} px (limite ${LADOS.at(-1)}).`,
    );
  }
  const exif = lerExif(meta.exif);
  if (exif.temGps) problemas.push(`${nome}: o EXIF ainda tem GPS.`);
  if (!exif.artista || !exif.copyright)
    problemas.push(`${nome}: falta o crédito (Artist e Copyright) no EXIF.`);
  if (meta.xmp || meta.iptc)
    problemas.push(`${nome}: tem metadados XMP ou IPTC, que podem levar localização.`);
  return problemas;
}

export async function verificarFotos({ raiz }) {
  const dados = join(raiz, 'src', 'dados');
  const publico = join(raiz, 'public');
  const pasta = join(publico, 'fotos');
  let fotos, gerado;
  try {
    fotos = validarFotos(lerJson(join(dados, 'fotos.json'), 'fotos.json'));
    gerado = validarGerado(fotos, lerJson(join(dados, 'fotos.gerado.json'), 'fotos.gerado.json'));
  } catch (erro) {
    if (erro instanceof ErroDeDados) return erro.problemas;
    throw erro;
  }

  const problemas = [];
  const esperados = new Set();
  for (const foto of fotos) {
    const info = gerado[foto.id];
    for (const largura of info.larguras) {
      for (const [extensao, formato] of Object.entries(FORMATO)) {
        const nome = `${foto.id}-${largura}w.${extensao}`;
        esperados.add(nome);
        const caminho = join(pasta, nome);
        if (!existsSync(caminho)) {
          problemas.push(`public/fotos/${nome}: não existe. Rode \`npm run fotos\`.`);
          continue;
        }
        problemas.push(
          ...(await conferirArquivo(caminho, `public/fotos/${nome}`, { formato, largura })),
        );
      }
    }
    // width/height do HTML vêm de largura × altura: a proporção tem de bater com a maior versão.
    const maior = join(pasta, `${foto.id}-${Math.max(...info.larguras)}w.webp`);
    if (existsSync(maior)) {
      const { width, height } = await sharp(maior).metadata();
      if (Math.abs(width / height - info.largura / info.altura) > 0.01) {
        problemas.push(
          `fotos.gerado.json, "${foto.id}": proporção diferente da foto publicada. Rode \`npm run fotos\`.`,
        );
      }
    }
  }
  if (existsSync(pasta)) {
    for (const nome of readdirSync(pasta)) {
      if (!esperados.has(nome)) {
        const motivo = NOME_PUBLICADO.test(nome)
          ? 'não está no manifesto'
          : 'não foi gerado por `npm run fotos`';
        problemas.push(`public/fotos/${nome}: ${motivo}.`);
      }
    }
  }

  const og = join(publico, 'og.jpg');
  if (fotos.length && !existsSync(og))
    problemas.push('public/og.jpg: não existe. Rode `npm run fotos`.');
  if (existsSync(og)) {
    problemas.push(
      ...(await conferirArquivo(og, 'public/og.jpg', {
        formato: 'jpeg',
        largura: OG.largura,
        altura: OG.altura,
      })),
    );
    if (statSync(og).size > OG.limiteBytes) problemas.push('public/og.jpg: maior que 300 KB.');
  }
  return problemas;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const i = process.argv.indexOf('--raiz');
  const raiz =
    i > -1
      ? resolve(process.argv[i + 1])
      : resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
  const problemas = await verificarFotos({ raiz });
  if (problemas.length) {
    console.error(problemas.join('\n'));
    process.exit(1);
  }
  console.log('Fotos publicadas conferidas.');
}
