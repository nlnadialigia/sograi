import { GitPullRequest, User, Clock, AlertTriangle } from "lucide-react"
import { PendingHistoryEntry } from "../../types"

interface PendingHistoryListProps {
  history: PendingHistoryEntry[]
}

export function PendingHistoryList({ history }: PendingHistoryListProps) {
  if (!history || history.length === 0) {
    return (
      <div className="py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-center text-xs text-slate-400">
        Nenhuma subida adicional de PR registrada para esta pendência.
      </div>
    )
  }

  return (
    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
          <span>Subidas de PR que mantiveram o veredito reprovado ({history.length}):</span>
        </span>
      </div>

      <div className="space-y-2">
        {history.map((entry) => {
          const dateStr = entry.unresolved_at
            ? new Date(entry.unresolved_at).toLocaleString("pt-BR", {
                dateStyle: "short",
                timeStyle: "short",
              })
            : "Data n/d"

          return (
            <div
              key={entry.id}
              className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/40 text-xs space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 font-mono font-bold text-rose-700 dark:text-rose-400 bg-rose-100/60 dark:bg-rose-900/40 px-1.5 py-0.5 rounded text-[11px]">
                    <GitPullRequest className="w-3 h-3" />
                    PR #{entry.pull_request_id}
                  </span>
                  {entry.iteration > 1 && (
                    <span className="text-[10px] text-slate-500 font-medium">
                      (Iteração {entry.iteration})
                    </span>
                  )}
                  {entry.author && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300">
                      <User className="w-3 h-3 text-slate-400" />
                      {entry.author}
                    </span>
                  )}
                </div>

                <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                  <Clock className="w-3 h-3" />
                  {dateStr}
                </span>
              </div>

              {entry.pr_title && (
                <p className="font-medium text-slate-800 dark:text-slate-200 text-[11px] line-clamp-1">
                  {entry.pr_title}
                </p>
              )}

              {entry.justification && (
                <p className="text-[11px] text-slate-600 dark:text-slate-400 italic bg-white/60 dark:bg-slate-900/40 p-2 rounded-lg border border-rose-100 dark:border-rose-900/30">
                  "{entry.justification}"
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
