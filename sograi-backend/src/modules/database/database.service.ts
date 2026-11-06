import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { TrackingItem } from '../agents/analysis.schema';
import { UpsertPullRequestInput, mapPullRequestSummary } from './database.types';

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(private readonly prisma: PrismaService) {}

  async isAvailable(): Promise<boolean> {
    return this.prisma.isAvailable();
  }

  async upsertPullRequest(input: UpsertPullRequestInput): Promise<{ id: number; iteration: number; isNew: boolean }> {
    const existing = await this.prisma.pullRequest.findUnique({
      where: {
        organization_project_repository_pullRequestId: {
          organization: input.organization,
          project: input.project,
          repository: input.repository,
          pullRequestId: input.pr_id,
        },
      },
    });

    if (existing) {
      const updated = await this.prisma.pullRequest.update({
        where: { id: existing.id },
        data: {
          title: input.title,
          author: input.author,
          sourceBranch: input.source_branch,
          targetBranch: input.target_branch,
          status: input.status,
          decision: input.decision,
          riskLevel: input.risk_level,
          executiveSummary: input.executive_summary,
          totalFilesChanged: input.total_files_changed,
          filesWithIssues: input.files_with_issues,
          timeToFix: input.time_to_fix,
          executiveVerdict: input.executive_verdict,
          changeSummary: input.change_summary,
          recommendation: input.recommendation,
          executiveMarkdown: input.executive_markdown,
          specMarkdown: input.spec_markdown,
          fullMarkdown: input.full_markdown,
          iteration: existing.iteration + 1,
        },
      });
      return { id: updated.id, iteration: updated.iteration, isNew: false };
    }

    const created = await this.prisma.pullRequest.create({
      data: {
        pullRequestId: input.pr_id,
        title: input.title,
        author: input.author,
        organization: input.organization,
        project: input.project,
        repository: input.repository,
        sourceBranch: input.source_branch,
        targetBranch: input.target_branch,
        status: input.status,
        decision: input.decision,
        riskLevel: input.risk_level,
        executiveSummary: input.executive_summary,
        totalFilesChanged: input.total_files_changed,
        filesWithIssues: input.files_with_issues,
        timeToFix: input.time_to_fix || 'Nenhum',
        executiveVerdict: input.executive_verdict || input.decision,
        changeSummary: input.change_summary || '',
        recommendation: input.recommendation || '',
        executiveMarkdown: input.executive_markdown || null,
        specMarkdown: input.spec_markdown || null,
        fullMarkdown: input.full_markdown || null,
        iteration: 1,
      },
    });

    return { id: created.id, iteration: created.iteration, isNew: true };
  }

  async clearFileReviews(prRecordId: number): Promise<void> {
    await this.prisma.prFileReview.deleteMany({ where: { prId: prRecordId } });
  }

  async saveFileReview(data: {
    prRecordId: number;
    filePath: string;
    decision: string;
    changeType?: string;
    justification?: string;
    rawAnalysis?: any;
    fileLines?: number;
    fileBytes?: number;
  }): Promise<number> {
    const created = await this.prisma.prFileReview.create({
      data: {
        prId: data.prRecordId,
        filePath: data.filePath,
        decision: data.decision,
        changeType: data.changeType || 'edit',
        justification: data.justification || '',
        rawAnalysis: data.rawAnalysis || {},
        fileLines: data.fileLines || 0,
        fileBytes: data.fileBytes || 0,
      },
    });
    return created.id;
  }

  async saveFileIssues(fileReviewId: number, issues: any[]): Promise<void> {
    if (!issues || issues.length === 0) return;
    await this.prisma.prFileIssue.createMany({
      data: issues.map((iss) => ({
        fileReviewId,
        agentCategory: iss.category || 'STYLE',
        severity: iss.severity || 'WARNING',
        title: iss.title || 'Apontamento técnico',
        description: iss.description || '',
        lineReference: iss.lineReference || null,
        suggestedCode: iss.suggestedCode || null,
      })),
    });
  }

  async getTrackingItems(org: string, project: string, repo: string, prId: string): Promise<TrackingItem[]> {
    const rows = await this.prisma.prTrackingItem.findMany({
      where: { organization: org, project, repository: repo, pullRequestId: prId },
    });
    return rows as any;
  }

  async recordOrUpdateTrackingItem(item: {
    prId: string;
    organization: string;
    project: string;
    repository: string;
    filePath: string;
    decision: string;
    issueTitle: string;
    issueDescription: string;
    status: 'PENDING' | 'RESOLVED' | 'WAIVED' | 'REGRESSED';
    resolutionNotes?: string;
    iteration: number;
  }) {
    await this.prisma.prTrackingItem.upsert({
      where: {
        organization_project_repository_pullRequestId_filePath: {
          organization: item.organization,
          project: item.project,
          repository: item.repository,
          pullRequestId: item.prId,
          filePath: item.filePath,
        },
      },
      update: {
        currentStatus: item.status,
        lastIterationChecked: item.iteration,
        resolvedAt: item.status === 'RESOLVED' ? new Date() : undefined,
        resolutionNotes: item.resolutionNotes || undefined,
      },
      create: {
        pullRequestId: item.prId,
        organization: item.organization,
        project: item.project,
        repository: item.repository,
        filePath: item.filePath,
        initialDecision: item.decision,
        initialIssueTitle: item.issueTitle,
        initialIssueDescription: item.issueDescription,
        currentStatus: item.status,
        lastIterationChecked: item.iteration,
        resolutionNotes: item.resolutionNotes || null,
        resolvedAt: item.status === 'RESOLVED' ? new Date() : null,
      },
    });
  }

  async getAllPullRequests(limit: number = 50) {
    const list = await this.prisma.pullRequest.findMany({
      take: limit,
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
      include: { _count: { select: { fileReviews: true } } },
    });
    return list.map(mapPullRequestSummary);
  }

  async toggleArchivePullRequest(id: number) {
    const existing = await this.prisma.pullRequest.findUnique({ where: { id } });
    if (!existing) return null;
    const updated = await this.prisma.pullRequest.update({
      where: { id },
      data: { isArchived: !existing.isArchived },
    });
    return { id: updated.id, is_archived: updated.isArchived };
  }

  async deletePullRequest(id: number) {
    return this.prisma.pullRequest.delete({ where: { id } });
  }

  async getPullRequestDetails(id: number) {
    const pr = await this.prisma.pullRequest.findUnique({
      where: { id },
      include: {
        fileReviews: {
          orderBy: { filePath: 'asc' },
          include: { issues: true, agentReviews: true },
        },
      },
    });
    if (!pr) return null;

    const trackingItems = await this.prisma.prTrackingItem.findMany({
      where: {
        organization: pr.organization || '',
        project: pr.project || '',
        repository: pr.repository || '',
        pullRequestId: pr.pullRequestId,
      },
      orderBy: { firstIdentifiedAt: 'asc' },
    });

    return {
      ...mapPullRequestSummary(pr),
      files: pr.fileReviews.map((fr) => ({
        id: fr.id,
        pr_id: fr.prId,
        file_path: fr.filePath,
        decision: fr.decision,
        change_type: fr.changeType,
        justification: fr.justification,
        raw_analysis: fr.rawAnalysis,
        file_lines: fr.fileLines,
        file_bytes: fr.fileBytes,
        issues: fr.issues.map((i) => ({
          id: i.id,
          category: i.agentCategory,
          severity: i.severity,
          title: i.title,
          description: i.description,
          lineReference: i.lineReference,
          suggestedCode: i.suggestedCode,
        })),
        agent_feedbacks: fr.agentReviews.map((ar) => ({
          agent_name: ar.agentName,
          issues_text: ar.issuesText,
          decision: ar.decision,
        })),
      })),
      trackingItems: trackingItems.map((ti) => ({
        id: ti.id,
        pull_request_id: ti.pullRequestId,
        organization: ti.organization,
        project: ti.project,
        repository: ti.repository,
        file_path: ti.filePath,
        initial_decision: ti.initialDecision,
        initial_issue_title: ti.initialIssueTitle,
        initial_issue_description: ti.initialIssueDescription,
        current_status: ti.currentStatus,
        resolved_at: ti.resolvedAt,
        resolution_notes: ti.resolutionNotes,
        last_iteration_checked: ti.lastIterationChecked,
        first_identified_at: ti.firstIdentifiedAt,
      })),
    };
  }
}
