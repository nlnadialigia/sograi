export interface UpsertPullRequestInput {
  pr_id: string;
  title: string;
  author: string;
  organization: string;
  project: string;
  repository: string;
  source_branch: string;
  target_branch: string;
  status: string;
  decision: string;
  risk_level: string;
  executive_summary: string;
  total_files_changed: number;
  files_with_issues: number;
  time_to_fix?: string;
  executive_verdict?: string;
  change_summary?: string;
  recommendation?: string;
  executive_markdown?: string;
  spec_markdown?: string;
  full_markdown?: string;
}

export function mapPullRequestSummary(pr: any, hasActivePending?: boolean) {
  const activePending =
    hasActivePending !== undefined
      ? hasActivePending
      : (pr.filesWithIssues ?? 0) > 0;

  return {
    id: pr.id,
    pull_request_id: pr.pullRequestId,
    organization: pr.organization,
    project: pr.project,
    repository: pr.repository,
    title: pr.title,
    author: pr.author,
    source_branch: pr.sourceBranch,
    target_branch: pr.targetBranch,
    status: pr.status,
    decision: pr.decision,
    risk_level: pr.riskLevel,
    executive_summary: pr.executiveSummary,
    total_files_changed: pr.totalFilesChanged,
    files_with_issues: pr.filesWithIssues,
    has_active_pending: activePending,
    time_to_fix: pr.timeToFix,
    executive_verdict: pr.executiveVerdict,
    change_summary: pr.changeSummary,
    recommendation: pr.recommendation,
    is_archived: pr.isArchived,
    iteration: pr.iteration,
    created_at: pr.createdAt,
    updated_at: pr.updatedAt,
    executive_markdown: pr.executiveMarkdown,
    spec_markdown: pr.specMarkdown,
    files_count: pr._count?.fileReviews || 0,
  };
}
