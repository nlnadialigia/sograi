import { CheckCircle2, Loader2, GitPullRequest, FileCode, AlertTriangle, CheckCircle } from "lucide-react"
import { analysisSteps } from "../../data/constants"
import { AnalysisResultCard } from "./AnalysisResultCard"

export interface PrProgressMeta {
  pullRequestId?: number | string
  repository?: string
  title?: string
  author?: string
  totalFiles?: number
}

export interface FileProgressLog {
  filePath: string
  changeType?: string
  verdict: "APROVADO" | "REPROVADO"
  justification?: string
  issuesCount?: number
}

interface AnalysisProgressProps {
  running: boolean
  done: boolean
  progress: number
  currentStepText: string
  prMeta?: PrProgressMeta | null
  fileLogs?: FileProgressLog[]
  currentFileAnalyzing?: string | null
  analysisResult: any
  parsedExec: any
  issuesCount: any
  onViewDetail?: () => void
}

export function AnalysisProgress({
  running,
  done,
  progress,
  currentStepText,
  prMeta,
  fileLogs = [],
  currentFileAnalyzing,
  analysisResult,
  parsedExec,
  issuesCount,
  onViewDetail,
}: AnalysisProgressProps) {
  if (!running && !done) return null
  const currentStep = Math.min(Math.floor(progress / 26), 3)

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5 animate-in fade-in duration-300">
      {/* Card de Identificação da PR Sendo Analisada */}
      {prMeta && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                PR #{prMeta.pullRequestId}
              </span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className="font-mono font-semibold text-slate-700 dark:text-slate-300 bg-amber-500/20 px-1.5 py-0.5 rounded">
                {prMeta.repository}
              </span>
              {prMeta.totalFiles && (
                <>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <span className="text-slate-500">{prMeta.totalFiles} arquivos</span>
                </>
              )}
            </div>
            <p className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">
              {prMeta.title}
            </p>
          </div>
          {prMeta.author && (
            <div className="text-right sm:text-right text-xs text-slate-500 dark:text-slate-400 shrink-0">
              <span>Autor: </span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {prMeta.author}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Cabeçalho de Status e Porcentagem */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {done ? (
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          )}
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {done ? "Análise Concluída" : "Processando Pipeline de Revisão"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {currentStepText || analysisSteps[currentStep]}
            </p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
          {progress}%
        </span>
      </div>

      {/* Grid com os 4 Cards de Etapa do Pipeline */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {analysisSteps.map((step, idx) => {
          const isDone = done || progress >= (idx + 1) * 25
          const isCurrent = running && progress >= idx * 25 && progress < (idx + 1) * 25

          return (
            <div
              key={idx}
              className={`p-3 rounded-xl border text-xs transition-all duration-200 ${
                isDone
                  ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                  : isCurrent
                  ? "bg-amber-500/10 border-amber-500/40 text-amber-700 dark:text-amber-300 ring-1 ring-amber-500/20"
                  : "bg-slate-50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800 text-slate-400 dark:text-slate-500"
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold mb-1">
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-3.5 h-3.5 text-amber-500 animate-spin shrink-0" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-current opacity-40 shrink-0 flex items-center justify-center text-[9px]">
                    {idx + 1}
                  </div>
                )}
                <span className="text-[11px] uppercase tracking-wide">
                  Etapa {idx + 1}
                </span>
              </div>
              <p className="font-semibold text-slate-800 dark:text-slate-200 text-[11px] leading-tight line-clamp-2">
                {step}
              </p>
            </div>
          )
        })}
      </div>

      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
        <div
          className="bg-amber-500 h-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Arquivo Atualmente em Análise */}
      {running && currentFileAnalyzing && (
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center gap-2.5 text-xs">
          <Loader2 className="w-3.5 h-3.5 text-amber-500 animate-spin shrink-0" />
          <span className="text-slate-500">Avaliando arquivo agora:</span>
          <span className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate">
            {currentFileAnalyzing}
          </span>
        </div>
      )}

      {/* Feed / Log de Arquivos Concluídos em Tempo Real */}
      {fileLogs.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
            <span>Arquivos Auditados em Tempo Real ({fileLogs.length}):</span>
          </div>
          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
            {fileLogs.map((log, idx) => {
              const isApproved = log.verdict === "APROVADO"
              return (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs flex items-center justify-between gap-3 animate-in fade-in"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {isApproved ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    )}
                    <span className="font-mono text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {log.filePath}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isApproved
                          ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
                          : "bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300"
                      }`}
                    >
                      {log.verdict}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {done && analysisResult && (
        <AnalysisResultCard
          analysisResult={analysisResult}
          parsedExec={parsedExec}
          issuesCount={issuesCount}
          onViewDetail={onViewDetail}
        />
      )}
    </div>
  )
}
