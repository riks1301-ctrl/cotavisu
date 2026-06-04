"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ButtonLink } from "@/components/ui/button-link"
import { Clock, MapPin, Package, Plus } from "lucide-react"
import { createClient } from "@/lib/supabase-client"

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
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Meus pedidos</h1>
          <p className="text-gray-500">Acompanhe seus pedidos e propostas recebidas</p>
        </div>
        <ButtonLink href="/pedidos/novo">
          <Plus className="mr-2 h-4 w-4" /> Novo pedido
        </ButtonLink>
      </div>

      {requests.length === 0 ? (
        <div className="py-20 text-center text-gray-400">
          <Package className="mx-auto mb-3 h-12 w-12 opacity-30" />
          <p className="mb-2 text-lg font-medium">Nenhum pedido criado ainda</p>
          <p className="mb-6 text-sm">Crie seu primeiro pedido e receba propostas de fornecedores.</p>
          <ButtonLink href="/pedidos/novo">Criar pedido</ButtonLink>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const st = statusLabel[req.status] ?? statusLabel.open
            return (
              <Card key={req.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs">{req.category}</Badge>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${st.color}`}>{st.label}</span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(req.created_at).toLocaleDateString("pt-BR")}
                    </span>
                  </div>

                  <h3 className="mb-1 font-semibold">{req.service_type}</h3>

                  <div className="mb-4 grid grid-cols-2 gap-2 text-xs text-gray-500 sm:grid-cols-4">
                    <div className="flex items-center gap-1">
                      <Package className="h-3 w-3" /> {req.width_m}m × {req.height_m}m · {req.quantity}un
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {req.city}/{req.state}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Prazo: {req.deadline_days} dias
                    </div>
                    <div className="text-xs text-gray-400">
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
