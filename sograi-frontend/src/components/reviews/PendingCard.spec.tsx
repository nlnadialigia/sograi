import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { PendingCard } from "./PendingCard"
import { ManualPendingItem } from "../../types"

describe("PendingCard Unit Tests", () => {
  const mockItem: ManualPendingItem = {
    id: 1,
    pull_request_id: "100",
    repository: "sograi-backend",
    file_path: "src/modules/reviews/analysis-queue.service.ts",
    title: "Dividir responsabilidade",
    description: "Serviço com métodos que podem ser extraídos para melhor coesão.",
    item_type: "TECH_DEBT",
    priority: "HIGH",
    author_name: "Tech Lead",
    status: "PENDING",
    created_at: "2026-11-06",
  }

  it("deve dividir corretamente o caminho longo em nome do arquivo e diretório", () => {
    render(
      <PendingCard
        item={mockItem}
        onResolve={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    )

    // Nome base em destaque
    expect(screen.getByText("analysis-queue.service.ts")).toBeInTheDocument()
    // Diretório suave logo abaixo
    expect(screen.getByText("src/modules/reviews/")).toBeInTheDocument()
    // Repositório
    expect(screen.getByText("sograi-backend")).toBeInTheDocument()
  })

  it("deve abrir o menu de ações ao clicar nos 3 pontinhos e permitir marcar como resolvido", () => {
    const handleResolve = vi.fn()
    render(
      <PendingCard
        item={mockItem}
        onResolve={handleResolve}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    )

    // O botão de 3 pontinhos
    const actionButton = screen.getByTitle("Ações")
    fireEvent.click(actionButton)

    // Opção "Marcar Resolvido" visível no dropdown
    const resolveOption = screen.getByText("Marcar Resolvido")
    expect(resolveOption).toBeInTheDocument()

    fireEvent.click(resolveOption)
    expect(handleResolve).toHaveBeenCalledWith(mockItem)
  })

  it("deve disparar o callback onDelete ao clicar em Excluir Pendência", () => {
    const handleDelete = vi.fn()
    render(
      <PendingCard
        item={mockItem}
        onResolve={vi.fn()}
        onEdit={vi.fn()}
        onDelete={handleDelete}
      />
    )

    fireEvent.click(screen.getByTitle("Ações"))
    const deleteOption = screen.getByText("Excluir Pendência")
    fireEvent.click(deleteOption)

    expect(handleDelete).toHaveBeenCalledWith(mockItem)
  })

  it("deve exibir as notas de resolução quando o item estiver com status RESOLVED", () => {
    const resolvedItem: ManualPendingItem = {
      ...mockItem,
      status: "RESOLVED",
      resolution_notes: "Refatoração concluída no PR #200",
    }

    render(
      <PendingCard
        item={resolvedItem}
        onResolve={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    )

    expect(screen.getByText(/Refatoração concluída no PR #200/)).toBeInTheDocument()
  })
})
