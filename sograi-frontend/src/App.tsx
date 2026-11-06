import { useState, useEffect, useRef } from "react"
import { Page, Review, Theme, UserProfile, ServicesStatus, ReviewStatus, Risk } from "./types"
import { reviewsSeed, pageTitles, pageSubtitles } from "./data/constants"
import { Sidebar } from "./components/layout/Sidebar"
import { Topbar } from "./components/layout/Topbar"
import { WelcomeScreen } from "./components/layout/WelcomeScreen"
import { NewAnalysis } from "./components/reviews/NewAnalysis"
import { LastAnalysisPage } from "./components/reviews/LastAnalysisPage"
import { HistoryPage } from "./components/reviews/HistoryPage"
import { DetailPage } from "./components/reviews/DetailPage"
import { ReviewsTable } from "./components/reviews/ReviewsTable"
import { PendingPage } from "./components/reviews/PendingPage"
import { AdminPage } from "./components/admin/AdminPage"
import { GuidesPage } from "./components/guides/GuidesPage"
import { useAnalysisRunner } from "./hooks/useAnalysisRunner"


export default function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem("sograi-theme") as Theme | null
    if (saved) return saved
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
  })

  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem("sograi-user")
    if (!saved) return null
    try {
      return JSON.parse(saved)
    } catch {
      return null
    }
  })

  const [page, setPage] = useState<Page>("new")
  const pageRef = useRef<Page>(page)
  pageRef.current = page

  const [completedNotice, setCompletedNotice] = useState<Review | null>(null)
  const [reviews, setReviews] = useState<Review[]>(reviewsSeed)
  const [selectedReview, setSelectedReview] = useState<Review>(reviewsSeed[0])

  const runner = useAnalysisRunner({
    onCreated: (created) => {
      setReviews((prev) => [created, ...prev])
      if (pageRef.current !== "last-analysis") {
        setCompletedNotice(created)
      }
    },
  })
  const [servicesStatus, setServicesStatus] = useState<ServicesStatus>({
    postgres: false,
    gemini: false,
  })

  useEffect(() => {
    const checkHealth = () => {
      fetch("/api/health")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            setServicesStatus({ postgres: !!data.postgres, gemini: !!data.gemini })
          }
        })
        .catch(() => {})
    }

    checkHealth()
    const interval = setInterval(checkHealth, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    fetch("/api/reviews")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped: Review[] = data.map((item) => {
            const author = item.author || "Autor Desconhecido"
            const initials = author
              .split(" ")
              .map((n: string) => n[0])
              .filter(Boolean)
              .slice(0, 2)
              .join("")
              .toUpperCase()

            const dec = (item.decision || item.status || "").toLowerCase()
            const status: ReviewStatus = dec.includes("aprovad")
              ? "Aprovada"
              : dec.includes("reprovad")
                ? "Reprovada"
                : "Atenção"

            const r = (item.risk_level || "").toLowerCase()
            const risk: Risk = r.includes("alt")
              ? "Alto"
              : r.includes("méd") || r.includes("med")
                ? "Médio"
                : "Baixo"

            const dateStr = item.created_at
              ? new Date(item.created_at).toLocaleDateString("pt-BR")
              : "Hoje"

            return {
              id: `REV-${item.id}`,
              dbId: item.id,
              pr: String(item.pull_request_id || "PR"),
              title: item.title || "Revisão de Pull Request",
              repository: item.repository || "azure-repo",
              organization: item.organization,
              project: item.project,
              sourceBranch: item.source_branch,
              targetBranch: item.target_branch,
              author,
              authorAvatar: "",
              authorInitials: initials,
              date: dateStr,
              status,
              risk,
              blockers: item.blockers_count || 0,
              warnings: item.warnings_count || 0,
              suggestions: item.suggestions_count || 0,
              notes: 0,
              archived: !!item.is_archived,
              executiveSummary: item.executive_summary,
              filesCount: item.total_files_changed,
              filesWithIssues: item.files_with_issues,
              iteration: item.iteration || 1,
              timeToFix: item.time_to_fix,
              recommendation: item.recommendation,
            }
          })
          setReviews(mapped)
          if (!selectedReview && mapped.length > 0) {
            setSelectedReview(mapped[0])
          }
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const root = document.documentElement
    if (theme === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
    localStorage.setItem("sograi-theme", theme)
  }, [theme])

  const currentReviews = reviews.filter((review) => !review.archived)
  const archivedReviews = reviews.filter((review) => review.archived)

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"))
  }

  const saveUser = (profile: UserProfile) => {
    setUser(profile)
    localStorage.setItem("sograi-user", JSON.stringify(profile))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("sograi-user")
  }

  const openReview = (review: Review) => {
    setSelectedReview(review)
    setPage("detail")
  }

  const toggleArchive = async (id: string) => {
    const target = reviews.find((r) => r.id === id)
    if (target?.dbId) {
      fetch(`/api/reviews/${target.dbId}/archive`, { method: "PATCH" }).catch(() => {})
    }
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, archived: !r.archived } : r))
    )
  }

  const deleteReview = async (id: string) => {
    const target = reviews.find((r) => r.id === id)
    if (target?.dbId) {
      fetch(`/api/reviews/${target.dbId}`, { method: "DELETE" }).catch(() => {})
    }
    setReviews((prev) => prev.filter((r) => r.id !== id))
    if (selectedReview?.id === id) {
      setPage("history")
    }
  }

  if (!user) {
    return <WelcomeScreen onLogin={saveUser} />
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 overflow-hidden">
      <Sidebar
        page={page}
        setPage={setPage}
        onNew={() => setPage("new")}
        user={user}
        servicesStatus={servicesStatus}
        isAnalyzing={runner.running}
        onLogout={logout}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar
          title={
            page === "last-analysis"
              ? runner.running
                ? "Análise em Andamento"
                : "Última Análise"
              : pageTitles[page] || "SogrAI"
          }
          subtitle={
            page === "last-analysis"
              ? runner.running
                ? "Acompanhe em tempo real o processamento e a emissão dos pareceres pelos agentes especialistas"
                : "Acompanhamento e resultado consolidado da análise mais recente"
              : pageSubtitles[page] || ""
          }
          theme={theme}
          toggleTheme={toggleTheme}
          user={user}
          onLogout={logout}
          bgAnalysis={
            page !== "last-analysis" && runner.running
              ? { running: runner.running, percent: runner.progress, prId: runner.runningPrId }
              : null
          }
          onGoToAnalysis={() => setPage("last-analysis")}
          onGoToAdmin={() => setPage("admin")}
        />

        <main className="flex-1 overflow-y-auto p-8">
          <div className={page === "new" ? "block" : "hidden"}>
            <NewAnalysis
              onStartAnalysis={(config) => {
                runner.startAnalysis(config).catch(() => {})
                setPage("last-analysis")
              }}
              running={runner.running}
              runningPrId={runner.runningPrId}
              onOpenSettings={() => setPage("admin")}
            />
          </div>

          <div className={page === "last-analysis" ? "block" : "hidden"}>
            <LastAnalysisPage
              running={runner.running}
              done={runner.done}
              progress={runner.progress}
              currentStepText={runner.currentStepText}
              activePrMeta={runner.activePrMeta}
              fileLogs={runner.fileLogs}
              currentFileAnalyzing={runner.currentFileAnalyzing}
              analysisResult={runner.analysisResult}
              completedReview={runner.completedReview}
              errorMessage={runner.errorMessage}
              onClearError={runner.clearError}
              onOpenDetail={openReview}
              onGoToNew={() => setPage("new")}
            />
          </div>

          {page === "admin" && (
            <AdminPage />
          )}

          {page === "history" && (
            <HistoryPage
              reviews={currentReviews}
              onOpen={openReview}
              onToggleArchive={toggleArchive}
              onDelete={deleteReview}
            />
          )}

          {page === "pending" && <PendingPage />}
          {page === "guides" && <GuidesPage setPage={setPage} />}


          {page === "archived" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300">
                Esta área reúne análises antigas arquivadas. Elas não interferem nos contadores da visão principal.
              </div>
              <ReviewsTable
                reviews={archivedReviews}
                onOpen={openReview}
                onToggleArchive={toggleArchive}
                onDelete={deleteReview}
                archivedView
              />
            </div>
          )}

          {page === "detail" && (
            <DetailPage review={selectedReview} onBack={() => setPage("history")} />
          )}
        </main>

        {completedNotice && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 p-4 bg-white dark:bg-slate-900 border border-emerald-500/40 rounded-2xl shadow-xl shadow-emerald-500/10 max-w-md">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold shrink-0">
              ✓
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                Análise da PR #{completedNotice.pr} Concluída!
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {completedNotice.title}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-2">
              <button
                onClick={() => {
                  openReview(completedNotice)
                  setCompletedNotice(null)
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
              >
                Ver Parecer
              </button>
              <button
                onClick={() => setCompletedNotice(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
