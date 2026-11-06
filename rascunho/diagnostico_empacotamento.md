# Diagnóstico Técnico - Empacotamento, Distribuição e Publicação (SogrAI)

## 1. Contexto e Motivação

O **SogrAI** atingiu o nível de maturidade necessário para ser publicado e empacotado para distribuição open-source e equipes de engenharia.
O objetivo deste processo é disponibilizar duas opções completas de execução (Docker Compose Completo e Script Instalador Automatizado), unificar o projeto em um **Monorepo** limpo para o GitHub, atualizar todos os READMEs e garantir uma aplicação 100% white-label (livre de referências corporativas).

---

## 2. Decisões Confirmadas de Alinhamento

1. **Estrutura de Repositório (Monorepo)**:
   - Unificar a aplicação em um **único repositório GitHub (Monorepo)** na raiz do projeto contendo as pastas `sograi-backend` e `sograi-frontend`.
   - Inicializar o repositório `.git` unificado na raiz sem necessidade de manter históricos legados de commits individuais.
   - Adicionar `.gitignore` completo na raiz protegendo `.env`, `node_modules`, `dist/`, logs e arquivos temporários.

2. **Organização da Documentação (READMEs)**:
   - **README Principal (`/README.md`)**: Visão geral do ecossistema SogrAI, arquitetura conceitual, guia rápido de uso com as duas opções de inicialização (Docker Compose vs. Script Instalador) e links diretos para os subprojetos.
   - **README do Backend (`/sograi-backend/README.md`)**: Instruções de API NestJS, Prisma ORM, migrations, integração de IA e link de destaque para o documento de arquitetura [`docs/arquitetura_analise_prompts.md`](file:///home/nlnadialigia/www/code-review/sograi-backend/docs/arquitetura_analise_prompts.md).
   - **README do Frontend (`/sograi-frontend/README.md`)**: Visão das interfaces (React 19, Tailwind CSS v4, Lucide), estrutura de componentes, relatórios e exportação PDF.

3. **Orquestração Docker Compose Completa**:
   - Imagem do **PostgreSQL** com volume persistente e verificação de integridade (healthcheck).
   - Imagem do **Backend**: `sograi-backend/Dockerfile` multi-stage rodando com Node Alpine, executando sincronização do schema Prisma (`prisma db push`) no bootstrap e expondo a API na porta `3333`.
   - Imagem do **Frontend**: `sograi-frontend/Dockerfile` multi-stage com build otimizado via Vite e servidor **Nginx Alpine** de alta performance na porta `3000`, com proxy reverso roteando requisições `/api/` e `/events/` de forma transparente para o backend.
   - Arquivo [`docker-compose.yml`](file:///home/nlnadialigia/www/code-review/docker-compose.yml) na raiz permitindo subir todo o sistema com:
     ```bash
     docker compose up -d --build
     ```

4. **Script Instalador Automatizado (`install.sh`)**:
   - Script bash intuitivo na raiz para quem deseja rodar bare-metal com pnpm:
     - Checagem automática de Node.js (>= 20), pnpm e Docker.
     - Criação automática dos arquivos `.env` baseados em `.env.example`.
     - Inicialização do PostgreSQL via container Docker se necessário.
     - Instalação de dependências (`pnpm install`).
     - Geração de schema e migrations Prisma (`prisma db push`).
     - Compilação dos projetos (`pnpm build`).
     - Script auxiliar `start.sh` para inicializar backend e frontend simultaneamente.

5. **Higienização (White-label)**:
   - Ajustar `.env.example` do backend e frontend com valores de template genéricos (ex: `AZURE_DEVOPS_ORG=sua-organizacao`, `AZURE_DEVOPS_PROJECT=seu-projeto`).

---

## 3. Plano de Implementação

### 3.1. Fase 1: Dockerfiles e Docker Compose Raiz
- Criar [`sograi-backend/Dockerfile`](file:///home/nlnadialigia/www/code-review/sograi-backend/Dockerfile).
- Criar [`sograi-frontend/Dockerfile`](file:///home/nlnadialigia/www/code-review/sograi-frontend/Dockerfile) e [`sograi-frontend/nginx.conf`](file:///home/nlnadialigia/www/code-review/sograi-frontend/nginx.conf) com proxy reverso e suporte a Server-Sent Events (SSE).
- Criar [`docker-compose.yml`](file:///home/nlnadialigia/www/code-review/docker-compose.yml) na raiz integrando PostgreSQL, Backend e Frontend.

### 3.2. Fase 2: Script Instalador Bare-Metal
- Criar [`install.sh`](file:///home/nlnadialigia/www/code-review/install.sh) executável.
- Criar [`start.sh`](file:///home/nlnadialigia/www/code-review/start.sh) executável.

### 3.3. Fase 3: Documentação Completa
- Atualizar [`README.md`](file:///home/nlnadialigia/www/code-review/README.md) na raiz.
- Criar [`sograi-backend/docs/guia_refinamento_prompts.md`](file:///home/nlnadialigia/www/code-review/sograi-backend/docs/guia_refinamento_prompts.md) contendo o guia prático passo a passo de refinamento de prompts para LLMs/Gemini:
  - Critérios essenciais (papel/persona, restrições rígidas, schema JSON tipado e validação defensiva).
  - Como escrever instruções claras, objetivas e determinísticas.
  - Análise aprofundada: **Inglês vs. Português** (quando usar cada idioma, vantagens do inglês no raciocínio e atenção de tokens do modelo vs. respostas finais no idioma nativo do time em pt-br).
- Atualizar [`sograi-backend/README.md`](file:///home/nlnadialigia/www/code-review/sograi-backend/README.md) vinculando [`docs/arquitetura_analise_prompts.md`](file:///home/nlnadialigia/www/code-review/sograi-backend/docs/arquitetura_analise_prompts.md) e [`docs/guia_refinamento_prompts.md`](file:///home/nlnadialigia/www/code-review/sograi-backend/docs/guia_refinamento_prompts.md).
- Atualizar [`sograi-frontend/README.md`](file:///home/nlnadialigia/www/code-review/sograi-frontend/README.md).

### 3.4. Fase 4: Monorepo Git e Higienização
- Nome oficial definido pelo usuário: **`sograi`**.
- Unificação executada via Git Subtree, integrando o histórico completo de commits dos repositórios locais do backend e frontend na raiz.
- Ajustados templates `.env.example` para formato white-label higienizado.
- Configurado [`.gitignore`](file:///home/nlnadialigia/www/code-review/.gitignore) na raiz.
- Repositório Git Monorepo consolidado na branch `main` e pronto para o primeiro push no GitHub.

---

## 4. Conformidade Arquitetural
- Rigoroso limite de **350 linhas** por arquivo.
- Gerenciamento estritamente via **pnpm**.
- Idioma da documentação e mensagens em **Português (pt-br)**.

---

## 5. Entregas Concluídas

1. **Dockerização Completa**:
   - [`sograi-backend/Dockerfile`](file:///home/nlnadialigia/www/code-review/sograi-backend/Dockerfile): Multi-stage build com Node 20 Alpine, sincronização Prisma e execução do NestJS na porta 3333.
   - [`sograi-frontend/Dockerfile`](file:///home/nlnadialigia/www/code-review/sograi-frontend/Dockerfile) e [`sograi-frontend/nginx.conf`](file:///home/nlnadialigia/www/code-review/sograi-frontend/nginx.conf): Multi-stage com build Vite e servidor Nginx Alpine na porta 3000 com proxy reverso e suporte a Server-Sent Events (SSE).
   - [`docker-compose.yml`](file:///home/nlnadialigia/www/code-review/docker-compose.yml): Orquestração de PostgreSQL 16 com volume persistente, Backend e Frontend. Validado com `docker compose config`.

2. **Scripts Automatizados Bare-Metal**:
   - [`install.sh`](file:///home/nlnadialigia/www/code-review/install.sh): Script instalador completo (checagem de Node/pnpm/Docker, criação de .env, sincronização Prisma e compilação).
   - [`start.sh`](file:///home/nlnadialigia/www/code-review/start.sh): Inicialização conjunta de desenvolvimento com tratamento de interrupção elegante.

3. **Documentação e Seção 01**:
   - [`README.md`](file:///home/nlnadialigia/www/code-review/README.md) raiz: Visão geral da plataforma, arquitetura do monorepo e instruções de execução (Docker vs. Script).
   - [`sograi-backend/docs/guia_refinamento_prompts.md`](file:///home/nlnadialigia/www/code-review/sograi-backend/docs/guia_refinamento_prompts.md): Guia passo a passo com critérios de clareza, objetividade e análise comparativa **Inglês vs. Português** (estratégia híbrida).
   - [`sograi-backend/README.md`](file:///home/nlnadialigia/www/code-review/sograi-backend/README.md): Atualizado com a stack NestJS/Prisma e links para a pasta `docs/`.
   - [`sograi-frontend/README.md`](file:///home/nlnadialigia/www/code-review/sograi-frontend/README.md): Atualizado com a stack React 19/Tailwind v4/PDF.

4. **Monorepo Git com Histórico Preservado**:
   - Repositório Git consolidado na raiz como **`sograi`**.
   - Preservados os commits de `sograi-backend` e `sograi-frontend`.
   - `.gitignore` e `.env.example` configurados na raiz.
