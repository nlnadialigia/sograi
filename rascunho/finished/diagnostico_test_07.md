# Diagnóstico e Solução Técnica - Teste 07: Correção de Erro de Parse JSON (Bad Control Character) e Resiliência na Análise de PRs

## 1. Descrição dos Problemas Relatados

1. **Erro de Caractere de Controle no JSON**:
   ```bash
   [ERROR] [GeminiService] Falha ao parsear JSON retornado pelo Gemini: Bad control character in string literal in JSON at position 2422 (line 15 column 406)
   ```
2. **Perda da Análise da PR**:
   - A análise foi executada, mas ao final não apareceu nem nas PRs ativas nem nas arquivadas.

---

## 2. Análise da Causa Raiz

### 2.1. Causa do Erro `Bad control character in string literal in JSON`
- **Especificação JSON (RFC 8259)**:
  - De acordo com o padrão JSON, caracteres de controle (códigos ASCII `0x00` a `0x1F`, como quebras de linha literais `\n`, retornos de carro `\r` e tabs `\t`) **são estritamente proibidos dentro de strings literais** delimitadas por aspas duplas `"..."`. Eles devem obrigatoriamente ser representados na forma escapada (`\n`, `\r`, `\t` ou `\u00xx`).
- **Comportamento do LLM (Gemini)**:
  - Ao analisar arquivos de código e diffs complexos, o modelo frequentemente gera explicações, justificativas e trechos de código com quebras de linha reais (`0x0A`) dentro dos valores dos campos JSON (`justification`, `styleNotes`, `securityNotes`, `issues[].suggestion`, etc.).
- **Fragilidade no `GeminiService.generateJson`**:
  - O código atual em `sograi-backend/src/modules/gemini/gemini.service.ts` faz apenas um replace superficial de blocos de markdown:
    ```typescript
    const sanitized = text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(sanitized) as T;
    ```
  - Quando o V8 / Node.js encontra um byte `0x0A` não escapado dentro de uma string JSON, lança imediatamente a exceção `SyntaxError: Bad control character in string literal in JSON`.

### 2.2. Por que a PR não foi salva em Ativas nem Arquivadas?
- No `ReviewsService` (`sograi-backend/src/modules/reviews/reviews.service.ts`):
  - A iteração pelos arquivos (`for (let i = 0; i < filesToProcess.length; i++)`) chama `this.agentsService.runUnifiedAnalysis(...)` de forma sequencial.
  - A persistência no banco (`this.dbService.upsertPullRequest(...)` e gravação de arquivos) só ocorre **após** a conclusão bem-sucedida de todos os arquivos e do parecer executivo.
  - Como a exceção no `GeminiService` não era tratada de forma resiliente para aquele arquivo, ela explodiu para o handler de exceções da rota HTTP/SSE, abortando a execução antes que qualquer registro fosse gravado no PostgreSQL.

---

## 3. Solução Técnica Definitiva

### 3.1. Sanitização Robusta de Strings JSON no `GeminiService`
Implementar um parser resiliente que trata especificamente strings geradas por IA:
1. **Isolamento do JSON**: Extrair apenas o bloco delimitado pelo primeiro `{` e pelo último `}` (ou `[` e `]`).
2. **Escapamento de Caracteres de Controle em Strings**:
   - Percorrer os caracteres do JSON controlando o estado `inString` (dentro de aspas).
   - Quando `inString === true`:
     - Transformar quebras de linha literais (`0x0A`) em `\n`.
     - Transformar retornos de carro (`0x0D`) em `\r`.
     - Transformar tabs literais (`0x09`) em `\t`.
     - Tratar caracteres de controle inválidos (< 32) escapando-os como `\u00xx`.
3. **Remoção de Trailing Commas**: Remover vírgulas soltas antes de `}` ou `]`.
4. **Fallback Inteligente**: Caso o `JSON.parse` ainda falhe por algum erro residual extremo de formatação da IA, tentar reparo de aspas internas ou extração estruturada dos campos via regex.

### 3.2. Resiliência por Arquivo no `ReviewsService`
- Envolver a chamada de análise de cada arquivo em um bloco de tolerância a falhas:
  - Se mesmo após os retries do Gemini e sanitização de JSON um arquivo específico falhar, o sistema:
    1. Emite um aviso no log e notifica o usuário via SSE.
    2. Registra o arquivo com veredito de ressalva (`ATENÇÃO`: `Análise automática deste arquivo enfrentou inconsistência transitória de resposta do modelo. Recomenda-se revisão manual.`).
    3. **Permite que a PR continue sendo processada para os demais arquivos e seja devidamente gravada no banco de dados**, evitando que o usuário perca todo o progresso da análise.

---

## 4. Plano de Aplicação da Correção

1. **Ajuste em `sograi-backend/src/modules/gemini/gemini.service.ts`**:
   - Adicionar a função `sanitizeJsonControlChars(jsonStr: string): string`.
   - Atualizar `generateJson` com a pipeline completa de extração, sanitização e fallback.
2. **Ajuste em `sograi-backend/src/modules/reviews/reviews.service.ts`**:
   - Proteger o loop de processamento por arquivo para garantir que falhas isoladas de um arquivo não descartem a PR inteira.
3. **Validação**:
   - Teste unitário/script local simulando o JSON quebrado relatado no log.
   - Compilação limpa com `pnpm build` (`nest build`).
   - Verificação de conformidade com a regra de arquivos < 350 linhas.
