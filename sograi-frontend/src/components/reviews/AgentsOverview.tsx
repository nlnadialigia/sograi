import { agents } from "../../data/constants"

export function AgentsOverview() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {agents.map((agent) => (
        <div
          key={agent.name}
          className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-mono font-bold text-xs flex items-center justify-center shrink-0">
            {agent.icon}
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              {agent.name}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {agent.desc}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
