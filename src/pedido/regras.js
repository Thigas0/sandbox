// Regras do pedido: preços, limites dos adicionais, totais e a mensagem que vai para o WhatsApp.
// Funções puras, sem DOM, usadas pela página e pelos testes.

export function reais(centavos) {
  return `R$ ${(centavos / 100).toFixed(2).replace('.', ',')}`;
}

// escolha = { variante: índice em item.precos, adicionais: { 'grupo:opcao': qtd }, obs, qtd }
export function precoUnitario(item, escolha, grupos) {
  const base = item.precos[escolha.variante ?? 0]?.centavos ?? 0;
  let extras = 0;
  for (const [chave, qtd] of Object.entries(escolha.adicionais || {})) {
    const [g, o] = chave.split(':');
    const opcao = grupos[g]?.opcoes[Number(o)];
    if (opcao && qtd > 0) extras += opcao.preco_centavos * qtd;
  }
  return base + extras;
}

export function quantidadeNoGrupo(escolha, grupoId) {
  return Object.entries(escolha.adicionais || {})
    .filter(([chave]) => chave.startsWith(`${grupoId}:`))
    .reduce((soma, [, qtd]) => soma + qtd, 0);
}

// Devolve a lista de problemas da escolha (vazia quando dá para adicionar ao pedido).
export function validarEscolha(item, escolha, grupos) {
  const problemas = [];
  for (const id of item.grupos) {
    const grupo = grupos[id];
    if (!grupo) continue;
    const total = quantidadeNoGrupo(escolha, id);
    if (total < grupo.minimo) problemas.push(`Escolha ${grupo.titulo.toLowerCase()}.`);
    if (total > grupo.maximo) {
      problemas.push(`Até ${grupo.maximo} em ${grupo.titulo.toLowerCase()}.`);
    }
    grupo.opcoes.forEach((opcao, i) => {
      if ((escolha.adicionais?.[`${id}:${i}`] || 0) > opcao.maximo) {
        problemas.push(`Até ${opcao.maximo} de ${opcao.nome.toLowerCase()}.`);
      }
    });
  }
  if (!(escolha.qtd >= 1)) problemas.push('Escolha a quantidade.');
  return problemas;
}

export function descreverEscolha(item, escolha, grupos) {
  const partes = [];
  const variante = item.precos[escolha.variante ?? 0];
  if (variante?.rotulo) partes.push(variante.rotulo);
  for (const [chave, qtd] of Object.entries(escolha.adicionais || {})) {
    if (!qtd) continue;
    const [g, o] = chave.split(':');
    const opcao = grupos[g]?.opcoes[Number(o)];
    if (!opcao) continue;
    const nome = grupos[g].minimo > 0 ? opcao.nome : `+ ${opcao.nome}`;
    partes.push(qtd > 1 ? `${nome} x${qtd}` : nome);
  }
  return partes;
}

export function totais(carrinho, cardapio, entrega) {
  const subtotal = carrinho.reduce((soma, linha) => {
    const item = cardapio.itens[linha.item];
    return item ? soma + precoUnitario(item, linha, cardapio.grupos) * linha.qtd : soma;
  }, 0);
  const taxa = entrega?.tipo === 'entrega' ? (entrega.taxa ?? 0) : 0;
  const quantidade = carrinho.reduce((soma, linha) => soma + linha.qtd, 0);
  return { subtotal, taxa, total: subtotal + taxa, quantidade };
}

// Problemas no formulário de finalização, por campo.
export function validarDados(dados) {
  const erros = {};
  if (!dados.nome?.trim()) erros.nome = 'Diga o seu nome.';
  const digitos = (dados.telefone || '').replace(/\D/g, '');
  if (digitos.length < 10 || digitos.length > 13) erros.telefone = 'Telefone com DDD, só números.';
  if (dados.tipo === 'entrega') {
    if (!dados.bairro) erros.bairro = 'Escolha o bairro.';
    if (!dados.rua?.trim()) erros.rua = 'Diga a rua.';
    if (!dados.numero?.trim()) erros.numero = 'Diga o número.';
  }
  if (!dados.pagamento) erros.pagamento = 'Escolha como vai pagar.';
  return erros;
}

export function codigoPedido(data = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `H${p(data.getDate())}${p(data.getHours())}${p(data.getMinutes())}${p(data.getSeconds())}`;
}

export function mensagemWhatsApp({ carrinho, cardapio, dados, codigo }) {
  const entrega = { tipo: dados.tipo, taxa: dados.taxa };
  const t = totais(carrinho, cardapio, entrega);
  const linhas = [`*Pedido ${codigo}* pelo site do Hugão`, ''];
  for (const linha of carrinho) {
    const item = cardapio.itens[linha.item];
    if (!item) continue;
    const valor = precoUnitario(item, linha, cardapio.grupos) * linha.qtd;
    linhas.push(`${linha.qtd}x ${item.nome} — ${reais(valor)}`);
    const detalhes = descreverEscolha(item, linha, cardapio.grupos);
    if (detalhes.length) linhas.push(`   ${detalhes.join(', ')}`);
    if (linha.obs?.trim()) linhas.push(`   Obs.: ${linha.obs.trim()}`);
  }
  linhas.push('', `Subtotal: ${reais(t.subtotal)}`);
  if (dados.tipo === 'entrega') {
    linhas.push(`Entrega (${dados.bairro}): ${reais(t.taxa)}`);
  }
  linhas.push(`*Total: ${reais(t.total)}*`, '');
  linhas.push(`Nome: ${dados.nome.trim()}`, `Telefone: ${dados.telefone.trim()}`);
  if (dados.tipo === 'entrega') {
    const endereco = [`${dados.rua.trim()}, ${dados.numero.trim()}`];
    if (dados.complemento?.trim()) endereco.push(dados.complemento.trim());
    endereco.push(dados.bairro);
    linhas.push(`Entregar em: ${endereco.join(' — ')}`);
    if (dados.referencia?.trim()) linhas.push(`Referência: ${dados.referencia.trim()}`);
  } else {
    linhas.push('Vou retirar no balcão (R. Irmã Dulce, 153).');
  }
  let pagamento = `Pagamento: ${dados.pagamento}`;
  if (dados.pagamento === 'Dinheiro' && dados.troco?.trim()) {
    pagamento += `, troco para ${dados.troco.trim()}`;
  }
  linhas.push(pagamento);
  if (dados.obs?.trim()) linhas.push(`Observações: ${dados.obs.trim()}`);
  return linhas.join('\n');
}

export function linkWhatsApp(numero, mensagem) {
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}
