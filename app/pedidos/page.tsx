"use client"

import { useEffect, useState } from "react"
import { ButtonLink } from "@/components/ui/button-link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Clock, MapPin, Package, Plus, Search, Star } from "lucide-react"
import { createClient } from "@/lib/supabase-client"
import { PageHeader } from "@/components/layout/page-header"
import { layout, type } from "@/lib/typography"

export default function PedidosPage() {
  const [requests, setRequests] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [userState, setUserState] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const categories = ["Adesivos", "Banners e Lonas", "Fachadas e ACM", "PDV — Materiais de Loja", "Luminosos", "Impressão Digital"]

  useEffect(() => {
    async function load() {
      const supabase = createClient()

      // Busca estado do usuário logado para priorização geográfica
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: prof } = await supabase.from("profiles").select("state").eq("id", user.id).single()
        setUserState(prof?.state ?? null)
      }

      // Busca apenas pedidos abertos, ordenados por data
      const { data } = await supabase
        .from("service_requests")
        .select("*")
        .eq("status", "open")
        .order("created_at", { ascending: false })

      const items = data ?? []
      setRequests(items)
      setFiltered(items)
      setLoading(false)
    }
    load()
  }, [])

  // Aplica filtros de busca e categoria
  useEffect(() => {
    let result = [...requests]

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((r) =>
        r.service_type?.toLowerCase().includes(q) ||
        r.city?.toLowerCase().includes(q) ||
        r.category?.toLowerCase().includes(q)
      )
    }

    if (activeCategory) {
      result = result.filter((r) => r.category === activeCategory)
    }

    // Prioriza mesma cidade/estado do fornecedor
    if (userState) {
      result.sort((a, b) => {
        const aMatch = a.state === userState ? 0 : 1
        const bMatch = b.state === userState ? 0 : 1
        return aMatch - bMatch
      })
    }

    setFiltered(result)
  }, [search, activeCategory, requests, userState])

  return (
    <div className={`${layout.container} py-10`}>
      <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          className="mb-0"
          title="Pedidos abertos"
          subtitle={`${filtered.length} pedido${filtered.length !== 1 ? "s" : ""} aguardando proposta${userState ? " · Sua região aparece primeiro" : ""}`}
        />
        <ButtonLink href="/pedidos/novo" className="shrink-0">
          <Plus className="mr-2 h-5 w-5" /> Criar pedido
        </ButtonLink>
      </div>

      {/* Busca e filtro */}
      <div className="mb-10 space-y-5">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            className="pl-12"
            placeholder="Buscar por serviço, categoria ou cidade..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => setActiveCategory(null)}
            className={`rounded-full border px-5 py-2.5 ${type.label} font-medium transition-all ${
              !activeCategory ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 hover:border-gray-300"
            }`}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              className={`rounded-full border px-5 py-2.5 ${type.label} font-medium transition-all ${
                activeCategory === cat ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-7 w-7 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-gray-400">
          <Package className="mx-auto mb-4 h-14 w-14 opacity-30" />
          <p className={`mb-2 ${type.cardTitle}`}>Nenhum pedido encontrado</p>
          <p className={`${type.body} mb-6`}>Tente outro filtro ou crie o primeiro pedido.</p>
          <ButtonLink href="/pedidos/novo">Criar pedido</ButtonLink>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 2xl:grid-cols-3">
          {filtered.map((req) => {
            const isSameState = userState && req.state === userState
            const expiresIn = Math.ceil((new Date(req.expires_at).getTime() - Date.now()) / 86400000)
            const isUrgent = expiresIn <= 2

            return (
              <Card key={req.id} className={`hover:shadow-xl transition-all ${isSameState ? "border-blue-200 ring-blue-100" : ""}`}>
                <CardContent className="flex flex-col gap-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary">{req.category}</Badge>
                      {isSameState && (
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                          <Star className="mr-1 h-4 w-4" /> Sua região
                        </Badge>
                      )}
                    </div>
                    <span className={`shrink-0 ${type.label} ${isUrgent ? "text-red-600 font-semibold" : "text-gray-500"}`}>
                      {isUrgent ? `⚠ ${expiresIn}d restante${expiresIn !== 1 ? "s" : ""}` : `${expiresIn}d`}
                    </span>
                  </div>

                  <div>
                    <h3 className={type.cardTitle}>{req.service_type}</h3>
                    {req.material && <p className={`mt-2 ${type.cardDesc}`}>{req.material}</p>}
                  </div>

                  <div className={`grid grid-cols-1 gap-2.5 ${type.body} text-gray-700 sm:grid-cols-2`}>
                    {req.width_m && req.height_m && (
                      <div className="flex items-center gap-2">
                        <Package className="h-5 w-5 shrink-0 text-gray-400" />
                        {(req.width_m * 100).toFixed(0)}×{(req.height_m * 100).toFixed(0)}cm · {req.quantity}un
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 shrink-0 text-gray-400" />
                      {req.city}/{req.state}
                    </div>
                    <div className="flex items-center gap-2 sm:col-span-2">
                      <Clock className="h-5 w-5 shrink-0 text-gray-400" />
                      Prazo: {req.deadline_days} dias
                    </div>
                  </div>

                  {req.description && (
                    <p className={`${type.body} text-gray-600 line-clamp-3 leading-relaxed`}>{req.description}</p>
                  )}

                  <div className="mt-auto flex gap-3 pt-2">
                    <ButtonLink href={`/pedidos/${req.id}`} className="flex-1" variant="outline">
                      Ver detalhes
                    </ButtonLink>
                    <ButtonLink href={`/pedidos/${req.id}#proposta`} className="flex-1">
                      Enviar proposta
                    </ButtonLink>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
