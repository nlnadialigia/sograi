# Diagnóstico e Solução Técnica - Teste 06

Este documento aborda os pontos levantados em `rascunho/test_06.md`:
1. Diagnóstico da qualidade/resumo do Relatório PDF vs. Markdown Original (`PR-84972_20261104034748_completo.md`).
2. Redesenho da Gestão de Pendências: Interface dedicada em lote (em substituição ao modal) e correção definitiva do erro `O caminho do arquivo modificado (filePath) é obrigatório`.
3. Análises Arquivadas: Restrição das ações (remover Spec de Correção e Adicionar Pendências).
4. Análise de Arquitetura: Salvamento de `.md` no PostgreSQL e viabilidade de PWA vs. outras abordagens para compartilhamento.

---

## 1. Relatório PDF: Diagnóstico e Comparação com o Markdown Original

### 1.1. O que aconteceu com o conteúdo?
Ao comparar `sograi-backend/results/PR-84972_20261104034748_completo.md` com o gerador do PDF atual (`ReviewPdfDocument.tsx`):
- **No Markdown completo original**:
  - Cada arquivo continha 4 seções textuais completas e aprofundadas com o estilo sarcástico e técnico da SogrAI:
    - `#### 🎨 Estilo & Boas Práticas`
    - `#### 🔒 Segurança`
    - `#### ⚡ Desempenho`
    - `#### 🧪 Cobertura de Testes`
  - Mais a justificativa do Tech Lead e a lista de apontamentos com contexto real do diff.
- **No PDF atual (`ReviewPdfDocument.tsx`)**:
  - O PDF estava renderizando **apenas** o `file.justification` e a lista simplificada de `issues` (`iss.title` e `iss.description`).
  - As notas das 4 dimensões (`styleNotes`, `securityNotes`, `performanceNotes`, `testNotes`) presentes no objeto `raw_analysis` salvo no banco **não estavam sendo exibidas no PDF**!
  - Para piorar, se o prompt da IA no backend gerar frases muito curtas (devido a instruções de brevidade no schema), o PDF fica ainda mais vazio.

### 1.2. Solução para o PDF e para os Prompts:
1. **Enriquecimento do PDF (`ReviewPdfDocument.tsx`)**:
   - Incluir no card de cada arquivo as 4 dimensões de análise técnica (Estilo, Segurança, Desempenho e Testes), recuperadas de `file.raw_analysis` (ou de seus campos equivalentes).
   - Renderizar o bloco de justificativa do Tech Lead em destaque com a badge de veredito.
   - Listar os apontamentos com severidade (`BLOCKER`, `WARNING`, `SUGGESTION`), linha de código referenciada e código sugerido quando houver.
2. **Ajuste de Prompt (`prompts.ts`)**:
   - Reforçar que `styleNotes`, `securityNotes`, `performanceNotes` e `testNotes` devem ser ricas, técnicas, opinativas e detalhadas, apontando trechos e impactos reais, sem respostas monossilábicas como "Ok" ou "Sem apontamento" quando houver o que comentar.

---

## 2. Interface de Pendências em Lote (Substituindo o Modal)

### 2.1. Problema Atual
- Com PRs que possuem até 40 arquivos, uma listagem de chips ou select convencional com 40 itens fica inviável, poluída e de difícil navegação.
- O fluxo de abrir um modal, cadastrar, fechar, abrir outro modal e selecionar novamente é lento para o Tech Lead que quer revisar a PR inteira e elencar 5 ou 10 apontamentos em sequência.
- **Causa Raiz do Erro no Backend**:
  ```bash
  ERROR [ExceptionsHandler] Error: O caminho do arquivo modificado (filePath) é obrigatório.
  at PendingItemsController.create
  ```
  - No controller, `dto.filePath` era checado como `(dto.filePath || '').trim()`.
  - Quando a chamada enviava um payload onde `filePath` vinha com nome de propriedade divergente (ou indefinido no primeiro clique do modal), a exceção explodia no NestJS.
  - Além disso, criar item a item via modal não permitia revisar o conjunto antes de persistir.

### 2.2. Nova Interface de Adição de Pendências em Sequência (`BatchPendingDrawer` ou Painel Dedicado)
- **Fluxo Operacional**:
  1. O usuário aciona "Adicionar Pendências" em uma PR ativa.
  2. Abre uma tela/gaveta de **Lançamento de Pendências da PR**:
     - Exibe cabeçalho fixo com identificação da PR e repositório.
     - **Seleção Inteligente de Arquivo**: Um autocomplete / combobox pesquisável que filtra os até 40 arquivos da PR por nome.
     - Seleciona Tipo (`TECH_DEBT`, `IMPROVEMENT`, `FUTURE_REFACTOR`) e Prioridade (`LOW`, `MEDIUM`, `HIGH`).
     - Campo de texto para as orientações (múltiplas linhas permitidas).
     - Botão **"+ Adicionar à Fila"**:
       - Valida que o arquivo foi escolhido e a descrição preenchida.
       - Adiciona o item a um card temporário na lista inferior ("Pendências a Salvar").
       - **Filtro dinâmico**: O arquivo adicionado é retirado da lista de opções de arquivos disponíveis para que o usuário não duplique o mesmo arquivo acidentalmente.
       - Reseta o formulário para o próximo arquivo.
     - Cards da fila possuem botão de exclusão individual (caso o usuário se arrependa antes de salvar).
     - Botão final **"Salvar Todas as Pendências (X)"**:
       - Envia um lote (`batch`) para o backend em uma única requisição atômica `POST /api/pending-items/batch` (mantendo retrocompatibilidade com o endpoint individual).
       - Exibe feedback de sucesso e redireciona/atualiza a lista.

---

## 3. Análises Arquivadas: Restrição de Ações

### 3.1. Requisito
- Na visão de **Análises Arquivadas**:
  - **Remover** as opções de "Spec de Correção (.md)" e "Adicionar Pendência".
  - Manter apenas as ações de consulta ("Visualizar Parecer", "Abrir no Azure", "Desarquivar", "Excluir").
  - Os arquivos gerados continuam intactos no sistema/disco, mas a geração de planos de ação e novas pendências manuais fica estritamente bloqueada enquanto a PR estiver arquivada.

---

## 4. Análise Arquitetural: Dúvidas do Usuário

### 4.1. "Os arquivos .md estão sendo salvos no repositório. Existe alguma forma de ficarem salvos no banco?"
**Sim, e é uma excelente prática arquitetural!**
- **Cenário Atual**:
  - O backend usa `fs.writeFileSync(path.join(this.resultsDir, ...))` gravando na pasta local `sograi-backend/results/`.
  - Isso gera arquivos soltos no sistema de arquivos do servidor, que podem ser perdidos se o container Docker for destruído ou se a aplicação for movida de máquina.
- **Como salvar no PostgreSQL**:
  1. A tabela `pull_requests` pode receber colunas dedicadas `TEXT` (ou uma tabela separada `pr_markdown_artifacts`):
     - `executive_markdown TEXT`
     - `spec_markdown TEXT`
     - `full_markdown TEXT`
  2. Vantagens:
     - **Independência de disco**: O banco de dados passa a ser a única fonte da verdade (`Single Source of Truth`). Backups do PostgreSQL já preservam todos os relatórios históricos.
     - **Acesso direto via API**: O endpoint `/api/reviews/:id/spec` e o download de relatórios não dependem de leitura de disco (`fs`), tornando o backend totalmente *stateless* e pronto para rodar em containers escaláveis (ex: Cloud Run, ECS ou Kubernetes).

### 4.2. "É possível a criação de um PWA para compartilhar essa aplicação? Como funciona ou qual a forma viável e fácil?"
- **O que é um PWA (Progressive Web App)**:
  - Um PWA transforma a aplicação React/Vite em um app "instalável" no celular ou no desktop (Chrome/Edge/Safari), com ícone na tela inicial e capacidade de funcionar offline com cache local.
  - Para transformar o Vite em PWA, adiciona-se o plugin `vite-plugin-pwa` e um arquivo `manifest.json`.
- **Limitação Importante de um PWA**:
  - O PWA **não compartilha o backend nem o banco de dados**! Ele é apenas a casca do frontend rodando no navegador do usuário.
  - Se a aplicação backend estiver rodando apenas no seu `localhost:5001`, outra pessoa não conseguirá acessar o PWA fora da sua máquina a menos que a rede esteja compartilhada.
- **Formas Mais Viáveis e Fáceis de Compartilhar**:
  1. **Opção A - Túnel Seguro Temporário (Ngrok / Cloudflare Tunnel / LocalTunnel) [Imediato - 2 minutos]**:
     - Permite que você continue rodando localmente no seu computador e gere uma URL pública HTTPS (ex: `https://sograi-seu-nome.loca.lt` ou `ngrok`).
     - Qualquer colega da sua equipe clica no link e acessa a aplicação completa (frontend + backend + banco) imediatamente, de qualquer lugar.
  2. **Opção B - Deploy Interno em Nuvem ou Servidor da Empresa (Docker Compose / Cloud Run)**:
     - Subir os containers do backend, frontend (Nginx) e PostgreSQL em uma VM corporativa ou serviço gerenciado de nuvem (GCP Cloud Run, AWS ECS ou VM Linux interna com IP fixo).
     - Esta é a abordagem definitiva para uso corporativo contínuo pela equipe.
  3. **Opção C - Adição do Manifesto PWA**:
     - Pode ser adicionado em conjunto com a Opção A ou B, permitindo que os desenvolvedores cliquem no botão "Instalar SogrAI" no navegador.
