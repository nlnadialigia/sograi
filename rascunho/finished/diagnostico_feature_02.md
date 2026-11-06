# Diagnóstico e Estudo de Arquitetura: Gestão de Pendências e Débitos Técnicos (Feature 02)

**Arquivo:** `rascunho/diagnostico_feature_02.md`  
**Data:** 04/11/2026  
**Contexto de Origem:** `rascunho/feature_02.md`  
**Objetivo:** Permitir ao Tech Lead/Aprovador cadastrar **pendências manuais** (anotações e débitos técnicos para melhorias futuras) diretamente nas ações da listagem ou por arquivo no detalhamento do parecer, com acompanhamento centralizado no menu e inclusão na Spec de Correção para o desenvolvedor.

---

## 1. O Problema e a Oportunidade

### Cenário Real de Code Review:
Muitas vezes, uma Pull Request atende ao objetivo principal da entrega e **pode (ou deve) ser aprovada para não bloquear o deploy/sprint**, mas o Tech Lead nota:
1. Oportunidades de refatoração futura (ex: *"Migrar este método para o padrão Factory na próxima sprint"*).
2. Débitos técnicos aceitos conscientemente (ex: *"Adicionar teste de carga neste endpoint"*).
3. Ajustes de legibilidade ou documentação secundários.

Se essas anotações ficarem soltas em comentários do chat ou esquecidas, o débito técnico se acumula. O objetivo da feature é dar **rastreabilidade, governança e praticidade** a essas pendências.

---

## 2. Pontos de Entrada Propostos (UI / UX)

### 2.1. Ponto 1: Nas Ações da Tabela de PRs (Listagem Principal)
No dropdown de ações de cada linha (`...`):
- [x] Ver Parecer
- [x] Arquivar / Desarquivar
- [x] Excluir
- [x] **➕ Adicionar Pendência / Débito Técnico**:
  - Abre um modal rápido onde o Tech Lead pode selecionar a PR (já vinculada), indicar opcionalmente um arquivo ou deixar como "Pendência Geral da PR", definir a severidade/tipo e salvar.

### 2.2. Ponto 2: No Detalhe do Parecer (Por Arquivo)
Em cada arquivo do parecer (tanto no Resumo Executivo quanto no Parecer Completo):
- Ao lado do veredito do arquivo, adicionar um botão de ação rápida: **`+ Nota / Pendência`**.
- O modal já abre com o nome do arquivo preenchido (`filePath`).
- Permite registrar a nota com título, descrição e sugestão de melhoria.

### 2.3. Ponto 3: Nova Seção no Menu Lateral ("Pendências & Débitos")
No menu lateral (`Sidebar`), adicionar uma nova página:
- 📌 **Pendências** (com badge indicando a quantidade de itens pendentes ativos):
  - Tabela com filtros por: Repositório, Status (`Pendente`, `Resolvido`, `Postergar`), Severidade (`Débito Técnico`, `Sugestão Futura`, `Must Fix`).
  - Ações em lote ou individuais: marcar como concluído, exportar relatório de débitos da equipe ou gerar Spec Markdown.

### 2.4. Ponto 4: Integração com a Spec de Correção (.md)
Ao clicar em "Baixar Spec de Correção (.md)", as pendências manuais cadastradas pelo Tech Lead são **automaticamente incluídas** em uma seção especial:
```markdown
## 📝 Anotações & Débitos Técnicos do Tech Lead (Melhorias Futuras)
- **`src/services/billing.service.ts`**: Refatorar cálculo de descontos para padrão Strategy.
```

---

## 3. Modelo de Dados no Banco (PostgreSQL)

Já possuímos a tabela `pr_tracking_items`. Podemos expandi-la ou criar uma tabela dedicada:

### Abordagem Recomendada: Tabela `pr_manual_pending_items` (ou extensão de `pr_tracking_items`)

```sql
CREATE TABLE IF NOT EXISTS pr_manual_pending_items (
  id SERIAL PRIMARY KEY,
  pull_request_id VARCHAR(50) NOT NULL,
  repository VARCHAR(100) NOT NULL,
  organization VARCHAR(100) DEFAULT 'suzano',
  project VARCHAR(100) DEFAULT 'Chapter Devs',
  file_path TEXT,                           -- Pode ser nulo (pendência geral da PR) ou caminho do arquivo
  title VARCHAR(255) NOT NULL,              -- Ex: "Extrair lógica de autenticação para middleware"
  description TEXT NOT NULL,                -- Detalhes técnicos e instrução
  item_type VARCHAR(50) DEFAULT 'TECH_DEBT',-- 'TECH_DEBT', 'IMPROVEMENT', 'FUTURE_REFACTOR', 'SECURITY_NOTE'
  priority VARCHAR(20) DEFAULT 'MEDIUM',    -- 'LOW', 'MEDIUM', 'HIGH'
  author_email VARCHAR(150),                -- Quem criou a anotação (Tech Lead logado)
  status VARCHAR(50) DEFAULT 'PENDING',     -- 'PENDING', 'RESOLVED', 'WONT_FIX'
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_manual_pending_pr ON pr_manual_pending_items(repository, pull_request_id);
CREATE INDEX IF NOT EXISTS idx_manual_pending_status ON pr_manual_pending_items(status);
```

---

## 4. Perguntas para Alinhamento e Decisão

Para formatar a feature exatamente como você precisa:

### Pergunta 1: Escopo das Pendências
As pendências manuais podem ser:
- **Opção A (Recomendada):** Tanto a nível de **Arquivo Específico** (ex: `/src/auth.ts`) quanto a nível **Geral da PR** (ex: *"Configurar pipeline de smoke test na próxima entrega"*).
- **Opção B:** Apenas vinculadas obrigatoriamente a um arquivo modificado da PR.

### Pergunta 2: Nova Seção no Menu Lateral
No menu lateral (`Sidebar`), deseja uma nova rota/página dedicada (ex: `📌 Pendências` ou `Débitos Técnicos`) onde é possível visualizar a lista consolidada de todas as pendências de todos os repositórios?
- **Opção A (Recomendada):** Sim, adicionar a página "Pendências" no menu lateral, permitindo filtrar por repositório e marcar itens como resolvidos.
- **Opção B:** Não precisa de página no menu, exibir as pendências apenas dentro de cada PR.

### Pergunta 3: Status das Pendências
Quando o desenvolvedor corrigir o ponto no futuro:
- **Opção A (Recomendada):** O Tech Lead pode entrar na tela de pendências e clicar em um botão `[Marcar como Resolvido]` com opção de adicionar uma nota de encerramento.
- **Opção B:** As pendências são apenas notas estáticas informativas.

---

## 5. Próximos Passos
Aguardar as respostas para criar a migration SQL, os endpoints no backend e os componentes no frontend.
