# Diagnóstico Técnico e Levantamento de Requisitos: Ciclo de Ajustes 05

**Arquivo:** `rascunho/diagnostico_ajustes_05.md`  
**Data:** 04/11/2026  
**Contexto de Origem:** `rascunho/test_05.md`  
**Objetivo:** Restaurar o grid de etapas com explicação detalhada de cada fase; aprimorar o modal de adicionar pendência (digitação livre, remoção de título redundante e inserção em lote por linhas no textarea); corrigir o bug de validação de `filePath`; elevar o teto de arquivos para 40; esclarecer a persistência da análise em background; e implementar novas regras de prompt e filtragem de arquivos (ignorar `.md`, análise opcional de testes com default falso e testes reprovados não reprovarem a PR).

---

## 1. Interface de Progresso: Explicação das 4 Etapas

Na versão anterior tínhamos 4 cards visuais de etapas. Abaixo está a descrição técnica exata do que acontece em cada uma delas:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Etapa 1     │    │     Etapa 2     │    │     Etapa 3     │    │     Etapa 4     │
│  Conexão Azure  │───►│  Auditoria IA   │───►│   Consolidação  │───►│  Persistência & │
│  & Diffs (Git)  │    │  (Comitê SogrAI)│    │    Executiva    │    │    Artefatos    │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

1. **Etapa 1: Conexão Azure DevOps & Coleta de Diffs (0% a 25%)**
   - Valida a URL e extrai Organização, Projeto, Repositório e ID da PR.
   - Conecta à API REST do Azure DevOps (`v7.0`) via PAT.
   - Obtém os metadados da PR (Título, Autor, Branch de Origem e Destino) e a última iteração de commits.
   - Baixa a lista de arquivos alterados e busca o conteúdo original vs novo de cada arquivo modificado (excluindo arquivos `.md`).
2. **Etapa 2: Auditoria Deep Dive com o Comitê SogrAI (25% a 80%)**
   - Itera sobre os arquivos modificados (até 40 arquivos de código).
   - Para cada arquivo, executa a análise sob 4 dimensões (Estilo/Clean Code, Segurança/OWASP, Desempenho e Cobertura de Testes).
   - O Tech Lead emite o veredito por arquivo (`APROVADO` / `REPROVADO`) com justificativa técnica e gera apontamentos (`BLOCKER`, `WARNING`, `SUGGESTION`).
3. **Etapa 3: Consolidação e Síntese Executiva (80% a 90%)**
   - O agente consolidador avalia o conjunto de todos os arquivos auditados.
   - Determina a decisão geral da PR (`APROVADA`, `APROVADA COM RESSALVAS`, `REPROVADA`).
   - Calcula o nível de risco global (`Baixo`, `Médio`, `Alto`, `Crítico`), estima o tempo para correção e redige a recomendação final para o aprovador.
4. **Etapa 4: Persistência no PostgreSQL e Emissão de Artefatos (90% a 100%)**
   - Executa o UPSERT no PostgreSQL (incrementa a iteração da PR sem duplicar linhas).
   - Grava os registros em `pr_file_reviews`, `pr_file_issues` e atualiza a auditoria de pendências em `pr_tracking_items`.
   - Gera o arquivo da **Spec de Correção Markdown** (`PR-xxx_spec_correcao.md`) e prepara os dados para o PDF.

> **Ação na UI:** Vamos restaurar os 4 cards no topo da barra de progresso, mantendo simultaneamente o log em tempo real dos arquivos sendo auditados logo abaixo.

---

## 2. Modal de Adicionar Pendência

### 2.1. Diagnóstico do Erro do Backend
- O log reportou: `Error: O caminho do arquivo modificado (filePath) é obrigatório.`
- **Causa:** O select de arquivos do modal começava com `""` e caso o usuário clicasse diretamente em salvar, ou caso a PR não tivesse a lista de arquivos carregada em cache, o `filePath` chegava vazio `""`.
- **Ajustes:**
  1. **Digitação Livre + Sugestão:** Em vez de forçar um `<select>`, ter um campo de texto livre onde o usuário pode **digitar qualquer caminho** de arquivo (ex: `src/auth/jwt.ts`), ou clicar em chips com os arquivos da PR para auto-completar.
  2. **Remover o input de "Título":** Simplificar o formulário para ter foco direto no arquivo e nas orientações. O título pode ser gerado automaticamente a partir da primeira linha ou do tipo de pendência.
  3. **Múltiplas Pendências no Textarea:**
     - Se o Tech Lead colar ou digitar várias anotações (uma por linha ou em bullets `- `), cada linha se tornará uma pendência individual cadastrada automaticamente no banco.
     - Orientação clara abaixo do campo:
       > *"💡 Dica: Digite uma pendência por linha (ou use hífen '-'). Cada linha será registrada como um item separado no backlog."*

---

## 3. Backend: Limites e Ciclo de Vida da Análise

### 3.1. Limite de 15 Arquivos ➔ Elevado para 40 Arquivos
- **Diagnóstico:** Havia uma trava de segurança inicial no código: `const filesToProcess = files.slice(0, 15);`.
- **Ajuste:** Vamos elevar a trava para até **40 arquivos**, excluindo previamente arquivos de documentação (`.md`) da contagem.

### 3.2. Dúvida: "Se eu mudar de interface a análise é interrompida?"
- **Resposta Técnica:**
  - **No Backend:** **NÃO é interrompida.** Quando o backend NestJS recebe a requisição de análise, a função assíncrona executa no servidor até o fim, gravando os arquivos no disco e persistindo no banco de dados PostgreSQL. Mesmo se o navegador for fechado, o backend continua o processamento.
  - **No Frontend:** Se o usuário navegar para outra página do SPA durante uma requisição SSE, a conexão HTTP do navegador pode ser descartada pelo React.
  - **Melhoria proposta:** Armazenar o estado da análise em andamento no estado global do app para que, se o usuário navegar entre as abas e voltar para "Nova Revisão", a tela continue monitorando a PR em execução sem reiniciar nem perder o progresso.

---

## 4. Refinamento de Prompts e Regras de Negócio

Conforme suas diretrizes:

1. **Arquivos de Teste como Opcionais na Análise:**
   - Adicionar no modal de configuração de auditoria a opção:
     - `[ ] Incluir arquivos de testes automatizados na auditoria (ex: .spec.ts, .test.ts, __tests__)`
     - **Default:** `False` (desmarcado).
   - Se desmarcado, qualquer arquivo identificado como de teste (ex: `*.spec.*`, `*.test.*`, `__tests__/*`, `*Test.java`, etc.) é ignorado pela IA e não consome quota.
2. **Arquivos de Testes Reprovados NÃO Reprovam a PR:**
   - Se a opção de testar arquivos for ativada pelo usuário:
     - Mesmo que um arquivo de teste tenha ressalvas ou falhas apontadas pelos agentes, o veredito geral da PR **não será `REPROVADA`** exclusivamente por conta dos testes. As falhas de teste constarão como alertas/débitos técnicos (`WARNING`).
3. **Não Analisar Arquivos `.md`:**
   - Filtrar automaticamente da lista antes do envio para a LLM (`!file.path.toLowerCase().endsWith('.md')`).
   - Arquivos `.md` não contam para o limite dos 40 arquivos.

---

## 5. Perguntas e Alinhamentos

### Pergunta 1: Formato das Pendências no Textarea
Ao cadastrar no textarea com múltiplas linhas:
- **Opção A (Recomendada):** Se o usuário digitar 3 linhas, o backend cria 3 registros individuais em `pr_manual_pending_items` associados ao mesmo arquivo.
- **Opção B:** Salva tudo em um único registro consolidado no banco.

### Pergunta 2: Identificação de Arquivos de Teste
A regra padrão para identificar arquivos de teste será por sufixo de caminho (`.spec.`, `.test.`, `tests/`, `__tests__/`). Concorda com essa identificação?

---

Podemos confirmar essas diretrizes para iniciar a aplicação dos códigos?
