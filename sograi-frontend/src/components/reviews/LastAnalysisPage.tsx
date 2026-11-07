import React from "react"
import { Activity, AlertCircle, ArrowRight, PlusCircle, CheckCircle2 } from "lucide-react"
import { Review } from "../../types"
import { AnalysisProgress, PrProgressMeta, FileProgressLog } from "./AnalysisProgress"

interface LastAnalysisPageProps {
  running: boolean
  done: boolean
  progress: number
  currentStepText: string
  activePrMeta: PrProgressMeta | null
  fileLogs: FileProgressLog[]
  currentFileAnalyzing: string | null
  analysisResult: any
  completedReview: Review | null
  errorMessage: string | null
  onClearError: () => void
  onOpenDetail?: (review: Review) => void
  onGoToNew: () => void
}

export function LastAnalysisPage({
  running,
  done,
  progress,
  currentStepText,
  activePrMeta,
  fileLogs,
  currentFileAnalyzing,
  analysisResult,
  completedReview,
  errorMessage,
  onClearError,
  onOpenDetail,
  onGoToNew,
}: LastAnalysisPageProps) {
  const hasContent = running || done || !!activePrMeta

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {running ? "Análise em Andamento" : "Última Análise"}
              </h2>
              {running && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Em execução ({progress}%)
                </span>
              )}
              {done && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                  <CheckCircle2 className="w-3 h-3" />
                  Concluída
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {running
                ? "Acompanhe em tempo real o processamento e a emissão dos pareceres pelos agentes da SogrAI"
                : "Resultado consolidado e logs da auditoria mais recente desta sessão"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onGoToNew}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer self-start sm:self-auto shrink-0"
        >
          <PlusCircle className="w-3.5 h-3.5 text-amber-500" />
          <span>Nova Análise</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={onClearError}
            className="text-rose-500 hover:underline font-medium ml-2 cursor-pointer"
          >
            Dispensar
          </button>
        </div>
      )}

      {/* Se houver análise ativa ou recente */}
      {hasContent ? (
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
      ) : (
        /* Empty State */
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 border border-slate-200/80 dark:border-slate-800 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <Activity className="w-7 h-7" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Nenhuma análise em andamento ou recente
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Inicie uma nova revisão de Pull Request para acompanhar aqui o progresso em tempo real, os pareceres de cada arquivo e o resultado executivo final.
            </p>
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={onGoToNew}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <span>Ir para Nova Análise</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
