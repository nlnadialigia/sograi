import React, { useState, useEffect } from "react"
import { CheckCircle2, Check } from "lucide-react"
import { useToast } from "../ui/toast"
import { ResolvePendingDialog } from "./ResolvePendingDialog"

interface TrackingViewProps {
  trackingItems: any[]
  onItemResolved?: (id: number, notes?: string) => void
}

export function DetailTrackingView({ trackingItems: initialItems, onItemResolved }: TrackingViewProps) {
  const [items, setItems] = useState<any[]>(initialItems || [])
  const [resolvingItem, setResolvingItem] = useState<any | null>(null)
  const toast = useToast()

  useEffect(() => {
    setItems(initialItems || [])
  }, [initialItems])

  const handleConfirmResolve = async (notes?: string) => {
    if (!resolvingItem?.id) return

    try {
      const res = await fetch(`/api/tracking-items/${resolvingItem.id}/resolve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || "Falha ao resolver pendência.")
      }

      setItems((prev) =>
        prev.map((it) =>
          it.id === resolvingItem.id
            ? {
                ...it,
                current_status: "RESOLVED",
                resolution_notes: notes || "Resolvido manualmente pelo usuário.",
                resolved_at: new Date().toISOString(),
              }
            : it
        )
      )

      toast.success("Pendência de acompanhamento marcada como resolvida!")
      onItemResolved?.(resolvingItem.id, notes)
    } catch (err: any) {
      toast.error(err.message || "Erro ao resolver pendência.")
    } finally {
      setResolvingItem(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Rastreio de Pendências e Resoluções entre Iterações
          </h3>
          <p className="text-xs text-slate-500">Auditoria de conformidade e acompanhamento de itens</p>
        </div>
        <span className="text-xs text-slate-500 font-medium">
          {items.filter((i) => i.current_status === "RESOLVED").length}/{items.length} resolvidas
        </span>
      </div>

      {items.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-500">
          Nenhuma pendência prévia registrada para esta PR.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item: any) => {
            const isResolved = item.current_status === "RESOLVED"
            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border text-xs space-y-2 transition-all ${
                  isResolved
                    ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-900/40"
                    : "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200/60 dark:border-rose-900/40"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] font-bold text-slate-900 dark:text-white truncate">
                    {item.file_path}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                        isResolved
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300"
                          : "bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300"
                      }`}
                    >
                      {isResolved ? "✓ Corrigido" : "Pendente"}
                    </span>
                    {!isResolved && (
                      <button
                        type="button"
                        onClick={() => setResolvingItem(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer"
                        title="Marcar pendência como resolvida"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Resolver
                      </button>
                    )}
                  </div>
                </div>

                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {item.initial_issue_title}
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                  {item.initial_issue_description}
                </p>

                {item.resolution_notes && (
                  <div className="pt-1.5 border-t border-slate-200/40 dark:border-slate-800/40">
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Nota de resolução: {item.resolution_notes}</span>
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <ResolvePendingDialog
        isOpen={!!resolvingItem}
        onClose={() => setResolvingItem(null)}
        onConfirm={handleConfirmResolve}
        title={resolvingItem?.initial_issue_title || "Pendência de Acompanhamento"}
        filePath={resolvingItem?.file_path}
      />
    </div>
  )
}
