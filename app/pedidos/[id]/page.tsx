"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { UrgencyInline } from "@/components/urgency-bar"
import { ButtonLink } from "@/components/ui/button-link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { PropostaForm, PropostaLoginPrompt } from "@/components/proposta-form"
import { Award, CheckCircle, Clock, Info, MapPin, MessageCircle, Package, Star, TrendingDown } from "lucide-react"
import { createClient } from "@/lib/supabase-client"

function tagLabel(tag: string) {
  if (tag === "menor_preco") return { label: "Menor preço", color: "bg-green-100 text-green-800", icon: <TrendingDown className="h-3 w-3" /> }
  if (tag === "menor_prazo") return { label: "Menor prazo", color: "bg-blue-100 text-blue-800", icon: <Clock className="h-3 w-3" /> }
  return null
}

export default function PedidoPage() {
  const { id } = useParams<{ id: string }>()
  const [req, setReq] = useState<any>(null)
  const [proposals, setProposals] = useState<any[]>([])
  const [estimates, setEstimates] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()

      const [reqRes, propRes, { data: { user } }] = await Promise.all([
        supabase.from("service_requests").select("*").eq("id", id).single(),
        supabase.from("proposals").select("*, supplier_profiles(company_name, rating_avg, total_reviews)").eq("request_id", id).order("price_total"),
        supabase.auth.getUser(),
      ])

      setReq(reqRes.data)
      setUser(user)

      if (user) {
        const { data: prof } = await supabase.from("profiles").select("role").eq("id", user.id).single()
        setProfile(prof)
      }

      // Estimativas modo prateleira
      if (reqRes.data) {
        const keyword = reqRes.data.service_type?.split(" ")[0] ?? ""
        const { data: svcs } = await supabase
          .from("standard_services")
          .select("*")
          .eq("is_active", true)
          .ilike("name", `%${keyword}%`)

        const w = reqRes.data.width_m ?? 1
        const h = reqRes.data.height_m ?? 1
        const qty = reqRes.data.quantity ?? 1
        const est = (svcs ?? []).map((s: any) => {
          let price = 0
          if (s.formula_type === "area") price = w * h * qty * s.base_price
          if (s.formula_type === "area_min1m2") price = Math.max(w * h, 1) * qty * s.base_price
          if (s.formula_type === "unit") price = qty * s.base_price
          return { ...s, estimated_price: Math.round(price * 100) / 100 }
        })
        setEstimates(est)
      }

      setProposals(propRes.data ?? [])
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
    </div>
  )

  if (!req) return (
    <div className="py-20 text-center text-gray-400">
      <p>Pedido não encontrado.</p>
      <ButtonLink href="/pedidos" className="mt-4">Ver pedidos</ButtonLink>
    </div>
  )

  const minPrice = proposals.length > 0 ? Math.min(...proposals.map((p) => p.price_total)) : null
  const minDays = proposals.length > 0 ? Math.min(...proposals.map((p) => p.delivery_days)) : null
  const hasReal = proposals.length > 0
  const isSupplier = profile?.role === "supplier"
  const isBuyer = profile?.role === "buyer"

  const proposalsWithTags = proposals.map((p) => ({
    ...p,
    tags: [
      ...(p.price_total === minPrice ? ["menor_preco"] : []),
      ...(p.delivery_days === minDays ? ["menor_prazo"] : []),
    ],
  }))

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <ButtonLink href="/pedidos" variant="ghost" size="sm">← Voltar para pedidos</ButtonLink>
      </div>

      {/* Detalhes */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 flex-wrap">
                <Badge variant="secondary">{req.category}</Badge>
                <Badge variant="outline" className="text-green-700 border-green-300">Aberto</Badge>
              </div>
              <h1 className="text-xl font-bold">{req.service_type}</h1>
              {req.buyer_name && <p className="text-sm text-gray-500">{req.buyer_name}</p>}
            </div>
            <div className="text-sm text-gray-500">
              Expira em {new Date(req.expires_at).toLocaleDateString("pt-BR")}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Package className="h-4 w-4 text-gray-400" />
              <div><p className="text-xs text-gray-400">Medidas</p><p className="font-medium">{req.width_m}m × {req.height_m}m</p></div>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <div><p className="text-xs text-gray-400">Quantidade</p><p className="font-medium">{req.quantity} unidades</p></div>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="h-4 w-4 text-gray-400" />
              <div><p className="text-xs text-gray-400">Local</p><p className="font-medium">{req.city}/{req.state}</p></div>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="h-4 w-4 text-gray-400" />
              <div><p className="text-xs text-gray-400">Prazo desejado</p><p className="font-medium">{req.deadline_days} dias</p></div>
            </div>
          </div>

          {req.description && (
            <p className="mt-4 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{req.description}</p>
          )}
        </CardContent>
      </Card>

      {/* Resumo */}
      {hasReal && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border bg-green-50 p-3 text-center">
            <TrendingDown className="mx-auto mb-1 h-5 w-5 text-green-600" />
            <p className="text-xs text-gray-500">Menor preço</p>
            <p className="text-lg font-bold text-green-700">R$ {minPrice?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="rounded-lg border bg-blue-50 p-3 text-center">
            <Clock className="mx-auto mb-1 h-5 w-5 text-blue-600" />
            <p className="text-xs text-gray-500">Menor prazo</p>
            <p className="text-lg font-bold text-blue-700">{minDays} dias</p>
          </div>
          <div className="rounded-lg border bg-purple-50 p-3 text-center col-span-2 sm:col-span-1">
            <Award className="mx-auto mb-1 h-5 w-5 text-purple-600" />
            <p className="text-xs text-gray-500">Propostas recebidas</p>
            <p className="text-lg font-bold text-purple-700">{proposals.length}</p>
          </div>
        </div>
      )}

      {/* Propostas reais */}
      {hasReal && (
        <div className="mb-6">
          <h2 className="mb-3 text-lg font-semibold">Propostas recebidas</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {proposalsWithTags.map((p, i) => (
              <Card key={p.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="mb-3 flex items-start justify-between flex-wrap gap-2">
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">
                      <CheckCircle className="mr-1 h-3 w-3" /> Proposta verificada
                    </Badge>
                    <div className="flex gap-1 flex-wrap">
                      {p.tags.map((tag: string) => {
                        const t = tagLabel(tag)
                        return t ? (
                          <span key={tag} className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${t.color}`}>
                            {t.icon} {t.label}
                          </span>
                        ) : null
                      })}
                    </div>
                  </div>

                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{p.supplier_profiles?.company_name}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        {(p.supplier_profiles?.total_reviews ?? 0) > 0 ? (
                          <><Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{p.supplier_profiles?.rating_avg} ({p.supplier_profiles?.total_reviews} avaliações)</span></>
                        ) : (
                          <Badge variant="outline" className="text-xs">Novo fornecedor</Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">R$ {p.price_total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                      <p className="text-xs text-gray-500">total</p>
                    </div>
                  </div>

                  <div className="mb-3 grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div className="flex items-center gap-1"><Clock className="h-3 w-3" /> {p.delivery_days} dias</div>
                    {p.payment_terms && <div className="text-gray-400">{p.payment_terms}</div>}
                  </div>

                  {p.notes && <p className="mb-4 text-xs text-gray-500 bg-gray-100 rounded p-2">{p.notes}</p>}

                  {isBuyer && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <MessageCircle className="mr-1 h-3 w-3" /> Contato
                      </Button>
                      <Button size="sm" className="flex-1">
                        <CheckCircle className="mr-1 h-3 w-3" /> Aceitar
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Estimativas modo prateleira */}
      {estimates.length > 0 && (
        <div className="mb-8">
          {!hasReal && (
            <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
              <Info className="mr-2 inline-block h-4 w-4" />
              Nenhuma proposta recebida ainda. Veja os preços de referência do mercado.
            </div>
          )}
          <h2 className="mb-3 text-base font-medium text-gray-500">
            {hasReal ? "Referência de mercado" : "Preços de referência"}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {estimates.map((s) => (
              <Card key={s.id} className="border-dashed border-gray-300 bg-gray-50/50">
                <CardContent className="p-5">
                  <Badge variant="outline" className="mb-3 text-xs text-gray-500 border-gray-300">
                    <Info className="mr-1 h-3 w-3" /> Preço estimado
                  </Badge>
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{s.name}</p>
                      <p className="text-xs text-gray-400">Referência de mercado</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-700">
                        R$ {s.estimated_price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-gray-400">estimado</p>
                    </div>
                  </div>
                  <p className="mb-3 text-xs text-gray-500"><Clock className="mr-1 inline h-3 w-3" />~{s.avg_days} dias</p>
                  <div className="flex gap-2">
                    <ButtonLink href="/fornecedores" size="sm" variant="outline" className="flex-1 text-xs">Buscar fornecedor</ButtonLink>
                    <Button size="sm" variant="ghost" className="flex-1 text-xs text-gray-400" disabled>Aguardar propostas</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Urgência + Formulário */}
      <div className="mt-6 space-y-3">
        <UrgencyInline />
        {isSupplier ? (
          <PropostaForm requestId={id} />
        ) : (
          <PropostaLoginPrompt />
        )}
      </div>
    </div>
  )
}
