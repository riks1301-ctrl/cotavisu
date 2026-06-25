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
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: prof } = await supabase.from("profiles").select("state").eq("id", user.id).single()
        setUserState(prof?.state ?? null)
      }
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
    if (activeCategory) result = result.filter((r) => r.category === activeCategory)
    if (userState) {
      result.sort((a, b) => (a.state === userState ? 0 : 1) - (b.state === userState ? 0 : 1))
    }
    setFiltered(result)
  }, [search, activeCategory, requests, userState])

  return (
    <div className={`${layout.container} py-14`}>
      <div className="mb-14 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <PageHeader
          className="mb-0"
          title="Pedidos abertos"
          subtitle={`${filtered.length} pedido${filtered.length !== 1 ? "s" : ""} aguardando proposta${userState ? " · Sua região aparece primeiro" : ""}`}
        />
        <ButtonLink href="/pedidos/novo" size="lg" className="shrink-0 shadow-md">
          <Plus className="mr-2 h-5 w-5" /> Criar pedido
        </ButtonLink>
      </div>

      <div className="mb-14 space-y-6">
        <div className="relative">
          <Search className="absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-gray-500" />
          <Input className="pl-14" placeholder="Buscar por serviço, categoria ou cidade..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-3">
          {["Todos", ...categories].map((cat) => {
            const isAll = cat === "Todos"
            const active = isAll ? !activeCategory : activeCategory === cat
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(isAll ? null : (activeCategory === cat ? null : cat))}
                className={`rounded-full border-2 px-6 py-3 ${type.nav} font-semibold transition-all ${
                  active ? "border-blue-600 bg-blue-50 text-blue-900" : "border-gray-300 text-gray-800 hover:border-gray-400"
                }`}
              >
                {cat}
              </button>
            )
          })}
        </div>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-28 text-center">
          <Package className="mx-auto mb-6 h-16 w-16 text-gray-300" />
          <p className={`mb-3 ${type.h3}`}>Nenhum pedido encontrado</p>
          <p className={`${type.body} mb-10 text-gray-600`}>Tente outro filtro ou crie o primeiro pedido.</p>
          <ButtonLink href="/pedidos/novo" size="lg">Criar pedido</ButtonLink>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-10 xl:grid-cols-2">
          {filtered.map((req) => {
            const isSameState = userState && req.state === userState
            const expiresIn = Math.ceil((new Date(req.expires_at).getTime() - Date.now()) / 86400000)
            const isUrgent = expiresIn <= 2
            return (
              <Card key={req.id} className={isSameState ? "ring-2 ring-blue-200" : ""}>
                <CardContent className="flex flex-col gap-7">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-wrap gap-3">
                      <Badge variant="secondary">{req.category}</Badge>
                      {isSameState && (
                        <Badge className="bg-blue-100 text-blue-900 hover:bg-blue-100">
                          <Star className="mr-1.5 h-4 w-4" /> Sua região
                        </Badge>
                      )}
                    </div>
                    <span className={`shrink-0 ${type.label} font-bold ${isUrgent ? "text-red-600" : "text-gray-700"}`}>
                      {isUrgent ? `⚠ ${expiresIn}d restante${expiresIn !== 1 ? "s" : ""}` : `${expiresIn}d`}
                    </span>
                  </div>
                  <div>
                    <h3 className={`${type.cardTitle} text-gray-950`}>{req.service_type}</h3>
                    {req.material && <p className={`mt-3 ${type.body} font-medium text-gray-800`}>{req.material}</p>}
                  </div>
                  <ul className={`space-y-4 ${type.bodyLg} font-medium text-gray-900`}>
                    {req.width_m && req.height_m && (
                      <li className="flex items-center gap-3">
                        <Package className="h-7 w-7 shrink-0 text-gray-600" />
                        {(req.width_m * 100).toFixed(0)}×{(req.height_m * 100).toFixed(0)} cm · {req.quantity} un
                      </li>
                    )}
                    <li className="flex items-center gap-3">
                      <MapPin className="h-7 w-7 shrink-0 text-gray-600" />
                      {req.city}/{req.state}
                    </li>
                    <li className="flex items-center gap-3">
                      <Clock className="h-7 w-7 shrink-0 text-gray-600" />
                      Prazo desejado: {req.deadline_days} dias
                    </li>
                  </ul>
                  {req.description && (
                    <p className={`border-t border-gray-200 pt-6 ${type.bodyLg} leading-relaxed text-gray-900`}>
                      {req.description}
                    </p>
                  )}
                  <div className="mt-auto grid grid-cols-2 gap-4">
                    <ButtonLink href={`/pedidos/${req.id}`} size="lg" variant="outline" className="w-full">Ver detalhes</ButtonLink>
                    <ButtonLink href={`/pedidos/${req.id}#proposta`} size="lg" className="w-full">Enviar proposta</ButtonLink>
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
