// Pedido de orçamento pelo WhatsApp: valida, monta a mensagem e abre o WhatsApp numa nova aba.
// Nada é enviado a este site. Se o navegador bloquear a janela, mostramos o link e a cópia.
import { whatsapp } from './dados/site.json';

const CAMPOS = ['tipo', 'data', 'cidade', 'nome', 'detalhes'];

export const hojeLocal = (agora = new Date()) =>
  [
    agora.getFullYear(),
    String(agora.getMonth() + 1).padStart(2, '0'),
    String(agora.getDate()).padStart(2, '0'),
  ].join('-');

// Os erros saem na ordem dos campos na tela, para o foco ir ao primeiro.
export function validarPedido(pedido, hoje) {
  const erros = {};
  if (!pedido.tipo) erros.tipo = 'Escolha o tipo de evento.';
  if (!pedido.data) erros.data = 'Informe a data do evento.';
  else if (pedido.data < hoje) erros.data = 'A data precisa ser hoje ou depois.';
  if (!pedido.cidade) erros.cidade = 'Informe a cidade do evento.';
  if (!pedido.nome) erros.nome = 'Informe o seu nome.';
  return erros;
}

const dataBrasileira = (iso) => iso.split('-').reverse().join('/');

export function montarMensagem({ tipo, data, cidade, nome, detalhes }) {
  const texto = `Olá! Sou ${nome}. Quero um orçamento de cobertura: ${tipo}, ${dataBrasileira(data)}, ${cidade}.`;
  return detalhes ? `${texto} Detalhes: ${detalhes}` : texto;
}

export const linkDoWhatsApp = (numero, mensagem) =>
  `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;

export function iniciarOrcamento(formulario, { numero = whatsapp, agora = () => new Date() } = {}) {
  const status = formulario.querySelector('[data-orcamento-status]');
  const alternativa = formulario.querySelector('[data-orcamento-alternativa]');
  const link = formulario.querySelector('[data-orcamento-link]');
  const copiar = formulario.querySelector('[data-orcamento-copiar]');
  let mensagem = '';

  formulario.hidden = false;
  formulario.elements.data.min = hojeLocal(agora());

  const mostrarErros = (erros) => {
    for (const saida of formulario.querySelectorAll('[data-erro]')) {
      const nome = saida.dataset.erro;
      saida.textContent = erros[nome] ?? '';
      saida.hidden = !erros[nome];
      if (erros[nome]) formulario.elements[nome].setAttribute('aria-invalid', 'true');
      else formulario.elements[nome].removeAttribute('aria-invalid');
    }
  };

  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    alternativa.hidden = true;
    status.textContent = '';
    const pedido = Object.fromEntries(
      CAMPOS.map((nome) => [nome, formulario.elements[nome].value.trim()]),
    );
    const erros = validarPedido(pedido, hojeLocal(agora()));
    mostrarErros(erros);
    const primeiro = Object.keys(erros)[0];
    if (primeiro) {
      formulario.elements[primeiro].focus();
      return;
    }
    mensagem = montarMensagem(pedido);
    const url = linkDoWhatsApp(numero, mensagem);
    const janela = window.open(url, '_blank');
    if (janela) {
      janela.opener = null;
      status.textContent = 'O WhatsApp abriu em outra aba com a sua mensagem. É só enviar.';
      return;
    }
    link.href = url;
    alternativa.hidden = false;
    status.textContent =
      'O navegador bloqueou a nova janela. Abra o WhatsApp pelo link abaixo ou copie a mensagem.';
    link.focus();
  });

  copiar.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(mensagem);
      status.textContent = 'Mensagem copiada. Agora é só colar no WhatsApp.';
    } catch {
      status.textContent = 'Não deu para copiar. Use o link "Abrir o WhatsApp".';
    }
  });
}
