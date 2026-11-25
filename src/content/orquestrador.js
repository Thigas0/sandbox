// Rotas do Orquestrador, reproduzidas de OrchestratorService.build_execution_plan
// (branch origin/orquestrador, src/agente_orquestrador/service.py:82-153, commit 5b517bf).
// Se o serviço mudar, atualize este arquivo e o teste e2e que confere as rotas.

// false: o nó ainda não está ligado ao grafo de main (node.py vazio). Troque para true quando
// src/graph.py chamar o Orquestrador; o texto da seção 4 e do roadmap muda sozinho.
export const ORQUESTRADOR_NO_GRAFO = false;

export const NOMES = {
  canvas_agent: 'Canvas',
  tutor_agent: 'Tutor',
  question_generator_agent: 'Gerador',
};

/**
 * @param {object} p
 * @param {string} p.acao SINCRONIZAR_CANVAS | GERAR_CRONOGRAMA | GERAR_RESUMO | GERAR_QUESTOES | FLUXO_COMPLETO
 * @param {boolean} p.dadosLocais PDFs e assignments.json em data/raw (has_local_data)
 * @param {boolean} p.resumoNoEstado resumo da disciplina já em state.summaries
 * @param {boolean} p.forcarSync state.force_sync
 * @returns {{passos: string[], motivo: string}}
 */
export function planejar({ acao, dadosLocais, resumoNoEstado, forcarSync }) {
  switch (acao) {
    case 'SINCRONIZAR_CANVAS':
      return {
        passos: ['canvas_agent'],
        motivo: 'Sincronização explícita com o Canvas LMS solicitada.',
      };
    case 'GERAR_CRONOGRAMA':
      return forcarSync || !dadosLocais
        ? {
            passos: ['canvas_agent', 'tutor_agent'],
            motivo:
              'Dados de tarefas ausentes ou sincronização forçada; executando Canvas antes do Tutor.',
          }
        : {
            passos: ['tutor_agent'],
            motivo: 'Dados locais encontrados em data/raw; pulando Canvas e acionando o Tutor.',
          };
    case 'GERAR_RESUMO':
      return forcarSync || !dadosLocais
        ? {
            passos: ['canvas_agent', 'tutor_agent'],
            motivo:
              'PDFs ausentes em data/raw ou sincronização forçada; baixando materiais antes de resumir.',
          }
        : {
            passos: ['tutor_agent'],
            motivo: 'PDFs já disponíveis localmente; acionando o Tutor direto para a síntese.',
          };
    case 'GERAR_QUESTOES':
      if (forcarSync || !dadosLocais) {
        return {
          passos: ['canvas_agent', 'tutor_agent', 'question_generator_agent'],
          motivo:
            'Base de PDFs ausente ou sincronização forçada; ingestão e síntese antes de gerar questões.',
        };
      }
      if (!resumoNoEstado) {
        return {
          passos: ['tutor_agent', 'question_generator_agent'],
          motivo:
            'PDFs locais encontrados, mas sem resumo no estado; o Tutor prepara o contexto antes do Gerador.',
        };
      }
      return {
        passos: ['question_generator_agent'],
        motivo: 'Contexto e resumos prontos no estado; acionando o Gerador direto.',
      };
    default:
      return {
        passos: ['canvas_agent', 'tutor_agent'],
        motivo: 'Execução completa da esteira padrão (Canvas → Tutor).',
      };
  }
}
