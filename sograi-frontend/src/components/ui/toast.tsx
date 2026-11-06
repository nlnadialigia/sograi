import React, { createContext, useContext, useState, useCallback } from "react"
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react"

export type ToastVariant = "success" | "error" | "info" | "warning"

export interface ToastItem {
  id: string
  title?: string
  message: string
  variant?: ToastVariant
  duration?: number
}

interface ToastContextType {
  toast: (item: Omit<ToastItem, "id"> | string) => void
  success: (message: string, title?: string) => void
  error: (message: string, title?: string) => void
  info: (message: string, title?: string) => void
  warning: (message: string, title?: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback(
    (item: Omit<ToastItem, "id"> | string) => {
      const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const normalized: ToastItem =
        typeof item === "string"
          ? { id, message: item, variant: "info", duration: 4000 }
          : { id, variant: "info", duration: 4000, ...item }

      setToasts((prev) => [...prev, normalized])

      if (normalized.duration !== Infinity) {
        setTimeout(() => {
          removeToast(id)
        }, normalized.duration || 4000)
      }
    },
    [removeToast]
  )

  const success = useCallback(
    (message: string, title?: string) => {
      addToast({ message, title, variant: "success" })
    },
    [addToast]
  )

  const error = useCallback(
    (message: string, title?: string) => {
      addToast({ message, title, variant: "error" })
    },
    [addToast]
  )

  const info = useCallback(
    (message: string, title?: string) => {
      addToast({ message, title, variant: "info" })
    },
    [addToast]
  )

  const warning = useCallback(
    (message: string, title?: string) => {
      addToast({ message, title, variant: "warning" })
    },
    [addToast]
  )

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error, info, warning }}>
      {children}
      {/* Container de Toasts flutuantes */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => {
          const isSuccess = t.variant === "success"
          const isError = t.variant === "error"
          const isWarning = t.variant === "warning"

          const Icon = isSuccess
            ? CheckCircle2
            : isError
              ? AlertCircle
              : isWarning
                ? AlertTriangle
                : Info

          const borderColor = isSuccess
            ? "border-emerald-500/40"
            : isError
              ? "border-rose-500/40"
              : isWarning
                ? "border-amber-500/40"
                : "border-slate-200 dark:border-slate-700"

          const iconColor = isSuccess
            ? "text-emerald-500"
            : isError
              ? "text-rose-500"
              : isWarning
                ? "text-amber-500"
                : "text-blue-500"

          return (
            <div
              key={t.id}
              className={`pointer-events-auto p-3.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border ${borderColor} shadow-xl text-xs flex items-start gap-3 animate-in slide-in-from-bottom-3 fade-in duration-200`}
            >
              <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${iconColor}`} />
              <div className="flex-1 min-w-0">
                {t.title && (
                  <h4 className="font-bold text-slate-900 dark:text-white leading-tight mb-0.5">
                    {t.title}
                  </h4>
                )}
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                  {t.message}
                </p>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast deve ser utilizado dentro de um ToastProvider")
  }
  return context
}
