# Guia Prático de Engenharia e Refinamento de Prompts (SogrAI)

Este documento apresenta o guia passo a passo para calibrar, refinar e evoluir os prompts de inteligência artificial da **SogrAI** (utilizados no `gemini.service.ts` e `reviews.service.ts`), garantindo respostas precisas, determinísticas, sem alucinações e com saídas estruturadas confiáveis.

---

## 1. O Que Levar em Consideração ao Desenhar Prompts de Code Review

Ao projetar prompts para análise estática e revisão de código com Grandes Modelos de Linguagem (LLMs), considere os quatro pilares fundamentais:

### 1.1. Determinismo e Temperatura Baixa
- Para auditoria de código, a criatividade do modelo deve ser minimizada. Utilize **`temperature` entre 0.1 e 0.2**.
- Temperaturas baixas garantem consistência: o mesmo diff avaliado duas vezes resultará em vereditos e apontamentos coerentes.

### 1.2. Atenção de Contexto e Delimitação Clara
- LLMs sofrem de dispersão de atenção (*Lost in the Middle*) quando recebem volumes extensos de texto misturado.
- **Separe os dados das instruções** usando delimitadores explícitos (ex: `=== DIFF START ===` e `=== DIFF END ===`).
- Deixe as instruções mais críticas e as regras de formato no **início** e reforçadas no **final** do prompt.

### 1.3. Contrato Rígido de Saída (JSON Schema)
- Modelos generativos tendem a adicionar comentários antes ou depois do JSON (ex: ```json ... ``` ou "Aqui está a análise:").
- O prompt deve conter uma proibição explícita contra texto conversacional fora da estrutura JSON.
- Sempre informe o schema exato com tipos primitivos, chaves obrigatórias e exemplos de valores aceitos (ex: `"verdict": "APROVADO" | "ATENCAO" | "REPROVADO"`).

### 1.4. Calibragem entre Rigor e Falsos Positivos
- Um revisor de código excessivamente rigoroso gera "fadiga de alertas" na equipe.
- Instrua o modelo a diferenciar:
  - **Bloqueadores (Must Fix):** Falhas de segurança, quebra de contrato de API, vazamento de credenciais, erros de compilação iminentes.
  - **Sugestões/Melhorias (Nice to Fix):** Nomes de variáveis mais expressivos, refatoração de métodos longos, tipagens mais refinadas.

---

## 2. Passo a Passo para Refinar um Prompt

Siga este fluxo incremental sempre que for aprimorar ou criar um novo especialista:

```
[1. Definir Persona & Escopo Único]
               │
               ▼
[2. Injetar Diretrizes Positivas & Negativas]
               │
               ▼
[3. Delimitar Dados de Entrada (Diff / Metadados)]
               │
               ▼
[4. Estabelecer Contrato Estrito de Saída (JSON)]
               │
               ▼
[5. Fornecer Exemplos Guiados (Few-Shot)]
               │
               ▼
[6. Testar com Casos Limítrofes (Edge Cases)]
```

### Passo 1: Definir Persona e Escopo Exclusivo
Evite atribuir múltiplos papéis conflitantes no mesmo prompt. Se o especialista é de **Segurança (AppSec)**, seu foco deve ser exclusivamente vulnerabilidades, validação de entrada e vazamento de dados — sem desviar a atenção para estilo de indentação ou imports não utilizados.

> **Exemplo:**
> *"Você é o Senior Security Engineer da SogrAI. Sua missão exclusiva é auditar alterações de código em busca de riscos de segurança (OWASP Top 10, sanitização de inputs, injeções, controle de acesso e segredos expostos)."*

### Passo 2: Definir Regras Negativas (O que NÃO Fazer)
Instruções negativas claras são tão importantes quanto as positivas para evitar alucinações comuns:
- Não critique trechos de código que não foram alterados no diff.
- Não invente bibliotecas ou pacotes que não estejam declarados.
- Não reprove uma PR por preferências estilísticas subjetivas.
- Não inclua quebras de linha não escapadas dentro de strings JSON.

### Passo 3: Fornecer Contexto e Delimitar o Diff
Forneça metadados essenciais para o modelo entender o impacto:
- Caminho do arquivo (`filePath`) — permite ao modelo inferir a camada arquitetural (ex: controller, service, repositório, teste).
- Contexto da Pull Request (título, autor e descrição da PR).

### Passo 4: Especificar a Estrutura de Retorno
Defina o JSON exato esperado:
```json
{
  "verdict": "APROVADO",
  "justification": "Resumo objetivo em até 3 frases.",
  "issues": [
    {
      "severity": "BLOCKER",
      "line": 42,
      "title": "Possível SQL Injection",
      "description": "Concatenação direta de variável em query bruta sem uso de parâmetros preparados.",
      "suggestion": "Substituir interpolação por query parametrizada via repositório."
    }
  ]
}
```

### Passo 5: Testar com Casos de Borda (Edge Cases)
Valide o prompt contra cenários difíceis:
1. **Diffs vazios ou quase vazios** (ex: adição de apenas um comentário ou espaço).
2. **Arquivos de teste** (`*.spec.ts`, `*.test.tsx`) — garantir que o modelo não critique o uso de mocks ou asserções deliberadas.
3. **Diffs muito grandes** (mais de 300 linhas alteradas) — verificar se o modelo não trunca a saída JSON.

---

## 3. Como Escrever Prompts Claros e Objetivos

Para maximizar a eficácia dos prompts, utilize técnicas consolidadas de engenharia de prompt:

| Prática Ruim (Vaga) | Prática Recomendada (Determinística) |
|---|---|
| *"Dê uma olhada no código e diga se está bom."* | *"Analise as linhas alteradas no diff e emita um veredito entre APROVADO, ATENCAO ou REPROVADO segundo a matriz de critérios abaixo."* |
| *"Tente achar erros de segurança se puder."* | *"Identifique qualquer ocorrência de: (1) Credenciais hardcoded, (2) Queries não parametrizadas, (3) Falta de escape em saídas HTML."* |
| *"Retorne uma resposta em formato estruturado."* | *"Sua saída deve ser estritamente um único objeto JSON válido, sem qualquer bloco delimitador markdown (```json) ou texto introdutório."* |

### Técnicas Recomendadas:
1. **Verbos no Imperativo:** Use comandos diretos (*Inspecione*, *Avalie*, *Valide*, *Gere*, *Ignore*).
2. **Listas Numeradas para Prioridade:** O modelo processa listas numeradas como critérios hierárquicos com maior taxa de aderência.
3. **Critérios Binários de Reprovação:** Defina regras booleanas explícitas para reprovação (ex: *"Se houver 1 ou mais vulnerabilidades de severidade CRITICAL/HIGH, o veredito DEVE ser obrigatoriamente REPROVADO"*).

---

## 4. Inglês vs. Português: Qual Idioma Escolher?

Uma dúvida recorrente é se o prompt deve ser escrito em **inglês** ou em **português**.

### 4.1. Análise Comparativa

| Aspecto | Prompts em Inglês | Prompts em Português |
|---|---|---|
| **Poder de Raciocínio (Reasoning)** | **Superior.** A base de pré-treinamento da maioria dos LLMs (Gemini, Claude, GPT) é composta predominantemente por código e textos em inglês. A atenção dos pesos sinápticos a instruções lógicas em inglês é mais precisa. | **Bom.** Modelos modernos entendem português fluentemente, mas instruções muito complexas ou com termos técnicos em PT-BR sofrem maior taxa de desvio. |
| **Consumo de Tokens & Latência** | **Menor.** O tokenizer divide o inglês em palavras ou sílabas inteiras. O vocabulário inglês consome de 15% a 25% menos tokens para a mesma instrução. | **Maior.** Acentuações (ç, ã, é) e palavras longas frequentemente são fragmentadas em múltiplos sub-tokens pelo tokenizer BPE/SentencePiece. |
| **Adesão ao JSON Schema** | **Altíssima.** Palavras-chave de programação, nomes de campos e operadores lógicos são nativos em inglês. | **Média/Alta.** O modelo pode acidentalmente traduzir nomes de chaves do JSON para português se não houver restrição rígida. |
| **Experiência do Usuário (Dev Team)** | Não impacta o desenvolvedor final se a saída for orientada para PT-BR. | Natural para desenvolvedores locais lerem e editarem os arquivos de prompt. |

---

### 4.2. A Abordagem Recomendada: O Modelo Híbrido da SogrAI

A melhor prática adotada pela **SogrAI** é a **Estratégia Híbrida**:

1. **Estrutura, Regras de Lógica e Contratos em Inglês:**
   - As instruções de raciocínio, restrições negativas, definição do papel (persona) e o schema das chaves JSON são escritos em **inglês**.
   - Isso garante o menor consumo de tokens, máxima precisão do raciocínio e conformidade estrita com o JSON.

2. **Geração de Conteúdo e Explicações em Português (pt-BR):**
   - O prompt instrui explicitamente o modelo a redigir os valores dos campos descritivos (`justification`, `title`, `description`, `suggestion`) em **Português do Brasil (pt-BR)**.

#### Exemplo Prático de Prompt Híbrido:
```typescript
const prompt = `
You are the Lead Code Reviewer at SogrAI.
Analyze the provided code diff for quality, performance, and security.

RULES:
1. Inspect ONLY the modified lines within the diff.
2. If there are critical security flaws or breaking bugs, verdict must be "REPROVADO".
3. If there are minor improvements or technical debt, verdict must be "ATENCAO".
4. If code is safe, clean and ready for production, verdict must be "APROVADO".

OUTPUT FORMAT:
Return STRICTLY a JSON object with this exact shape:
{
  "verdict": "APROVADO" | "ATENCAO" | "REPROVADO",
  "justification": "string",
  "issues": [
    {
      "severity": "BLOCKER" | "WARNING" | "SUGGESTION",
      "line": number,
      "title": "string",
      "description": "string"
    }
  ]
}

LANGUAGE REQUIREMENT:
All descriptive text inside "justification", "title", and "description" MUST be written in natural Brazilian Portuguese (pt-BR).
Do NOT include markdown backticks around the JSON output.
`;
```

Esta abordagem garante **zero penalidade de raciocínio** no motor de IA e **100% de clareza e empatia** com a equipe de engenharia consumindo o parecer técnico na interface ou em PDF.
