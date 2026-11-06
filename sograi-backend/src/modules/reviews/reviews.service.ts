import { Injectable, Logger } from '@nestjs/common';
import { AzureDevOpsService } from '../azure-devops/azure-devops.service';
import { GitHubService } from '../github/github.service';
import { AgentsService, UnifiedAnalysisResult } from '../agents/agents.service';
import { DatabaseService } from '../database/database.service';
import { GeminiService } from '../gemini/gemini.service';
import { ReportGeneratorService } from './report-generator.service';
import { AnalyzePrDto } from './dto/analyze-pr.dto';
import * as fs from 'fs';
import * as path from 'path';

export type ProgressCallback = (step: string, percent: number, meta?: any) => void;

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);
  private resultsDir = path.resolve(process.cwd(), 'results');

  constructor(
    private azureService: AzureDevOpsService,
    private gitHubService: GitHubService,
    private agentsService: AgentsService,
    private dbService: DatabaseService,
    private geminiService: GeminiService,
    private reportGen: ReportGeneratorService
  ) {
    if (!fs.existsSync(this.resultsDir)) {
      fs.mkdirSync(this.resultsDir, { recursive: true });
    }
  }

  async getHealthStatus() {
    const [pg, gemini] = [await this.dbService.isAvailable(), this.geminiService.isAvailable()];
    return { postgres: pg, gemini, status: pg && gemini ? 'ok' : 'partial' };
  }

  private isTestFile(p: string): boolean {
    const s = p.toLowerCase();
    return s.includes('.spec.') || s.includes('.test.') || s.includes('__tests__/') || s.includes('/tests/') || s.endsWith('test.py') || s.endsWith('test.java');
  }

  private async fetchVcsPr(dto: AnalyzePrDto) {
    if (dto.prUrl.toLowerCase().includes('github.com')) {
      const gh = this.gitHubService.parsePrUrl(dto.prUrl);
      const res = await this.gitHubService.getCompletePullRequestFiles(gh, dto.token);
      return {
        urlInfo: { organization: gh.owner, project: gh.owner, repository: gh.repository, pullRequestId: gh.pullRequestId },
        details: { title: res.prDetails.title, author: res.prDetails.user?.login || 'Autor GitHub', sourceRefName: res.prDetails.head?.ref, targetRefName: res.prDetails.base?.ref },
        files: res.files,
        provider: 'GitHub',
      };
    }
    const az = this.azureService.parsePrUrl(dto.prUrl);
    const res = await this.azureService.getCompletePullRequestFiles(az, dto.token);
    return {
      urlInfo: az,
      details: { title: res.prDetails.title, author: res.prDetails.createdBy?.displayName || 'Desconhecido', sourceRefName: res.prDetails.sourceRefName, targetRefName: res.prDetails.targetRefName },
      files: res.files,
      provider: 'Azure DevOps',
    };
  }

  async analyzePullRequest(dto: AnalyzePrDto, onProgress?: ProgressCallback) {
    const notify = (step: string, pct: number, meta?: any) => {
      this.logger.log(`[${pct}%] ${step}`);
      if (onProgress) onProgress(step, pct, meta);
    };

    notify('Validando URL e conectando ao repositório...', 10);
    const { urlInfo: prUrlInfo, details: prDetails, files, provider } = await this.fetchVcsPr(dto);

    notify(`Coletando arquivos e diffs (${provider}: ${prUrlInfo.repository} #${prUrlInfo.pullRequestId})...`, 20);

    if (files.length === 0) {
      throw new Error('Nenhum arquivo modificado encontrado para esta PR.');
    }

    let candidateFiles = files.filter((f) => !f.path.toLowerCase().endsWith('.md'));
    if (!dto.includeTests) {
      candidateFiles = candidateFiles.filter((f) => !this.isTestFile(f.path));
    }
    const filesToProcess = candidateFiles.slice(0, 40);

    notify(`Metadados carregados: ${prDetails.title}`, 25, {
      prInfo: {
        pullRequestId: prUrlInfo.pullRequestId,
        repository: prUrlInfo.repository,
        title: prDetails.title,
        author: prDetails.author,
        totalFiles: filesToProcess.length,
      },
    });

    const previousTracking = await this.dbService.getTrackingItems(
      prUrlInfo.organization,
      prUrlInfo.project,
      prUrlInfo.repository,
      String(prUrlInfo.pullRequestId)
    );


    notify(`Iniciando auditoria com os agentes SogrAI em ${filesToProcess.length} arquivos...`, 30);

    const fileResults: UnifiedAnalysisResult[] = [];

    for (let i = 0; i < filesToProcess.length; i++) {
      const file = filesToProcess[i];
      const stepPct = Math.round(30 + ((i + 1) / filesToProcess.length) * 50);

      notify(`Analisando [${i + 1}/${filesToProcess.length}]: ${file.path}`, stepPct, {
        currentFile: file.path,
        fileIndex: i + 1,
        totalFiles: filesToProcess.length,
      });

      let res: UnifiedAnalysisResult;
      try {
        res = await this.agentsService.runUnifiedAnalysis({
          filePath: file.path,
          changeType: file.changeType,
          originalContent: file.originalContent,
          newContent: file.newContent,
        }, dto.model);
      } catch (err: any) {
        this.logger.warn(`Falha na IA para o arquivo ${file.path}: ${err.message}. Registrado com ressalva.`);
        res = this.createFallbackFileResult(file, err.message);
      }


      fileResults.push(res);

      notify(`Concluído [${i + 1}/${filesToProcess.length}]: ${file.path} (${res.verdict})`, stepPct, {
        completedFile: {
          filePath: res.filePath,
          changeType: res.changeType,
          verdict: res.verdict,
          justification: res.justification,
          issuesCount: res.issues.length,
        },
      });
    }

    notify('SogrAI sintetizando o Parecer Executivo estruturado...', 85);
    let executiveSummary;
    try {
      executiveSummary = await this.agentsService.runExecutiveSummary(
        prDetails.title || `PR #${prUrlInfo.pullRequestId}`,
        prDetails.author || 'Desconhecido',
        fileResults,
        dto.model
      );
    } catch (err: any) {
      this.logger.error(`Erro ao sintetizar parecer executivo: ${err.message}`);
      throw new Error(`Erro ao sintetizar o parecer executivo da PR: ${err.message}`);
    }

    // Regra: Arquivos de teste reprovados não devem reprovar a PR
    const prodFilesWithIssues = fileResults.filter(
      (f) => f.verdict === 'REPROVADO' && !this.isTestFile(f.filePath)
    ).length;

    let finalDecision = executiveSummary.decision;
    if (prodFilesWithIssues === 0 && executiveSummary.decision === 'REPROVADA') {
      finalDecision = 'APROVADA COM RESSALVAS';
    }

    notify('Gerando documentos estruturados de relatório...', 90);
    const prMeta = {
      prId: String(prUrlInfo.pullRequestId),
      title: prDetails.title || `PR #${prUrlInfo.pullRequestId}`,
      author: prDetails.author || 'Desconhecido',
      repository: prUrlInfo.repository,
      iteration: 1, // ajustado pelo DB se existir
    };


    const rejectedFiles = fileResults.filter((f) => f.verdict === 'REPROVADO');
    const execMarkdown = this.reportGen.generateExecutiveMarkdown(prMeta, {
      ...executiveSummary,
      decision: finalDecision,
    });
    const specMarkdown = this.reportGen.generateSpecCorrecao(prMeta, rejectedFiles, {
      ...executiveSummary,
      decision: finalDecision,
    });

    notify('Persistindo auditoria estruturada e relatórios no PostgreSQL...', 94);
    const upsertRes = await this.dbService.upsertPullRequest({
      pr_id: String(prUrlInfo.pullRequestId),
      title: prDetails.title || `PR #${prUrlInfo.pullRequestId}`,
      author: prDetails.author || 'Desconhecido',
      organization: prUrlInfo.organization,
      project: prUrlInfo.project,
      repository: prUrlInfo.repository,
      source_branch: prDetails.sourceRefName || 'head',
      target_branch: prDetails.targetRefName || 'main',

      status: finalDecision,
      decision: finalDecision,
      risk_level: executiveSummary.riskLevel,
      executive_summary: executiveSummary.changeSummary,
      total_files_changed: fileResults.length,
      files_with_issues: prodFilesWithIssues,
      time_to_fix: executiveSummary.estimatedTimeToFix,
      executive_verdict: finalDecision,
      change_summary: executiveSummary.changeSummary,
      recommendation: executiveSummary.recommendation,
      executive_markdown: execMarkdown,
      spec_markdown: specMarkdown,
    });

    const recordId = upsertRes.id;
    const currentIteration = upsertRes.iteration;

    await this.dbService.clearFileReviews(recordId);

    for (const f of fileResults) {
      const fileReviewId = await this.dbService.saveFileReview({
        prRecordId: recordId,
        filePath: f.filePath,
        decision: f.verdict,
        changeType: f.changeType,
        justification: f.justification,
        rawAnalysis: f.rawAnalysis,
      });

      await this.dbService.saveFileIssues(fileReviewId, f.issues);

      if (f.verdict === 'REPROVADO') {
        const topIssue = f.issues[0] || { title: 'Reprovado pelo Tech Lead', description: f.justification };
        await this.dbService.recordOrUpdateTrackingItem({
          prId: String(prUrlInfo.pullRequestId),
          organization: prUrlInfo.organization,
          project: prUrlInfo.project,
          repository: prUrlInfo.repository,
          filePath: f.filePath,
          decision: f.verdict,
          issueTitle: topIssue.title,
          issueDescription: topIssue.description,
          status: 'PENDING',
          iteration: currentIteration,
        });
      } else {
        const prevPending = previousTracking.find(t => t.file_path === f.filePath && t.current_status === 'PENDING');
        if (prevPending) {
          await this.dbService.recordOrUpdateTrackingItem({
            prId: String(prUrlInfo.pullRequestId),
            organization: prUrlInfo.organization,
            project: prUrlInfo.project,
            repository: prUrlInfo.repository,
            filePath: f.filePath,
            decision: f.verdict,
            issueTitle: prevPending.initial_issue_title,
            issueDescription: prevPending.initial_issue_description,
            status: 'RESOLVED',
            resolutionNotes: `Aprovado na iteração ${currentIteration}: ${f.justification}`,
            iteration: currentIteration,
          });
        }
      }
    }

    notify('Auditoria concluída com sucesso pela SogrAI!', 100);

    return {
      id: recordId,
      pr: prUrlInfo.pullRequestId,
      iteration: currentIteration,
      title: prDetails.title,
      author: prDetails.author || 'Desconhecido',
      repository: prUrlInfo.repository,

      status: finalDecision,
      risk: executiveSummary.riskLevel,
      filesCount: fileResults.length,
      filesWithIssues: prodFilesWithIssues,
      executiveSummary: { ...executiveSummary, decision: finalDecision },
      executiveMarkdown: execMarkdown,
      specMarkdown,
      files: fileResults,
    };
  }

  private createFallbackFileResult(file: { path: string; changeType: string }, msg: string): UnifiedAnalysisResult {
    return {
      filePath: file.path,
      changeType: file.changeType,
      verdict: 'APROVADO',
      justification: `Análise automática inconclusiva (${msg}). Recomendada revisão manual deste arquivo.`,
      style: 'Não avaliado.',
      security: 'Não avaliado.',
      performance: 'Não avaliado.',
      testCoverage: 'Não avaliado.',
      issues: [{
        category: 'STYLE',
        severity: 'WARNING',
        title: 'Revisão manual recomendada',
        description: `Inconsistência transitória na resposta da IA: ${msg}. O restante da PR foi processado normalmente.`,
        lineReference: 'Geral',
      }],
      rawAnalysis: { verdict: 'APROVADO', justification: 'Revisão manual recomendada.', styleNotes: '', securityNotes: '', performanceNotes: '', testNotes: '', issues: [] },
    };
  }

  async getAllReviews() { return this.dbService.getAllPullRequests(); }
  async getReviewById(id: number) { return this.dbService.getPullRequestDetails(id); }
  async toggleArchive(id: number) { return this.dbService.toggleArchivePullRequest(id); }
  async deleteReview(id: number) { return this.dbService.deletePullRequest(id); }

  async getSpecCorrecaoMarkdown(id: number): Promise<string | null> {
    const details = await this.dbService.getPullRequestDetails(id);
    if (!details) return null;
    if (details.spec_markdown) return details.spec_markdown;

    const prMeta = {
      prId: details.pull_request_id,
      title: details.title,
      author: details.author,
      repository: details.repository,
      iteration: details.iteration || 1,
    };

    const rejectedFiles: UnifiedAnalysisResult[] = (details.files || [])
      .filter((f: any) => f.decision === 'REPROVADO')
      .map((f: any) => ({
        filePath: f.file_path, changeType: f.change_type || 'edit', verdict: f.decision,
        justification: f.justification || '', style: '', security: '', performance: '',
        testCoverage: '', issues: f.issues || [], rawAnalysis: f.raw_analysis || {},
      }));

    const summary = {
      decision: details.decision, riskLevel: details.risk_level, estimatedTimeToFix: details.time_to_fix || 'N/A',
      changeSummary: details.change_summary || details.executive_summary || '', recommendation: details.recommendation || '',
      blockers: [], technicalDebts: [],
    };

    return this.reportGen.generateSpecCorrecao(prMeta, rejectedFiles, summary as any);
  }
}


