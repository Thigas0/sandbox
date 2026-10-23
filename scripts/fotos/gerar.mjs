#!/usr/bin/env node
// Gera as versões publicadas das fotos a partir de fotos-originais/ (que não vai para o Git).
//
//   npm run fotos                     usa src/dados/fotos.json e grava em public/
//   node scripts/fotos/gerar.mjs --raiz DIR   faz o mesmo em outra pasta (os testes usam isto)
//
// Para cada foto: corrige a rotação, converte para sRGB e grava AVIF e WebP com o lado maior em
// 640, 960, 1440 e 2000 px (sem ampliar). O EXIF publicado tem só o crédito (Artist e Copyright),
// então GPS, câmera e o resto ficam de fora. Também escreve src/dados/fotos.gerado.json (medidas e
// cor de fundo de cada foto) e public/og.jpg (1200×630, a prévia do link no WhatsApp).
import { mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { ErroDeDados, fotoDeCapa, lerJson, validarFotos, validarSite } from '../site/dados.mjs';
import { lerExif } from './exif.mjs';

export const LADOS = [640, 960, 1440, 2000];
export const FORMATOS = {
  avif: (img) => img.avif({ quality: 52, effort: 4 }),
  webp: (img) => img.webp({ quality: 78, effort: 4 }),
};
export const OG = { largura: 1200, altura: 630, limiteBytes: 300 * 1024 };
// Arquivos que este script escreve em public/fotos/; os demais nunca são apagados.
export const NOME_PUBLICADO = /^[a-z0-9]+(?:-[a-z0-9]+)*-\d+w\.(?:avif|webp)$/;

const hex = ({ r, g, b }) => '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');

// Medidas depois da rotação do EXIF: as orientações 5 a 8 trocam largura e altura.
function medidasOrientadas({ width, height, orientation }) {
  return orientation >= 5 ? { largura: height, altura: width } : { largura: width, altura: height };
}

// Lados maiores realmente gerados: nunca maiores que o original e sem repetir medida.
export function ladosPara(ladoMaior) {
  return [...new Set(LADOS.map((lado) => Math.min(lado, ladoMaior)))];
}

async function credito(arquivo, site) {
  const { exif } = await sharp(arquivo).metadata();
  const original = lerExif(exif);
  return {
    Artist: original.artista ?? site.fotografo,
    Copyright: original.copyright ?? `© ${site.credito}`,
  };
}

async function gerarFoto(foto, { originais, saida, site }) {
  const arquivo = join(originais, foto.arquivo);
  try {
    statSync(arquivo);
  } catch {
    throw new ErroDeDados(
      `fotos.json, "${foto.id}": fotos-originais/${foto.arquivo} não encontrado.`,
    );
  }
  const { largura, altura } = medidasOrientadas(await sharp(arquivo).metadata());
  const exif = { IFD0: await credito(arquivo, site) };
  const deitada = largura >= altura;
  const ladoMaior = Math.max(largura, altura);
  const larguras = [];
  const escritos = [];
  for (const lado of ladosPara(ladoMaior)) {
    let larguraFinal = null;
    for (const [extensao, codificar] of Object.entries(FORMATOS)) {
      const redimensionada = sharp(arquivo)
        .rotate()
        .resize(deitada ? { width: lado } : { height: lado });
      // O nome leva a largura que o sharp de fato gravou, a mesma que o srcset anuncia.
      const { data, info } = await codificar(redimensionada)
        .withExif(exif)
        .toBuffer({ resolveWithObject: true });
      larguraFinal ??= info.width;
      const nome = `${foto.id}-${larguraFinal}w.${extensao}`;
      writeFileSync(join(saida, nome), data);
      escritos.push(nome);
    }
    larguras.push(larguraFinal);
  }
  const { dominant } = await sharp(arquivo).rotate().stats();
  const maior = ladoMaior > LADOS.at(-1) ? LADOS.at(-1) / ladoMaior : 1;
  return {
    info: {
      larguras,
      largura: Math.round(largura * maior),
      altura: Math.round(altura * maior),
      cor: hex(dominant),
    },
    escritos,
    exif,
  };
}

// A prévia do WhatsApp: JPEG 1200×630 abaixo de 300 KB, recortado onde há mais informação.
async function gerarOg(foto, { originais, publico, exif }) {
  const arquivo = join(originais, foto.arquivo);
  for (const qualidade of [82, 74, 66, 58, 50]) {
    const dados = await sharp(arquivo)
      .rotate()
      .resize(OG.largura, OG.altura, { fit: 'cover', position: sharp.strategy.attention })
      .jpeg({ quality: qualidade, mozjpeg: true })
      .withExif(exif)
      .toBuffer();
    if (dados.length <= OG.limiteBytes) {
      writeFileSync(join(publico, 'og.jpg'), dados);
      return;
    }
  }
  throw new ErroDeDados(
    `og.jpg: não ficou abaixo de 300 KB com a foto "${foto.id}"; escolha outra capa.`,
  );
}

export async function gerarFotos({ raiz }) {
  const dados = join(raiz, 'src', 'dados');
  const site = validarSite(lerJson(join(dados, 'site.json'), 'site.json'));
  const fotos = validarFotos(lerJson(join(dados, 'fotos.json'), 'fotos.json'));
  const originais = join(raiz, 'fotos-originais');
  const publico = join(raiz, 'public');
  const saida = join(publico, 'fotos');
  mkdirSync(saida, { recursive: true });

  const gerado = {};
  const escritos = new Set();
  let exifDaCapa = null;
  const capa = fotoDeCapa(fotos);
  for (const foto of fotos) {
    const resultado = await gerarFoto(foto, { originais, saida, site });
    gerado[foto.id] = resultado.info;
    resultado.escritos.forEach((nome) => escritos.add(nome));
    if (foto === capa) exifDaCapa = resultado.exif;
  }
  if (capa) await gerarOg(capa, { originais, publico, exif: exifDaCapa });
  else rmSync(join(publico, 'og.jpg'), { force: true });

  // Uma foto trocada ou removida não deixa versões antigas para trás.
  for (const nome of readdirSync(saida)) {
    if (NOME_PUBLICADO.test(nome) && !escritos.has(nome)) rmSync(join(saida, nome));
  }
  writeFileSync(join(dados, 'fotos.gerado.json'), JSON.stringify(gerado, null, 2) + '\n');
  return { fotos: fotos.length, arquivos: escritos.size };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const i = process.argv.indexOf('--raiz');
  const raiz =
    i > -1
      ? resolve(process.argv[i + 1])
      : resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
  try {
    const { fotos, arquivos } = await gerarFotos({ raiz });
    console.log(`${fotos} foto(s), ${arquivos} arquivo(s) em public/fotos/.`);
  } catch (erro) {
    console.error(erro instanceof ErroDeDados ? erro.message : erro);
    process.exit(1);
  }
}
