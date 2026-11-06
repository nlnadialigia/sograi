import {
  Building,
  CheckCircle2,
  GitBranch,
  KeyRound,
  Loader2,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { testConnection } from "../../services/api";

interface ProviderSettingsTabProps {
  form: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

export function ProviderSettingsTab({
  form,
  onChange,
}: ProviderSettingsTabProps) {
  const [testingAzure, setTestingAzure] = useState(false);
  const [azureStatus, setAzureStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const [testingGitHub, setTestingGitHub] = useState(false);
  const [githubStatus, setGithubStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleTestAzure = async () => {
    setTestingAzure(true);
    setAzureStatus(null);
    try {
      const res = await testConnection({
        provider: "azure",
        credentials: {
          org: form.AZURE_DEVOPS_ORG,
          token: form.AZURE_DEVOPS_TOKEN,
        },
      });
      setAzureStatus(res);
    } catch (e: any) {
      setAzureStatus({
        success: false,
        message: e.message || "Erro ao conectar",
      });
    } finally {
      setTestingAzure(false);
    }
  };

  const handleTestGitHub = async () => {
    setTestingGitHub(true);
    setGithubStatus(null);
    try {
      const res = await testConnection({
        provider: "github",
        credentials: {
          token: form.GITHUB_TOKEN,
          apiUrl: form.GITHUB_API_URL,
        },
      });
      setGithubStatus(res);
    } catch (e: any) {
      setGithubStatus({
        success: false,
        message: e.message || "Erro ao conectar",
      });
    } finally {
      setTestingGitHub(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Seção Azure DevOps */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">
                Azure DevOps
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configurações da organização, projeto e PAT do Azure Repos
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleTestAzure}
            disabled={testingAzure}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 transition-all cursor-pointer"
          >
            {testingAzure ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <KeyRound className="w-3.5 h-3.5" />
            )}
            Testar Conexão
          </button>
        </div>

        {azureStatus && (
          <div
            className={`p-3.5 mb-6 rounded-xl text-xs flex items-center gap-2.5 ${
              azureStatus.success
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-500/30"
            }`}
          >
            {azureStatus.success ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{azureStatus.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Organização Azure DevOps
            </label>
            <input
              type="text"
              placeholder="org ou URL completa"
              value={form.AZURE_DEVOPS_ORG || ""}
              onChange={(e) => onChange("AZURE_DEVOPS_ORG", e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Projeto Padrão
            </label>
            <input
              type="text"
              placeholder="Nome do Projeto"
              value={form.AZURE_DEVOPS_PROJECT || ""}
              onChange={(e) => onChange("AZURE_DEVOPS_PROJECT", e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Personal Access Token (PAT)
            </label>
            <input
              type="password"
              placeholder="Cole seu PAT com escopo Code (Read)..."
              value={form.AZURE_DEVOPS_TOKEN || ""}
              onChange={(e) => onChange("AZURE_DEVOPS_TOKEN", e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Seção GitHub */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-white dark:bg-slate-700 flex items-center justify-center font-bold">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">
                GitHub
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Integração com GitHub.com ou GitHub Enterprise
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleTestGitHub}
            disabled={testingGitHub}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all cursor-pointer"
          >
            {testingGitHub ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <KeyRound className="w-3.5 h-3.5" />
            )}
            Testar Conexão
          </button>
        </div>

        {githubStatus && (
          <div
            className={`p-3.5 mb-6 rounded-xl text-xs flex items-center gap-2.5 ${
              githubStatus.success
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-500/30"
            }`}
          >
            {githubStatus.success ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{githubStatus.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Personal Access Token (PAT GitHub)
            </label>
            <input
              type="password"
              placeholder="ghp_... ou github_pat_..."
              value={form.GITHUB_TOKEN || ""}
              onChange={(e) => onChange("GITHUB_TOKEN", e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              URL da API GitHub
            </label>
            <input
              type="text"
              placeholder="https://api.github.com"
              value={form.GITHUB_API_URL || ""}
              onChange={(e) => onChange("GITHUB_API_URL", e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Organização / Usuário Padrão (Opcional)
            </label>
            <input
              type="text"
              placeholder="ex: user"
              value={form.GITHUB_DEFAULT_OWNER || ""}
              onChange={(e) => onChange("GITHUB_DEFAULT_OWNER", e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
