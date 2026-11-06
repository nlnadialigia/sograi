import * as React from "react"
import { AlertTriangle, AlertCircle, Info } from "lucide-react"

export interface AlertDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: "danger" | "warning" | "info"
}

export function AlertDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Excluir Definitivamente",
  cancelText = "Cancelar",
  variant = "danger",
}: AlertDialogProps) {
  if (!isOpen) return null

  const isDanger = variant === "danger"
  const isWarning = variant === "warning"

  const Icon = isDanger ? AlertTriangle : isWarning ? AlertCircle : Info

  const iconClasses = isDanger
    ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200/50 dark:border-rose-900/40"
    : isWarning
      ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/40"
      : "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200/50 dark:border-blue-900/40"

  const confirmBtnClasses = isDanger
    ? "text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 dark:bg-rose-600/30 dark:hover:bg-rose-600/40 dark:text-rose-300 dark:border dark:border-rose-500/40"
    : isWarning
      ? "text-slate-950 bg-amber-500 hover:bg-amber-400 active:bg-amber-600"
      : "text-white bg-blue-600 hover:bg-blue-700"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${iconClasses}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="space-y-1.5 flex-1 min-w-0">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {title}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer ${confirmBtnClasses}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
