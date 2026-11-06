import React from "react"

interface TrackingViewProps {
  trackingItems: any[]
}

export function DetailTrackingView({ trackingItems }: TrackingViewProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Rastreio de Pendências e Resoluções entre Iterações
        </h3>
        <span className="text-xs text-slate-500">Auditoria automática de conformidade</span>
      </div>

      {trackingItems.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-500">
          Nenhuma pendência prévia registrada para esta PR.
        </div>
      ) : (
        <div className="space-y-3">
          {trackingItems.map((item: any) => {
            const isResolved = item.current_status === "RESOLVED"
            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border text-xs space-y-2 ${
                  isResolved
                    ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-900/40"
                    : "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200/60 dark:border-rose-900/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold text-slate-900 dark:text-white">
                    {item.file_path}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                      isResolved
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300"
                        : "bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300"
                    }`}
                  >
                    {isResolved ? "✓ Corrigido" : "Pendente"}
                  </span>
                </div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {item.initial_issue_title}
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                  {item.initial_issue_description}
                </p>
                {item.resolution_notes && (
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold pt-1">
                    Nota de resolução: {item.resolution_notes}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
