# Guia de Arquitetura da Análise de Code Review (SogrAI)

Este documento detalha o funcionamento interno de cada etapa do processo de análise realizado pela **SogrAI**, os agentes especialistas envolvidos, as regras e padrões de decisão adotados, os critérios que levam à **Aprovação**, **Aprovação com Ressalvas (Atenção)** ou **Reprovação**, e como as saídas são estruturadas.

Este guia serve como base conceitual e técnica para a refatoração e personalização dos prompts do sistema.

---

## 1. Visão Geral do Pipeline de Análise

O processo de revisão é executado em duas fases principais:

```
[PR no Azure DevOps]
        │
        ▼
[1. Coleta do Diff de Arquivos]
        │
        ▼
[2. Auditoria por Arquivo (Comitê dos 5 Especialistas)]
  ├── 🎨 Style & Clean Code
  ├── 🔒 Segurança (AppSec / OWASP)
  ├── ⚡ Desempenho & Otimização
  ├── 🧪 Qualidade & Cobertura de Testes
  └── 👑 Veredito do Tech Lead por Arquivo
        │
        ▼
[3. Síntese Executiva (Tech Lead Consolidador)]
  ├── Decisão Global da PR (Aprovada | Atenção | Reprovada)
  ├── Nível de Risco (Baixo | Médio | Alto | Crítico)
  ├── Bloqueadores Críticos (Must Fix)
  ├── Débitos Técnicos & Sugestões (Nice to Fix)
  └── Recomendação Direta para o Aprovador
```

---

## 2. Especialistas e Critérios de Análise por Arquivo

Para cada arquivo modificado no Pull Request, a SogrAI avalia o código sob 5 prismas distintos:

### 2.1. 🎨 Estilo & Boas Práticas (StyleAgent / Clean Code)

- **Foco:** Legibilidade, clareza, convenções e manutenção a longo prazo.
- **Padrões Inspecionados:**
  - **SOLID:** Princípio de Responsabilidade Única (SRP), coesão de classes e módulos (_God Classes_, _God Modules_).
  - **DRY (Don't Repeat Yourself):** Duplicação de lógica de negócio ou blocos de código copiados.
  - **Complexidade Ciclomática:** Métodos extensos, excesso de blocos aninhados (`if/else`, loops profundos).
  - **Tipagem no TypeScript:** Uso indiscriminado de `any`, falta de contratos de interface ou DTOs explícitos.
  - **Poluição:** Código comentado, código morto, logs esquecidos (`console.log`) e imports desordenados.
- **Impacto no Veredito:** Geralmente gera **Pontos de Atenção (Nice to Fix)**. Só motiva reprovação se a degradação de manutenibilidade for severa (ex: módulo gigante com acoplamento circular).

---

### 2.2. 🔒 Segurança (SecurityAgent / AppSec)

- **Foco:** Vulnerabilidades conhecidas, vazamento de credenciais e conformidade com OWASP Top 10.
- **Padrões Inspecionados:**
  - **Hardcoded Secrets:** Chaves de API, senhas, tokens de JWT com fallback estático, strings de conexão em código aberto.
  - **Injeções:** Interpolação crua de strings em queries SQL/NoSQL, injeção de comandos de sistema ou execução dinâmica (`eval`).
  - **Cross-Site Scripting (XSS) & Sanitização:** Falta de escape ou validação em payloads de entrada.
  - **Controle de Acesso & Autorização:** Rotas ou métodos sensíveis sem decoradores de autenticação (`@UseGuards`, `@Roles`).
  - **Exposição de Dados em Logs:** Impressão de dados sensíveis (PII, tokens, senhas) em logs de erro ou auditoria.
- **Impacto no Veredito:** Qualquer falha média ou alta gera **REPROVAÇÃO IMEDIATA (Bloqueador Crítico)**.

---

### 2.3. ⚡ Desempenho & Otimização (PerformanceAgent)

- **Foco:** Uso eficiente de recursos (CPU, memória, I/O e banco de dados).
- **Padrões Inspecionados:**
  - **Problema de N+1 Queries:** Consultas a banco ou requisições HTTP dentro de laços de repetição (`for`, `map`, `forEach`).
  - **Concorrência e Assincronismo:** Falta de paralelização onde caberia `Promise.all()`, ou bloqueio síncrono de thread de evento (Node.js event loop).
  - **Complexidade Algorítmica:** Algoritmos $O(N^2)$ ou $O(N \times M)$ em coleções que poderiam usar `Map` ou `Set` para busca em $O(1)$.
  - **Memory Leaks:** Conexões abertas não finalizadas, acúmulo de listeners ou buffers não descartados.
- **Impacto no Veredito:** Se comprometer a escalabilidade de produção (ex: N+1 em tabela principal), gera **REPROVAÇÃO**. Se for otimização secundária, gera **Atenção**.

---

### 2.4. 🧪 Cobertura de Testes & Qualidade (TestCoverageAgent)

- **Foco:** Testabilidade da nova funcionalidade e presença de redes de segurança automatizadas.
- **Padrões Inspecionados:**
  - **Cenários Ausentes:** Se a lógica adicionada possui testes unitários/integrados correspondentes.
  - **Edge Cases (Bordas):** Tratamento de entradas nulas, arrays vazios, timeouts, erros de conexão e exceções não tratadas.
  - **Qualidade dos Asserts:** Testes que apenas invocam funções sem asserções significativas ou testes não determinísticos (falsos positivos).
- **Impacto no Veredito:** Ausência total de testes em lógicas críticas de negócio costuma justificar **Aprovação com Ressalvas** ou **Reprovação**.

---

### 2.5. 👑 Veredito do Tech Lead por Arquivo (TechLeadAgent)

- **Foco:** Visão holística pragmática (relação custo vs benefício da mudança).
- **Saída:**
  - **Status:** `APROVADO` ou `REPROVADO`.
  - **Justificativa:** 1 a 2 frases diretas explicando o porquê da decisão.

---

## 3. Matriz de Decisão: O que Aprova, Ressalva ou Reprova?

### 3.1. ❌ Reprovada (Bloqueio Total)

A PR é **Reprovada** quando possui pelo menos um **Bloqueador Crítico (Must Fix)** que impede o merge:

| Categoria              | Motivo de Reprovação                                                                             |
| :--------------------- | :----------------------------------------------------------------------------------------------- |
| **Segurança**          | Credencial, token ou chave privada no código. Falha evidente de SQL Injection ou Bypass de Auth. |
| **Arquitetura**        | Acoplamento circular severo, violação grave de camadas ou `God Module` global.                   |
| **Confiabilidade**     | Operação síncrona pesada travando thread principal ou laço infinito potencial.                   |
| **Dependências**       | Adição de dependências conflitantes, vulneráveis ou redundantes pesadas no `package.json`.       |
| **Quebra de Contrato** | Alteração em interfaces públicas sem retrocompatibilidade ou migração.                           |

---

### 3.2. ⚠️ Atenção (Aprovada com Ressalvas)

A PR é classificada como **Atenção** quando não há risco de segurança ou queda de produção imediata, mas existem **Débitos Técnicos (Nice to Fix)** relevantes:

| Categoria       | Motivo de Ressalva                                                                                   |
| :-------------- | :--------------------------------------------------------------------------------------------------- |
| **Clean Code**  | Tipagem frouxa com `any`, métodos um pouco longos ou nomes pouco expressivos.                        |
| **Performance** | Oportunidade de substituição de loop duplo por `Map` para grandes massas de dados.                   |
| **Testes**      | A funcionalidade principal foi testada, mas faltaram cenários de borda (ex: lista vazia ou timeout). |
| **Refatoração** | Pequenas duplicações de código (DRY) que poderiam ser extraídas em métodos auxiliares.               |

---

### 3.3. ✅ Aprovada (Merge Autorizado)

A PR é **Aprovada** quando cumpre os requisitos essenciais de qualidade:

- Código limpo, seguindo os padrões do framework e da linguagem.
- Sem riscos de segurança aparentes.
- Desempenho e uso de memória satisfatórios.
- Testes adequados para a alteração proposta.

---

## 4. Estrutura do Relatório Executivo Gerado

O relatório executivo gerado para o aprovador segue a seguinte estrutura em Markdown:

```markdown
## 🚦 Veredito Executivo

- **Decisão**: [APROVADA | APROVADA COM RESSALVAS | REPROVADA]
- **Nível de Risco**: [Baixo | Médio | Alto | Crítico]
- **Tempo estimado de correção**: [Nenhum | 30 minutos | 2 horas | 1 dia]

## 🎯 Síntese da Mudança

[1 parágrafo claro explicando o que a PR de fato altera e o impacto operacional]

## 🚨 Itens Críticos & Bloqueadores (Must Fix)

- [caminho/arquivo.ts]: Explicação do bloqueador crítico obrigatório.

## ⚠️ Pontos de Atenção & Débitos Técnicos (Nice to Fix)

- [caminho/arquivo.ts]: Sugestão construtiva de melhoria.

## 💡 Recomendação para o Aprovador

[1 ou 2 frases finais orientando objetivamente o aprovador sobre o que exigir do autor antes do merge]
```

---

## 5. Próximos Passos para Ajuste dos Prompts

Com base nesta estrutura, os prompts podem ser personalizados em `sograi-backend/src/modules/agents/prompts.ts` para refletir:

1. **Regras corporativas específicas** (ex: padrões de repositório, convenções de arquitetura hexagonal ou DDD).
2. **Níveis de tolerância personalizados** (ex: proibir terminantemente qualquer `any` no TypeScript).
3. **Padrões de testes específicos** (ex: exigir cobertura obrigatória com Jest ou mocks bem definidos).
