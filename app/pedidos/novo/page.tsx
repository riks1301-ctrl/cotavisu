"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ChevronRight, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase-client"
import { serviceCategories, type ServiceConfig } from "@/lib/service-options"
import { ProductPreview } from "@/components/product-preview"
import { PriceCards } from "@/components/price-cards"
import { UrgencyInline } from "@/components/urgency-bar"
import { AISuggestion } from "@/components/ai-suggestion"
import { PDVBuilder, type PDVItemSelected } from "@/components/pdv-builder"

const STEPS = ["IA", "Categoria", "Serviço", "Especificações", "Medidas", "Localização"]

export default function NovoPedidoPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)

  const [showAI, setShowAI] = useState(true)
  const [showPDV, setShowPDV] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedService, setSelectedService] = useState<ServiceConfig | null>(null)
  const [attributes, setAttributes] = useState<Record<string, string>>({})
  const [widthCm, setWidthCm] = useState("")
  const [heightCm, setHeightCm] = useState("")
  const [quantity, setQuantity] = useState("1")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [deadlineDays, setDeadlineDays] = useState("7")
  const [description, setDescription] = useState("")
  const [buyerName, setBuyerName] = useState("")

  const category = serviceCategories.find((c) => c.name === selectedCategory)

  async function handlePDVSubmit(items: PDVItemSelected[], desc: string) {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const specsText = items.map((item) => {
      const attrs = Object.entries(item.attributes)
        .map(([k, v]) => {
          const attr = item.item.attributes.find((a) => a.key === k)
          const opt = attr?.options.find((o) => o.id === v)
          return `${attr?.label}: ${opt?.label}`
        }).join(", ")
      const dims = item.widthCm && item.heightCm
        ? ` (${item.widthCm}×${item.heightCm}cm)`
        : item.widthCm ? ` (${item.widthCm}cm)` : ""
      return `${item.item.name}${dims} × ${item.quantity}un — ${attrs}`
    }).join("\n")

    const { data, error } = await supabase
      .from("service_requests")
      .insert({
        service_type: `Kit PDV (${items.length} item${items.length > 1 ? "s" : ""})`,
        category: "PDV — Materiais de Loja",
        material: items.map((i) => i.item.name).join(", "),
        width_m: null,
        height_m: null,
        quantity: items.reduce((acc, i) => acc + parseInt(i.quantity), 0),
        city: city || "A definir",
        state: state || "BR",
        deadline_days: parseInt(deadlineDays),
        description: [specsText, desc].filter(Boolean).join("\n\n"),
        buyer_name: buyerName || null,
        buyer_id: user?.id ?? null,
        status: "open",
      })
      .select()
      .single()

    setLoading(false)
    if (!error && data) {
      router.push(`/pedidos/${data.id}`)
    } else {
      alert("Erro ao criar pedido PDV.")
    }
  }

  function applyAISuggestion(s: { categoria: string; servico: string; largura_cm: number | null; altura_cm: number | null; quantidade: number; material_sugerido: string; observacoes: string }) {
    setSelectedCategory(s.categoria)
    const cat = serviceCategories.find((c) => c.name === s.categoria)
    const svc = cat?.services.find((sv) => sv.name === s.servico) ?? null
    setSelectedService(svc)
    if (s.largura_cm) setWidthCm(String(s.largura_cm))
    if (s.altura_cm) setHeightCm(String(s.altura_cm))
    setQuantity(String(s.quantidade))
    if (s.observacoes) setDescription(s.observacoes)
    setShowAI(false)
    // Vai direto para especificações se encontrou o serviço, senão para categoria
    setStep(svc ? 2 : 1)
  }

  function setAttr(key: string, value: string) {
    setAttributes((prev) => ({ ...prev, [key]: value }))
  }

  // Preços de referência por m² ou por unidade
  const priceRef: Record<string, { value: number; unit: string }> = {
    "Adesivo Impresso":              { value: 45,  unit: "m²" },
    "Adesivo Recortado (Plotter)":   { value: 35,  unit: "m²" },
    "Envelopamento Veicular":        { value: 380, unit: "m²" },
    "Banner":                        { value: 25,  unit: "m²" },
    "Lona para Fachada":             { value: 30,  unit: "m²" },
    "Placa em ACM":                  { value: 280, unit: "m²" },
    "Placa em PVC":                  { value: 42,  unit: "m²" },
    "Letra Caixa":                   { value: 180, unit: "unidade" },
    "Painel Luminoso":               { value: 350, unit: "m²" },
    "Impressão em Rígido (Direto)":  { value: 55,  unit: "m²" },
    "Plotagem de Plantas":           { value: 12,  unit: "unidade" },
    "Impressão em Papel":            { value: 8,   unit: "unidade" },
  }

  function estimatedPrice() {
    if (!selectedService) return null
    const ref = priceRef[selectedService.name]
    if (!ref) return null
    const qty = parseInt(quantity) || 1

    if (selectedService.unit === "unit") {
      const total = qty * ref.value
      return { total, perUnit: ref.value, unitLabel: "unidade", area: null }
    }

    if (!widthCm || !heightCm) return null
    const w = parseFloat(widthCm) / 100
    const h = parseFloat(heightCm) / 100
    const areaPorUnidade = w * h
    const total = areaPorUnidade * qty * ref.value
    return {
      total,
      perUnit: areaPorUnidade * ref.value,
      unitLabel: "m²",
      area: areaPorUnidade,
    }
  }

  async function handleSubmit() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Monta texto das especificações selecionadas
    const specsText = Object.entries(attributes)
      .map(([key, val]) => {
        const attr = selectedService?.attributes.find((a) => a.key === key)
        const opt = attr?.options.find((o) => o.id === val)
        return `${attr?.label}: ${opt?.label}`
      })
      .join(" | ")

    const descFull = [specsText, description].filter(Boolean).join("\n")

    const w = parseFloat(widthCm) / 100
    const h = parseFloat(heightCm) / 100

    const { data, error } = await supabase
      .from("service_requests")
      .insert({
        service_type: selectedService?.name,
        category: selectedCategory,
        material: specsText || null,
        width_m: isNaN(w) ? null : w,
        height_m: isNaN(h) ? null : h,
        quantity: parseInt(quantity),
        city,
        state: state.toUpperCase(),
        deadline_days: parseInt(deadlineDays),
        description: descFull || null,
        buyer_name: buyerName || null,
        buyer_id: user?.id ?? null,
        status: "open",
      })
      .select()
      .single()

    setLoading(false)
    if (!error && data) {
      router.push(`/pedidos/${data.id}`)
    } else {
      alert("Erro ao criar pedido. Tente novamente.")
    }
  }

  const canProceed = () => {
    if (step === 0) return !!selectedCategory
    if (step === 1) return !!selectedService
    if (step === 2) {
      const required = selectedService?.attributes.filter((a) => a.required) ?? []
      return required.every((a) => attributes[a.key])
    }
    if (step === 3) {
      if (selectedService?.unit === "unit") return !!quantity
      return !!widthCm && !!heightCm && !!quantity
    }
    if (step === 4) return !!city && !!state
    return false
  }

  const price = estimatedPrice()

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Criar pedido de orçamento</h1>
        <p className="mt-1 text-base text-gray-700 font-medium">
          Crie um pedido e receba propostas de fornecedores qualificados em minutos
        </p>
        <p className="mt-0.5 text-sm text-gray-400">
          Compare preço, prazo e qualidade em um só lugar
        </p>
        <div className="mt-3">
          <UrgencyInline />
        </div>
      </div>

      {/* Steps */}
      <div className="mb-6 flex items-center gap-1 overflow-x-auto pb-1">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-1 shrink-0">
            <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold shrink-0 ${
              step > i ? "bg-green-500 text-white" : step === i ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
            }`}>
              {step > i ? <CheckCircle className="h-3 w-3" /> : i + 1}
            </div>
            <span className={`text-xs whitespace-nowrap ${step === i ? "font-medium text-gray-800" : "text-gray-400"}`}>{s}</span>
            {i < STEPS.length - 1 && <div className="h-px w-3 bg-gray-200 shrink-0" />}
          </div>
        ))}
      </div>

      {/* Step IA */}
      {showAI && step === 0 && !showPDV && (
        <div className="mb-4">
          <AISuggestion
            onApply={applyAISuggestion}
            onSkip={() => setShowAI(false)}
          />
        </div>
      )}

      {/* PDV Builder — fluxo separado */}
      {showPDV && (
        <Card>
          <CardContent className="p-6">
            <PDVBuilder
              onConfirm={handlePDVSubmit}
              onBack={() => { setShowPDV(false); setSelectedCategory("") }}
            />
          </CardContent>
        </Card>
      )}

      {showPDV ? null : <Card>
        <CardContent className="p-6">

          {/* STEP 0 — Categoria */}
          {step === 0 && (
            <div className="space-y-4">
              <p className="font-medium text-gray-700">Qual tipo de serviço você precisa?</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {serviceCategories.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => {
                      if (cat.name === "PDV — Materiais de Loja") {
                        setSelectedCategory(cat.name)
                        setShowPDV(true)
                        setShowAI(false)
                      } else {
                        setSelectedCategory(cat.name)
                        setSelectedService(null)
                        setAttributes({})
                      }
                    }}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border p-4 text-sm transition-all ${
                      selectedCategory === cat.name ? "border-blue-500 bg-blue-50 text-blue-700 font-medium" : "hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-2xl">{cat.icon}</span>
                    <span className="leading-tight text-center">{cat.name}</span>
                  </button>
                ))}
              </div>
              <Button className="w-full" disabled={!canProceed()} onClick={() => setStep(1)}>
                Próximo <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {/* STEP 1 — Serviço específico */}
          {step === 1 && category && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">{category.icon}</span>
                <p className="font-medium">{category.name} — Qual serviço especificamente?</p>
              </div>
              <div className="space-y-2">
                {category.services.map((svc) => (
                  <button
                    key={svc.name}
                    onClick={() => { setSelectedService(svc); setAttributes({}) }}
                    className={`w-full flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                      selectedService?.name === svc.name ? "border-blue-500 bg-blue-50" : "hover:border-gray-300"
                    }`}
                  >
                    <span className="text-xl">{svc.icon}</span>
                    <span className="font-medium">{svc.name}</span>
                    {selectedService?.name === svc.name && (
                      <CheckCircle className="ml-auto h-4 w-4 text-blue-600" />
                    )}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep(0)}>Voltar</Button>
                <Button className="flex-1" disabled={!canProceed()} onClick={() => setStep(2)}>
                  Próximo <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2 — Atributos/especificações */}
          {step === 2 && selectedService && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary">{selectedCategory}</Badge>
                <span className="font-medium text-sm">{selectedService.name}</span>
              </div>

              {/* Preview ao vivo */}
              <ProductPreview
                serviceName={selectedService.name}
                widthCm={widthCm}
                heightCm={heightCm}
                quantity={quantity}
                attributes={attributes}
              />

              {selectedService.attributes.map((attr) => (
                <div key={attr.key}>
                  <Label className="mb-2 block">
                    {attr.label}
                    {attr.required && <span className="ml-1 text-red-500">*</span>}
                  </Label>
                  <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                    {attr.options.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setAttr(attr.key, opt.id)}
                        className={`rounded-lg border px-3 py-2 text-left text-sm transition-all ${
                          attributes[attr.key] === opt.id
                            ? "border-blue-500 bg-blue-50 font-medium text-blue-700"
                            : "hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {attributes[attr.key] === opt.id && "✓ "}{opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Voltar</Button>
                <Button className="flex-1" disabled={!canProceed()} onClick={() => setStep(3)}>
                  Próximo <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3 — Medidas em CM */}
          {step === 3 && selectedService && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary">{selectedCategory}</Badge>
                <span className="font-medium text-sm">{selectedService.name}</span>
              </div>

              {selectedService.unit !== "unit" ? (
                <>
                  <div className="rounded-lg bg-blue-50 border border-blue-100 p-3 text-sm text-blue-700">
                    📏 Informe as medidas em <strong>centímetros (cm)</strong>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="width">Largura (cm) *</Label>
                      <div className="relative">
                        <Input
                          id="width"
                          type="number"
                          placeholder="ex: 100"
                          value={widthCm}
                          onChange={(e) => setWidthCm(e.target.value)}
                          className="pr-10"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">cm</span>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="height">Altura (cm) *</Label>
                      <div className="relative">
                        <Input
                          id="height"
                          type="number"
                          placeholder="ex: 50"
                          value={heightCm}
                          onChange={(e) => setHeightCm(e.target.value)}
                          className="pr-10"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">cm</span>
                      </div>
                    </div>
                  </div>

                  {widthCm && heightCm && (
                    <div className="rounded-lg bg-gray-50 border p-3 text-sm text-gray-600">
                      <span className="font-medium">Área total por unidade:</span>{" "}
                      {(parseFloat(widthCm) * parseFloat(heightCm) / 10000).toFixed(4)} m²
                      {" "}({widthCm} × {heightCm} cm)
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-lg bg-gray-50 border p-3 text-sm text-gray-600">
                  Este serviço é cobrado por unidade/peça.
                </div>
              )}

              <div>
                <Label htmlFor="qty">Quantidade *</Label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => String(Math.max(1, parseInt(q) - 1)))}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border text-lg font-bold hover:bg-gray-50"
                  >-</button>
                  <Input
                    id="qty"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="text-center"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => String(parseInt(q) + 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border text-lg font-bold hover:bg-gray-50"
                  >+</button>
                </div>
              </div>

              {/* Preview proporcional */}
              {selectedService && (
                <ProductPreview
                  serviceName={selectedService.name}
                  widthCm={widthCm}
                  heightCm={heightCm}
                  quantity={quantity}
                  attributes={attributes}
                />
              )}

              {/* Cards de preço estilo iFood */}
              {price && selectedService && (
                <PriceCards
                  price={price}
                  serviceName={selectedService.name}
                  quantity={quantity}
                />
              )}

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>Voltar</Button>
                <Button className="flex-1" disabled={!canProceed()} onClick={() => setStep(4)}>
                  Próximo <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4 — Localização e finalização */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="buyerName">Seu nome ou empresa (opcional)</Label>
                <Input
                  id="buyerName"
                  placeholder="ex: João Silva ou Empresa Alfa"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <Label htmlFor="city">Cidade *</Label>
                  <Input
                    id="city"
                    placeholder="ex: São Paulo"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="state">UF *</Label>
                  <Input
                    id="state"
                    placeholder="SP"
                    maxLength={2}
                    value={state}
                    onChange={(e) => setState(e.target.value.toUpperCase())}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="deadline">Prazo desejado (dias)</Label>
                <div className="flex gap-2 flex-wrap">
                  {["3", "5", "7", "10", "15", "30"].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDeadlineDays(d)}
                      className={`rounded-lg border px-3 py-1.5 text-sm transition-all ${
                        deadlineDays === d ? "border-blue-500 bg-blue-50 font-medium text-blue-700" : "hover:border-gray-300"
                      }`}
                    >
                      {d} dias
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="obs">Observações adicionais</Label>
                <Textarea
                  id="obs"
                  placeholder="Algum detalhe extra? Arte já aprovada? Precisa de instalação? etc."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Resumo */}
              <div className="rounded-xl border bg-gray-50 p-4 space-y-1.5 text-sm">
                <p className="font-semibold text-gray-700 mb-2">📋 Resumo do pedido</p>
                <p><span className="text-gray-500">Serviço:</span> {selectedService?.name}</p>
                {Object.entries(attributes).map(([key, val]) => {
                  const attr = selectedService?.attributes.find((a) => a.key === key)
                  const opt = attr?.options.find((o) => o.id === val)
                  return opt ? (
                    <p key={key}><span className="text-gray-500">{attr?.label}:</span> {opt.label}</p>
                  ) : null
                })}
                {selectedService?.unit !== "unit" && widthCm && heightCm && (
                  <p><span className="text-gray-500">Medidas:</span> {widthCm}cm × {heightCm}cm</p>
                )}
                <p><span className="text-gray-500">Quantidade:</span> {quantity} {selectedService?.unit === "unit" ? "peça(s)" : "unidade(s)"}</p>
                {city && <p><span className="text-gray-500">Local:</span> {city}/{state}</p>}
                {price && (
                  <div className="pt-2 border-t mt-2">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Faixa de preço do mercado</p>
                    <p className="text-green-600 font-bold text-lg">
                      R$ {price.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      <span className="ml-1 text-xs font-normal text-gray-400">
                        (R$ {price.perUnit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}/{price.unitLabel})
                      </span>
                    </p>
                    <p className="text-xs text-gray-400">Baseado em pedidos similares na região</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep(3)}>Voltar</Button>
                <Button
                  className="flex-1"
                  disabled={!canProceed() || loading}
                  onClick={handleSubmit}
                >
                  {loading
                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publicando...</>
                    : "Publicar pedido"
                  }
                </Button>
              </div>
              <p className="text-center text-xs text-gray-400">
                Pedido fica aberto por 7 dias · Gratuito para compradores
              </p>
            </div>
          )}
        </CardContent>
      </Card>}
    </div>
  )
}
