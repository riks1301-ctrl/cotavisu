"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ButtonLink } from "@/components/ui/button-link"
import { ArrowRight, Building2, Clock, Package, Plus, ShoppingCart } from "lucide-react"
import { createClient } from "@/lib/supabase-client"
import { signOut } from "@/lib/auth"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }
      setUser(user)

      const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      setProfile(prof)

      if (prof?.role === "buyer") {
        const { data } = await supabase
          .from("service_requests")
          .select("*, proposals(count)")
          .eq("buyer_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5)
        setRequests(data ?? [])
      } else if (prof?.role === "supplier") {
        const { data } = await supabase
          .from("service_requests")
          .select("*")
          .eq("status", "open")
          .order("created_at", { ascending: false })
          .limit(5)
        setRequests(data ?? [])
      }

      setLoading(false)
    }
    load()
  }, [router])

  async function handleLogout() {
    await signOut()
    router.push("/")
    router.refresh()
  }

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
    </div>
  )

  const isSupplier = profile?.role === "supplier"

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Olá, {profile?.name?.split(" ")[0] ?? "usuário"} 👋
          </h1>
          <p className="text-gray-500">
            {isSupplier ? "Confira os pedidos abertos na sua região" : "Gerencie seus pedidos de orçamento"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={isSupplier ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}>
            {isSupplier ? <><Building2 className="mr-1 h-3 w-3" />Fornecedor</> : <><ShoppingCart className="mr-1 h-3 w-3" />Comprador</>}
          </Badge>
          <Button variant="ghost" size="sm" onClick={handleLogout}>Sair</Button>
        </div>
      </div>

      {/* Ações rápidas */}
      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        {isSupplier ? (
          <>
            <ButtonLink href="/pedidos" className="flex items-center justify-center gap-2 rounded-xl border bg-white p-4 text-sm font-medium shadow-sm hover:shadow-md transition-shadow">
              <Package className="h-5 w-5 text-blue-600" /> Ver pedidos abertos
            </ButtonLink>
            <ButtonLink href="/perfil" className="flex items-center justify-center gap-2 rounded-xl border bg-white p-4 text-sm font-medium shadow-sm hover:shadow-md transition-shadow">
              <Building2 className="h-5 w-5 text-purple-600" /> Meu perfil
            </ButtonLink>
            <ButtonLink href="/pedidos" className="flex items-center justify-center gap-2 rounded-xl border bg-blue-600 p-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors">
              <ArrowRight className="h-5 w-5" /> Enviar proposta
            </ButtonLink>
          </>
        ) : (
          <>
            <ButtonLink href="/pedidos/novo" className="flex items-center justify-center gap-2 rounded-xl border bg-blue-600 p-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors">
              <Plus className="h-5 w-5" /> Novo pedido
            </ButtonLink>
            <ButtonLink href="/meus-pedidos" className="flex items-center justify-center gap-2 rounded-xl border bg-white p-4 text-sm font-medium shadow-sm hover:shadow-md transition-shadow">
              <Package className="h-5 w-5 text-green-600" /> Meus pedidos
            </ButtonLink>
            <ButtonLink href="/fornecedores" className="flex items-center justify-center gap-2 rounded-xl border bg-white p-4 text-sm font-medium shadow-sm hover:shadow-md transition-shadow">
              <Building2 className="h-5 w-5 text-orange-600" /> Fornecedores
            </ButtonLink>
          </>
        )}
      </div>

      {/* Lista de pedidos */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">
            {isSupplier ? "Pedidos abertos para proposta" : "Seus pedidos recentes"}
          </h2>
          <ButtonLink href={isSupplier ? "/pedidos" : "/meus-pedidos"} variant="ghost" size="sm">
            Ver todos <ArrowRight className="ml-1 h-3 w-3" />
          </ButtonLink>
        </div>

        {requests.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-200 py-12 text-center text-gray-400">
            <Package className="mx-auto mb-2 h-10 w-10 opacity-30" />
            <p>{isSupplier ? "Nenhum pedido aberto no momento." : "Você ainda não criou nenhum pedido."}</p>
            {!isSupplier && (
              <ButtonLink href="/pedidos/novo" className="mt-4">
                <Plus className="mr-2 h-4 w-4" /> Criar primeiro pedido
              </ButtonLink>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <Card key={req.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{req.service_type}</span>
                      <Badge variant="secondary" className="text-xs">{req.category}</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>{req.width_m}m × {req.height_m}m · {req.quantity}un</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{req.deadline_days} dias</span>
                      <span>{req.city}/{req.state}</span>
                    </div>
                  </div>
                  <ButtonLink href={`/pedidos/${req.id}`} size="sm" variant="outline">
                    {isSupplier ? "Enviar proposta" : "Ver propostas"}
                  </ButtonLink>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
