import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { SuggestionModal, buildGitHubWebUrl } from "./SuggestionModal"

// Mock do hook useToast
const mockToastError = vi.fn()
const mockToastSuccess = vi.fn()
vi.mock("../ui/toast", () => ({
  useToast: () => ({
    error: mockToastError,
    success: mockToastSuccess,
  }),
}))

describe("SuggestionModal & buildGitHubWebUrl Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })

  it("deve construir a URL do GitHub Web com title, body, labels e autor", () => {
    const url = buildGitHubWebUrl(
      "Correção de layout",
      "O botão está desalinhado",
      "bug",
      { name: "Dev User", email: "dev@teste.com" }
    )

    expect(url).toContain("https://github.com/nlnadialigia/sograi/issues/new")
    expect(url).toContain("title=Corre%C3%A7%C3%A3o+de+layout")
    expect(url).toContain("labels=bug")
    expect(url).toContain("Dev+User")
  })

  it("deve abrir o link do GitHub Web ao clicar no botão 'Abrir no GitHub Web'", () => {
    const windowOpenSpy = vi.spyOn(window, "open").mockImplementation(() => null)

    render(
      <SuggestionModal
        isOpen={true}
        onClose={vi.fn()}
        user={{ name: "Tester" }}
      />
    )

    fireEvent.change(screen.getByPlaceholderText(/Ex: Adicionar exportação/i), {
      target: { value: "Exportar CSV" },
    })
    fireEvent.change(screen.getByPlaceholderText(/Descreva como você gostaria/i), {
      target: { value: "Permitir download em formato CSV" },
    })

    const openWebBtn = screen.getByTitle("Abrir formulário de issue no site do GitHub")
    fireEvent.click(openWebBtn)

    expect(windowOpenSpy).toHaveBeenCalledWith(
      expect.stringContaining("title=Exportar+CSV"),
      "_blank",
      "noopener,noreferrer"
    )
  })

  it("deve exibir banner de fallback quando a API retornar erro de permissão (403)", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({
        message: "Resource not accessible by personal access token",
      }),
    })
    global.fetch = fetchSpy

    const { container } = render(
      <SuggestionModal
        isOpen={true}
        onClose={vi.fn()}
      />
    )

    fireEvent.change(screen.getByPlaceholderText(/Ex: Adicionar exportação/i), {
      target: { value: "Novo recurso" },
    })
    fireEvent.change(screen.getByPlaceholderText(/Descreva como você gostaria/i), {
      target: { value: "Detalhes do recurso" },
    })

    const form = container.querySelector("form")!
    fireEvent.submit(form)

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalled()
      expect(
        screen.getByText(/O token configurado não possui permissão de escrita em issues/i)
      ).toBeInTheDocument()
    })
    expect(mockToastError).toHaveBeenCalledWith(
      "Resource not accessible by personal access token"
    )
  })
})
