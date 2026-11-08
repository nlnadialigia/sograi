import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { DetailPage } from "./DetailPage"
import { ToastProvider } from "../ui/toast"
import { Review } from "../../types"

// Mock do @react-pdf/renderer para evitar execução em ambiente DOM
vi.mock("@react-pdf/renderer", () => ({
  pdf: vi.fn(),
  Document: () => null,
  Page: () => null,
  Text: () => null,
  View: () => null,
  StyleSheet: { create: () => ({}) },
}))

describe("DetailPage - Ação Spec de Correção", () => {
  beforeEach(() => {
    vi.spyOn(global, "fetch").mockImplementation(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve(null),
      } as any)
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const baseReview: Review = {
    id: "REV-1",
    dbId: 1,
    pr: "100",
    title: "PR Teste",
    repository: "meu-repo",
    author: "Dev User",
    authorAvatar: "",
    authorInitials: "DU",
    date: "08/11/2026",
    status: "Aprovada",
    risk: "Baixo",
    blockers: 0,
    warnings: 0,
    suggestions: 0,
    notes: 0,
    filesCount: 3,
    filesWithIssues: 0,
    hasActivePending: false,
    isArchived: false,
  }

  it("deve desabilitar o botão de Spec de Correção se a PR não tiver pendências ativas", () => {
    render(
      <ToastProvider>
        <DetailPage review={baseReview} onBack={vi.fn()} />
      </ToastProvider>
    )

    const specButton = screen.getByRole("button", { name: /spec de correção/i })
    expect(specButton).toBeDisabled()
    expect(specButton).toHaveAttribute("title", "Nenhuma pendência ativa nesta PR")
  })

  it("deve habilitar o botão de Spec de Correção se a PR tiver pendências ativas", () => {
    const reviewWithIssues: Review = {
      ...baseReview,
      id: "REV-2",
      dbId: 2,
      status: "Reprovada",
      filesWithIssues: 2,
      hasActivePending: true,
    }

    render(
      <ToastProvider>
        <DetailPage review={reviewWithIssues} onBack={vi.fn()} />
      </ToastProvider>
    )

    const specButton = screen.getByRole("button", { name: /spec de correção/i })
    expect(specButton).not.toBeDisabled()
    expect(specButton).toHaveAttribute(
      "title",
      "Baixar plano de ação Markdown para a IDE"
    )
  })
})
