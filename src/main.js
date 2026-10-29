import { iniciarBuscaDeEventos } from './eventos.js';
import {
  iniciarEntradas,
  iniciarFilme,
  iniciarFoco,
  iniciarFotos,
  iniciarLente,
  iniciarVisor,
} from './movimento.js';
import { iniciarOrcamento } from './orcamento.js';

iniciarBuscaDeEventos(document);

const formulario = document.querySelector('[data-orcamento]');
if (formulario) iniciarOrcamento(formulario);

iniciarLente(document);
iniciarFotos(document);
iniciarFilme(document);
iniciarEntradas(document);
iniciarFoco(document);
iniciarVisor(document);
