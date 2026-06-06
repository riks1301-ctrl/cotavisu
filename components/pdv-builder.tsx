"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, ChevronRight, Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import { pdvItems, type PDVItem } from "@/lib/service-options"

export type PDVItemSelected = {
  item: PDVItem
  widthCm: string
  heightCm: string
  quantity: string
  attributes: Record<string, string>
}

type Props = {
  onConfirm: (items: PDVItemSelected[], description: string) => void
  onBack: () => void
}

export function PDVBuilder({ onConfirm, onBack }: Props) {
  const [phase, setPhase] = useState<"select" | "configure">("select")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [configIndex, setConfigIndex] = useState(0)
  const [configured, setConfigured] = useState<PDVItemSelected[]>([])
  const [current, setCurrent] = useState<PDVItemSelected | null>(null)
  const [description, setDescription] = useState("")

  function toggleItem(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  function startConfig() {
    const items = pdvItems.filter((p) => selectedIds.includes(p.id))
    const first = items[0]
    setCurrent({ item: first, widthCm: "", heightCm: "", quantity: "1", attributes: {} })
    setConfigIndex(0)
    setConfigured([])
    setPhase("configure")
  }

  function saveCurrentAndNext() {
    if (!current) return
    const items = pdvItems.filter((p) => selectedIds.includes(p.id))
    const newConfigured = [...configured, current]
    setConfigured(newConfigured)

    if (configIndex + 1 < items.length) {
      const next = items[configIndex + 1]
      setCurrent({ item: next, widthCm: "", heightCm: "", quantity: "1", attributes: {} })
      setConfigIndex(configIndex + 1)
    } else {
      // Todos configurados — vai pro resumo
      setPhase("summary" as any)
    }
  }

  function setAttr(key: string, value: string) {
    if (!current) return
    setCurrent({ ...current, attributes: { ...current.attributes, [key]: value } })
  }

  function canSaveCurrent() {
    if (!current) return false
    if (current.item.unit !== "unit" && (!current.widthCm || parseFloat(current.widthCm) <= 0)) return false
    if (current.item.heightLabel && !current.heightCm) return false
    if (!current.quantity || parseInt(current.quantity) < 1) return false
    const required = current.item.attributes.filter((a) => a.required)
    return required.every((a) => current.attributes[a.key])
  }

  const items = pdvItems.filter((p) => selectedIds.includes(p.id))
  const totalItems = configured.length + (phase === ("summary" as any) ? 0 : 0)

  // Fase de resumo
  if (phase === ("summary" as any)) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <ShoppingBag className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-lg">Kit PDV — Resumo</h3>
          <Badge className="bg-blue-100 text-blue-700">{configured.length} item{configured.length > 1 ? "s" : ""}</Badge>
        </div>

        <div className="space-y-2">
          {configured.map((c, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg border bg-gray-50 p-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{c.item.icon}</span>
                <div>
                  <p className="font-medium text-sm">{c.item.name}</p>
                  <p className="text-xs text-gray-400">
                    {c.widthCm && c.heightCm ? `${c.widthCm}×${c.heightCm}cm · ` : c.widthCm ? `${c.widthCm}cm · ` : ""}
                    {c.quantity} un
                  </p>
                </div>
              </div>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
          ))}
        </div>

        <div>
          <Label htmlFor="obs">Observações gerais do kit (opcional)</Label>
          <Input
            id="obs"
            placeholder="ex: todos os itens devem seguir o mesmo padrão visual da marca"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1"
          />
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => setPhase("select")}>
            Editar seleção
          </Button>
          <Button
            className="flex-1"
            onClick={() => onConfirm(configured, description)}
          >
            Publicar pedido PDV <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  // Fase de configuração de cada item
  if (phase === "configure" && current) {
    return (
      <div className="space-y-4">
        {/* Progress */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            Configurando {configIndex + 1} de {items.length}:
          </span>
          <span className="font-semibold">{current.item.icon} {current.item.name}</span>
        </div>
        <div className="h-1.5 rounded-full bg-gray-100">
          <div
            className="h-1.5 rounded-full bg-blue-500 transition-all"
            style={{ width: `${((configIndex + 1) / items.length) * 100}%` }}
          />
        </div>

        <p className="text-xs text-gray-400">{current.item.description}</p>

        {/* Dimensões */}
        {current.item.unit !== "unit" ? (
          <div className={`grid gap-3 ${current.item.heightLabel ? "grid-cols-2" : "grid-cols-1"}`}>
            <div>
              <Label htmlFor="width">{current.item.widthLabel ?? "Largura (cm)"} *</Label>
              <div className="relative mt-1">
                <Input
                  id="width"
                  type="number"
                  placeholder="ex: 10"
                  value={current.widthCm}
                  onChange={(e) => setCurrent({ ...current, widthCm: e.target.value })}
                  className="pr-10"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">cm</span>
              </div>
            </div>
            {current.item.heightLabel && (
              <div>
                <Label htmlFor="height">{current.item.heightLabel} *</Label>
                <div className="relative mt-1">
                  <Input
                    id="height"
                    type="number"
                    placeholder="ex: 15"
                    value={current.heightCm}
                    onChange={(e) => setCurrent({ ...current, heightCm: e.target.value })}
                    className="pr-10"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">cm</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-gray-400 bg-gray-50 rounded-lg p-2">
            {current.item.widthLabel && (
              <span>
                <Label htmlFor="width-unit" className="text-xs">{current.item.widthLabel}</Label>
                <div className="relative mt-1">
                  <Input
                    id="width-unit"
                    type="number"
                    placeholder="ex: 30"
                    value={current.widthCm}
                    onChange={(e) => setCurrent({ ...current, widthCm: e.target.value })}
                    className="pr-10"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">cm</span>
                </div>
              </span>
            )}
          </p>
        )}

        {/* Quantidade */}
        <div>
          <Label>Quantidade *</Label>
          <div className="mt-1 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrent({ ...current, quantity: String(Math.max(1, parseInt(current.quantity) - 1)) })}
              className="flex h-9 w-9 items-center justify-center rounded-lg border text-lg font-bold hover:bg-gray-50"
            >-</button>
            <Input
              type="number"
              min="1"
              value={current.quantity}
              onChange={(e) => setCurrent({ ...current, quantity: e.target.value })}
              className="text-center"
            />
            <button
              type="button"
              onClick={() => setCurrent({ ...current, quantity: String(parseInt(current.quantity) + 1) })}
              className="flex h-9 w-9 items-center justify-center rounded-lg border text-lg font-bold hover:bg-gray-50"
            >+</button>
          </div>
        </div>

        {/* Atributos */}
        {current.item.attributes.map((attr) => (
          <div key={attr.key}>
            <Label className="mb-1.5 block">
              {attr.label}{attr.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {attr.options.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setAttr(attr.key, opt.id)}
                  className={`rounded-lg border px-3 py-2 text-left text-sm transition-all ${
                    current.attributes[attr.key] === opt.id
                      ? "border-blue-500 bg-blue-50 font-medium text-blue-700"
                      : "hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {current.attributes[attr.key] === opt.id && "✓ "}{opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={onBack}>Cancelar</Button>
          <Button
            className="flex-1"
            disabled={!canSaveCurrent()}
            onClick={saveCurrentAndNext}
          >
            {configIndex + 1 < items.length ? (
              <>Próximo item <ChevronRight className="ml-2 h-4 w-4" /></>
            ) : (
              <>Ver resumo <CheckCircle className="ml-2 h-4 w-4" /></>
            )}
          </Button>
        </div>
      </div>
    )
  }

  // Fase de seleção dos itens
  return (
    <div className="space-y-4">
      <div>
        <p className="font-medium text-gray-700 mb-1">
          🏪 Kit PDV — Selecione os materiais que precisa
        </p>
        <p className="text-sm text-gray-400">Pode selecionar vários e configurar cada um separadamente</p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {pdvItems.map((item) => {
          const selected = selectedIds.includes(item.id)
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggleItem(item.id)}
              className={`relative flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center text-sm transition-all ${
                selected
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              {selected && (
                <div className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600">
                  <CheckCircle className="h-3 w-3 text-white" />
                </div>
              )}
              <span className="text-2xl">{item.icon}</span>
              <span className="font-medium leading-tight">{item.name}</span>
              <span className="text-xs text-gray-400 leading-tight">{item.description}</span>
            </button>
          )
        })}
      </div>

      {selectedIds.length > 0 && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 flex items-center justify-between">
          <span className="text-sm text-blue-700 font-medium">
            {selectedIds.length} item{selectedIds.length > 1 ? "s" : ""} selecionado{selectedIds.length > 1 ? "s" : ""}
          </span>
          <div className="flex gap-1 flex-wrap">
            {selectedIds.map((id) => {
              const item = pdvItems.find((p) => p.id === id)
              return item ? (
                <span key={id} className="text-lg">{item.icon}</span>
              ) : null
            })}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={onBack}>Voltar</Button>
        <Button
          className="flex-1"
          disabled={selectedIds.length === 0}
          onClick={startConfig}
        >
          Configurar {selectedIds.length > 0 ? `${selectedIds.length} item${selectedIds.length > 1 ? "s" : ""}` : ""}
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
