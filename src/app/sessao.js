// Estado da sessão, só em memória: recarregar a página volta para a entrada.
// Nada vai para localStorage, sessionStorage ou cookie (no modo api, o cookie é do backend).

const estado = {
  modo: null, // "demo" | "api"
  fonte: null, // implementação do contrato (dados/contrato.js)
  pratica: null, // {cursoId, disciplina, tema, questoes, respostas}
};

export const sessao = {
  get ativa() {
    return Boolean(estado.fonte);
  },
  get modo() {
    return estado.modo;
  },
  get fonte() {
    return estado.fonte;
  },
  get pratica() {
    return estado.pratica;
  },
  iniciar(modo, fonte) {
    estado.modo = modo;
    estado.fonte = fonte;
    estado.pratica = null;
  },
  definirPratica(pratica) {
    estado.pratica = pratica;
  },
  async encerrar() {
    const fonte = estado.fonte;
    estado.modo = null;
    estado.fonte = null;
    estado.pratica = null;
    try {
      await fonte?.sair();
    } catch {
      // Sair localmente vale mesmo se o backend não responder.
    }
  },
};
