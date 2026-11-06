import { PendingQueueItem } from "./pending-types"
import { FileCode, Trash2 } from "lucide-react"

interface PendingQueueListProps {
  queue: PendingQueueItem[]
  onRemove: (id: string) => void
}

export function PendingQueueList({ queue, onRemove }: PendingQueueListProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
        <span>Fila de Pendências a Salvar ({queue.length}):</span>
        {queue.length > 0 && (
          <span className="text-[11px] text-emerald-600 font-bold">✓ Pronto para salvar</span>
        )}
      </div>

      {queue.length === 0 ? (
        <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
          Nenhuma pendência na fila. Adicione acima para compor o lote.
        </div>
      ) : (
        <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
          {queue.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs flex items-start justify-between gap-3 shadow-xs"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <FileCode className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="font-mono font-bold text-slate-900 dark:text-white truncate">
                    {item.filePath}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {item.itemType}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-amber-500/10 text-amber-600">
                    {item.priority}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap pl-5 text-[11px]">
                  {item.description}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onRemove(item.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors shrink-0"
                title="Remover da fila"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
