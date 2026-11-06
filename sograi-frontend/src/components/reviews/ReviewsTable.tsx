import {
  Archive,
  BookmarkPlus,
  ExternalLink,
  Eye,
  GitBranch,
  MoreVertical,
  RotateCcw,
  Trash2,
  Wrench
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Review } from "../../types";
import { RiskBadge, StatusBadge } from "../common/Badges";
import { AlertDialog } from "../ui/alert-dialog";
import { AddPendingModal } from "./AddPendingModal";

interface ReviewsTableProps {
  reviews: Review[];
  onOpen: (review: Review) => void;
  onToggleArchive: (id: string) => void;
  onDelete: (id: string) => void;
  archivedView?: boolean;
}

export function ReviewsTable({
  reviews,
  onOpen,
  onToggleArchive,
  onDelete,
  archivedView = false,
}: ReviewsTableProps) {
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [deleteConfirmReview, setDeleteConfirmReview] = useState<Review | null>(
    null,
  );
  const [pendingModalReview, setPendingModalReview] = useState<Review | null>(
    null,
  );
  const [reviewFiles, setReviewFiles] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdownId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpenPendingModal = async (review: Review) => {
    setOpenDropdownId(null);
    setPendingModalReview(review);
    setReviewFiles([]);

    if (review.dbId) {
      try {
        const res = await fetch(`/api/reviews/${review.dbId}`);
        const data = await res.json();
        if (data?.files) {
          setReviewFiles(data.files.map((f: any) => f.file_path));
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const formatAuthorName = (fullName: string) => {
    const parts = (fullName || "").trim().split(" ").filter(Boolean);
    if (parts.length <= 1) return (fullName || "Desconhecido").toUpperCase();
    return `${parts[0]} ${parts[parts.length - 1]}`.toUpperCase();
  };

  const getAzureUrl = (review: Review) => {
    const org = review.organization;
    const proj = review.project;
    return `https://dev.azure.com/${org}/${proj}/_git/${review.repository}/pullrequest/${review.pr}`;
  };

  return (
    <>
      <div className="overflow-x-auto min-h-[calc(100vh-14rem)] rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/30">
              <th className="py-3 px-3 text-center w-14">Ações</th>
              <th className="py-3 px-4 min-w-[220px]">Repositório & PR</th>
              <th className="py-3 px-4">Autor</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Risco</th>
              <th className="py-3 px-4">Iteração</th>
              <th className="py-3 px-4">Data</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {reviews.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-12 text-center text-slate-400 dark:text-slate-500"
                >
                  Nenhuma análise encontrada.
                </td>
              </tr>
            ) : (
              reviews.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  onClick={() => onOpen(item)}
                >
                  <td
                    className="py-3.5 px-3 text-center relative"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div
                      className="relative inline-block text-left"
                      ref={openDropdownId === item.id ? dropdownRef : undefined}
                    >
                      <button
                        onClick={() =>
                          setOpenDropdownId(
                            openDropdownId === item.id ? null : item.id,
                          )
                        }
                        className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
                        title="Opções"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {openDropdownId === item.id && (
                        <div className="absolute left-0 sm:left-full top-0 ml-1 z-30 w-52 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-1.5 shadow-xl text-left animate-in fade-in zoom-in-95 duration-100">
                          <button
                            onClick={() => {
                              onOpen(item);
                              setOpenDropdownId(null);
                            }}
                            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 text-amber-500" />
                            <span>Visualizar Parecer</span>
                          </button>

                          {!archivedView && (
                            <button
                              onClick={() => handleOpenPendingModal(item)}
                              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              <BookmarkPlus className="w-3.5 h-3.5 text-amber-500" />
                              <span>Adicionar Pendências</span>
                            </button>
                          )}

                          <a
                            href={getAzureUrl(item)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-sky-500" />
                            <span>Abrir no Azure</span>
                          </a>

                          {!archivedView && item.dbId && (
                            <button
                              onClick={() => {
                                window.open(
                                  `/api/reviews/${item.dbId}/spec`,
                                  "_blank",
                                );
                                setOpenDropdownId(null);
                              }}
                              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              <Wrench className="w-3.5 h-3.5 text-amber-500" />
                              <span>Spec de Correção (.md)</span>
                            </button>
                          )}

                          <button
                            onClick={() => {
                              onToggleArchive(item.id);
                              setOpenDropdownId(null);
                            }}
                            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            {archivedView ? (
                              <>
                                <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
                                <span>Desarquivar</span>
                              </>
                            ) : (
                              <>
                                <Archive className="w-3.5 h-3.5 text-slate-400" />
                                <span>Arquivar</span>
                              </>
                            )}
                          </button>

                          <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                          <button
                            onClick={() => {
                              setDeleteConfirmReview(item);
                              setOpenDropdownId(null);
                            }}
                            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Excluir Análise</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                        PR #{item.pr}
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">
                        •
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        {item.repository}
                      </span>
                    </div>
                    <p className="font-semibold text-slate-900 dark:text-white line-clamp-1">
                      {item.title}
                    </p>
                    {item.sourceBranch && (
                      <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400 font-mono">
                        <GitBranch className="w-3 h-3 text-slate-400" />
                        <span>
                          {item.sourceBranch} ➔ {item.targetBranch || "main"}
                        </span>
                      </div>
                    )}
                  </td>

                  <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200 tracking-wide uppercase">
                    {formatAuthorName(item.author)}
                  </td>

                  <td className="py-3.5 px-4">
                    <StatusBadge status={item.status} />
                  </td>

                  <td className="py-3.5 px-4">
                    <RiskBadge risk={item.risk} />
                  </td>

                  <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-300">
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800">
                      v{item.iteration || 1}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                    {item.date}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AlertDialog
        isOpen={!!deleteConfirmReview}
        onClose={() => setDeleteConfirmReview(null)}
        title="Excluir Análise Definitivamente"
        description={`Tem certeza de que deseja remover a análise da PR #${deleteConfirmReview?.pr} (${deleteConfirmReview?.title})? Esta ação não pode ser desfeita.`}
        confirmText="Sim, excluir"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={() => {
          if (deleteConfirmReview) {
            onDelete(deleteConfirmReview.id);
            setDeleteConfirmReview(null);
          }
        }}
      />

      {pendingModalReview && (
        <AddPendingModal
          isOpen={!!pendingModalReview}
          onClose={() => setPendingModalReview(null)}
          pr={{
            prId: pendingModalReview.pr,
            repository: pendingModalReview.repository,
            files: reviewFiles,
          }}
          onSaved={() => {}}
        />
      )}
    </>
  );
}
