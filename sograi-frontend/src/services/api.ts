export interface ReviewItem {
  id: number | string;
  pull_request_id: string;
  title: string;
  author: string;
  organization: string;
  project: string;
  repository: string;
  source_branch: string;
  target_branch: string;
  status: 'Aprovada' | 'Reprovada' | 'Atenção';
  decision: string;
  risk_level: 'Baixo' | 'Médio' | 'Alto' | 'Crítico';
  executive_summary?: string;
  total_files_changed: number;
  files_with_issues: number;
  created_at: string;
  files_count?: number;
  iteration?: number;
  time_to_fix?: string;
}

export interface AnalyzePayload {
  prUrl: string;
  mode?: 'unified' | 'separated';
  model?: string;
  token?: string;
  includeTests?: boolean;
}

export interface AzureRepo {
  id: string;
  name: string;
  url?: string;
}

export interface AzureOpenPr {
  pullRequestId: number;
  title: string;
  repository: string;
  organization: string;
  project: string;
  author: string;
  sourceBranch: string;
  targetBranch: string;
  creationDate: string;
  azureUrl: string;
  alreadyAnalyzed: boolean;
  dbId?: number | null;
  iteration?: number | null;
  lastStatus?: string | null;
  lastRisk?: string | null;
  lastAnalyzedAt?: string | null;
}

export interface AnalyzeResult {
  id: number | string;
  pr: number;
  title: string;
  author: string;
  repository: string;
  status: 'Aprovada' | 'Reprovada' | 'Atenção';
  risk: 'Baixo' | 'Médio' | 'Alto' | 'Crítico';
  filesCount: number;
  executiveText: string;
  executiveContent: string;
  fullContent: string;
  files: any[];
}

const API_BASE = '/api/reviews';

export async function fetchReviews(): Promise<ReviewItem[]> {
  const res = await fetch(API_BASE);
  if (!res.ok) throw new Error('Falha ao buscar histórico de análises.');
  return res.json();
}

export async function fetchReviewDetails(id: number | string): Promise<any> {
  const res = await fetch(`${API_BASE}/${id}`);
  if (!res.ok) throw new Error('Falha ao carregar detalhes da PR.');
  return res.json();
}

export async function analyzePullRequestStream(
  payload: AnalyzePayload,
  onEvent: (event: string, data: any) => void
): Promise<AnalyzeResult> {
  const res = await fetch(`${API_BASE}/analyze-stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Falha ao iniciar stream da análise.');
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error('Corpo da resposta indisponível para streaming.');

  const decoder = new TextDecoder();
  let buffer = '';
  let finalResult: AnalyzeResult | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split('\n\n');
    buffer = parts.pop() || '';

    for (const part of parts) {
      if (!part.trim()) continue;
      const lines = part.split('\n');
      let eventType = 'message';
      let dataText = '';

      for (const line of lines) {
        if (line.startsWith('event:')) {
          eventType = line.replace('event:', '').trim();
        } else if (line.startsWith('data:')) {
          dataText = line.replace('data:', '').trim();
        }
      }

      if (dataText) {
        try {
          const parsed = JSON.parse(dataText);
          onEvent(eventType, parsed);
          if (eventType === 'done') {
            finalResult = parsed;
          } else if (eventType === 'error') {
            throw new Error(parsed.message || 'Erro durante a análise via stream.');
          }
        } catch (e: any) {
          if (eventType === 'error') throw e;
        }
      }
    }
  }

  if (!finalResult) {
    throw new Error('Análise encerrada sem retorno consolidado.');
  }

  return finalResult;
}

export interface AzureProject {
  id: string;
  name: string;
  description?: string;
  url?: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  isPrivate: boolean;
  defaultBranch: string;
  htmlUrl: string;
}

export interface SettingItem {
  key: string;
  value: string;
  category: 'azure' | 'github' | 'ai' | 'general';
  isSecret: boolean;
  isSet: boolean;
  description?: string;
}

export interface UpdateSetting {
  key: string;
  value: string;
  category?: 'azure' | 'github' | 'ai' | 'general';
  isSecret?: boolean;
  description?: string;
}

export interface TestConnectionPayload {
  provider: 'azure' | 'github' | 'gemini';
  credentials?: Record<string, string>;
}

export interface TestConnectionResult {
  success: boolean;
  message: string;
  details?: any;
}

export async function fetchProjects(): Promise<AzureProject[]> {
  const res = await fetch('/api/azure/projects');
  if (!res.ok) throw new Error('Falha ao carregar projetos do Azure DevOps.');
  return res.json();
}

export async function fetchRepositories(project?: string): Promise<AzureRepo[]> {
  const query = project ? `?project=${encodeURIComponent(project)}` : '';
  const res = await fetch(`/api/azure/repositories${query}`);
  if (!res.ok) throw new Error('Falha ao carregar repositórios do Azure DevOps.');
  return res.json();
}

export async function fetchOpenPullRequests(
  repositories?: string[] | string,
  project?: string
): Promise<AzureOpenPr[]> {
  const params = new URLSearchParams();
  if (project) params.set('project', project);

  if (Array.isArray(repositories) && repositories.length > 0) {
    if (!repositories.includes('all')) {
      params.set('repositories', repositories.join(','));
    }
  } else if (typeof repositories === 'string' && repositories && repositories !== 'all') {
    params.set('repository', repositories);
  }

  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`/api/azure/open-prs${query}`);
  if (!res.ok) throw new Error('Falha ao carregar PRs abertas do Azure DevOps.');
  return res.json();
}

export async function fetchGitHubRepositories(): Promise<GitHubRepo[]> {
  const res = await fetch('/api/github/repositories');
  if (!res.ok) throw new Error('Falha ao carregar repositórios do GitHub.');
  return res.json();
}

export async function fetchGitHubOpenPullRequests(
  owner: string,
  repository: string
): Promise<AzureOpenPr[]> {
  const query = `?owner=${encodeURIComponent(owner)}&repository=${encodeURIComponent(repository)}`;
  const res = await fetch(`/api/github/open-prs${query}`);
  if (!res.ok) throw new Error('Falha ao carregar PRs abertas do GitHub.');
  return res.json();
}

export async function fetchSettings(): Promise<SettingItem[]> {
  const res = await fetch('/api/settings');
  if (!res.ok) throw new Error('Falha ao carregar configurações do sistema.');
  return res.json();
}

export async function saveSettings(
  settings: UpdateSetting[]
): Promise<{ success: boolean; message: string }> {
  const res = await fetch('/api/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ settings }),
  });
  if (!res.ok) throw new Error('Falha ao salvar configurações.');
  return res.json();
}

export async function testConnection(
  payload: TestConnectionPayload
): Promise<TestConnectionResult> {
  const res = await fetch('/api/settings/test-connection', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Falha ao testar conexão.');
  return res.json();
}

