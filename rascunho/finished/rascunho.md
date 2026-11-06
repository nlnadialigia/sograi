## Contexto

Essa é uma aplicação que será um revisor de PRs.

A idéia é o Aprovador colocar a url do Azure Devops e Solicitar Review. 

No modo de análise teremos as opções: Unificado e cada um dos 7 agentes em separado (StyleAgent, SecurityAgent, PerformanceAgent, TestCoverageAgent, TechLeadAgent)

Assim que clicar em Solicitar Review, deve aparecer uma barra de progresso em porcentagem, indicando o progresso do review e uma barra de progresso. 

Ao final, deve aparecer um quadro com o resultado da análise e um resumo do review.

No menu lateral eu quero que tenha 3 seções:
- Nome e descrição do aplicativo (SogrAI - Sempre pronta para achar um defeito naquilo que você fez com carinho.) Encontre um ícone legar para colocar;
- Status dos Serviços: Postgres, Modelo Gemini
- Navegação: com 3 opções: Nova análise, PR'Ativas e PR's Arquivadas

### Nova análse

- Interface inicial e onde terá o input para colocar a url e um select para escolher o Modo de Análise. Os detalhes já foram descritos acima.

### PR's Ativas

- Trazer 4 cartões: Total de PRs Auditadas, Aprovadas, Reprovadas, Média de Duração
- Embaixo dos cards, trazer uma tabela com os seguintes campos: ID, Repositório, ID PR, Título, Autor,  Data da Análise, Status, Risco, Total Arquivos, Pendências. Todas as informações, quando clicadas abrem o Parecer completo.
- Quando clicado será redirecionado para outra aba que terá como título: 🔍 Inspecionar Pareceres de uma PR.
- Deverá aparecer as opções de parecer que o usuário poderá decidir qual ver: o banckend enviará as opções.

### PR's Arquivadas
- Ao invés de criarmos essa tela, podemos colocar na Tabela de PR's Ativas ações: Excluir, Download, Arquivar
- E nessa última interface ser um banco de arquivados. Similar a do PR's Ativas.

### Página inicial

-  Tela inicial que o Usuário coloca o nome e o email, para aparecer na sidebar

## Stack

- React
- Tailwind -> base ambar
- Lucide
- Shadcn
- Dark and light mode


