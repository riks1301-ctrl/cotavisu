"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase-client"
import { Users, Clock, TrendingUp, Zap } from "lucide-react"

type Stats = {
  totalSuppliers: number
  requestsToday: number
  totalRequests: number
}

export function UrgencyBar() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const today = new Date().toISOString().split("T")[0]

      const [suppRes, todayRes, totalRes] = await Promise.all([
        supabase.from("supplier_profiles").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("service_requests").select("id", { count: "exact", head: true }).gte("created_at", today),
        supabase.from("service_requests").select("id", { count: "exact", head: true }),
      ])

      setStats({
        totalSuppliers: suppRes.count ?? 0,
        requestsToday: todayRes.count ?? 0,
        totalRequests: totalRes.count ?? 0,
      })
    }
    load()

    // Pulsa a cada 8s para dar sensação de atividade
    const interval = setInterval(() => setPulse((p) => !p), 8000)
    return () => clearInterval(interval)
  }, [])

  if (!stats) return null

  const suppliersLabel = stats.totalSuppliers >= 5
    ? `${stats.totalSuppliers} fornecedores ativos`
    : "Fornecedores verificados"

  const todayLabel = stats.requestsToday > 0
    ? `${stats.requestsToday} pedido${stats.requestsToday > 1 ? "s" : ""} hoje`
    : "Plataforma ativa"

  const responseLabel = stats.totalRequests > 10
    ? "Tempo médio de resposta: 2h"
    : "Receba propostas em até 24h"

  return (
    <div className="rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-3">
      <div className="flex flex-wrap items-center justify-between gap-3">

        {/* Fornecedores */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className={`h-2 w-2 rounded-full bg-green-500 ${pulse ? "animate-ping absolute" : ""}`} />
            <div className="h-2 w-2 rounded-full bg-green-500" />
          </div>
          <Users className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">{suppliersLabel}</span>
        </div>

        {/* Pedidos hoje */}
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-indigo-600" />
          <span className="text-sm font-medium text-indigo-800">{todayLabel}</span>
        </div>

        {/* Tempo de resposta */}
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-orange-500" />
          <span className="text-sm font-medium text-orange-700">{responseLabel}</span>
        </div>

      </div>
    </div>
  )
}

// Versão menor para usar dentro do formulário entre os steps
export function UrgencyInline({ city }: { city?: string }) {
  const [stats, setStats] = useState<{ suppliers: number; today: number } | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const today = new Date().toISOString().split("T")[0]

      const [suppRes, todayRes] = await Promise.all([
        supabase.from("supplier_profiles").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("service_requests").select("id", { count: "exact", head: true }).gte("created_at", today),
      ])

      setStats({
        suppliers: suppRes.count ?? 0,
        today: todayRes.count ?? 0,
      })
    }
    load()
  }, [])

  if (!stats) return null

  return (
    <div className="flex flex-wrap gap-2">
      {stats.suppliers > 0 && (
        <span className="flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
          </span>
          {stats.suppliers} fornecedores ativos
        </span>
      )}
      {stats.today > 0 && (
        <span className="flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
          <TrendingUp className="h-3 w-3" />
          {stats.today} pedido{stats.today > 1 ? "s" : ""} criado{stats.today > 1 ? "s" : ""} hoje
        </span>
      )}
      <span className="flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700">
        <Zap className="h-3 w-3" />
        Receba propostas em até 24h
      </span>
    </div>
  )
}
