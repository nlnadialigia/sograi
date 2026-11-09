import { useState } from "react"
import { Modal } from "../ui/modal"
import { Lightbulb, Bug, Send, Loader2, ExternalLink, AlertCircle } from "lucide-react"
import { useToast } from "../ui/toast"

interface SuggestionModalProps {
  isOpen: boolean
  onClose: () => void
  user?: any
}

export function buildGitHubWebUrl(
  title: string,
  description: string,
  type: "enhancement" | "bug",
  user?: any
): string {
  const authorInfo = user
    ? `\n\n---\n*Enviado por: ${user.name} (${user.email || "usuário"}) via SogrAI Platform*`
    : ""
  const fullBody = `${description.trim()}${authorInfo}`
  const params = new URLSearchParams()
  if (title.trim()) params.set("title", title.trim())
  if (fullBody.trim()) params.set("body", fullBody.trim())
  params.set("labels", type)
  const qs = params.toString()
  return `https://github.com/nlnadialigia/sograi/issues/new${qs ? `?${qs}` : ""}`
}

export function SuggestionModal({ isOpen, onClose, user }: SuggestionModalProps) {
  const [type, setType] = useState<"enhancement" | "bug">("enhancement")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [permissionError, setPermissionError] = useState(false)
  const toast = useToast()

  if (!isOpen) return null

  const handleOpenInGitHub = () => {
    const url = buildGitHubWebUrl(title, description, type, user)
    window.open(url, "_blank", "noopener,noreferrer")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !description.trim()) {
      toast.error("Por favor, preencha o título e o detalhamento.")
      return
    }

    setLoading(true)
    setPermissionError(false)
    try {
      const authorInfo = user
        ? `\n\n---\n*Enviado por: ${user.name} (${user.email || "usuário"}) via SogrAI Platform*`
        : ""
      const fullBody = `${description.trim()}${authorInfo}`

      const res = await fetch("/api/github/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          body: fullBody,
          type,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        const errorText = data.message || "Falha ao enviar sugestão para o GitHub."
        if (
          res.status === 403 ||
          errorText.toLowerCase().includes("permissão") ||
          errorText.toLowerCase().includes("not accessible")
        ) {
          setPermissionError(true)
        }
        throw new Error(errorText)
      }

      const issue = await res.json()
      toast.success(
        issue.number
          ? `Issue #${issue.number} criada no GitHub com sucesso!`
          : "Sugestão enviada com sucesso ao GitHub!"
      )
      setTitle("")
      setDescription("")
      setPermissionError(false)
      onClose()
    } catch (err: any) {
      toast.error(err.message || "Erro ao conectar com o GitHub.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Enviar Sugestão ou Reportar Bug"
      className="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Seletor de Tipo */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Tipo de Solicitação
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setType("enhancement")}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                type === "enhancement"
                  ? "bg-amber-500/10 dark:bg-amber-500/20 border-amber-500 text-amber-700 dark:text-amber-300 shadow-xs"
                  : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>Sugestão de Melhoria</span>
            </button>

            <button
              type="button"
              onClick={() => setType("bug")}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                type === "bug"
                  ? "bg-rose-500/10 dark:bg-rose-500/20 border-rose-500 text-rose-700 dark:text-rose-300 shadow-xs"
                  : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <Bug className="w-4 h-4 text-rose-500" />
              <span>Reportar Bug / Falha</span>
            </button>
          </div>
        </div>

        {/* Alerta de Permissão de Token com Fallback */}
        {permissionError && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 flex flex-col gap-2.5">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">
                O token configurado não possui permissão de escrita em issues (comum em clones ou forks de terceiros).
                Você pode abrir a issue diretamente no GitHub com esses dados já preenchidos:
              </span>
            </div>
            <button
              type="button"
              onClick={handleOpenInGitHub}
              className="self-end inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Abrir no GitHub Web</span>
            </button>
          </div>
        )}

        {/* Título */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
            Título *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              type === "enhancement"
                ? "Ex: Adicionar exportação em lote de pendências"
                : "Ex: Erro ao carregar diff de arquivos com extensão .sql"
            }
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
            Detalhamento *
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={
              type === "enhancement"
                ? "Descreva como você gostaria que a funcionalidade funcionasse e qual o benefício esperado..."
                : "Descreva o passo a passo para reproduzir o problema e o comportamento esperado..."
            }
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed"
          />
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Esta solicitação será aberta como uma nova Issue no GitHub do projeto com a tag{" "}
            <strong>{type === "enhancement" ? "enhancement" : "bug"}</strong>.
          </p>
        </div>

        {/* Rodapé */}
        <div className="pt-3 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleOpenInGitHub}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
            title="Abrir formulário de issue no site do GitHub"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Abrir no GitHub Web</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim() || !description.trim()}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar para o GitHub</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
