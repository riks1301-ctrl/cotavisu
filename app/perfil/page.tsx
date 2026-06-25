"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, Save } from "lucide-react"
import { createClient } from "@/lib/supabase-client"
import { isValidWhatsApp } from "@/lib/whatsapp"
import { PageHeader } from "@/components/layout/page-header"
import { layout, type } from "@/lib/typography"

const SERVICE_OPTIONS = [
  "Adesivos", "Banners e Lonas", "Fachadas e ACM", "PDV",
  "Plotagem", "Luminosos", "Impressão Digital",
]

export default function PerfilPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [role, setRole] = useState<"buyer" | "supplier" | "admin">("buyer")

  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [description, setDescription] = useState("")
  const [services, setServices] = useState<string[]>([])
  const [supplierId, setSupplierId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login?redirect=/perfil")
        return
      }

      const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      if (!prof) {
        setLoading(false)
        return
      }

      setRole(prof.role)
      setName(prof.name ?? "")
      setPhone(prof.phone ?? "")
      setCity(prof.city ?? "")
      setState(prof.state ?? "")

      if (prof.role === "supplier") {
        const { data: sup } = await supabase
          .from("supplier_profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle()

        if (sup) {
          setSupplierId(sup.id)
          setCompanyName(sup.company_name ?? "")
          setWhatsapp(sup.whatsapp ?? prof.phone ?? "")
          setDescription(sup.description ?? "")
          setServices(sup.services ?? [])
        } else {
          setCompanyName(prof.name ?? "")
          setWhatsapp(prof.phone ?? "")
        }
      }

      setLoading(false)
    }
    load()
  }, [router])

  function toggleService(s: string) {
    setServices((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    )
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSuccess(false)

    if (role === "supplier") {
      if (!companyName.trim()) {
        setError("Informe o nome da empresa.")
        return
      }
      if (!isValidWhatsApp(whatsapp)) {
        setError("Informe um WhatsApp válido com DDD.")
        return
      }
    }

    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const profileUpdate: Record<string, string> = { name: name || companyName }
    if (phone) profileUpdate.phone = phone
    if (city) profileUpdate.city = city
    if (state) profileUpdate.state = state.toUpperCase()

    const { error: profErr } = await supabase
      .from("profiles")
      .update(profileUpdate)
      .eq("id", user.id)

    if (profErr) {
      setSaving(false)
      setError("Erro ao salvar perfil.")
      return
    }

    if (role === "supplier") {
      const payload = {
        user_id: user.id,
        company_name: companyName,
        whatsapp,
        description: description || null,
        services,
        is_active: true,
      }

      const { error: supErr } = supplierId
        ? await supabase.from("supplier_profiles").update(payload).eq("id", supplierId)
        : await supabase.from("supplier_profiles").insert(payload)

      if (supErr) {
        setSaving(false)
        setError("Erro ao salvar dados da empresa.")
        return
      }
    }

    setSaving(false)
    setSuccess(true)
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className={`${layout.container} py-14`}>
      <PageHeader
        title="Meu perfil"
        subtitle={
          role === "supplier"
            ? "Dados visíveis nas propostas. WhatsApp é compartilhado só após o comprador escolher sua proposta."
            : "Seus dados de contato para quando você escolher uma proposta."
        }
      />

      <Card>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            <Badge variant="secondary">
              {role === "supplier" ? "Fornecedor" : role === "admin" ? "Admin" : "Comprador"}
            </Badge>

            {role === "supplier" ? (
              <>
                <div>
                  <Label htmlFor="company">Nome da empresa *</Label>
                  <Input id="company" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="wa">WhatsApp comercial *</Label>
                  <Input
                    id="wa"
                    placeholder="(41) 99999-9999"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="desc">Descrição</Label>
                  <Textarea
                    id="desc"
                    rows={3}
                    placeholder="Especialidades, equipamentos, região de entrega..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Serviços oferecidos</Label>
                  <div className="flex flex-wrap gap-2">
                    {SERVICE_OPTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleService(s)}
                        className={`rounded-xl border px-4 py-2.5 ${type.caption} transition-all ${
                          services.includes(s)
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "hover:border-gray-300"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div>
                <Label htmlFor="name">Seu nome</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <Label htmlFor="city">Cidade</Label>
                <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Curitiba" />
              </div>
              <div>
                <Label htmlFor="uf">UF</Label>
                <Input
                  id="uf"
                  maxLength={2}
                  value={state}
                  onChange={(e) => setState(e.target.value.toUpperCase())}
                  placeholder="PR"
                />
              </div>
            </div>

            {role !== "supplier" && (
              <div>
                <Label htmlFor="phone">WhatsApp (opcional até aceitar proposta)</Label>
                <Input
                  id="phone"
                  placeholder="(41) 99999-9999"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            )}

            {error && <p className={`rounded-xl bg-red-50 p-4 ${type.body} text-red-600`}>{error}</p>}
            {success && <p className={`rounded-xl bg-green-50 p-4 ${type.body} text-green-700`}>Perfil salvo!</p>}

            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</> : <><Save className="mr-2 h-4 w-4" /> Salvar</>}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
