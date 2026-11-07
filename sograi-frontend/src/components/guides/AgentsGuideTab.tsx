import { Bot, ShieldAlert, Zap, TestTube2, Palette, Crown, CheckSquare, AlertCircle } from "lucide-react"

export function AgentsGuideTab() {
  const agents = [
    {
      id: "tl",
      name: "Tech Lead",
      role: "Juiz Final & Governança de Arquitetura",
      icon: Crown,
      color: "from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400",
      badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
      focus: "Arquitetura, viabilidade, coesão do sistema e impacto de negócio",
      guidelines: [
        "Avalia o parecer individual de cada um dos quatro agentes especialistas.",
        "Pondera se apontamentos são impeditivos ou melhorias não bloqueantes.",
        "Define o veredito final (Aprovado, Ressalvas ou Reprovado) e o nível de risco.",
        "Garante governança de linhas: máximo 500 linhas em serviços backend e 350 no frontend.",
        "Garante que o código siga princípios de modularidade, SOLID e manutenibilidade a longo prazo.",
      ],
    },
    {
      id: "sec",
      name: "Agente de Segurança",
      role: "Auditor OWASP & Proteção de Dados",
      icon: ShieldAlert,
      color: "from-rose-500/20 to-red-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400",
      badgeColor: "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300",
      focus: "Vulnerabilidades, vazamento de segredos e conformidade OWASP",
      guidelines: [
        "Identifica vulnerabilidades OWASP (SQL/NoSQL Injection, XSS, SSRF, IDOR).",
        "Detecta credenciais, chaves de API, senhas ou tokens expostos no código.",
        "Verifica validações e sanitizações de entradas externas de usuários.",
        "Checa autenticação, autorização e manipulação segura de dados sensíveis.",
      ],
    },
    {
      id: "prf",
      name: "Agente de Performance",
      role: "Otimização de Recursos & Escalabilidade",
      icon: Zap,
      color: "from-amber-500/20 to-yellow-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400",
      badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
      focus: "Gargalos de CPU, memória, I/O e consultas a banco de dados",
      guidelines: [
        "Identifica consultas N+1 ao banco de dados e filtros ineficientes em memória.",
        "Aponta loops aninhados com complexidade O(n²) ou superior.",
        "Alerta sobre possíveis memory leaks ou listeners não limpos.",
        "Verifica operações síncronas pesadas que bloqueiam o Event Loop no Node.js.",
      ],
    },
    {
      id: "tst",
      name: "Agente de Cobertura de Testes",
      role: "Garantia de Qualidade & Cenários de Teste",
      icon: TestTube2,
      color: "from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-600 dark:text-cyan-400",
      badgeColor: "bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300",
      focus: "Testabilidade, cenários de borda e regressão",
      guidelines: [
        "Avalia se novos métodos e fluxos de negócio possuem testes unitários correspondentes.",
        "Verifica a cobertura de cenários de erro, exceções e valores nulos/indefinidos.",
        "Identifica asserções frágeis ou testes que não validam comportamento real.",
        "Sugere mocks e cenários de borda que evitam falhas silenciosas em produção.",
      ],
    },
    {
      id: "stl",
      name: "Agente de Estilo & Clean Code",
      role: "Padronização & Legibilidade",
      icon: Palette,
      color: "from-purple-500/20 to-indigo-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400",
      badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300",
      focus: "Nomenclatura, clareza, convenções e tipagem estrita",
      guidelines: [
        "Audita conformidade com padrões TypeScript (evita uso indiscriminado de 'any').",
        "Checa nomenclatura expressiva de variáveis, funções e classes.",
        "Fiscaliza complexidade ciclomática e responsabilidade única de métodos.",
        "Trata migrações de ORM (ex: migration.sql) como artefatos automáticos determinísticos.",
        "Garante documentação clara e remoção de código morto ou comentado.",
      ],
    },
  ]

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">
              O Comitê de Agentes Especialistas de IA
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Conheça os 5 agentes autônomos que analisam cada linha do seu Pull Request
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {agents.map((agent) => {
            const Icon = agent.icon
            return (
              <div
                key={agent.id}
                className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 transition-all hover:border-slate-300 dark:hover:border-slate-700"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br flex items-center justify-center border shrink-0 ${agent.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {agent.name}
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${agent.badgeColor}`}>
                          {agent.role}
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {agent.focus}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-800/80">
                  {agent.guidelines.map((g, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 mt-1.5 shrink-0" />
                      <span>{g}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
