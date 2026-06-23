import { NextRequest, NextResponse } from "next/server"
import { sendProposalAcceptedEmail } from "@/lib/emails"
import { getSupabaseAdmin } from "@/lib/supabase-admin"
import { normalizeWhatsAppPhone } from "@/lib/whatsapp"

type SupplierJoin = {
  company_name: string
  user_id: string
  whatsapp: string | null
}

export async function POST(req: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const authHeader = req.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "").trim()

    if (!token) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token)
    if (authErr || !user) {
      return NextResponse.json({ error: "Token inválido ou expirado" }, { status: 401 })
    }

    const body = await req.json()
    const { proposalId, requestId, buyerWhatsapp, consentShareContact } = body

    if (!proposalId || !requestId) {
      return NextResponse.json(
        { error: "proposalId e requestId são obrigatórios" },
        { status: 400 }
      )
    }

    if (!consentShareContact) {
      return NextResponse.json(
        { error: "É necessário autorizar o compartilhamento do WhatsApp." },
        { status: 400 }
      )
    }

    const normalizedBuyerWa = buyerWhatsapp ? normalizeWhatsAppPhone(buyerWhatsapp) : null
    if (!normalizedBuyerWa) {
      return NextResponse.json(
        { error: "Informe um WhatsApp válido com DDD." },
        { status: 400 }
      )
    }

    const { data: request, error: reqErr } = await supabaseAdmin
      .from("service_requests")
      .select("buyer_id, service_type, buyer_name, city, state")
      .eq("id", requestId)
      .single()

    if (reqErr || !request) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 })
    }

    if (request.buyer_id !== user.id) {
      return NextResponse.json(
        { error: "Acesso negado: você não é o dono deste pedido" },
        { status: 403 }
      )
    }

    await supabaseAdmin
      .from("profiles")
      .update({ phone: buyerWhatsapp })
      .eq("id", user.id)

    const { data: rpcResult, error: rpcErr } = await supabaseAdmin.rpc(
      "accept_proposal",
      {
        p_proposal_id: proposalId,
        p_request_id: requestId,
        p_buyer_id: user.id,
      }
    )

    if (rpcErr) {
      console.error("RPC accept_proposal error:", rpcErr)
      return NextResponse.json(
        { error: "Erro interno ao executar transação" },
        { status: 500 }
      )
    }

    if (!rpcResult?.success) {
      return NextResponse.json(
        { error: rpcResult?.error ?? "Operação recusada" },
        { status: 409 }
      )
    }

    const { data: proposal } = await supabaseAdmin
      .from("proposals")
      .select("price_total, delivery_days, supplier_profiles(company_name, user_id, whatsapp)")
      .eq("id", proposalId)
      .single()

    const supplierRaw = proposal?.supplier_profiles
    const supplier = (Array.isArray(supplierRaw) ? supplierRaw[0] : supplierRaw) as SupplierJoin | null
    let supplierWhatsApp = supplier?.whatsapp ?? null

    if (!supplierWhatsApp && supplier?.user_id) {
      const { data: supProf } = await supabaseAdmin
        .from("profiles")
        .select("phone")
        .eq("id", supplier.user_id)
        .single()
      supplierWhatsApp = supProf?.phone ?? null
    }

    try {
      if (supplier?.user_id) {
        const { data: supplierProfile } = await supabaseAdmin
          .from("profiles")
          .select("email, name")
          .eq("id", supplier.user_id)
          .single()

        if (supplierProfile?.email) {
          await sendProposalAcceptedEmail({
            supplierEmail: supplierProfile.email,
            supplierName: supplier?.company_name ?? supplierProfile.name ?? "Fornecedor",
            buyerName: request.buyer_name ?? "Comprador",
            serviceType: request.service_type,
            priceTotal: proposal?.price_total ?? 0,
            requestId,
          })
        }
      }
    } catch (emailErr) {
      console.error("Erro ao enviar e-mail pós-aceite:", emailErr)
    }

    return NextResponse.json({
      success: true,
      closedAt: rpcResult.closed_at,
      supplier: {
        companyName: supplier?.company_name ?? "Fornecedor",
        whatsapp: supplierWhatsApp,
      },
      buyerWhatsapp: buyerWhatsapp,
      serviceType: request.service_type,
      priceTotal: proposal?.price_total ?? 0,
      deliveryDays: proposal?.delivery_days ?? 0,
    })
  } catch (err: unknown) {
    console.error("Erro inesperado em accept-proposal:", err)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
