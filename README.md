# 👵 SogrAI

> *"Sempre pronta para achar um defeito naquilo que você fez com carinho."*

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

Com apenas um comando, o Docker Compose inicializa o banco PostgreSQL, compila o backend NestJS e disponibiliza o frontend com proxy reverso Nginx na porta `3000`:

```bash
# 1. Copie e configure as variáveis de ambiente
cp .env.example .env

# 2. Suba todos os containers
docker compose up -d --build
```

Acesse a interface no navegador: **`http://localhost:3000`**

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
   - 🎨 **Style & Clean Code:** Aderência a SOLID, DRY, complexidade ciclomática e boas práticas.
   - 🔒 **Segurança (AppSec):** Verificação de vulnerabilidades (OWASP), injeções e vazamento de segredos.
   - ⚡ **Desempenho:** Detecção de queries N+1, gargalos de memória e loops ineficientes.
   - 🧪 **Qualidade & Testes:** Avaliação de cobertura e cenários críticos de teste.
   - 👑 **Tech Lead Sintetizador:** Parecer executivo unificado com veredito e risco da PR.

2. **Explorador Multi-VCS:**
   - Suporte nativo e simultâneo a **Azure DevOps** e **GitHub**.
   - Descoberta dinâmica de projetos, repositórios e PRs abertas.

3. **Acompanhamento em Tempo Real:**
   - Streaming de progresso via **Server-Sent Events (SSE)** direto no navegador.
   - Execução resiliente em segundo plano (Keep-Alive) que não bloqueia a navegação do usuário.

4. **Gestão Integrada de Débitos Técnicos:**
   - Painel para cadastrar, editar e acompanhar pendências manuais e débitos técnicos vinculados às PRs auditadas.

5. **Relatórios em PDF de Alta Resolução:**
   - Exportação profissional com diagramação espelhada à Web, ícones vetoriais nativos e blocos de código com destaque sintático.

---

## 📚 Documentação Adicional

- [Documentação Detalhada do Backend](./sograi-backend/README.md)
- [Arquitetura dos Agentes e Critérios de Análise](./sograi-backend/docs/arquitetura_analise_prompts.md)
- [Guia Prático de Refinamento de Prompts](./sograi-backend/docs/guia_refinamento_prompts.md)
- [Documentação Detalhada do Frontend](./sograi-frontend/README.md)

---

## 📄 Licença

Distribuído sob a licença MIT. Consulte `LICENSE` para mais detalhes.
