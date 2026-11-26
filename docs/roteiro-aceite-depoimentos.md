# Roteiro: aceite dos depoimentos

Para a Professora Cátia enviar, uma a uma, às mães que avaliaram a Catelle no Google.

## Mensagem sugerida (WhatsApp)

> Oi, [nome]! Tudo bem? Estou fazendo o site da Catelle e queria muito colocar a sua avaliação do
> Google, do jeitinho que você escreveu, com o seu nome como aparece lá. Posso usar? Se preferir que
> não, sem problema nenhum. E se um dia quiser tirar, é só me avisar.

## Como registrar

1. Guarde o print da resposta "pode usar" (com data).
2. Copie o texto da avaliação **exatamente** como está no Google: sem corrigir, sem cortar e sem juntar
   avaliações.
3. Acrescente em `src/data/depoimentos.json`:

```json
{
  "autor": "Nome como aparece no Google",
  "texto": "Texto literal da avaliação",
  "aceite": "AAAA-MM-DD"
}
```

Sem `aceite`, o depoimento não aparece no site (o teste `tests/e2e/depoimentos.spec.js` confere isso).
Se alguém pedir para sair, apague a entrada e publique de novo.
