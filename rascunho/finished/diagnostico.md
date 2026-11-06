# Diagnóstico e Arquitetura: Revisor de PR Local

Este documento consolida os requisitos validados, a comparação de LLMs (incluindo opções gratuitas), o desenho do fluxo automatizado via URL da PR, a persistência em PostgreSQL via Docker e propostas de melhoria para os agentes.

---

## 1. Requisitos Definidos

1. **Plataforma**: Azure DevOps.
2. **Entrada do usuário**: Apenas a **URL da Pull Request** (ex: `https://dev.azure.com/{org}/{project}/_git/{repo}/pullrequest/{pr_id}`).
3. **Execução**:
   - Parse da URL (extrai Organização, Projeto, Repositório e PR ID).
   - Conexão ao Azure DevOps via API/PAT para obter metadados (branch de origem, branch de destino, autor, arquivos modificados e diffs).
   - Execução dos agentes de IA em cada arquivo / diff alterado.
4. **Armazenamento de Resultados**:
   - **Arquivos Markdown**: Salvos na pasta [results!](file:///home/nadiasantos/www/code-review/results) (ex: `results/PR-{id}-{timestamp}.md`).
   - **Banco de Dados Relacional**: Persistência estruturada em **PostgreSQL rodando em container Docker** (substituindo o BigQuery original da nuvem), permitindo consultas históricas, dashboards e evolução futura do projeto.
5. **Agentes**: Manutenção dos 4 agentes originais (`StyleAgent`, `SecurityAgent`, `PerformanceAgent`, `TechLeadAgent`), com suporte a novas adições.

---

## 2. Comparativo de Provedores de LLM e Custos

| Provedor / Modelo | Custo / Nível Gratuito | Qualidade para Code Review | Requisitos de Hardware / Setup | Recomendação |
| :--- | :--- | :--- | :--- | :--- |
| **Google Gemini API** (`gemini-1.5-flash` / `gemini-2.0-flash`) | **Gratuito** (Free Tier generoso: até 15 RPM e 1 milhão TPM). Pay-as-you-go muito acessível (~$0.075 / 1M tokens de entrada caso exceda). | **Excelente** (Janela de contexto gigante de 1M+ tokens, processa arquivos extensos e diffs completos sem truncar). | Apenas chave `GEMINI_API_KEY` (gratuita no Google AI Studio). | ⭐ **Altamente Recomendado (Melhor opção custo zero)** |
| **Modelos Locais via Ollama** (ex: `qwen2.5-coder:7b` ou `14b`, `deepseek-coder`) | **100% Gratuito e Ilimitado** (Open Source, privacidade absoluta sem tráfego externo). | **Muito Boa** (Qwen 2.5 Coder e DeepSeek Coder têm alta precisão técnica). | Requer GPU dedicada (8GB+ VRAM para modelos 7B/8B) ou CPU rápida com 16GB+ RAM. | ⭐ **Excelente se desejar 100% offline e sem envio de código para nuvem** |
| **Groq Cloud API** (Llama 3.3 70B, Qwen 2.5 32B) | **Gratuito no tier inicial** (com limites de requisições por minuto/dia). | **Excelente** (Llama 3.3 70B apresenta ótimo raciocínio e detecção de falhas). | Chave de API gratuita no console da Groq. Altíssima velocidade. | **Boa alternativa free para modelos open-source em nuvem** |
| **OpenAI / Azure OpenAI** (`gpt-4o-mini`, `gpt-4o`) | **Pago** (Sem tier gratuito perpétuo; `gpt-4o-mini` custa ~$0.15 / 1M input tokens). | **Excelente** (Base atual do projeto original). | Conta Azure / OpenAI com cartão ativo. | Recomendado se houver obrigatoriedade de usar tenant corporativo da Azure. |

---

## 3. Persistência em PostgreSQL (Docker)

Para substituir o BigQuery do projeto original por uma base local flexível e expansível:

### A. Docker Compose (`docker-compose.yml`)
Subirá um container PostgreSQL leve e persistente com volume local:
```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: code_review_postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
      POSTGRES_DB: ${POSTGRES_DB:-code_review}
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

### B. Modelo Relacional Proposto
Substitui as tabelas `pr_events` e `agent_reviews` do BigQuery:
- **`pull_requests`**:
  - `id` (PK), `pull_request_id`, `repository`, `project`, `author`, `source_branch`, `target_branch`, `status`, `decision` (approved / rejected), `created_at`, `duration_seconds`.
- **`pr_file_reviews`**:
  - `id` (PK), `pr_id` (FK), `file_path`, `lines_count`, `size_bytes`, `decision`.
- **`agent_reviews`**:
  - `id` (PK), `pr_file_id` (FK), `agent_name`, `issues_count`, `issues_json`, `recommendations`, `created_at`.

*(O salvamento no banco será desacoplado: se o container estiver rodando, os dados são inseridos; se estiver desligado, o relatório em Markdown continua sendo gerado normalmente sem travar a execução).*

---

## 4. Fluxo Completo de Execução

```
                    [ Usuário passa a URL da PR ]
                                   │
                                   ▼
                 [ Parser da URL do Azure DevOps ]
             (Extrai Org, Projeto, Repositório e PR ID)
                                   │
                                   ▼
                  [ Azure DevOps Client / REST API ]
          (Obtém metadados da PR, arquivos alterados e diffs)
                                   │
                                   ▼
                   [ Orquestrador de Agentes ]
   ┌─────────────────┬─────────────────┬─────────────────┐
   ▼                 ▼                 ▼                 ▼
[ StyleAgent ] [ SecurityAgent ] [ PerformanceAgent ] [ TechLeadAgent ]
   └─────────────────┴─────────────────┴─────────────────┘
                                   │
                                   ▼
             ┌─────────────────────┴─────────────────────┐
             ▼                                           ▼
[ Relatório Markdown ]                       [ Persistência PostgreSQL ]
Salvo em: results/PR-{id}_{data}.md          Container Docker (porta 5432)
Exibição de resumo no terminal                Histórico para dashboards/evoluções
```

---

## 5. Sugestões de Evolução dos Agentes

1. **`TestCoverageAgent`**:
   - Identifica se funções ou regras de negócio novas foram adicionadas sem testes unitários na mesma PR e sugere casos de teste.
2. **`BreakingChangeAgent`**:
   - Analisa contratos de APIs, DTOs, schemas ou assinaturas de métodos para alertar sobre quebra de compatibilidade.
3. **Análise de Contexto Focado (Diff Hunks)**:
   - Focar a análise nas linhas que de fato foram modificadas e seu entorno imediato, evitando ruído e alucinações sobre código legado não tocado.
4. **Sugestões com Bloco de Substituição (`git diff`)**:
   - Sempre que o agente indicar uma melhoria, fornecer o trecho exato de código sugerido pronto para aplicação.

---

## 6. Próximos Passos de Implementação

1. **Infraestrutura**:
   - Criar o `docker-compose.yml` para o PostgreSQL.
   - Criar script de inicialização do schema SQL (tabelas de PRs, arquivos e análises).
2. **Integração de IA**:
   - Configurar cliente para o Google Gemini API (ou Ollama/Azure conforme `.env`).
3. **Core Local**:
   - Implementar o parser de URL do Azure DevOps.
   - Implementar o runner local que consome a API do DevOps, roda os agentes, salva o Markdown em `results/` e grava no PostgreSQL.
