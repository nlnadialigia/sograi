import { useState } from "react"
import { CheckCircle2, XCircle, Loader2, Sparkles, KeyRound } from "lucide-react"
import { testConnection } from "../../services/api"

interface AiSettingsTabProps {
  form: Record<string, string>
  onChange: (key: string, value: string) => void
}

export function AiSettingsTab({ form, onChange }: AiSettingsTabProps) {
  const [testing, setTesting] = useState(false)
  const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null)

  const handleTest = async () => {
    setTesting(true)
    setStatus(null)
    try {
      const res = await testConnection({
        provider: "gemini",
        credentials: {
          apiKey: form.GEMINI_API_KEY,
        },
      })
      setStatus(res)
    } catch (e: any) {
      setStatus({ success: false, message: e.message || "Falha na validação" })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Google Gemini AI</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Gerencie a chave de API e o modelo de IA utilizado pelos 4 agentes especialistas
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleTest}
          disabled={testing}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 transition-all cursor-pointer"
        >
          {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
          Validar Chave
        </button>
      </div>

      {status && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 ${
            status.success
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
              : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-500/30"
          }`}
        >
          {status.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
          <span>{status.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Chave de API do Gemini (GEMINI_API_KEY)
          </label>
          <input
            type="password"
            placeholder="AIzaSy..."
            value={form.GEMINI_API_KEY || ""}
            onChange={(e) => onChange("GEMINI_API_KEY", e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Obtenha gratuitamente no Google AI Studio (aistudio.google.com).
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Modelo Principal
          </label>
          <select
            value={form.GEMINI_MODEL || "gemini-3.5-flash-lite"}
            onChange={(e) => onChange("GEMINI_MODEL", e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
          >
            <option value="gemini-3.5-flash-lite">gemini-3.5-flash-lite (Recomendado - Ultra rápido)</option>
            <option value="gemini-2.5-flash">gemini-2.5-flash (Alta capacidade analítica)</option>
          </select>
        </div>
      </div>
    </div>
  )
}
