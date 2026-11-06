# Diagnóstico e Solução Técnica - Teste 08: Execução de Análise em Segundo Plano e Preservação de Estado entre Telas

## 1. Descrição do Problema Relatado

> *"Um dos pedidos anteriores foi que eu pudesse sair da tela de Análise sem que a análise parasse de rodar. Isso está funcionando? Porque eu saí da tela e quando voltei apareceu para eu escolher a PR novamente."*

Ao iniciar a análise de uma Pull Request e navegar pelo menu lateral para outra seção (como "Histórico", "Gestão de Pendências" ou "Análises Arquivadas"), ao retornar para a tela de "Nova Revisão", o sistema volta ao estado inicial, solicitando a seleção da PR e descartando a visualização do progresso.

---

## 2. Diagnóstico Técnico e Causa Raiz

### 2.1. Desmontagem do Componente React (`Unmount`) no `App.tsx`
No arquivo [`sograi-frontend/src/App.tsx`](file:///home/nlnadialigia/www/code-review/sograi-frontend/src/App.tsx):
```tsx
<main className="flex-1 overflow-y-auto p-8">
  {page === "new" && (
    <NewAnalysis
      onCreated={(created) => {
        setReviews((prev) => [created, ...prev])
        openReview(created)
      }}
    />
  )}
  {page === "history" && <HistoryPage ... />}
  ...
</main>
```

- **O que acontece**:
  1. Quando o usuário clica em qualquer outro item do menu lateral, o estado `page` muda (por exemplo, de `"new"` para `"history"`).
  2. Como a renderização é estritamente condicional (`page === "new" && <NewAnalysis />`), o React **desmonta (`unmount`) completamente o componente `NewAnalysis` do DOM**.
  3. Com a desmontagem, **todo o estado local da análise é destruído**:
     - `running` (true -> reset para false);
     - `progress` (porcentagem da barra resetada para 0);
     - `runningPrId`, `activePrMeta`, `currentFileAnalyzing`;
     - `fileLogs` (histórico de arquivos já concluídos na análise atual).
  4. Quando o usuário clica novamente em "Nova Revisão", o React monta uma **nova instância limpa** de `<NewAnalysis />`, exibindo a tela de busca de PRs como se nada tivesse acontecido.

### 2.2. O que acontece com a requisição no Backend?
- Se o navegador fechar ou cancelar o stream ao desmontar o componente, o backend pode continuar processando em segundo plano até salvar no banco, mas a interface do usuário perde a conexão (`reader.read()` é interrompido).
- O usuário fica sem saber se a análise terminou, se falhou ou em que percentual estava.

---

## 3. Solução Técnica Arquitetural

Para garantir que o usuário possa navegar livremente por toda a aplicação sem interromper ou perder o progresso da análise:

### 3.1. Preservação do Ciclo de Vida do Componente (`Keep-Alive`)
Em vez de destruir o componente `<NewAnalysis />` da árvore do DOM quando `page !== "new"`, utilizamos preservação de montagem:
- Manter o componente montado, alternando a visibilidade no CSS:
  ```tsx
  <div className={page === "new" ? "block" : "hidden"}>
    <NewAnalysis ... />
  </div>
  ```
- **Benefícios**:
  - A conexão de stream SSE (`analyzePullRequestStream`) continua ativa e recebendo os eventos da IA sem qualquer interrupção.
  - Toda a barra de progresso, arquivos concluídos e estado da análise permanecem 100% preservados.
  - Ao voltar para a tela "Nova Revisão", o usuário encontra o progresso exatamente no ponto em que estava (ou já concluído com o botão para ver o parecer).

### 3.2. Indicador Global de Background no Cabeçalho (`Topbar.tsx`)
Quando uma análise estiver rodando e o usuário estiver em outra tela (ex: consultando o Histórico ou Pendências):
- Exibir uma badge/pílula animada no topo da tela:
  - Exemplo: `⚡ Analisando PR #84972 [45%] • Ver progresso`
  - Clicar nessa pílula redireciona o usuário imediatamente de volta para a tela de análise.

### 3.3. Notificação e Sincronização ao Concluir
- Quando a análise terminar enquanto o usuário estiver em outra tela:
  - A nova revisão é automaticamente injetada na lista global de `reviews` no `App.tsx`.
  - Uma notificação (toast ou aviso discreto no topo) avisa: *"Revisão da PR #84972 concluída com sucesso! Clique para visualizar."*

---

## 4. Plano de Execução

1. **Ajuste no `App.tsx`**:
   - Preservar a montagem de `<NewAnalysis />` no DOM via classe CSS condicional (`hidden`).
   - Gerenciar o estado global de execução (`activeAnalysisRunning`, `activeAnalysisMeta`, `activeAnalysisProgress`) para alimentar o indicador do `Topbar`.
2. **Ajuste no `Topbar.tsx`**:
   - Adicionar o indicador de progresso em segundo plano clicável quando houver análise ativa.
3. **Validação**:
   - Iniciar análise, navegar para Histórico, navegar para Pendências, e retornar para Nova Revisão validando a continuidade do fluxo e preservação dos dados.
   - Auditar contagem de linhas (< 350 linhas).
