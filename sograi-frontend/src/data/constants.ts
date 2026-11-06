import { Review } from "../types"

export const reviewsSeed: Review[] = []

export const agents = [
  { name: "Tech Lead", desc: "Arquitetura e boas práticas", icon: "TL" },
  { name: "Security", desc: "Vulnerabilidades e OWASP", icon: "SEC" },
  { name: "Performance", desc: "Complexidade e gargalos", icon: "PRF" },
  { name: "Test Coverage", desc: "Cenários e cobertura", icon: "TST" },
  { name: "Code Style", desc: "Convenções e legibilidade", icon: "STL" },
]

export const analysisSteps = [
  "Conexão & Diffs (Azure DevOps)",
  "Auditoria Deep Dive (IA)",
  "Consolidação Executiva",
  "Persistência & Artefatos",
]

export const navItems = [
  { id: "new", label: "Nova Análise", icon: "PlusCircle" },
  { id: "last-analysis", label: "Última Análise", icon: "Activity" },
  { id: "history", label: "PR's Ativas", icon: "Clock" },
  { id: "pending", label: "Pendências", icon: "BookmarkCheck" },
  { id: "archived", label: "PR's Arquivadas", icon: "Archive" },
  { id: "guides", label: "Orientações", icon: "BookOpen" },
] as const

export const pageTitles: Record<string, string> = {
  new: "Nova Revisão",
  "last-analysis": "Última Análise",
  history: "Histórico de Análises",
  pending: "Gestão de Pendências & Débitos",
  archived: "Análises Arquivadas",
  detail: "Detalhe do Parecer",
  admin: "Painel de Administração",
  guides: "Central de Orientações",
}

export const pageSubtitles: Record<string, string> = {
  new: "Inicie um novo parecer com os 5 agentes especialistas",
  "last-analysis": "Acompanhamento em tempo real e resultado consolidado da análise mais recente",
  history: "Acompanhe todas as Pull Requests avaliadas pela plataforma",
  pending: "Backlog de melhorias técnicas e débitos registrados para acompanhamento",
  archived: "Revisões finalizadas arquivadas para referência futura",
  detail: "Consolidado técnico dos pareceres e bloqueios encontrados",
  admin: "Configure credenciais do Azure DevOps, GitHub, IA Gemini e consulte as diretrizes",
  guides: "Guia completo de engenharia, agentes, conformidades e boas práticas da SogrAI",
}
