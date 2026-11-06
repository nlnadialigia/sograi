import { useState, useMemo } from "react"
import { Search, Loader2 } from "lucide-react"
import { AzureRepo } from "../../services/api"

interface RepoSelectorProps {
  repositories: AzureRepo[]
  selectedRepos: string[]
  onToggleRepo: (repoName: string) => void
  onSelectAll: () => void
  onClear: () => void
  onSearchPrs: () => void
  loading: boolean
  hasSearched: boolean
}

export function RepoSelector({
  repositories,
  selectedRepos,
  onToggleRepo,
  onSelectAll,
  onClear,
  onSearchPrs,
  loading,
  hasSearched,
}: RepoSelectorProps) {
  const [filterText, setFilterText] = useState("")
  const isAllSelected = selectedRepos.includes("all")

  const filteredRepos = useMemo(() => {
    if (!filterText.trim()) return repositories
    return repositories.filter((r) =>
      r.name.toLowerCase().includes(filterText.toLowerCase())
    )
  }, [repositories, filterText])

  return (
    <div className="space-y-3 p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Selecione o(s) Repositório(s)
        </label>
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={onSelectAll}
            className={`font-semibold transition-colors cursor-pointer ${
              isAllSelected
                ? "text-amber-600 dark:text-amber-400"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {isAllSelected ? "✓ Todos Selecionados" : "Selecionar Todos"}
          </button>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <button
            type="button"
            onClick={onClear}
            className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors cursor-pointer"
          >
            Limpar
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          placeholder="Filtrar repositórios por nome..."
          className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
      </div>

      <div className="max-h-36 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5 border-t border-b border-slate-200/50 dark:border-slate-800/60 py-2">
        {filteredRepos.map((repo) => {
          const isChecked = isAllSelected || selectedRepos.includes(repo.name)
          return (
            <label
              key={repo.id}
              onClick={() => onToggleRepo(repo.name)}
              className={`flex items-center gap-2 p-1.5 rounded-lg text-xs cursor-pointer select-none transition-colors ${
                isChecked
                  ? "bg-amber-100/60 dark:bg-amber-950/30 text-amber-950 dark:text-amber-200 font-medium"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              }`}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => {}}
                className="rounded text-amber-500 focus:ring-amber-500 w-3.5 h-3.5 cursor-pointer accent-amber-500"
              />
              <span className="truncate">{repo.name}</span>
            </label>
          )
        })}
      </div>

      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] text-slate-500">
          {isAllSelected
            ? "Todos os repositórios selecionados"
            : `${selectedRepos.length} repositório(s) selecionado(s)`}
        </span>
        <button
          type="button"
          onClick={onSearchPrs}
          disabled={loading || selectedRepos.length === 0}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs transition-all disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Buscando PRs...</span>
            </>
          ) : (
            <>
              <Search className="w-3.5 h-3.5" />
              <span>{hasSearched ? "Atualizar PRs" : "Buscar PRs em Aberto"}</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
