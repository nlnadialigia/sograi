import { PlayCircle, Search, Layers, Link as LinkIcon, Radio, Bell, CheckCircle2, ListOrdered, Activity } from "lucide-react"

export function AnalysisGuideTab() {
  return (
    <div className="space-y-6">
      {/* Guia Rápido de Disparo */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <PlayCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">
              Como Disparar uma Nova Auditoria
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Duas maneiras simples e rápidas de auditar qualquer Pull Request
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Método 1: Explorador Visual */}
          <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
              <Search className="w-4 h-4 text-blue-500" />
              <span>Método 1: Navegador de Repositórios & PRs</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Ideal quando você quer explorar os repositórios da sua equipe sem precisar abrir o navegador:
            </p>
            <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-2 list-decimal list-inside pl-1">
              <li>Selecione a aba do provedor: <strong>Azure DevOps</strong> ou <strong>GitHub</strong>.</li>
              <li>Escolha o Projeto (Azure) ou Conta/Organização (GitHub).</li>
              <li>Filtre ou digite o nome do repositório no combobox inteligente.</li>
              <li>A lista de PRs abertas será carregada instantaneamente com autor, data e branches.</li>
              <li>Clique na PR desejada para preencher os campos e clique em <strong>Iniciar Auditoria</strong>.</li>
            </ol>
          </div>

          {/* Método 2: URL Direta */}
          <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
              <LinkIcon className="w-4 h-4 text-emerald-500" />
              <span>Método 2: Colar URL Direta da PR</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Ideal para quando um colega de equipe envia o link direto da PR no chat:
            </p>
            <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-2 list-decimal list-inside pl-1">
              <li>Copie a URL da PR diretamente do seu navegador.</li>
              <li>Cole no campo <strong>"Link da Pull Request"</strong>.</li>
              <li>O sistema identifica o provedor, a organização, o projeto e o ID da PR automaticamente.</li>
              <li>Clique em <strong>Iniciar Auditoria</strong>.</li>
            </ol>
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[11px] font-mono truncate">
              Ex: https://dev.azure.com/org/proj/_git/repo/pullrequest/1234
            </div>
          </div>
        </div>
      </div>

      {/* Fila de Análise e Monitoramento */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <ListOrdered className="w-4 h-4 text-amber-500" />
          Fila Inteligente (FIFO) & "Última Análise"
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
            <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-500" />
              <span>Análises Concorrentes Desbloqueadas</span>
            </p>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              O botão de análise nunca fica desabilitado para outras PRs. Caso já exista uma auditoria rodando, clicar em <strong>"Confirmar e Enfileirar"</strong> coloca a nova PR em uma fila FIFO garantida no servidor, processando-as sequencialmente sem perda de contexto.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
            <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <PlayCircle className="w-4 h-4 text-amber-500" />
              <span>Página "Última Análise"</span>
            </p>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              A tela de <strong>Nova Análise</strong> agora é dedicada exclusivamente ao formulário e descoberta de PRs. O progresso em tempo real fica na tela <strong>"Última Análise"</strong>, exibindo os pareceres parciais conforme os agentes terminam cada arquivo.
            </p>
          </div>
        </div>
      </div>

      {/* Execução em Background & Keep-Alive */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-500" />
          Execução em Segundo Plano & Notificações
        </h4>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
          Você não precisa esperar na tela de progresso. O SogrAI foi desenhado para manter o fluxo de trabalho contínuo:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
            <p className="font-semibold text-xs text-slate-900 dark:text-white mb-1">
              Navegação Livre
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Enquanto a IA audita os arquivos, você pode consultar o histórico de PRs, gerenciar pendências ou acessar o admin sem cancelar a análise.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
            <p className="font-semibold text-xs text-slate-900 dark:text-white mb-1">
              Indicador no Topbar
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Uma pílula amarela com animação de pulso no cabeçalho exibe a porcentagem exata de conclusão do processo em tempo real.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
            <p className="font-semibold text-xs text-slate-900 dark:text-white mb-1">
              Aviso com Atalho
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Ao concluir, uma notificação flutuante com o botão <strong>"Ver Parecer"</strong> surge na tela para você ir direto ao relatório final.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
