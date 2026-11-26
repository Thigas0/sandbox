// Monta a mensagem e o link do WhatsApp a partir do formulário. Nada é enviado a servidor nem
// guardado: o texto vai no próprio link, e quem envia é o responsável, pelo WhatsApp dele.

export const WHATSAPP_E164 = '5519996594138';

export const DIFICULDADES = {
  alfabetizacao: 'Alfabetização',
  leitura: 'Leitura',
  matematica: 'Matemática',
  outra: 'Outra',
};

export const HORARIOS = {
  manha: 'Manhã',
  tarde: 'Tarde',
  noite: 'Noite',
};

export const SERIES = [
  'Educação Infantil',
  '1º ano',
  '2º ano',
  '3º ano',
  '4º ano',
  '5º ano',
  '6º ano',
  '7º ano',
  '8º ano',
  '9º ano',
  'Ensino Médio',
];

export const IDADE_MIN = 3;
export const IDADE_MAX = 17;
export const OUTRA_MAX = 80;

const limpar = (v) =>
  String(v ?? '')
    .replace(/\s+/g, ' ')
    .trim();

// Retorna { campo: mensagem } só com os campos inválidos. Objeto vazio = tudo certo.
export function validar(dados) {
  const erros = {};
  const idadeTexto = limpar(dados.idade);
  const idade = Number(idadeTexto);

  if (idadeTexto === '') {
    erros.idade = 'Informe a idade da criança.';
  } else if (!/^\d{1,2}$/.test(idadeTexto) || idade < IDADE_MIN || idade > IDADE_MAX) {
    erros.idade = `Use um número de ${IDADE_MIN} a ${IDADE_MAX}.`;
  }

  if (!SERIES.includes(limpar(dados.serie))) {
    erros.serie = 'Escolha a série.';
  }

  if (!Object.hasOwn(DIFICULDADES, dados.dificuldade ?? '')) {
    erros.dificuldade = 'Escolha a dificuldade principal.';
  } else if (dados.dificuldade === 'outra') {
    const outra = limpar(dados.outra);
    if (outra === '') erros.outra = 'Conte em poucas palavras qual é a dificuldade.';
    else if (outra.length > OUTRA_MAX) erros.outra = `Use até ${OUTRA_MAX} caracteres.`;
  }

  if (!Object.hasOwn(HORARIOS, dados.horario ?? '')) {
    erros.horario = 'Escolha o melhor horário.';
  }

  return erros;
}

export function montarMensagem(dados) {
  const dificuldade =
    dados.dificuldade === 'outra'
      ? `Outra: ${limpar(dados.outra)}`
      : (DIFICULDADES[dados.dificuldade] ?? '');

  return [
    'Olá, Professora Cátia! Vim pelo site da Catelle e gostaria de saber sobre o reforço.',
    `Idade: ${limpar(dados.idade)} anos`,
    `Série: ${limpar(dados.serie)}`,
    `Dificuldade: ${dificuldade}`,
    `Melhor horário: ${HORARIOS[dados.horario] ?? ''}`,
  ].join('\n');
}

export function montarLink(dados) {
  return `https://wa.me/${WHATSAPP_E164}?text=${encodeURIComponent(montarMensagem(dados))}`;
}
