export type WizardStepId =
  | "brief"
  | "category"
  | "service"
  | "specs"
  | "details"
  | "delivery"

export const WIZARD_STEPS: { id: WizardStepId; label: string }[] = [
  { id: "brief", label: "Descrever" },
  { id: "category", label: "Categoria" },
  { id: "service", label: "Serviço" },
  { id: "specs", label: "Especificações" },
  { id: "details", label: "Medidas" },
  { id: "delivery", label: "Entrega" },
]

export type AISuggestionResult = {
  categoria: string
  servico: string
  largura_cm: number | null
  altura_cm: number | null
  quantidade: number
  material_sugerido: string
  observacoes: string
  confianca: "alta" | "media" | "baixa"
}

export type UploadedFile = {
  id: string
  file: File
  previewUrl: string
}

export type PriceEstimate = {
  total: number
  perUnit: number
  unitLabel: string
  area: number | null
}
