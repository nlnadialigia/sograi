## Contexto

Atualmente, os relatórios em Markdown gerados pela SogrAI (Relatório Executivo, Spec de Correção e Parecer Completo) são gravados diretamente como arquivos estáticos no disco local na pasta `sograi-backend/results/`.

### Necessidade

Migrar a persistência dos arquivos `.md` inteiramente para o banco de dados PostgreSQL:
1. Eliminar a dependência de arquivos salvos em disco dentro do repositório local.
2. Permitir que cada usuário/instância armazene seus próprios relatórios e specs diretamente em suas tabelas no banco de dados.
3. Tornar o download e visualização dos relatórios (.md) independentes de I/O em arquivos locais.

### Entregáveis Esperados

1. **Diagnóstico Técnico**: Levantamento completo da estrutura de dados, migração de schema no PostgreSQL, alterações no backend NestJS e compatibilidade com o frontend em `rascunho/diagnostico_feature_03.md`.
2. **Plano de Implementação**: Passos detalhados para execução sem quebrar o histórico existente e mantendo todos os arquivos com menos de 350 linhas.
