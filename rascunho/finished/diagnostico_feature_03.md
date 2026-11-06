# Diagnóstico e Plano de Implementação - Feature 03: Persistência de Markdown no Banco de Dados

## 1. Visão Geral e Cenário Atual

Atualmente, o serviço `ReviewsService` (`sograi-backend/src/modules/reviews/reviews.service.ts`) salva os relatórios em Markdown no disco:
```typescript
const baseName = `PR-${prUrlInfo.pullRequestId}_v${currentIteration}`;
fs.writeFileSync(path.join(this.resultsDir, `${baseName}_executivo.md`), execMarkdown, 'utf-8');
fs.writeFileSync(path.join(this.resultsDir, `${baseName}_spec_correcao.md`), specMarkdown, 'utf-8');
```

E para o endpoint `GET /api/reviews/:id/spec`, o backend reconstrói o Markdown sob demanda consultando a tabela `pull_requests` e `pr_file_reviews`.

### Problemas do Modelo Atual Baseado em Disco:
1. **Acúmulo de arquivos estáticos no repositório**: A pasta `sograi-backend/results/` cresce indefinidamente e polui o controle de versão com arquivos temporários.
2. **Perda de histórico entre instâncias/máquinas**: Se o usuário rodar em outra máquina ou container, os arquivos locais do disco não acompanham o banco de dados.
3. **Inconsistência de iterações**: O arquivo de spec reconstruído dinamicamente pode divergir do arquivo exato que foi gerado no momento da auditoria caso haja alterações posteriores.

---

## 2. Estratégia de Arquitetura no Banco de Dados

### 2.1. Onde e como salvar no PostgreSQL?

Existem duas abordagens possíveis:
- **Abordagem A (Colunas na própria tabela `pull_requests`)**:
  - Adicionar colunas `TEXT`:
    - `executive_markdown TEXT` (Relatório executivo Markdown gerado)
    - `spec_markdown TEXT` (Spec de correção técnica gerado)
    - `full_markdown TEXT` (Dossiê completo em Markdown)
  - **Prós**: Extremamente simples, leitura direta em 1 query junto com os dados da PR, sem necessidade de joins adicionais.
  - **Contras**: Se uma mesma PR tiver múltiplas iterações no futuro em registros separados, cada uma guarda o seu. No schema atual, o `pull_requests` atualiza por `ON CONFLICT (organization, project, repository, pull_request_id)`, guardando sempre o estado da iteração mais recente.

- **Abordagem B (Tabela dedicada de artefatos por iteração - `pr_reports_history`)**:
  - Criar uma tabela específica:
    ```sql
    CREATE TABLE IF NOT EXISTS pr_reports_history (
      id SERIAL PRIMARY KEY,
      pr_id INTEGER REFERENCES pull_requests(id) ON DELETE CASCADE,
      iteration INTEGER NOT NULL DEFAULT 1,
      report_type VARCHAR(50) NOT NULL, -- 'EXECUTIVE' | 'SPEC_CORRECAO' | 'FULL'
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ```
  - **Prós**: Preserva o histórico exato de todas as iterações (v1, v2, v3...) de uma PR, permitindo comparar como o Markdown evoluiu.
  - **Contras**: Requer uma tabela extra e consultas separadas.

### 2.2. Recomendação
A **Abordagem Híbrida**:
1. Adicionar as colunas `executive_markdown` e `spec_markdown` diretamente na tabela `pull_requests` para leitura instantânea e sem overhead nos endpoints e downloads do frontend.
2. Criar a migration `migration_markdown_storage.sql` que adiciona essas colunas com tipo `TEXT` e retrocompatibilidade com dados já existentes.
3. Descontinuar a escrita obrigatória em disco (`fs.writeFileSync`), tornando a pasta `results/` opcional ou apenas um fallback/debug desativável via flag.

---

## 3. Impactos no Backend e Frontend

### 3.1. Backend (`sograi-backend`)
1. **Migration SQL (`migration_markdown_storage.sql`)**:
   ```sql
   ALTER TABLE pull_requests 
   ADD COLUMN IF NOT EXISTS executive_markdown TEXT,
   ADD COLUMN IF NOT EXISTS spec_markdown TEXT,
   ADD COLUMN IF NOT EXISTS full_markdown TEXT;
   ```
2. **`DatabaseService` (`database.service.ts`)**:
   - Atualizar a query do `upsertPullRequest` para receber e persistir `executive_markdown`, `spec_markdown` e `full_markdown`.
   - No `getPullRequestDetails`, os textos já retornam diretamente no JSON.
3. **`ReviewsService` (`reviews.service.ts`)**:
   - Salvar o `execMarkdown` e `specMarkdown` diretamente no `upsertPullRequest`.
   - Ajustar o método `getSpecCorrecaoMarkdown(id)`: se a coluna `spec_markdown` já estiver preenchida no banco, retorna ela diretamente, sem recalcular; se estiver vazia (registros legados), recalcula via `reportGen.generateSpecCorrecao` como fallback.
4. **Endpoint de Download/Visualização**:
   - `GET /api/reviews/:id/spec`: retorna o conteúdo armazenado no banco com header `text/markdown`.
   - `GET /api/reviews/:id/executive-markdown`: novo endpoint para visualizar ou baixar o executivo em Markdown nativo.

### 3.2. Frontend (`sograi-frontend`)
- Nenhuma quebra! O frontend já consome a rota `/api/reviews/${id}/spec` para baixar o arquivo `.md`. Como a rota agora busca do PostgreSQL em milissegundos (sem ler disco local), a performance melhora e a compatibilidade é 100% mantida.

---

## 4. Dúvida do Usuário: PWA e Modelo Distribuído ("Cada um com seu banco e prompt")

### 4.1. Análise do Modelo Proposto
O usuário explicou:
> *"a ideia não é compartilhar o banco não, é só compartilhar a aplicação. Cada um vai ter seu banco e poderá ajustar o prompt para as suas necessidades."*

Esse é um caso clássico de **Software Local / Desktop Distribuído (Self-Hosted por Desenvolvedor)**.

### 4.2. Por que um PWA puro não resolve esse cenário?
- Um PWA é executado dentro da sandbox do navegador. Ele **não consegue rodar o servidor NestJS**, nem executar o container Docker do PostgreSQL, nem ler variáveis de ambiente locais com tokens do Azure DevOps.
- Se você enviar apenas a URL de um PWA para outro colega, o app abrirá no navegador dele, mas dará erro de conexão, pois o backend (`http://localhost:5001`) e o PostgreSQL não estarão rodando na máquina dele.

### 4.3. As Melhores Opções para Esse Modelo:
1. **Opção 1 - Pacote "One-Command" via Docker Compose / Template de Repositório [Mais Recomendada]**:
   - Criar um `docker-compose.yml` completo na raiz que sobe:
     - Container `postgres` (banco de dados individual pré-configurado).
     - Container `backend` (NestJS).
     - Container `frontend` (Vite/Nginx).
   - O colega apenas clona o repositório, cria seu arquivo `.env` com suas próprias chaves e roda `docker compose up -d`.
   - Ele terá tudo funcionando na máquina dele de forma 100% isolada, com seu próprio banco e liberdade total para editar prompts em `prompts.ts`.

2. **Opção 2 - Script Instalador Simples (`setup.sh`)**:
   - Um script bash que instala dependências, sobe o Postgres local e inicia frontend e backend em modo dev.

3. **Opção 3 - Electron / Tauri (App Executável Desktop .deb / .AppImage / .exe)**:
   - Empacota o frontend e um runtime Node.js em um arquivo executável que o desenvolvedor instala como um programa convencional. Contudo, ainda exigiria o PostgreSQL rodando (ou SQLite embutido).

---

## 5. Próximos Passos para Execução da Feature 03

1. **Criar a migration SQL** adicionando os campos de Markdown à tabela `pull_requests`.
2. **Atualizar `DatabaseService`** para persistir e recuperar esses textos.
3. **Atualizar `ReviewsService`** para salvar os relatórios diretamente no banco e eliminar a dependência estrita de gravação em disco.
4. **Verificar builds e regras de tamanho** (`< 350` linhas por arquivo).
