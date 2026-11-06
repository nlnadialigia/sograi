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
  { id: "history", label: "PR's Ativas", icon: "Clock" },
  { id: "pending", label: "Pendências", icon: "BookmarkCheck" },
  { id: "archived", label: "PR's Arquivadas", icon: "Archive" },
  { id: "guides", label: "Orientações", icon: "BookOpen" },
] as const
