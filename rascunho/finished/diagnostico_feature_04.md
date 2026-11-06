# Diagnóstico Técnico - Feature 04: Análise de Viabilidade de ORM e Escolha da Melhor Solução

## 1. Contexto e Motivação

Atualmente, o backend (`sograi-backend`) utiliza o driver nativo `pg` (Node Postgres via pool de conexões) com queries SQL manuais em string em dois arquivos:
- `DatabaseService` (`sograi-backend/src/modules/database/database.service.ts` - 342 linhas)
- `PendingItemsRepository` (`sograi-backend/src/modules/database/pending-items.repository.ts` - 98 linhas)

O usuário trouxe uma questão estratégica fundamental:
> *"Analisando o código me dei conta que você não está utilizando nenhum ORM para o backendo de dados. Eu costumo utilizar o prisma, mas não sei se é a melhor opção para essa aplicação. Analise a viabilidade de adicionar um ORM para a aplicação e qual seria a melhor opção. Mantenha em mente que vamos aplicar o Empacotamento sugerido."*

Este diagnóstico avalia a viabilidade, compara as opções do ecossistema Node.js / TypeScript / NestJS e projeta o impacto direto no **Empacotamento (distribuição simplificada para outros desenvolvedores)** e na **regra estrita de menos de 350 linhas por arquivo**.

---

## 2. Cenário Atual vs. Necessidades do Empacotamento

### 2.1. Como está hoje (Driver `pg` puro)
- **Pontos Positivos**:
  - Zero dependência pesada de compilação ou engines binárias.
  - Performance máxima e controle total de queries complexas (ex: `json_agg`, `json_build_object`, UPSERT `ON CONFLICT DO UPDATE`).
  - Imagem Docker minúscula e inicialização instantânea.
- **Pontos Negativos**:
  - Migrations manuais: cada alteração de schema exige rodar scripts SQL avulsos (`migration_tracking.sql`, `migration_manual_pending.sql`, `migration_markdown_storage.sql`).
  - Sem tipagem estrita gerada automaticamente a partir do banco (risco de erros de digitação em nomes de colunas como `filePath` vs `file_path`).
  - Dificuldade para novos desenvolvedores: quando um colega clonar a aplicação, ele precisará rodar 4 scripts SQL manuais na ordem correta, ou um `init.sql` que precisa ser mantido atualizado à mão.

### 2.2. O que o Empacotamento exige?
Quando a aplicação for empacotada (seja via `docker-compose.yml`, script `setup.sh` ou container local):
1. **Migrations automáticas no startup**: O desenvolvedor roda um comando e o banco se auto-atualiza para a versão mais recente.
2. **Setup "Zero Friction"**: Ninguém quer ter que abrir terminal psql e rodar queries na mão.
3. **Leveza e Portabilidade**: Rodar em Linux, Mac (Apple Silicon M1/M2/M3/M4) e Windows sem falhas de compilação de binários nativos.

---

## 3. Comparativo de ORMs para o Projeto SogrAI

| Critério | **Prisma ORM** | **Drizzle ORM** | **TypeORM** | **Kysely** (Query Builder com Types) |
| :--- | :--- | :--- | :--- | :--- |
| **Ergonomia & Produtividade** | ⭐⭐⭐⭐⭐ (DX excelente, schema único) | ⭐⭐⭐⭐ (TypeScript puro) | ⭐⭐⭐ (Decorators pesados, verboso) | ⭐⭐⭐⭐ (SQL puro tipado) |
| **Migrations Automáticas** | ⭐⭐⭐⭐⭐ (`prisma migrate deploy`) | ⭐⭐⭐⭐ (`drizzle-kit migrate`) | ⭐⭐⭐ (Instável com NestJS) | ⭐⭐⭐ (Manual) |
| **Integração com NestJS** | ⭐⭐⭐⭐ (PrismaService simples) | ⭐⭐⭐⭐ (Injeção de dependência fácil) | ⭐⭐⭐⭐⭐ (Módulo oficial `@nestjs/typeorm`) | ⭐⭐⭐ (Custom) |
| **Complexidade no Docker / Empacotamento** | ⚠️ Requer Rust Query Engine (binário nativo). Pode ser chato em cross-compilation (ex: Mac ARM vs Linux x86). | ⭐⭐⭐⭐⭐ Zero binários externos, JavaScript/TypeScript puro e minúsculo. | ⭐⭐⭐⭐ Sem engine binária externa. | ⭐⭐⭐⭐⭐ Levíssimo. |
| **Tamanho da Imagem / Dependências** | ~80MB adicionais de engine | < 5MB adicionais | ~15MB adicionais | < 2MB adicionais |
| **Suporte a queries complexas (`json_agg`, UPSERT)** | ⚠️ Médio (UPSERT do Prisma é limitado para conflitos compostos; requer `prisma.$queryRaw` para `json_agg`). | ⭐⭐⭐⭐⭐ Nativo para PostgreSQL (upsert avançado, `onConflictDoUpdate`). | ⚠️ Propenso a bugs em upsert composto. | ⭐⭐⭐⭐⭐ Excelente. |
| **Conhecimento Prévio do Usuário** | ⭐⭐⭐⭐⭐ **O usuário já domina Prisma!** | ⚠️ Nova curva de aprendizado | ⚠️ Curva média | ⚠️ Nova curva de aprendizado |

---

## 4. Análise Aprofundada: Prisma vs. Drizzle para o SogrAI

### 4.1. Opção 1: Prisma ORM (A Opção Familiar)
Como você já costuma utilizar o **Prisma**, ele traz uma grande vantagem: **velocidade de adoção e confiança da sua parte**.
- **Vantagens**:
  - `schema.prisma` centraliza todo o modelo de dados (PullRequest, FileReview, FileIssue, AgentReview, TrackingItem, ManualPendingItem).
  - O comando `prisma migrate deploy` roda automaticamente na subida do container ou no script de setup, criando todas as tabelas sem que o outro desenvolvedor precise tocar no PostgreSQL.
  - Prisma Studio (`npx prisma studio`) embutido: o usuário pode visualizar e editar os dados do banco numa interface web visual linda durante o desenvolvimento.
- **Atenção aos Detalhes no SogrAI**:
  - No `getPullRequestDetails`, hoje usamos `json_agg` do Postgres para trazer a PR com seus 40 arquivos e todos os issues aninhados em 1 única query ultra-rápida.
  - Com Prisma, isso vira um `prisma.pullRequest.findUnique({ include: { files: { include: { issues: true } } } })`, o que é muito mais legível e limpo no código TypeScript!
  - O único cuidado com o Prisma é o tamanho do binário do Prisma Client no build Docker, que é facilmente resolvido fixando a flag `binaryTargets = ["native", "linux-musl-openssl-3.0.x", "debian-openssl-3.0.x"]`.

### 4.2. Opção 2: Drizzle ORM (A Opção Mais Leve e Rápida)
Se o foco fosse estritamente máxima leveza e zero dependência de binários compilados (Rust Engine):
- **Vantagens**: Drizzle não usa binários nativos, é puro TypeScript e compila instantaneamente. Suporta todas as peculiaridades do PostgreSQL com perfeição.
- **Desvantagem**: Você precisaria aprender a sintaxe do Drizzle e a estrutura de schemas TypeScript em vez da sintaxe declarativa do `schema.prisma`.

---

## 5. Veredito e Recomendação Técnica

### A Melhor Opção: **Prisma ORM**
A recomendação técnica para o seu caso é **adotar o Prisma ORM**, pelos seguintes motivos:
1. **Domínio e Conforto do Desenvolvedor**: Você já tem familiaridade com o Prisma. Introduzir outro ORM (como Drizzle ou TypeORM) traria atrito desnecessário e custos de manutenção futuros.
2. **Empacotamento Perfeito**: No empacotamento (`docker-compose.yml` ou `setup.sh`), o comando `npx prisma migrate deploy` resolve 100% da criação e atualização do banco de dados na máquina de qualquer colega sem intervenção manual.
3. **Redução Drástica de Linhas de Código**:
   - O `DatabaseService` atual possui 342 linhas de SQL concatenado em strings.
   - Com o Prisma, métodos como `recordOrUpdateTrackingItem`, `upsertPullRequest`, `getAllPullRequests` e `findByPr` ficam com 5 a 10 linhas cada, reduzindo o arquivo para menos de 180 linhas e garantindo conformidade com a regra de < 350 linhas.
4. **IntelliSense e Tipagem Fiel**: Qualquer alteração em coluna no `schema.prisma` gera automaticamente os tipos no TypeScript, evitando incompatibilidades como `filePath` vs `file_path`.

---

## 6. Plano de Migração Gradual e Segura (Zero Quebra)

Para migrar para o Prisma sem arriscar os dados já existentes:
1. **Etapa 1 - Modelagem do `schema.prisma`**:
   - Usar `prisma db pull` para fazer introspecção do banco PostgreSQL 18 já existente, gerando o `schema.prisma` fiel às tabelas atuais (`pull_requests`, `pr_file_reviews`, `pr_file_issues`, `pr_tracking_items`, `pr_manual_pending_items`).
2. **Etapa 2 - Criação do `PrismaService`**:
   - Criar `sograi-backend/src/modules/database/prisma.service.ts` com gerenciamento de ciclo de vida (`$connect`, `$disconnect`).
3. **Etapa 3 - Refatoração dos Repositórios**:
   - Refatorar `PendingItemsRepository` para usar `prisma.manualPendingItem`.
   - Refatorar `DatabaseService` para delegar para o `PrismaService`.
4. **Etapa 4 - Baseline de Migrations**:
   - Gerar a baseline de migration com `prisma migrate diff` para que novas instalações usem `npx prisma migrate deploy`.
5. **Etapa 5 - Validação de Linhas & Build**:
   - Auditar contagem de linhas (< 350 linhas).
   - Validar build limpo (`nest build` e `vite build`).

---

## 7. Perguntas para Alinhamento com Você

Antes de iniciarmos a implementação, gostaria de confirmar com você:

1. **Aprovação do Prisma**: Concorda em avançarmos com o **Prisma ORM**, aproveitando sua familiaridade com a ferramenta e a facilidade do `prisma migrate` para o futuro empacotamento?
2. **Manutenção dos Dados Locais**: Você deseja que façamos o `prisma db pull` para preservar exatamente o histórico das PRs que já foram analisadas no seu container PostgreSQL local?
3. **Prisma Studio**: Gostaria que adicionássemos um script no `package.json` (`npm run db:studio`) para facilitar a inspeção visual do banco de dados?
