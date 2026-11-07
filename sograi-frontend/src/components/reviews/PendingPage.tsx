import { useState, useEffect, useMemo } from "react"
import {
  BookmarkCheck,
  Search,
  Loader2,
  Plus,
} from "lucide-react"
import { ManualPendingItem } from "../../types"
import { AlertDialog } from "../ui/alert-dialog"
import { useToast } from "../ui/toast"
import { AddPendingModal } from "./AddPendingModal"
import { EditPendingModal } from "./EditPendingModal"
import { ResolvePendingDialog } from "./ResolvePendingDialog"
import { PendingCard } from "./PendingCard"

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
            <div className="space-y-3.5">
              {filteredItems.map((item) => (
                <PendingCard
                  key={item.id}
                  item={item}
                  onResolve={(i) => setResolveItem(i)}
                  onEdit={(i) => setItemToEdit(i)}
                  onDelete={(i) => setDeleteItem(i)}
                />
              ))}
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
