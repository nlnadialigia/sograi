import React from "react"
import { ShieldAlert, Lightbulb, Check } from "lucide-react"

interface ExecutiveViewProps {
  fullPr: any
  review: any
  blockers: any[]
  warnings: any[]
}

export function DetailExecutiveView({ fullPr, review, blockers, warnings }: ExecutiveViewProps) {
  return (
    <>
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Resumo Executivo Estruturado
        </h3>
        <span className="text-xs text-slate-500">Tomada de decisão imediata</span>
      </div>

      <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-2">
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Síntese da Mudança
        </p>
        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          {fullPr?.change_summary || fullPr?.executive_summary || review.executiveSummary || "Análise executiva completa realizada."}
        </p>
        {fullPr?.recommendation && (
          <div className="pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
              💡 Recomendação: {fullPr.recommendation}
            </p>
          </div>
        )}
      </div>

      {blockers.length > 0 && (
        <div className="space-y-2 pt-2">
          <p className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4" /> Bloqueadores Críticos ({blockers.length})
          </p>
          {blockers.map((b, i) => (
            <div
              key={i}
              className="p-3.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 text-xs space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 font-mono text-[11px] font-semibold">
                  {b.filePath}
                </span>
                {b.lineReference && <span className="text-[10px] text-rose-500 font-mono">{b.lineReference}</span>}
              </div>
              <p className="font-semibold text-rose-900 dark:text-rose-200">{b.title}</p>
              <p className="text-rose-800/90 dark:text-rose-300/90">{b.description}</p>
              {b.suggestedCode && (
                <pre className="mt-2 p-2 rounded bg-black/10 dark:bg-black/30 font-mono text-[10px] text-rose-950 dark:text-rose-200 overflow-x-auto">
                  {b.suggestedCode}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}

      {warnings.length > 0 && (
        <div className="space-y-2 pt-2">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4" /> Pontos de Atenção & Qualidade ({warnings.length})
          </p>
          {warnings.map((s, i) => (
            <div
              key={i}
              className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40 text-xs space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 font-mono text-[11px] font-semibold">
                  {s.filePath}
                </span>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[10px] font-semibold border border-amber-500/20">
                    <Check className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    <span>Registrado em Pendências</span>
                  </span>
                  <span className="text-[10px] font-bold text-amber-600 uppercase">{s.category}</span>
                </div>
              </div>
              <p className="font-semibold text-amber-900 dark:text-amber-200">{s.title}</p>
              <p className="text-amber-800/90 dark:text-amber-300/90">{s.description}</p>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
