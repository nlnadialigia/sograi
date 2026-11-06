# Diagnóstico e Solução Técnica - Teste 09: Correção de Erro de Sintaxe JSON no Gemini (Expected double-quoted property name) e Tolerância a Falhas

## 1. Descrição do Problema Relatado

```bash
[Nest] 242719  - 05/11/2026, 19:59:18   ERROR [GeminiService] Falha ao parsear JSON retornado pelo Gemini: Expected double-quoted property name in JSON at position 1907 (line 14 column 7)
Raw: {
  "verdict": "APROVADO",
  "justification": "A alteração introduz o parâmetro `allowPartialSlopes` de forma limpa, mantendo a retrocompatibilidade e corrigindo a expressão regular de limpeza de `originalUp`. O código está estruturado e coerente.",
  "styleNotes": "O uso de parâmetros opcionais com
[Nest] 242719  - 05/11/2026, 19:59:18   ERROR [ReviewsService] Erro ao analisar o arquivo /src/puzzle/pi/services/plan-input/menu-input.service.ts: Falha ao interpretar resposta estruturada da IA: Expected double-quoted property name in JSON at position 1907 (line 14 column 7). A resposta do modelo não seguiu o padrão JSON esperado.
```

Durante a auditoria da Pull Request, ao analisar o arquivo `/src/puzzle/pi/services/plan-input/menu-input.service.ts`, o Gemini retornou uma resposta que não pôde ser interpretada como JSON válido, abortando toda a análise da PR.

---

## 2. Análise da Causa Raiz

### 2.1. O Erro `Expected double-quoted property name in JSON at position 1907 (line 14 column 7)`
No mecanismo V8 do Node.js, esta exceção específica ocorre quando o parser JSON encontra:
1. **Propriedades sem aspas** geradas pelo modelo (ex: `category: "STYLE"` ou `lineReference: "L45"` em vez de `"category"` / `"lineReference"`);
2. **Vírgulas soltas (trailing commas)** em objetos aninhados (ex: `{\n  "category": "STYLE",\n}`);
3. **Comentários de código no JSON** gerados pelo modelo (ex: `// nota sobre o método` ou `/* refatoração */`);
4. **Aspas duplas não escapadas dentro de textos** (ex: no campo `styleNotes` ou `description`, o modelo escreveu trechos de código com aspas `""` que fecharam prematuramente a string no caractere 1907);
5. **Corte de resposta (Truncamento)**: Caso o modelo encerre o bloco antes de fechar todos os colchetes e chaves.

### 2.2. Limitação do Sanitizador Atual em `gemini.service.ts`
O método `sanitizeJsonString` trata caracteres de controle ASCII (< 32, `\n`, `\r`, `\t`), mas:
- Não corrige chaves sem aspas (`unquoted properties`);
- Não remove comentários inline (`//`) nem de bloco (`/* */`);
- Não corrige aspas literais internas não escapadas geradas pela IA dentro das justificativas e códigos sugeridos;
- Não reconstrói JSON truncado.

---

## 3. Solução Técnica Proposta

### 3.1. Adoção da Biblioteca Especializada `jsonrepair`
Utilizar a biblioteca de referência `jsonrepair` no `GeminiService`:
- O `jsonrepair` é a biblioteca padrão da indústria para reparar JSON imperfeito gerado por LLMs:
  - Adiciona aspas automaticamente em chaves não cotadas;
  - Corrige aspas internas não escapadas dentro de strings;
  - Remove comentários (`//` e `/* */`);
  - Elimina trailing commas em qualquer nível de aninhamento;
  - Fecha estruturas truncadas (`{` e `[`).

### 3.2. Pipeline de Parse em Múltiplas Etapas no `GeminiService`
1. **Etapa 1**: `JSON.parse` direto no texto higienizado.
2. **Etapa 2 (Auto-Reparo)**: Se falhar, aplicar `jsonrepair(text)` e efetuar novo parse.
3. **Etapa 3 (Sanitização de Controles + Auto-Reparo)**: Se ainda falhar, aplicar `sanitizeJsonString` e em seguida `jsonrepair`.
4. **Etapa 4 (Retry com a IA)**: Se persistir inválido, disparar uma nova chamada de retry para o Gemini antes de desistir.

### 3.3. Tolerância a Falhas na PR (`ReviewsService`)
Caso um arquivo específico gere uma resposta irrecuperável mesmo após todos os reparos e retries da IA:
- Em vez de derrubar a auditoria inteira da PR (descartando os outros arquivos e impedindo o salvamento no banco de dados):
  - Marcar o arquivo com status `"APROVADO COM RESSALVAS"` ou `"ATENÇÃO: Requer revisão manual (resposta da IA inconsistente)"`.
  - Registrar um item de aviso nos apontamentos do arquivo.
  - Prosseguir com a auditoria dos arquivos restantes e **salvar a Pull Request no PostgreSQL normalmente**.

---

## 4. Alinhamento de Decisão
- Prosseguir com a implementação do `jsonrepair` e pipeline multi-etapa no `GeminiService` e tolerância a falhas no `ReviewsService`.
