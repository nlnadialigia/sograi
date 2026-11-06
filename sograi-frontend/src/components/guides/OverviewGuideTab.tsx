import { Sparkles, GitPullRequest, Bot, ShieldCheck, CheckCircle2, AlertTriangle, XCircle } from "lucide-react"

export function OverviewGuideTab() {
  return (
    <div className="space-y-6">
      {/* Banner de Apresentação */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              O que é o SogrAI?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              O SogrAI é uma plataforma avançada de Code Review automatizado que atua como uma bancada rigorosa de auditoria técnica. Inspirado na figura folclórica da sogra exigente — <em>"sempre pronta para achar um defeito naquilo que você fez com carinho"</em> —, o sistema avalia Pull Requests de forma cirúrgica, identificando desde pequenas inconsistências de estilo até vulnerabilidades críticas de segurança antes que o código chegue em produção.
            </p>
          </div>
        </div>
      </div>

      {/* Fluxo Ponta a Ponta */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <GitPullRequest className="w-4 h-4 text-amber-500" />
          Ciclo de Auditoria em 4 Etapas
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 relative">
            <span className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center justify-center mb-2">1</span>
            <p className="font-semibold text-xs text-slate-900 dark:text-white">Seleção & Coleta</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
              Conexão via API com Azure DevOps ou GitHub para coletar diffs, arquivos alterados e metadados da PR.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 relative">
            <span className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center justify-center mb-2">2</span>
            <p className="font-semibold text-xs text-slate-900 dark:text-white">Auditoria dos Agentes</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
              Análise simultânea de Segurança, Performance, Testes e Estilo de Código orientada por IA Generativa.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 relative">
            <span className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center justify-center mb-2">3</span>
            <p className="font-semibold text-xs text-slate-900 dark:text-white">Julgamento Tech Lead</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
              O Tech Lead consolida os apontamentos, pondera a criticidade e emite o veredito final com nota de risco.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 relative">
            <span className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center justify-center mb-2">4</span>
            <p className="font-semibold text-xs text-slate-900 dark:text-white">Rastreamento & Relatórios</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
              Persistência no banco PostgreSQL, rastreamento automático de pendências e exportação em PDF fiel.
            </p>
          </div>
        </div>
      </div>

      {/* Como Interpretar os Vereditos */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          Como Interpretar os Vereditos Oficiais
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Aprovado */}
          <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="font-bold text-xs text-emerald-900 dark:text-emerald-300">APROVADO</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              O código atende aos padrões de arquitetura, segurança e estabilidade. Não há riscos impeditivos identificados. A PR pode ser mergeada com tranquilidade.
            </p>
          </div>

          {/* Atenção / Aprovado com Ressalvas */}
          <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="font-bold text-xs text-amber-900 dark:text-amber-300">APROVADO COM RESSALVAS</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              Não há falhas críticas imediatas, mas foram encontradas sugestões de performance, estilo ou testes adicionais recomendados antes ou após o merge.
            </p>
          </div>

          {/* Reprovado */}
          <div className="p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/50">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span className="font-bold text-xs text-rose-900 dark:text-rose-300">REPROVADO</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              Foram identificados bloqueadores (vulnerabilidades OWASP, quebra de contratos de API, falta crítica de testes ou vazamento de segredos). A PR não deve ser mergeada.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
