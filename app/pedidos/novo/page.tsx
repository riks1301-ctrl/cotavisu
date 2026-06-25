"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CheckCircle, ChevronRight, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase-client"
import { serviceCategories, type ServiceConfig } from "@/lib/service-options"
import { PriceCards } from "@/components/price-cards"
import { UrgencyInline } from "@/components/urgency-bar"
import { AISuggestion } from "@/components/ai-suggestion"
import { PDVBuilder, type PDVItemSelected } from "@/components/pdv-builder"
import { CategoryPicker } from "@/components/category-picker"
import { PedidoResumoSidebar } from "@/components/pedido-resumo-sidebar"

const MACRO_STEPS = ["Descrever", "Detalhar", "Publicar"]

function macroIndex(step: number) {
  if (step === 0) return 0
  if (step <= 3) return 1
  return 2
}

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
  const macro = macroIndex(step)

  async function requireLoggedInBuyer() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent("/pedidos/novo")}`)
      return null
    }
    const { data: prof } = await supabase.from("profiles").select("name").eq("id", user.id).single()
    return { user, profileName: prof?.name ?? user.email?.split("@")[0] ?? "Comprador" }
  }

  async function handlePDVSubmit(items: PDVItemSelected[], desc: string) {
    const auth = await requireLoggedInBuyer()
    if (!auth) return

    setLoading(true)
    const supabase = createClient()
    const { user, profileName } = auth

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
        state: state ? state.toUpperCase() : "BR",
        deadline_days: parseInt(deadlineDays),
        description: [specsText, desc].filter(Boolean).join("\n\n"),
        buyer_name: buyerName || profileName,
        buyer_id: user.id,
        status: "open",
      })
      .select()
      .single()

    setLoading(false)
    if (!error && data) {
      fetch("/api/notify-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "new_request", requestId: data.id }),
      }).catch(() => {})
      router.push(`/pedidos/${data.id}`)
    } else {
      alert("Erro ao criar pedido PDV.")
    }
  }

  function applyAISuggestion(s: {
    categoria: string
    servico: string
    largura_cm: number | null
    altura_cm: number | null
    quantidade: number
    material_sugerido: string
    observacoes: string
  }) {
    setSelectedCategory(s.categoria)
    if (s.categoria === "PDV — Materiais de Loja") {
      setShowPDV(true)
      setShowAI(false)
      return
    }
    const cat = serviceCategories.find((c) => c.name === s.categoria)
    const svc = cat?.services.find((sv) => sv.name === s.servico) ?? null
    setSelectedService(svc)
    if (s.largura_cm) setWidthCm(String(s.largura_cm))
    if (s.altura_cm) setHeightCm(String(s.altura_cm))
    setQuantity(String(s.quantidade))
    if (s.observacoes) setDescription(s.observacoes)
    setShowAI(false)
    setStep(svc ? 2 : 1)
  }

  function handleCategorySelect(name: string) {
    if (name === "PDV — Materiais de Loja") {
      setSelectedCategory(name)
      setShowPDV(true)
      setShowAI(false)
    } else {
      setSelectedCategory(name)
      setSelectedService(null)
      setAttributes({})
    }
  }

  function setAttr(key: string, value: string) {
    setAttributes((prev) => ({ ...prev, [key]: value }))
  }

  const priceRef: Record<string, { value: number; unit: string }> = {
    "Adesivo Impresso": { value: 45, unit: "m²" },
    "Adesivo Recortado (Plotter)": { value: 35, unit: "m²" },
    "Envelopamento Veicular": { value: 380, unit: "m²" },
    Banner: { value: 25, unit: "m²" },
    "Lona para Fachada": { value: 30, unit: "m²" },
    "Placa em ACM": { value: 280, unit: "m²" },
    "Placa em PVC ou PS": { value: 42, unit: "m²" },
    "Letra Caixa": { value: 180, unit: "unidade" },
    "Painel Luminoso": { value: 350, unit: "m²" },
    "Impressão em Rígido (Direto)": { value: 55, unit: "m²" },
    "Plotagem de Plantas": { value: 12, unit: "unidade" },
    "Impressão em Papel": { value: 8, unit: "unidade" },
  }

  function estimatedPrice() {
    if (!selectedService) return null
    const ref = priceRef[selectedService.name]
    if (!ref) return null
    const qty = parseInt(quantity) || 1

    if (selectedService.unit === "unit") {
      return { total: qty * ref.value, perUnit: ref.value, unitLabel: "unidade", area: null }
    }

    if (!widthCm || !heightCm) return null
    const w = parseFloat(widthCm) / 100
    const h = parseFloat(heightCm) / 100
    const areaPorUnidade = w * h
    return {
      total: areaPorUnidade * qty * ref.value,
      perUnit: areaPorUnidade * ref.value,
      unitLabel: "m²",
      area: areaPorUnidade,
    }
  }

  async function handleSubmit() {
    const auth = await requireLoggedInBuyer()
    if (!auth) return

    setLoading(true)
    const supabase = createClient()
    const { user, profileName } = auth

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
        buyer_name: buyerName || profileName,
        buyer_id: user.id,
        status: "open",
      })
      .select()
      .single()

    setLoading(false)
    if (!error && data) {
      fetch("/api/notify-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "new_request", requestId: data.id }),
      }).catch(() => {})
      router.push(`/pedidos/${data.id}`)
    } else {
      const msg = error?.message ?? error?.code ?? JSON.stringify(error) ?? "erro desconhecido"
      alert(`Erro ao criar pedido: ${msg}`)
    }
  }

  function canProceed() {
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

  function goBack() {
    if (step === 0 && !showAI) {
      setShowAI(true)
      return
    }
    if (step === 1) {
      setStep(0)
      setShowAI(false)
      return
    }
    setStep(step - 1)
  }

  function goNext() {
    setStep(step + 1)
  }

  const price = estimatedPrice()
  const showNav = !showPDV && !(step === 0 && showAI)

  const sidebar = (
    <PedidoResumoSidebar
      category={selectedCategory}
      service={selectedService}
      attributes={attributes}
      widthCm={widthCm}
      heightCm={heightCm}
      quantity={quantity}
      city={city}
      state={state}
      deadlineDays={deadlineDays}
      price={price}
    />
  )

  if (showPDV) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Kit PDV</h1>
          <p className="mt-1 text-gray-500">Monte os materiais de ponto de venda</p>
        </div>
        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          <Card>
            <CardContent className="p-6 sm:p-8">
              <PDVBuilder
                onConfirm={handlePDVSubmit}
                onBack={() => { setShowPDV(false); setSelectedCategory(""); setStep(0); setShowAI(false) }}
              />
            </CardContent>
          </Card>
          {sidebar}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Criar pedido de orçamento
        </h1>
        <p className="mt-2 text-gray-500">
          Descreva o projeto e receba propostas de gráficas da sua região
        </p>
        <div className="mt-3">
          <UrgencyInline />
        </div>
      </div>

      {/* Macro stepper */}
      <div className="mb-8 flex items-center gap-2 sm:gap-4">
        {MACRO_STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                  macro > i
                    ? "bg-green-500 text-white"
                    : macro === i
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-400"
                }`}
              >
                {macro > i ? <CheckCircle className="h-4 w-4" /> : i + 1}
              </div>
              <span
                className={`hidden text-sm font-medium sm:block truncate ${
                  macro === i ? "text-gray-900" : macro > i ? "text-green-700" : "text-gray-400"
                }`}
              >
                {label}
              </span>
            </div>
            {i < MACRO_STEPS.length - 1 && (
              <div className={`h-0.5 flex-1 rounded ${macro > i ? "bg-green-400" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        {/* Main */}
        <Card className="overflow-hidden">
          <CardContent className="p-6 sm:p-8">
            {/* Step 0 — IA ou categorias (nunca os dois) */}
            {step === 0 && showAI && (
              <AISuggestion
                large
                onApply={applyAISuggestion}
                onSkip={() => setShowAI(false)}
              />
            )}

            {step === 0 && !showAI && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Qual tipo de serviço você precisa?
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Selecione a categoria do seu projeto
                  </p>
                </div>
                <CategoryPicker
                  selected={selectedCategory}
                  onSelect={handleCategorySelect}
                />
                <button
                  type="button"
                  onClick={() => setShowAI(true)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  ← Voltar para o assistente com IA
                </button>
              </div>
            )}

            {/* Step 1 — Serviço */}
            {step === 1 && category && (
              <div className="space-y-5">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{category.icon}</span>
                  <div>
                    <p className="text-sm text-gray-500">{category.name}</p>
                    <h2 className="text-xl font-semibold">Qual serviço especificamente?</h2>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {category.services.map((svc) => (
                    <button
                      key={svc.name}
                      type="button"
                      onClick={() => { setSelectedService(svc); setAttributes({}) }}
                      className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                        selectedService?.name === svc.name
                          ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600"
                          : "hover:border-gray-300 hover:shadow-sm"
                      }`}
                    >
                      <span className="text-2xl">{svc.icon}</span>
                      <span className="font-medium">{svc.name}</span>
                      {selectedService?.name === svc.name && (
                        <CheckCircle className="ml-auto h-5 w-5 text-blue-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2 — Especificações */}
            {step === 2 && selectedService && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary">{selectedCategory}</Badge>
                  <h2 className="text-xl font-semibold">{selectedService.name}</h2>
                </div>
                {selectedService.attributes.map((attr) => (
                  <div key={attr.key}>
                    <Label className="mb-2 block text-base">
                      {attr.label}
                      {attr.required && <span className="ml-1 text-red-500">*</span>}
                    </Label>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {attr.options.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setAttr(attr.key, opt.id)}
                          className={`rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                            attributes[attr.key] === opt.id
                              ? "border-blue-600 bg-blue-50 font-medium text-blue-800"
                              : "hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {attributes[attr.key] === opt.id && "✓ "}{opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Step 3 — Medidas */}
            {step === 3 && selectedService && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary">{selectedCategory}</Badge>
                  <h2 className="text-xl font-semibold">{selectedService.name}</h2>
                </div>

                {selectedService.unit !== "unit" ? (
                  <>
                    <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 text-sm text-blue-800">
                      Informe as medidas em <strong>centímetros (cm)</strong>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="width">Largura (cm) *</Label>
                        <div className="relative mt-1.5">
                          <Input
                            id="width"
                            type="number"
                            placeholder="100"
                            value={widthCm}
                            onChange={(e) => setWidthCm(e.target.value)}
                            className="pr-10 h-11"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">cm</span>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="height">Altura (cm) *</Label>
                        <div className="relative mt-1.5">
                          <Input
                            id="height"
                            type="number"
                            placeholder="50"
                            value={heightCm}
                            onChange={(e) => setHeightCm(e.target.value)}
                            className="pr-10 h-11"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">cm</span>
                        </div>
                      </div>
                    </div>
                    {widthCm && heightCm && (
                      <p className="text-sm text-gray-500">
                        Área por unidade:{" "}
                        <strong>
                          {(parseFloat(widthCm) * parseFloat(heightCm) / 10000).toFixed(4)} m²
                        </strong>
                      </p>
                    )}
                  </>
                ) : (
                  <p className="rounded-xl bg-gray-50 border px-4 py-3 text-sm text-gray-600">
                    Este serviço é cobrado por unidade/peça.
                  </p>
                )}

                <div>
                  <Label htmlFor="qty">Quantidade *</Label>
                  <div className="mt-1.5 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => String(Math.max(1, parseInt(q) - 1)))}
                      className="flex h-11 w-11 items-center justify-center rounded-xl border text-lg font-bold hover:bg-gray-50"
                    >−</button>
                    <Input
                      id="qty"
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="h-11 w-24 text-center"
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => String(parseInt(q) + 1))}
                      className="flex h-11 w-11 items-center justify-center rounded-xl border text-lg font-bold hover:bg-gray-50"
                    >+</button>
                  </div>
                </div>

                {price && (
                  <PriceCards price={price} serviceName={selectedService.name} quantity={quantity} />
                )}
              </div>
            )}

            {/* Step 4 — Entrega */}
            {step === 4 && (
              <div className="space-y-5">
                <h2 className="text-xl font-semibold">Onde e quando você precisa?</h2>

                <div>
                  <Label htmlFor="buyerName">Nome ou empresa (opcional)</Label>
                  <Input
                    id="buyerName"
                    placeholder="ex: João Silva ou Empresa Alfa"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="mt-1.5 h-11"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="city">Cidade *</Label>
                    <Input
                      id="city"
                      placeholder="São Paulo"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="mt-1.5 h-11"
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
                      className="mt-1.5 h-11 uppercase"
                    />
                  </div>
                </div>

                <div>
                  <Label>Prazo desejado (dias)</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {["3", "5", "7", "10", "15", "30"].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDeadlineDays(d)}
                        className={`rounded-xl border px-4 py-2 text-sm font-medium transition-all ${
                          deadlineDays === d
                            ? "border-blue-600 bg-blue-50 text-blue-800"
                            : "hover:border-gray-300"
                        }`}
                      >
                        {d} dias
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="obs">Observações</Label>
                  <Textarea
                    id="obs"
                    placeholder="Arte aprovada? Precisa de instalação?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="mt-1.5 resize-none"
                  />
                </div>

                <p className="text-xs text-gray-400">
                  Pedido aberto por 7 dias · Gratuito · Login necessário para publicar
                </p>
              </div>
            )}

            {/* Navegação unificada */}
            {showNav && (
              <div className="mt-8 flex items-center justify-between gap-4 border-t pt-6">
                <Button variant="outline" onClick={goBack} className="rounded-xl">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                </Button>
                {step === 4 ? (
                  <Button
                    disabled={!canProceed() || loading}
                    onClick={handleSubmit}
                    className="rounded-xl px-6"
                  >
                    {loading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publicando...</>
                    ) : (
                      <>Publicar pedido <ChevronRight className="ml-2 h-4 w-4" /></>
                    )}
                  </Button>
                ) : (
                  <Button
                    disabled={!canProceed()}
                    onClick={goNext}
                    className="rounded-xl px-6"
                  >
                    Continuar <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sidebar — oculta no passo IA para foco */}
        <div className={step === 0 && showAI ? "hidden lg:block" : ""}>
          {sidebar}
        </div>
      </div>
    </div>
  )
}
