import { useState } from "react"
import { Sparkles, Link2, Info } from "lucide-react"
import { AzureOpenPr } from "../../services/api"
import { VcsPrExplorer } from "./VcsPrExplorer"
import { AnalysisConfigModal } from "./AnalysisConfigModal"
import { AgentsOverview } from "./AgentsOverview"

interface NewAnalysisProps {
  onStartAnalysis: (config: {
    prUrl: string
    mode: "unified" | "separated"
    selectedAgents: string[]
    includeTests?: boolean
    prMeta?: any
  }) => void
  running?: boolean
  runningPrId?: number | null
  onOpenSettings?: () => void
}

export function NewAnalysis({
  onStartAnalysis,
  running,
  runningPrId,
  onOpenSettings,
}: NewAnalysisProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalUrl, setModalUrl] = useState("")
  const [modalPrMeta, setModalPrMeta] = useState<any>(null)

  const openModalForPr = (pr: AzureOpenPr) => {
    setModalUrl(pr.azureUrl || (pr as any).githubUrl || "")
    setModalPrMeta({
      pullRequestId: pr.pullRequestId,
      title: pr.title,
      repository: pr.repository,
      author: pr.author,
    })
    setModalOpen(true)
  }

  const openModalManual = () => {
    setModalUrl("")
    setModalPrMeta(null)
    setModalOpen(true)
  }

  const handleStart = (config: {
    prUrl: string
    mode: "unified" | "separated"
    selectedAgents: string[]
    includeTests?: boolean
  }) => {
    setModalOpen(false)
    onStartAnalysis({
      ...config,
      prMeta: modalPrMeta,
    })
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {running && (
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2.5">
          <Info className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            Uma auditoria já está em andamento. Ao iniciar outra análise agora, ela será enfileirada e executada logo em seguida.
          </span>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Nova Revisão de Pull Request
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Selecione projetos e repositórios no Azure DevOps / GitHub ou cole uma URL direta
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openModalManual}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Link2 className="w-3.5 h-3.5 text-amber-500" />
            <span>Colar URL avulsa</span>
          </button>
        </div>

        <VcsPrExplorer
          runningPrId={runningPrId || null}
          onAnalyze={openModalForPr}
          onOpenSettings={onOpenSettings}
        />
      </div>

      <AgentsOverview />

      <AnalysisConfigModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialUrl={modalUrl}
        prMeta={modalPrMeta}
        onStartAnalysis={handleStart}
        isSubmitting={false}
        isQueued={running}
      />
    </div>
  )
}
