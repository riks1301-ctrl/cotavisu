"use client"

import { Award, Clock, TrendingDown, Zap } from "lucide-react"
import { type } from "@/lib/typography"

type PriceInfo = {
  total: number
  perUnit: number
  unitLabel: string
  area: number | null
}

type Props = {
  price: PriceInfo
  serviceName: string
  quantity: string
}

// Variações realistas de mercado por tipo de serviço
const marketVariation: Record<string, { low: number; high: number; fastPremium: number }> = {
  "Adesivo Impresso":             { low: 0.75, high: 1.35, fastPremium: 1.20 },
  "Adesivo Recortado (Plotter)":  { low: 0.70, high: 1.30, fastPremium: 1.15 },
  "Envelopamento Veicular":       { low: 0.80, high: 1.25, fastPremium: 1.20 },
  "Banner":                       { low: 0.70, high: 1.40, fastPremium: 1.25 },
  "Lona para Fachada":            { low: 0.75, high: 1.35, fastPremium: 1.20 },
  "Placa em ACM":                 { low: 0.80, high: 1.30, fastPremium: 1.25 },
  "Placa em PVC":                 { low: 0.75, high: 1.30, fastPremium: 1.15 },
  "Letra Caixa":                  { low: 0.70, high: 1.50, fastPremium: 1.30 },
  "Painel Luminoso":              { low: 0.75, high: 1.40, fastPremium: 1.30 },
  "Impressão em Rígido (Direto)": { low: 0.72, high: 1.35, fastPremium: 1.20 },
}

function fmt(value: number) {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function deliveryDays(serviceName: string) {
  const base: Record<string, number> = {
    "Adesivo Impresso": 3, "Adesivo Recortado (Plotter)": 2, "Banner": 2,
    "Lona para Fachada": 3, "Placa em ACM": 10, "Placa em PVC": 5,
    "Letra Caixa": 7, "Painel Luminoso": 10, "Envelopamento Veicular": 5,
  }
  return base[serviceName] ?? 5
}

export function PriceCards({ price, serviceName, quantity }: Props) {
  const variation = marketVariation[serviceName] ?? { low: 0.75, high: 1.35, fastPremium: 1.20 }
  const base = price.total
  const avgDays = deliveryDays(serviceName)

  const cheapest = base * variation.low
  const fastest = base * variation.fastPremium
  const bestRated = base * 1.10

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className={`${type.cardTitle} text-gray-700`}>O que esperar de propostas reais</p>
        <span className={type.caption}>faixa estimada · referência de mercado</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border-2 border-green-200 bg-green-50 p-4 text-center">
          <TrendingDown className="mx-auto mb-2 h-5 w-5 text-green-600" />
          <p className={`${type.caption} font-medium text-green-700 mb-1`}>Mais barato</p>
          <p className={`${type.cardTitle} text-green-800`}>
            R$ {fmt(cheapest)}
          </p>
          <p className={`${type.caption} text-green-600 mt-1`}>~{avgDays + 1} dias</p>
          <p className={`${type.caption} mt-1`}>Sem pressa</p>
        </div>

        <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-4 text-center relative overflow-hidden">
          <div className={`absolute top-0 right-0 bg-blue-500 text-white ${type.caption} px-2 py-1 rounded-bl-lg font-medium`}>
            ⚡
          </div>
          <Zap className="mx-auto mb-2 h-5 w-5 text-blue-600" />
          <p className={`${type.caption} font-medium text-blue-700 mb-1`}>Mais rápido</p>
          <p className={`${type.cardTitle} text-blue-800`}>
            R$ {fmt(fastest)}
          </p>
          <p className={`${type.caption} text-blue-600 mt-1 font-medium`}>
            {avgDays <= 2 ? "amanhã" : `${Math.max(1, avgDays - 1)} dias`}
          </p>
          <p className={`${type.caption} mt-1`}>Urgente</p>
        </div>

        <div className="rounded-xl border-2 border-yellow-200 bg-yellow-50 p-4 text-center">
          <Award className="mx-auto mb-2 h-5 w-5 text-yellow-600" />
          <p className={`${type.caption} font-medium text-yellow-700 mb-1`}>Mais bem avaliado</p>
          <p className={`${type.cardTitle} text-yellow-800`}>
            R$ {fmt(bestRated)}
          </p>
          <p className={`${type.caption} text-yellow-600 mt-1`}>~{avgDays} dias</p>
          <p className={`${type.caption} mt-1`}>⭐ 4.8+</p>
        </div>
      </div>

      <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className={type.caption}>Faixa esperada de propostas</p>
          <p className={`${type.nav} font-bold text-gray-800`}>
            R$ {fmt(cheapest)} — R$ {fmt(base * variation.high)}
          </p>
        </div>
        <div className="text-right">
          <p className={type.caption}>Preço por {price.unitLabel}</p>
          <p className={`${type.nav} font-medium text-gray-700`}>
            R$ {fmt(price.perUnit * variation.low)} — R$ {fmt(price.perUnit * variation.high)}
          </p>
        </div>
      </div>

      <p className={`text-center ${type.caption}`}>
        💡 Publique o pedido e veja propostas reais em até 24h
      </p>
    </div>
  )
}
