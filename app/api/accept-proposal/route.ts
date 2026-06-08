import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendProposalAcceptedEmail } from "@/lib/emails"

// Cliente server-side com service role para contornar RLS nesta operação crítica
// (o RLS de UPDATE em proposals requer política específica; usamos service role aqui)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { proposalId, requestId } = await req.json()

    if (!proposalId || !requestId) {
      return NextResponse.json({ error: "proposalId e requestId são obrigatórios" }, { status: 400 })
    }

    // 1. Verifica que o pedido ainda está aberto
    const { data: request, error: reqErr } = await supabaseAdmin
      .from("service_requests")
      .select("id, status, buyer_id, buyer_name, service_type, city, state")
      .eq("id", requestId)
      .single()

    if (reqErr || !request) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 })
    }

    if (request.status === "closed") {
      return NextResponse.json({ error: "Este pedido já foi fechado" }, { status: 409 })
    }

    // 2. Verifica que a proposta pertence ao pedido e está pendente
    const { data: proposal, error: propErr } = await supabaseAdmin
      .from("proposals")
      .select("id, status, price_total, supplier_id, supplier_profiles(company_name, user_id)")
      .eq("id", proposalId)
      .eq("request_id", requestId)
      .single()

    if (propErr || !proposal) {
      return NextResponse.json({ error: "Proposta não encontrada" }, { status: 404 })
    }

    if (proposal.status === "accepted") {
      return NextResponse.json({ error: "Esta proposta já foi aceita" }, { status: 409 })
    }

    const now = new Date().toISOString()

    // 3. Aceita a proposta selecionada
    const { error: acceptErr } = await supabaseAdmin
      .from("proposals")
      .update({ status: "accepted", accepted_at: now })
      .eq("id", proposalId)

    if (acceptErr) {
      return NextResponse.json({ error: "Erro ao aceitar proposta" }, { status: 500 })
    }

    // 4. Recusa todas as outras propostas do mesmo pedido
    const { error: rejectErr } = await supabaseAdmin
      .from("proposals")
      .update({ status: "rejected" })
      .eq("request_id", requestId)
      .neq("id", proposalId)

    if (rejectErr) {
      console.error("Erro ao rejeitar outras propostas:", rejectErr)
      // Não bloqueia o fluxo — aceite já foi salvo
    }

    // 5. Fecha o pedido
    const { error: closeErr } = await supabaseAdmin
      .from("service_requests")
      .update({ status: "closed" })
      .eq("id", requestId)

    if (closeErr) {
      console.error("Erro ao fechar pedido:", closeErr)
    }

    // 6. Busca e-mail do fornecedor para notificação
    const supplierId = (proposal.supplier_profiles as any)?.user_id
    if (supplierId) {
      const { data: supplierProfile } = await supabaseAdmin
        .from("profiles")
        .select("email, name")
        .eq("id", supplierId)
        .single()

      if (supplierProfile?.email) {
        await sendProposalAcceptedEmail({
          supplierEmail: supplierProfile.email,
          supplierName: (proposal.supplier_profiles as any)?.company_name ?? supplierProfile.name ?? "Fornecedor",
          buyerName: request.buyer_name ?? "Comprador",
          serviceType: request.service_type,
          priceTotal: proposal.price_total,
          requestId: requestId,
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: "Proposta aceita com sucesso",
      proposalId,
      requestId,
      closedAt: now,
    })

  } catch (error: any) {
    console.error("Erro no accept-proposal:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
