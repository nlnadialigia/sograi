## Contexto

Novos ajustes:

- Ao solicitar uma análise de Pull Request, a auditoria falhou na etapa de análise de arquivo com erro de sintaxe JSON do modelo Gemini.

Erro no Terminal -> Backend:

```bash
[Nest] 242719  - 05/11/2026, 19:59:18   ERROR [GeminiService] Falha ao parsear JSON retornado pelo Gemini: Expected double-quoted property name in JSON at position 1907 (line 14 column 7)
Raw: {
  "verdict": "APROVADO",
  "justification": "A alteração introduz o parâmetro `allowPartialSlopes` de forma limpa, mantendo a retrocompatibilidade e corrigindo a expressão regular de limpeza de `originalUp`. O código está estruturado e coerente.",
  "styleNotes": "O uso de parâmetros opcionais com
[Nest] 242719  - 05/11/2026, 19:59:18   ERROR [ReviewsService] Erro ao analisar o arquivo /src/puzzle/pi/services/plan-input/menu-input.service.ts: Falha ao interpretar resposta estruturada da IA: Expected double-quoted property name in JSON at position 1907 (line 14 column 7). A resposta do modelo não seguiu o padrão JSON esperado.
```

Crie o arquivo de diagnóstico no mesmo padrão existente.
Faça todas as perguntas necessárias para o melhor entendimento do processo.
Faça a correção do bug.
