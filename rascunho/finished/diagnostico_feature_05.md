# Diagnóstico Técnico - Feature 05: Multi-Projeto, Multi-Repositório, Painel Admin e Integração GitHub

## 1. Contexto e Motivação

Atualmente, o **SogrAI** está acoplado a uma única organização e projeto no Azure DevOps:
- A organização (`suzano`) e o projeto (`Chapter Devs`) estão definidos de forma fixa no serviço `AzureDevOpsService` (`sograi-backend/src/modules/azure-devops/azure-devops.service.ts`).
- O frontend lista apenas os repositórios pertencentes a esse projeto fixo.
- As credenciais (tokens e URLs) são lidas exclusivamente de variáveis de ambiente (`.env`).
- Apenas a plataforma Azure DevOps é suportada para consulta e análise de Pull Requests.

A **Feature 05** visa transformar o SogrAI em uma plataforma flexível, configurável e multi-plataforma:
1. **Seleção Multi-Projeto e Multi-Repositório**: Permitir que o usuário selecione múltiplos projetos e repositórios, com suporte a busca digitada (combobox/autocomplete).
2. **Painel de Administração / Configurações**: Acessível via ícone de engrenagem no cabeçalho (ao lado do alternador de tema claro/escuro), com abas para gerenciamento de credenciais/parâmetros e uma aba dedicada a **Orientações**.
3. **Integração com GitHub**: Expandir a coleta de Pull Requests, diffs e metadados para repositórios hospedados no GitHub (públicos e privados).

---

## 2. Diagnóstico do Cenário Atual

### 2.1. Backend (`sograi-backend`)
1. **Acoplamento no `AzureDevOpsService`**:
   - Métodos `getDefaultOrg()` e `getDefaultProject()` utilizam valores hardcoded (`suzano` e `Chapter%20Devs`).
   - Não existe endpoint para listar os projetos disponíveis na organização (`/_apis/projects`).
   - O método `listRepositories` não recebe o projeto como parâmetro dinâmico.
2. **Ausência do Provedor GitHub**:
   - Toda a estrutura de análise em `ReviewsService` espera URLs do formato `dev.azure.com`.
   - Inexistência de um `GitHubService` para consultar a API REST do GitHub (`/repos/{owner}/{repo}/pulls`, diffs e conteúdos de arquivos).
3. **Persistência de Configurações**:
   - Os tokens (`AZURE_DEVOPS_TOKEN`, `GEMINI_API_KEY`) residem apenas no `.env` do backend.
   - Não há tabela de configurações dinâmicas no banco de dados (`Prisma`), impedindo a atualização de credenciais ou projetos monitorados via interface web.

### 2.2. Frontend (`sograi-frontend`)
1. **Seleção de Repositórios (`RepoSelector.tsx`)**:
   - Apresenta apenas uma lista de repositórios do projeto padrão. Não há seleção prévia ou simultânea de projetos.
2. **Cabeçalho (`Topbar.tsx`)**:
   - Contém apenas o botão de alternância de tema (Sol/Lua). Falta o botão de engrenagem para abrir a interface administrativa/configurações.
3. **Modal de Configuração de Análise (`AnalysisConfigModal.tsx`) e Tabela de PRs**:
   - As PRs abertas são carregadas apenas com base nos repositórios do projeto fixo.

---

## 3. Arquitetura da Solução Proposta

### 3.1. Gerenciamento e Armazenamento de Configurações
Para permitir que o usuário altere links, tokens e projetos dinamicamente pela interface:
- **Tabela de Configurações no Banco (`SystemConfig` / `ProviderConfig` via Prisma)**:
  - Armazenar pares chave-valor ou registros tipados por provedor (`azure`, `github`, `gemini`).
  - Mascarar tokens sensíveis na resposta da API (`ghp_****`, `pat_****`) para garantir segurança.
  - Fallback transparente: caso o banco não possua uma configuração específica, o sistema utiliza o valor definido no `.env`.

### 3.2. Abstração de Provedores de VCS (Version Control Systems)
Criar uma interface unificada para consumo nos serviços de revisão:
- `IVcsProvider`:
  - `listProjects(token?: string): Promise<VcsProject[]>` (para Azure; no GitHub pode representar Organizations/Owners).
  - `listRepositories(projectOrOrg: string, token?: string): Promise<VcsRepo[]>`
  - `listOpenPullRequests(filters: VcsPrFilters): Promise<VcsPr[]>`
  - `getPullRequestDetails(prUrlInfo: VcsPrUrlInfo, token?: string): Promise<VcsPrDetail>`
  - `getFileContent(prUrlInfo: VcsPrUrlInfo, filePath: string, commitOrBranch: string): Promise<string>`
- Implementações:
  - `AzureDevOpsService` (refatorado para aceitar organização e projetos dinâmicos).
  - `GitHubService` (novo serviço consumindo a API GitHub v3 / Octokit REST).

### 3.3. Interface de Admin (Engrenagem no Header)
- **Acesso**: Ícone de engrenagem (`Settings` do `lucide-react`) adicionado no `Topbar.tsx` ao lado do alternador de tema claro/escuro.
- **Formato**: **Página/tela completa dedicada** (uma nova página na aplicação, permitindo navegação limpa e espaçosa para formulários e guias).
- **Abas Planejadas**:
  1. **Aba "Provedores de Código (VCS)"**:
     - **Azure DevOps**: URL da Organização (ex: `https://dev.azure.com/sua-org`), Token de Acesso Pessoal (PAT), Projetos padrão/ativos.
     - **GitHub**: Token de Acesso Pessoal (PAT - Classic ou Fine-grained), URL da API (padrão `https://api.github.com`, customizável para GitHub Enterprise).
  2. **Aba "IA & Revisão"**:
     - Chave da API Gemini (`GEMINI_API_KEY`), seleção de modelo (`gemini-2.5-flash`), parâmetros opcionais dos agentes.
  3. **Aba "Orientações"**:
     - Passo a passo ilustrado com instruções para gerar o PAT no Azure DevOps (permissão `Code: Read`).
     - Instruções para criar o Token no GitHub (escopos mínimos de leitura de repositório).
     - Orientações de boas práticas de Pull Request e como interpretar os pareceres da SogrAI.

### 3.4. Mecanismo de Integração com o GitHub
- **Autodescoberta sem esforço manual**: Ao cadastrar o Token do GitHub, o sistema consulta a API do GitHub (`GET /user/repos`) que lista automaticamente todos os repositórios aos quais aquele token possui acesso (tanto repositórios pessoais quanto de organizações que o usuário integra).
- **Flexibilidade Total (URL Direta)**: O usuário também poderá colar qualquer link direto de PR do GitHub (ex: `https://github.com/empresa/projeto/pull/42`), com detecção automática pelo backend e extração instantânea dos arquivos e diffs.

### 3.5. Componente de Filtro Multi-Projeto e Multi-Repositório com Busca
- **Seletor de Plataforma/Provedor no Topo**: Abas elegantes para alternar entre `Azure DevOps` e `GitHub`.
- **Filtros com Digitação (Autocomplete / Combobox)**:
  - **Filtro de Projetos / Organizações**: Permite selecionar 1 ou múltiplos projetos do Azure (ou organizações do GitHub), com digitação imediata para busca.
  - **Filtro de Repositórios**: Reativo às seleções acima, com suporte a busca digitada e seleção múltipla.
  - **Tabela de PRs Abertas**: Atualizada em tempo real conforme as seleções de projetos e repositórios.

---

## 4. Conformidade e Regras do Projeto

1. **Limite de 350 linhas por arquivo**:
   - A interface de Admin será modularizada em componentes menores (ex: `AdminModal.tsx`, `ProviderConfigTab.tsx`, `AiConfigTab.tsx`, `GuideTab.tsx`).
   - O backend manterá módulos e controllers separados (`config.module`, `github.module`, `azure-devops.module`).
2. **Gerenciador de Pacotes**: `pnpm` exclusivamente.
3. **Estabilidade de Build**: Validação contínua com `nest build` e `vite build`.

---

## 5. Plano de Execução Sugerido

- **Fase 1 (Backend - Modelo de Dados & Configurações)**:
  - Criar modelo Prisma para configurações (`SystemSetting` ou similar).
  - Criar `ConfigModule`, `ConfigService` e `ConfigController` com endpoints seguros para leitura (com máscara) e gravação de credenciais.
- **Fase 2 (Backend - Multi-Projeto Azure & Novo Módulo GitHub)**:
  - Desacoplar `AzureDevOpsService` para listar projetos e aceitar projetos dinâmicos.
  - Implementar `GitHubModule` e `GitHubService` para suporte completo a PRs do GitHub.
  - Atualizar `ReviewsService` para reconhecer URLs de ambas as plataformas.
- **Fase 3 (Frontend - Interface Admin & Aba de Orientações)**:
  - Adicionar a engrenagem no `Topbar.tsx`.
  - Desenvolver o modal/tela de administração com abas (Provedores, Orientações).
- **Fase 4 (Frontend - Seleção Multi-Projeto e Multi-Repositório)**:
  - Implementar seleção e busca por digitação para projetos e repositórios.
  - Conectar com a tabela de PRs abertas filtrada.
- **Fase 5 (Testes, Linhas & Documentação)**:
  - Validar compilação (`pnpm build`), limites de linhas (<350) e atualizar `session.md`.
