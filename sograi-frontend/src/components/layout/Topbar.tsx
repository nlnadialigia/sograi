import { Sun, Moon, Loader2, Settings } from "lucide-react"
import { Theme } from "../../types"

interface TopbarProps {
  title: string
  subtitle: string
  theme: Theme
  toggleTheme: () => void
  user?: any
  onLogout?: () => void
  bgAnalysis?: { running: boolean; percent: number; prId?: number | null } | null
  onGoToAnalysis?: () => void
  onGoToAdmin?: () => void
}

export function Topbar({
  title,
  subtitle,
  theme,
  toggleTheme,
  bgAnalysis,
  onGoToAnalysis,
  onGoToAdmin,
}: TopbarProps) {
  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 px-6 sm:px-8 flex items-center justify-between shrink-0">
      <div>
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">
          {title}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {bgAnalysis?.running && (
          <button
            onClick={onGoToAnalysis}
            title="Clique para acompanhar a análise em andamento"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-semibold hover:bg-amber-500/20 transition-all cursor-pointer animate-pulse"
          >
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Analisando PR #{bgAnalysis.prId || ''} ({bgAnalysis.percent}%)</span>
          </button>
        )}

        {/* Botão de Administração / Configurações */}
        <button
          onClick={onGoToAdmin}
          aria-label="Abrir Configurações e Orientações"
          title="Configurações e Orientações"
          className="p-2.5 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
        >
          <Settings className="w-4 h-4 text-slate-600 dark:text-slate-300" />
        </button>

        {/* Alternador de tema Claro / Escuro */}
        <button
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
          className="p-2.5 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>
      </div>
    </header>
  )
}

