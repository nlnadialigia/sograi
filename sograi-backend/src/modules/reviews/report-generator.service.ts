import { Injectable } from '@nestjs/common';
import { ExecutiveSummarySchema, FileAnalysisSchema } from '../agents/analysis.schema';
import { UnifiedAnalysisResult } from '../agents/agents.service';

@Injectable()
export class ReportGeneratorService {
  generateExecutiveMarkdown(
    prInfo: { prId: string; title: string; author: string; repository: string; iteration: number },
    summary: ExecutiveSummarySchema
  ): string {
    return `# ⚡ Relatório Executivo de Code Review - PR #${prInfo.prId} (Iteração ${prInfo.iteration})
> *"Sempre pronta para achar um defeito naquilo que você fez com carinho."*

- **Título**: ${prInfo.title}
- **Autor**: ${prInfo.author}
- **Repositório**: \`${prInfo.repository}\`
- **Iteração**: ${prInfo.iteration}
- **Data**: ${new Date().toLocaleString('pt-BR')}

---

## 🚦 Veredito Executivo
- **Decisão**: ${summary.decision}
- **Nível de Risco**: ${summary.riskLevel}
- **Tempo estimado de correção**: ${summary.estimatedTimeToFix || 'Nenhum'}

## 🎯 Síntese da Mudança
${summary.changeSummary}

## 🚨 Itens Críticos & Bloqueadores (Must Fix)
${
  summary.blockers && summary.blockers.length > 0
    ? summary.blockers.map((b) => `- **\`${b.filePath}\`**: ${b.issue} \n  *Resolução necessária:* ${b.resolution}`).join('\n')
    : 'Nenhum bloqueador crítico identificado.'
}

## ⚠️ Pontos de Atenção & Débitos Técnicos (Nice to Fix)
${
  summary.technicalDebts && summary.technicalDebts.length > 0
    ? summary.technicalDebts.map((d) => `- **\`${d.filePath}\`**: ${d.issue} \n  *Recomendação:* ${d.recommendation}`).join('\n')
    : 'Nenhum débito técnico relevante apontado.'
}

## 💡 Recomendação para o Aprovador
${summary.recommendation}

---
*Relatório executivo estruturado gerado pela **SogrAI** em ${new Date().toLocaleString('pt-BR')}.*
`;
  }

  generateSpecCorrecao(
    prInfo: { prId: string; title: string; author: string; repository: string; iteration: number },
    rejectedFiles: UnifiedAnalysisResult[],
    summary: ExecutiveSummarySchema
  ): string {
    return `# 🛠️ Spec de Correção e Implementação Técnica - PR #${prInfo.prId} (Iteração ${prInfo.iteration})
> **Objetivo:** Plano de ação prático e focado nos arquivos que necessitam de ajuste antes da aprovação do merge.
> Cole os trechos abaixo ou forneça este arquivo ao seu assistente de IA na IDE para aplicação imediata.

- **Repositório**: \`${prInfo.repository}\`
- **Autor**: ${prInfo.author}
- **Decisão Geral**: ${summary.decision} | **Risco**: ${summary.riskLevel}
- **Tempo Estimado**: ${summary.estimatedTimeToFix || 'N/A'}
- **Data da Análise**: ${new Date().toLocaleString('pt-BR')}

---

## 📋 Resumo das Ações Obrigatórias

${
  rejectedFiles.length === 0
    ? '✅ **Parabéns! Nenhum arquivo foi reprovado.** Todas as alterações atendem aos critérios técnicos.'
    : rejectedFiles
        .map((f, idx) => `${idx + 1}. **\`${f.filePath}\`** - ${f.justification}`)
        .join('\n')
}

---

## 🎯 Arquivos com Pendências para Ajuste

${
  rejectedFiles.length === 0
    ? '_Nenhuma pendência ativa._'
    : rejectedFiles
        .map((f) => `
### 📄 \`${f.filePath}\` (${f.changeType})
- **Status do Arquivo:** ❌ ${f.verdict}
- **Justificativa do Tech Lead:** ${f.justification}

#### Apontamentos Técnicos:
${
  f.issues.length === 0
    ? '- Nenhum item individual cadastrado.'
    : f.issues
        .map(
          (iss) => `
- **[${iss.severity}] ${iss.category} - ${iss.title}**
  - **Problema:** ${iss.description}
  ${iss.lineReference ? `- **Linhas:** \`${iss.lineReference}\`` : ''}
  ${
    iss.suggestedCode
      ? `\n\`\`\`typescript\n// Correção sugerida:\n${iss.suggestedCode}\n\`\`\``
      : ''
  }
`
        )
        .join('\n')
}
---
`).join('\n')
}

## 💡 Instrução de Finalização
Após realizar as correções nos arquivos indicados, realize o commit/push no Azure DevOps e solicite a re-análise na plataforma SogrAI para conferência automática da resolução dos itens.
`;
  }
}
