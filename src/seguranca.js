// Política de segurança do site, compartilhada pelo build (meta CSP) e pelo deploy (vercel.json,
// conferido pelo teste e2e de cabeçalhos). O site é estático: não fala com nenhum serviço externo.
export const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data:",
  "font-src 'self'",
  "media-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
  "frame-ancestors 'none'",
].join('; ');

// frame-ancestors é ignorado numa <meta>; ele só vale no cabeçalho HTTP.
export const CSP_META = CSP.split('; ')
  .filter((diretiva) => !diretiva.startsWith('frame-ancestors'))
  .join('; ');
