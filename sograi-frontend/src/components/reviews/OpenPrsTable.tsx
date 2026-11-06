import React from "react"
import { Play, Loader2, ExternalLink, GitBranch, Calendar, User, CheckCircle2 } from "lucide-react"
import { AzureOpenPr } from "../../services/api"
import { StatusBadge, RiskBadge } from "../common/Badges"

interface OpenPrsTableProps {
  prs: AzureOpenPr[]
  loading: boolean
  runningPrId: number | null
  onAnalyze: (pr: AzureOpenPr) => void
}

export function OpenPrsTable({ prs, loading, runningPrId, onAnalyze }: OpenPrsTableProps) {
  if (loading) {
    return (
      <div className="py-14 text-center">
        <Loader2 className="w-6 h-6 animate-spin text-amber-500 mx-auto mb-2" />
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Buscando PRs abertas no Azure DevOps...
        </p>
      </div>
    )
  }

  if (prs.length === 0) {
    return (
      <div className="py-12 text-center bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-slate-200/60 dark:border-slate-800">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Nenhuma Pull Request aberta encontrada para o filtro selecionado.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 uppercase text-[10px] font-semibold tracking-wider">
            <th className="py-3 px-3 text-center w-28">Ação</th>
            <th className="py-3 px-3">PR & Repositório</th>
            <th className="py-3 px-3">Título</th>
            <th className="py-3 px-3">Autor</th>
            <th className="py-3 px-3">Status SogrAI</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {prs.map((pr) => {
            const isRunningThis = runningPrId === pr.pullRequestId

            return (
              <tr
                key={pr.pullRequestId}
                className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <td className="py-3 px-3 text-center whitespace-nowrap">
                  <button
                    onClick={() => onAnalyze(pr)}
                    disabled={isRunningThis}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isRunningThis
                        ? "bg-amber-500 text-slate-950 opacity-90 cursor-wait"
                        : pr.alreadyAnalyzed
                          ? "bg-slate-100 hover:bg-amber-500 hover:text-slate-950 dark:bg-slate-800 dark:text-slate-200 text-slate-700"
                          : "bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs"
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    {isRunningThis ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Analisando...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 fill-current" />
                        <span>{pr.alreadyAnalyzed ? "Reanalisar" : "Analisar"}</span>
                      </>
                    )}
                  </button>
                </td>

                <td className="py-3 px-3">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <a
                      href={pr.azureUrl || (pr as any).githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono font-bold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
                    >

                      <span>#{pr.pullRequestId}</span>
                      <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                    </a>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <span className="font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                      {pr.repository}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono truncate max-w-xs">
                    <GitBranch className="w-2.5 h-2.5" />
                    <span>{pr.sourceBranch} ➔ {pr.targetBranch}</span>
                  </div>
                </td>

                <td className="py-3 px-3">
                  <p className="font-medium text-slate-800 dark:text-slate-200 line-clamp-1">
                    {pr.title}
                  </p>
                </td>

                <td className="py-3 px-3 whitespace-nowrap text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-400" />
                    <span className="truncate max-w-[120px]">{pr.author}</span>
                  </div>
                </td>

                <td className="py-3 px-3 whitespace-nowrap">
                  {pr.alreadyAnalyzed ? (
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                        Iteração {pr.iteration || 1}
                      </span>
                      {pr.lastStatus && (
                        <StatusBadge
                          status={
                            pr.lastStatus.toLowerCase().includes("aprovad") && !pr.lastStatus.toLowerCase().includes("ressalva")
                              ? "Aprovada"
                              : pr.lastStatus.toLowerCase().includes("reprovad")
                                ? "Reprovada"
                                : "Atenção"
                          }
                        />
                      )}
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                      Não analisada
                    </span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
