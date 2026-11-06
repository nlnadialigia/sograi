import {
  AlertTriangle,
  BookOpen,
  Lightbulb,
  ShieldCheck
} from "lucide-react";

export function GuidesTab() {
  return (
    <div className="space-y-8">
      {/* Como Gerar o PAT no Azure DevOps */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">
              Guia: Gerando o Personal Access Token (PAT) no Azure DevOps
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Permissão mínima necessária: somente leitura do código fonte
            </p>
          </div>
        </div>

        <ol className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">
              1
            </span>
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                Acesse sua organização no Azure DevOps
              </p>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                Exemplo:{" "}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-700 dark:text-slate-300 font-mono">
                  https://dev.azure.com/org
                </code>
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">
              2
            </span>
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                Abra as Configurações de Usuário
              </p>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                No canto superior direito, clique no ícone de perfil/engrenagem
                e selecione{" "}
                <strong className="text-slate-700 dark:text-slate-300">
                  Personal access tokens
                </strong>
                .
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">
              3
            </span>
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                Crie um Novo Token
              </p>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                Clique em{" "}
                <strong className="text-slate-700 dark:text-slate-300">
                  + New Token
                </strong>{" "}
                e defina o nome (ex:{" "}
                <em className="text-slate-700 dark:text-slate-300">
                  SogrAI Code Review
                </em>
                ).
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">
              4
            </span>
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                Defina o Escopo Mínimo de Permissão
              </p>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                Em <em>Scopes</em>, selecione <em>Custom defined</em> e marque
                apenas{" "}
                <strong className="text-emerald-600 dark:text-emerald-400">
                  Code (Read)
                </strong>
                . A SogrAI não requer permissões de escrita ou administração.
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">
              5
            </span>
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                Copie e Cole na aba Provedores
              </p>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                Salve o token e cole no campo PAT do Azure DevOps.
              </p>
            </div>
          </li>
        </ol>
      </div>

      {/* Como Gerar o Token no GitHub */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
          <div className="w-10 h-10 rounded-xl bg-slate-800 text-white dark:bg-slate-700 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">
              Guia: Gerando o Token de Acesso no GitHub
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Suporte a repositórios públicos, privados e organizações
              corporativas
            </p>
          </div>
        </div>

        <ol className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center font-bold shrink-0">
              1
            </span>
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                Acesse as Configurações de Desenvolvedor no GitHub
              </p>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                Acesse{" "}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-700 dark:text-slate-300 font-mono">
                  github.com/settings/tokens
                </code>
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center font-bold shrink-0">
              2
            </span>
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                Gere um Token Pessoal
              </p>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                Selecione{" "}
                <strong className="text-slate-700 dark:text-slate-300">
                  Generate new token (classic)
                </strong>{" "}
                ou Fine-grained token.
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center font-bold shrink-0">
              3
            </span>
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                Escopos recomendados
              </p>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                Marque o escopo{" "}
                <strong className="text-emerald-600 dark:text-emerald-400">
                  repo
                </strong>{" "}
                (para ler repositórios privados e diffs de PRs) e{" "}
                <strong className="text-emerald-600 dark:text-emerald-400">
                  read:org
                </strong>{" "}
                (se os repositórios estiverem em organização).
              </p>
            </div>
          </li>
        </ol>
      </div>

      {/* Como Interpretar os Pareceres da SogrAI */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 dark:text-white mb-4">
          Interpretação dos Níveis de Severidade
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 space-y-2">
            <div className="flex items-center gap-2 font-bold text-rose-700 dark:text-rose-400">
              <AlertTriangle className="w-4 h-4" />
              <span>BLOCKER</span>
            </div>
            <p className="text-rose-900 dark:text-rose-300">
              Falha crítica de segurança, risco severo de vazamento de dados,
              regressão funcional ou quebra de build. Impede a aprovação da PR.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              <span>WARNING</span>
            </div>
            <p className="text-amber-900 dark:text-amber-300">
              Débito técnico, falta de tratamento de exceção ou gargalo
              potencial de performance. Requer atenção dos revisores.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 space-y-2">
            <div className="flex items-center gap-2 font-bold text-blue-700 dark:text-blue-400">
              <Lightbulb className="w-4 h-4" />
              <span>SUGGESTION</span>
            </div>
            <p className="text-blue-900 dark:text-blue-300">
              Oportunidade de refatoração, melhoria de legibilidade ou aderência
              aos padrões de Clean Code do time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
