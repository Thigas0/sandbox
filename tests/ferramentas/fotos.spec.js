import { cpSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { test, expect } from '@playwright/test';
import sharp from 'sharp';
import { lerExif } from '../../scripts/fotos/exif.mjs';
import { gerarFotos } from '../../scripts/fotos/gerar.mjs';
import { verificarFotos } from '../../scripts/fotos/verificar.mjs';

// O processo das fotos roda numa pasta temporária com originais sintéticos: uma foto deitada maior
// que 2000 px, com GPS e crédito da câmera, e uma em pé, menor, girada pelo EXIF e sem crédito.
const SITE = new URL('../../src/dados/site.json', import.meta.url);

async function prepararRaiz(raiz) {
  rmSync(raiz, { recursive: true, force: true });
  mkdirSync(join(raiz, 'src', 'dados'), { recursive: true });
  mkdirSync(join(raiz, 'fotos-originais', 'jogos'), { recursive: true });
  cpSync(SITE, join(raiz, 'src', 'dados', 'site.json'));
  await sharp({ create: { width: 3000, height: 2000, channels: 3, background: '#2050a0' } })
    .jpeg()
    .withExif({
      IFD0: { Artist: 'Camera do Pedro', Copyright: 'Pedro De Lucca 2026' },
      IFD3: { GPSLatitudeRef: 'S', GPSLatitude: '22/1 54/1 0/1' },
    })
    .toFile(join(raiz, 'fotos-originais', 'jogos', 'deitada.jpg'));
  await sharp({ create: { width: 1800, height: 1200, channels: 3, background: '#a03020' } })
    .jpeg()
    .withMetadata({ orientation: 6 })
    .toFile(join(raiz, 'fotos-originais', 'jogos', 'em-pe.jpg'));
  const fotos = [
    {
      id: 'deitada',
      arquivo: 'jogos/deitada.jpg',
      alt: 'Teste deitado',
      pessoasIdentificaveis: false,
      capa: true,
    },
    { id: 'em-pe', arquivo: 'jogos/em-pe.jpg', alt: 'Teste em pé', pessoasIdentificaveis: true },
  ];
  writeFileSync(join(raiz, 'src', 'dados', 'fotos.json'), JSON.stringify(fotos));
}

test('gera AVIF e WebP em até 4 larguras, lado maior até 2000 px, crédito sem GPS', async ({}, info) => {
  const raiz = info.outputPath('raiz');
  await prepararRaiz(raiz);
  await gerarFotos({ raiz });
  const gerado = JSON.parse(readFileSync(join(raiz, 'src', 'dados', 'fotos.gerado.json'), 'utf8'));

  expect(gerado.deitada).toMatchObject({
    larguras: [640, 960, 1440, 2000],
    largura: 2000,
    altura: 1333,
  });
  // A em pé tem 1800 px de altura depois da rotação: não amplia e não repete medida.
  expect(gerado['em-pe']).toMatchObject({
    larguras: [427, 640, 960, 1200],
    largura: 1200,
    altura: 1800,
  });

  for (const [id, { larguras }] of Object.entries(gerado)) {
    for (const largura of larguras) {
      for (const extensao of ['avif', 'webp']) {
        const arquivo = join(raiz, 'public', 'fotos', `${id}-${largura}w.${extensao}`);
        const meta = await sharp(arquivo).metadata();
        expect(meta.width).toBe(largura);
        expect(Math.max(meta.width, meta.height)).toBeLessThanOrEqual(2000);
        const exif = lerExif(meta.exif);
        expect(exif.temGps).toBe(false);
        expect(exif.artista).toBeTruthy();
        expect(exif.copyright).toBeTruthy();
      }
    }
  }
  // O crédito que veio da câmera é mantido; sem crédito no original, vale o do site.json.
  const deitada = lerExif(
    (await sharp(join(raiz, 'public', 'fotos', 'deitada-640w.avif')).metadata()).exif,
  );
  expect(deitada).toMatchObject({ artista: 'Camera do Pedro', copyright: 'Pedro De Lucca 2026' });
  const emPe = lerExif(
    (await sharp(join(raiz, 'public', 'fotos', 'em-pe-640w.webp')).metadata()).exif,
  );
  expect(emPe.artista).toBe('Pedro De Lucca');
  expect(emPe.copyright).toContain('Pedro De Lucca / PDL Fotografia & Imagem');

  const og = await sharp(join(raiz, 'public', 'og.jpg')).metadata();
  expect(og).toMatchObject({ format: 'jpeg', width: 1200, height: 630 });
  expect(statSync(join(raiz, 'public', 'og.jpg')).size).toBeLessThanOrEqual(300 * 1024);
  expect(lerExif(og.exif).temGps).toBe(false);

  expect(await verificarFotos({ raiz })).toEqual([]);
});

test('o verificador acusa GPS, arquivo faltando e arquivo que sobrou', async ({}, info) => {
  const raiz = info.outputPath('raiz');
  await prepararRaiz(raiz);
  await gerarFotos({ raiz });
  const pasta = join(raiz, 'public', 'fotos');
  await sharp({ create: { width: 640, height: 427, channels: 3, background: '#000000' } })
    .webp()
    .withExif({
      IFD0: { Artist: 'X', Copyright: 'Y' },
      IFD3: { GPSLatitudeRef: 'S', GPSLatitude: '1/1 0/1 0/1' },
    })
    .toFile(join(pasta, 'deitada-640w.webp'));
  rmSync(join(pasta, 'em-pe-960w.avif'));
  writeFileSync(join(pasta, 'velha-640w.avif'), 'x');

  const problemas = (await verificarFotos({ raiz })).join('\n');
  expect(problemas).toContain('public/fotos/deitada-640w.webp: o EXIF ainda tem GPS.');
  expect(problemas).toContain('public/fotos/em-pe-960w.avif: não existe.');
  expect(problemas).toContain('public/fotos/velha-640w.avif: não está no manifesto.');
});

test('trocar uma foto no manifesto apaga as versões antigas dela', async ({}, info) => {
  const raiz = info.outputPath('raiz');
  await prepararRaiz(raiz);
  await gerarFotos({ raiz });
  writeFileSync(
    join(raiz, 'src', 'dados', 'fotos.json'),
    JSON.stringify([
      { id: 'em-pe', arquivo: 'jogos/em-pe.jpg', alt: 'Só esta', pessoasIdentificaveis: true },
    ]),
  );
  await gerarFotos({ raiz });
  expect(() => statSync(join(raiz, 'public', 'fotos', 'deitada-640w.avif'))).toThrow();
  expect(await verificarFotos({ raiz })).toEqual([]);
});
