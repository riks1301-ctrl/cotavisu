"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ButtonLink } from "@/components/ui/button-link"
import { Clock, MapPin, Package, Plus } from "lucide-react"
import { createClient } from "@/lib/supabase-client"
import { PageHeader } from "@/components/layout/page-header"
import { layout, type } from "@/lib/typography"

const statusLabel: Record<string, { label: string; color: string }> = {
  open: { label: "Aberto", color: "bg-green-100 text-green-700" },
  reviewing: { label: "Em análise", color: "bg-yellow-100 text-yellow-700" },
  closed: { label: "Encerrado", color: "bg-gray-100 text-gray-600" },
  cancelled: { label: "Cancelado", color: "bg-red-100 text-red-600" },
}

export default function MeusPedidosPage() {
  const router = useRouter()
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }

      const { data } = await supabase
        .from("service_requests")
        .select("*")
        .eq("buyer_id", user.id)
        .order("created_at", { ascending: false })

      setRequests(data ?? [])
      setLoading(false)
    }
    load()
  }, [router])

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
    </div>
  )

  return (
    <div className={`${layout.containerNarrow} py-10`}>
      <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          className="mb-0"
          title="Meus pedidos"
          subtitle="Acompanhe seus pedidos e propostas recebidas"
        />
        <ButtonLink href="/pedidos/novo" className="shrink-0">
          <Plus className="mr-2 h-5 w-5" /> Novo pedido
        </ButtonLink>
      </div>

      {requests.length === 0 ? (
        <div className="py-24 text-center text-gray-400">
          <Package className="mx-auto mb-4 h-14 w-14 opacity-30" />
          <p className={`mb-2 ${type.cardTitle}`}>Nenhum pedido criado ainda</p>
          <p className={`mb-8 ${type.body}`}>Crie seu primeiro pedido e receba propostas de fornecedores.</p>
          <ButtonLink href="/pedidos/novo">Criar pedido</ButtonLink>
        </div>
      ) : (
        <div className="space-y-5">
          {requests.map((req) => {
            const st = statusLabel[req.status] ?? statusLabel.open
            return (
              <Card key={req.id} className="hover:shadow-lg transition-shadow">
                <CardContent>
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary">{req.category}</Badge>
                      <span className={`rounded-full px-3 py-1 ${type.caption} font-medium ${st.color}`}>{st.label}</span>
                    </div>
                    <span className={type.caption}>
                      {new Date(req.created_at).toLocaleDateString("pt-BR")}
                    </span>
                  </div>

                  <h3 className={`mb-2 ${type.cardTitle}`}>{req.service_type}</h3>

                  <div className={`mb-5 grid grid-cols-2 gap-3 ${type.caption} sm:grid-cols-4`}>
                    <div className="flex items-center gap-1.5">
                      <Package className="h-4 w-4" /> {req.width_m}m × {req.height_m}m · {req.quantity}un
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" /> {req.city}/{req.state}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" /> Prazo: {req.deadline_days} dias
                    </div>
                    <div>
                      Expira: {new Date(req.expires_at).toLocaleDateString("pt-BR")}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <ButtonLink href={`/pedidos/${req.id}`} size="sm" className="flex-1" variant="outline">
                      Ver propostas
                    </ButtonLink>
                    {req.status === "open" && (
                      <ButtonLink href={`/pedidos/${req.id}`} size="sm" className="flex-1">
                        Comparar propostas
                      </ButtonLink>
                    )}
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
