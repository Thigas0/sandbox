// Implementação "demo" do contrato (ver contrato.js). Não faz nenhuma requisição de dados e não
// guarda nada: lê fixtures fictícias, empacotadas em chunks próprios, e reproduz as regras reais do
// Tutor, do Gerador e do Orquestrador.
import { planejar } from '../../content/orquestrador.js';
import { ErroDados, MENSAGENS, TETO_QUESTOES } from './contrato.js';

const RECOMENDACAO = {
  // src/agente_tutor/service.py:138-152
  ALTA: '🔴 URGENTE: Foco total na entrega até o prazo.',
  MÉDIA: '🟡 ATENÇÃO: Adiantar tarefas desta semana.',
  BAIXA: 'Manter estudos regulares.',
};

const DIA_MS = 24 * 60 * 60 * 1000;

let fixtures = null;
async function carregar() {
  if (fixtures) return fixtures;
  try {
    const [d, c, r, q] = await Promise.all([
      import('./fixtures/disciplinas.json'),
      import('./fixtures/cronograma.json'),
      import('./fixtures/resumos.json'),
      import('./fixtures/questoes.json'),
    ]);
    fixtures = {
      disciplinas: d.default.disciplinas,
      cronograma: c.default.tarefas,
      resumos: r.default.resumos,
      questoes: q.default.temas,
    };
    return fixtures;
  } catch {
    throw new ErroDados('rede', 'Não foi possível carregar os dados de demonstração.');
  }
}

export function criarDemo({ atrasoMs = 450 } = {}) {
  const esperar = (fator = 1) =>
    new Promise((resolver) => setTimeout(resolver, Math.round(atrasoMs * fator)));
  const resumosGerados = new Set();

  async function executarPlano(acao, opcoes, cursoId, aoProgresso) {
    const { passos, motivo } = planejar({ acao, ...opcoes });
    const plano = { steps: passos, resolved_course_id: cursoId ?? null, reason: motivo };
    aoProgresso?.({ tipo: 'plano', plano });
    for (const agente of passos) {
      aoProgresso?.({ tipo: 'agente', agente, estado: 'rodando' });
      await esperar();
      aoProgresso?.({ tipo: 'agente', agente, estado: 'concluido' });
    }
    return plano;
  }

  function disciplina(dados, cursoId) {
    const d = dados.disciplinas.find((x) => x.id === Number(cursoId));
    if (!d) throw new ErroDados('servidor', 'Disciplina não encontrada.');
    return d;
  }

  return {
    modo: 'demo',

    // O token é ignorado de propósito: no modo demo ele nunca sai daqui nem é guardado.
    async conectar() {},
    async sair() {
      resumosGerados.clear();
    },

    async sincronizar({ aoProgresso } = {}) {
      const dados = await carregar();
      const plano = await executarPlano('SINCRONIZAR_CANVAS', {}, null, aoProgresso);
      return { plano, disciplinas: dados.disciplinas.map(({ id, name }) => ({ id, name })) };
    },

    async listarDisciplinas() {
      const dados = await carregar();
      await esperar(0.5);
      return dados.disciplinas.map(({ id, name, temas }) => ({ id, name, temas }));
    },

    async cronograma() {
      const dados = await carregar();
      await esperar(0.5);
      const agora = Date.now();
      const nomes = Object.fromEntries(dados.disciplinas.map((d) => [d.id, d.name]));
      return dados.cronograma
        .map((t) => {
          const dias = t.days_remaining;
          const prioridade =
            dias === null ? 'BAIXA' : dias <= 2 ? 'ALTA' : dias <= 7 ? 'MÉDIA' : 'BAIXA';
          return {
            course_id: t.course_id,
            course_name: nomes[t.course_id],
            title: t.title,
            description: t.description,
            // Meio dia a mais para (prazo - agora).days dar exatamente days_remaining.
            due_at: dias === null ? null : new Date(agora + (dias + 0.5) * DIA_MS).toISOString(),
            days_remaining: dias,
            priority_level: prioridade,
            action_recommendation: RECOMENDACAO[prioridade],
          };
        })
        .sort((a, b) => (a.days_remaining ?? Infinity) - (b.days_remaining ?? Infinity));
    },

    async resumo(cursoId, tema, { aoProgresso } = {}) {
      const dados = await carregar();
      const d = disciplina(dados, cursoId);
      const plano = await executarPlano(
        'GERAR_RESUMO',
        { dadosLocais: !d.semMaterial },
        d.id,
        aoProgresso,
      );
      const base = { course_id: d.id, course_name: d.name };
      const fixture = dados.resumos[d.id];
      if (!fixture) {
        // src/agente_tutor/service.py:242-253
        return {
          plano,
          resumo: {
            ...base,
            topic_title: 'Matéria não indexada',
            summary_text: `A matéria '${d.name}' (curso ${d.id}) não está indexada no RAG. Rode a indexação (scripts/indexar.py) antes de gerar o resumo.`,
            sources_used: [],
          },
        };
      }
      const t = (tema || '').trim();
      if (t && !d.temas.includes(t.toLowerCase())) {
        return {
          plano,
          resumo: {
            ...base,
            topic_title: `Tema: ${t}`,
            summary_text: MENSAGENS.recusaTutor,
            sources_used: [],
          },
        };
      }
      resumosGerados.add(d.id);
      return {
        plano,
        resumo: {
          ...base,
          topic_title: t ? `Tema: ${t}` : `Visão geral: ${d.name.replace(' (exemplo)', '')}`,
          summary_text: fixture.summary_text,
          sources_used: fixture.sources_used,
        },
      };
    },

    async gerarQuestoes(cursoId, tema, quantidade, { aoProgresso } = {}) {
      const t = (tema || '').trim();
      if (!t) throw new ErroDados('servidor', 'O tema não pode ser vazio.');
      if (!Number.isInteger(quantidade) || quantidade < 1 || quantidade > TETO_QUESTOES) {
        throw new ErroDados('servidor', `A quantidade deve ser um número de 1 a ${TETO_QUESTOES}.`);
      }
      const dados = await carregar();
      const d = disciplina(dados, cursoId);
      const plano = await executarPlano(
        'GERAR_QUESTOES',
        { dadosLocais: !d.semMaterial, resumoNoEstado: resumosGerados.has(d.id) },
        d.id,
        aoProgresso,
      );
      // Mesma ordem de decisão de gerar_questoes() (src/agente_gerador/service.py:306-331).
      if (d.semMaterial) {
        return {
          plano,
          resultado: { status: 'sem_material', mensagem: MENSAGENS.cursoNaoIndexado, questoes: [] },
        };
      }
      const banco = dados.questoes[d.id]?.[t.toLowerCase()];
      if (!banco) {
        return {
          plano,
          resultado: { status: 'sem_material', mensagem: MENSAGENS.semMaterial(t), questoes: [] },
        };
      }
      if (quantidade > banco.length) {
        return {
          plano,
          resultado: {
            status: 'sem_material',
            mensagem: MENSAGENS.llmRecusou(t, quantidade),
            questoes: [],
          },
        };
      }
      const questoes = banco.slice(0, quantidade).map((q, i) => ({ ...q, id: `q${i + 1}` }));
      return { plano, resultado: { status: 'ok', mensagem: null, questoes } };
    },
  };
}
