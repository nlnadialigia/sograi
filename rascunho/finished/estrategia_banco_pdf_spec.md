# Estratégia de Transição: Persistência Estruturada no Banco, Exportação PDF e Spec de Implementação

**Data:** 04/11/2026  
**Local:** `rascunho/estrategia_banco_pdf_spec.md`  
**Objetivo:** Eliminar a dependência de parsing frágil de Markdown em texto puro, estruturar toda a auditoria em tabelas relacionais/JSONB no PostgreSQL, habilitar exportação profissional em PDF e gerar um artefato Markdown especializado: a **Spec de Correção/Implementação** para arquivos reprovados ou com ressalvas.

---

## 1. Diagnóstico do Estado Atual vs Estado Almejado

| Dimensão | Estado Atual (Legado/Frágil) | Novo Estado Estruturado |
| :--- | :--- | :--- |
| **Saída da LLM** | Texto Markdown livre com cabeçalhos (`### 🎨 Estilo...`) | **JSON Schema Estrito (`responseMimeType: "application/json"`)** |
| **Persistência** | Texto bruto salvo em coluna `executive_summary` e em arquivos `.md` no disco | Colunas tipadas + tabelas dedicadas (`pr_file_issues`, `pr_reviews`) |
| **Frontend** | Expressões regulares (`regex`) para extrair justificativas e listas | Leitura direta de campos tipados da API (Zero Regex no frontend) |
| **Exportação PDF** | Inexistente (apenas download de `.md`) | Endpoint de PDF estilizado (HTML para PDF via Puppeteer/PDFKit ou visualizador nativo) |
| **Artefato Markdown** | Relatório completo de log de análise | **Spec Técnica de Correção (Action Plan / Prompt para IDE)** direcionada para quem vai corrigir o código |

---

## 2. Nova Arquitetura de Dados no PostgreSQL

### 2.1. Ajuste no Esquema Relacional

```sql
-- 1. Tabela Principal de Pull Requests (Metadados e Síntese Executiva)
ALTER TABLE pull_requests 
  ADD COLUMN IF NOT EXISTS time_to_fix VARCHAR(50),             -- Ex: "30 minutos", "2 horas"
  ADD COLUMN IF NOT EXISTS executive_verdict VARCHAR(50),       -- "APROVADA", "ATENCAO", "REPROVADA"
  ADD COLUMN IF NOT EXISTS change_summary TEXT,                 -- Síntese da mudança em texto claro
  ADD COLUMN IF NOT EXISTS recommendation TEXT;                 -- Recomendação direta para o aprovador

-- 2. Tabela de Análise por Arquivo (Veredito por Arquivo)
ALTER TABLE pr_file_reviews
  ADD COLUMN IF NOT EXISTS change_type VARCHAR(50),             -- "add", "edit", "delete"
  ADD COLUMN IF NOT EXISTS justification TEXT,                  -- Justificativa do Tech Lead para o arquivo
  ADD COLUMN IF NOT EXISTS raw_analysis JSONB;                  -- Payload JSON completo retornado pela IA

-- 3. Nova Tabela Normalizada de Apontamentos (Issues Estruturadas)
CREATE TABLE IF NOT EXISTS pr_file_issues (
  id SERIAL PRIMARY KEY,
  file_review_id INTEGER REFERENCES pr_file_reviews(id) ON DELETE CASCADE,
  agent_category VARCHAR(50) NOT NULL,                         -- "SECURITY", "PERFORMANCE", "STYLE", "TESTS"
  severity VARCHAR(20) NOT NULL,                               -- "BLOCKER", "WARNING", "SUGGESTION", "INFO"
  title VARCHAR(255) NOT NULL,                                 -- Resumo curto da falha/ponto
  description TEXT NOT NULL,                                   -- Detalhamento técnico
  line_reference VARCHAR(100),                                 -- Ex: "L45-L60"
  suggested_code TEXT,                                         -- Trecho de código sugerido para correção
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_issues_file_review ON pr_file_issues(file_review_id);
CREATE INDEX IF NOT EXISTS idx_issues_severity ON pr_file_issues(severity);
```

---

## 3. Estruturação do Output da LLM (JSON Schema)

Em vez de solicitar Markdown e usar regex, o prompt do Gemini utilizará **estruturação em JSON Schema**:

```typescript
export interface FileAnalysisSchema {
  verdict: 'APROVADO' | 'REPROVADO';
  justification: string;
  issues: {
    category: 'STYLE' | 'SECURITY' | 'PERFORMANCE' | 'TESTS';
    severity: 'BLOCKER' | 'WARNING' | 'SUGGESTION';
    title: string;
    description: string;
    suggestedCode?: string;
  }[];
}

export interface ExecutiveSummarySchema {
  decision: 'APROVADA' | 'APROVADA COM RESSALVAS' | 'REPROVADA';
  riskLevel: 'Baixo' | 'Médio' | 'Alto' | 'Crítico';
  estimatedTimeToFix: string;
  changeSummary: string;
  recommendation: string;
  blockers: { filePath: string; issue: string; resolution: string }[];
  technicalDebts: { filePath: string; issue: string; recommendation: string }[];
}
```

**Vantagens Imediatas:**
- Impossível quebrar o layout da interface por erro de formatação de Markdown.
- Gravação direta nas tabelas sem perda de dados.
- Filtros na tela por severidade (`BLOCKER`, `WARNING`, etc.) instantâneos.

---

## 4. O Novo Artefato: Spec de Implementação / Correção (`spec_correcao.md`)

O arquivo Markdown não será mais um relatório redundante da tela, mas sim um **manual de ação imediata (Spec de Correção)** focado exclusivamente no que foi reprovado ou recebeu ressalvas.

### Propósito da Spec:
- Ser entregue diretamente ao autor da PR ou colado em uma IDE com IA (Cursor, Antigravity, Copilot) para correção rápida.

### Estrutura Padrão da Spec:
```markdown
# 🛠️ Spec de Correção & Implementação - PR #{pr_id}
> Gerado pela SogrAI em {data} | Veredito: {verdict} | Risco: {risk}

## 🎯 Objetivo
Resolver os {total_blockers} bloqueadores críticos e {total_warnings} pontos de atenção identificados na auditoria.

---

## 📂 Arquivos com Pendências

### 1. `{filePath}` ({verdict})
- **Justificativa**: {justification}

#### 🛑 [BLOCKER] {title}
- **Problema**: {description}
- **Linha/Trecho**: `{line_reference}`
- **Correção Recomendada**:
```typescript
// Código sugerido pronto para aplicação
```

#### ⚠️ [WARNING] {title}
- **Problema**: {description}
- **Correção Recomendada**:
```typescript
// Código sugerido
```

---

## ✅ Checklist de Validação Pré-Merge
- [ ] Aplicar correção de segurança no arquivo X
- [ ] Refatorar loop N+1 no arquivo Y
- [ ] Executar testes de regressão: `pnpm test`
```

---

## 5. Exportação em PDF

### Abordagem Técnica Recomendada:
1. **Endpoint no Backend**: `GET /api/reviews/:id/export/pdf`
2. **Motor de Geração**:
   - Opção A (Recomendada): **Puppeteer / Playwright** gerando PDF a partir de um template HTML corporativo com Tailwind embutido, cabeçalho e rodapé elegantes.
   - Opção B: **PDFKit / @react-pdf/renderer** para geração nativa leve sem browser headless.
3. **No Frontend**: Botão *"Exportar PDF"* no dropdown de ações da tabela e na página de detalhes.

---

## 6. Plano de Execução em Fases

1. **Fase 1 (Banco de Dados & Backend - Atualização do Schema):**
   - Criar script de migração para as novas colunas e tabela `pr_file_issues`.
   - Ajustar o `DatabaseService` com métodos de inserção e consulta estruturada.
2. **Fase 2 (Prompts Estruturados em JSON):**
   - Configurar o Gemini para retornar JSON validado por interface.
   - Alimentar as novas tabelas a cada análise.
3. **Fase 3 (Gerador da Spec de Implementação Markdown):**
   - Endpoint e serviço gerador de `spec-{pr_id}.md` filtrando apenas arquivos com pendências.
4. **Fase 4 (Exportação PDF):**
   - Implementar template de impressão executiva e endpoint de download de PDF.
5. **Fase 5 (Frontend):**
   - Conectar o detalhe do parecer para consumir a estrutura tipada e adicionar as ações de exportação (PDF e Spec Markdown).
