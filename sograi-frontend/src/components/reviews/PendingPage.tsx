import { useState, useEffect, useMemo } from "react"
import {
  BookmarkCheck,
  Search,
  CheckCircle2,
  Trash2,
  Pencil,
  Loader2,
  Plus,
  FileCode,
} from "lucide-react"
import { ManualPendingItem, Review } from "../../types"
import { PriorityBadge, ItemTypeBadge } from "../common/Badges"
import { AlertDialog } from "../ui/alert-dialog"
import { useToast } from "../ui/toast"
import { AddPendingModal } from "./AddPendingModal"
import { EditPendingModal } from "./EditPendingModal"
import { ResolvePendingDialog } from "./ResolvePendingDialog"

export function PendingPage() {
  const [items, setItems] = useState<ManualPendingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRepo, setSelectedRepo] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("PENDING")
  const [searchText, setSearchText] = useState("")

  const [addModalOpen, setAddModalOpen] = useState(false)
  const [availablePrs, setAvailablePrs] = useState<any[]>([])
  const [itemToEdit, setItemToEdit] = useState<ManualPendingItem | null>(null)
  const [resolveItem, setResolveItem] = useState<ManualPendingItem | null>(null)
  const [deleteItem, setDeleteItem] = useState<ManualPendingItem | null>(null)

  const toast = useToast()

  const loadItems = () => {
    setLoading(true)
    fetch(`/api/pending-items?status=${selectedStatus}&repository=${selectedRepo}`)
      .then((r) => r.json())
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }

  const loadActivePrs = async () => {
    try {
      const res = await fetch("/api/reviews")
      const data = await res.json()
      const active = (Array.isArray(data) ? data : [])
        .filter((r: any) => !r.archived && !r.is_archived)
        .map((r: any) => ({
          prId: String(r.pull_request_id || r.pullRequestId || r.pr || r.id),
          repository: r.repository,
          title: r.title,
          dbId: Number(r.id || r.dbId),
        }))
      setAvailablePrs(active)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadItems()
    loadActivePrs()
  }, [selectedRepo, selectedStatus])

  const handleOpenAddModal = async () => {
    await loadActivePrs()
    setAddModalOpen(true)
  }

  const handleConfirmResolve = async (notes?: string) => {
    if (!resolveItem) return
    try {
      const res = await fetch(`/api/pending-items/${resolveItem.id}/resolve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      })
      if (!res.ok) throw new Error("Falha ao resolver pendência")
      toast.success("Pendência marcada como resolvida!")
      loadItems()
    } catch (err: any) {
      toast.error(err.message || "Erro ao resolver pendência")
    } finally {
      setResolveItem(null)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteItem) return
    try {
      const res = await fetch(`/api/pending-items/${deleteItem.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Falha ao excluir pendência")
      toast.success("Pendência excluída com sucesso!")
      loadItems()
    } catch (err: any) {
      toast.error(err.message || "Erro ao excluir pendência")
    } finally {
      setDeleteItem(null)
    }
  }

  const filteredItems = useMemo(() => {
    if (!searchText.trim()) return items
    const term = searchText.toLowerCase()
    return items.filter(
      (i) =>
        i.title.toLowerCase().includes(term) ||
        i.file_path.toLowerCase().includes(term) ||
        i.repository.toLowerCase().includes(term) ||
        i.pull_request_id.includes(term)
    )
  }, [items, searchText])

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <BookmarkCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Gestão de Pendências & Débitos Técnicos
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Acompanhamento centralizado de melhorias futuras registradas pelo time
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Pendência</span>
            </button>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              <option value="PENDING">Pendentes</option>
              <option value="RESOLVED">Resolvidos</option>
              <option value="all">Todos os Status</option>
            </select>
          </div>
        </div>

        <div className="pt-4 space-y-4">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Buscar por arquivo, título, repositório ou PR..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-xs text-slate-900 dark:text-white"
            />
          </div>

          {loading ? (
            <div className="py-12 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-amber-500 mx-auto mb-2" />
              <p className="text-xs text-slate-500">Carregando pendências...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-12 text-center bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <p className="text-xs text-slate-500">Nenhuma pendência encontrada para este filtro.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item) => {
                const isResolved = item.status === "RESOLVED"
                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border text-xs space-y-2 transition-all ${
                      isResolved
                        ? "bg-slate-50/60 dark:bg-slate-800/20 border-slate-200 dark:border-slate-800 opacity-70"
                        : "bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 shadow-xs"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="inline-flex items-center gap-1.5 font-mono font-bold text-slate-900 dark:text-white text-xs truncate">
                          <FileCode className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="truncate">{item.file_path || (item as any).filePath || "Arquivo Geral"}</span>
                        </span>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded shrink-0">
                          {item.repository}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <ItemTypeBadge itemType={item.item_type || (item as any).itemType} />
                        <PriorityBadge priority={item.priority} />
                        {!isResolved && (
                          <button
                            onClick={() => setResolveItem(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-[10px] cursor-pointer"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Marcar Resolvido</span>
                          </button>
                        )}
                        {!isResolved && (
                          <button
                            onClick={() => setItemToEdit(item)}
                            className="p-1 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20 cursor-pointer"
                            title="Editar pendência"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteItem(item)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer"
                          title="Remover pendência"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap text-xs pt-1">
                      {item.description}
                    </p>

                    {(item.resolution_notes || (item as any).resolutionNotes) && (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>Resolução: {item.resolution_notes || (item as any).resolutionNotes}</span>
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <AddPendingModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        availablePrs={availablePrs}
        onSaved={loadItems}
      />

      <EditPendingModal
        isOpen={!!itemToEdit}
        onClose={() => setItemToEdit(null)}
        item={itemToEdit}
        onSaved={loadItems}
      />

      <ResolvePendingDialog
        isOpen={!!resolveItem}
        onClose={() => setResolveItem(null)}
        onConfirm={handleConfirmResolve}
        title={resolveItem?.title || ""}
        filePath={resolveItem?.file_path}
      />

      <AlertDialog
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleConfirmDelete}
        title="Excluir Pendência"
        description={`Deseja realmente excluir a pendência "${deleteItem?.title}"? Esta ação não pode ser desfeita.`}
        confirmText="Sim, excluir"
        cancelText="Cancelar"
      />
    </div>
  )
}
