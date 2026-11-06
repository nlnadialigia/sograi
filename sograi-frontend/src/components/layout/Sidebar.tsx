import { useState } from "react"
import {
  Sparkles,
  PlusCircle,
  Clock,
  Archive,
  Database,
  Cpu,
  ChevronLeft,
  ChevronRight,
  LogOut,
  BookmarkCheck,
  BookOpen,
  Activity,
} from "lucide-react"
import { Page, UserProfile, ServicesStatus } from "../../types"
import { navItems } from "../../data/constants"

interface SidebarProps {
  page: Page
  setPage: (p: Page) => void
  onNew: () => void
  user: UserProfile
  servicesStatus?: ServicesStatus
  isAnalyzing?: boolean
  onLogout?: () => void
}

export function Sidebar({
  page,
  setPage,
  onNew,
  user,
  servicesStatus,
  isAnalyzing,
  onLogout,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()

  const postgresOk = servicesStatus ? servicesStatus.postgres : true
  const geminiOk = servicesStatus ? servicesStatus.gemini : true

  return (
    <aside
      className={`bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col shrink-0 transition-all duration-300 ${
        collapsed ? "w-20" : "w-72"
      }`}
    >
      <div className="p-4 border-b border-slate-100 dark:border-slate-800">
        <div
          className={`flex items-center ${
            collapsed ? "flex-col gap-2.5 justify-center" : "justify-between"
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black shrink-0 border border-amber-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                  SogrAI
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  Code Review Inteligente
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
            title={collapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {!collapsed && (
          <>
            <div className="mt-3 p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30">
              <p className="text-xs leading-relaxed italic text-amber-950 dark:text-amber-300 font-medium">
                "Sempre pronta para achar um defeito naquilo que você fez com carinho."
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1.5" title="Status do PostgreSQL">
                <Database className="w-3.5 h-3.5 text-slate-400" />
                <span>Postgres:</span>
                <span
                  className={`inline-block w-2 h-2 rounded-full ${
                    postgresOk ? "bg-emerald-500" : "bg-rose-500"
                  }`}
                />
              </div>
              <div className="flex items-center gap-1.5" title="Status da chave Gemini">
                <Cpu className="w-3.5 h-3.5 text-slate-400" />
                <span>Gemini:</span>
                <span
                  className={`inline-block w-2 h-2 rounded-full ${
                    geminiOk ? "bg-emerald-500" : "bg-rose-500"
                  }`}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Navegação Principal */}
      <nav className="flex-1 p-3 space-y-1">
        {!collapsed && (
          <p className="px-3 pb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Navegação
          </p>
        )}
        {navItems.map((item) => {
          const active =
            (page === item.id && page !== "detail") ||
            (page === "detail" && item.id === "history")

          let Icon = Clock
          if (item.id === "new") Icon = PlusCircle
          else if (item.id === "last-analysis") Icon = Activity
          else if (item.id === "pending") Icon = BookmarkCheck
          else if (item.id === "archived") Icon = Archive
          else if (item.id === "guides") Icon = BookOpen

          const isLastAnalysis = item.id === "last-analysis"

          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id as Page)}
              className={`relative w-full flex items-center justify-between rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                collapsed ? "justify-center p-2.5" : "px-3 py-2.5"
              } ${
                active
                  ? "bg-amber-100/80 dark:bg-amber-500/15 text-amber-950 dark:text-amber-300 dark:border dark:border-amber-500/30 font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </div>
              {!collapsed && isLastAnalysis && isAnalyzing && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span>Em andamento</span>
                </span>
              )}
              {collapsed && isLastAnalysis && isAnalyzing && (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Perfil & Logout */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800">
        <div
          className={`flex items-center rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800/60 ${
            collapsed ? "justify-center p-2" : "p-2.5 justify-between"
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold flex items-center justify-center text-xs shrink-0">
              {initials}
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {user.name}
                </p>
                <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
              </div>
            )}
          </div>

          {!collapsed && onLogout && (
            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              title="Encerrar sessão"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
