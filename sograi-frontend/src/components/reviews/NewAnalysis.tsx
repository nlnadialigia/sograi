import { useState } from "react"
import { Sparkles, Link2, AlertCircle } from "lucide-react"
import { Review, ReviewStatus, Risk } from "../../types"
import { analyzePullRequestStream, AzureOpenPr } from "../../services/api"
import { VcsPrExplorer } from "./VcsPrExplorer"
import { AnalysisConfigModal } from "./AnalysisConfigModal"
import { AnalysisProgress, PrProgressMeta, FileProgressLog } from "./AnalysisProgress"
import { AgentsOverview } from "./AgentsOverview"

interface NewAnalysisProps {
  onCreated: (review: Review) => void
  onOpenDetail?: (review: Review) => void
  onProgressChange?: (info: { running: boolean; percent: number; prId: number | null }) => void
  onOpenSettings?: () => void
}

export function NewAnalysis({
  onCreated,
  onOpenDetail,
  onProgressChange,
  onOpenSettings,
}: NewAnalysisProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalUrl, setModalUrl] = useState("")
  const [modalPrMeta, setModalPrMeta] = useState<any>(null)

  const [runningPrId, setRunningPrId] = useState<number | null>(null)
  const [progress, setProgress] = useState(0)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const [currentStepText, setCurrentStepText] = useState("")
  const [activePrMeta, setActivePrMeta] = useState<PrProgressMeta | null>(null)
  const [currentFileAnalyzing, setCurrentFileAnalyzing] = useState<string | null>(null)
  const [fileLogs, setFileLogs] = useState<FileProgressLog[]>([])

  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [completedReview, setCompletedReview] = useState<Review | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

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

  const startAnalysis = async (config: {
    prUrl: string
    mode: "unified" | "separated"
    selectedAgents: string[]
    includeTests?: boolean
  }) => {
    const prId = modalPrMeta?.pullRequestId || null
    setModalOpen(false)
    setRunning(true)
    setRunningPrId(prId)
    setDone(false)
    setProgress(5)
    onProgressChange?.({ running: true, percent: 5, prId })
    setCurrentStepText("Iniciando auditoria da Pull Request...")
    setActivePrMeta(modalPrMeta || null)
    setCurrentFileAnalyzing(null)
    setFileLogs([])
    setErrorMessage(null)

    try {
      const data = await analyzePullRequestStream(
        { prUrl: config.prUrl, mode: config.mode, includeTests: config.includeTests },
        (event, eventData) => {
          if (event === "progress") {
            if (eventData.percent) {
              setProgress(eventData.percent)
              onProgressChange?.({ running: true, percent: eventData.percent, prId })
            }
            if (eventData.step) setCurrentStepText(eventData.step)

            if (eventData.meta?.prInfo) {
              setActivePrMeta((prev) => ({ ...prev, ...eventData.meta.prInfo }))
            }
            if (eventData.meta?.currentFile) {
              setCurrentFileAnalyzing(eventData.meta.currentFile)
            }
            if (eventData.meta?.completedFile) {
              setFileLogs((prev) => [...prev, eventData.meta.completedFile])
            }
          }
        }
      )

      setProgress(100)
      setCurrentStepText("Auditoria concluída com sucesso!")
      setRunning(false)
      setRunningPrId(null)
      setCurrentFileAnalyzing(null)
      setDone(true)
      onProgressChange?.({ running: false, percent: 100, prId: null })
      setAnalysisResult(data)

      const author = data.author || "Autor"
      const initials = author
        .split(" ")
        .map((n: string) => n[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase()

      const dec = (data.status || "").toLowerCase()
      const status: ReviewStatus = dec.includes("aprovad") && !dec.includes("ressalva")
        ? "Aprovada"
        : dec.includes("reprovad")
          ? "Reprovada"
          : "Atenção"

      const r = (data.risk || "").toLowerCase()
      const risk: Risk = r.includes("alt")
        ? "Alto"
        : r.includes("méd") || r.includes("med")
          ? "Médio"
          : "Baixo"

      const newReview: Review = {
        id: `REV-${data.id || Date.now()}`,
        dbId: Number(data.id),
        pr: String(data.pr || "PR"),
        title: data.title || "Revisão de Pull Request",
        repository: data.repository || "repo",
        author,
        authorAvatar: "",
        authorInitials: initials,
        date: new Date().toLocaleDateString("pt-BR"),
        status,
        risk,
        blockers: 0,
        warnings: 0,
        suggestions: 0,
        notes: 0,
        archived: false,
        executiveSummary: data.executiveText || data.executiveContent,
        filesCount: data.filesCount,
        filesWithIssues: (data.files || []).filter((f: any) => f.verdict === "REPROVADO").length,
      }

      setCompletedReview(newReview)
      onCreated(newReview)
    } catch (err: any) {
      setRunning(false)
      setRunningPrId(null)
      setCurrentFileAnalyzing(null)
      onProgressChange?.({ running: false, percent: 0, prId: null })
      setErrorMessage(err.message || "Erro inesperado ao analisar a PR.")
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {!running && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Revisão de Pull Request
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
            runningPrId={runningPrId}
            onAnalyze={openModalForPr}
            onOpenSettings={onOpenSettings}
          />

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-rose-500 hover:underline font-medium ml-2 cursor-pointer"
              >
                Dispensar
              </button>
            </div>
          )}
        </div>
      )}

      {/* Card de Progresso com Metadados da PR e Log em Tempo Real */}
      <AnalysisProgress
        running={running}
        done={done}
        progress={progress}
        currentStepText={currentStepText}
        prMeta={activePrMeta}
        fileLogs={fileLogs}
        currentFileAnalyzing={currentFileAnalyzing}
        analysisResult={analysisResult}
        parsedExec={{
          justification: analysisResult?.executiveText || "",
          blockers: [],
          suggestions: [],
        }}
        issuesCount={{ blockers: 0, warnings: 0, suggestions: 0 }}
        onViewDetail={() => {
          if (completedReview && onOpenDetail) {
            onOpenDetail(completedReview)
          }
        }}
      />

      {!running && <AgentsOverview />}

      <AnalysisConfigModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialUrl={modalUrl}
        prMeta={modalPrMeta}
        onStartAnalysis={startAnalysis}
        isSubmitting={running}
      />
    </div>
  )
}
