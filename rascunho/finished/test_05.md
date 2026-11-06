## Contexto

Novos ajustes:

## Interface de Progresso
- Devolver o card por etapa. Acho ele bem interessante. Inclusive, descreva o que significada cada etapa dela no arquivo de diagnóstico.

### Modal de Adicionar Pendência
- poder digitar o nome do arquivo
- remover o input de título
- No textarea como devo salvar para que cada item seja uma pendência? Inluir a orientação depois do título do textarea.
- Tentei salvar um pendência e recebi um erro:
`[Nest] 58945  - 11/04/2026, 1:22:37 PM   ERROR [ExceptionsHandler] Error: O caminho do arquivo modificado (filePath) é obrigatório.`

### Backend
- Coloquei uma PR para analisar com 31 arquivos. na contagem está aparecendo [1/15]... Tem alguma limitação? Se sim, preciso que suba para até 40 arquivos.
- Se eu mudar de interface a análise é interrompida? Fiquei com essa dúvida.

### Prompt
Vamos começar a refinar um pouco mais o prompt. Vou descrever alguns passos e você analisar a melhor forma. Faça todas as perguntas que julgar necessárias para o melhor entendimento.

- Análise dos arquivos de teste como opcional -> Será necessária incluir essa opção no modal de Análise, sendo o default `False`;
- Arquivos de testes reprovados não deverão reprovar a PR
- Não analisar arquivos .md
- A limitação de arquivos para a PR são 40 arquivos, não contando os .md.

Crie um arquivo de diagnóstico. Faça todas as perguntas que julgar necessárias para melhor entendimento do processo.
