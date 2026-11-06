## Contexto

No primeiro teste apareceram alguns ajustes:

### Backend

- Quando cliquei para `Iniciar Analise` recebi o erro:
  ```bash
    [Nest] 81756  - 11/03/2026, 11:41:43 PM   ERROR [GeminiService] Erro ao chamar Gemini (gemini-2.5-flash): {"error":{"code":404,"message":"This model models/gemini-2.5-flash is no longer available to new users. Please update your code to use models/gemini-3.8-flash for the latest features and improvements. We recommend you to use the Interactions API (https://ai.google.dev/gemini-api/docs/get-started).","status":"NOT_FOUND"}}
  [Nest] 81756  - 11/03/2026, 11:41:43 PM   ERROR [ExceptionsHandler] ApiError: {"error":{"code":404,"message":"This model models/gemini-2.5-flash is no longer available to new users. Please update your code to use models/gemini-3.8-flash for the latest features and improvements. We recommend you to use the Interactions API (https://ai.google.dev/gemini-api/docs/get-started).","status":"NOT_FOUND"}}
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
    status: 404
  }
  ```

### Frontend

#### Geral
- Eu havia escolhido a cor ambar como padrão. Você alterou toda a aplicação para azul.
- Notei que não foi utilizado o shadcn. Gostaria muito que fosse feita a alteração. Facilita muito a componentização.
- Trocar o nome da aba do browser para o nome da aplicação

#### SideBar
- Quero que a sidebar se recolha
- O logout é pra ficar na sidebar.
- Não criar avatar. -> colocar as iniciais
- O menu de Navegação tem: Nova Análise, PR's Ativas, PR's Arquivadas.
- Pode remover a seção Pipeline de Agentes
- Pode remover o PRO que está junto com o nome

#### Nova Revisão 
- Não precisa do modelo da llm;
- O Modo de Análise deve ser: Unificado, ou cada um dos Agentes, ou seja, o aprovador pode solicitar somente um agente ou mais agentes ou todos. Pode até deixar no layout criado, mas quando clicar em `Por Agente` mostrar checkbox de todos os agentes disponíveis.

#### PR's Ativas/Arquivadas
- Os apontamentos apareceram vazios, mesmo todas as PR's estando reprovadas
- As ações, troque pelos "três pontinhos" e um modal com as opções. Assim ocupa menos espaço e pode aumentar na coluna Repositório. E essa é a primeira coluna. Adicione a opção de Abri no Azure.
- No autor pode colocar somente o primeiro e último nome e não precisa do Avatar
- No Risco pode colocar badge com Alto, Médio e Baixo.

#### Detalhe do Parecer
- Só está aparecendo dados na opção Unificado. 
- Além das opções separadas, precisa da opção Completa, porque o que está aparecendo na Unificada é o Resumo Executivo.
