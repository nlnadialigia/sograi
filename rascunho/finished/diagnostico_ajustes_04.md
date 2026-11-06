# Diagnóstico Técnico e Levantamento de Requisitos: Ciclo de Ajustes 04

**Arquivo:** `rascunho/diagnostico_ajustes_04.md`  
**Data:** 04/11/2026  
**Contexto de Origem:** `rascunho/test_04.md`  
**Objetivo:** Refinamentos de interface no Modal de Auditoria, inclusão de contexto e log visual em tempo real no Card de Progresso durante a análise, estudo de Provedores/Modelos Gratuitos alternativos, restauração da formatação original do Parecer Completo (comentários por arquivo com emojis dos agentes) e parametrização segura de `.env` no Frontend Vite.

---

## 1. Análise dos Itens e Soluções Propostas

### 1.1. Modal Configurar Auditoria SogrAI
- **Problema:** Quando todos os agentes estão selecionados, a interface continua mostrando apenas o botão `Selecionar Todos`, sem a alternativa de `Limpar Todos`.
- **Solução:**
  - Alterar o texto e ação dinamicamente: se todos estiverem marcados (`selectedAgents.length === agents.length`), exibir o botão **`Limpar Todos`** (que zera a lista). Se houver algum desmarcado, exibir **`Selecionar Todos`**.

---

### 1.2. Nova Revisão -> Feedback Durante a Análise
- **Problema 1:** Como ocultamos os selects e a tabela durante a análise, o usuário fica sem saber qual PR está sendo analisada.
  - **Solução:** Exibir um **Card de Metadados da PR em Execução** no topo do progresso com:
    - Tag do Repositório (ex: `colmeia-backend`).
    - PR ID com link externo (`#104346`).
    - Título da PR e Autor.
- **Problema 2:** Exibir cards resumo ou lista de logs à medida que os arquivos e etapas forem sendo concluídos.
  - **Solução Arquitetural:**
    - Hoje o endpoint `/api/reviews/analyze` é uma requisição HTTP única que processa e retorna tudo no final.
    - **Proposta Visual e Interativa:**
      - No backend, podemos expor eventos de streaming (via **Server-Sent Events - SSE** no endpoint `/api/reviews/analyze-stream` ou polling de progresso), OU estruturar no frontend uma régua de log dinâmico de pipeline.
      - **Com SSE (Server-Sent Events):** O backend transmite cada arquivo finalizado em tempo real:
        - `[Iniciando] Conectando ao Azure DevOps...`
        - `[Arquivo 1/10] /src/services/auth.ts -> ✅ Analisado (Style, Security, Performance)`
        - `[Arquivo 2/10] /src/controllers/user.controller.ts -> ⚠️ Analisado (1 blocker)`
        - `[Sintetizando] Gerando parecer executivo consolidado...`
      - Na tela: uma timeline/feed vertical de logs com badges de status em tempo real, mantendo o usuário engajado e informado.

---

### 1.3. Configurações -> Modelos Alternativos Gratuitos (Estudo de Possibilidades)

Conforme solicitado, este estudo analisa as melhores opções gratuitas de LLMs para complementar o Gemini:

| Provedor / Modelo | Modalidade Gratuita | Qualidade para Código | Limitações / Rate Limits |
| :--- | :--- | :--- | :--- |
| **Google Gemini (Padrão Atual)**<br>`gemini-3.5-flash-lite`<br>`gemini-2.5-flash` | Free tier oficial via Google AI Studio API Key | ⭐⭐⭐⭐⭐ (Excelente, suporte a JSON Schema nativo e contexto de 1M) | 15 RPM (requisições por minuto) e 1.500 RPD no plano gratuito. |
| **Groq Cloud API**<br>`llama-3.3-70b-versatile`<br>`qwen-2.5-coder-32b` | Free Tier com API Key gratuita | ⭐⭐⭐⭐⭐ (Velocidade ultra-rápida via LPUs LPU Inference Engine, excelente em código) | 30 RPM, 14.400 RPD gratuitos. Muito estável para código. |
| **GitHub Models (Azure AI)**<br>`gpt-4o-mini`<br>`Phi-3.5-mini` | Gratuito via GitHub Personal Access Token | ⭐⭐⭐⭐ (Ótimo suporte a TypeScript/Python) | Rate limit baixo (15 RPM / 150 RPD), voltado para prototipação. |
| **Ollama Local (Offline)**<br>`qwen2.5-coder:7b`<br>`deepseek-coder:6.7b` | 100% Gratuito e Ilimitado (Roda na máquina local via Docker ou binário) | ⭐⭐⭐⭐ (Depende da GPU/CPU local: RTX ou M1/M2/M3 rodam velozes) | Zero custo de API, total privacidade, porém exige hardware local (mínimo 8GB a 16GB de RAM). O projeto já possui suporte preparado no `.env`! |
| **Cloudflare Workers AI**<br>`@hf/thebloke/deepseek-coder-6.7b` | Free tier diário de 10.000 neurônios | ⭐⭐⭐ (Bom para tarefas leves) | Quota diária esgota rápido para PRs grandes. |

> **Recomendação Técnica:**
> 1. Para provedor na nuvem gratuito com alta velocidade: **Groq Cloud (com `qwen-2.5-coder-32b` ou `llama-3.3-70b`)**. É gratuito, basta gerar uma chave em `console.groq.com`.
> 2. Para privacidade corporativa total (on-premise): **Ollama local** (já configurado nas variáveis do projeto).

---

### 1.4. Detalhe do Parecer -> Parecer Completo Original
- **Referência:** Analisamos o repositório original `ai-agent-code-review/functions/ai_agent_code_review_topic/src/utils/comments.py`.
- **Como funcionava originalmente:**
  - O relatório era organizado por arquivo com a formatação direta dos agentes com emojis característicos:
    ```markdown
    ## 📄 Revisão do arquivo: `/src/service.ts`

    ### 🎨 StyleAgent:
    [Feedback detalhado de estilo e clean code]

    ### 🔒 SecurityAgent:
    [Feedback detalhado de OWASP, credenciais, etc.]

    ### ⚡️ PerformanceAgent:
    [Feedback detalhado de performance e queries]

    ### 🧪 TestCoverageAgent:
    [Feedback de testes]

    ### ❌ TechLead Decision: PR Reprovada / Aprovada
    [Justificativa do Tech Lead]
    ```
- **Ação:** Restaurar no `DetailFullReportView.tsx` essa apresentação exata: blocos limpos com emojis, cabeçalhos de cada especialista e parecer do Tech Lead sem caixas genéricas, exatamente como gerado pelo pipeline do `ai-agent-code-review`.

---

### 1.5. Frontend -> Parametrização com `.env`
- **Problema:** A porta do backend (`http://localhost:5001`) e configurações do servidor Vite estão fixas no `vite.config.ts`. Como o projeto foi versionado no git, credenciais ou hosts não devem ficar hardcoded.
- **Solução:**
  - Criar o arquivo `sograi-frontend/.env.example` e `sograi-frontend/.env`.
  - Configurar as variáveis:
    ```env
    VITE_PORT=5173
    VITE_API_TARGET=http://localhost:5001
    ```
  - Atualizar o `vite.config.ts` utilizando `loadEnv(mode, process.cwd())` para injetar dinamicamente `VITE_API_TARGET` e `VITE_PORT`.
  - Garantir que `sograi-frontend/.gitignore` continue ignorando `.env` e `.env.local`.

---

## 2. Perguntas para Alinhamento

### Pergunta 1: Log e Resumo por Arquivo durante a Análise
Para exibir o progresso detalhado de cada arquivo na tela:
- **Opção A (Recomendada - SSE em Tempo Real):** Implementar um endpoint Server-Sent Events (SSE) no NestJS para enviar cada arquivo analisado em tempo real, gerando cartões no log conforme a IA analisa.
- **Opção B (Simulação de Etapas no Frontend com Resumo Final):** Manter o POST atual com régua de status detalhada e exibir a lista completa de arquivos assim que o retorno chega.

### Pergunta 2: Parecer Completo na Tela
No Detalhe do Parecer ("Parecer Completo"):
- Deseja que seja renderizado o Markdown estruturado original com formatação rica (emojis `🎨 StyleAgent`, `🔒 SecurityAgent`, `⚡️ PerformanceAgent` e badges de decisão), ou um visualizador puro de código/texto?

---

## 3. Próximos Passos
Após o alinhamento das duas perguntas acima, iniciaremos a implementação imediata respeitando o limite estrito de menos de 350 linhas por arquivo.
