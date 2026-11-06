import React, { useState } from "react"
import { FileCode, CheckCircle, XCircle, BookmarkPlus } from "lucide-react"
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
                      isApproved
                        ? "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300/60 dark:border-emerald-900/40"
                        : "bg-rose-50/60 dark:bg-rose-950/20 border-rose-300/60 dark:border-rose-900/40"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      {isApproved ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span className="font-bold text-emerald-900 dark:text-emerald-200">
                            TechLead Decision: PR Aprovada
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                          <span className="font-bold text-rose-900 dark:text-rose-200">
                            TechLead Decision: PR Reprovada
                          </span>
                        </>
                      )}
                    </div>
                    <p
                      className={`text-xs pl-5 whitespace-pre-wrap leading-relaxed ${
                        isApproved
                          ? "text-emerald-800 dark:text-emerald-300"
                          : "text-rose-800 dark:text-rose-300"
                      }`}
                    >
                      {techLeadText}
                    </p>
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
