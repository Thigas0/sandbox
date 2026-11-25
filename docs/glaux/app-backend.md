# O que o app espera do backend (implementação "api")

O app (`/app/`) fala com o backend só por `src/app/dados/api.js`, que cumpre o contrato de
`src/app/dados/contrato.js`. Hoje o Glaux é uma CLI (`src/graph.py`); estes são os endpoints que um
servidor HTTP precisa expor para o app sair do modo demo. Os campos são os dos modelos Python.

## Configuração

- **Build do app:** `VITE_GLAUX_API_URL=https://api.exemplo.org npm run build`.
  - A origem entra no `connect-src` da CSP do app (`vite.config.js`). Só `https` é aceito, exceto
    `localhost`.
  - Antes do deploy, crie em `vercel.json` um bloco de cabeçalhos para `/app/(.*)` com a mesma CSP
    mais essa origem no `connect-src`. Hoje há um bloco só, para o site todo, porque ainda não existe
    backend.
- **CORS no backend:** liberar a origem do site com `Access-Control-Allow-Credentials: true`, porque o
  app usa `credentials: 'include'`.
- **Respostas:** JSON. Tempo limite no app: 60 s.
- **Erros HTTP:** 401/403 → "sessão inválida"; 5xx → "erro do servidor"; falha de rede → "sem conexão".
  O `sem_material` e o `erro` do Gerador **não** são erro HTTP: vêm com 200, em `resultado.status`.

## Sessão

| Método | Caminho | Corpo | Resposta |
|---|---|---|---|
| POST | `/sessao` | `{"canvas_url": "https://…", "token": "…"}` | 204, com um cookie de sessão `HttpOnly; Secure; SameSite` |
| DELETE | `/sessao` | — | 204 |

O token do Canvas chega uma única vez e fica só no servidor. O app não o guarda em lugar nenhum.

## Dados

| Método | Caminho | Corpo | Resposta (200) | No Glaux |
|---|---|---|---|---|
| POST | `/sincronizar` | — | `{"plano": Plano, "disciplinas": [Disciplina]}` | Orquestrador `SINCRONIZAR_CANVAS` → `canvas_agent_node` |
| GET | `/disciplinas` | — | `[Disciplina]` | `CanvasService.get_user_courses` |
| GET | `/cronograma` | — | `[Tarefa]`, ordenado por `days_remaining` | `TutorService.generate_schedule` |
| POST | `/resumos` | `{"course_id": 123, "tema": "…" \| null}` | `{"plano": Plano, "resumo": Resumo}` | Orquestrador `GERAR_RESUMO` → `generate_summary_for_course` |
| POST | `/questoes` | `{"course_id": 123, "tema": "…", "quantidade": 1-10, "tipos": ["multipla_escolha", "dissertativa"]}` | `{"plano": Plano, "resultado": Resultado}` | Orquestrador `GERAR_QUESTOES` → `gerar_questoes` |

## Tipos

```
Disciplina {id: int, name: str}
Tarefa     {course_id, course_name, title, description|null, due_at|null, days_remaining|null,
            priority_level: "ALTA"|"MÉDIA"|"BAIXA", action_recommendation}
Resumo     {course_id, course_name, topic_title, summary_text, sources_used: [{arquivo, pagina, pagina_fim}]}
Questao    {id, tipo: "multipla_escolha"|"dissertativa", enunciado, assunto,
            trecho_referencia: {arquivo, pagina, pagina_fim, texto},
            alternativas: {A, B, C, D} e correta: "A".."D"   (só na múltipla escolha)}
Resultado  {status: "ok"|"sem_material"|"erro", mensagem: str|null, questoes: [Questao]}
Plano      {steps: ["canvas_agent"|"tutor_agent"|"question_generator_agent"], resolved_course_id, reason}
```

Validação no app (`contrato.js`): uma resposta fora dessa forma vira o erro "Resposta inesperada do
servidor" e nada dela é exibido.
