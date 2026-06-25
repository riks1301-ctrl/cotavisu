"use client"

import { useEffect, useState } from "react"
import { ButtonLink } from "@/components/ui/button-link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MapPin, Package, Search } from "lucide-react"
import { StarRating, VerifiedBadge } from "@/components/trust-badges"
import { createClient } from "@/lib/supabase-client"
import { PageHeader } from "@/components/layout/page-header"
import { layout, type } from "@/lib/typography"

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
    <div className={`${layout.container} py-10`}>
      <PageHeader
        title="Fornecedores"
        subtitle="Empresas cadastradas na plataforma"
      />

      <div className="mb-8 relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input className="pl-9" placeholder="Buscar por nome, cidade ou serviço..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-7 w-7 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-gray-400">
          <Package className="mx-auto mb-4 h-14 w-14 opacity-30" />
          <p className={`font-medium mb-2 ${type.cardTitle}`}>Nenhum fornecedor encontrado</p>
          {suppliers.length === 0 ? (
            <>
              <p className={`${type.body} mb-6`}>Os primeiros fornecedores aparecerão aqui quando se cadastrarem.</p>
              <ButtonLink href="/cadastro">Cadastrar como fornecedor</ButtonLink>
            </>
          ) : (
            <p className={type.body}>Tente outra busca.</p>
          )}
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 2xl:grid-cols-3">
          {filtered.map((s) => (
            <Card key={s.id} className="hover:shadow-xl transition-all">
              <CardContent className="flex flex-col gap-5">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-xl font-bold text-blue-600">
                    {s.company_name?.[0] ?? "?"}
                  </div>
                  {s.total_reviews === 0 && (
                    <Badge variant="outline">Novo</Badge>
                  )}
                </div>

                <div className="mb-2 flex items-center gap-2">
                  <h3 className={type.cardTitle}>{s.company_name}</h3>
                  {s.is_premium && <VerifiedBadge />}
                </div>

                {s.profiles && (
                  <div className={`mb-3 flex items-center gap-1.5 ${type.caption}`}>
                    <MapPin className="h-4 w-4" />{s.profiles.city}/{s.profiles.state}
                  </div>
                )}

                <div className="mb-2">
                  <StarRating rating={s.rating_avg ?? 0} reviews={s.total_reviews ?? 0} size="sm" />
                </div>

                {s.description && (
                  <p className={`${type.body} text-gray-600 line-clamp-3 leading-relaxed`}>{s.description}</p>
                )}

                {s.services && s.services.length > 0 && (
                  <div className="mb-5 flex flex-wrap gap-2">
                    {s.services.slice(0, 4).map((svc: string) => (
                      <Badge key={svc} variant="secondary">{svc}</Badge>
                    ))}
                  </div>
                )}

                <ButtonLink href={`/pedidos/novo`} className="w-full" variant="outline">
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
