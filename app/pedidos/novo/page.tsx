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
import { supabase } from "@/lib/supabase"

const categories = [
  { name: "Adesivos", icon: "🏷️", services: ["Adesivo Impresso Colorido", "Adesivo Recortado (Plotter)", "Envelopamento Veicular Parcial"] },
  { name: "Banners e Lonas", icon: "🚩", services: ["Banner em Lona 440g", "Banner Blackout Dupla Face"] },
  { name: "Fachadas e ACM", icon: "🏢", services: ["Fachada em ACM"] },
  { name: "Plotagem e Recorte", icon: "✂️", services: ["Plotagem Planta A1"] },
  { name: "Luminosos e Letras", icon: "⚡", services: ["Letra Caixa Acrílico"] },
  { name: "Impressão Digital", icon: "🖨️", services: ["Impressão Digital Personalizada"] },
]

const basePrices: Record<string, { price: number; unit: string; formula: string }> = {
  "Adesivo Impresso Colorido": { price: 45, unit: "m²", formula: "area" },
  "Adesivo Recortado (Plotter)": { price: 35, unit: "m²", formula: "area_min1m2" },
  "Envelopamento Veicular Parcial": { price: 380, unit: "m²", formula: "area" },
  "Banner em Lona 440g": { price: 25, unit: "m²", formula: "area" },
  "Banner Blackout Dupla Face": { price: 55, unit: "m²", formula: "area" },
  "Fachada em ACM": { price: 280, unit: "m²", formula: "area" },
  "Plotagem Planta A1": { price: 12, unit: "un", formula: "unit" },
  "Letra Caixa Acrílico": { price: 180, unit: "un", formula: "unit" },
}

export default function NovoPedidoPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    category: "",
    serviceType: "",
    material: "",
    width: "",
    height: "",
    quantity: "1",
    city: "",
    state: "",
    deadlineDays: "7",
    description: "",
    buyerName: "",
  })

  const selectedCat = categories.find((c) => c.name === form.category)

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function estimatedPrice() {
    const svc = basePrices[form.serviceType]
    if (!svc || !form.width || !form.height) return null
    const w = parseFloat(form.width)
    const h = parseFloat(form.height)
    const qty = parseInt(form.quantity) || 1
    let price = 0
    if (svc.formula === "area") price = w * h * qty * svc.price
    if (svc.formula === "area_min1m2") price = Math.max(w * h, 1) * qty * svc.price
    if (svc.formula === "unit") price = qty * svc.price
    return price.toFixed(2)
  }

  async function handleSubmit() {
    setLoading(true)
    const { data, error } = await supabase
      .from("service_requests")
      .insert({
        service_type: form.serviceType,
        category: form.category,
        material: form.material || null,
        width_m: parseFloat(form.width),
        height_m: parseFloat(form.height),
        quantity: parseInt(form.quantity),
        city: form.city,
        state: form.state.toUpperCase(),
        deadline_days: parseInt(form.deadlineDays),
        description: form.description || null,
        buyer_name: form.buyerName || null,
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

  const price = estimatedPrice()

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Criar pedido de orçamento</h1>
        <p className="text-gray-500">Preencha os detalhes e receba propostas de fornecedores</p>
      </div>

      {/* Steps */}
      <div className="mb-8 flex items-center gap-2">
        {[{ n: 1, label: "Serviço" }, { n: 2, label: "Detalhes" }, { n: 3, label: "Localização" }].map((s, i) => (
          <div key={s.n} className="flex items-center gap-2">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${step > s.n ? "bg-green-500 text-white" : step === s.n ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}>
              {step > s.n ? <CheckCircle className="h-4 w-4" /> : s.n}
            </div>
            <span className={`text-sm ${step === s.n ? "font-medium" : "text-gray-400"}`}>{s.label}</span>
            {i < 2 && <ChevronRight className="h-4 w-4 text-gray-300" />}
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          {/* Step 1 — Categoria e serviço */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <Label className="mb-2 block">Categoria do serviço</Label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {categories.map((cat) => (
                    <button
                      key={cat.name}
                      onClick={() => { set("category", cat.name); set("serviceType", "") }}
                      className={`flex flex-col items-center gap-1 rounded-lg border p-3 text-sm transition-all ${form.category === cat.name ? "border-blue-500 bg-blue-50 font-medium text-blue-700" : "hover:border-gray-300 hover:bg-gray-50"}`}
                    >
                      <span className="text-2xl">{cat.icon}</span>
                      <span>{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {selectedCat && (
                <div>
                  <Label className="mb-2 block">Tipo de serviço</Label>
                  <div className="space-y-2">
                    {selectedCat.services.map((s) => (
                      <button
                        key={s}
                        onClick={() => set("serviceType", s)}
                        className={`w-full rounded-lg border p-3 text-left text-sm transition-all ${form.serviceType === s ? "border-blue-500 bg-blue-50 font-medium" : "hover:border-gray-300"}`}
                      >
                        <div className="flex justify-between">
                          <span>{s}</span>
                          {basePrices[s] && (
                            <span className="text-gray-400">
                              ~R$ {basePrices[s].price}/{basePrices[s].unit}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Button className="w-full" disabled={!form.category || !form.serviceType} onClick={() => setStep(2)}>
                Continuar <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Step 2 — Medidas */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{form.category}</Badge>
                <span className="text-sm text-gray-600">{form.serviceType}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="width">Largura (metros)</Label>
                  <Input id="width" type="number" placeholder="ex: 2.5" value={form.width} onChange={(e) => set("width", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="height">Altura (metros)</Label>
                  <Input id="height" type="number" placeholder="ex: 1.0" value={form.height} onChange={(e) => set("height", e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="qty">Quantidade</Label>
                  <Input id="qty" type="number" min="1" value={form.quantity} onChange={(e) => set("quantity", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="material">Material (opcional)</Label>
                  <Input id="material" placeholder="ex: lona 440g" value={form.material} onChange={(e) => set("material", e.target.value)} />
                </div>
              </div>

              <div>
                <Label htmlFor="desc">Descrição e observações</Label>
                <Textarea id="desc" placeholder="Detalhe o que você precisa..." value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} />
              </div>

              {price && (
                <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
                  <p className="text-sm text-blue-700">
                    <span className="font-semibold">Estimativa de referência:</span> R$ {price}
                    <span className="ml-1 text-xs text-blue-500">(preço médio de mercado)</span>
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Voltar</Button>
                <Button className="flex-1" disabled={!form.width || !form.height} onClick={() => setStep(3)}>
                  Continuar <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3 — Localização */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <Label htmlFor="buyerName">Seu nome ou empresa (opcional)</Label>
                <Input id="buyerName" placeholder="ex: Empresa Alfa Ltda" value={form.buyerName} onChange={(e) => set("buyerName", e.target.value)} />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input id="city" placeholder="ex: São Paulo" value={form.city} onChange={(e) => set("city", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="state">Estado</Label>
                  <Input id="state" placeholder="SP" maxLength={2} value={form.state} onChange={(e) => set("state", e.target.value.toUpperCase())} />
                </div>
              </div>

              <div>
                <Label htmlFor="deadline">Prazo desejado (dias)</Label>
                <Input id="deadline" type="number" min="1" value={form.deadlineDays} onChange={(e) => set("deadlineDays", e.target.value)} />
              </div>

              {/* Resumo */}
              <div className="rounded-lg border bg-gray-50 p-4 space-y-1 text-sm">
                <p className="font-semibold text-gray-700 mb-2">Resumo do pedido</p>
                <p><span className="text-gray-500">Serviço:</span> {form.serviceType}</p>
                <p><span className="text-gray-500">Medidas:</span> {form.width}m × {form.height}m</p>
                <p><span className="text-gray-500">Quantidade:</span> {form.quantity} unidades</p>
                {price && <p className="text-blue-600 font-medium pt-1">Estimativa: R$ {price}</p>}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>Voltar</Button>
                <Button className="flex-1" disabled={!form.city || !form.state || loading} onClick={handleSubmit}>
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publicando...</> : "Publicar pedido"}
                </Button>
              </div>
              <p className="text-center text-xs text-gray-400">Pedido fica aberto por 7 dias. Gratuito para compradores.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
