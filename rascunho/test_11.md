# Teste 11: Ajustes de Usabilidade, Layout e Correções de UI

## Contexto

Ajustes levantados para refinamento do MVP do SogrAI:

1. **Tabela de PR's**:
   - A altura mínima da tabela ainda ficou pequena. Definir como tamanho mínimo a altura da página para preencher a tela confortavelmente e evitar problemas de rolagem.

2. **Modal de Adicionar Pendência**:
   - Correção na digitação do textarea de pendências.
   - Restauração do placeholder e da instrução explicativa de como digitar as tasks (formato multi-linhas com hífen, onde cada linha é salva como uma pendência individual).

3. **Modal de Edição de Pendência**:
   - O campo "Arquivo Afetado" deve ser somente leitura/exibição do nome do arquivo, e não um campo input de texto editável.

4. **Gestão de Pendências (ID da PR)**:
   - Na adição de pendências aberta a partir da tela de Gestão de Pendências, o ID da PR estava chegando como `undefined` e, consequentemente, não carregava a listagem de arquivos da PR.

5. **Card de Conclusão da Nova Revisão**:
   - Após a revisão, exibir exclusivamente o card de "Auditoria Concluída com Sucesso!" acompanhado das badges de **Status** e **Risco**, além do botão direto para "Ver Detalhe do Parecer", eliminando os cards secundários de justificativa e apontamentos na tela de progresso.

6. **Seletor de Projeto Azure**:
   - Não trazer nenhum projeto Azure selecionado por padrão. Exibir a opção inicial "Selecione um projeto..." para que o usuário escolha explicitamente.
