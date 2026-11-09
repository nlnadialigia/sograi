import React, { useState } from "react"
import { FileCode, CheckCircle, XCircle, BookmarkPlus, AlertTriangle } from "lucide-react"
import { AddPendingModal } from "./AddPendingModal"

interface DetailFullReportViewProps {
  fullPr: any
  review: any
}

export function DetailFullReportView({ fullPr, review }: DetailFullReportViewProps) {
  const files = fullPr?.files || []
  const [selectedFileForPending, setSelectedFileForPending] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Parecer Completo de Revisão de Código
          </h3>
          <p className="text-xs text-slate-500">
            Relatório técnico fiel ao padrão original com feedback detalhado de cada especialista
          </p>
        </div>
        <span className="text-xs font-semibold text-slate-500">
          {files.length} arquivo(s) analisado(s)
        </span>
      </div>

      {files.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500">
            {fullPr?.executive_summary || review.executiveSummary || "Nenhum arquivo individual disponível."}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {files.map((file: any) => {
            const isApproved = file.decision === "APROVADO"
            const fileWarnings = (file.issues || []).filter(
              (i: any) => i.severity === "WARNING" || i.severity === "SUGGESTION"
            )
            const isApprovedWithWarnings = isApproved && fileWarnings.length > 0
            const raw = file.raw_analysis || {}
            const styleText = raw.styleNotes || "Nenhum problema encontrado."
            const securityText = raw.securityNotes || "Nenhum risco de segurança identificado."
            const perfText = raw.performanceNotes || "Desempenho satisfatório."
            const testText = raw.testNotes || "Cobertura satisfatória."
            const techLeadText = file.justification || raw.justification || "Sem justificativa registrada."

            return (
              <div
                key={file.id || file.file_path}
                className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs"
              >
                {/* Cabeçalho do arquivo */}
                <div className="px-5 py-3.5 bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-amber-500" />
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                      ## 📄 Revisão do arquivo: <code className="text-amber-600 dark:text-amber-400 font-semibold">{file.file_path}</code>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {!review.isArchived && (
                      <button
                        type="button"
                        onClick={() => setSelectedFileForPending(file.file_path)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 text-[11px] font-semibold cursor-pointer"
                        title="Adicionar pendência/débito técnico para este arquivo"
                      >
                        <BookmarkPlus className="w-3.5 h-3.5" />
                        <span>+ Pendência</span>
                      </button>
                    )}

                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-200/70 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold">
                      {file.change_type || "edit"}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-4 text-xs leading-relaxed">
                  {/* StyleAgent */}
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                      <span>🎨</span>
                      <span>StyleAgent:</span>
                    </h4>
                    <p className="text-slate-700 dark:text-slate-300 pl-5 whitespace-pre-wrap">
                      {styleText}
                    </p>
                  </div>

                  {/* SecurityAgent */}
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                      <span>🔒</span>
                      <span>SecurityAgent:</span>
                    </h4>
                    <p className="text-slate-700 dark:text-slate-300 pl-5 whitespace-pre-wrap">
                      {securityText}
                    </p>
                  </div>

                  {/* PerformanceAgent */}
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                      <span>⚡️</span>
                      <span>PerformanceAgent:</span>
                    </h4>
                    <p className="text-slate-700 dark:text-slate-300 pl-5 whitespace-pre-wrap">
                      {perfText}
                    </p>
                  </div>

                  {/* TestCoverageAgent */}
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                      <span>🧪</span>
                      <span>TestCoverageAgent:</span>
                    </h4>
                    <p className="text-slate-700 dark:text-slate-300 pl-5 whitespace-pre-wrap">
                      {testText}
                    </p>
                  </div>

                  {/* TechLead Decision */}
                  <div
                    className={`p-3.5 rounded-xl border mt-3 ${
                      !isApproved
                        ? "bg-rose-50/60 dark:bg-rose-950/20 border-rose-300/60 dark:border-rose-900/40"
                        : isApprovedWithWarnings
                        ? "bg-amber-50/70 dark:bg-amber-950/25 border-amber-300/70 dark:border-amber-900/50"
                        : "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300/60 dark:border-emerald-900/40"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-1.5">
                      <div className="flex items-center gap-1.5">
                        {!isApproved ? (
                          <>
                            <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                            <span className="font-bold text-rose-900 dark:text-rose-200">
                              TechLead Decision: PR Reprovada
                            </span>
                          </>
                        ) : isApprovedWithWarnings ? (
                          <>
                            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                            <span className="font-bold text-amber-900 dark:text-amber-200">
                              TechLead Decision: Aprovado com Ressalvas
                            </span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span className="font-bold text-emerald-900 dark:text-emerald-200">
                              TechLead Decision: PR Aprovada
                            </span>
                          </>
                        )}
                      </div>

                      {isApprovedWithWarnings && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                          Sincronizado em Pendências
                        </span>
                      )}
                    </div>

                    <p
                      className={`text-xs pl-5 whitespace-pre-wrap leading-relaxed ${
                        !isApproved
                          ? "text-rose-800 dark:text-rose-300"
                          : isApprovedWithWarnings
                          ? "text-amber-900/90 dark:text-amber-200/90"
                          : "text-emerald-800 dark:text-emerald-300"
                      }`}
                    >
                      {techLeadText}
                    </p>

                    {isApprovedWithWarnings && (
                      <div className="mt-3 pt-2.5 border-t border-amber-200/60 dark:border-amber-900/40 space-y-2">
                        <p className="text-[11px] font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1 pl-5">
                          <span>⚠️ Ressalvas elencadas no Resumo Executivo:</span>
                        </p>
                        <div className="space-y-1.5 pl-5">
                          {fileWarnings.map((w: any, idx: number) => (
                            <div
                              key={idx}
                              className="p-2.5 rounded-lg bg-amber-100/60 dark:bg-amber-900/30 border border-amber-200/50 dark:border-amber-900/30 text-xs"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-bold text-amber-950 dark:text-amber-100">
                                  {w.title}
                                </span>
                                {w.category && (
                                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-200/60 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 font-bold">
                                    {w.category}
                                  </span>
                                )}
                              </div>
                              {w.description && (
                                <p className="text-amber-900/80 dark:text-amber-300/80 text-[11px] mt-1 leading-relaxed">
                                  {w.description}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {selectedFileForPending && (
        <AddPendingModal
          isOpen={!!selectedFileForPending}
          onClose={() => setSelectedFileForPending(null)}
          pr={{
            prId: String(review.pr || fullPr?.pull_request_id),
            repository: review.repository || fullPr?.repository,
            files: files.map((f: any) => f.file_path),
          }}
          defaultFilePath={selectedFileForPending}
          onSaved={() => {}}
        />
      )}
    </div>
  )
}
