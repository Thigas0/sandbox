# Captura da demo (fallback da apresentação)

O site mostra uma execução gravada da CLI do Glaux caso a demo ao vivo falhe. O site nunca chama o
Canvas nem o Groq: tudo vem de arquivos estáticos em `public/demo/`.

## 1. Gravar a execução (time do Glaux, na máquina com o `.env`)

No repositório do Glaux:

```
python src/graph.py --curso <id> --tema "<tema>" --questoes 3
```

Grave a tela do terminal (mp4, até ~20 MB, 1280×720 basta). A CLI grava
`data/processed/tutor_output.json` e `data/processed/questoes_output.json` (`src/graph.py:130-163`).

## 2. Sanitizar antes de copiar para o site

- `tutor_output.json`:
  - apague `user_id`, `courses`, `downloaded_files` e o campo `description` de cada item de `assignments`;
  - mantenha só 1 resumo em `summaries`.
- `questoes_output.json`: mantenha como está. Confira se os trechos citados podem ser exibidos.
- Nunca copie o `.env`, tokens, `data/raw/` ou PDFs.
- Trechos de slides e dados reais da execução podem ser exibidos (permissão concedida em 25/11, P5).
  Mesmo assim, tokens e identificadores de usuário nunca entram.

## 3. Publicar no site

Copie os arquivos para `public/demo/` e preencha `public/demo/manifest.json`:

```json
{
  "capturadoEm": "26/11/2026",
  "video": "demo.mp4",
  "poster": "demo.jpg",
  "tutor": "tutor_output.json",
  "questoes": "questoes_output.json"
}
```

Campo com `null` = arquivo ausente; o site não o pede. Rode `./scripts/verify.sh --full` depois.
