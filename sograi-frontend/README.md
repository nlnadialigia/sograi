# 👵 SogrAI - Frontend Web Application

> Interface moderna, responsiva e dinâmica construída em **React 19**, **Tailwind CSS v4** e **Vite** para auditoria de Pull Requests, gestão de débitos técnicos e geração de relatórios de engenharia com inteligência artificial.

---

## 🎨 Funcionalidades da Interface

- **Dashboard de Pull Requests:** Listagem completa de PRs auditadas com filtros por repositório, autor, status e data.
- **Explorador Multi-VCS:** Conexão nativa com **Azure DevOps** e **GitHub**, permitindo selecionar projetos, repositórios e PRs abertas em tempo real.
- **Pipeline de Análise em Tempo Real:** Acompanhamento da auditoria arquivo por arquivo via **Server-Sent Events (SSE)**, com barra de progresso no Topbar e notificações de conclusão.
- **Parecer Técnico & Executivo:**
  - Visão Executiva com Veredito Geral e Nível de Risco.
  - Comitê de 5 Especialistas (Estilo, Segurança, Desempenho, Testes e Tech Lead).
  - Inspeção detalhada de arquivos com snippets de código, linhas destacadas e sugestões de correção.
- **Exportação de Relatórios em PDF:** Gerador de relatórios em PDF de alta qualidade com ícones SVG nativos, espelhando fielmente a interface Web.
- **Gestão de Pendências & Débitos Técnicos:** Painel dedicado para acompanhamento, edição, resolução e exclusão de débitos técnicos vinculados às PRs.
- **Central de Orientações:** Central interativa de documentação acessível diretamente no menu lateral com 5 guias detalhados.
- **Painel Administrativo:** Configuração de credenciais de VCS (PATs), modelo de IA e testes de conectividade em tempo real.

---

## 🚀 Tecnologias

- **Framework:** [React](https://react.dev/) v19 + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite](https://vitejs.dev/) v8
- **Estilização:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Ícones:** [Lucide React](https://lucide.dev/)
- **Geração de PDF:** `@react-pdf/renderer` com componentes vetoriais customizados
- **Notificações:** Sistema global de Toast com contexto nativo do React
- **Gerenciador de Pacotes:** `pnpm`

---

## 📁 Estrutura de Pastas

```text
sograi-frontend/
├── src/
│   ├── components/
│   │   ├── admin/             # Abas de configuração de provedores, IA e guias
│   │   ├── common/            # Badges, modais, botões e elementos compartilhados
│   │   ├── guides/            # Guias temáticos da Central de Orientações
│   │   ├── layout/            # Sidebar, Topbar e estrutura de páginas
│   │   ├── reviews/           # Tabela de PRs, explorador VCS, modais de análise e pendências
│   │   │   └── pdf/           # Componentes modulares de geração de relatório PDF
│   │   └── ui/                # Toast global, dialogs de alerta e modais acessíveis
│   ├── data/                  # Constantes e navegação
│   ├── services/              # Clientes de API REST do backend
│   ├── types/                 # Definições de tipos TypeScript compartilhados
│   ├── App.tsx                # Orquestrador de rotas e estado central
│   └── main.tsx               # Ponto de entrada com ToastProvider e montagem
├── package.json
└── vite.config.ts
```

---

## 🛠️ Configuração e Execução

### 1. Instalar Dependências
```bash
pnpm install
```

### 2. Configurar Variáveis de Ambiente (Opcional)
Por padrão, o frontend utiliza o proxy do Vite para encaminhar `/api` para `http://localhost:3333`. Se desejar configurar explicitamente:
```bash
cp .env.example .env
```

### 3. Iniciar o Servidor de Desenvolvimento
```bash
pnpm dev
```
Acesse a aplicação no navegador em `http://localhost:5173` (ou porta configurada pelo Vite).

### 4. Build de Produção
```bash
pnpm build
```
Os arquivos estáticos otimizados serão gerados no diretório `dist/`.
