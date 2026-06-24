"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  ChevronRight,
  Loader2,
} from "lucide-react"
import { createClient } from "@/lib/supabase-client"
import { serviceCategories, type ServiceConfig } from "@/lib/service-options"
import { PriceCards } from "@/components/price-cards"
import { PDVBuilder, type PDVItemSelected } from "@/components/pdv-builder"
import { WizardProgress } from "./wizard-progress"
import { WizardSidebar } from "./wizard-sidebar"
import { AIBriefStep } from "./ai-brief-step"
import { CategoryStep } from "./category-step"
import { FileUploadZone } from "./file-upload-zone"
import {
  WIZARD_STEPS,
  type WizardStepId,
  type AISuggestionResult,
  type UploadedFile,
  type PriceEstimate,
} from "./types"

const PRICE_REF: Record<string, { value: number; unit: string }> = {
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

export function PedidoWizard() {
  const router = useRouter()
  const [step, setStep] = useState<WizardStepId>("brief")
  const [loading, setLoading] = useState(false)
  const [aiApplied, setAiApplied] = useState(false)
  const [showPDV, setShowPDV] = useState(false)

  const [selectedCategory, setSelectedCategory] = useState("")
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
  const [files, setFiles] = useState<UploadedFile[]>([])

  const category = serviceCategories.find((c) => c.name === selectedCategory)
  const stepIndex = WIZARD_STEPS.findIndex((s) => s.id === step)

  const completedSteps = useMemo(() => {
    const done = new Set<WizardStepId>()
    if (selectedCategory || aiApplied) done.add("brief")
    if (selectedCategory) done.add("category")
    if (selectedService) done.add("service")
  if (selectedService) {
      const required = selectedService.attributes.filter((a) => a.required)
      if (required.every((a) => attributes[a.key])) done.add("specs")
    }
    if (selectedService) {
      if (selectedService.unit === "unit" ? quantity : widthCm && heightCm && quantity) {
        done.add("details")
      }
    }
    return done
  }, [selectedCategory, selectedService, attributes, widthCm, heightCm, quantity, aiApplied])

  function estimatedPrice(): PriceEstimate | null {
    if (!selectedService) return null
    const ref = PRICE_REF[selectedService.name]
    if (!ref) return null
    const qty = parseInt(quantity) || 1
    if (selectedService.unit === "unit") {
      return { total: qty * ref.value, perUnit: ref.value, unitLabel: "unidade", area: null }
    }
    if (!widthCm || !heightCm) return null
    const w = parseFloat(widthCm) / 100
    const h = parseFloat(heightCm) / 100
    const area = w * h
    return {
      total: area * qty * ref.value,
      perUnit: area * ref.value,
      unitLabel: "m²",
      area,
    }
  }

  const price = estimatedPrice()

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

  function goNext() {
    const next = WIZARD_STEPS[stepIndex + 1]
    if (next) setStep(next.id)
  }

  function goBack() {
    const prev = WIZARD_STEPS[stepIndex - 1]
    if (prev) setStep(prev.id)
  }

  function applyAISuggestion(s: AISuggestionResult) {
    setSelectedCategory(s.categoria)
    const cat = serviceCategories.find((c) => c.name === s.categoria)
    const svc = cat?.services.find((sv) => sv.name === s.servico) ?? null
    setSelectedService(svc)
    if (s.largura_cm) setWidthCm(String(s.largura_cm))
    if (s.altura_cm) setHeightCm(String(s.altura_cm))
    setQuantity(String(s.quantidade))
    if (s.observacoes) setDescription(s.observacoes)
    setAiApplied(true)

    if (s.categoria === "PDV — Materiais de Loja") {
      setShowPDV(true)
      return
    }
    setStep(svc ? "specs" : "category")
  }

  function handleCategorySelect(name: string) {
    setSelectedCategory(name)
    setSelectedService(null)
    setAttributes({})
    if (name === "PDV — Materiais de Loja") {
      setShowPDV(true)
    }
  }

  function setAttr(key: string, value: string) {
    setAttributes((prev) => ({ ...prev, [key]: value }))
  }

  function buildDescriptionExtra(): string {
    const parts: string[] = []
    if (files.length > 0) {
      parts.push(`Arquivos de referência: ${files.map((f) => f.file.name).join(", ")}`)
    }
    return parts.join("\n")
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

    const fileNote = buildDescriptionExtra()
    const descFull = [specsText, description, fileNote].filter(Boolean).join("\n")

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
      const msg = error?.message ?? "erro desconhecido"
      alert(`Erro ao criar pedido: ${msg}`)
    }
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

    const fileNote = buildDescriptionExtra()
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
        description: [specsText, desc, fileNote].filter(Boolean).join("\n\n"),
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

  function canProceed(): boolean {
    switch (step) {
      case "brief":
        return true
      case "category":
        return !!selectedCategory && !showPDV
      case "service":
        return !!selectedService
      case "specs": {
        const required = selectedService?.attributes.filter((a) => a.required) ?? []
        return required.every((a) => attributes[a.key])
      }
      case "details":
        if (selectedService?.unit === "unit") return !!quantity
        return !!widthCm && !!heightCm && !!quantity
      case "delivery":
        return !!city && !!state
      default:
        return false
    }
  }

  if (showPDV) {
    return (
      <div className="min-h-screen bg-[#fafaf9]">
        <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-8 lg:px-12">
          <button
            type="button"
            onClick={() => { setShowPDV(false); setSelectedCategory(""); setStep("category") }}
            className="mb-6 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar às categorias
          </button>
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xl sm:p-10">
            <PDVBuilder
              onConfirm={handlePDVSubmit}
              onBack={() => { setShowPDV(false); setSelectedCategory(""); setStep("category") }}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-8 lg:px-12 lg:py-12">
        {/* Header */}
        <div className="mb-8 lg:mb-10">
          <p className="text-sm font-medium uppercase tracking-widest text-gray-400">
            Novo pedido
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Solicite orçamentos profissionais
          </h1>
          <p className="mt-2 max-w-2xl text-lg text-gray-500">
            Gráficas da sua região competem pelo seu projeto — você escolhe a melhor proposta
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:gap-12">
          {/* Main wizard */}
          <div className="min-w-0">
            <WizardProgress currentStep={step} completedSteps={completedSteps} />

            <div className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
              {step === "brief" && (
                <AIBriefStep
                  onApply={applyAISuggestion}
                  onManual={() => setStep("category")}
                />
              )}

              {step === "category" && (
                <CategoryStep selected={selectedCategory} onSelect={handleCategorySelect} />
              )}

              {step === "service" && category && (
                <div>
                  <div className="mb-8">
                    <Badge variant="secondary" className="mb-3">{category.icon} {category.name}</Badge>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                      Qual serviço específico?
                    </h2>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {category.services.map((svc) => (
                      <button
                        key={svc.name}
                        type="button"
                        onClick={() => { setSelectedService(svc); setAttributes({}) }}
                        className={`flex items-center gap-4 rounded-2xl border p-5 text-left transition-all ${
                          selectedService?.name === svc.name
                            ? "border-gray-900 bg-gray-50 ring-1 ring-gray-900"
                            : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                        }`}
                      >
                        <span className="text-3xl">{svc.icon}</span>
                        <span className="font-semibold text-gray-900">{svc.name}</span>
                        {selectedService?.name === svc.name && (
                          <CheckCircle className="ml-auto h-5 w-5 text-gray-900" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === "specs" && selectedService && (
                <div className="space-y-8">
                  <div>
                    <Badge variant="secondary" className="mb-3">{selectedCategory}</Badge>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                      Especificações técnicas
                    </h2>
                    <p className="mt-2 text-gray-500">Defina material, acabamento e detalhes do projeto</p>
                  </div>

                  {selectedService.attributes.map((attr) => (
                    <div key={attr.key}>
                      <Label className="mb-3 block text-base font-semibold text-gray-900">
                        {attr.label}
                        {attr.required && <span className="ml-1 text-red-500">*</span>}
                      </Label>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {attr.options.map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setAttr(attr.key, opt.id)}
                            className={`rounded-xl border px-4 py-3.5 text-left text-sm transition-all ${
                              attributes[attr.key] === opt.id
                                ? "border-gray-900 bg-gray-900 text-white font-medium"
                                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {step === "details" && selectedService && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                      Medidas e referências
                    </h2>
                    <p className="mt-2 text-gray-500">
                      Informe dimensões e anexe arquivos para orçamentos mais precisos
                    </p>
                  </div>

                  {selectedService.unit !== "unit" ? (
                    <>
                      <div className="rounded-2xl bg-gray-50 px-5 py-4 text-sm text-gray-600">
                        Medidas em <strong>centímetros (cm)</strong>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="width" className="text-base">Largura (cm)</Label>
                          <div className="relative mt-2">
                            <Input
                              id="width"
                              type="number"
                              placeholder="100"
                              value={widthCm}
                              onChange={(e) => setWidthCm(e.target.value)}
                              className="h-12 rounded-xl text-lg pr-12"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">cm</span>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="height" className="text-base">Altura (cm)</Label>
                          <div className="relative mt-2">
                            <Input
                              id="height"
                              type="number"
                              placeholder="50"
                              value={heightCm}
                              onChange={(e) => setHeightCm(e.target.value)}
                              className="h-12 rounded-xl text-lg pr-12"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">cm</span>
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
                    <p className="rounded-2xl bg-gray-50 px-5 py-4 text-sm text-gray-600">
                      Este serviço é cobrado por unidade/peça.
                    </p>
                  )}

                  <div>
                    <Label className="text-base">Quantidade</Label>
                    <div className="mt-2 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => String(Math.max(1, parseInt(q) - 1)))}
                        className="flex h-12 w-12 items-center justify-center rounded-xl border text-xl font-bold hover:bg-gray-50"
                      >−</button>
                      <Input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="h-12 w-24 rounded-xl text-center text-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => String(parseInt(q) + 1))}
                        className="flex h-12 w-12 items-center justify-center rounded-xl border text-xl font-bold hover:bg-gray-50"
                      >+</button>
                    </div>
                  </div>

                  {price && (
                    <PriceCards price={price} serviceName={selectedService.name} quantity={quantity} />
                  )}

                  <div>
                    <Label className="mb-3 block text-base font-semibold">Arquivos de referência</Label>
                    <FileUploadZone files={files} onChange={setFiles} />
                  </div>
                </div>
              )}

              {step === "delivery" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                      Onde e quando?
                    </h2>
                    <p className="mt-2 text-gray-500">
                      Últimos detalhes para receber propostas da sua região
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="buyerName" className="text-base">Nome ou empresa (opcional)</Label>
                    <Input
                      id="buyerName"
                      placeholder="ex: Loja Alfa Comunicação"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      className="mt-2 h-12 rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="city" className="text-base">Cidade</Label>
                      <Input
                        id="city"
                        placeholder="São Paulo"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="mt-2 h-12 rounded-xl"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state" className="text-base">UF</Label>
                      <Input
                        id="state"
                        placeholder="SP"
                        maxLength={2}
                        value={state}
                        onChange={(e) => setState(e.target.value.toUpperCase())}
                        className="mt-2 h-12 rounded-xl uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-base">Prazo desejado</Label>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {["3", "5", "7", "10", "15", "30"].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setDeadlineDays(d)}
                          className={`rounded-xl border px-5 py-2.5 text-sm font-medium transition-all ${
                            deadlineDays === d
                              ? "border-gray-900 bg-gray-900 text-white"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          {d} dias
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="obs" className="text-base">Observações</Label>
                    <Textarea
                      id="obs"
                      placeholder="Arte aprovada? Precisa de instalação? Detalhes extras..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className="mt-2 rounded-xl resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Navigation */}
              {step !== "brief" && (
                <div className="mt-10 flex items-center justify-between gap-4 border-t border-gray-100 pt-8">
                  <Button
                    variant="ghost"
                    onClick={goBack}
                    className="rounded-xl text-gray-600"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                  </Button>

                  {step === "delivery" ? (
                    <Button
                      size="lg"
                      disabled={!canProceed() || loading}
                      onClick={handleSubmit}
                      className="h-12 rounded-xl bg-gray-900 px-8 hover:bg-gray-800"
                    >
                      {loading ? (
                        <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Publicando...</>
                      ) : (
                        <>Publicar pedido <ChevronRight className="ml-2 h-5 w-5" /></>
                      )}
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      disabled={!canProceed()}
                      onClick={goNext}
                      className="h-12 rounded-xl bg-gray-900 px-8 hover:bg-gray-800"
                    >
                      Continuar <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar — oculto no passo IA para foco total no assistente */}
          <div className={step === "brief" ? "hidden lg:block" : ""}>
          <WizardSidebar
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
            fileCount={files.length}
            aiApplied={aiApplied}
          />
          </div>
        </div>
      </div>
    </div>
  )
}
