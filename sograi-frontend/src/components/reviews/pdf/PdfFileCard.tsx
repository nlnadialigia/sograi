import React from "react"
import { View, Text, StyleSheet } from "@react-pdf/renderer"
import {
  PdfFileIcon,
  PdfCheckIcon,
  PdfCrossIcon,
  PdfPaletteIcon,
  PdfShieldIcon,
  PdfZapIcon,
  PdfFlaskIcon,
  PdfAlertIcon,
  PdfLightbulbIcon,
} from "./PdfIcons"

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    borderRadius: 6,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    maxWidth: "75%",
  },
  filePath: {
    fontSize: 8.5,
    fontWeight: "bold",
    color: "#0f172a",
    fontFamily: "Courier",
  },
  changeBadge: {
    fontSize: 6.5,
    fontWeight: "bold",
    textTransform: "uppercase",
    backgroundColor: "#e2e8f0",
    color: "#475569",
    paddingHorizontal: 4,
    paddingVertical: 1.5,
    borderRadius: 3,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  approvedBadge: {
    backgroundColor: "#dcfce7",
  },
  rejectedBadge: {
    backgroundColor: "#fee2e2",
  },
  statusTextApproved: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: "#15803d",
  },
  statusTextRejected: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: "#b91c1c",
  },
  body: {
    padding: 8,
    gap: 6,
  },
  dimensionBlock: {
    backgroundColor: "#f8fafc",
    borderRadius: 4,
    padding: 5,
    borderLeftWidth: 3,
  },
  dimensionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
  },
  dimensionTitle: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: "#1e293b",
  },
  dimensionText: {
    fontSize: 7,
    color: "#334155",
    lineHeight: 1.35,
    paddingLeft: 14,
  },
  calloutDecision: {
    marginTop: 4,
    padding: 6,
    borderRadius: 5,
    borderWidth: 1,
    borderLeftWidth: 4,
  },
  calloutHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
  },
  calloutTitle: {
    fontSize: 8,
    fontWeight: "bold",
  },
  calloutText: {
    fontSize: 7.5,
    lineHeight: 1.35,
    paddingLeft: 14,
  },
  issuesSection: {
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  issuesSectionTitle: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: "#475569",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  issueCard: {
    padding: 5,
    borderRadius: 4,
    marginBottom: 4,
    borderLeftWidth: 3,
  },
  issueHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
  },
  issueTitle: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: "#0f172a",
  },
  issueDesc: {
    fontSize: 7,
    color: "#334155",
    lineHeight: 1.3,
  },
  codeBlock: {
    marginTop: 3,
    backgroundColor: "#0f172a",
    color: "#e2e8f0",
    padding: 4,
    borderRadius: 3,
    fontSize: 6.5,
    fontFamily: "Courier",
  },
})

export function PdfFileCard({ file }: { file: any }) {
  const isApproved = file.decision === "APROVADO"
  const raw = file.raw_analysis || {}
  const issues = file.issues || []

  return (
    <View style={styles.card} wrap={false}>
      {/* Cabeçalho do Card */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <PdfFileIcon size={12} />
          <Text style={styles.filePath}>{file.file_path}</Text>
          <Text style={styles.changeBadge}>{file.change_type || "edit"}</Text>
        </View>

        <View style={[styles.statusBadge, isApproved ? styles.approvedBadge : styles.rejectedBadge]}>
          {isApproved ? <PdfCheckIcon size={10} /> : <PdfCrossIcon size={10} />}
          <Text style={isApproved ? styles.statusTextApproved : styles.statusTextRejected}>
            {isApproved ? "APROVADO" : "REPROVADO"}
          </Text>
        </View>
      </View>

      {/* Conteúdo do Card */}
      <View style={styles.body}>
        {/* StyleAgent */}
        <View style={[styles.dimensionBlock, { borderLeftColor: "#8b5cf6" }]}>
          <View style={styles.dimensionHeader}>
            <PdfPaletteIcon size={10} />
            <Text style={styles.dimensionTitle}>StyleAgent (Estilo & Boas Práticas):</Text>
          </View>
          <Text style={styles.dimensionText}>
            {raw.styleNotes || "Nenhum problema encontrado."}
          </Text>
        </View>

        {/* SecurityAgent */}
        <View style={[styles.dimensionBlock, { borderLeftColor: "#ef4444" }]}>
          <View style={styles.dimensionHeader}>
            <PdfShieldIcon size={10} />
            <Text style={styles.dimensionTitle}>SecurityAgent (Segurança & Riscos):</Text>
          </View>
          <Text style={styles.dimensionText}>
            {raw.securityNotes || "Nenhum risco de segurança identificado."}
          </Text>
        </View>

        {/* PerformanceAgent */}
        <View style={[styles.dimensionBlock, { borderLeftColor: "#f59e0b" }]}>
          <View style={styles.dimensionHeader}>
            <PdfZapIcon size={10} />
            <Text style={styles.dimensionTitle}>PerformanceAgent (Desempenho & Recursos):</Text>
          </View>
          <Text style={styles.dimensionText}>
            {raw.performanceNotes || "Desempenho satisfatório."}
          </Text>
        </View>

        {/* TestCoverageAgent */}
        <View style={[styles.dimensionBlock, { borderLeftColor: "#06b6d4" }]}>
          <View style={styles.dimensionHeader}>
            <PdfFlaskIcon size={10} />
            <Text style={styles.dimensionTitle}>TestCoverageAgent (Cobertura de Testes):</Text>
          </View>
          <Text style={styles.dimensionText}>
            {raw.testNotes || "Cobertura satisfatória."}
          </Text>
        </View>

        {/* TechLead Decision Callout */}
        <View
          style={[
            styles.calloutDecision,
            isApproved
              ? { backgroundColor: "#f0fdf4", borderColor: "#86efac", borderLeftColor: "#16a34a" }
              : { backgroundColor: "#fef2f2", borderColor: "#fca5a5", borderLeftColor: "#dc2626" },
          ]}
        >
          <View style={styles.calloutHeader}>
            {isApproved ? <PdfCheckIcon size={10} /> : <PdfCrossIcon size={10} />}
            <Text
              style={[
                styles.calloutTitle,
                { color: isApproved ? "#14532d" : "#7f1d1d" },
              ]}
            >
              TechLead Decision: {isApproved ? "PR Aprovada" : "PR Reprovada"}
            </Text>
          </View>
          <Text
            style={[
              styles.calloutText,
              { color: isApproved ? "#166534" : "#991b1b" },
            ]}
          >
            {file.justification || raw.justification || "Sem justificativa adicional."}
          </Text>
        </View>

        {/* Apontamentos / Issues */}
        {issues.length > 0 && (
          <View style={styles.issuesSection}>
            <Text style={styles.issuesSectionTitle}>
              Apontamentos Identificados ({issues.length}):
            </Text>
            {issues.map((iss: any, idx: number) => {
              const isBlocker = iss.severity === "BLOCKER"
              const isWarning = iss.severity === "WARNING"
              const borderLeftColor = isBlocker ? "#dc2626" : isWarning ? "#d97706" : "#2563eb"
              const bgColor = isBlocker ? "#fef2f2" : isWarning ? "#fffbeb" : "#eff6ff"

              return (
                <View
                  key={idx}
                  style={[styles.issueCard, { borderLeftColor, backgroundColor: bgColor }]}
                >
                  <View style={styles.issueHeader}>
                    {isBlocker || isWarning ? (
                      <PdfAlertIcon size={9} color={borderLeftColor} />
                    ) : (
                      <PdfLightbulbIcon size={9} />
                    )}
                    <Text style={styles.issueTitle}>
                      [{iss.severity}] {iss.title} {iss.lineReference ? `(${iss.lineReference})` : ""}
                    </Text>
                  </View>
                  <Text style={styles.issueDesc}>{iss.description}</Text>
                  {iss.suggestedCode && (
                    <Text style={styles.codeBlock}>{iss.suggestedCode}</Text>
                  )}
                </View>
              )
            })}
          </View>
        )}
      </View>
    </View>
  )
}
