// Entrada: conectar ao Canvas (modo api) ou explorar com dados de demonstração.
import { apiDisponivel, criarFonte } from '../dados/index.js';
import { el } from '../ui/dom.js';
import { erro } from '../ui/estados.js';

const URL_PADRAO = 'https://canvas.instructure.com'; // .env.example do Glaux

function campo({ id, rotulo, ajuda, ...attrs }) {
  const idAjuda = `${id}-ajuda`;
  const entrada = el('input', {
    class: 'campo__entrada',
    attrs: { id, name: id, 'aria-describedby': idAjuda, ...attrs },
  });
  return {
    entrada,
    no: el(
      'div',
      { class: 'campo' },
      el('label', { class: 'campo__rotulo', attrs: { for: id }, text: rotulo }),
      entrada,
      el('p', { class: 'campo__ajuda', attrs: { id: idAjuda }, text: ajuda }),
    ),
  };
}

export function render(raiz, _params, ctx) {
  ctx.definirTitulo('Entrar');
  const disponivel = apiDisponivel();

  const url = campo({
    id: 'canvas-url',
    rotulo: 'URL da instituição no Canvas',
    ajuda: 'O endereço que você usa para entrar no Canvas.',
    type: 'url',
    value: URL_PADRAO,
    required: true,
    autocomplete: 'url',
    inputmode: 'url',
  });
  const token = campo({
    id: 'canvas-token',
    rotulo: 'Token de acesso do Canvas',
    ajuda:
      'No Canvas: Conta › Configurações › Novo token de acesso. Ele vai só para o servidor do Glaux.',
    type: 'password',
    required: true,
    autocomplete: 'off',
    spellcheck: 'false',
  });
  const avisoForm = el('div', { class: 'entrada__aviso' });
  const conectar = el('button', { class: 'botao', attrs: { type: 'submit' }, text: 'Conectar' });

  const form = el(
    'form',
    {
      class: 'cartao-app entrada__form',
      attrs: { novalidate: true, 'aria-labelledby': 'titulo-conectar' },
    },
    el('h2', { attrs: { id: 'titulo-conectar' }, text: 'Conectar ao Canvas' }),
    disponivel
      ? null
      : el('p', {
          class: 'nota-app',
          text: 'O backend do Glaux ainda não está disponível. Por enquanto, explore com os dados de demonstração.',
        }),
    url.no,
    token.no,
    avisoForm,
    conectar,
  );

  form.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    avisoForm.replaceChildren();
    const endereco = url.entrada.value.trim();
    if (!/^https:\/\/[^\s/]+/i.test(endereco)) {
      avisoForm.append(
        erro({
          titulo: 'Confira a URL',
          texto: 'Use o endereço completo, começando com https://.',
        }),
      );
      url.entrada.focus();
      return;
    }
    if (!token.entrada.value.trim()) {
      avisoForm.append(
        erro({ titulo: 'Falta o token', texto: 'Cole o token de acesso gerado no Canvas.' }),
      );
      token.entrada.focus();
      return;
    }
    conectar.setAttribute('aria-busy', 'true');
    try {
      const fonte = await criarFonte('api');
      await fonte.conectar(endereco, token.entrada.value.trim());
      token.entrada.value = '';
      ctx.sessao.iniciar('api', fonte);
      ctx.navegar('/painel');
    } catch (e) {
      avisoForm.append(
        erro({
          titulo:
            e.tipo === 'indisponivel'
              ? 'Backend ainda não disponível'
              : 'Não foi possível conectar',
          texto: e.message,
        }),
      );
    } finally {
      conectar.removeAttribute('aria-busy');
    }
  });

  const demo = el('button', {
    class: 'botao botao--fantasma',
    attrs: { type: 'button' },
    text: 'Explorar com dados de demonstração',
  });
  const avisoDemo = el('div');
  demo.addEventListener('click', async () => {
    // No modo demo o token nunca é usado: limpa o campo para não ficar nem na tela.
    token.entrada.value = '';
    avisoDemo.replaceChildren();
    demo.setAttribute('aria-busy', 'true');
    try {
      const fonte = await criarFonte('demo');
      ctx.sessao.iniciar('demo', fonte);
      ctx.navegar('/painel');
    } catch (e) {
      avisoDemo.append(erro({ texto: e.message }));
    } finally {
      demo.removeAttribute('aria-busy');
    }
  });

  raiz.append(
    el(
      'div',
      { class: 'entrada' },
      el(
        'div',
        { class: 'entrada__intro' },
        el('p', { class: 'sobrelinha', text: 'Glaux' }),
        el('h1', { text: 'Seu Canvas vira um plano de estudos.' }),
        el('p', {
          class: 'entrada__lede',
          text: 'Conecte sua conta para o Glaux montar o cronograma, resumir as aulas com a fonte de cada frase e gerar questões para praticar.',
        }),
      ),
      form,
      el(
        'section',
        { class: 'cartao-app entrada__demo', attrs: { 'aria-labelledby': 'titulo-demo' } },
        el('h2', { attrs: { id: 'titulo-demo' }, text: 'Só quer ver como funciona?' }),
        el('p', {
          text: 'Explore o app com disciplinas fictícias. Nada é enviado e nenhum token é usado ou guardado.',
        }),
        demo,
        avisoDemo,
      ),
    ),
  );
}
