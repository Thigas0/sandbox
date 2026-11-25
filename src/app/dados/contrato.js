// Contrato da camada de dados do app. As telas usam só isto; a implementação (demo ou api) é
// escolhida em dados/index.js. Os campos espelham os modelos do backend Python do Glaux:
//
// Disciplina {id, name}                                  src/state.py (CanvasCourse)
// Tarefa     {course_id, course_name, title, description, due_at, days_remaining,
//             priority_level: "ALTA"|"MÉDIA"|"BAIXA", action_recommendation}
//                                                        src/agente_tutor/models.py (TaskPriorityItem)
// Resumo     {course_id, course_name, topic_title, summary_text,
//             sources_used: [{arquivo, pagina, pagina_fim}]}   (CourseSummary)
// Questao    {id, tipo: "multipla_escolha"|"dissertativa", enunciado, assunto,
//             trecho_referencia: {arquivo, pagina, pagina_fim, texto},
//             alternativas?: {A, B, C, D}, correta?}     src/agente_gerador/models.py
// Resultado  {status: "ok"|"sem_material"|"erro", mensagem, questoes}   (ResultadoGeracao)
// Plano      {steps, resolved_course_id, reason}         agente_orquestrador/models.py (branch)
//
// Funções (todas assíncronas):
//   conectar(canvasUrl, token)              → void        (demo: não faz nada)
//   sair()                                  → void
//   sincronizar({aoProgresso})              → {plano, disciplinas}
//   listarDisciplinas()                     → Disciplina[]
//   cronograma()                            → Tarefa[]
//   resumo(cursoId, tema, {aoProgresso})    → {plano, resumo}
//   gerarQuestoes(cursoId, tema, quantidade, {aoProgresso}) → {plano, resultado}
//
// aoProgresso recebe {tipo: "plano", plano} e depois {tipo: "agente", agente, estado}
// ("rodando" | "concluido"). "sem_material" e "erro" do Gerador chegam em resultado.status;
// falhas de transporte lançam ErroDados.

export const TETO_QUESTOES = 10; // src/agente_gerador/service.py:37
export const PRIORIDADES = ['ALTA', 'MÉDIA', 'BAIXA'];

// Mensagens reais do backend, para o app falar como o Glaux fala.
export const MENSAGENS = {
  cursoNaoIndexado:
    'O material desta disciplina ainda não foi carregado no Glaux. Tente de novo mais tarde ou avise o professor.',
  semMaterial: (tema) =>
    `Não encontrei material sobre "${tema}" nesta disciplina. Confira se o tema está escrito como nas aulas.`,
  llmRecusou: (tema, quantidade) =>
    `O material encontrado sobre "${tema}" não é suficiente para ${quantidade} questões. Tente um tema mais específico ou peça menos questões.`,
  erroGerador: 'Não consegui gerar as questões agora. Tente de novo em alguns minutos.',
  recusaTutor: 'O material não cobre este ponto.',
};

export class ErroDados extends Error {
  /** @param {"rede"|"autenticacao"|"servidor"|"indisponivel"} tipo */
  constructor(tipo, mensagem) {
    super(mensagem);
    this.name = 'ErroDados';
    this.tipo = tipo;
  }
}

const texto = (v) => typeof v === 'string';
const inteiro = (v) => Number.isInteger(v);
const opcional = (v, teste) => v === null || v === undefined || teste(v);

function exigir(condicao, oque) {
  if (!condicao) throw new ErroDados('servidor', `Resposta inesperada do servidor (${oque}).`);
}

export function validarDisciplina(d) {
  exigir(d && inteiro(d.id) && texto(d.name), 'disciplina');
  return d;
}

export function validarTarefa(t) {
  exigir(
    t &&
      inteiro(t.course_id) &&
      texto(t.course_name) &&
      texto(t.title) &&
      PRIORIDADES.includes(t.priority_level) &&
      texto(t.action_recommendation) &&
      opcional(t.days_remaining, inteiro) &&
      opcional(t.due_at, texto),
    'tarefa',
  );
  return t;
}

export function validarPlano(p) {
  exigir(p && Array.isArray(p.steps) && p.steps.every(texto) && texto(p.reason), 'plano');
  return p;
}

export function validarResumo(r) {
  exigir(
    r &&
      inteiro(r.course_id) &&
      texto(r.topic_title) &&
      texto(r.summary_text) &&
      Array.isArray(r.sources_used),
    'resumo',
  );
  return r;
}

export function validarQuestao(q) {
  const ref = q && q.trecho_referencia;
  exigir(
    q &&
      texto(q.id) &&
      ['multipla_escolha', 'dissertativa'].includes(q.tipo) &&
      texto(q.enunciado) &&
      ref &&
      texto(ref.arquivo) &&
      inteiro(ref.pagina) &&
      inteiro(ref.pagina_fim) &&
      texto(ref.texto),
    'questão',
  );
  if (q.tipo === 'multipla_escolha') {
    const letras = Object.keys(q.alternativas || {});
    exigir(letras.join('') === 'ABCD' && letras.includes(q.correta), 'alternativas');
  }
  return q;
}

export function validarResultado(r) {
  exigir(r && ['ok', 'sem_material', 'erro'].includes(r.status), 'resultado');
  exigir(Array.isArray(r.questoes), 'questões');
  r.questoes.forEach(validarQuestao);
  exigir(r.status === 'ok' ? r.questoes.length > 0 : texto(r.mensagem), 'status');
  return r;
}
