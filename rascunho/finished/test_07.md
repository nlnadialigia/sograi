## Contexto

Novos ajustes:

- Eu solicitei uma análise e quando ela terminou não apareceu nem em PR's ativas nem em arquivadas.

Erro na Análise pela interface:
`Bad control character in string literal in JSON at position 2422 (line 15 column 406)`

Erro no Terminal -> Backend

```bash
[Nest] 151481  - 05/11/2026, 16:15:41   ERROR [GeminiService] Falha ao parsear JSON retornado pelo Gemini: Bad control character in string literal in JSON at position 2422 (line 15 column 406)
Raw: {
  "verdict": "APROVADO",
  "justification": "A inclusão do campo 'availableGravelledVolume' na atualização em lote foi executada corretamente, mantendo a parametrização segura contra SQL Injection com Prisma.sql e preservando o chunking de performance.",
  "styleNotes": "A alteração em si é concis
```

Crie o arquivo de diagnóstico no mesmo padrão existente.
Faça todas as perguntas necessárias para o melhor entendimento do processo.
Faça a correção do bug.
