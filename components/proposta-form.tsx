"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ButtonLink } from "@/components/ui/button-link"
import { CheckCircle, Loader2, Send } from "lucide-react"
import { createClient } from "@/lib/supabase-client"
import { type } from "@/lib/typography"

export function PropostaForm({ requestId }: { requestId: string }) {
  const router = useRouter()
  const [price, setPrice] = useState("")
  const [days, setDays] = useState("")
  const [payment, setPayment] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push("/login")
      return
    }

    // Busca ou cria supplier_profile
    let { data: supplier } = await supabase
      .from("supplier_profiles")
      .select("id, whatsapp, company_name")
      .eq("user_id", user.id)
      .single()

    if (!supplier) {
      router.push("/perfil")
      setError("Complete seu perfil de fornecedor antes de enviar propostas.")
      setLoading(false)
      return
    }

    if (!supplier.whatsapp) {
      router.push("/perfil")
      setError("Cadastre seu WhatsApp no perfil para enviar propostas.")
      setLoading(false)
      return
    }

    if (supplier.company_name === "Minha Empresa" || !supplier.company_name?.trim()) {
      router.push("/perfil")
      setError("Informe o nome da sua empresa no perfil.")
      setLoading(false)
      return
    }

    const { data: newProposal, error: propError } = await supabase.from("proposals").insert({
      request_id: requestId,
      supplier_id: supplier.id,
      price_total: parseFloat(price),
      delivery_days: parseInt(days),
      payment_terms: payment || null,
      notes: notes || null,
      status: "pending",
    }).select("id").single()

    setLoading(false)
    if (propError) {
      if (propError.code === "23505") {
        setError("Você já enviou uma proposta para este pedido.")
      } else {
        setError("Erro ao enviar proposta. Tente novamente.")
      }
    } else {
      // Notifica o comprador por e-mail (fire-and-forget)
      if (newProposal?.id) {
        fetch("/api/notify-proposal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "new_proposal", proposalId: newProposal.id, requestId }),
        }).catch(() => {}) // silencia erro de e-mail — não bloqueia o fluxo
      }
      setSuccess(true)
      router.refresh()
    }
  }

  if (success) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
        <CheckCircle className="mx-auto mb-2 h-10 w-10 text-green-500" />
        <h3 className={`${type.cardTitle} text-green-800`}>Proposta enviada!</h3>
        <p className={`mt-2 ${type.body} text-green-700`}>O comprador será notificado sobre sua proposta.</p>
      </div>
    )
  }

  return (
    <Card id="proposta" className="border-blue-200">
      <CardContent className="p-6">
        <h3 className={`mb-6 ${type.h3}`}>Enviar proposta</h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="price">Preço total (R$) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="ex: 250.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="days">Prazo de entrega (dias) *</Label>
              <Input
                id="days"
                type="number"
                min="1"
                placeholder="ex: 3"
                value={days}
                onChange={(e) => setDays(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="payment">Condições de pagamento</Label>
            <Input
              id="payment"
              placeholder="ex: PIX à vista, cartão, boleto 30 dias"
              value={payment}
              onChange={(e) => setPayment(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Detalhe sua proposta: acabamento, instalação inclusa, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {error && (
            <p className={`rounded-xl bg-red-50 p-4 ${type.body} text-red-600`}>{error}</p>
          )}

          <Button className="w-full" type="submit" disabled={loading}>
            {loading
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...</>
              : <><Send className="mr-2 h-4 w-4" /> Enviar proposta</>
            }
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export function PropostaLoginPrompt() {
  return (
    <div id="proposta" className="rounded-xl border-2 border-dashed border-blue-300 bg-blue-50/50 p-6 text-center">
      <h3 className={`mb-3 ${type.cardTitle}`}>Você é fornecedor?</h3>
      <p className={`mb-6 ${type.body} text-gray-500`}>Crie uma conta ou entre para enviar sua proposta.</p>
      <div className="flex justify-center gap-3">
        <ButtonLink href="/login" variant="outline">Entrar</ButtonLink>
        <ButtonLink href="/cadastro">Cadastrar grátis</ButtonLink>
      </div>
    </div>
  )
}
