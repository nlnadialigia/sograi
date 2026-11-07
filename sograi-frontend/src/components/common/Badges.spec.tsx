import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { StatusBadge, RiskBadge, PriorityBadge, ItemTypeBadge } from "./Badges"

describe("Badges Unit Tests", () => {
  describe("StatusBadge", () => {
    it("deve renderizar status APROVADO com texto e estilo apropriado", () => {
      render(<StatusBadge status="APROVADO" />)
      expect(screen.getByText("Aprovada")).toBeInTheDocument()
    })

    it("deve renderizar status REPROVADO", () => {
      render(<StatusBadge status="REPROVADO" />)
      expect(screen.getByText("Reprovada")).toBeInTheDocument()
    })

    it("deve renderizar status ATENÇÃO", () => {
      render(<StatusBadge status="ATENÇÃO" />)
      expect(screen.getByText("Atenção")).toBeInTheDocument()
    })
  })

  describe("RiskBadge", () => {
    it("deve renderizar Risco Baixo", () => {
      render(<RiskBadge risk="Baixo" />)
      expect(screen.getByText("Baixo")).toBeInTheDocument()
    })

    it("deve renderizar Risco Alto", () => {
      render(<RiskBadge risk="Alto" />)
      expect(screen.getByText("Alto")).toBeInTheDocument()
    })

    it("deve renderizar Risco Crítico", () => {
      render(<RiskBadge risk="Crítico" />)
      expect(screen.getByText("Crítico")).toBeInTheDocument()
    })
  })

  describe("PriorityBadge", () => {
    it("deve mapear HIGH para Alta", () => {
      render(<PriorityBadge priority="HIGH" />)
      expect(screen.getByText("Alta")).toBeInTheDocument()
    })

    it("deve mapear LOW para Baixa", () => {
      render(<PriorityBadge priority="LOW" />)
      expect(screen.getByText("Baixa")).toBeInTheDocument()
    })

    it("deve mapear MEDIUM para Média como padrão", () => {
      render(<PriorityBadge priority="MEDIUM" />)
      expect(screen.getByText("Média")).toBeInTheDocument()
    })
  })

  describe("ItemTypeBadge", () => {
    it("deve renderizar Débito Técnico como padrão", () => {
      render(<ItemTypeBadge itemType="TECH_DEBT" />)
      expect(screen.getByText("Débito Técnico")).toBeInTheDocument()
    })

    it("deve renderizar Melhoria", () => {
      render(<ItemTypeBadge itemType="IMPROVEMENT" />)
      expect(screen.getByText("Melhoria")).toBeInTheDocument()
    })

    it("deve renderizar Refatoração Futura", () => {
      render(<ItemTypeBadge itemType="FUTURE_REFACTOR" />)
      expect(screen.getByText("Refatoração Futura")).toBeInTheDocument()
    })
  })

  describe("Snapshots de Badges", () => {
    it("deve corresponder ao snapshot estático de badges", () => {
      const { container } = render(
        <div className="flex gap-2">
          <StatusBadge status="APROVADO" />
          <RiskBadge risk="Baixo" />
          <PriorityBadge priority="HIGH" />
          <ItemTypeBadge itemType="TECH_DEBT" />
        </div>
      )
      expect(container).toMatchSnapshot()
    })
  })
})
