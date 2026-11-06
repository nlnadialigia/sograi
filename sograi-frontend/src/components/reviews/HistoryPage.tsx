import { MetricCard } from "../common/MetricCard"
import { ReviewsTable } from "./ReviewsTable"
import { CheckCircle2, AlertTriangle, XCircle, Clock } from "lucide-react"
import { Review } from "../../types"

interface HistoryPageProps {
  reviews: Review[]
  onOpen: (review: Review) => void
  onToggleArchive: (id: string) => void
  onDelete: (id: string) => void
}

export function HistoryPage({
  reviews,
  onOpen,
  onToggleArchive,
  onDelete,
}: HistoryPageProps) {
  const activeReviews = reviews.filter((r) => !r.archived)
  const approved = activeReviews.filter((r) => r.status === "Aprovada").length
  const attention = activeReviews.filter((r) => r.status === "Atenção").length
  const rejected = activeReviews.filter((r) => r.status === "Reprovada").length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total de PR's Ativas"
          value={activeReviews.length}
          subtext="Auditorias registradas"
          icon={Clock}
          tone="amber"
        />
        <MetricCard
          title="Aprovadas"
          value={approved}
          subtext="Sem bloqueadores críticos"
          icon={CheckCircle2}
          tone="emerald"
        />
        <MetricCard
          title="Atenção"
          value={attention}
          subtext="Requer análise de débitos"
          icon={AlertTriangle}
          tone="amber"
        />
        <MetricCard
          title="Reprovadas"
          value={rejected}
          subtext="Com bloqueadores críticos"
          icon={XCircle}
          tone="rose"
        />
      </div>

      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
          Pull Requests Ativas
        </h3>
        <ReviewsTable
          reviews={activeReviews}
          onOpen={onOpen}
          onToggleArchive={onToggleArchive}
          onDelete={onDelete}
        />
      </div>
    </div>
  )
}
