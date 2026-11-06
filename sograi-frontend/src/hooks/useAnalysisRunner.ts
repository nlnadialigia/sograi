import { useState } from "react"
import { Review, ReviewStatus, Risk } from "../types"
import { analyzePullRequestStream } from "../services/api"
import { PrProgressMeta, FileProgressLog } from "../components/reviews/AnalysisProgress"

interface UseAnalysisRunnerProps {
  onCreated?: (review: Review) => void
}

export function useAnalysisRunner({ onCreated }: UseAnalysisRunnerProps = {}) {
  const [runningPrId, setRunningPrId] = useState<number | null>(null)
  const [progress, setProgress] = useState(0)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const [currentStepText, setCurrentStepText] = useState("")
  const [activePrMeta, setActivePrMeta] = useState<PrProgressMeta | null>(null)
  const [currentFileAnalyzing, setCurrentFileAnalyzing] = useState<string | null>(null)
  const [fileLogs, setFileLogs] = useState<FileProgressLog[]>([])
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [completedReview, setCompletedReview] = useState<Review | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const startAnalysis = async (config: {
    prUrl: string
    mode: "unified" | "separated"
    selectedAgents: string[]
    includeTests?: boolean
    prMeta?: any
  }) => {
    const prId = config.prMeta?.pullRequestId || null
    setRunning(true)
    setRunningPrId(prId)
    setDone(false)
    setProgress(5)
    setCurrentStepText("Iniciando auditoria da Pull Request...")
    setActivePrMeta(config.prMeta || null)
    setCurrentFileAnalyzing(null)
    setFileLogs([])
    setErrorMessage(null)

    try {
      const data = await analyzePullRequestStream(
        { prUrl: config.prUrl, mode: config.mode, includeTests: config.includeTests },
        (event, eventData) => {
          if (event === "progress") {
            if (eventData.percent !== undefined) setProgress(eventData.percent)
            if (eventData.step) setCurrentStepText(eventData.step)
            if (eventData.meta?.prInfo) {
              setActivePrMeta((prev) => ({ ...prev, ...eventData.meta.prInfo }))
            }
            if (eventData.meta?.currentFile) {
              setCurrentFileAnalyzing(eventData.meta.currentFile)
            }
            if (eventData.meta?.completedFile) {
              setFileLogs((prev) => [...prev, eventData.meta.completedFile])
            }
          }
        }
      )

      setProgress(100)
      setCurrentStepText("Auditoria concluída com sucesso!")
      setRunning(false)
      setRunningPrId(null)
      setCurrentFileAnalyzing(null)
      setDone(true)
      setAnalysisResult(data)

      const author = data.author || "Autor"
      const initials = author
        .split(" ")
        .map((n: string) => n[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase()

      const dec = (data.status || "").toLowerCase()
      const status: ReviewStatus =
        dec.includes("aprovad") && !dec.includes("ressalva")
          ? "Aprovada"
          : dec.includes("reprovad")
            ? "Reprovada"
            : "Atenção"

      const r = (data.risk || "").toLowerCase()
      const risk: Risk = r.includes("alt")
        ? "Alto"
        : r.includes("méd") || r.includes("med")
          ? "Médio"
          : "Baixo"

      const newReview: Review = {
        id: `REV-${data.id || Date.now()}`,
        dbId: Number(data.id),
        pr: String(data.pr || "PR"),
        title: data.title || "Revisão de Pull Request",
        repository: data.repository || "repo",
        author,
        authorAvatar: "",
        authorInitials: initials,
        date: new Date().toLocaleDateString("pt-BR"),
        status,
        risk,
        blockers: 0,
        warnings: 0,
        suggestions: 0,
        notes: 0,
        archived: false,
        executiveSummary: data.executiveText || data.executiveContent,
        filesCount: data.filesCount,
        filesWithIssues: (data.files || []).filter((f: any) => f.verdict === "REPROVADO").length,
      }

      setCompletedReview(newReview)
      onCreated?.(newReview)
      return newReview
    } catch (err: any) {
      setRunning(false)
      setRunningPrId(null)
      setCurrentFileAnalyzing(null)
      setErrorMessage(err.message || "Erro inesperado ao analisar a PR.")
      throw err
    }
  }

  const clearError = () => setErrorMessage(null)

  return {
    running,
    done,
    progress,
    runningPrId,
    currentStepText,
    activePrMeta,
    fileLogs,
    currentFileAnalyzing,
    analysisResult,
    completedReview,
    errorMessage,
    startAnalysis,
    clearError,
  }
}
