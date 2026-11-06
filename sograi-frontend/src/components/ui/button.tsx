import * as React from "react"
import { cn } from "../../lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 disabled:pointer-events-none disabled:opacity-50 cursor-pointer"

    const variants = {
      default:
        "bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 dark:bg-amber-500/20 dark:hover:bg-amber-500/30 dark:active:bg-amber-500/40 dark:text-amber-300 dark:border dark:border-amber-500/40 shadow-xs",
      destructive:
        "bg-rose-500 hover:bg-rose-600 text-white dark:bg-rose-500/20 dark:hover:bg-rose-500/30 dark:text-rose-300 dark:border dark:border-rose-500/40 shadow-xs",
      outline:
        "border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200",
      secondary:
        "bg-amber-100 hover:bg-amber-200 text-amber-900 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 dark:text-amber-300",
      ghost:
        "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300",
      link: "text-amber-600 dark:text-amber-400 underline-offset-4 hover:underline",
    }

    const sizes = {
      default: "h-9 px-4 py-2",
      sm: "h-8 rounded-lg px-3 text-xs",
      lg: "h-10 rounded-xl px-6 text-sm",
      icon: "h-8 w-8 rounded-lg",
    }

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"
