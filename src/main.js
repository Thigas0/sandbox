import { iniciarBuscaDeEventos } from './eventos.js';
import { iniciarEntradas, iniciarLente } from './movimento.js';
import { iniciarOrcamento } from './orcamento.js';

iniciarBuscaDeEventos(document);

const formulario = document.querySelector('[data-orcamento]');
if (formulario) iniciarOrcamento(formulario);

iniciarLente(document);
iniciarEntradas(document);
