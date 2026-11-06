import { MetricCardProps } from "../../types"

export function MetricCard({
  title,
  value,
  subtext,
  icon: Icon,
  tone = "amber",
}: MetricCardProps) {
  const tones = {
    amber:
      "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/40",
    emerald:
      "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/40",
    rose:
      "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200/50 dark:border-rose-800/40",
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {title}
        </p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
          {value}
        </p>
        {subtext && (
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            {subtext}
          </p>
        )}
      </div>
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center border ${
          tones[tone as keyof typeof tones] || tones.amber
        }`}
      >
        <Icon className="w-5 h-5" />
      </div>
    </div>
  )
}
