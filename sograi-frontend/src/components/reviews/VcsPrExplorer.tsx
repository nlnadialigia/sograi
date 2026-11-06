import { useState, useEffect } from "react"
import { Building, GitBranch, Search, Loader2, AlertCircle } from "lucide-react"
import {
  AzureProject, AzureRepo, AzureOpenPr, GitHubRepo,
  fetchProjects, fetchRepositories, fetchOpenPullRequests,
  fetchGitHubRepositories, fetchGitHubOpenPullRequests,
} from "../../services/api"
import { RepoSelector } from "./RepoSelector"
import { OpenPrsTable } from "./OpenPrsTable"

export type VcsProvider = "azure" | "github"

interface VcsPrExplorerProps {
  runningPrId: number | null
  onAnalyze: (pr: AzureOpenPr) => void
  onOpenSettings?: () => void
}

export function VcsPrExplorer({ runningPrId, onAnalyze, onOpenSettings }: VcsPrExplorerProps) {
  const [provider, setProvider] = useState<VcsProvider>("azure")
  const [azureProjects, setAzureProjects] = useState<AzureProject[]>([])
  const [selectedProject, setSelectedProject] = useState<string>("")
  const [azureRepos, setAzureRepos] = useState<AzureRepo[]>([])
  const [selectedAzureRepos, setSelectedAzureRepos] = useState<string[]>([])
  const [loadingProjects, setLoadingProjects] = useState(false)

  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([])
  const [selectedGithubRepo, setSelectedGithubRepo] = useState<GitHubRepo | null>(null)
  const [githubFilter, setGithubFilter] = useState("")
  const [loadingGithubRepos, setLoadingGithubRepos] = useState(false)

  const [openPrs, setOpenPrs] = useState<AzureOpenPr[]>([])
  const [loadingPrs, setLoadingPrs] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    setLoadingProjects(true)
    fetchProjects().then(setAzureProjects).catch(console.warn).finally(() => setLoadingProjects(false))
  }, [])

  useEffect(() => {
    if (provider !== "azure") return
    setErrorMessage(null)
    setSelectedAzureRepos([])
    setOpenPrs([])
    setHasSearched(false)
    if (!selectedProject) {
      setAzureRepos([])
      return
    }
    fetchRepositories(selectedProject).then(setAzureRepos).catch(() => setAzureRepos([]))
  }, [selectedProject, provider])

  useEffect(() => {
    if (provider !== "github") return
    setErrorMessage(null)
    setOpenPrs([])
    setHasSearched(false)
    setLoadingGithubRepos(true)
    fetchGitHubRepositories()
      .then((repos) => {
        setGithubRepos(repos)
        if (repos.length > 0 && !selectedGithubRepo) setSelectedGithubRepo(repos[0])
      })
      .catch((err) => setErrorMessage(err.message || "Erro ao consultar repositórios do GitHub."))
      .finally(() => setLoadingGithubRepos(false))
  }, [provider])

  const handleToggleAzureRepo = (repoName: string) => {
    setSelectedAzureRepos((prev) => {
      const withoutAll = prev.filter((r) => r !== "all")
      return withoutAll.includes(repoName) ? withoutAll.filter((r) => r !== repoName) : [...withoutAll, repoName]
    })
  }

  const handleSearchAzurePrs = async () => {
    if (selectedAzureRepos.length === 0) return
    setLoadingPrs(true)
    setHasSearched(true)
    setErrorMessage(null)
    try {
      setOpenPrs(await fetchOpenPullRequests(selectedAzureRepos, selectedProject))
    } catch (err: any) {
      setErrorMessage(err.message || "Erro ao consultar PRs no Azure DevOps.")
    } finally {
      setLoadingPrs(false)
    }
  }

  const handleSearchGithubPrs = async () => {
    if (!selectedGithubRepo) return
    setLoadingPrs(true)
    setHasSearched(true)
    setErrorMessage(null)
    try {
      setOpenPrs(await fetchGitHubOpenPullRequests(selectedGithubRepo.owner, selectedGithubRepo.name))
    } catch (err: any) {
      setErrorMessage(err.message || "Erro ao consultar PRs no GitHub.")
    } finally {
      setLoadingPrs(false)
    }
  }

  const filteredGithubRepos = githubRepos.filter((r) =>
    r.fullName.toLowerCase().includes(githubFilter.toLowerCase())
  )

  return (
    <div className="space-y-4">
      {/* Seletor de Provedor por Abas */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setProvider("azure")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              provider === "azure"
                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Azure DevOps</span>
          </button>

          <button
            type="button"
            onClick={() => setProvider("github")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              provider === "github"
                ? "bg-slate-900 text-white dark:bg-slate-700 border border-slate-700"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>GitHub</span>
          </button>
        </div>

        {onOpenSettings && (
          <button
            type="button"
            onClick={onOpenSettings}
            className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
          >
            Configurar Credenciais ➔
          </button>
        )}
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-500/30 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="text-[11px] underline font-bold hover:text-rose-900 shrink-0 cursor-pointer"
            >
              Abrir Configurações
            </button>
          )}
        </div>
      )}

      {/* Conteúdo de Seleção: Azure DevOps */}
      {provider === "azure" && (
        <div className="space-y-4">
          {azureProjects.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-xl">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider shrink-0">
                Projeto Azure:
              </label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full sm:w-72 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
              >
                <option value="">Selecione um projeto...</option>
                {azureProjects.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <RepoSelector
            repositories={azureRepos}
            selectedRepos={selectedAzureRepos}
            onToggleRepo={handleToggleAzureRepo}
            onSelectAll={() =>
              setSelectedAzureRepos((prev) => (prev.includes("all") ? [] : ["all"]))
            }
            onClear={() => {
              setSelectedAzureRepos([])
              setOpenPrs([])
              setHasSearched(false)
            }}
            onSearchPrs={handleSearchAzurePrs}
            loading={loadingPrs}
            hasSearched={hasSearched}
          />
        </div>
      )}

      {/* Conteúdo de Seleção: GitHub */}
      {provider === "github" && (
        <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Repositório GitHub
            </label>
            <span className="text-[11px] text-slate-500">
              {githubRepos.length} repositórios descobertos pelo PAT
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={githubFilter}
              onChange={(e) => setGithubFilter(e.target.value)}
              placeholder="Filtrar repositórios do GitHub..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {loadingGithubRepos ? (
            <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
              <span>Consultando repositórios no GitHub...</span>
            </div>
          ) : (
            <div className="max-h-36 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 gap-1.5 border-t border-b border-slate-200/50 dark:border-slate-800/60 py-2">
              {filteredGithubRepos.map((repo) => {
                const isSelected = selectedGithubRepo?.id === repo.id
                return (
                  <button
                    key={repo.id}
                    type="button"
                    onClick={() => setSelectedGithubRepo(repo)}
                    className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer select-none transition-colors text-left ${
                      isSelected
                        ? "bg-amber-100/60 dark:bg-amber-950/30 text-amber-950 dark:text-amber-200 font-medium border border-amber-500/30"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <span className="truncate">{repo.fullName}</span>
                    {repo.isPrivate && (
                      <span className="text-[9px] px-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 shrink-0">
                        privado
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-500 truncate max-w-xs">
              {selectedGithubRepo ? `Selecionado: ${selectedGithubRepo.fullName}` : "Nenhum repositório selecionado"}
            </span>
            <button
              type="button"
              onClick={handleSearchGithubPrs}
              disabled={loadingPrs || !selectedGithubRepo}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              {loadingPrs ? (
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
      )}

      {/* Tabela de PRs Abertas */}
      {hasSearched && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Pull Requests Disponíveis para Auditoria ({openPrs.length})
            </h3>
          </div>
          <OpenPrsTable
            prs={openPrs}
            loading={loadingPrs}
            runningPrId={runningPrId}
            onAnalyze={onAnalyze}
          />
        </div>
      )}
    </div>
  )
}
