export type Page =
  | "new"
  | "last-analysis"
  | "history"
  | "pending"
  | "archived"
  | "detail"
  | "admin"
  | "guides";

export type ReviewStatus = "Aprovada" | "Reprovada" | "Atenção";

export type Risk = "Baixo" | "Médio" | "Alto" | "Crítico";

export type Theme = "light" | "dark";

export type UserProfile = {
  name: string;
  email: string;
  avatar?: string;
};

export type IssueItem = {
  id?: number;
  category: "STYLE" | "SECURITY" | "PERFORMANCE" | "TESTS";
  severity: "BLOCKER" | "WARNING" | "SUGGESTION";
  title: string;
  description: string;
  lineReference?: string;
  suggestedCode?: string;
};

export type ManualPendingItem = {
  id: number;
  pull_request_id: string;
  repository: string;
  file_path: string;
  title: string;
  description: string;
  item_type: "TECH_DEBT" | "IMPROVEMENT" | "FUTURE_REFACTOR";
  priority: "LOW" | "MEDIUM" | "HIGH";
  author_name: string;
  status: "PENDING" | "RESOLVED";
  resolved_at?: string | null;
  resolution_notes?: string | null;
  created_at: string;
};

export type TrackingItem = {
  id?: number;
  pull_request_id: string;
  repository: string;
  file_path: string;
  first_identified_at: string;
  initial_decision: string;
  initial_issue_title: string;
  initial_issue_description: string;
  current_status: "PENDING" | "RESOLVED" | "WAIVED" | "REGRESSED";
  resolved_at?: string | null;
  resolution_notes?: string | null;
  last_iteration_checked?: number;
};

export type Review = {
  isArchived: any;
  id: string;
  dbId?: number;
  pr: string;
  title: string;
  repository: string;
  organization?: string;
  project?: string;
  sourceBranch?: string;
  targetBranch?: string;
  author: string;
  authorAvatar: string;
  authorInitials: string;
  date: string;
  status: ReviewStatus;
  risk: Risk;
  blockers: number;
  warnings: number;
  suggestions: number;
  notes: number;
  archived?: boolean;
  executiveSummary?: string;
  filesCount?: number;
  filesWithIssues?: number;
  hasActivePending?: boolean;
  iteration?: number;
  timeToFix?: string;
  recommendation?: string;
};

export type ServicesStatus = {
  postgres: boolean;
  gemini: boolean;
  status?: string;
};

export type ExecutiveParsed = {
  justification: string;
  blockers: { file: string; text: string; title: string; level: string }[];
  suggestions: { file: string; text: string; title: string; level: string }[];
};

export type AgentFinding = {
  title: string;
  file: string;
  text: string;
  level: string;
};
