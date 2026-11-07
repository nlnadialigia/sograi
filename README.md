# 👵 SogrAI

> *"Sempre pronta para achar um defeito naquilo que você fez com carinho."*

[![Swagger OpenAPI](https://img.shields.io/badge/Swagger-OpenAPI%203.0-85EA2D?style=flat&logo=swagger&logoColor=black)](http://localhost:3333/api/docs)
[![CI Status](https://img.shields.io/github/actions/workflow/status/nlnadialigia/sograi/ci.yml?branch=develop&label=CI&logo=github)](https://github.com/nlnadialigia/sograi/actions)
[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?style=flat&logo=nestjs&logoColor=white)](https://nestjs.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev)
[![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748?style=flat&logo=prisma&logoColor=white)](https://www.prisma.io)

**SogrAI** é uma plataforma inteligente e implacável para auditoria automatizada de Pull Requests no **Azure DevOps** e **GitHub**. Utilizando um comitê multi-agente alimentado por modelos de inteligência artificial de última geração (Google Gemini), a SogrAI avalia cada linha modificada sob a ótica de estilo de código, segurança, desempenho e testes, gerando pareceres técnicos e sínteses executivas acionáveis para o Tech Lead e para o time de engenharia.

---

## 🏛️ Estrutura do Monorepo

O projeto está organizado como um Monorepo unificado contendo o ecossistema completo:

```text
sograi/
├── sograi-backend/          # API RESTful NestJS, Prisma ORM e Orquestração de Agentes IA
│   ├── docs/                # Arquitetura detalhada de prompts e regras de negócio
│   └── prisma/              # Modelagem relacional e migrations do banco de dados
├── sograi-frontend/         # Aplicação Web React 19, Tailwind CSS v4 e Exportação PDF
├── docker-compose.yml       # Orquestração com PostgreSQL, Backend e Frontend Nginx
├── install.sh               # Script automatizado de instalação bare-metal
├── start.sh                 # Script para inicialização dos serviços em desenvolvimento
├── .env.example             # Template unificado de variáveis de ambiente
└── README.md                # Este documento
```

---

## ⚡ Como Executar a Aplicação

Você pode executar a **SogrAI** de duas formas simples:

### Opção A: Via Docker Compose (Recomendado para Produção e Testes Rápidos)

Com apenas um comando, o Docker Compose inicializa o banco PostgreSQL (v18), compila o backend NestJS e disponibiliza o frontend com proxy reverso Nginx na porta `3000`:

```bash
# 1. Copie e configure as variáveis de ambiente (especialmente GEMINI_API_KEY)
cp .env.example .env

# 2. Suba todos os containers em segundo plano
docker compose up -d --build
```

Acesse a interface no navegador: **`http://localhost:3000`**

---

### 🐳 Comandos Úteis do Docker

Aqui estão os comandos mais utilizados no dia a dia para gerenciar a aplicação via Docker:

| Ação | Comando |
| :--- | :--- |
| **Subir serviços em segundo plano** | `docker compose up -d` |
| **Reconstruir e subir imagens após alterações** | `docker compose up -d --build` |
| **Acompanhar logs de todos os containers** | `docker compose logs -f` |
| **Acompanhar logs de um serviço específico** | `docker compose logs -f backend` *(ou `frontend`, `postgres`)* |
| **Verificar status e saúde dos containers** | `docker compose ps` |
| **Parar todos os containers** | `docker compose stop` |
| **Derrubar containers mantendo os dados do banco** | `docker compose down` |
| **Derrubar containers apagando os volumes (reset do banco)** | `docker compose down -v` |
| **Acessar o terminal do container do backend** | `docker compose exec backend sh` |
| **Acessar o PostgreSQL via CLI (psql)** | `docker compose exec postgres psql -U sograi -d sograi_db` |
| **Rodar migrações/push do Prisma dentro do container** | `docker compose exec backend pnpm prisma db push` |

> [!TIP]
> Caso você já possua um PostgreSQL instalado nativamente no seu computador rodando na porta padrão `5432`, a porta mapeada pelo Docker para o banco está configurada para **`5433`** no host, evitando conflitos de porta (`address already in use`).

---

### Opção B: Via Script Automatizado (Bare-Metal com pnpm)

Se você prefere rodar localmente com Node.js e pnpm para desenvolvimento:

```bash
# 1. Execute o script instalador (ele valida pré-requisitos, instala pacotes e configura o banco)
./install.sh

# 2. Inicie os servidores simultaneamente
./start.sh
```

A aplicação estará disponível em:
- **Frontend Web:** `http://localhost:5173`
- **Backend API:** `http://localhost:3333`

---

## 🎯 Principais Recursos

1. **Comitê Multi-Agente de Code Review:**
   - 🎨 **Style & Clean Code:** Aderência a SOLID, DRY, complexidade ciclomática, boas práticas e aprovação determinística de migrações (`migration.sql`).
   - 🔒 **Segurança (AppSec):** Verificação de vulnerabilidades (OWASP), injeções e vazamento de segredos.
   - ⚡ **Desempenho:** Detecção de queries N+1, gargalos de memória e loops ineficientes.
   - 🧪 **Qualidade & Testes:** Avaliação de cobertura e cenários críticos de teste.
   - 👑 **Tech Lead Sintetizador:** Parecer executivo unificado com veredito, risco da PR e governança estrita de linhas (máx 500 no backend e 350 no frontend).

2. **Explorador Multi-VCS & Fila FIFO:**
   - Suporte nativo e simultâneo a **Azure DevOps** e **GitHub**.
   - Descoberta dinâmica de projetos, repositórios e PRs abertas.
   - **Fila de Execução Concorrente (FIFO):** Permite enfileirar múltiplas análises simultaneamente sem travar a interface.

3. **Acompanhamento em Tempo Real & Última Análise:**
   - Streaming de progresso via **Server-Sent Events (SSE)** direto no navegador.
   - Execução resiliente em segundo plano (Keep-Alive) que não bloqueia a navegação do usuário.
   - Tela dedicada **"Última Análise"** com progresso arquivo por arquivo e parecer técnico imediato.

4. **Gestão de Pendências Centrada no Arquivo:**
   - Painel reformulado focado no ciclo de vida de cada arquivo do repositório (com suporte a tipos: *Débito Técnico*, *Melhoria* e *Refatoração Futura*).
   - Menu flutuante de ações (`⋮`) com opções para marcar como resolvido (com notas de resolução), editar e excluir.
   - Resolução de pendências permitida tanto no painel quanto diretamente na aba de Rastreio do Detalhe do Parecer.

5. **Canal de Sugestões & Reporte de Bugs:**
   - Integração direta no cabeçalho com abertura instantânea de **Issues no GitHub** (tags `enhancement` e `bug`).

6. **Relatórios em PDF de Alta Resolução:**
   - Exportação profissional com diagramação espelhada à Web, ícones vetoriais nativos e blocos de código com destaque sintático.

7. **Pipeline CI/CD & Auditoria Automatizada:**
   - Validação contínua no GitHub Actions com Node 20, pnpm, testes do Prisma ORM, checagem automatizada de limites de linhas e builds de frontend e backend.

---

## 📚 Documentação Adicional

- [Documentação Detalhada do Backend](./sograi-backend/README.md)
- [Arquitetura dos Agentes e Critérios de Análise](./sograi-backend/docs/arquitetura_analise_prompts.md)
- [Guia Prático de Refinamento de Prompts](./sograi-backend/docs/guia_refinamento_prompts.md)
- [Documentação Detalhada do Frontend](./sograi-frontend/README.md)

---

## 📄 Licença

Distribuído sob a licença MIT. Consulte `LICENSE` para mais detalhes.
