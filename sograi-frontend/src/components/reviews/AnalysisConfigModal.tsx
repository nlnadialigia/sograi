import { useState, useEffect } from "react"
import { Modal } from "../ui/modal"
import { agents } from "../../data/constants"
import { GitPullRequest, Check, Play, Loader2, FlaskConical } from "lucide-react"

interface AnalysisConfigModalProps {
  isOpen: boolean
  onClose: () => void
  initialUrl: string
  prMeta?: {
    pullRequestId: number
    title: string
    repository: string
    author: string
  } | null
  onStartAnalysis: (config: {
    prUrl: string
    mode: "unified" | "separated"
    selectedAgents: string[]
    includeTests: boolean
  }) => void
  isSubmitting?: boolean
  isQueued?: boolean
}

export function AnalysisConfigModal({
  isOpen,
  onClose,
  initialUrl,
  prMeta,
  onStartAnalysis,
  isSubmitting = false,
  isQueued = false,
}: AnalysisConfigModalProps) {
  const [url, setUrl] = useState(initialUrl)
  const [mode, setMode] = useState<"unified" | "separated">("unified")
  const [selectedAgents, setSelectedAgents] = useState<string[]>(agents.map((a) => a.name))
  const [includeTests, setIncludeTests] = useState(false)

  useEffect(() => {
    setUrl(initialUrl)
  }, [initialUrl])

  const toggleAgent = (name: string) => {
    if (isSubmitting) return
    setSelectedAgents((prev) =>
      prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name]
    )
  }

  const allAgentsSelected = selectedAgents.length === agents.length

  const handleToggleAllAgents = () => {
    if (isSubmitting) return
    if (allAgentsSelected) {
      setSelectedAgents([])
    } else {
      setSelectedAgents(agents.map((a) => a.name))
    }
  }

  const handleConfirm = () => {
    if (!url.trim() || isSubmitting) return
    onStartAnalysis({
      prUrl: url.trim(),
      mode,
      selectedAgents,
      includeTests,
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configurar Auditoria SogrAI"
      className="max-w-xl"
    >
      <div className="space-y-4">
        {prMeta ? (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                PR #{prMeta.pullRequestId}
              </span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className="font-mono font-semibold text-slate-700 dark:text-slate-300 bg-amber-500/20 px-1.5 py-0.5 rounded">
                {prMeta.repository}
              </span>
            </div>
            <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{prMeta.title}</p>
            <p className="text-slate-500 text-[11px]">Autor: {prMeta.author}</p>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              URL da Pull Request
            </label>
            <div className="relative">
              <GitPullRequest className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://dev.azure.com/... ou https://github.com/{owner}/{repo}/pull/{id}"

                disabled={isSubmitting}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Modo de Auditoria
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setMode("unified")}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                mode === "unified"
                  ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 text-slate-900 dark:text-white ring-1 ring-amber-500"
                  : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <p className="text-xs font-bold leading-tight">Comitê Completo</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Visão unificada 5 em 1</p>
            </button>

            <button
              type="button"
              onClick={() => setMode("separated")}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                mode === "separated"
                  ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 text-slate-900 dark:text-white ring-1 ring-amber-500"
                  : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <p className="text-xs font-bold leading-tight">Agentes Específicos</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Selecione especialistas</p>
            </button>
          </div>
        </div>

        {/* Opção de Arquivos de Teste */}
        <label
          onClick={() => !isSubmitting && setIncludeTests(!includeTests)}
          className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs cursor-pointer select-none transition-all ${
            includeTests
              ? "border-amber-500/50 bg-amber-50/60 dark:bg-amber-950/20 text-amber-950 dark:text-amber-200 font-medium"
              : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300"
          }`}
        >
          <div
            className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border transition-colors ${
              includeTests
                ? "bg-amber-500 border-amber-500 text-slate-950"
                : "border-slate-300 dark:border-slate-600"
            }`}
          >
            {includeTests && <Check className="w-3 h-3 stroke-[3]" />}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-xs flex items-center gap-1.5">
              <FlaskConical className="w-3.5 h-3.5 text-amber-500" />
              <span>Incluir arquivos de testes automatizados (.spec, .test)</span>
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              Por padrão desativado para focar em código de produção. Falhas em testes não reprovam a PR.
            </p>
          </div>
        </label>

        {mode === "separated" && (
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Selecione os Agentes ({selectedAgents.length}/{agents.length}):
              </span>
              <button
                type="button"
                onClick={handleToggleAllAgents}
                className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline font-bold cursor-pointer"
              >
                {allAgentsSelected ? "Limpar Todos" : "Selecionar Todos"}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {agents.map((agent) => {
                const isChecked = selectedAgents.includes(agent.name)
                return (
                  <label
                    key={agent.name}
                    onClick={() => toggleAgent(agent.name)}
                    className={`flex items-start gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                      isChecked
                        ? "border-amber-500/40 bg-amber-50/60 dark:bg-amber-950/20 text-amber-950 dark:text-amber-300"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded mt-0.5 flex items-center justify-center border text-[9px] ${
                        isChecked
                          ? "bg-amber-500 border-amber-500 text-slate-950"
                          : "border-slate-300 dark:border-slate-600"
                      }`}
                    >
                      {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                    <span className="text-[11px] font-semibold leading-tight">{agent.name}</span>
                  </label>
                )
              })}
            </div>
          </div>
        )}

        <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={
              isSubmitting ||
              !url.trim() ||
              (mode === "separated" && selectedAgents.length === 0)
            }
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Iniciando...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isQueued ? "Confirmar e Enfileirar" : "Confirmar e Analisar"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  )
}
