# Diagnóstico e Especificação Técnica: Descoberta de PRs por Repositório (Feature 01)

**Arquivo:** `rascunho/diagnostico_feature_01.md`  
**Data:** 04/11/2026  
**Contexto:** `rascunho/feature_01.md`  
**Status:** Alinhado e Especificado

---

## 1. Regra de Negócio Consolidada

1. **Seleção de Repositório(s)**:
   - A página de **Nova Análise** inicia com o controle de seleção de Repositórios.
   - O usuário pode selecionar um repositório específico ou selecionar a opção **"Todos os Repositórios"**.
2. **Listagem das PRs em Aberto**:
   - Ao selecionar o(s) repositório(s), o sistema busca e exibe uma tabela com todas as PRs ativas correspondentes.
   - **Indicador de Status Local**: Cada linha da tabela informa se a PR já foi analisada previamente pela SogrAI (ex: `Não analisada` vs `Iteração 1 - Reprovada` / `Iteração 2 - Aprovada`).
3. **Disparo de Análise**:
   - Cada linha possui a ação **"Analisar"** (ou **"Reanalisar"** caso já tenha histórico).
   - As análises rodam **uma por vez** (individualmente), garantindo foco, detalhamento visual dos agentes e segurança contra quotas da LLM.
4. **Modo Alternativo**:
   - Há um botão/toggle discreto para quem desejar **"Colar URL avulsa"** manualmente.

---

## 2. Endpoints do Backend (NestJS)

1. `GET /api/azure/repositories`
   - Retorna a lista de repositórios do projeto Azure DevOps configurado (`name`, `id`).
2. `GET /api/azure/open-prs?repository={repoName}`
   - Busca as PRs ativas no Azure DevOps. Se `repository` for informado, filtra pelo repositório; se omitido ou `"all"`, busca todas do projeto.
   - Cruza com a tabela local `pull_requests` no PostgreSQL para injetar os metadados:
     - `alreadyAnalyzed: boolean`
     - `lastIteration?: number`
     - `lastStatus?: string`
     - `lastRisk?: string`
     - `dbId?: number`

---

## 3. UI / UX no Frontend (React)

- **Card de Filtro**:
  - Select / Combobox de Repositório com as opções:
    - `⭐ Todos os Repositórios (N PRs abertas)`
    - Lista individual de cada repositório (ex: `ai-agent-api`, `colmeia-backend`...).
  - Botão secundário estilizado: `Ou colar link direto da PR`.
- **Tabela de PRs Abertas**:
  - Colunas:
    1. **Ação**: Botão `Analisar` (ou `Reanalisar` se já tiver iteração prévia).
    2. **PR**: `#ID` com link externo direto para o Azure DevOps.
    3. **Repositório**: Tag com o nome do repo.
    4. **Título da PR**: Nome do pull request.
    5. **Autor**: Nome do criador da PR.
    6. **Status SogrAI**: Badge (`Não analisada`, `Iteração 1 • Reprovada`, etc.).
    7. **Data**: Tempo decorrido (ex: `há 2 horas`, `ontem`).
- **Ao clicar em Analisar**:
  - Inicia a auditoria com a barra de progresso em tempo real da SogrAI exatamente como o fluxo atual.
