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

  private buildFileDiffPrompt(file: FileDiffData): string {
    return `Arquivo: ${file.filePath}
Tipo de Alteração: ${file.changeType}

--- CONTEÚDO ORIGINAL ---
${file.originalContent ? file.originalContent.slice(0, 15000) : '(Arquivo novo ou vazio)'}

--- CONTEÚDO NOVO ---
${file.newContent ? file.newContent.slice(0, 15000) : '(Arquivo excluído ou vazio)'}
`;
  }

  async runUnifiedAnalysis(file: FileDiffData, model?: string): Promise<UnifiedAnalysisResult> {
    const prompt = this.buildFileDiffPrompt(file);
    const parsed: FileAnalysisSchema = await this.gemini.generateJson<FileAnalysisSchema>(
      prompt,
      AGENT_PROMPTS.unifiedJson,
      model
    );

    const verdict = parsed.verdict === 'REPROVADO' ? 'REPROVADO' : 'APROVADO';
    const issues = Array.isArray(parsed.issues) ? parsed.issues : [];

    return {
      filePath: file.filePath,
      changeType: file.changeType,
      verdict,
      justification: parsed.justification || (verdict === 'APROVADO' ? 'Arquivo aprovado sem impedimentos.' : 'Arquivo reprovado por pendências técnicas.'),
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
