## Contexto

Novos ajustes:

### Relatório PDF
- O relatório ainda não está bom. Não sei se é a análise que está respondendo mais resumida, mas antes. Dá uma olhada no arquivo `sograi-backend/results/PR-84972_20261104034748_completo.md` que foi feito antes de tirarmos o `.md` e colocarmos tudo no banco. Lá as respostas estão completas. 

### Modal de Pendências
- O problema na forma como você está apresentando os arquivos é que cada PR pode ter até 40 arquivos, o que vai ficar enviável dessa forma. 
- Outra coisa importante... queria adicionar várias em sequencia. Acho melhor transformar em uma interface do que deixar no modal.
- Funcionamento:
  - Eu seleciono arquivo, tipo, prioridade, coloco as pendências tem uma opção Adicionar +.
  - O adicionado aparece em um card abaixo e reseta os dados para eu adicionar outro arquivo. É importante que o arquivo já adicionado não apareça novamente.
  - Quando finalizar eu clico em Salvar.
- Erro ao Salvar pendência:
```bash
[Nest] 85450  - 11/04/2026, 3:42:22 PM   ERROR [ExceptionsHandler] Error: O caminho do arquivo modificado (filePath) é obrigatório.
    at PendingItemsController.create (/home/nadiasantos/www/code-review/sograi-backend/src/modules/reviews/pending-items.controller.ts:42:13)
    at /home/nadiasantos/www/code-review/sograi-backend/node_modules/.pnpm/@nestjs+core@11.2.8_@nestjs+common@11.2.8_class-transformer@0.5.1_class-validator@0.14._95fd9e9c46b5da089e26b594c4ae89c0/node_modules/@nestjs/core/router/router-execution-context.js:50:37
    at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
    at async /home/nadiasantos/www/code-review/sograi-backend/node_modules/.pnpm/@nestjs+core@11.2.8_@nestjs+common@11.2.8_class-transformer@0.5.1_class-validator@0.14._95fd9e9c46b5da089e26b594c4ae89c0/node_modules/@nestjs/core/router/router-execution-context.js:81:62
    at async /home/nadiasantos/www/code-review/sograi-backend/node_modules/.pnpm/@nestjs+core@11.2.8_@nestjs+common@11.2.8_class-transformer@0.5.1_class-validator@0.14._95fd9e9c46b5da089e26b594c4ae89c0/node_modules/@nestjs/core/router/router-proxy.js:9:17
```

### Análises Arquivadas
- Remover das ações Spec de Correção e Adicionar Pendências. 
- Não precisa remover os arquivos criados, mas eles só poderão ser utilizados com a PR Ativa.

### Geral
Questionamentos para criar uma análise mas não aplicar. Enquanto for só local isso não será um problema.

- Os arquivos .md Estão sendo salvos dentro do repositório. Existem alguma forma deles ficarem salvos no banco?
- É possível a criação de um PWA para compartilhar essa aplicação? Não sei bem como isso funciona. Ou outra forma viável e fácil.