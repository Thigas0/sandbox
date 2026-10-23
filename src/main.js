import { iniciarBuscaDeEventos } from './eventos.js';
import { iniciarOrcamento } from './orcamento.js';

iniciarBuscaDeEventos(document);

const formulario = document.querySelector('[data-orcamento]');
if (formulario) iniciarOrcamento(formulario);
