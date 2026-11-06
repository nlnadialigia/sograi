import { FileText, Download, LayoutTemplate, Code2, Shield, Sparkles, CheckCircle2 } from "lucide-react"

export function ReportsGuideTab() {
  return (
    <div className="space-y-6">
      {/* Visualização de Relatórios */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <LayoutTemplate className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">
              Relatórios & Modos de Visualização
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Múltiplas perspectivas de análise para diferentes perfis da equipe
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Parecer Técnico Interativo</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              Exibe cards expansíveis com auditoria individual de cada arquivo, pareceres dos 4 agentes especialistas, callout de veredito do TechLead e sugestões de correção de código em dark theme.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
              <FileText className="w-4 h-4 text-blue-500" />
              <span>Relatório Executivo</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              Resumo sintético em Markdown estruturado, perfeito para gerentes de projeto e lideranças, destacando o impacto de negócio, grau de risco e esforço necessário para correção.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
              <Code2 className="w-4 h-4 text-emerald-500" />
              <span>Especificação Técnica</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              Documento formal voltado para arquitetos e desenvolvedores com checklist técnico de aceitação, impactos em contratos de dados e instruções de teste sugeridas pela IA.
            </p>
          </div>
        </div>
      </div>

      {/* Exportação de PDF */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">
              Exportação do Parecer em PDF de Alta Fidelidade
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Documento formal padronizado para anexar a auditorias ou compartilhar com stakeholders
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 space-y-3">
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            O botão <strong>"Baixar Parecer (PDF)"</strong> na barra superior da tela de detalhes gera um documento renderizado em PDF vetorial com o mesmo design visual da aplicação:
          </p>

          <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2 list-disc list-inside pl-1">
            <li>
              <strong>Identidade Visual Vetorial:</strong> Ícones SVG nativos dos agentes especialistas com bordas e cores institucionais nítidas em qualquer zoom.
            </li>
            <li>
              <strong>Cabeçalho Executivo:</strong> Repositório, Autor, Branch de Origem e Destino, ID da PR e Data/Hora da Análise.
            </li>
            <li>
              <strong>Cards Detalhados por Arquivo:</strong> Apresenta a decisão do TechLead, vereditos específicos (Aprovado/Reprovado), apontamentos de segurança e blocos de código formatados com fonte monoespaçada.
            </li>
            <li>
              <strong>Numeração e Rodapé Automático:</strong> Paginação dinâmica (<code className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[11px]">Página X de Y</code>) e carimbo de autenticidade do SogrAI.
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
