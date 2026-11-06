import { AgentFinding, ExecutiveParsed } from "../types"

export function parseExecutiveMarkdown(md?: string): ExecutiveParsed {
  if (!md) return { justification: "", blockers: [], suggestions: [] }

  let justification = ""
  // Tenta capturar "## 🎯 Síntese da Mudança" ou "## 🚦 Veredito Executivo" ou outros formatos
  const sinteseMatch = md.match(/## 🎯 Síntese da Mudança\s*\n+([\s\S]*?)(?=\n##|$)/i)
  if (sinteseMatch) {
    justification = sinteseMatch[1].trim()
  } else {
    const justMatch = md.match(/\*\*Justificativa Resumida:\*\*\s*([^\n\r#]+)/i)
    if (justMatch) {
      justification = justMatch[1].trim()
    } else {
      const pMatch = md.match(/##[^\n]+\n+([^#\n\-\*][^\n]+)/)
      if (pMatch) justification = pMatch[1].trim()
    }
  }

  const blockers: { file: string; text: string; title: string; level: string }[] = []
  // Procura por "## 🚨 Itens Críticos & Bloqueadores" ou "### 🛑 Bloqueadores"
  const blockMatch =
    md.match(/## 🚨 Itens Críticos[^\n]*\n([\s\S]*?)(?=\n##|$)/i) ||
    md.match(/### 🛑 Bloqueadores[^\n]*\n([\s\S]*?)(?=###|$)/i)

  if (blockMatch) {
    const lines = blockMatch[1].split("\n").filter((l) => l.trim().startsWith("-") || l.trim().startsWith("*"))
    for (const l of lines) {
      const cleanLine = l.replace(/^[-*]\s*/, "").trim()
      if (
        cleanLine.toLowerCase().includes("nenhum bloqueador") ||
        cleanLine.toLowerCase().includes("nenhum problema")
      ) {
        continue
      }
      const m = cleanLine.match(/^\[(.*?)\]:\s*(.*)/)
      if (m) {
        blockers.push({ file: m[1].trim(), text: m[2].trim(), title: "Bloqueador Crítico", level: "blocker" })
      } else {
        blockers.push({ file: "Geral", text: cleanLine, title: "Bloqueador Crítico", level: "blocker" })
      }
    }
  }

  const suggestions: { file: string; text: string; title: string; level: string }[] = []
  // Procura por "## ⚠️ Pontos de Atenção & Débitos Técnicos" ou "### 💡 Sugestões"
  const sugMatch =
    md.match(/## ⚠️ Pontos de Atenção[^\n]*\n([\s\S]*?)(?=\n##|$)/i) ||
    md.match(/### 💡 Sugestões[^\n]*\n([\s\S]*?)(?=###|$)/i)

  if (sugMatch) {
    const lines = sugMatch[1].split("\n").filter((l) => l.trim().startsWith("-") || l.trim().startsWith("*"))
    for (const l of lines) {
      const cleanLine = l.replace(/^[-*]\s*/, "").trim()
      if (
        cleanLine.toLowerCase().includes("nenhum") ||
        cleanLine.toLowerCase().includes("nenhuma")
      ) {
        continue
      }
      const m = cleanLine.match(/^\[(.*?)\]:\s*(.*)/)
      if (m) {
        suggestions.push({ file: m[1].trim(), text: m[2].trim(), title: "Ponto de Atenção", level: "suggestion" })
      } else {
        suggestions.push({ file: "Geral", text: cleanLine, title: "Ponto de Atenção", level: "suggestion" })
      }
    }
  }

  return { justification, blockers, suggestions }
}

export function parseAgentFeedback(files: any[], agentName: string): AgentFinding[] {
  const findings: AgentFinding[] = []
  const sectionMap: Record<string, { name: string; level: string }> = {
    SecurityAgent: { name: "Segurança", level: "blocker" },
    PerformanceAgent: { name: "Desempenho", level: "warning" },
    TestCoverageAgent: { name: "Cobertura de Testes", level: "suggestion" },
    TechLeadAgent: { name: "Veredito do Tech Lead", level: "warning" },
    StyleAgent: { name: "Estilo & Boas Práticas", level: "note" },
  }

  const target = sectionMap[agentName]
  if (!target || !files || !Array.isArray(files)) return findings

  for (const f of files) {
    const path = f.file_path || f.filePath || "Arquivo"
    const feedbacks = f.agent_feedbacks || []

    // Procura feedback persistido pelo nome do agente
    const match = feedbacks.find(
      (fb: any) =>
        fb.agent_name === agentName ||
        (agentName === "StyleAgent" && fb.agent_name?.includes("Style")) ||
        (agentName === "SecurityAgent" && fb.agent_name?.includes("Security")) ||
        (agentName === "PerformanceAgent" && fb.agent_name?.includes("Performance")) ||
        (agentName === "TestCoverageAgent" && fb.agent_name?.includes("Test")) ||
        (agentName === "TechLeadAgent" && fb.agent_name?.includes("TechLead"))
    )

    if (match && match.issues_text) {
      const text = match.issues_text.trim()
      if (
        text &&
        !text.toLowerCase().includes("nenhum problema") &&
        !text.toLowerCase().includes("não foram encontrados") &&
        !text.toLowerCase().includes("nenhum risco") &&
        !text.toLowerCase().includes("desempenho satisfatório")
      ) {
        findings.push({
          title: `${target.name} - ${path.split("/").pop()}`,
          file: path,
          text,
          level: target.level,
        })
      }
    }
  }

  return findings
}
