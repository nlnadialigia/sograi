import { BookmarkCheck, History, CheckCircle2, AlertOctagon, RotateCw, PlusCircle, Wrench } from "lucide-react"

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
              Gestão de Pendências & Débito Técnico
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Controle absoluto sobre apontamentos automáticos e dívidas técnicas registradas
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Rastreamento Automático */}
          <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
              <RotateCw className="w-4 h-4 text-blue-500" />
              <span>1. Rastreamento Automático em Reanálises</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              O SogrAI não esquece o que apontou. Quando você reanalisa uma Pull Request após fazer ajustes no código:
            </p>
            <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2 list-disc list-inside pl-1">
              <li>
                <strong className="text-emerald-600 dark:text-emerald-400">Item Resolvido:</strong> Se a vulnerabilidade ou problema foi corrigido, o status passa automaticamente para resolvido.
              </li>
              <li>
                <strong className="text-rose-600 dark:text-rose-400">Regressão:</strong> Se um defeito corrigido voltar em novos commits, o sistema detecta e emite alerta de regressão.
              </li>
              <li>
                <strong className="text-amber-600 dark:text-amber-400">Histórico de Iterações:</strong> O sistema mantém registrado em qual iteração cada item foi identificado e sanado.
              </li>
            </ul>
          </div>

          {/* Débito Técnico Manual */}
          <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
              <Wrench className="w-4 h-4 text-purple-500" />
              <span>2. Apontamento Manual de Dívida Técnica</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Nem toda melhoria precisa bloquear a entrega imediata. O time pode acordar dívidas técnicas conscientes:
            </p>
            <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2 list-disc list-inside pl-1">
              <li>
                Clique em <strong>+ Nova Pendência Manual</strong> na aba de Pendências.
              </li>
              <li>
                Defina o tipo: <em>Débito Técnico</em>, <em>Melhoria</em> ou <em>Refatoração Futura</em>.
              </li>
              <li>
                Informe a prioridade (Baixa, Média, Alta), arquivo afetado e autor responsável.
              </li>
              <li>
                Quando a dívida for quitada em uma sprint posterior, marque como <strong>Resolvida</strong> com notas de resolução.
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40">
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200/80 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 mb-1.5">
              PENDENTE
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              O item foi identificado na auditoria ou cadastrado pelo time e ainda requer ação dos desenvolvedores.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40">
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-200/80 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 mb-1.5">
              RESOLVIDO
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              O problema foi corrigido no código e confirmado na reanálise ou finalizado manualmente com documentação.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-900/40">
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-purple-200/80 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 mb-1.5">
              REGRESSÃO
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              O problema havia sido solucionado em iterações anteriores, mas foi reintroduzido em alterações recentes da PR.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
