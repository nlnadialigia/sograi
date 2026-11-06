export interface IssueItem {
  category: 'STYLE' | 'SECURITY' | 'PERFORMANCE' | 'TESTS';
  severity: 'BLOCKER' | 'WARNING' | 'SUGGESTION';
  title: string;
  description: string;
  lineReference?: string;
  suggestedCode?: string;
}

export interface FileAnalysisSchema {
  verdict: 'APROVADO' | 'REPROVADO';
  justification: string;
  styleNotes?: string;
  securityNotes?: string;
  performanceNotes?: string;
  testNotes?: string;
  issues: IssueItem[];
}

export interface ExecutiveSummarySchema {
  decision: 'APROVADA' | 'APROVADA COM RESSALVAS' | 'REPROVADA';
  riskLevel: 'Baixo' | 'Médio' | 'Alto' | 'Crítico';
  estimatedTimeToFix: string;
  changeSummary: string;
  recommendation: string;
  blockers: { filePath: string; issue: string; resolution: string }[];
  technicalDebts: { filePath: string; issue: string; recommendation: string }[];
}

export interface TrackingItem {
  id?: number;
  pull_request_id: string;
  organization: string;
  project: string;
  repository: string;
  file_path: string;
  first_identified_at?: Date;
  initial_decision: string;
  initial_issue_title: string;
  initial_issue_description: string;
  current_status: 'PENDING' | 'RESOLVED' | 'WAIVED' | 'REGRESSED';
  resolved_at?: Date | null;
  resolution_notes?: string | null;
  last_iteration_checked?: number;
}
