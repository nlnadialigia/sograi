import { StatusBadgeProps, RiskBadgeProps } from "../../types"
import { Badge } from "../ui/badge"

export function StatusBadge({ status }: StatusBadgeProps) {
  const map: Record<string, { label: string; variant: "emerald" | "amber" | "rose" | "secondary" }> = {
    Aprovada: { label: "Aprovada", variant: "emerald" },
    APROVADO: { label: "Aprovada", variant: "emerald" },
    Atenção: { label: "Atenção", variant: "amber" },
    ATENÇÃO: { label: "Atenção", variant: "amber" },
    Reprovada: { label: "Reprovada", variant: "rose" },
    REPROVADO: { label: "Reprovada", variant: "rose" },
    "Em Análise": { label: "Em Análise", variant: "amber" },
  }

  const current = map[status] || { label: status, variant: "secondary" as const }

  return (
    <Badge variant={current.variant}>
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          current.variant === "emerald"
            ? "bg-emerald-500"
            : current.variant === "amber"
            ? "bg-amber-500"
            : current.variant === "rose"
            ? "bg-rose-500"
            : "bg-slate-400"
        }`}
      />
      <span>{current.label}</span>
    </Badge>
  )
}

export function RiskBadge({ risk }: RiskBadgeProps) {
  const r = (risk || "Médio").trim().toLowerCase()
  let label = "Médio"
  let variant: "emerald" | "amber" | "rose" | "purple" = "amber"

  if (r.includes("baixo")) {
    label = "Baixo"
    variant = "emerald"
  } else if (r.includes("crítico") || r.includes("critico")) {
    label = "Crítico"
    variant = "purple"
  } else if (r.includes("alto")) {
    label = "Alto"
    variant = "rose"
  } else {
    label = "Médio"
    variant = "amber"
  }

  return (
    <Badge variant={variant}>
      <span>{label}</span>
    </Badge>
  )
}

export function PriorityBadge({ priority }: { priority: string }) {
  const p = (priority || "MEDIUM").trim().toUpperCase()
  let label = "Média"
  let variant: "emerald" | "amber" | "rose" = "amber"

  if (p === "LOW" || p === "BAIXA") {
    label = "Baixa"
    variant = "emerald"
  } else if (p === "HIGH" || p === "ALTA") {
    label = "Alta"
    variant = "rose"
  } else {
    label = "Média"
    variant = "amber"
  }

  return (
    <Badge variant={variant}>
      <span>{label}</span>
    </Badge>
  )
}

export function ItemTypeBadge({ itemType }: { itemType?: string }) {
  const t = (itemType || "TECH_DEBT").trim().toUpperCase()
  let label = "Débito Técnico"
  let className =
    "bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/60"

  if (t === "IMPROVEMENT" || t === "MELHORIA") {
    label = "Melhoria"
    className =
      "bg-sky-100 text-sky-900 dark:bg-sky-950/50 dark:text-sky-300 border-sky-200/60 dark:border-sky-800/60"
  } else if (t === "FUTURE_REFACTOR" || t === "REFATORACAO") {
    label = "Refatoração Futura"
    className =
      "bg-purple-100 text-purple-900 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200/60 dark:border-purple-800/60"
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${className}`}
    >
      {label}
    </span>
  )
}

