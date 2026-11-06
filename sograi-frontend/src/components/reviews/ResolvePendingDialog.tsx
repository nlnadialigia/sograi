import { useState } from "react"
import { CheckCircle2, X } from "lucide-react"

interface ResolvePendingDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (notes?: string) => void
  title: string
  filePath?: string
}

export function ResolvePendingDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  filePath,
}: ResolvePendingDialogProps) {
  const [notes, setNotes] = useState("")

  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm(notes.trim() || undefined)
    setNotes("")
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/40 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="space-y-1 flex-1 min-w-0">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Marcar Pendência como Resolvida
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Confirma a resolução de <strong className="text-slate-800 dark:text-slate-200">{title}</strong>
              {filePath && <span className="block font-mono text-[11px] text-slate-500 mt-0.5 truncate">{filePath}</span>}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
            Nota de resolução (opcional)
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ex: Corrigido no commit abc1234, refatorado para usar o novo serviço..."
            className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="mt-5 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 transition-colors cursor-pointer shadow-xs"
          >
            Confirmar Resolução
          </button>
        </div>
      </div>
    </div>
  )
}
