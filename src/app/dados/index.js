// Ponto único de acesso aos dados. As telas pedem uma "fonte" e usam só o contrato (contrato.js).
import { ErroDados } from './contrato.js';
import { API_URL } from './config.js';

export { ErroDados };

/**
 * @param {"demo"|"api"} modo
 * @returns {Promise<object>} uma fonte que cumpre o contrato
 */
export async function criarFonte(modo) {
  if (modo === 'demo') {
    try {
      const { criarDemo } = await import('./demo.js');
      return criarDemo();
    } catch (erro) {
      if (erro instanceof ErroDados) throw erro;
      throw new ErroDados('rede', 'Não foi possível carregar os dados de demonstração.');
    }
  }
  if (!API_URL) {
    throw new ErroDados('indisponivel', 'O backend do Glaux ainda não está disponível.');
  }
  const { criarApi } = await import('./api.js');
  return criarApi({ baseUrl: API_URL });
}

export const apiDisponivel = () => Boolean(API_URL);
