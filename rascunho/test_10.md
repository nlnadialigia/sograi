# Diagnóstico Técnico - Teste 10: Ajustes de Usabilidade, UI e Componentes

## 1. Contexto e Motivação

Durante os testes da aplicação após a entrega das features de administração e orientações, foram levantadas oportunidades de melhoria de usabilidade e refinamento de interface descritas em [`rascunho/test_10.md`](file:///home/nlnadialigia/www/code-review/rascunho/test_10.md):

1. **Painel de Administração**:
   - Duplicidade de título: o cabeçalho global ([`Topbar.tsx`](file:///home/nlnadialigia/www/code-review/sograi-frontend/src/components/layout/Topbar.tsx)) já exibe o título da página e subtítulo, tornando redundante o `<h2>` e o botão "Voltar" dentro de [`AdminPage.tsx`](file:///home/nlnadialigia/www/code-review/sograi-frontend/src/components/admin/AdminPage.tsx).
2. **Nova Revisão**:
   - Ao concluir a auditoria, exibir um card com os dados da PR informando que a análise foi finalizada com sucesso e um botão/link direto para **Ver Detalhe do Parecer**.
3. **Tabela de PR's (Ativas / Arquivadas)**:
   - Quando há apenas 1 registro na tabela, o dropdown do menu "Ações" (`...`) sofre corte ou gera scrollbar vertical. Necessário garantir altura mínima de pelo menos 2 linhas preenchidas (`min-h-[220px]`).
   - No modal [`AddPendingModal.tsx`](file:///home/nlnadialigia/www/code-review/sograi-frontend/src/components/reviews/AddPendingModal.tsx), o campo de arquivo deve ser um `<select>` com os arquivos auditados da PR em vez de input textual.
4. **Gestão de Pendências**:
   - Inserir botão de **"+ Adicionar Pendência"** no topo da página de pendências ([`PendingPage.tsx`](file:///home/nlnadialigia/www/code-review/sograi-frontend/src/components/reviews/PendingPage.tsx)), contendo um `<select>` com as PRs ativas (não arquivadas) cadastradas e carregamento automático dos arquivos.
   - Ajustar a badge de **Prioridade** para usar o mesmo padrão estético e contraste da badge de **Risco** ([`Badges.tsx`](file:///home/nlnadialigia/www/code-review/sograi-frontend/src/components/common/Badges.tsx)).
   - Adicionar botão de **Editar** pendência abrindo modal de edição.
   - Substituir `window.prompt` e `window.confirm` pelo componente `AlertDialog` (padrão shadcn) com suporte a input opcional de notas na resolução.
5. **Geral - Sistema de Toast**:
   - Criar componente de notificação **Toast** moderno e elegante (estilo shadcn/sonner) para mensagens de sucesso, erro e alertas.

---

## 2. Decisões Confirmadas

1. **Alimentação do Select de PR em Pendências**:
   - Listar apenas as **PR's ativas (não arquivadas)** cadastradas no sistema. Ao selecionar uma PR, carregar automaticamente os arquivos auditados dela para o select de arquivos.
2. **Alert Dialog de Resolução de Pendência**:
   - O diálogo modal do shadcn exibirá a confirmação acompanhada de um campo de texto opcional para anotação da **"Nota de resolução"** antes de registrar a baixa.
3. **Persistência de Edição no Backend**:
   - Adicionar o endpoint `PATCH /api/pending-items/:id` e método `update()` no repositório Prisma para salvar alterações de título, descrição, arquivo e prioridade.

---

## 3. Arquitetura da Solução e Plano de Implementação

### 3.1. Backend (`sograi-backend`)
- Em [`pending-items.repository.ts`](file:///home/nlnadialigia/www/code-review/sograi-backend/src/modules/database/pending-items.repository.ts):
  - Adicionar o método `update(id: number, data: Partial<CreatePendingItemDto>)`.
- Em [`pending-items.controller.ts`](file:///home/nlnadialigia/www/code-review/sograi-backend/src/modules/reviews/pending-items.controller.ts):
  - Adicionar rota `@Patch(':id')` chamando `this.pendingRepo.update(id, dto)`.

### 3.2. Frontend (`sograi-frontend`)
1. **Componente de Toast (`Toast.tsx` / `toast-context.tsx`)**:
   - Criar contexto global de Toasts leves com animações suaves, ícones de status (`CheckCircle2`, `AlertCircle`, `Info`), fechamento automático (4s) e botão dispensar.
2. **Painel Admin (`AdminPage.tsx`)**:
   - Remover botão voltar e título duplicado do topo, mantendo layout limpo e direto nas abas com botão salvar.
3. **Card de Conclusão na Nova Revisão (`AnalysisResultCard.tsx` / `NewAnalysis.tsx`)**:
   - Adicionar card de destaque de conclusão com resumo da PR (PR#, repositório, autor, arquivos auditados, veredito e risco) e botão proeminente com link **"Ver Detalhe do Parecer"**.
4. **Tabela de PRs (`ReviewsTable.tsx`)**:
   - Ajustar altura mínima do container da tabela para `min-h-[220px]` para eliminar barra de rolagem ao abrir menu de ações em tabelas de 1 linha.
5. **Modal de Pendências (`AddPendingModal.tsx` & `EditPendingModal.tsx`)**:
   - Converter campo de arquivo para `<select>` estilizado com opções dos arquivos da PR.
   - Suporte a seleção de PR quando aberto a partir da página de pendências.
   - Criar modal de edição de pendência existente.
6. **Gestão de Pendências (`PendingPage.tsx`)**:
   - Inserir botão "+ Nova Pendência" no topo.
   - Adicionar `PriorityBadge` em [`Badges.tsx`](file:///home/nlnadialigia/www/code-review/sograi-frontend/src/components/common/Badges.tsx).
   - Inserir botão de editar (ícone lápis) ao lado da exclusão.
   - Integrar `AlertDialog` para exclusão e diálogo customizado para resolução com notas opcionais.

---

## 4. Conformidade Arquitetural
- **Limite de Linhas**: Rigorosamente abaixo de **350 linhas** por arquivo.
- **Gerenciador**: **pnpm**.
- **Linguagem**: **Português (pt-br)**.
