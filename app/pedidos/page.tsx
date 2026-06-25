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

    if (activeCategory) {
      result = result.filter((r) => r.category === activeCategory)
    }

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
    <div className={`${layout.container} py-12`}>
      <div className="mb-12 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <PageHeader
          className="mb-0"
          title="Pedidos abertos"
          subtitle={`${filtered.length} pedido${filtered.length !== 1 ? "s" : ""} aguardando proposta${userState ? " · Sua região aparece primeiro" : ""}`}
        />
        <ButtonLink href="/pedidos/novo" size="lg" className="shrink-0">
          <Plus className="mr-2 h-6 w-6" /> Criar pedido
        </ButtonLink>
      </div>

      <div className="mb-12 space-y-6">
        <div className="relative">
          <Search className="absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-gray-500" />
          <Input
            className="pl-14 text-[20px] placeholder:text-[20px]"
            placeholder="Buscar por serviço, categoria ou cidade..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setActiveCategory(null)}
            className={`rounded-full border-2 px-6 py-3 text-[18px] font-semibold transition-all lg:text-[20px] ${
              !activeCategory ? "border-blue-600 bg-blue-50 text-blue-900" : "border-gray-300 text-gray-900 hover:border-gray-400"
            }`}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              className={`rounded-full border-2 px-6 py-3 text-[18px] font-semibold transition-all lg:text-[20px] ${
                activeCategory === cat ? "border-blue-600 bg-blue-50 text-blue-900" : "border-gray-300 text-gray-900 hover:border-gray-400"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-24 text-center">
          <Package className="mx-auto mb-4 h-16 w-16 text-gray-300" />
          <p className={`mb-3 ${type.h3}`}>Nenhum pedido encontrado</p>
          <p className={`${type.body} mb-8 text-gray-700`}>Tente outro filtro ou crie o primeiro pedido.</p>
          <ButtonLink href="/pedidos/novo" size="lg">Criar pedido</ButtonLink>
        </div>
      ) : (
        /* Sempre 2 colunas no desktop — cards largos, texto legível */
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          {filtered.map((req) => {
            const isSameState = userState && req.state === userState
            const expiresIn = Math.ceil((new Date(req.expires_at).getTime() - Date.now()) / 86400000)
            const isUrgent = expiresIn <= 2

            return (
              <Card
                key={req.id}
                className={`hover:shadow-xl transition-all ${isSameState ? "border-2 border-blue-300" : ""}`}
              >
                <CardContent className="flex flex-col gap-7">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant="secondary" className="text-[17px] lg:text-[18px] text-gray-900">
                        {req.category}
                      </Badge>
                      {isSameState && (
                        <Badge className="bg-blue-100 text-[17px] text-blue-900 hover:bg-blue-100 lg:text-[18px]">
                          <Star className="mr-1.5 h-5 w-5" /> Sua região
                        </Badge>
                      )}
                    </div>
                    <span className={`shrink-0 text-[18px] font-bold lg:text-[20px] ${isUrgent ? "text-red-600" : "text-gray-800"}`}>
                      {isUrgent ? `⚠ ${expiresIn}d restante${expiresIn !== 1 ? "s" : ""}` : `${expiresIn}d`}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-[26px] font-bold leading-tight text-gray-950 lg:text-[32px]">
                      {req.service_type}
                    </h3>
                    {req.material && (
                      <p className="mt-3 text-[20px] font-semibold leading-snug text-gray-800 lg:text-[22px]">
                        {req.material}
                      </p>
                    )}
                  </div>

                  <ul className="space-y-4 text-[20px] text-gray-900 lg:text-[22px]">
                    {req.width_m && req.height_m && (
                      <li className="flex items-center gap-3">
                        <Package className="h-6 w-6 shrink-0 text-gray-500" />
                        {(req.width_m * 100).toFixed(0)}×{(req.height_m * 100).toFixed(0)} cm · {req.quantity} un
                      </li>
                    )}
                    <li className="flex items-center gap-3">
                      <MapPin className="h-6 w-6 shrink-0 text-gray-500" />
                      {req.city}/{req.state}
                    </li>
                    <li className="flex items-center gap-3">
                      <Clock className="h-6 w-6 shrink-0 text-gray-500" />
                      Prazo desejado: {req.deadline_days} dias
                    </li>
                  </ul>

                  {req.description && (
                    <p className="border-t border-gray-200 pt-6 text-[20px] leading-relaxed text-gray-900 lg:text-[22px]">
                      {req.description}
                    </p>
                  )}

                  <div className="mt-auto grid grid-cols-2 gap-4 pt-2">
                    <ButtonLink href={`/pedidos/${req.id}`} size="lg" variant="outline" className="w-full">
                      Ver detalhes
                    </ButtonLink>
                    <ButtonLink href={`/pedidos/${req.id}#proposta`} size="lg" className="w-full">
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
