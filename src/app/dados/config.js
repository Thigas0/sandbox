// URL do backend HTTP do Glaux, definida no build: VITE_GLAUX_API_URL=https://api.exemplo.org.
// Vazia = ainda não há backend; o app oferece só o modo demo. A origem dela entra no connect-src da
// CSP (vite.config.js). Nunca coloque chaves aqui: tudo que é VITE_* vai para o bundle público.
export const API_URL = (import.meta.env.VITE_GLAUX_API_URL || '').trim();
