# 👵 Guia Passo a Passo: SogrAI Fullstack (NestJS + React)

> *"Sempre pronta para achar um defeito naquilo que você fez com carinho."*

Este guia orienta a inicialização completa do ecossistema da **SogrAI**:
- **Backend**: NestJS (TypeScript) na porta `5001`
- **Frontend**: React 19 + Tailwind v4 + Vite na porta `5173`
- **Banco de Dados**: PostgreSQL 18 no Docker na porta `5433`

---

## 📋 Pré-requisitos Rápidos

1. **Chave Gemini (Google AI Studio)**:
   - Obtenha sua chave gratuita em [Google AI Studio](https://aistudio.google.com/).
2. **Token do Azure DevOps (PAT)**:
   - Crie um Personal Access Token com permissão **Code (Read)**.
3. **Docker & Node.js 22+**:
   - Container PostgreSQL ativo na porta 5433.

---

## 🚀 Passo 1: Garantir o PostgreSQL 18 Ativo

No terminal:

```bash
cd /home/nadiasantos/www/code-review/sograi-backend
docker compose up -d
```

Verifique se está rodando:
```bash
docker ps --filter name=code_review_postgres
```

---

## ⚙️ Passo 2: Iniciar o Backend NestJS

Em um terminal:

```bash
cd /home/nadiasantos/www/code-review/sograi-backend

# Rodar em modo de desenvolvimento (watch)
npm run start:dev
```

O backend subirá em: `http://localhost:5001`
- Conecta automaticamente ao PostgreSQL 18 (porta 5433).
- Endpoints REST disponíveis em `/api/reviews` e `/api/reviews/analyze`.

---

## 🎨 Passo 3: Iniciar o Frontend React (Vite)

Em outro terminal:

```bash
cd /home/nadiasantos/www/code-review/sograi-frontend

# Rodar o frontend
pnpm run dev
# ou
npx vite
```

Abra seu navegador em: **`http://localhost:5173`**

---

## 🔍 Como Usar a Nova Interface da SogrAI

1. **Tela de Boas-Vindas**:
   - Insira seu nome e e-mail corporativo.
2. **Aba "Nova Análise"**:
   - Cole a URL da PR do Azure DevOps (ex: `https://dev.azure.com/suzano/Chapter%20Devs/_git/ai-agent-api/pullrequest/85555`).
   - Escolha o modo (Unificado ou Separado) e clique em **Solicitar review**.
   - Acompanhe o progresso em tempo real.
   - Ao finalizar, o parecer executivo é exibido imediatamente com opção de inspecionar os detalhes e baixar o arquivo `.md`.
3. **Aba "Histórico no Banco"**:
   - Visualize todas as PRs salvas no PostgreSQL com métricas de aprovação, nível de risco e busca em tempo real.
   - Baixe relatórios Markdown diretamente pela tabela.
