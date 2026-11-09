import { useState, useRef, useEffect } from "react"
import {
  FileCode,
  FolderGit2,
  MoreVertical,
  CheckCircle2,
  Pencil,
  Trash2,
  History,
  ChevronDown,
} from "lucide-react"
import { ManualPendingItem } from "../../types"
import { PriorityBadge, ItemTypeBadge, OriginBadge } from "../common/Badges"
import { PendingHistoryList } from "./PendingHistoryList"

interface PendingCardProps {
  item: ManualPendingItem
  onResolve: (item: ManualPendingItem) => void
  onEdit: (item: ManualPendingItem) => void
  onDelete: (item: ManualPendingItem) => void
}

function splitFilePath(fullPath?: string) {
  if (!fullPath || fullPath === "Arquivo Geral") {
    return { fileName: "Arquivo Geral", dirPath: "" }
  }
  const clean = fullPath.replace(/\\/g, "/")
  const lastIndex = clean.lastIndexOf("/")
  if (lastIndex === -1) {
    return { fileName: clean, dirPath: "" }
  }
  return {
    fileName: clean.substring(lastIndex + 1),
    dirPath: clean.substring(0, lastIndex + 1),
  }
}

export function PendingCard({
  item,
  onResolve,
  onEdit,
  onDelete,
}: PendingCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const isResolved = item.status === "RESOLVED"
  const rawPath = item.file_path || (item as any).filePath || "Arquivo Geral"
  const { fileName, dirPath } = splitFilePath(rawPath)
  const resolutionNotes = item.resolution_notes || (item as any).resolutionNotes
  const historyList = item.history || []

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [menuOpen])

  return (
    <div
      className={`rounded-2xl border p-5 transition-all space-y-3.5 ${
        isResolved
          ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300/70 dark:border-emerald-900/50 shadow-xs"
          : "bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-amber-500/40"
      }`}
    >
      {/* Top Bar: Repositório, Badges e Menu ⋮ */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-slate-700/60 truncate">
            <FolderGit2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="truncate">{item.repository}</span>
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          {isResolved && (
            <span className="inline-flex items-center gap-1 font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 border border-emerald-300/50 dark:border-emerald-800">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>Resolvido</span>
            </span>
          )}
          <OriginBadge origin={item.origin} />
          <ItemTypeBadge itemType={item.item_type || (item as any).itemType} />
          <PriorityBadge priority={item.priority} />

          {/* Menu de Ações (3 Pontinhos) */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="Ações da pendência"
              title="Ações"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 z-30 w-48 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-1.5 shadow-xl text-left animate-in fade-in zoom-in-95 duration-100">
                {!isResolved && (
                  <>
                    <button
                      onClick={() => {
                        setMenuOpen(false)
                        onResolve(item)
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Marcar Resolvido</span>
                    </button>

                    <button
                      onClick={() => {
                        setMenuOpen(false)
                        onEdit(item)
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5 text-amber-500" />
                      <span>Editar Pendência</span>
                    </button>
                  </>
                )}

                <button
                  onClick={() => {
                    setMenuOpen(false)
                    onDelete(item)
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Excluir Pendência</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Destaque do Arquivo (Estilo Detalhe do Parecer) */}
      <div className="pt-0.5">
        <div className="flex items-start gap-2.5">
          <div
            className={`p-2 rounded-xl shrink-0 mt-0.5 ${
              isResolved
                ? "bg-emerald-500/15 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                : "bg-amber-500/10 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400"
            }`}
          >
            <FileCode className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold font-mono text-slate-900 dark:text-white leading-tight break-all">
              {fileName}
            </h3>
            {dirPath && (
              <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500 leading-normal break-all mt-1">
                {dirPath}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Descrição da Pendência */}
      <div className="pt-1">
        <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
          {item.description}
        </p>
      </div>

      {/* Resolução (quando resolvido) */}
      {isResolved && (
        <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-900/40">
          <div className="flex items-start gap-2.5 text-xs text-emerald-800 dark:text-emerald-200 font-medium bg-emerald-100/70 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-300/60 dark:border-emerald-800/60">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
            <div className="space-y-0.5 min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-bold text-[11px] uppercase tracking-wider text-emerald-950 dark:text-emerald-100">
                  {item.resolved_by_pr || (item as any).resolvedByPr
                    ? `Resolvido via PR #${item.resolved_by_pr || (item as any).resolvedByPr}`
                    : "Resolvido manualmente"}
                </span>
                {(item.resolved_at || (item as any).resolvedAt) && (
                  <span className="text-[10px] text-emerald-700/80 dark:text-emerald-400 font-mono">
                    {new Date(item.resolved_at || (item as any).resolvedAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </span>
                )}
              </div>
              <p className="text-xs text-emerald-900 dark:text-emerald-100 leading-relaxed break-words">
                {resolutionNotes || "Resolvido manualmente pelo usuário."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Histórico de Tentativas Não Resolvidas (Issue #13) */}
      {historyList.length > 0 && (
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <button
            type="button"
            onClick={() => setShowHistory((prev) => !prev)}
            className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-colors cursor-pointer"
          >
            <History className="w-3.5 h-3.5" />
            <span>
              {historyList.length}{" "}
              {historyList.length === 1
                ? "subida de PR não resolveu"
                : "subidas de PR não resolveram"}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${
                showHistory ? "rotate-180" : ""
              }`}
            />
          </button>

          {showHistory && (
            <div className="mt-2.5">
              <PendingHistoryList history={historyList} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
