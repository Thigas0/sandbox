// Interface do pedido: janela do lanche, sacola, gaveta e finalização pelo WhatsApp.
import {
  reais,
  precoUnitario,
  quantidadeNoGrupo,
  validarEscolha,
  descreverEscolha,
  totais,
  validarDados,
  codigoPedido,
  mensagemWhatsApp,
  linkWhatsApp,
} from './regras.js';

const CHAVE = 'hugao-pedido-v1';
const $ = (sel, raiz = document) => raiz.querySelector(sel);
const $$ = (sel, raiz = document) => [...raiz.querySelectorAll(sel)];

function ler() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE)) || {};
  } catch {
    return {};
  }
}

function gravar(estado) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(estado));
  } catch {
    // Sem armazenamento (aba anônima, bloqueado): o pedido segue só nesta visita.
  }
}

function el(tag, attrs = {}, ...filhos) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === false || v == null) continue;
    if (k === 'class') n.className = v;
    else if (k === 'text') n.textContent = v;
    else n.setAttribute(k, v === true ? '' : v);
  }
  n.append(...filhos.filter((f) => f != null));
  return n;
}

export function iniciarPedido(loja, situacaoAgora) {
  const cardapio = loja?.cardapio;
  if (!cardapio) return;
  document.documentElement.classList.add('pedido');

  const salvo = ler();
  const estado = {
    carrinho: Array.isArray(salvo.carrinho)
      ? salvo.carrinho.filter((l) => cardapio.itens[l.item])
      : [],
    cliente: salvo.cliente || {},
  };
  const persistir = () => gravar({ carrinho: estado.carrinho, cliente: estado.cliente });

  const janela = $('[data-item-janela]');
  const gaveta = $('[data-gaveta]');
  const form = $('[data-item-form]');
  const checkout = $('[data-checkout]');
  const sacola = $('[data-sacola]');
  const aviso = $('[data-aviso]');
  let atual = null; // { chave, item, escolha }

  // ---------- Janela do lanche ----------
  function abrirItem(chave, variante = 0) {
    const item = cardapio.itens[chave];
    if (!item || !janela) return;
    atual = { chave, item, escolha: { variante: Number(variante) || 0, adicionais: {}, qtd: 1 } };
    const foto = $('[data-item-foto]', janela);
    foto.hidden = !item.foto;
    if (item.foto) foto.src = item.foto;
    $('[data-item-secao]', janela).textContent = item.secao;
    $('[data-item-nome]', janela).textContent = item.nome;
    $('[data-item-desc]', janela).textContent = item.descricao;
    form.elements.obs.value = '';
    $('[data-item-erro]', janela).textContent = '';
    montarOpcoes();
    atualizarItem();
    janela.showModal();
  }

  function montarOpcoes() {
    const caixa = $('[data-item-opcoes]', janela);
    caixa.replaceChildren();
    const { item, escolha } = atual;

    if (item.precos.length > 1) {
      const fs = el(
        'fieldset',
        { class: 'escolha escolha--chips' },
        el('legend', { text: 'Tamanho' }),
      );
      item.precos.forEach((p, i) => {
        const input = el('input', { type: 'radio', name: 'variante', value: String(i) });
        input.checked = i === escolha.variante;
        input.addEventListener('change', () => {
          escolha.variante = i;
          atualizarItem();
        });
        fs.append(el('label', {}, input, ` ${p.rotulo || 'Único'} · ${reais(p.centavos)}`));
      });
      caixa.append(fs);
    }

    for (const id of item.grupos) {
      const grupo = cardapio.grupos[id];
      const unico = grupo.maximo === 1;
      const legenda = unico
        ? `${grupo.titulo}${grupo.minimo ? ' (escolha 1)' : ''}`
        : `${grupo.titulo} (até ${grupo.maximo})`;
      const fs = el(
        'fieldset',
        { class: `escolha${unico ? ' escolha--chips' : ' escolha--lista'}` },
        el('legend', { text: legenda }),
      );
      grupo.opcoes.forEach((opcao, i) => {
        const chave = `${id}:${i}`;
        const preco = opcao.preco_centavos ? ` + ${reais(opcao.preco_centavos)}` : '';
        if (unico) {
          const input = el('input', { type: 'radio', name: `g-${id}`, value: chave });
          input.addEventListener('change', () => {
            for (let j = 0; j < grupo.opcoes.length; j += 1)
              delete escolha.adicionais[`${id}:${j}`];
            escolha.adicionais[chave] = 1;
            atualizarItem();
          });
          fs.append(el('label', {}, input, ` ${opcao.nome}${preco}`));
        } else {
          const valor = el('output', { text: '0', 'aria-live': 'polite' });
          const menos = el('button', {
            type: 'button',
            'aria-label': `Tirar ${opcao.nome}`,
            text: '−',
          });
          const mais = el('button', {
            type: 'button',
            'aria-label': `Adicionar ${opcao.nome}`,
            text: '+',
          });
          const mudar = (passo) => {
            const agora = escolha.adicionais[chave] || 0;
            const novo = agora + passo;
            if (novo < 0 || novo > opcao.maximo) return;
            if (passo > 0 && quantidadeNoGrupo(escolha, id) >= grupo.maximo) {
              mostrarAviso(`Até ${grupo.maximo} adicionais por lanche.`);
              return;
            }
            if (novo) escolha.adicionais[chave] = novo;
            else delete escolha.adicionais[chave];
            valor.textContent = String(novo);
            linha.classList.toggle('ativo', novo > 0);
            atualizarItem();
          };
          menos.addEventListener('click', () => mudar(-1));
          mais.addEventListener('click', () => mudar(1));
          const linha = el(
            'div',
            { class: 'extra' },
            el('span', { class: 'extra__nome', text: opcao.nome }),
            el('span', { class: 'extra__preco', text: preco.replace(' + ', '+ ') }),
            el('span', { class: 'qtd qtd--mini' }, menos, valor, mais),
          );
          fs.append(linha);
        }
      });
      caixa.append(fs);
    }
  }

  function atualizarItem() {
    const { item, escolha } = atual;
    $('[data-qtd-valor]', janela).textContent = String(escolha.qtd);
    const valor = precoUnitario(item, escolha, cardapio.grupos) * escolha.qtd;
    const total = $('[data-item-total]', janela);
    total.textContent = reais(valor);
    total.classList.remove('pulsa');
    void total.offsetWidth;
    total.classList.add('pulsa');
  }

  $('[data-qtd-menos]', janela)?.addEventListener('click', () => {
    if (atual && atual.escolha.qtd > 1) {
      atual.escolha.qtd -= 1;
      atualizarItem();
    }
  });
  $('[data-qtd-mais]', janela)?.addEventListener('click', () => {
    if (atual && atual.escolha.qtd < 20) {
      atual.escolha.qtd += 1;
      atualizarItem();
    }
  });

  form?.addEventListener('submit', (evento) => {
    evento.preventDefault();
    if (!atual) return;
    const { chave, item, escolha } = atual;
    const problemas = validarEscolha(item, escolha, cardapio.grupos);
    if (problemas.length) {
      $('[data-item-erro]', janela).textContent = problemas.join(' ');
      return;
    }
    estado.carrinho.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      item: chave,
      variante: escolha.variante,
      adicionais: { ...escolha.adicionais },
      obs: form.elements.obs.value.trim(),
      qtd: escolha.qtd,
    });
    persistir();
    fechar(janela);
    atualizarSacola(true);
    mostrarAviso(`${escolha.qtd}x ${item.nome} no pedido.`);
  });

  // ---------- Sacola e gaveta ----------
  function atualizarSacola(pular = false) {
    const t = totais(estado.carrinho, cardapio);
    const conta = $('[data-conta]');
    if (sacola) {
      sacola.hidden = t.quantidade === 0;
      $('[data-sacola-conta]', sacola).textContent =
        `${t.quantidade} ${t.quantidade === 1 ? 'item' : 'itens'}`;
      $('[data-sacola-total]', sacola).textContent = reais(t.subtotal);
      if (pular) {
        sacola.classList.remove('pula');
        void sacola.offsetWidth;
        sacola.classList.add('pula');
      }
    }
    if (conta) {
      conta.hidden = t.quantidade === 0;
      conta.textContent = String(t.quantidade);
      if (pular) {
        conta.classList.remove('pula');
        void conta.offsetWidth;
        conta.classList.add('pula');
      }
    }
  }

  function abrirGaveta() {
    if (!gaveta) return;
    $('[data-confirmacao]', gaveta).hidden = true;
    $('[data-etapa-pedido]', gaveta).hidden = false;
    montarGaveta();
    gaveta.showModal();
  }

  function montarGaveta() {
    const lista = $('[data-gaveta-itens]', gaveta);
    lista.replaceChildren();
    for (const linha of estado.carrinho) {
      const item = cardapio.itens[linha.item];
      const detalhes = descreverEscolha(item, linha, cardapio.grupos);
      const menos = el('button', {
        type: 'button',
        'aria-label': `Um ${item.nome} a menos`,
        text: '−',
      });
      const mais = el('button', {
        type: 'button',
        'aria-label': `Um ${item.nome} a mais`,
        text: '+',
      });
      const tirar = el('button', { type: 'button', class: 'linha__tirar', text: 'Remover' });
      menos.addEventListener('click', () => mudarLinha(linha.id, -1));
      mais.addEventListener('click', () => mudarLinha(linha.id, 1));
      tirar.addEventListener('click', () => mudarLinha(linha.id, -linha.qtd));
      lista.append(
        el(
          'li',
          { class: 'linha' },
          item.foto
            ? el('img', { src: item.foto, alt: '', width: 160, height: 160, class: 'linha__foto' })
            : null,
          el(
            'div',
            { class: 'linha__texto' },
            el('p', { class: 'linha__nome', text: item.nome }),
            detalhes.length ? el('p', { class: 'linha__det', text: detalhes.join(', ') }) : null,
            linha.obs ? el('p', { class: 'linha__det', text: `Obs.: ${linha.obs}` }) : null,
            el(
              'div',
              { class: 'linha__acoes' },
              el(
                'span',
                { class: 'qtd qtd--mini' },
                menos,
                el('output', { text: String(linha.qtd) }),
                mais,
              ),
              tirar,
            ),
          ),
          el('p', {
            class: 'linha__preco',
            text: reais(precoUnitario(item, linha, cardapio.grupos) * linha.qtd),
          }),
        ),
      );
    }
    const vazio = estado.carrinho.length === 0;
    $('[data-gaveta-vazio]', gaveta).hidden = !vazio;
    checkout.hidden = vazio;
    atualizarResumo();
  }

  function mudarLinha(id, passo) {
    const linha = estado.carrinho.find((l) => l.id === id);
    if (!linha) return;
    linha.qtd += passo;
    if (linha.qtd <= 0) estado.carrinho = estado.carrinho.filter((l) => l.id !== id);
    persistir();
    montarGaveta();
    atualizarSacola();
  }

  // ---------- Finalização ----------
  const bairroSelect = $('[data-checkout-bairro]', checkout);
  for (const b of loja.bairros) {
    bairroSelect.append(el('option', { value: b.nome, text: `${b.nome} (${reais(b.taxa)})` }));
  }
  const pagamentos = $('[data-pagamentos]', checkout);
  for (const forma of loja.pagamentos) {
    pagamentos.insertBefore(
      el(
        'label',
        {},
        el('input', {
          type: 'radio',
          name: 'pagamento',
          value: forma === 'Dinheiro' ? 'Dinheiro' : forma,
        }),
        ` ${forma}`,
      ),
      $('[data-erro="pagamento"]', pagamentos),
    );
  }

  function lerCheckout() {
    const f = checkout.elements;
    const tipo = f.tipo.value;
    const bairro = f.bairro.value;
    const taxa = loja.bairros.find((b) => b.nome === bairro)?.taxa;
    return {
      tipo,
      bairro,
      taxa,
      rua: f.rua.value,
      numero: f.numero.value,
      complemento: f.complemento.value,
      referencia: f.referencia.value,
      nome: f.nome.value,
      telefone: f.telefone.value,
      pagamento: f.pagamento.value,
      troco: f.troco.value,
      obs: f.obs.value,
    };
  }

  function preencherCheckout() {
    const f = checkout.elements;
    for (const campo of [
      'nome',
      'telefone',
      'rua',
      'numero',
      'complemento',
      'referencia',
      'bairro',
    ]) {
      if (estado.cliente[campo]) f[campo].value = estado.cliente[campo];
    }
    if (estado.cliente.tipo) f.tipo.value = estado.cliente.tipo;
  }

  function atualizarResumo() {
    const dados = lerCheckout();
    const entrega = dados.tipo === 'entrega';
    for (const bloco of $$('[data-so-entrega]', gaveta)) bloco.hidden = !entrega;
    $('[data-troco]', checkout).hidden = dados.pagamento !== 'Dinheiro';
    const t = totais(estado.carrinho, cardapio, { tipo: dados.tipo, taxa: dados.taxa });
    $('[data-resumo-subtotal]', checkout).textContent = reais(t.subtotal);
    $('[data-resumo-taxa]', checkout).textContent =
      dados.taxa != null ? reais(dados.taxa) : 'escolha o bairro';
    $('[data-resumo-total]', checkout).textContent = reais(t.total);
    const s = situacaoAgora?.();
    const tempo = entrega ? `${loja.entregaMin} minutos` : `${loja.retiradaMin} minutos`;
    $('[data-checkout-aviso]', checkout).textContent =
      s && !s.aceso
        ? `O Hugão está fechado agora. ${s.texto.replace('Apagado agora: a', 'A')} O pedido é visto quando abrir.`
        : `Tempo médio: cerca de ${tempo} depois da confirmação.`;
  }

  checkout.addEventListener('input', () => {
    atualizarResumo();
    const d = lerCheckout();
    estado.cliente = {
      nome: d.nome,
      telefone: d.telefone,
      rua: d.rua,
      numero: d.numero,
      complemento: d.complemento,
      referencia: d.referencia,
      bairro: d.bairro,
      tipo: d.tipo,
    };
    persistir();
  });
  checkout.addEventListener('change', atualizarResumo);

  checkout.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const dados = lerCheckout();
    const erros = validarDados(dados);
    for (const saida of $$('[data-erro]', checkout)) {
      saida.textContent = erros[saida.dataset.erro] || '';
    }
    const primeiro = Object.keys(erros)[0];
    if (primeiro) {
      const campo = checkout.elements[primeiro];
      (campo instanceof RadioNodeList ? campo[0] : campo)?.focus();
      return;
    }
    if (!estado.carrinho.length) return;
    const codigo = codigoPedido();
    const mensagem = mensagemWhatsApp({ carrinho: estado.carrinho, cardapio, dados, codigo });
    const link = linkWhatsApp(loja.whatsapp, mensagem);
    window.open(link, '_blank', 'noopener');
    const conf = $('[data-confirmacao]', gaveta);
    $('[data-confirmacao-codigo]', conf).textContent = codigo;
    $('[data-confirmacao-link]', conf).href = link;
    $('[data-etapa-pedido]', gaveta).hidden = true;
    conf.hidden = false;
    conf.focus();
  });

  $('[data-novo-pedido]', gaveta)?.addEventListener('click', () => {
    estado.carrinho = [];
    persistir();
    atualizarSacola();
    fechar(gaveta);
  });

  // ---------- Ligações gerais ----------
  function fechar(dialogo) {
    if (!dialogo?.open) return;
    dialogo.classList.add('saindo');
    const fim = () => {
      dialogo.classList.remove('saindo');
      dialogo.close();
    };
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) fim();
    else setTimeout(fim, 180);
  }

  for (const dialogo of [janela, gaveta]) {
    if (!dialogo) continue;
    $$('[data-fechar]', dialogo).forEach((b) => b.addEventListener('click', () => fechar(dialogo)));
    dialogo.addEventListener('click', (evento) => {
      if (evento.target === dialogo) fechar(dialogo);
    });
  }

  document.addEventListener('click', (evento) => {
    const botao = evento.target.closest('[data-adicionar]');
    if (botao) {
      evento.preventDefault();
      abrirItem(botao.dataset.adicionar, botao.dataset.variante);
    }
  });

  sacola?.addEventListener('click', abrirGaveta);
  $('[data-abrir-pedido]')?.addEventListener('click', (evento) => {
    if (!estado.carrinho.length) return;
    evento.preventDefault();
    abrirGaveta();
  });

  // O bairro escolhido na seção de entrega já vem marcado na finalização.
  $('[data-bairro]')?.addEventListener('change', (evento) => {
    const nome = evento.target.selectedOptions[0]?.textContent;
    if (nome && loja.bairros.some((b) => b.nome === nome)) {
      checkout.elements.bairro.value = nome;
      estado.cliente.bairro = nome;
      persistir();
    }
  });

  let temporizador;
  function mostrarAviso(texto) {
    if (!aviso) return;
    aviso.textContent = texto;
    aviso.classList.add('visivel');
    clearTimeout(temporizador);
    temporizador = setTimeout(() => aviso.classList.remove('visivel'), 2600);
  }

  preencherCheckout();
  atualizarSacola();
}
