import React from "react"
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"
import { PdfFileCard } from "./pdf/PdfFileCard"

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingHorizontal: 28,
    paddingBottom: 45,
    fontSize: 8.5,
    fontFamily: "Helvetica",
    color: "#1e293b",
    lineHeight: 1.4,
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: "#f59e0b",
    paddingBottom: 8,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  brandTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#0f172a",
  },
  brandSubtitle: {
    fontSize: 7.5,
    color: "#64748b",
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    fontSize: 8,
    fontWeight: "bold",
  },
  badgeApproved: {
    backgroundColor: "#dcfce7",
    color: "#15803d",
  },
  badgeRejected: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
  },
  badgeWarning: {
    backgroundColor: "#fef3c7",
    color: "#b45309",
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#0f172a",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 3,
    marginBottom: 6,
  },
  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: "#f8fafc",
    padding: 7,
    borderRadius: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  metaItem: {
    width: "50%",
    marginBottom: 3,
  },
  metaLabel: {
    fontSize: 6.5,
    color: "#64748b",
    textTransform: "uppercase",
  },
  metaValue: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#1e293b",
  },
  callout: {
    backgroundColor: "#fffbeb",
    borderLeftWidth: 3,
    borderLeftColor: "#f59e0b",
    padding: 7,
    borderRadius: 4,
    marginBottom: 8,
  },
  calloutText: {
    fontSize: 8,
    color: "#78350f",
    lineHeight: 1.35,
  },
  footer: {
    position: "absolute",
    top: 805,
    left: 28,
    right: 28,
    height: 18,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7,
    color: "#94a3b8",
  },
})

interface ReviewPdfDocumentProps {
  pr: any
}

export function ReviewPdfDocument({ pr }: ReviewPdfDocumentProps) {
  const files = pr.files || []
  const decision = (pr.status || pr.decision || "").toLowerCase()
  const isApproved = decision.includes("aprovad") && !decision.includes("ressalva")
  const isRejected = decision.includes("reprovad")

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandTitle}>SogrAI • Dossiê Técnico Integral de Auditoria</Text>
            <Text style={styles.brandSubtitle}>
              Parecer Completo de Code Review • Iteração {pr.iteration || 1}
            </Text>
          </View>
          <View>
            <Text
              style={[
                styles.badge,
                isApproved
                  ? styles.badgeApproved
                  : isRejected
                    ? styles.badgeRejected
                    : styles.badgeWarning,
              ]}
            >
              {pr.status || pr.decision || "EM ANÁLISE"}
            </Text>
          </View>
        </View>

        {/* Metadados */}
        <View style={styles.metaGrid}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Pull Request</Text>
            <Text style={styles.metaValue}>
              #{pr.pull_request_id || pr.pr} - {pr.title}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Repositório</Text>
            <Text style={styles.metaValue}>{pr.repository}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Autor</Text>
            <Text style={styles.metaValue}>{pr.author}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Risco / Tempo Estimado</Text>
            <Text style={styles.metaValue}>
              {pr.risk_level || pr.risk || "Médio"} • {pr.time_to_fix || "30m"}
            </Text>
          </View>
        </View>

        {/* Síntese Executiva */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Síntese da Mudança</Text>
          <View style={styles.callout}>
            <Text style={styles.calloutText}>
              {pr.change_summary || pr.executive_summary || "Análise executiva completa dos arquivos modificados."}
            </Text>
          </View>
        </View>

        {/* Recomendação do Tech Lead */}
        {pr.recommendation && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recomendação do Tech Lead</Text>
            <Text style={{ fontSize: 7.5, color: "#334155", lineHeight: 1.35 }}>
              {pr.recommendation}
            </Text>
          </View>
        )}

        {/* Auditoria Detalhada por Arquivo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Auditoria Detalhada por Arquivo ({files.length} avaliados)
          </Text>

          {files.map((file: any, fIdx: number) => (
            <PdfFileCard key={fIdx} file={file} />
          ))}
        </View>

        {/* Rodapé fixo */}
        <View style={styles.footer} fixed>
          <Text>SogrAI Code Review • Parecer Técnico Completo</Text>
          <Text
            render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  )
}
