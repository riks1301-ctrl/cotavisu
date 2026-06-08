import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendProposalAcceptedEmail } from "@/lib/emails"

// Cliente server-side com service_role — nunca exposto ao browser
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    // ── 1. Valida autenticação via Bearer token ──────────────
    const authHeader = req.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "").trim()

    if (!token) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token)

    if (authErr || !user) {
      return NextResponse.json({ error: "Token inválido ou expirado" }, { status: 401 })
    }

    // ── 2. Valida payload ────────────────────────────────────
    const body = await req.json()
    const { proposalId, requestId } = body

    if (!proposalId || !requestId) {
      return NextResponse.json(
        { error: "proposalId e requestId são obrigatórios" },
        { status: 400 }
      )
    }

    // ── 3. Verifica ownership antes de chamar a RPC ──────────
    // Evita custo da RPC em tentativas inválidas
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

    // ── 4. Chama a RPC transacional (service_role only) ──────
    const { data: rpcResult, error: rpcErr } = await supabaseAdmin.rpc(
      "accept_proposal",
      {
        p_proposal_id: proposalId,
        p_request_id:  requestId,
        p_buyer_id:    user.id,
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
      // Retorna o erro semântico vindo da função SQL (ex: "Pedido não está aberto")
      return NextResponse.json(
        { error: rpcResult?.error ?? "Operação recusada" },
        { status: 409 }
      )
    }

    // ── 5. Notifica o fornecedor por e-mail (fora da transação)
    // Fire-and-forget: falha não reverte o aceite
    try {
      const { data: proposal } = await supabaseAdmin
        .from("proposals")
        .select("price_total, supplier_profiles(company_name, user_id)")
        .eq("id", proposalId)
        .single()

      const supplierUserId = (proposal?.supplier_profiles as any)?.user_id
      if (supplierUserId) {
        const { data: supplierProfile } = await supabaseAdmin
          .from("profiles")
          .select("email, name")
          .eq("id", supplierUserId)
          .single()

        if (supplierProfile?.email) {
          await sendProposalAcceptedEmail({
            supplierEmail: supplierProfile.email,
            supplierName:
              (proposal?.supplier_profiles as any)?.company_name ??
              supplierProfile.name ??
              "Fornecedor",
            buyerName: request.buyer_name ?? "Comprador",
            serviceType: request.service_type,
            priceTotal: proposal?.price_total ?? 0,
            requestId,
          })
        }
      }
    } catch (emailErr) {
      // E-mail falhou — aceite já está gravado, não reverter
      console.error("Erro ao enviar e-mail pós-aceite:", emailErr)
    }

    return NextResponse.json({
      success: true,
      closedAt: rpcResult.closed_at,
    })

  } catch (err: any) {
    console.error("Erro inesperado em accept-proposal:", err)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
