# 👵 SogrAI - Backend API

> API RESTful em NestJS para auditoria automatizada e implacável de Pull Requests no **Azure DevOps** e **GitHub**, utilizando comitê multi-agente com inteligência artificial generativa (Google Gemini) e persistência relacional com **Prisma ORM** e **PostgreSQL**.

[![Swagger OpenAPI](https://img.shields.io/badge/Swagger-OpenAPI%203.0-85EA2D?style=flat&logo=swagger&logoColor=black)](http://localhost:3333/api/docs)

---

## 🚀 Tecnologias

- **Framework:** [NestJS](https://nestjs.com/) v11 (Node.js >= 20)
- **Linguagem:** TypeScript
- **ORM:** [Prisma ORM](https://www.prisma.io/) v6.19.3
- **Banco de Dados:** PostgreSQL 16
- **IA Generativa:** Google Gemini API (`gemini-2.5-flash`) com tolerância a falhas via `jsonrepair`
- **Streaming:** Server-Sent Events (SSE) para acompanhamento da auditoria em tempo real
- **VCS Integrados:** Azure DevOps REST API & GitHub REST API (Octokit)
- **Gerenciador de Pacotes:** `pnpm`

---

## 📁 Estrutura de Pastas

```text
sograi-backend/
├── docs/
│   ├── arquitetura_analise_prompts.md   # Arquitetura dos 5 agentes e regras de veredito
│   └── guia_refinamento_prompts.md      # Guia passo a passo de refinamento de prompts e idioma
├── prisma/
│   ├── schema.prisma                    # Modelagem relacional Prisma
│   └── migrations/                      # Histórico de migrações SQL
├── src/
│   ├── modules/
│   │   ├── azure/                       # Cliente REST do Azure DevOps
│   │   ├── github/                      # Cliente REST do GitHub e criação automática de Issues
│   │   ├── gemini/                      # Integração com Gemini e reparo de JSON
│   │   ├── reviews/                     # Pipeline de review, SSE e fila FIFO (analysis-queue)
│   │   ├── pending/                     # Gestão de pendências por arquivo e notas de resolução
│   │   ├── settings/                    # Gestão e teste de credenciais e tokens mascarados
│   │   └── database/                    # PrismaService, repositórios e conexões
│   ├── app.module.ts
│   └── main.ts                          # Bootstrap da API (porta 3333)
├── .env.example                         # Template limpo de variáveis de ambiente
└── package.json
```

---

## 📚 Documentação Técnica e Prompts

A documentação especializada de inteligência artificial da SogrAI está disponível na pasta `docs/`:

1. **[Arquitetura de Análise e Especialistas (`docs/arquitetura_analise_prompts.md`)](./docs/arquitetura_analise_prompts.md)**:
   - Funcionamento do Comitê de 5 Especialistas (Style, Security, Performance, QA, Tech Lead).
   - Matriz de decisão de Vereditos (Aprovado, Atenção, Reprovado) e Níveis de Risco (Baixo, Médio, Alto, Crítico).
   - Estrutura dos relatórios técnicos e consolidados.

2. **[Guia Prático de Refinamento de Prompts (`docs/guia_refinamento_prompts.md`)](./docs/guia_refinamento_prompts.md)**:
   - Passo a passo de engenharia de prompt para revisão de código.
   - Boas práticas para instruções claras, determinísticas e contratos de saída JSON rígidos.
   - Análise comparativa: **Inglês vs. Português** e por que adotamos o modelo híbrido (raciocínio em inglês, relatórios finais em português pt-BR).

3. **Governança Arquitetural & Limite de Linhas**:
   - Limite estrito de no máximo **500 linhas** por classe de serviço (`*.service.ts`).
   - Aprovação determinística de migrações automáticas (`migration.sql`).
   - Validação automatizada via script `scripts/check-line-limits.sh` no pipeline de CI.

---

## 🛠️ Configuração e Execução

### 1. Pré-requisitos
- Node.js >= 20
- `pnpm` instalado (`npm install -g pnpm`)
- PostgreSQL rodando localmente ou via container Docker

### 2. Configurar Variáveis de Ambiente
Copie o template:
```bash
cp .env.example .env
```
Edite o arquivo `.env`:
```env
PORT=3333
DATABASE_URL="postgresql://sograi:sograi123@localhost:5432/sograi_db?schema=public"
GEMINI_API_KEY="sua_chave_gemini_aqui"
AZURE_DEVOPS_ORG="sua_organizacao"
AZURE_DEVOPS_PROJECT="seu_projeto"
AZURE_DEVOPS_TOKEN="seu_pat_azure"
GITHUB_TOKEN="seu_pat_github"
```

### 3. Instalar Dependências
```bash
pnpm install
```

### 4. Sincronizar Banco de Dados (Prisma)
```bash
pnpm prisma db push
```

### 5. Iniciar a Aplicação
```bash
# Modo desenvolvimento
pnpm start:dev

# Modo produção
pnpm build
pnpm start:prod
```
A API estará acessível em `http://localhost:3333`.

---

## 📡 Principais Endpoints

- `GET /api/reviews`: Listar histórico de Pull Requests auditadas.
- `POST /api/reviews/analyze`: Iniciar auditoria completa de uma PR com comitê de IA.
- `GET /api/reviews/:id/stream`: Stream SSE de progresso e logs arquivo a arquivo.
- `GET /api/pending-items`: Listagem de pendências e débitos técnicos.
- `POST /api/pending-items/batch`: Cadastro em lote de novas pendências.
- `PATCH /api/pending-items/:id`: Edição de débitos técnicos.
- `GET /api/settings`: Consulta de credenciais salvas (valores mascarados).
- `POST /api/settings/test-connection`: Teste em tempo real de conectividade com Azure/GitHub.
