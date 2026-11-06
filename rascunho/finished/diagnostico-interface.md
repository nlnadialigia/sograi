# 🎨 Diagnóstico e Propostas de Interface (UI) para o Code Review

Este documento apresenta um estudo de viabilidade, casos de uso e opções arquiteturais para criar uma interface visual (UI) moderna, prática e eficiente para o projeto `local-code-review`.

---

## 1. O Problema Atual vs. O Que a Interface Deve Resolver

Atualmente o fluxo funciona via CLI e gera arquivos Markdown em `results/`. Embora eficiente para desenvolvedores, surgem oportunidades onde uma interface agrega muito valor:

1. **Facilidade de Acionamento**: Em vez de abrir o terminal e digitar comandos longos com parâmetros, apenas colar a URL da PR e clicar em "Revisar".
2. **Visualização Interativa de Código (Side-by-Side Diff)**: Ver o trecho original com as sugestões dos agentes destacadas diretamente na linha (estilo GitHub/Azure DevOps).
3. **Histórico e Métricas Visuais**:
   - Quantas PRs foram aprovadas/reprovadas na semana.
   - Quais arquivos ou repositórios costumam ter mais vulnerabilidades de segurança ou problemas de performance.
   - Quais agentes mais pegam falhas (`Security` vs `Performance` vs `Style`).
4. **Filtros e Busca**: Buscar rapidamente por PR ID, autor ou status sem precisar abrir arquivos `.md` individuais.

---

## 2. Três Abordagens de Interface

Apresentamos 3 modelos de interface distintos, avaliados por esforço de desenvolvimento, facilidade de manutenção e experiência do usuário:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        COMPARAÇÃO DE ABORDAGENS                        │
├─────────────────┬─────────────────────┬─────────────────┬──────────────┤
│ Abordagem       │ Stack               │ Tempo de Setup  │ Experiência  │
├─────────────────┼─────────────────────┼─────────────────┼──────────────┤
│ 1. Streamlit    │ Python Puro         │ ~1 a 2 horas    │ Dashboard    │
│ 2. Web App Full │ FastAPI + React/Vite│ ~1 a 2 dias     │ App Completa │
│ 3. Terminal TUI │ Textual (Python)    │ ~3 a 4 horas    │ Hacker / CLI │
└─────────────────┴─────────────────────┴─────────────────┴──────────────┘
```

---

### Opção 1: Dashboard Rápido com **Streamlit** ⭐ *(Recomendado para início)*

O Streamlit permite criar uma interface web completa diretamente em **Python**, sem precisar escrever HTML, CSS ou JavaScript.

- **Como funciona**:
  - Uma única página web local (ex: `localhost:8501`).
  - Campo no topo: input para colar a URL da PR com botão *"Analisar com IA"*.
  - Exibição de progresso em tempo real (spinner/barra de progresso indicando qual agente está rodando).
  - Aba de **Resultados Recentes**: visualização do Markdown renderizado com abas para cada agente.
  - Aba de **Métricas Históricas**: gráficos automáticos (Plotly/Altair) conectados diretamente ao PostgreSQL (taxa de aprovação, arquivos mais problemáticos, tempo médio de review).
- **Vantagens**:
  - Implementação imediata no mesmo ecossistema Python já configurado.
  - Conexão nativa com psycopg2 / pandas para ler os dados do Docker PostgreSQL.
  - Zero dependências de Node.js/npm.
- **Desvantagens**:
  - Customização de componentes visuais avançados (como um editor de diff interativo muito complexo) é mais limitada que React.

---

### Opção 2: Aplicação Web Moderna (**FastAPI + React / Tailwind / Vite**)

Uma aplicação web com separação clara de Backend e Frontend.

- **Como funciona**:
  - **Backend (FastAPI)**: Expõe endpoints REST (`POST /api/review`, `GET /api/history`, `GET /api/prs/{id}`).
  - **Frontend (React + Tailwind CSS + Lucide Icons)**:
    - Tela de submissão estilo "Paste & Go".
    - Visualizador de código com highlight sintático e badges flutuantes para os agentes.
    - Comparador de diff visual lado a lado (side-by-side diff viewer).
    - Dashboard de métricas executivas para o time.
- **Vantagens**:
  - Máxima flexibilidade estética e de UX.
  - Permite transformar a ferramenta em um serviço compartilhado para o time todo da empresa no futuro.
- **Desvantagens**:
  - Maior complexidade de setup (Node.js, build, roteamento e gerenciamento de estado).

---

### Opção 3: Terminal UI Rica (**Textual / Python TUI**)

Uma interface interativa de terminal (estilo `htop`, `lazygit` ou `k9s`), construída com a biblioteca **Textual**.

- **Como funciona**:
  - Roda direto no terminal com janelas, menus navegáveis por teclado/mouse, abas e cores vibrantes.
  - Não abre navegador web.
- **Vantagens**:
  - Não sai do fluxo de terminal do desenvolvedor.
  - Extremamente leve e rápida.
- **Desvantagens**:
  - Menos intuitiva para gráficos estatísticos complexos e visualização de diffs muito extensos.

---

## 3. Estrutura de Telas Sugerida (Wireframe Conceitual)

Independentemente da stack escolhida, a melhor estrutura funcional para o projeto é composta por **3 seções principais**:

### Tela 1: O "Reviewer Workspace" (Ação Imediata)
```text
+----------------------------------------------------------------------------+
|  🚀 LOCAL AI CODE REVIEW                                                   |
+----------------------------------------------------------------------------+
|  URL da PR: [ https://dev.azure.com/suzano/Chapter Devs/... ]  [ Revisar ] |
|  Opções: [x] Incluir Testes (QA)   Provedor: (o) Gemini  ( ) Ollama        |
+----------------------------------------------------------------------------+
|  Status: 🟢 Analisando 'src/service.py' com TechLeadAgent... (3/5 arquivos)|
+----------------------------------------------------------------------------+
|  [ Veredito Geral: 🔴 REPROVADA ]  Tempo: 12.4s                            |
|                                                                            |
|  Arquivos:                                                                 |
|  > src/auth/jwt.py          | 120 linhas | ❌ Reprovado                    |
|    - [🔒 Security]     Risco de injeção no cabeçalho na linha 42...        |
|    - [⚡ Performance]  Loop desnecessário na validação de claims...        |
|  > src/models/user.py       | 45 linhas  | ✅ Aprovado                     |
+----------------------------------------------------------------------------+
```

### Tela 2: O "History & Analytics" (Histórico & Inteligência)
```text
+----------------------------------------------------------------------------+
|  📊 HISTÓRICO & MÉTRICAS                                                   |
+----------------------------------------------------------------------------+
|  [ Total PRs: 48 ]    [ Aprovadas: 34 (71%) ]    [ Tempo Médio: 15s ]      |
+----------------------------------------------------------------------------+
|  Tabela de PRs Recentes:                                                   |
|  #PR     | Repositório   | Autor     | Status    | Data       | Ações      |
|  85555   | ai-agent-api  | Nadia     | Reprovado | 03/11 16:30| [Ver Detalhes]
|  85420   | auth-service  | Carlos    | Aprovado  | 02/11 11:15| [Ver Detalhes]
+----------------------------------------------------------------------------+
```

---

## 4. Recomendação Prática

A nossa recomendação é começar com a **Opção 1 (Streamlit)**:
1. **Reaproveitamento Total**: Usa o mesmo código que acabamos de escrever (`review_pr.py`, workflows e banco) sem refatorações.
2. **Entrega em poucas horas**: Cria uma interface visual profissional com input, abas, renderizador de Markdown e gráficos do PostgreSQL.
3. **Evolução Natural**: Se no futuro você quiser compartilhar com a equipe inteira na nuvem, pode empacotar como um container ou migrar para FastAPI + React.
