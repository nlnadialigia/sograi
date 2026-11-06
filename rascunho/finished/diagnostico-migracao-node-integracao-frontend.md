# 👵 Diagnóstico: Integração SogrAI Frontend (React) + Migração Backend para Node.js / TypeScript

> *"Sempre pronta para achar um defeito naquilo que você fez com carinho."*

---

## 1. Contexto e Objetivo

O projeto **SogrAI** recebeu uma nova interface visual moderna localizada em `sograi-frontend/` (desenvolvida com React 19, Vite, Tailwind CSS v4 e Lucide Icons), substituindo o protótipo inicial em Streamlit. Além disso, a pasta do backend anterior foi renomeada para `sograi-backend/`.

### Perguntas e Metas da Usuária:
1. **O backend precisa necessariamente ser em Python ou pode ser em Node.js?**
2. **Plano de migração para Node.js / TypeScript** mantendo todas as regras de negócio, agentes e integrações existentes.
3. **Plano de integração do novo frontend com o backend**, conectando os estados estáticos/mockados do `App.tsx` às APIs reais de revisão e persistência.

---

## 2. Análise Técnica: Python vs. NestJS (Node.js / TypeScript)

### Resposta direta: **Com certeza! O NestJS é uma escolha fantástica para o backend da SogrAI.**

| Critério | Python (Atual) | NestJS (Node.js / TypeScript) | Veredito |
| :--- | :--- | :--- | :--- |
| **Arquitetura** | Scripts avulsos e classes manuais | Módulos, Controllers, Services e Injeção de Dependências (DI) | **Grande Vantagem NestJS** (Clean Architecture escalável) |
| **Integração com Gemini** | `google-genai` (SDK Python) | `@google/genai` injetado como um `GeminiService` reutilizável | **Excelente no NestJS** |
| **Integração Azure DevOps** | `requests` (REST) | `AzureDevOpsService` injetável via `HttpModule` (Axios) ou SDK | **Vantagem NestJS** |
| **Tipagem e DTOs** | `dataclasses` / `dict` | DTOs tipados com validação automática (`class-validator`) | **Grande Vantagem NestJS** |
| **Stack Unificada** | 2 ecossistemas (Python/Pip + Node/pnpm) | 1 único ecossistema fullstack (TypeScript / Node 24 / pnpm) | **Grande Vantagem NestJS** |
| **Progresso em Tempo Real** | Mais trabalhoso | `@Sse()` nativo no NestJS para progresso da barra do React em tempo real | **Vantagem NestJS** |
| **Banco de Dados** | `psycopg2` / queries SQL | `Prisma` ou `TypeORM` conectado ao PostgreSQL 18 existente | **Excelente** |

> **Conclusão:** O **NestJS** encaixa perfeitamente na **SogrAI**:
> - Cada agente (Style, Security, Performance, TestCoverage, TechLead e ExecutiveSummary) se torna um **Service / Provider** injetável e testável.
> - O fluxo de orquestração fica em um `ReviewWorkflowService`.
> - O backend ganha documentação Swagger automática (`@nestjs/swagger`) e controllers REST padronizados (`ReviewController`).

---

## 3. Mapeamento dos Componentes para Migração (Python ➔ NestJS)

```
sograi-backend (Python)                     sograi-backend (NestJS / TypeScript)
├── src/config.py                 ───►      src/config/configuration.ts (@nestjs/config)
├── src/tools/azure_devops_client ───►      src/modules/azure-devops/azure-devops.service.ts
├── src/llms/client.py            ───►      src/modules/gemini/gemini.service.ts (@google/genai)
├── src/agents/                   ───►      src/modules/agents/
│   ├── style_agent.py            ───►          ├── style.agent.ts
│   ├── security_agent.py         ───►          ├── security.agent.ts
│   ├── performance_agent.py      ───►          ├── performance.agent.ts
│   ├── test_coverage_agent.py    ───►          ├── test-coverage.agent.ts
│   ├── tech_lead_agent.py        ───►          ├── tech-lead.agent.ts
│   ├── unified_agent.py          ───►          ├── unified-review.agent.ts
│   └── executive_agent.py        ───►          └── executive-summary.agent.ts
├── src/workflows/review_workflow ───►      src/modules/reviews/review-workflow.service.ts
├── src/db/repository.py          ───►      src/modules/database/database.service.ts (pg / prisma)
├── src/utils/report_generator.py ───►      src/modules/reviews/report-generator.service.ts
└── app.py (Streamlit)            ───►      src/modules/reviews/reviews.controller.ts (REST & SSE)
```

---

## 4. Análise da Nova Interface (`sograi-frontend`)

A nova interface em `sograi-frontend/src/App.tsx` possui um design rico e completo com:
- **Página Nova Análise (`new`)**:
  - Campo de URL da PR com validação visual.
  - Seleção de modo de análise (Rápido unificado vs. Completo detalhado).
  - Seleção do modelo de IA (Gemini 2.5 Flash, Pro, etc.).
  - Barra de progresso dinâmica em tempo real (etapas: Conexão Azure ➔ Diff de arquivos ➔ Agentes ➔ Relatório Executivo).
- **Página Histórico (`history`)**:
  - Tabela com filtros (Status: Aprovada / Reprovada / Atenção, Nível de Risco: Baixo / Médio / Alto, Busca por termo).
  - Cards de métricas rápidas (Total de reviews, Taxa de aprovação, Issues críticas, Tempo médio).
- **Página Detalhes da Análise (`detail`)**:
  - Cabeçalho com status, risco e botões de exportação (Markdown completo e executivo).
  - Abas: **Resumo Executivo** (com veredito da SogrAI, blockers e alertas) e **Relatório Técnico** (com tabs por arquivo e badges dos 5 agentes).
- **Página Arquivados (`archived`)**:
  - Gerenciamento de histórico arquivado.

### O que precisa ser conectado ao Backend:
Atualmente o `App.tsx` utiliza dados mockados (`reviewsSeed`). A integração substituirá esses mocks por chamadas HTTP para o backend.

---

## 5. Endpoints Necessários na API do Backend (Node.js)

1. `POST /api/reviews/analyze`:
   - **Body**: `{ prUrl: string, mode: 'unified' | 'separated', model?: string }`
   - **Resposta / Stream**: Envia o progresso da análise (SSE ou pooling) e retorna a PR analisada com os dois relatórios (executivo e completo) e o nível de risco.
2. `GET /api/reviews`:
   - Lista todas as análises salvas no PostgreSQL (para a aba Histórico).
3. `GET /api/reviews/:id`:
   - Retorna os dados completos de uma análise específica, incluindo os relatórios Markdown e arquivos analisados.
4. `PATCH /api/reviews/:id/archive`:
   - Alterna o status de arquivamento no banco de dados.
5. `GET /api/reviews/:id/download/:type`:
   - Download do arquivo Markdown (`executivo` ou `completo`).
6. `GET /api/health`:
   - Status dos serviços (PostgreSQL e credenciais do Azure/Gemini).

---

## 6. Plano de Execução em Fases

### Fase 1: Inicialização do Backend Node.js / TypeScript
- Configurar projeto Node em TypeScript no `sograi-backend/` (usando Fastify ou Express + pnpm).
- Instalar dependências essenciais: `@google/genai`, `pg`, `dotenv`, `cors`, `zod`.
- Portar utilitários: parser de URL do Azure DevOps e cliente REST do Azure DevOps.

### Fase 2: Portabilidade dos Agentes e Orquestrador
- Portar os prompts e classes dos agentes (`Style`, `Security`, `Performance`, `TestCoverage`, `TechLead`, `UnifiedReview` e `ExecutiveSummary`).
- Portar o orquestrador `reviewWorkflow`.
- Portar a geração dos relatórios Markdown (`executivo` e `completo`).

### Fase 3: Persistência no PostgreSQL
- Criar cliente de banco `src/db/repository.ts` consumindo a mesma tabela `pull_requests` e `file_reviews` do PostgreSQL 18 que já está ativo no Docker (`docker-compose.yml` porta 5433).

### Fase 4: Integração do Frontend (`sograi-frontend`)
- Criar camada de serviço de API em `sograi-frontend/src/services/api.ts`.
- Substituir o estado mockado do `App.tsx` pelas chamadas reais da API.
- Configurar proxy no `vite.config.ts` apontando `/api` para `http://localhost:5001`.
- Habilitar download real dos relatórios Markdown e navegação dinâmica.

### Fase 5: Validação e Testes Ponta a Ponta
- Executar revisão de uma PR real do Azure DevOps pela nova interface React.
- Conferir exibição do sumário executivo, relatório técnico detalhado e histórico no PostgreSQL.
