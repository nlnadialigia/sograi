import React from "react"

interface DetailCategoryIssuesViewProps {
  selected: string
  categoryIssues: any[]
}

export function DetailCategoryIssuesView({
  selected,
  categoryIssues,
}: DetailCategoryIssuesViewProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Apontamentos Estruturados: {selected}
        </h3>
        <span className="text-xs text-slate-500">
          {categoryIssues.length} itens identificados
        </span>
      </div>

      {categoryIssues.length === 0 ? (
        <div className="py-10 text-center text-xs text-slate-500 dark:text-slate-400">
          Nenhum problema de {selected.toLowerCase()} identificado nos arquivos desta PR.
        </div>
      ) : (
        <div className="space-y-3">
          {categoryIssues.map((iss, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 text-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                  {iss.filePath}
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {iss.severity}
                </span>
              </div>
              <p className="font-semibold text-slate-900 dark:text-white">{iss.title}</p>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{iss.description}</p>
              {iss.suggestedCode && (
                <pre className="p-2 rounded bg-slate-100 dark:bg-slate-950 font-mono text-[10px] overflow-x-auto text-amber-600 dark:text-amber-400">
                  {iss.suggestedCode}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
