import { Injectable } from '@nestjs/common';
import { GeminiService } from '../gemini/gemini.service';
import { AGENT_PROMPTS } from './prompts';
import { FileAnalysisSchema, ExecutiveSummarySchema } from './analysis.schema';

export interface FileDiffData {
  filePath: string;
  changeType: string;
  originalContent?: string;
  newContent?: string;
}

export interface UnifiedAnalysisResult {
  filePath: string;
  changeType: string;
  verdict: 'APROVADO' | 'REPROVADO';
  justification: string;
  style: string;
  security: string;
  performance: string;
  testCoverage: string;
  issues: any[];
  rawAnalysis: FileAnalysisSchema;
}

@Injectable()
export class AgentsService {
  constructor(private gemini: GeminiService) {}

  private safeSliceContent(content?: string, maxChars = 100000): string {
    if (!content) return '(Arquivo novo ou vazio)';
    if (content.length <= maxChars) return content;
    const truncated = content.slice(0, maxChars);
    const lastNewline = truncated.lastIndexOf('\n');
    const safeCut = lastNewline > 0 ? truncated.slice(0, lastNewline) : truncated;
    return `${safeCut}\n\n// [... Amostra delimitada em ${maxChars} caracteres - restante preservado para análise ...]`;
  }

  private buildFileDiffPrompt(file: FileDiffData): string {
    return `Arquivo: ${file.filePath}
Tipo de Alteração: ${file.changeType}

--- CONTEÚDO ORIGINAL ---
${this.safeSliceContent(file.originalContent)}

--- CONTEÚDO NOVO ---
${this.safeSliceContent(file.newContent)}
`;
  }

  async runUnifiedAnalysis(file: FileDiffData, model?: string): Promise<UnifiedAnalysisResult> {
    const prompt = this.buildFileDiffPrompt(file);
    const parsed: FileAnalysisSchema = await this.gemini.generateJson<FileAnalysisSchema>(
      prompt,
      AGENT_PROMPTS.unifiedJson,
      model
    );

    const isMigration =
      file.filePath.toLowerCase().endsWith('migration.sql') ||
      file.filePath.toLowerCase().includes('/migrations/');
    const isFrontend = /\.(tsx|jsx)$/i.test(file.filePath);
    const isBackendService = /\.service\.ts$/i.test(file.filePath);
    const lineCount = file.newContent ? file.newContent.split('\n').length : 0;

    let verdict: 'APROVADO' | 'REPROVADO' =
      parsed.verdict === 'REPROVADO' ? 'REPROVADO' : 'APROVADO';
    let issues = Array.isArray(parsed.issues) ? [...parsed.issues] : [];

    if (isMigration) {
      verdict = 'APROVADO';
      issues = issues.map((iss) => ({
        ...iss,
        severity: iss.severity === 'BLOCKER' ? 'WARNING' : iss.severity,
      }));
    }

    if (isFrontend && lineCount > 350) {
      verdict = 'REPROVADO';
      const exists = issues.some((i) => i.title?.toLowerCase().includes('350 linhas'));
      if (!exists) {
        issues.unshift({
          category: 'STYLE',
          severity: 'BLOCKER',
          title: `Limite de 350 linhas excedido no Frontend (${lineCount} linhas)`,
          description: `O arquivo possui ${lineCount} linhas, excedendo o teto arquitetural de 350 linhas para frontend. Decomponha em componentes menores.`,
          lineReference: `Total: ${lineCount} linhas`,
        });
      }
    }

    if (isBackendService && lineCount > 500) {
      verdict = 'REPROVADO';
      const exists = issues.some((i) => i.title?.toLowerCase().includes('500 linhas'));
      if (!exists) {
        issues.unshift({
          category: 'STYLE',
          severity: 'BLOCKER',
          title: `Limite de 500 linhas excedido no Serviço Backend (${lineCount} linhas)`,
          description: `O serviço possui ${lineCount} linhas, excedendo o teto arquitetural de 500 linhas. Extraia responsabilidades respeitando o SRP.`,
          lineReference: `Total: ${lineCount} linhas`,
        });
      }
    }

    return {
      filePath: file.filePath,
      changeType: file.changeType,
      verdict,
      justification:
        parsed.justification ||
        (verdict === 'APROVADO'
          ? 'Arquivo aprovado sem impedimentos.'
          : 'Arquivo reprovado por pendências técnicas.'),
      style: parsed.styleNotes || 'Nenhum apontamento.',
      security: parsed.securityNotes || 'Nenhum apontamento.',
      performance: parsed.performanceNotes || 'Desempenho satisfatório.',
      testCoverage: parsed.testNotes || 'Cobertura de testes satisfatória.',
      issues,
      rawAnalysis: parsed,
    };
  }

  async runExecutiveSummary(
    prTitle: string,
    author: string,
    fileResults: UnifiedAnalysisResult[],
    model?: string
  ): Promise<ExecutiveSummarySchema> {
    const promptSummary = `Pull Request: ${prTitle}
Autor: ${author}
Total de Arquivos Analisados: ${fileResults.length}

Resumo dos apontamentos técnicos estruturados por arquivo:
${fileResults.map(f => `
- Arquivo: ${f.filePath} (${f.changeType})
  Veredito: ${f.verdict} (${f.justification})
  Total de Apontamentos: ${f.issues.length}
  Bloqueadores: ${f.issues.filter(i => i.severity === 'BLOCKER').map(i => i.title).join('; ') || 'Nenhum'}
  Alertas: ${f.issues.filter(i => i.severity === 'WARNING').map(i => i.title).join('; ') || 'Nenhum'}
`).join('\n')}
`;

    const summary: ExecutiveSummarySchema = await this.gemini.generateJson<ExecutiveSummarySchema>(
      promptSummary,
      AGENT_PROMPTS.executiveJson,
      model
    );

    return summary;
  }
}
