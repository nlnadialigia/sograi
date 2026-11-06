# Diagnóstico Técnico - Feature 06: Central de Orientações no Menu de Navegação

## 1. Contexto e Motivação

Com as recentes expansões do **SogrAI** (Multi-Projeto, Multi-Repositório, Integração GitHub, Painel Admin, Comitê Multi-Agentes de IA, Gestão de Pendências Técnicas e Exportação de Relatórios em PDF), a plataforma agregou diversas capacidades robustas.

Atualmente:
- O menu de navegação lateral ([`Sidebar.tsx`](file:///home/nlnadialigia/www/code-review/sograi-frontend/src/components/layout/Sidebar.tsx)) possui os links: **Nova Análise**, **PR's Ativas**, **Pendências** e **PR's Arquivadas**.
- Há uma aba de orientações no Painel de Administração ([`GuidesTab.tsx`](file:///home/nlnadialigia/www/code-review/sograi-frontend/src/components/admin/GuidesTab.tsx)), focada na geração de tokens (PAT Azure e GitHub) e critérios gerais de reprovação.
- Há a necessidade de uma área dedicada, visível e de fácil acesso diretamente no **Menu de Navegação Principal**, explicando de forma abrangente, visual e amigável **todas as funcionalidades da aplicação** para os desenvolvedores e revisores.

---

## 2. Decisões de Alinhamento Confirmadas

1. **Formato da Interface**:
   - Página dedicada com **abas temáticas interativas** no topo ou lateral para facilitar a exploração:
     - **Visão Geral e Fluxo**: ciclo de vida da PR, papéis e conceitos da ferramenta.
     - **Como Fazer Análises**: uso do Explorer (Azure DevOps & GitHub), busca digitada de repositórios, colagem de URL direta e execução em segundo plano.
     - **Comitê de IA (5 Agentes)**: atribuições, regras e critérios de cada especialista (TechLead, Segurança, Performance, Testes e Estilo).
     - **Gestão de Pendências**: como funciona a reanálise incremental, tracking automático e apontamento manual de débito técnico.
     - **Relatórios & PDF**: estrutura do Parecer Técnico, Relatório Executivo, Especificação e exportação de PDF vetorizado.

2. **Separação de Escopo**:
   - Os guias técnicos de geração de PAT (Azure DevOps e GitHub) permanecem no **Painel de Configurações (Admin)**.
   - A nova página de **Orientações** foca exclusivamente no uso prático das funcionalidades da plataforma pelo desenvolvedor e revisor.

3. **Posicionamento no Menu Lateral**:
   - O novo item será exibido na lista principal de navegação, logo após **PR's Arquivadas**, com rótulo **"Orientações"** e ícone `BookOpen`.

---

## 3. Arquitetura da Solução

### 3.1. Tipos e Navegação
- Expandir o tipo `Page` em [`sograi-frontend/src/types/index.ts`](file:///home/nlnadialigia/www/code-review/sograi-frontend/src/types/index.ts):
  ```typescript
  export type Page = "new" | "history" | "pending" | "archived" | "detail" | "admin" | "guides"
  ```
- Atualizar a lista `navItems` em [`sograi-frontend/src/data/constants.ts`](file:///home/nlnadialigia/www/code-review/sograi-frontend/src/data/constants.ts):
  ```typescript
  export const navItems = [
    { id: "new", label: "Nova Análise", icon: "PlusCircle" },
    { id: "history", label: "PR's Ativas", icon: "Clock" },
    { id: "pending", label: "Pendências", icon: "BookmarkCheck" },
    { id: "archived", label: "PR's Arquivadas", icon: "Archive" },
    { id: "guides", label: "Orientações", icon: "BookOpen" },
  ] as const
  ```
- No [`Sidebar.tsx`](file:///home/nlnadialigia/www/code-review/sograi-frontend/src/components/layout/Sidebar.tsx), mapear o ícone `BookOpen` quando `item.id === "guides"`.

### 3.2. Componentes da Nova Central de Orientações (`sograi-frontend/src/components/guides/`)
Para garantir a modularidade e respeitar o limite rigoroso de 350 linhas por arquivo:
1. [`GuidesPage.tsx`](file:///home/nlnadialigia/www/code-review/sograi-frontend/src/components/guides/GuidesPage.tsx) (~150 linhas):
   - Cabeçalho com título, descrição amigável e seletor das 5 abas temáticas.
   - Renderização dinâmica do conteúdo da aba selecionada.
2. [`OverviewGuideTab.tsx`](file:///home/nlnadialigia/www/code-review/sograi-frontend/src/components/guides/OverviewGuideTab.tsx) (~180 linhas):
   - Apresentação visual da SogrAI, fluxo ponta a ponta desde a criação da PR até a aprovação, papéis e conceitos centrais.
3. [`AnalysisGuideTab.tsx`](file:///home/nlnadialigia/www/code-review/sograi-frontend/src/components/guides/AnalysisGuideTab.tsx) (~200 linhas):
   - Passo a passo para iniciar análise: seleção de provedor (Azure vs GitHub), busca de repositório, seleção de PR aberta, colagem de URL direta e execução em segundo plano com indicador no cabeçalho.
4. [`AgentsGuideTab.tsx`](file:///home/nlnadialigia/www/code-review/sograi-frontend/src/components/guides/AgentsGuideTab.tsx) (~240 linhas):
   - Detalhamento de cada um dos 5 Agentes Especialistas:
     - **Tech Lead**: Arquitetura, governança, decisões finais e vereditos.
     - **Segurança**: OWASP, injeções, vazamento de credenciais, sanitização.
     - **Performance**: Complexidade algorítmica, N+1 queries, consumo de memória.
     - **Cobertura de Testes**: Casos de borda, testes unitários e de integração.
     - **Estilo de Código**: Clean Code, padrões de nomenclatura, legibilidade e manutenibilidade.
5. [`PendingGuideTab.tsx`](file:///home/nlnadialigia/www/code-review/sograi-frontend/src/components/guides/PendingGuideTab.tsx) (~190 linhas):
   - Gestão de Débito Técnico: como cadastrar pendências manuais, como o tracking automático detecta correções ou regressões em reanálises e fluxo de resolução.
6. [`ReportsGuideTab.tsx`](file:///home/nlnadialigia/www/code-review/sograi-frontend/src/components/guides/ReportsGuideTab.tsx) (~190 linhas):
   - Como interpretar o Parecer Técnico Completo, Relatório Executivo, Especificação Técnica em Markdown e exportação de PDF de alta fidelidade visual.

### 3.3. Integração no `App.tsx`
- Em [`App.tsx`](file:///home/nlnadialigia/www/code-review/sograi-frontend/src/App.tsx), renderizar `<GuidesPage />` quando `page === "guides"`.

---

## 4. Conformidade Arquitetural
- **Limite de Linhas**: Cada componente modular mantido estritamente abaixo de **350 linhas**.
- **Gerenciador de Pacotes**: Exclusivamente **pnpm**.
- **Linguagem**: 100% em **Português (pt-br)**.
