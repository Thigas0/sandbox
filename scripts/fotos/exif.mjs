// Lê o essencial de um bloco EXIF (o Buffer de `sharp().metadata().exif`): Artist, Copyright e se há
// diretório de GPS. Basta o IFD0, onde a especificação TIFF/EXIF põe as três marcas.
const ARTIST = 0x013b;
const COPYRIGHT = 0x8298;
const GPS = 0x8825;
const ASCII = 2;

export function lerExif(bloco) {
  const resultado = { artista: null, copyright: null, temGps: false };
  if (!bloco || bloco.length < 14) return resultado;
  const base = bloco.toString('latin1', 0, 6) === 'Exif\0\0' ? 6 : 0;
  const ordem = bloco.toString('latin1', base, base + 2);
  if (ordem !== 'II' && ordem !== 'MM') return resultado;
  const pequeno = ordem === 'II';
  const u16 = (pos) => (pequeno ? bloco.readUInt16LE(base + pos) : bloco.readUInt16BE(base + pos));
  const u32 = (pos) => (pequeno ? bloco.readUInt32LE(base + pos) : bloco.readUInt32BE(base + pos));
  try {
    const ifd0 = u32(4);
    const entradas = u16(ifd0);
    for (let i = 0; i < entradas; i++) {
      const entrada = ifd0 + 2 + i * 12;
      const marca = u16(entrada);
      if (marca === GPS) resultado.temGps = true;
      if ((marca !== ARTIST && marca !== COPYRIGHT) || u16(entrada + 2) !== ASCII) continue;
      const tamanho = u32(entrada + 4);
      const inicio = base + (tamanho <= 4 ? entrada + 8 : u32(entrada + 8));
      const texto = bloco
        .toString('utf8', inicio, inicio + tamanho)
        .replace(/\0+$/, '')
        .trim();
      if (marca === ARTIST) resultado.artista = texto || null;
      else resultado.copyright = texto || null;
    }
  } catch {
    // Bloco truncado: devolve o que deu para ler; o verificador acusa o crédito ausente.
  }
  return resultado;
}
