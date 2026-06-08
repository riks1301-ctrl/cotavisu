"use client"

import { useEffect, useState } from "react"
import { ButtonLink } from "@/components/ui/button-link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Clock, MapPin, Package, Plus, Search, Star } from "lucide-react"
import { createClient } from "@/lib/supabase-client"

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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pedidos abertos</h1>
          <p className="text-gray-500 text-sm">
            {filtered.length} pedido{filtered.length !== 1 ? "s" : ""} aguardando proposta
            {userState && " · Sua região aparece primeiro"}
          </p>
        </div>
        <ButtonLink href="/pedidos/novo">
          <Plus className="mr-2 h-4 w-4" /> Criar pedido
        </ButtonLink>
      </div>

      {/* Busca e filtro */}
      <div className="mb-5 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            className="pl-9"
            placeholder="Buscar por serviço, categoria ou cidade..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveCategory(null)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
              !activeCategory ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 hover:border-gray-300"
            }`}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
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
        <div className="py-16 text-center text-gray-400">
          <Package className="mx-auto mb-3 h-12 w-12 opacity-30" />
          <p className="mb-2 font-medium">Nenhum pedido encontrado</p>
          <p className="text-sm mb-4">Tente outro filtro ou crie o primeiro pedido.</p>
          <ButtonLink href="/pedidos/novo">Criar pedido</ButtonLink>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((req) => {
            const isSameState = userState && req.state === userState
            const expiresIn = Math.ceil((new Date(req.expires_at).getTime() - Date.now()) / 86400000)
            const isUrgent = expiresIn <= 2

            return (
              <Card key={req.id} className={`hover:shadow-md transition-shadow ${isSameState ? "border-blue-200" : ""}`}>
                <CardContent className="p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge variant="secondary" className="text-xs">{req.category}</Badge>
                      {isSameState && (
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-xs">
                          <Star className="mr-1 h-2.5 w-2.5" /> Sua região
                        </Badge>
                      )}
                    </div>
                    <span className={`text-xs ${isUrgent ? "text-red-500 font-medium" : "text-gray-400"}`}>
                      {isUrgent ? `⚠ ${expiresIn}d restante${expiresIn !== 1 ? "s" : ""}` : `${expiresIn}d`}
                    </span>
                  </div>

                  <h3 className="mb-1 text-base font-semibold">{req.service_type}</h3>
                  {req.material && <p className="mb-1 text-xs text-gray-400">{req.material}</p>}

                  <div className="mb-4 mt-2 grid grid-cols-2 gap-2 text-xs text-gray-500">
                    {req.width_m && req.height_m && (
                      <div className="flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        {(req.width_m * 100).toFixed(0)}×{(req.height_m * 100).toFixed(0)}cm · {req.quantity}un
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {req.city}/{req.state}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Prazo: {req.deadline_days} dias
                    </div>
                  </div>

                  {req.description && (
                    <p className="mb-4 text-xs text-gray-400 line-clamp-2">{req.description}</p>
                  )}

                  <div className="flex gap-2">
                    <ButtonLink href={`/pedidos/${req.id}`} className="flex-1" size="sm" variant="outline">
                      Ver detalhes
                    </ButtonLink>
                    <ButtonLink href={`/pedidos/${req.id}#proposta`} className="flex-1" size="sm">
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
