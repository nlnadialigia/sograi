import { BookmarkCheck, History, CheckCircle2, AlertOctagon, RotateCw, PlusCircle, Wrench, FileCode, MoreVertical } from "lucide-react"

export function PendingGuideTab() {
  return (
    <div className="space-y-6">
      {/* Apresentação do Painel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <BookmarkCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">
              Gestão de Pendências Focada no Arquivo
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Acompanhamento contínuo da saúde técnica de cada arquivo do seu repositório
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Rastreamento Automático */}
          <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
              <RotateCw className="w-4 h-4 text-blue-500" />
              <span>1. Rastreamento e Resolução Integrada</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              O SogrAI permite resolver débitos técnicos tanto na tela de gestão quanto diretamente no Parecer:
            </p>
            <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2 list-disc list-inside pl-1">
              <li>
                <strong className="text-emerald-600 dark:text-emerald-400">Direto no Detalhe:</strong> Na aba de Rastreamento de Pendências da PR, clique em <em>Resolver</em> para adicionar notas e encerrar o débito.
              </li>
              <li>
                <strong className="text-blue-600 dark:text-blue-400">Menu de Ações (⋮):</strong> No card de pendências, o menu de 3 pontinhos permite marcar como resolvido, editar ou excluir sem poluição visual.
              </li>
              <li>
                <strong className="text-amber-600 dark:text-amber-400">Notas de Resolução:</strong> Toda resolução armazena quem resolveu e as notas explicativas para auditoria futura.
              </li>
            </ul>
          </div>

          {/* Débito Técnico Manual */}
          <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
              <Wrench className="w-4 h-4 text-purple-500" />
              <span>2. Apontamento por Arquivo</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              O foco da gestão é na integridade do código e não em PRs temporárias:
            </p>
            <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2 list-disc list-inside pl-1">
              <li>
                Clique em <strong>+ Adicionar Pendência</strong> e selecione a PR para carregar seus arquivos alterados.
              </li>
              <li>
                Defina o tipo: <span className="font-semibold text-purple-600 dark:text-purple-400">Débito Técnico</span>, <span className="font-semibold text-blue-600 dark:text-blue-400">Melhoria</span> ou <span className="font-semibold text-cyan-600 dark:text-cyan-400">Refatoração Futura</span>.
              </li>
              <li>
                O card exibe o <strong>nome do arquivo em destaque</strong> e o caminho de pastas abaixo, garantindo leitura perfeita mesmo para caminhos longos.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Ciclo de Vida da Pendência */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <History className="w-4 h-4 text-amber-500" />
          Status das Pendências no Painel
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40">
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200/80 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 mb-1.5">
              PENDENTE
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              O débito técnico foi cadastrado para o arquivo e ainda requer ação da equipe de engenharia.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40">
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-200/80 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 mb-1.5">
              RESOLVIDO
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              A melhoria foi aplicada no repositório com nota explicativa de resolução documentada.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
