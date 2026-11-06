import { StatusBadge, RiskBadge } from "../common/Badges"
import { CheckCircle2, Eye, ArrowRight } from "lucide-react"

interface AnalysisResultCardProps {
  analysisResult: any
  parsedExec?: any
  issuesCount?: any
  onViewDetail?: () => void
}

export function AnalysisResultCard({
  analysisResult,
  onViewDetail,
}: AnalysisResultCardProps) {
  const statusStr = (analysisResult.status || "").toLowerCase()
  const status = statusStr.includes("aprovad")
    ? "Aprovada"
    : statusStr.includes("reprovad")
      ? "Reprovada"
      : "Atenção"

  const riskStr = (analysisResult.risk || "").toLowerCase()
  const risk = riskStr.includes("alt")
    ? "Alto"
    : riskStr.includes("med")
      ? "Médio"
      : "Baixo"

  return (
    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                Auditoria Concluída com Sucesso!
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                PR #{analysisResult.pr || analysisResult.prId}
              </span>
              <StatusBadge status={status} />
              <RiskBadge risk={risk} />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1 line-clamp-1">
              {analysisResult.title || "Revisão de Pull Request"}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {analysisResult.repository} • Autor: {analysisResult.author || "Não informado"}
            </p>
          </div>
        </div>

        {onViewDetail && (
          <button
            onClick={onViewDetail}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/15 transition-all cursor-pointer shrink-0"
          >
            <Eye className="w-4 h-4" />
            <span>Ver Detalhe do Parecer</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
