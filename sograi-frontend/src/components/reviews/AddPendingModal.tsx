import { useState, useEffect, useMemo } from "react"
import { Modal } from "../ui/modal"
import { BookmarkPlus, Plus, Loader2, AlertCircle } from "lucide-react"
import { AddPendingModalProps, PendingQueueItem } from "./pending-types"
import { PendingQueueList } from "./PendingQueueList"

export function AddPendingModal({
  isOpen,
  onClose,
  pr,
  availablePrs = [],
  defaultFilePath = "",
  onSaved,
}: AddPendingModalProps) {
  const [selectedPrId, setSelectedPrId] = useState<string>(pr?.prId || availablePrs[0]?.prId || "")
  const [availableFiles, setAvailableFiles] = useState<string[]>([])
  const [selectedFilePath, setSelectedFilePath] = useState("")
  const [description, setDescription] = useState("")
  const [itemType, setItemType] = useState<"TECH_DEBT" | "IMPROVEMENT" | "FUTURE_REFACTOR">("TECH_DEBT")
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM")
  const [queue, setQueue] = useState<PendingQueueItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const activePr = useMemo(() => {
    if (pr) return pr
    if (availablePrs.length > 0) {
      return availablePrs.find((p) => String(p.prId) === String(selectedPrId)) || availablePrs[0]
    }
    return null
  }, [pr, availablePrs, selectedPrId])

  useEffect(() => {
    if (!isOpen) return
    setQueue([])
    setError(null)
    setDescription("")

    if (pr) {
      setSelectedPrId(pr.prId)
    } else if (availablePrs.length > 0) {
      setSelectedPrId(availablePrs[0].prId)
    }
  }, [isOpen])

  useEffect(() => {
    if (!activePr) return
    const directFiles = (activePr as any).files || []

    if (directFiles.length > 0) {
      setAvailableFiles(directFiles)
      setSelectedFilePath(defaultFilePath && directFiles.includes(defaultFilePath) ? defaultFilePath : directFiles[0] || "")
    } else if ((activePr as any).dbId) {
      fetch(`/api/reviews/${(activePr as any).dbId}`)
        .then((r) => r.json())
        .then((data) => {
          const files = (data.files || []).map((f: any) => f.file_path)
          setAvailableFiles(files)
          setSelectedFilePath(defaultFilePath && files.includes(defaultFilePath) ? defaultFilePath : files[0] || "")
        })
        .catch(console.error)
    } else {
      setAvailableFiles([])
      setSelectedFilePath("")
    }
  }, [activePr?.prId, (activePr as any)?.dbId, defaultFilePath])

  const filesNotInQueue = useMemo(() => {
    const queuedPaths = new Set(queue.map((q) => q.filePath))
    return availableFiles.filter((f) => !queuedPaths.has(f))
  }, [availableFiles, queue])

  const handleAddToQueue = (e: React.FormEvent) => {
    e.preventDefault()
    const path = selectedFilePath.trim()

    if (!path) {
      setError("Por favor, selecione um arquivo da PR.")
      return
    }
    const lines = description
      .split("\n")
      .map((l) => l.replace(/^[-*•]\s*/, "").trim())
      .filter((l) => l.length > 0)

    if (lines.length === 0) {
      setError("Por favor, digite a descrição da pendência.")
      return
    }

    const newItems: PendingQueueItem[] = lines.map((line) => ({
      id: `${Date.now()}_${Math.random()}`,
      filePath: path,
      itemType,
      priority,
      description: line,
    }))

    const updatedQueue = [...queue, ...newItems]
    setQueue(updatedQueue)
    setDescription("")
    setError(null)

    const remaining = availableFiles.filter((f) => !updatedQueue.some((q) => q.filePath === f))
    setSelectedFilePath(remaining[0] || "")
  }

  const handleRemoveFromQueue = (id: string) => {
    const item = queue.find((q) => q.id === id)
    setQueue((prev) => prev.filter((q) => q.id !== id))
    if (item && !selectedFilePath) {
      setSelectedFilePath(item.filePath)
    }
  }

  const handleSaveAll = async () => {
    let finalQueue = [...queue]
    const currentPath = selectedFilePath.trim()
    const pendingLines = description
      .split("\n")
      .map((l) => l.replace(/^[-*•]\s*/, "").trim())
      .filter((l) => l.length > 0)

    if (currentPath && pendingLines.length > 0) {
      pendingLines.forEach((line) => {
        finalQueue.push({
          id: `${Date.now()}_${Math.random()}`,
          filePath: currentPath,
          itemType,
          priority,
          description: line,
        })
      })
    }

    if (finalQueue.length === 0) {
      setError("Adicione pelo menos uma pendência à lista antes de salvar.")
      return
    }

    if (!activePr) {
      setError("Nenhuma Pull Request selecionada.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const itemsPayload = finalQueue.map((q) => ({
        prId: String(activePr.prId),
        repository: activePr.repository,
        filePath: q.filePath,
        description: q.description,
        itemType: q.itemType,
        priority: q.priority,
      }))

      const res = await fetch("/api/pending-items/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: itemsPayload }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || "Falha ao registrar lote de pendências.")
      }

      onSaved()
      onClose()
    } catch (err: any) {
      setError(err.message || "Erro ao salvar as pendências.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Lançamento de Pendências & Débito Técnico"
      className="max-w-2xl max-h-[90vh] flex flex-col"
    >
      <div className="space-y-4 overflow-y-auto pr-1">
        {/* Seletor de PR (se disponível) ou Banner da PR Fixa */}
        {availablePrs.length > 0 && !pr ? (
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Pull Request de Destino *
            </label>
            <select
              value={selectedPrId}
              onChange={(e) => setSelectedPrId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
            >
              {availablePrs.map((p) => (
                <option key={p.prId} value={p.prId}>
                  PR #{p.prId} • {p.repository} - {p.title}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs flex items-center justify-between">
            <div>
              <span className="font-mono text-amber-700 dark:text-amber-300 font-bold">
                PR #{activePr?.prId} • {activePr?.repository}
              </span>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Adicione pendências para cada arquivo modificado da PR.
              </p>
            </div>
            <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-200">
              {filesNotInQueue.length} arquivo(s) disponíveis
            </span>
          </div>
        )}

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
          {/* Select de Arquivo da PR */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Arquivo da PR ({filesNotInQueue.length} disponíveis) *
            </label>
            <select
              value={selectedFilePath}
              onChange={(e) => setSelectedFilePath(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Selecione o arquivo da PR...</option>
              {filesNotInQueue.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase">
                Descrição do Débito Técnico *
              </label>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                💡 Dica: Digite uma pendência por linha com hífen (-)
              </span>
            </div>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={"- Ajustar tratamento de exceção em caso de timeout\n- Extrair função utilitária para módulo compartilhado\n- Adicionar testes de validação do payload"}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-slate-400 placeholder:font-sans leading-relaxed"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleAddToQueue}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar à Lista</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <PendingQueueList queue={queue} onRemove={handleRemoveFromQueue} />
      </div>

      <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <span className="text-xs text-slate-500">
          {queue.length} pendência(s) na fila
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookmarkPlus className="w-4 h-4" />}
            <span>Salvar Todas</span>
          </button>
        </div>
      </div>
    </Modal>
  )
}
