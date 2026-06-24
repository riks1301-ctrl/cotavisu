"use client"

import { useEffect, useState } from "react"
import { Clock, MapPin, Sparkles, Users, TrendingUp } from "lucide-react"
import { createClient } from "@/lib/supabase-client"
import type { ServiceConfig } from "@/lib/service-options"
import type { PriceEstimate } from "./types"

type Props = {
  category: string
  service: ServiceConfig | null
  attributes: Record<string, string>
  widthCm: string
  heightCm: string
  quantity: string
  city: string
  state: string
  deadlineDays: string
  price: PriceEstimate | null
  fileCount: number
  aiApplied: boolean
}

export function WizardSidebar({
  category,
  service,
  attributes,
  widthCm,
  heightCm,
  quantity,
  city,
  state,
  deadlineDays,
  price,
  fileCount,
  aiApplied,
}: Props) {
  const [supplierCount, setSupplierCount] = useState<number | null>(null)

  useEffect(() => {
    if (!state || state.length !== 2) {
      setSupplierCount(null)
      return
    }
    const supabase = createClient()
    supabase
      .from("supplier_profiles")
      .select("id, profiles!inner(state)", { count: "exact", head: true })
      .eq("is_active", true)
      .eq("profiles.state", state.toUpperCase())
      .then(({ count }) => setSupplierCount(count ?? 0))
  }, [state])

  const specsSummary = service
    ? Object.entries(attributes)
        .map(([key, val]) => {
          const attr = service.attributes.find((a) => a.key === key)
          const opt = attr?.options.find((o) => o.id === val)
          return opt ? `${attr?.label}: ${opt.label}` : null
        })
        .filter(Boolean)
    : []

  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-xl shadow-gray-200/50">
        <div className="border-b bg-gradient-to-br from-gray-900 to-gray-800 px-6 py-5 text-white">
          <p className="text-xs font-medium uppercase tracking-widest text-white/60">
            Seu pedido
          </p>
          <h2 className="mt-1 text-lg font-semibold leading-snug">
            {service?.name ?? category ?? "Novo orçamento"}
          </h2>
          {aiApplied && (
            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-xs">
              <Sparkles className="h-3 w-3" /> Sugerido por IA
            </span>
          )}
        </div>

        <div className="space-y-5 p-6">
          {category && (
            <SidebarRow label="Categoria" value={category} />
          )}

          {specsSummary.length > 0 && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-2">
                Especificações
              </p>
              <ul className="space-y-1">
                {specsSummary.map((s) => (
                  <li key={s} className="text-sm text-gray-700">{s}</li>
                ))}
              </ul>
            </div>
          )}

          {(widthCm || quantity) && service && (
            <SidebarRow
              label="Medidas"
              value={
                service.unit !== "unit" && widthCm && heightCm
                  ? `${widthCm} × ${heightCm} cm · ${quantity} un`
                  : `${quantity} unidade(s)`
              }
            />
          )}

          {(city || state) && (
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Local</p>
                <p className="text-sm font-medium text-gray-900">
                  {city ? `${city}${state ? ` / ${state}` : ""}` : state}
                </p>
              </div>
            </div>
          )}

          {deadlineDays && (
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Prazo desejado</p>
                <p className="text-sm font-medium text-gray-900">{deadlineDays} dias</p>
              </div>
            </div>
          )}

          {fileCount > 0 && (
            <SidebarRow label="Arquivos" value={`${fileCount} anexo(s)`} />
          )}

          <div className="rounded-xl bg-gray-50 p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100">
                <Users className="h-4 w-4 text-emerald-700" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Fornecedores estimados</p>
                <p className="text-sm font-semibold text-gray-900">
                  {state.length === 2
                    ? supplierCount !== null
                      ? supplierCount > 0
                        ? `${supplierCount} gráfica${supplierCount > 1 ? "s" : ""} ativa${supplierCount > 1 ? "s" : ""}`
                        : "Recrutando na região"
                      : "Calculando..."
                    : "Informe o estado"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
                <TrendingUp className="h-4 w-4 text-blue-700" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Tempo médio de resposta</p>
                <p className="text-sm font-semibold text-gray-900">4–24 horas</p>
              </div>
            </div>
          </div>

          {price && (
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-700/70">
                Faixa de mercado
              </p>
              <p className="mt-1 text-2xl font-bold text-emerald-700">
                R$ {price.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
              <p className="mt-1 text-xs text-emerald-600/80">
                Referência — não é proposta de fornecedor
              </p>
            </div>
          )}
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-gray-400 px-2">
        Gratuito · Pedido aberto por 7 dias · Login necessário para publicar
      </p>
    </aside>
  )
}

function SidebarRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value}</p>
    </div>
  )
}
