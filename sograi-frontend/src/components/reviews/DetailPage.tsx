import { pdf } from "@react-pdf/renderer";
import {
  ArrowLeft,
  Bot,
  CheckCircle,
  CheckCircle2,
  Clock,
  Code,
  Download,
  ExternalLink,
  FileText,
  Shield,
  Wrench,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Review } from "../../types";
import { RiskBadge, StatusBadge } from "../common/Badges";
import { DetailExecutiveView } from "./DetailExecutiveView";
import { DetailFullReportView } from "./DetailFullReportView";
import { DetailTrackingView } from "./DetailTrackingView";
import { DetailCategoryIssuesView } from "./DetailCategoryIssuesView";
import { ReviewPdfDocument } from "./ReviewPdfDocument";
import { useToast } from "../ui/toast";

interface DetailPageProps {
  review: Review;
  onBack: () => void;
}

export function DetailPage({ review, onBack }: DetailPageProps) {
  const [selected, setSelected] = useState("Resumo Executivo");
  const [fullPr, setFullPr] = useState<any>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const toast = useToast();

  const opinions = [
    { name: "Resumo Executivo", role: "Executivo", icon: Bot },
    { name: "Parecer Completo", role: "Técnico Integral", icon: FileText },
    { name: "Acompanhamento", role: "Auditoria de Resolução", icon: CheckCircle2 },
    { name: "Segurança", role: "OWASP & Secrets", icon: Shield, agentCategory: "SECURITY" },
    { name: "Performance", role: "Otimização", icon: Zap, agentCategory: "PERFORMANCE" },
    { name: "Testes", role: "Cobertura", icon: CheckCircle, agentCategory: "TESTS" },
    { name: "Estilo", role: "Clean Code", icon: Code, agentCategory: "STYLE" },
  ];

  useEffect(() => {
    if (review.dbId) {
      fetch(`/api/reviews/${review.dbId}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => data && setFullPr(data))
        .catch(() => {});
    }
  }, [review.dbId]);

  const formatAuthorName = (fullName: string) => {
    const parts = (fullName || "").trim().split(" ").filter(Boolean);
    return parts.length <= 1 ? fullName || "Desconhecido" : `${parts[0]} ${parts[parts.length - 1]}`;
  };

  const azureUrl = useMemo(() => {
    const org = review.organization || fullPr?.organization;
    const proj = review.project || fullPr?.project;
    return `https://dev.azure.com/${org}/${proj}/_git/${review.repository}/pullrequest/${review.pr}`;
  }, [review, fullPr]);

  const handleDownloadPdf = async () => {
    try {
      setIsExportingPdf(true);
      toast.info("Processando parecer completo para PDF...");
      let prData = fullPr;
      if (!prData && review.dbId) {
        const res = await fetch(`/api/reviews/${review.dbId}`);
        if (res.ok) {
          prData = await res.json();
          setFullPr(prData);
        }
      }
      prData = prData || review;
      const blob = await pdf(<ReviewPdfDocument pr={prData} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `sograi-parecer-completo-PR-${review.pr || review.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 3000);
      toast.success("Download do PDF iniciado!");
    } catch (err: any) {
      console.error("Erro ao gerar PDF completo:", err);
      toast.error(err.message || "Erro ao exportar PDF.");
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleDownloadSpec = () => {
    if (!hasActivePending) {
      toast.info("Esta PR não possui pendências ativas.");
      return;
    }
    if (review.dbId) {
      window.open(`/api/reviews/${review.dbId}/spec`, "_blank");
    }
  };

  const activeCategory = opinions.find(
    (o) => o.name === selected,
  )?.agentCategory;
  const categoryIssues = useMemo(() => {
    if (!activeCategory || !fullPr?.files) return [];
    const list: any[] = [];
    fullPr.files.forEach((f: any) => {
      (f.issues || []).forEach((iss: any) => {
        if (iss.category === activeCategory) {
          list.push({
            ...iss,
            filePath: f.file_path,
            fileDecision: f.decision,
          });
        }
      });
    });
    return list;
  }, [activeCategory, fullPr]);

  const trackingItems = fullPr?.trackingItems || [];
  const hasActivePending = useMemo(() => {
    if (fullPr) {
      if (fullPr.trackingItems && fullPr.trackingItems.length > 0) {
        return fullPr.trackingItems.some((ti: any) => ti.current_status === "PENDING");
      }
      if (fullPr.has_active_pending !== undefined) return fullPr.has_active_pending;
      return (fullPr.files_with_issues ?? 0) > 0 || (fullPr.files || []).some((f: any) => f.decision === "REPROVADO");
    }
    return review.hasActivePending ?? (review.filesWithIssues ?? 0) > 0;
  }, [fullPr, review]);

  const { blockers, warnings } = useMemo(() => {
    const b: any[] = [];
    const w: any[] = [];
    if (!fullPr?.files) return { blockers: b, warnings: w };
    fullPr.files.forEach((f: any) => {
      (f.issues || []).forEach((iss: any) => {
        if (iss.severity === "BLOCKER") b.push({ ...iss, filePath: f.file_path });
        else if (iss.severity === "WARNING" || iss.severity === "SUGGESTION") {
          w.push({ ...iss, filePath: f.file_path });
        }
      });
    });
    return { blockers: b, warnings: w };
  }, [fullPr]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para a listagem</span>
        </button>

        <div className="flex items-center gap-2">
          {!review.isArchived && (
            <button
              onClick={handleDownloadSpec}
              disabled={!hasActivePending}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-colors ${
                hasActivePending
                  ? "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                  : "border-slate-200/50 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-60"
              }`}
              title={
                hasActivePending
                  ? "Baixar plano de ação Markdown para a IDE"
                  : "Nenhuma pendência ativa nesta PR"
              }
            >
              <Wrench
                className={`w-3.5 h-3.5 ${
                  hasActivePending
                    ? "text-amber-500"
                    : "text-slate-400 dark:text-slate-600"
                }`}
              />
              <span>Spec de Correção (.md)</span>
            </button>
          )}

          <button
            onClick={handleDownloadPdf}
            disabled={isExportingPdf}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-amber-500/30 bg-amber-500/10 dark:bg-amber-500/20 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors cursor-pointer"
            title="Exportar Parecer Completo com todos os arquivos em PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span>
              {isExportingPdf ? "Gerando PDF..." : "Exportar PDF Completo"}
            </span>
          </button>

          <a
            href={azureUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            <span>Abrir no Azure</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                {review.id}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-500">
                PR #{review.pr}
              </span>
              <span className="text-slate-400">•</span>
              <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                {review.repository}
              </span>
              {fullPr?.iteration && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                  Iteração {fullPr.iteration}
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {review.title}
            </h2>
            <div className="flex items-center gap-3 mt-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {formatAuthorName(review.author)}
              </span>
              <span>•</span>
              <span>Analisado em {review.date}</span>
              {fullPr?.total_files_changed && (
                <>
                  <span>•</span>
                  <span>{fullPr.total_files_changed} arquivos modificados</span>
                </>
              )}
              {fullPr?.time_to_fix && (
                <>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                    <Clock className="w-3 h-3" /> {fullPr.time_to_fix}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge status={review.status} />
            <RiskBadge risk={review.risk} />
          </div>
        </div>

        <div className="pt-6">
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
            Visão de Análise
          </p>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {opinions.map((op) => {
              const active = selected === op.name;
              const Icon = op.icon;
              return (
                <button
                  key={op.name}
                  onClick={() => setSelected(op.name)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer ${
                    active
                      ? "bg-amber-500 text-slate-950 font-bold shadow-xs"
                      : "bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{op.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        {selected === "Resumo Executivo" && (
          <DetailExecutiveView
            fullPr={fullPr}
            review={review}
            blockers={blockers}
            warnings={warnings}
          />
        )}

        {selected === "Parecer Completo" && (
          <DetailFullReportView fullPr={fullPr} review={review} />
        )}

        {selected === "Acompanhamento" && (
          <DetailTrackingView
            trackingItems={trackingItems}
            onItemResolved={(id, notes) => {
              if (fullPr?.trackingItems) {
                setFullPr({
                  ...fullPr,
                  trackingItems: fullPr.trackingItems.map((ti: any) =>
                    ti.id === id
                      ? { ...ti, current_status: "RESOLVED", resolution_notes: notes || "Resolvido manualmente pelo usuário.", resolved_at: new Date().toISOString() }
                      : ti
                  ),
                });
              }
            }}
          />
        )}

        {!["Resumo Executivo", "Parecer Completo", "Acompanhamento"].includes(selected) && (
          <DetailCategoryIssuesView
            selected={selected}
            categoryIssues={categoryIssues}
          />
        )}
      </div>
    </div>
  );
}
