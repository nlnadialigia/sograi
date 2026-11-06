export interface PendingQueueItem {
  id: string
  filePath: string
  itemType: "TECH_DEBT" | "IMPROVEMENT" | "FUTURE_REFACTOR"
  priority: "LOW" | "MEDIUM" | "HIGH"
  description: string
}

export interface AddPendingModalProps {
  isOpen: boolean
  onClose: () => void
  pr?: {
    prId: string
    repository: string
    files?: string[]
  }
  availablePrs?: {
    prId: string
    repository: string
    title: string
    files?: string[]
  }[]
  defaultFilePath?: string
  onSaved: () => void
}
