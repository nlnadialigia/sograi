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
    origin: "MANUAL",
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

    const { container } = render(
      <PendingCard
        item={resolvedItem}
        onResolve={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    )

    expect(screen.getByText(/Refatoração concluída no PR #200/)).toBeInTheDocument()
    expect(screen.getByText("Resolvido")).toBeInTheDocument()
    expect(screen.getByText("Resolvido manualmente")).toBeInTheDocument()
    expect(container.firstChild).toHaveClass("bg-emerald-50/50")
  })

  it("deve exibir identificador da PR quando resolvido automaticamente via PR (Issue #19)", () => {
    const resolvedViaPrItem: ManualPendingItem = {
      ...mockItem,
      status: "RESOLVED",
      resolved_by_pr: "350",
      resolution_notes: "Aprovado na iteração 2",
    }

    render(
      <PendingCard
        item={resolvedViaPrItem}
        onResolve={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    )

    expect(screen.getByText("Resolvido via PR #350")).toBeInTheDocument()
    expect(screen.getByText(/Aprovado na iteração 2/)).toBeInTheDocument()
  })

  it("deve exibir a badge IA Análise para pendências originadas automaticamente", () => {
    const autoItem: ManualPendingItem = {
      ...mockItem,
      origin: "AUTOMATIC_ANALYSIS",
    }

    render(
      <PendingCard
        item={autoItem}
        onResolve={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    )

    expect(screen.getByText("IA Análise")).toBeInTheDocument()
  })

  it("deve exibir e alternar a visualização do histórico de PRs não resolvidas (Issue #13)", () => {
    const itemWithHistory: ManualPendingItem = {
      ...mockItem,
      history: [
        {
          id: 1,
          pending_item_id: 1,
          pull_request_id: "101",
          pr_title: "tentativa 1 de correção",
          author: "junior-dev",
          iteration: 1,
          decision: "REPROVADO",
          justification: "Ainda falta tipagem estrita",
          unresolved_at: "2026-11-07T10:00:00Z",
        },
      ],
    }

    render(
      <PendingCard
        item={itemWithHistory}
        onResolve={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    )

    const toggleBtn = screen.getByText(/1 subida de PR não resolveu/i)
    expect(toggleBtn).toBeInTheDocument()

    // Inicialmente recolhido
    expect(screen.queryByText(/tentativa 1 de correção/i)).not.toBeInTheDocument()

    // Ao clicar, expande
    fireEvent.click(toggleBtn)
    expect(screen.getByText(/tentativa 1 de correção/i)).toBeInTheDocument()
    expect(screen.getByText(/Ainda falta tipagem estrita/i)).toBeInTheDocument()
    expect(screen.getByText(/PR #101/i)).toBeInTheDocument()

    // Ao clicar novamente, recolhe
    fireEvent.click(toggleBtn)
    expect(screen.queryByText(/tentativa 1 de correção/i)).not.toBeInTheDocument()
  })
})
