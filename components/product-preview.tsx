"use client"

import { useMemo } from "react"

type Props = {
  serviceName: string
  widthCm: string
  heightCm: string
  quantity: string
  attributes: Record<string, string>
}

const finishColors: Record<string, { bg: string; border: string; label: string }> = {
  fosca:       { bg: "bg-gray-200", border: "border-gray-400", label: "Fosco" },
  brilhante:   { bg: "bg-blue-100", border: "border-blue-400", label: "Brilhante" },
  soft_touch:  { bg: "bg-purple-100", border: "border-purple-400", label: "Soft Touch" },
  holografica: { bg: "bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200", border: "border-purple-400", label: "Holográfica" },
  sem_laminacao: { bg: "bg-white", border: "border-gray-300", label: "Sem laminação" },
}

const materialColors: Record<string, string> = {
  vinil_transparente: "bg-sky-50 opacity-80",
  vinil_espelhado: "bg-gradient-to-br from-gray-200 to-gray-400",
  vinil_comum: "bg-white",
  bopp: "bg-amber-50",
}

const vinilCores: Record<string, string> = {
  branco: "#FFFFFF",
  preto: "#1a1a1a",
  vermelho: "#dc2626",
  azul: "#2563eb",
  amarelo: "#eab308",
  verde: "#16a34a",
  prata: "#9ca3af",
  dourado: "#d97706",
}

function getPreviewStyle(serviceName: string, attributes: Record<string, string>) {
  // Cor do vinil recortado
  if (serviceName === "Adesivo Recortado (Plotter)" && attributes.cor) {
    const hex = vinilCores[attributes.cor]
    if (hex) return { background: hex, border: "2px solid #e5e7eb" }
  }

  // Laminação
  if (attributes.laminacao === "fosca") return { background: "#e5e7eb", border: "2px solid #9ca3af" }
  if (attributes.laminacao === "brilhante") return { background: "linear-gradient(135deg, #dbeafe 0%, #eff6ff 50%, #dbeafe 100%)", border: "2px solid #93c5fd" }
  if (attributes.laminacao === "soft_touch") return { background: "#ede9fe", border: "2px solid #a78bfa" }
  if (attributes.laminacao === "holografica") return { background: "linear-gradient(135deg, #fce7f3, #ede9fe, #dbeafe, #d1fae5)", border: "2px solid #c084fc" }

  // Material
  if (attributes.material === "vinil_espelhado") return { background: "linear-gradient(135deg, #d1d5db, #f9fafb, #9ca3af)", border: "2px solid #9ca3af" }
  if (attributes.material === "vinil_transparente") return { background: "rgba(186,230,253,0.3)", border: "2px dashed #38bdf8" }

  // ACM cores
  if (attributes.acabamento === "prata") return { background: "linear-gradient(135deg, #d1d5db, #f3f4f6)", border: "2px solid #9ca3af" }
  if (attributes.acabamento === "dourado") return { background: "linear-gradient(135deg, #fde68a, #f59e0b)", border: "2px solid #d97706" }
  if (attributes.acabamento === "preto") return { background: "#1f2937", border: "2px solid #374151" }

  // Banner
  if (serviceName.includes("Banner") || serviceName.includes("Lona")) {
    return { background: "linear-gradient(135deg, #eff6ff, #dbeafe)", border: "2px solid #93c5fd" }
  }

  return { background: "#f8fafc", border: "2px solid #e2e8f0" }
}

function getServiceIcon(name: string) {
  if (name.includes("Adesivo")) return "🏷️"
  if (name.includes("Banner") || name.includes("Lona")) return "🚩"
  if (name.includes("ACM") || name.includes("Placa")) return "🏢"
  if (name.includes("Letra")) return "🔤"
  if (name.includes("Painel")) return "💡"
  if (name.includes("Veicular")) return "🚗"
  return "📋"
}

export function ProductPreview({ serviceName, widthCm, heightCm, quantity, attributes }: Props) {
  const w = parseFloat(widthCm) || 0
  const h = parseFloat(heightCm) || 0
  const qty = parseInt(quantity) || 1

  // Proporção máxima para o preview (container 280x200)
  const maxW = 240
  const maxH = 160
  const ratio = w && h ? Math.min(maxW / w, maxH / h, 1) : 1
  const previewW = w ? Math.max(w * ratio, 40) : 120
  const previewH = h ? Math.max(h * ratio, 40) : 80

  const style = getPreviewStyle(serviceName, attributes)
  const icon = getServiceIcon(serviceName)

  // Detecta cor do vinil recortado
  const vinilColor = serviceName === "Adesivo Recortado (Plotter)" && attributes.cor
    ? vinilCores[attributes.cor]
    : null

  return (
    <div className="rounded-xl border bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Preview</span>
        {w > 0 && h > 0 && (
          <span className="text-xs text-gray-400">{w}×{h}cm · {qty}un</span>
        )}
      </div>

      {/* Canvas de preview */}
      <div className="flex items-center justify-center" style={{ minHeight: 160 }}>
        <div className="relative">
          {/* Sombra de quantidade */}
          {qty > 1 && (
            <>
              <div
                className="absolute rounded"
                style={{
                  width: previewW,
                  height: previewH,
                  top: 6,
                  left: 6,
                  ...style,
                  opacity: 0.4,
                }}
              />
              {qty > 2 && (
                <div
                  className="absolute rounded"
                  style={{
                    width: previewW,
                    height: previewH,
                    top: 3,
                    left: 3,
                    ...style,
                    opacity: 0.25,
                  }}
                />
              )}
            </>
          )}

          {/* Peça principal */}
          <div
            className="relative flex items-center justify-center rounded shadow-md"
            style={{
              width: previewW,
              height: previewH,
              ...style,
            }}
          >
            {/* Conteúdo interno */}
            {vinilColor ? (
              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl">{icon}</span>
                <div
                  className="w-8 h-3 rounded-full border border-white/50"
                  style={{ background: vinilColor }}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1 opacity-60">
                <span className="text-xl">{icon}</span>
                {w > 0 && h > 0 && (
                  <span className="text-xs font-mono text-gray-500">
                    {w}×{h}
                  </span>
                )}
              </div>
            )}

            {/* Acabamento visual */}
            {attributes.acabamento === "ilhos" && (
              <div className="absolute inset-x-2 flex justify-between" style={{ top: -4 }}>
                {[...Array(Math.max(2, Math.floor(previewW / 30)))].map((_, i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-gray-500 border border-gray-300 shadow" />
                ))}
              </div>
            )}
            {attributes.acabamento === "bastao" && (
              <>
                <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t bg-gray-400 opacity-60" />
                <div className="absolute bottom-0 left-0 right-0 h-1.5 rounded-b bg-gray-400 opacity-60" />
              </>
            )}
            {attributes.impressao === "dupla_face" && (
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 rounded bg-blue-500 px-1 py-0.5 text-white" style={{ fontSize: 8 }}>2F</div>
            )}
          </div>

          {/* Badge de quantidade */}
          {qty > 1 && (
            <div className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white" style={{ fontSize: 9, fontWeight: 700 }}>
              {qty > 99 ? "99+" : qty}
            </div>
          )}
        </div>
      </div>

      {/* Legenda dos atributos selecionados */}
      {Object.keys(attributes).length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {Object.entries(attributes).slice(0, 4).map(([key, val]) => {
            const label = val.replace(/_/g, " ")
            return (
              <span key={key} className="rounded-full bg-white border border-gray-200 px-2 py-0.5 text-xs text-gray-600 shadow-sm">
                {label}
              </span>
            )
          })}
        </div>
      )}

      {(!w || !h) && (
        <p className="mt-2 text-center text-xs text-gray-400">
          Preencha as medidas para ver o preview proporcional
        </p>
      )}
    </div>
  )
}
