# Estratégia de Ciclo de Vida: Re-análise de PR, Tabela de Acompanhamento (Tracking) e Validação de Correções

**Data:** 04/11/2026  
**Local:** `rascunho/estrategia_reanalise_e_tracking.md`  
**Objetivo:** Definir a estratégia para re-análise da mesma Pull Request (re-submissão após correções), tabela de acompanhamento de débitos e validação automatizada de se os arquivos reprovados ou com ressalva foram de fato corrigidos.

---

## 1. O Dilema: "Sobrescrever" vs "Histórico com Versionamento"

### Pergunta Central:
> *"Validar se o ID da Pull Request é o mesmo e sobrescrever. Não é uma boa ideia?"*

### Análise de Prós e Contras:
- **Sobrescrever diretamente (UPDATE destruindo o anterior):**
  - *Pró:* Não polui a tabela com linhas duplicadas da mesma PR.
  - *Contra:* **Perde a comprovação de que o desenvolvedor realmente corrigiu o que a SogrAI apontou**. Não dá para responder: *"Quais eram os bloqueadores no commit anterior e o que mudou agora?"*.
- **A Solução Ideal (UPSERT com Ciclo de Vida / Iterações):**
  - **Na Tabela Principal (`pull_requests`):** O registro da PR é único por Repositório + PR ID. Quando a mesma PR é reanalisada:
    - O status, risco, síntese e total de arquivos são **atualizados para o estado mais recente**.
    - Incrementa-se a coluna `iteration` (ex: Iteração 1 ➔ Iteração 2).
    - O aprovador enxerga a PR sempre no seu **estado atual**, sem duplicação na tabela.
  - **No Histórico de Correções:** O sistema sabe exatamente o que existia na Iteração 1 e compara com a Iteração 2.

---

## 2. A Nova Tabela de Acompanhamento (`pr_tracking_items`)

Esta tabela é o coração do acompanhamento contínuo de qualidade. Ela registra **cada arquivo que foi reprovado ou teve ressalva**.

### Esquema Relacional no PostgreSQL:

```sql
CREATE TABLE IF NOT EXISTS pr_tracking_items (
  id SERIAL PRIMARY KEY,
  pull_request_id VARCHAR(50) NOT NULL,     -- Ex: "85555"
  repository VARCHAR(100) NOT NULL,         -- Ex: "ai-agent-api"
  file_path TEXT NOT NULL,                  -- Ex: "/src/auth/jwt.service.ts"
  
  -- Origem da pendência
  first_identified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  initial_decision VARCHAR(50) NOT NULL,    -- "REPROVADO" ou "ATENCAO"
  initial_issue_title VARCHAR(255) NOT NULL,
  initial_issue_description TEXT NOT NULL,
  
  -- Estado do Acompanhamento
  current_status VARCHAR(50) DEFAULT 'PENDING', 
  -- Possíveis status:
  -- 'PENDING': Ainda não foi corrigido
  -- 'RESOLVED': Detectado como corrigido na nova iteração
  -- 'WAIVED': Ignorado com justificativa pelo Tech Lead
  -- 'REGRESSED': Teve nova regressão
  
  resolved_at TIMESTAMP,
  resolution_notes TEXT,
  last_iteration_checked INT DEFAULT 1,
  
  CONSTRAINT uk_pr_file UNIQUE(repository, pull_request_id, file_path)
);

CREATE INDEX IF NOT EXISTS idx_tracking_pr ON pr_tracking_items(repository, pull_request_id);
CREATE INDEX IF NOT EXISTS idx_tracking_status ON pr_tracking_items(current_status);
```

---

## 3. O Fluxo de Validação de Correção (Re-análise Inteligente)

Quando o usuário clica em *Iniciar Análise* para uma PR que já foi analisada anteriormente:

```
[Usuário submete PR #85555]
          │
          ▼
[O Backend detecta que PR #85555 já existe no banco]
          │
          ├─► 1. Busca itens PENDING em `pr_tracking_items` para esta PR
          │
          ▼
[Execução dos Agentes nos arquivos modificados]
          │
          ▼
[Comparador de Correções (Auditoria de Resolução)]
  │
  ├── Se o arquivo constava como REPROVADO/RESSALVA:
  │     ├── O novo diff resolveu o problema apontado anteriormente?
  │     │     ├─ SIM: Marca item como 'RESOLVED' com data e nota
  │     │     └─ NÃO: Mantém 'PENDING' e alerta o aprovador: "Bloqueador reincidente!"
  │     │
  │     └── O desenvolvedor introduziu novo erro?
  │           └─ Adiciona nova pendência
  │
  ▼
[Atualização no Banco]
  ├── `pull_requests`: Atualiza métricas, veredito e incrementa iteration
  ├── Atualiza `pr_tracking_items` (Itens resolvidos vs pendentes)
  │
  ▼
[Geração dos Artefatos]
  ├── Relatório PDF atualizado
  └── Nova Spec Markdown contendo APENAS o que ainda restou pendente!
```

---

## 4. Benefícios Práticos para o Aprovador e Desenvolvedor

1. **Sem Duplicidade:**
   A lista de *PR's Ativas* continua limpa, contendo uma única linha por Pull Request, exibindo uma badge discreta: `Iteração 2` (ou `Re-análise`).
2. **Destaque Visual de Resolução:**
   Na página de detalhes, o aprovador verá uma aba especial:
   - 🟢 **Pendências Resolvidas (2):** Mostra que a falha de JWT e o loop N+1 foram corrigidos.
   - 🔴 **Pendências Restantes (0):** Tudo limpo para o merge!
3. **Spec Markdown Dinâmica:**
   Se a PR tinha 4 arquivos reprovados e o dev corrigiu 3, a nova Spec gerada terá apenas o 1 arquivo restante.
4. **Governança Total:**
   O histórico de quando o problema nasceu e quando foi resolvido fica registrado para sempre no banco de dados.
