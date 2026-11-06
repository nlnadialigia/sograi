import { useState } from "react"
import { BookOpen, Sparkles, PlayCircle, Bot, BookmarkCheck, FileText, Settings, ArrowRight } from "lucide-react"
import { Page } from "../../types"
import { OverviewGuideTab } from "./OverviewGuideTab"
import { AnalysisGuideTab } from "./AnalysisGuideTab"
import { AgentsGuideTab } from "./AgentsGuideTab"
import { PendingGuideTab } from "./PendingGuideTab"
import { ReportsGuideTab } from "./ReportsGuideTab"

interface GuidesPageProps {
  setPage?: (p: Page) => void
}

type GuideTab = "overview" | "analysis" | "agents" | "pending" | "reports"

export function GuidesPage({ setPage }: GuidesPageProps) {
  const [activeTab, setActiveTab] = useState<GuideTab>("overview")

  const tabs: { id: GuideTab; label: string; icon: typeof Sparkles }[] = [
    { id: "overview", label: "Visão Geral & Fluxo", icon: Sparkles },
    { id: "analysis", label: "Como Fazer Análises", icon: PlayCircle },
    { id: "agents", label: "Comitê de IA (5 Agentes)", icon: Bot },
    { id: "pending", label: "Gestão de Pendências", icon: BookmarkCheck },
    { id: "reports", label: "Relatórios & PDF", icon: FileText },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold border border-amber-500/20 shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Central de Orientações
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Guia completo de funcionalidades, comitê de agentes especialistas e auditoria contínua
            </p>
          </div>
        </div>

        {setPage && (
          <button
            onClick={() => setPage("admin")}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors self-start sm:self-auto cursor-pointer"
            title="Ir para Configurações de Conexão e PATs"
          >
            <Settings className="w-3.5 h-3.5 text-slate-500" />
            <span>Configurações & Tokens</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
          </button>
        )}
      </div>

      {/* Navegação por Abas */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? "bg-amber-500 text-slate-950 font-bold shadow-sm dark:bg-amber-500 dark:text-slate-950"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-slate-950" : "text-amber-500"}`} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Conteúdo Dinâmico da Aba Selecionada */}
      <div className="transition-opacity duration-200">
        {activeTab === "overview" && <OverviewGuideTab />}
        {activeTab === "analysis" && <AnalysisGuideTab />}
        {activeTab === "agents" && <AgentsGuideTab />}
        {activeTab === "pending" && <PendingGuideTab />}
        {activeTab === "reports" && <ReportsGuideTab />}
      </div>
    </div>
  )
}
