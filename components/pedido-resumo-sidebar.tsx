"use client"

import { useEffect, useState } from "react"
import { Clock, MapPin, Users } from "lucide-react"
import { createClient } from "@/lib/supabase-client"
import type { ServiceConfig } from "@/lib/service-options"

type PriceEstimate = {
  total: number
  perUnit: number
  unitLabel: string
}

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
}

export function PedidoResumoSidebar({
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

  const specs = service
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
      <div className="rounded-2xl border bg-white shadow-sm">
        <div className="border-b px-5 py-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Resumo do pedido
          </p>
          <p className="mt-1 font-semibold text-gray-900">
            {service?.name ?? category ?? "Novo orçamento"}
          </p>
        </div>

        <div className="space-y-4 p-5 text-sm">
          {category && (
            <Row label="Categoria" value={category} />
          )}

          {specs.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 mb-1">Especificações</p>
              <ul className="space-y-0.5 text-gray-700">
                {specs.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {service && (widthCm || quantity) && (
            <Row
              label="Medidas"
              value={
                service.unit !== "unit" && widthCm && heightCm
                  ? `${widthCm} × ${heightCm} cm · ${quantity} un`
                  : `${quantity} unidade(s)`
              }
            />
          )}

          {(city || state) && (
            <div className="flex gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-400">Local</p>
                <p className="font-medium text-gray-900">
                  {city}{state ? ` / ${state}` : ""}
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Clock className="h-4 w-4 shrink-0 text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs text-gray-400">Prazo desejado</p>
              <p className="font-medium text-gray-900">{deadlineDays} dias</p>
            </div>
          </div>

          <div className="rounded-xl bg-gray-50 p-3 space-y-2">
            <div className="flex gap-2">
              <Users className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Gráficas na região</p>
                <p className="font-medium text-gray-900">
                  {state.length === 2
                    ? supplierCount !== null
                      ? supplierCount > 0
                        ? `~${supplierCount} ativa${supplierCount > 1 ? "s" : ""}`
                        : "Em expansão"
                      : "..."
                    : "Informe o UF"}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500 pl-6">
              Resposta média: <strong className="text-gray-700">4–24h</strong>
            </p>
          </div>

          {price && (
            <div className="rounded-xl border border-green-100 bg-green-50 p-3">
              <p className="text-xs text-green-700/80">Faixa de mercado</p>
              <p className="text-lg font-bold text-green-700">
                R$ {price.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-green-600/70">Referência, não é proposta</p>
            </div>
          )}
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-gray-400">
        Gratuito · Login para publicar
      </p>
    </aside>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="font-medium text-gray-900">{value}</p>
    </div>
  )
}
