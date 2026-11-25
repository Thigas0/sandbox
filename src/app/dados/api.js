// Implementação "api" do contrato (ver contrato.js), para o backend HTTP que ainda não existe.
// O token do Canvas vai uma única vez em POST /sessao; depois o backend usa um cookie HttpOnly.
// Endpoints e payloads: docs/glaux/app-backend.md.
import {
  ErroDados,
  validarDisciplina,
  validarPlano,
  validarResultado,
  validarResumo,
  validarTarefa,
} from './contrato.js';

const TEMPO_LIMITE_MS = 60_000; // o Gerador usa 60 s por chamada ao Groq (service.py:55)

export function criarApi({ baseUrl, fetch: buscar = globalThis.fetch.bind(globalThis) }) {
  if (!baseUrl) {
    throw new ErroDados('indisponivel', 'O backend do Glaux ainda não está disponível.');
  }
  const base = baseUrl.replace(/\/+$/, '');

  async function pedir(metodo, caminho, corpo) {
    const controle = new AbortController();
    const relogio = setTimeout(() => controle.abort(), TEMPO_LIMITE_MS);
    let resposta;
    try {
      resposta = await buscar(`${base}${caminho}`, {
        method: metodo,
        credentials: 'include',
        headers: corpo ? { 'Content-Type': 'application/json' } : undefined,
        body: corpo ? JSON.stringify(corpo) : undefined,
        signal: controle.signal,
      });
    } catch {
      throw new ErroDados('rede', 'Sem conexão com o servidor do Glaux.');
    } finally {
      clearTimeout(relogio);
    }
    if (resposta.status === 401 || resposta.status === 403) {
      throw new ErroDados(
        'autenticacao',
        'Sessão inválida. Confira o token do Canvas e entre de novo.',
      );
    }
    if (!resposta.ok) {
      throw new ErroDados('servidor', `O servidor respondeu com erro (${resposta.status}).`);
    }
    if (resposta.status === 204) return null;
    try {
      return await resposta.json();
    } catch {
      throw new ErroDados('servidor', 'Resposta inesperada do servidor.');
    }
  }

  // O backend responde de uma vez; o progresso mostra a rota que ele escolheu.
  function anunciar(plano, aoProgresso) {
    aoProgresso?.({ tipo: 'plano', plano });
    for (const agente of plano.steps)
      aoProgresso?.({ tipo: 'agente', agente, estado: 'concluido' });
  }

  return {
    modo: 'api',

    async conectar(canvasUrl, token) {
      await pedir('POST', '/sessao', { canvas_url: canvasUrl, token });
    },

    async sair() {
      await pedir('DELETE', '/sessao');
    },

    async sincronizar({ aoProgresso } = {}) {
      const r = await pedir('POST', '/sincronizar');
      validarPlano(r?.plano);
      anunciar(r.plano, aoProgresso);
      return { plano: r.plano, disciplinas: (r.disciplinas || []).map(validarDisciplina) };
    },

    async listarDisciplinas() {
      const r = await pedir('GET', '/disciplinas');
      if (!Array.isArray(r)) throw new ErroDados('servidor', 'Resposta inesperada do servidor.');
      return r.map(validarDisciplina);
    },

    async cronograma() {
      const r = await pedir('GET', '/cronograma');
      if (!Array.isArray(r)) throw new ErroDados('servidor', 'Resposta inesperada do servidor.');
      return r.map(validarTarefa);
    },

    async resumo(cursoId, tema, { aoProgresso } = {}) {
      const r = await pedir('POST', '/resumos', { course_id: Number(cursoId), tema: tema || null });
      validarPlano(r?.plano);
      anunciar(r.plano, aoProgresso);
      return { plano: r.plano, resumo: validarResumo(r.resumo) };
    },

    async gerarQuestoes(cursoId, tema, quantidade, { aoProgresso } = {}) {
      const r = await pedir('POST', '/questoes', {
        course_id: Number(cursoId),
        tema,
        quantidade,
        tipos: ['multipla_escolha', 'dissertativa'],
      });
      validarPlano(r?.plano);
      anunciar(r.plano, aoProgresso);
      return { plano: r.plano, resultado: validarResultado(r.resultado) };
    },
  };
}
