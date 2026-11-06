# Diagnóstico Técnico e Plano de Implementação: Ciclo de Ajustes 03

**Arquivo:** `rascunho/diagnostico_ajustes_03.md`  
**Data:** 04/11/2026  
**Contexto de Origem:** `rascunho/test_03.md`  
**Objetivo:** Refinar a experiência da tela de **Nova Revisão** (seleção sob demanda, modal de configuração da análise com opções de modo, ocultação da tabela durante execução) e restaurar a visão de **Parecer Completo** na tela de detalhe, expandindo a **Exportação de PDF** para contemplar o Parecer Completo integral com todos os arquivos e pareceres dos agentes.

---

## 1. Análise dos Itens Solicitados

### 1.1. Nova Revisão (Descoberta & Disparo)
1. **Não popular a tabela automaticamente ao entrar na página**:
   - *Estado atual:* O `useEffect` dispara a busca de PRs com `selectedRepo="all"` logo ao montar a tela.
   - *Comportamento desejado:* A página inicia **limpa**, apenas com o Select de repositórios exibindo um placeholder de instrução (ex: `"Selecione um repositório..."` ou a opção explícita `"⭐ Todos os Repositórios"`). A tabela só é carregada e exibida **após** o usuário escolher uma opção no select.
2. **Modal de Configuração de Análise ao clicar em 'Analisar' na tabela**:
   - Ao clicar em "Analisar" (ou "Reanalisar") em qualquer linha da tabela de PRs:
     - Abre um **Modal de Configuração de Análise** contendo:
       - Informações da PR (Título, PR #ID, Repositório e Autor).
       - Input de URL (já preenchido automaticamente e desabilitado ou editável).
       - **Seletor de Modo**: `Comitê Unificado (Completo)` ou `Por Agentes Específicos` (com os checkboxes dos agentes: Estilo, Segurança, Performance, Testes, Tech Lead).
       - Botão **"Confirmar e Iniciar Análise"**.
3. **Interface de "Colar URL avulsa" idêntica ao Modal**:
   - A opção de URL avulsa terá essa exata mesma estrutura (Input de URL + Modo de Análise + Seleção de Agentes). Assim, a experiência é unificada e previsível para o usuário.
4. **Ocultar toda a tabela durante o processamento**:
   - Quando a análise começa (`running === true`):
     - A tabela e os selects de repositório são **ocultados** temporariamente.
     - A tela foca 100% na **barra de progresso e no status dos agentes em tempo real**, tornando a UI limpa e sem distrações visuais.
     - Ao concluir (`done === true`), exibe o card de resultado com botão de ir para o detalhe e opção de voltar para nova análise.

---

### 1.2. Detalhe do Parecer (Parecer Completo & PDF Integral)
1. **Restaurar o Parecer Completo**:
   - Na lista de abas do parecer (`opinions`):
     - Adicionar a aba **"Parecer Completo"** (ao lado de Resumo Executivo e Acompanhamento).
     - Essa aba exibirá o relatório técnico integral contendo:
       - Síntese executiva.
       - Lista completa de todos os arquivos modificados.
       - Para cada arquivo: veredito, justificativa e todos os apontamentos detalhados (Estilo, Segurança, Performance, Testes e Tech Lead com sugestões de código).
2. **Exportação de PDF do Parecer Completo**:
   - O documento [`ReviewPdfDocument.tsx`](file:///home/nadiasantos/www/code-review/sograi-frontend/src/components/reviews/ReviewPdfDocument.tsx) passará a gerar o **Dossiê Completo de Auditoria Técnica**:
     - Cabeçalho corporativo com metadados da PR (Título, Autor, Repositório, Iteração, Risco, Tempo estimado).
     - Síntese da Mudança e Recomendação do Tech Lead.
     - Tabela/Cards com **todos os arquivos analisados**, seus vereditos individuais e os apontamentos com severidade (`BLOCKER`, `WARNING`, `SUGGESTION`), linha e notas técnicas.

---

## 2. Perguntas e Alinhamentos

Para calibrar o comportamento exato:

### Pergunta 1: Select de Repositório Inicial
Ao entrar na tela de Nova Revisão:
- **Opção A (Recomendada):** O select começa com `""` e exibe o placeholder `"Selecione um repositório para carregar as PRs..."`. Abaixo dele aparece a opção `"⭐ Todos os Repositórios (Buscar de todos)"` e a lista dos repositórios específicos. A tabela só renderiza quando o usuário clica em uma dessas opções.
- **Opção B:** Um botão explícito `"Buscar PRs"` ao lado do select.

### Pergunta 2: Modal vs Painel na Ação da Tabela
Ao clicar no botão "Analisar" da linha:
- **Opção A (Recomendada):** Abre um Modal moderno (usando o componente shadcn `Modal` já existente) com o título da PR, o seletor de Modo (Unificado vs Por Agente) e o botão "Iniciar Auditoria".
- **Opção B:** Em vez de modal, a tela desliza para um formulário superior pré-preenchido.

### Pergunta 3: Escopo do PDF
O PDF gerado deve conter:
- **Opção A (Recomendada):** Parecer Técnico Completo (Resumo Executivo + Todos os Arquivos com suas respectivas análises de segurança, estilo, performance e testes).
- **Opção B:** Permitir no botão escolher entre "Baixar PDF Executivo" ou "Baixar PDF Completo".

---

## 3. Plano de Ação Imediato

1. **Frontend - Modal de Configuração de Análise (`AnalysisConfigModal.tsx`)**:
   - Criar componente dedicado com o input da URL, opções de Modo (Unificado vs Agentes) e seleção de especialistas.
2. **Frontend - Refatoração do `NewAnalysis.tsx`**:
   - Inicializar `selectedRepo = ""` (não carrega PRs até o usuário escolher).
   - Ocultar a tabela quando `running === true`.
   - Reutilizar o mesmo fluxo de opções tanto para a ação da tabela quanto para "Colar URL avulsa".
3. **Frontend - Detalhe da PR (`DetailPage.tsx`) & Nova Aba `DetailFullReportView.tsx`**:
   - Adicionar a aba "Parecer Completo" com a listagem de todos os arquivos e relatórios detalhados.
4. **Frontend - PDF Completo (`ReviewPdfDocument.tsx`)**:
   - Atualizar o template para incluir a seção completa de arquivos, vereditos e notas de cada agente.
5. **Garantia de Regras**:
   - Manter 100% dos arquivos com menos de 350 linhas.
   - Compilação limpa do Vite e NestJS.
