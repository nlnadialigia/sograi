import * as React from "react"
import { cn } from "../../lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "amber" | "emerald" | "rose" | "purple"
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "border-transparent bg-amber-500 text-slate-950 font-semibold",
    secondary: "border-transparent bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
    destructive: "border-transparent bg-rose-500 text-white",
    outline: "text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800",
    amber: "border-amber-200/60 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300",
    emerald: "border-emerald-200/60 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300",
    rose: "border-rose-200/60 dark:border-rose-800/60 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300",
    purple: "border-purple-200/60 dark:border-purple-800/60 bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}
