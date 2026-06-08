"use client"

import { useEffect, useState } from "react"
import { ButtonLink } from "@/components/ui/button-link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MapPin, Package, Search } from "lucide-react"
import { StarRating, VerifiedBadge } from "@/components/trust-badges"
import { createClient } from "@/lib/supabase-client"

export default function FornecedoresPage() {
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from("supplier_profiles")
        .select("*, profiles(city, state)")
        .eq("is_active", true)
        .order("rating_avg", { ascending: false })

      setSuppliers(data ?? [])
      setFiltered(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    if (!search.trim()) { setFiltered(suppliers); return }
    const q = search.toLowerCase()
    setFiltered(suppliers.filter((s) =>
      s.company_name?.toLowerCase().includes(q) ||
      s.profiles?.city?.toLowerCase().includes(q) ||
      s.services?.some((sv: string) => sv.toLowerCase().includes(q))
    ))
  }, [search, suppliers])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Fornecedores</h1>
        <p className="text-gray-500 text-sm">Empresas cadastradas na plataforma</p>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input className="pl-9" placeholder="Buscar por nome, cidade ou serviço..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-7 w-7 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-gray-400">
          <Package className="mx-auto mb-3 h-12 w-12 opacity-30" />
          <p className="font-medium mb-1">Nenhum fornecedor encontrado</p>
          {suppliers.length === 0 ? (
            <>
              <p className="text-sm mb-4">Os primeiros fornecedores aparecerão aqui quando se cadastrarem.</p>
              <ButtonLink href="/cadastro">Cadastrar como fornecedor</ButtonLink>
            </>
          ) : (
            <p className="text-sm">Tente outra busca.</p>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <Card key={s.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-lg font-bold text-blue-600">
                    {s.company_name?.[0] ?? "?"}
                  </div>
                  {s.total_reviews === 0 && (
                    <Badge variant="outline" className="text-xs">Novo</Badge>
                  )}
                </div>

                <div className="mb-1 flex items-center gap-2">
                  <h3 className="font-semibold">{s.company_name}</h3>
                  {s.is_premium && <VerifiedBadge />}
                </div>

                {s.profiles && (
                  <div className="mb-2 flex items-center gap-1 text-xs text-gray-500">
                    <MapPin className="h-3 w-3" />{s.profiles.city}/{s.profiles.state}
                  </div>
                )}

                <div className="mb-2">
                  <StarRating rating={s.rating_avg ?? 0} reviews={s.total_reviews ?? 0} size="sm" />
                </div>

                {s.description && (
                  <p className="mb-3 text-xs text-gray-500 line-clamp-2">{s.description}</p>
                )}

                {s.services && s.services.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-1">
                    {s.services.slice(0, 4).map((svc: string) => (
                      <Badge key={svc} variant="secondary" className="text-xs">{svc}</Badge>
                    ))}
                  </div>
                )}

                <ButtonLink href={`/pedidos/novo`} className="w-full" size="sm" variant="outline">
                  Pedir orçamento
                </ButtonLink>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
