// Política de segurança do site, compartilhada pelo build (meta CSP) e pelo deploy (vercel.json,
// conferido pelo teste e2e de cabeçalhos). A landing e o app no modo demo não falam com nenhum
// serviço externo; no modo api, o app só fala com a origem do backend do Glaux.

/** Monta a CSP; `conexoes` são origens extras para connect-src (a do backend, quando houver). */
export function montarCsp(conexoes = []) {
  return [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self'",
    "img-src 'self' data:",
    "font-src 'self'",
    "media-src 'self'",
    ["connect-src 'self'", ...conexoes].join(' '),
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'none'",
    "frame-ancestors 'none'",
  ].join('; ');
}

// frame-ancestors é ignorado numa <meta>; ele só vale no cabeçalho HTTP.
export function cspParaMeta(csp) {
  return csp
    .split('; ')
    .filter((diretiva) => !diretiva.startsWith('frame-ancestors'))
    .join('; ');
}

/** Origem https do backend a partir de VITE_GLAUX_API_URL; vazio quando não há backend. */
export function origemDaApi(url) {
  if (!url) return '';
  const origem = new URL(url);
  if (origem.protocol !== 'https:' && origem.hostname !== 'localhost') {
    throw new Error('VITE_GLAUX_API_URL precisa usar https.');
  }
  return origem.origin;
}

export const CSP = montarCsp();
export const CSP_META = cspParaMeta(CSP);
