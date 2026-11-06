## Frontend

- No dark mode melhorar a cor dos botões. Está muito forte. Não sei o quanto isso não é ruim para acessibilidade.
- O botão de sair tem que ficar no mesmo card que os dados do usuário. Pode colocar só o ícone.
- Achei a fonte muito pequena.
- Remover as iniciais do header. Deixar somente o ícone de dark/light mode.

### Sidebar
- Quando eu recolhi a sidebar ficou aparecendo metade do ícone do Título. Preencher o espaço por completo.
- O botão sair não funcionou. Deveria redirecionar para a tela de preenchimento de nome e email.

### Nova Revisão
- deixar só o placeholder no input -> está vindo preenchido
- Quando iniciar análise ocultar os tipos de agente e desabilitar o preenchimento do input ou do Modelo de Análise.


### PR's Ativas/Arquivadas
- Padronize o nome do autor em letra maiúscula
- A coluna Ações é a primeira
- Além de estar no Dropdown, tornar todos os dados das linhas clicáveis para visualizar o parecer.
- Deixar o Dropdown menor e junto aos  três pontinhos. Usar o modelo do shadcn.
- No Excluir definitvamente, abrir Alert Dialog de confirmação.

### Detalhe do Parecer
- Só consegui ver o Unificado e o Completo. Troque o nome Unificado por Resumo Executivo. Acho que vai ser necessária tratativa no backend para ver por Agente. Vamos deixar como pendência porque vamos fazer mudanças no backend. Depois ajustamos isso.


## Backend

- erro na última etapa da análise
```bash
[Nest] 83701  - 11/04/2026, 12:15:39 AM   ERROR [GeminiService] Erro ao chamar Gemini (gemini-3.8-flash): {"error":{"code":503,"message":"This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.","status":"UNAVAILABLE"}}
[Nest] 83701  - 11/04/2026, 12:15:39 AM   ERROR [ExceptionsHandler] ApiError: {"error":{"code":503,"message":"This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.","status":"UNAVAILABLE"}}
    at throwErrorIfNotOK (/home/nadiasantos/www/code-review/sograi-backend/node_modules/.pnpm/@google+genai@2.32.0_supports-color@8.1.1/node_modules/@google/genai/dist/node/index.cjs:14340:30)
    at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
    at async /home/nadiasantos/www/code-review/sograi-backend/node_modules/.pnpm/@google+genai@2.32.0_supports-color@8.1.1/node_modules/@google/genai/dist/node/index.cjs:13995:13
    at async Models.generateContentWithContinuation (/home/nadiasantos/www/code-review/sograi-backend/node_modules/.pnpm/@google+genai@2.32.0_supports-color@8.1.1/node_modules/@google/genai/dist/node/index.cjs:16411:30)
    at async Models.generateContent (/home/nadiasantos/www/code-review/sograi-backend/node_modules/.pnpm/@google+genai@2.32.0_supports-color@8.1.1/node_modules/@google/genai/dist/node/index.cjs:16075:24)
    at async GeminiService.generate (/home/nadiasantos/www/code-review/sograi-backend/src/modules/gemini/gemini.service.ts:36:24)
    at async AgentsService.runUnifiedAnalysis (/home/nadiasantos/www/code-review/sograi-backend/src/modules/agents/agents.service.ts:42:21)
    at async ReviewsService.analyzePullRequest (/home/nadiasantos/www/code-review/sograi-backend/src/modules/reviews/reviews.service.ts:65:19)
    at async /home/nadiasantos/www/code-review/sograi-backend/node_modules/.pnpm/@nestjs+core@11.2.8_@nestjs+common@11.2.8_class-transformer@0.5.1_class-validator@0.14._95fd9e9c46b5da089e26b594c4ae89c0/node_modules/@nestjs/core/router/router-execution-context.js:81:62
    at async /home/nadiasantos/www/code-review/sograi-backend/node_modules/.pnpm/@nestjs+core@11.2.8_@nestjs+common@11.2.8_class-transformer@0.5.1_class-validator@0.14._95fd9e9c46b5da089e26b594c4ae89c0/node_modules/@nestjs/core/router/router-proxy.js:9:17 {
  status: 503
}
```