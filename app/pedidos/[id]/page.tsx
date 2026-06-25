"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { UrgencyInline } from "@/components/urgency-bar"
import { StarRating, VerifiedBadge } from "@/components/trust-badges"
import { ButtonLink } from "@/components/ui/button-link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { PropostaForm, PropostaLoginPrompt } from "@/components/proposta-form"
import { AcceptProposalDialog } from "@/components/accept-proposal-dialog"
import { WhatsAppHandoff } from "@/components/whatsapp-handoff"
import {
  Award, CheckCircle, Clock, Info, Loader2,
  MapPin, MessageCircle, Package, TrendingDown, XCircle,
} from "lucide-react"
import { createClient } from "@/lib/supabase-client"
import { layout, type } from "@/lib/typography"

// Status labels
const statusLabel: Record<string, { label: string; color: string }> = {
  open:       { label: "Aberto",    color: "text-green-700 border-green-300" },
  closed:     { label: "Fechado",   color: "text-gray-600 border-gray-300" },
  reviewing:  { label: "Em análise", color: "text-yellow-700 border-yellow-300" },
  cancelled:  { label: "Cancelado", color: "text-red-600 border-red-300" },
}

const proposalStatusLabel: Record<string, { label: string; color: string }> = {
  pending:  { label: "Aguardando",    color: "bg-gray-100 text-gray-600" },
  accepted: { label: "✓ Aceita",      color: "bg-green-100 text-green-700" },
  rejected: { label: "Não selecionada", color: "bg-red-50 text-red-500" },
}

export default function PedidoPage() {
  const { id } = useParams<{ id: string }>()
  const [req, setReq] = useState<any>(null)
  const [proposals, setProposals] = useState<any[]>([])
  const [estimates, setEstimates] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState<string | null>(null)
  const [acceptError, setAcceptError] = useState("")
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false)
  const [pendingProposalId, setPendingProposalId] = useState<string | null>(null)
  const [buyerWhatsapp, setBuyerWhatsapp] = useState("")
  const [handoff, setHandoff] = useState<{
    supplierName: string
    supplierWhatsApp: string
    serviceType: string
    priceTotal: number
    deliveryDays: number
  } | null>(null)

  async function loadData() {
    const supabase = createClient()
    const [reqRes, propRes, { data: { user } }] = await Promise.all([
      supabase.from("service_requests").select("*").eq("id", id).single(),
      supabase
        .from("proposals")
        .select("*, supplier_profiles(company_name, rating_avg, total_reviews, is_premium, whatsapp)")
        .eq("request_id", id)
        .order("price_total"),
      supabase.auth.getUser(),
    ])

    setReq(reqRes.data)
    setUser(user)

    if (user) {
      const { data: prof } = await supabase.from("profiles").select("role, phone").eq("id", user.id).single()
      setProfile(prof)
      if (prof?.phone) setBuyerWhatsapp(prof.phone)
    }

    if (reqRes.data) {
      const keyword = reqRes.data.service_type?.split(" ")[0] ?? ""
      const { data: svcs } = await supabase
        .from("standard_services").select("*")
        .eq("is_active", true).ilike("name", `%${keyword}%`)
      const w = reqRes.data.width_m ?? 1
      const h = reqRes.data.height_m ?? 1
      const qty = reqRes.data.quantity ?? 1
      setEstimates((svcs ?? []).map((s: any) => {
        let price = 0
        if (s.formula_type === "area") price = w * h * qty * s.base_price
        if (s.formula_type === "area_min1m2") price = Math.max(w * h, 1) * qty * s.base_price
        if (s.formula_type === "unit") price = qty * s.base_price
        return { ...s, estimated_price: Math.round(price * 100) / 100 }
      }))
    }

    setProposals(propRes.data ?? [])
    setLoading(false)
  }

  useEffect(() => { loadData() }, [id])

  function openAcceptDialog(proposalId: string) {
    if (!user) {
      window.location.href = `/login?redirect=${encodeURIComponent(`/pedidos/${id}`)}`
      return
    }
    setPendingProposalId(proposalId)
    setAcceptError("")
    setAcceptDialogOpen(true)
  }

  async function confirmAccept() {
    if (!pendingProposalId) return
    setAccepting(pendingProposalId)
    setAcceptError("")

    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        setAcceptError("Sessão expirada. Faça login novamente.")
        setAccepting(null)
        return
      }

      const res = await fetch("/api/accept-proposal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          proposalId: pendingProposalId,
          requestId: id,
          buyerWhatsapp,
          consentShareContact: true,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        setAcceptError(data.error ?? "Erro ao aceitar proposta.")
      } else {
        setAcceptDialogOpen(false)
        if (data.supplier?.whatsapp) {
          setHandoff({
            supplierName: data.supplier.companyName,
            supplierWhatsApp: data.supplier.whatsapp,
            serviceType: data.serviceType,
            priceTotal: data.priceTotal,
            deliveryDays: data.deliveryDays,
          })
        }
        await loadData()
      }
    } catch {
      setAcceptError("Erro de conexão. Tente novamente.")
    } finally {
      setAccepting(null)
    }
  }

  async function handleAccept(proposalId: string) {
    openAcceptDialog(proposalId)
  }

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

  const pendingProposals = proposals.filter((p) => p.status !== "rejected")
  const acceptedProposal = proposals.find((p) => p.status === "accepted")
  const minPrice = pendingProposals.length > 0 ? Math.min(...pendingProposals.map((p) => p.price_total)) : null
  const minDays  = pendingProposals.length > 0 ? Math.min(...pendingProposals.map((p) => p.delivery_days)) : null
  const isClosed = req.status === "closed"
  const isSupplier = profile?.role === "supplier"
  const isBuyer = profile?.role === "buyer"
  const isBuyerOwner = isBuyer && user && req.buyer_id === user.id
  const reqStatus = statusLabel[req.status] ?? statusLabel.open

  return (
    <div className={`${layout.container} py-10`}>
      <div className="mb-8">
        <ButtonLink href="/pedidos" variant="ghost">← Voltar para pedidos</ButtonLink>
      </div>

      {/* Detalhes do pedido */}
      <Card className="mb-8">
        <CardContent>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 flex-wrap">
                <Badge variant="secondary">{req.category}</Badge>
                <Badge variant="outline" className={reqStatus.color}>{reqStatus.label}</Badge>
                {isClosed && acceptedProposal && (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    <CheckCircle className="mr-1 h-3 w-3" /> Proposta aceita
                  </Badge>
                )}
              </div>
              <h1 className={type.h2}>{req.service_type}</h1>
              {req.buyer_name && <p className={`mt-2 ${type.body} text-gray-500`}>{req.buyer_name}</p>}
            </div>
            <div className={`${type.body} text-gray-500`}>
              {isClosed
                ? "Pedido encerrado"
                : `Expira em ${new Date(req.expires_at).toLocaleDateString("pt-BR")}`}
            </div>
          </div>

          <div className={`grid grid-cols-2 gap-4 ${type.body} sm:grid-cols-4`}>
            <div className="flex items-center gap-2 text-gray-600">
              <Package className="h-5 w-5 text-gray-400" />
              <div><p className={type.caption}>Medidas</p><p className="font-medium">{req.width_m}m × {req.height_m}m</p></div>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <div><p className={type.caption}>Quantidade</p><p className="font-medium">{req.quantity} unidades</p></div>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="h-5 w-5 text-gray-400" />
              <div><p className={type.caption}>Local</p><p className="font-medium">{req.city}/{req.state}</p></div>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="h-5 w-5 text-gray-400" />
              <div><p className={type.caption}>Prazo desejado</p><p className="font-medium">{req.deadline_days} dias</p></div>
            </div>
          </div>

          {req.description && (
            <p className={`mt-6 ${type.body} text-gray-600 bg-gray-50 rounded-xl p-4`}>{req.description}</p>
          )}
        </CardContent>
      </Card>

      {/* Banner de pedido fechado */}
      {isClosed && acceptedProposal && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-green-600 shrink-0" />
            <div>
              <p className={`${type.cardTitle} text-green-800`}>Proposta escolhida!</p>
              <p className={`${type.body} text-green-700`}>
                <strong>{acceptedProposal.supplier_profiles?.company_name}</strong> —{" "}
                <strong>R$ {acceptedProposal.price_total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong> em{" "}
                <strong>{acceptedProposal.delivery_days} dias</strong>.
                {" "}Feche os detalhes diretamente com a gráfica.
              </p>
            </div>
          </div>
        </div>
      )}

      {(handoff?.supplierWhatsApp || acceptedProposal?.supplier_profiles?.whatsapp) && (
        <WhatsAppHandoff
          supplierName={handoff?.supplierName ?? acceptedProposal?.supplier_profiles?.company_name ?? "Fornecedor"}
          supplierWhatsApp={handoff?.supplierWhatsApp ?? acceptedProposal?.supplier_profiles?.whatsapp ?? ""}
          serviceType={handoff?.serviceType ?? req.service_type}
          priceTotal={handoff?.priceTotal ?? acceptedProposal?.price_total ?? 0}
          deliveryDays={handoff?.deliveryDays ?? acceptedProposal?.delivery_days ?? 0}
          buyerWhatsApp={buyerWhatsapp}
        />
      )}

      {/* Erro de aceite */}
      {acceptError && (
        <div className={`mb-6 rounded-xl border border-red-200 bg-red-50 p-4 ${type.body} text-red-700`}>
          <XCircle className="mr-2 inline h-4 w-4" />{acceptError}
        </div>
      )}

      {/* Resumo comparativo */}
      {pendingProposals.length > 0 && !isClosed && (
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-green-50 p-4 text-center">
            <TrendingDown className="mx-auto mb-2 h-6 w-6 text-green-600" />
            <p className={type.caption}>Menor preço</p>
            <p className={`${type.cardTitle} text-green-700`}>R$ {minPrice?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="rounded-xl border bg-blue-50 p-4 text-center">
            <Clock className="mx-auto mb-2 h-6 w-6 text-blue-600" />
            <p className={type.caption}>Menor prazo</p>
            <p className={`${type.cardTitle} text-blue-700`}>{minDays} dias</p>
          </div>
          <div className="rounded-xl border bg-purple-50 p-4 text-center col-span-2 sm:col-span-1">
            <Award className="mx-auto mb-2 h-6 w-6 text-purple-600" />
            <p className={type.caption}>Propostas recebidas</p>
            <p className={`${type.cardTitle} text-purple-700`}>{proposals.length}</p>
          </div>
        </div>
      )}

      {/* Propostas — tabela comparativa */}
      {proposals.length > 0 && (
        <div className="mb-6">
          <h2 className={`mb-5 ${type.h3}`}>
            {isClosed ? "Propostas recebidas" : "Compare as propostas"}
          </h2>

          {/* Tabela desktop */}
          <div className="hidden sm:block overflow-x-auto rounded-xl border">
            <table className={`w-full ${type.body}`}>
              <thead className={`bg-gray-50 ${type.caption} uppercase`}>
                <tr>
                  <th className="px-4 py-3 text-left">Fornecedor</th>
                  <th className="px-4 py-3 text-right">Preço total</th>
                  <th className="px-4 py-3 text-right">Prazo</th>
                  <th className="px-4 py-3 text-left">Pagamento</th>
                  <th className="px-4 py-3 text-left">Obs.</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  {isBuyerOwner && !isClosed && <th className="px-4 py-3 text-center">Ação</th>}
                </tr>
              </thead>
              <tbody className="divide-y">
                {proposals.map((p) => {
                  const isMinPrice = p.price_total === minPrice && p.status !== "rejected"
                  const isMinDays  = p.delivery_days === minDays && p.status !== "rejected"
                  const isAccepted = p.status === "accepted"
                  const isRejected = p.status === "rejected"
                  const pStatus = proposalStatusLabel[p.status] ?? proposalStatusLabel.pending

                  return (
                    <tr key={p.id} className={`${isAccepted ? "bg-green-50" : isRejected ? "opacity-50 bg-gray-50" : "hover:bg-gray-50"} transition-colors`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium">{p.supplier_profiles?.company_name}</span>
                              {p.supplier_profiles?.is_premium && <VerifiedBadge />}
                            </div>
                            <StarRating
                              rating={p.supplier_profiles?.rating_avg ?? 0}
                              reviews={p.supplier_profiles?.total_reviews ?? 0}
                              size="sm"
                              showCount={false}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div>
                          <span className={`${type.cardTitle} ${isAccepted ? "text-green-700" : ""}`}>
                            R$ {p.price_total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </span>
                          {isMinPrice && !isRejected && (
                            <span className={`ml-1 rounded-full bg-green-100 px-2 py-0.5 ${type.caption} text-green-700`}>menor</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div>
                          <span className="font-medium">{p.delivery_days}d</span>
                          {isMinDays && !isRejected && (
                            <span className={`ml-1 rounded-full bg-blue-100 px-2 py-0.5 ${type.caption} text-blue-700`}>menor</span>
                          )}
                        </div>
                      </td>
                      <td className={`px-4 py-3 text-gray-500 ${type.caption}`}>{p.payment_terms || "—"}</td>
                      <td className={`px-4 py-3 text-gray-500 ${type.caption} max-w-[180px] truncate`} title={p.notes}>{p.notes || "—"}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`rounded-full px-3 py-1 ${type.caption} font-medium ${pStatus.color}`}>
                          {pStatus.label}
                        </span>
                      </td>
                      {isBuyerOwner && !isClosed && (
                        <td className="px-4 py-3 text-center">
                          <Button
                            size="sm"
                            disabled={accepting === p.id}
                            onClick={() => openAcceptDialog(p.id)}
                            className="min-w-[90px]"
                          >
                            {accepting === p.id
                              ? <Loader2 className="h-3 w-3 animate-spin" />
                              : <><CheckCircle className="mr-1 h-3 w-3" /> Aceitar</>
                            }
                          </Button>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Cards mobile */}
          <div className="grid gap-3 sm:hidden">
            {proposals.map((p) => {
              const isMinPrice = p.price_total === minPrice && p.status !== "rejected"
              const isMinDays  = p.delivery_days === minDays && p.status !== "rejected"
              const isAccepted = p.status === "accepted"
              const isRejected = p.status === "rejected"
              const pStatus = proposalStatusLabel[p.status] ?? proposalStatusLabel.pending

              return (
                <Card key={p.id} className={`${isAccepted ? "border-green-300 bg-green-50" : isRejected ? "opacity-50" : ""}`}>
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className={type.cardTitle}>{p.supplier_profiles?.company_name}</p>
                          {p.supplier_profiles?.is_premium && <VerifiedBadge />}
                        </div>
                        <StarRating rating={p.supplier_profiles?.rating_avg ?? 0} reviews={p.supplier_profiles?.total_reviews ?? 0} size="sm" />
                      </div>
                      <span className={`rounded-full px-3 py-1 ${type.caption} font-medium ${pStatus.color}`}>{pStatus.label}</span>
                    </div>

                    <div className={`grid grid-cols-2 gap-3 ${type.body} mb-4`}>
                      <div>
                        <p className={type.caption}>Preço total</p>
                        <p className={type.cardTitle}>R$ {p.price_total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                        {isMinPrice && <span className={`${type.caption} text-green-600`}>✓ Menor preço</span>}
                      </div>
                      <div>
                        <p className={type.caption}>Prazo</p>
                        <p className={type.cardTitle}>{p.delivery_days} dias</p>
                        {isMinDays && <span className={`${type.caption} text-blue-600`}>✓ Menor prazo</span>}
                      </div>
                    </div>

                    {p.notes && <p className={`mb-4 ${type.cardDesc} bg-gray-100 rounded-lg p-3`}>{p.notes}</p>}

                    {isBuyerOwner && !isClosed && (
                      <Button
                        size="sm"
                        className="w-full"
                        disabled={accepting === p.id}
                        onClick={() => handleAccept(p.id)}
                      >
                        {accepting === p.id
                          ? <><Loader2 className="mr-2 h-3 w-3 animate-spin" /> Processando...</>
                          : <><CheckCircle className="mr-2 h-3 w-3" /> Aceitar esta proposta</>
                        }
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Estimativas modo prateleira — só mostra quando não há propostas */}
      {proposals.length === 0 && estimates.length > 0 && !isClosed && (
        <div className="mb-8">
          <div className={`mb-5 rounded-xl border border-yellow-200 bg-yellow-50 p-4 ${type.body} text-yellow-800`}>
            <Info className="mr-2 inline-block h-4 w-4" />
            Nenhuma proposta ainda. Veja os preços de referência do mercado enquanto aguarda.
          </div>
          <h2 className={`mb-4 ${type.cardTitle} text-gray-500`}>Preços de referência</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {estimates.map((s) => (
              <Card key={s.id} className="border-dashed border-gray-300 bg-gray-50/50">
                <CardContent className="p-4">
                  <Badge variant="outline" className="mb-3">
                    <Info className="mr-1 h-3 w-3" /> Preço estimado
                  </Badge>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={type.nav}>{s.name}</p>
                      <p className={type.caption}>Referência de mercado · ~{s.avg_days} dias</p>
                    </div>
                    <p className={`${type.cardTitle} text-gray-600`}>
                      R$ {s.estimated_price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Formulário de proposta — só quando pedido está aberto */}
      {!isClosed && (
        <div className="mt-6 space-y-3">
          <UrgencyInline />
          {isSupplier
            ? <PropostaForm requestId={id} />
            : <PropostaLoginPrompt />
          }
        </div>
      )}

      {/* Quando fechado e o usuário é fornecedor com proposta */}
      {isClosed && isSupplier && (
        <div className={`mt-8 rounded-xl border bg-gray-50 p-6 text-center text-gray-500 ${type.body}`}>
          <p>Este pedido está fechado. O comprador já selecionou uma proposta.</p>
        </div>
      )}

      <AcceptProposalDialog
        open={acceptDialogOpen}
        onOpenChange={setAcceptDialogOpen}
        supplierName={
          proposals.find((p) => p.id === pendingProposalId)?.supplier_profiles?.company_name ?? "Fornecedor"
        }
        buyerWhatsApp={buyerWhatsapp}
        onBuyerWhatsAppChange={setBuyerWhatsapp}
        onConfirm={confirmAccept}
        loading={!!accepting}
      />
    </div>
  )
}
