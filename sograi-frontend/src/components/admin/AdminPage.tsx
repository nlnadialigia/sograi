import { useState, useEffect } from "react"
import { Building2, Sparkles, BookOpen, Save, Loader2 } from "lucide-react"
import { fetchSettings, saveSettings } from "../../services/api"
import { ProviderSettingsTab } from "./ProviderSettingsTab"
import { AiSettingsTab } from "./AiSettingsTab"
import { GuidesTab } from "./GuidesTab"
import { useToast } from "../ui/toast"

type TabType = "providers" | "ai" | "guides"

export function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>("providers")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  const [form, setForm] = useState<Record<string, string>>({
    AZURE_DEVOPS_ORG: "",
    AZURE_DEVOPS_PROJECT: "",
    AZURE_DEVOPS_TOKEN: "",
    GITHUB_TOKEN: "",
    GITHUB_API_URL: "https://api.github.com",
    GITHUB_DEFAULT_OWNER: "",
    GEMINI_API_KEY: "",
    GEMINI_MODEL: "gemini-3.5-flash-lite",
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const items = await fetchSettings()
      const newForm = { ...form }
      items.forEach((item) => {
        newForm[item.key] = item.value
      })
      setForm(newForm)
    } catch {
      // Ignora erro inicial
    } finally {
      setLoading(false)
    }
  }

  const handleFieldChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = Object.entries(form).map(([key, value]) => ({
        key,
        value,
      }))
      const res = await saveSettings(payload)
      toast.success(res.message || "Configurações salvas com sucesso!")
      await loadData()
    } catch (e: any) {
      toast.error(e.message || "Falha ao salvar configurações")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Navegação de Abas e Botão Salvar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("providers")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === "providers"
                ? "bg-amber-500 text-slate-950 font-bold shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Provedores (Azure & GitHub)</span>
          </button>

          <button
            onClick={() => setActiveTab("ai")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === "ai"
                ? "bg-amber-500 text-slate-950 font-bold shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Inteligência Artificial</span>
          </button>

          <button
            onClick={() => setActiveTab("guides")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === "guides"
                ? "bg-amber-500 text-slate-950 font-bold shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Guias de Tokens</span>
          </button>
        </div>

        {activeTab !== "guides" && (
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/10 transition-all cursor-pointer disabled:opacity-50 self-end sm:self-auto"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? "Salvando..." : "Salvar Configurações"}</span>
          </button>
        )}
      </div>

      {/* Conteúdo da Aba */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 text-slate-400 gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
          <p className="text-xs">Carregando configurações...</p>
        </div>
      ) : (
        <div>
          {activeTab === "providers" && (
            <ProviderSettingsTab form={form} onChange={handleFieldChange} />
          )}
          {activeTab === "ai" && (
            <AiSettingsTab form={form} onChange={handleFieldChange} />
          )}
          {activeTab === "guides" && <GuidesTab />}
        </div>
      )}
    </div>
  )
}
