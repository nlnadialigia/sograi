import { useState, useEffect } from "react"
import { Modal } from "../ui/modal"
import { Loader2, Save, FileCode } from "lucide-react"
import { ManualPendingItem } from "../../types"
import { useToast } from "../ui/toast"

interface EditPendingModalProps {
  isOpen: boolean
  onClose: () => void
  item: ManualPendingItem | null
  onSaved: () => void
}

export function EditPendingModal({
  isOpen,
  onClose,
  item,
  onSaved,
}: EditPendingModalProps) {
  const [filePath, setFilePath] = useState("")
  const [itemType, setItemType] = useState<"TECH_DEBT" | "IMPROVEMENT" | "FUTURE_REFACTOR">("TECH_DEBT")
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  useEffect(() => {
    if (item && isOpen) {
      setFilePath(item.file_path || (item as any).filePath || "")
      setItemType((item.item_type as any) || (item as any).itemType || "TECH_DEBT")
      setPriority((item.priority as any) || "MEDIUM")
      setDescription(item.description || "")
    }
  }, [item, isOpen])

  if (!item) return null

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) {
      toast.error("A descrição da pendência é obrigatória.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/pending-items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: item.title || description.trim().slice(0, 60),
          filePath: filePath.trim(),
          itemType,
          priority,
          description: description.trim(),
        }),
      })

      if (!res.ok) {
        throw new Error("Falha ao salvar as alterações da pendência.")
      }

      toast.success("Pendência atualizada com sucesso!")
      onSaved()
      onClose()
    } catch (err: any) {
      toast.error(err.message || "Erro ao atualizar pendência.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Pendência / Débito Técnico"
      className="max-w-lg"
    >
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
            Arquivo Afetado
          </label>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/50 text-xs font-mono text-slate-700 dark:text-slate-300 select-all">
            <FileCode className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="truncate">{filePath || "Geral (sem arquivo específico)"}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
              Tipo
            </label>
            <select
              value={itemType}
              onChange={(e: any) => setItemType(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 outline-none"
            >
              <option value="TECH_DEBT">Débito Técnico</option>
              <option value="IMPROVEMENT">Melhoria Futura</option>
              <option value="FUTURE_REFACTOR">Refatoração</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
              Prioridade
            </label>
            <select
              value={priority}
              onChange={(e: any) => setPriority(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 outline-none"
            >
              <option value="LOW">Baixa</option>
              <option value="MEDIUM">Média</option>
              <option value="HIGH">Alta</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
            Descrição *
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Salvar Alterações</span>
          </button>
        </div>
      </form>
    </Modal>
  )
}
