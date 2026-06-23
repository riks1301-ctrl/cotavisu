import { NextRequest, NextResponse } from "next/server"
import { sendNewProposalEmail, sendNewRequestEmail } from "@/lib/emails"
import { getSupabaseAdmin } from "@/lib/supabase-admin"
import { shouldNotifySuppliersForRequest } from "@/lib/pilot"

type SupplierJoin = { company_name: string }

export async function POST(req: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { type, proposalId, requestId } = await req.json()

    if (type === "new_proposal" && proposalId && requestId) {
      const [propRes, reqRes] = await Promise.all([
        supabaseAdmin
          .from("proposals")
          .select("price_total, delivery_days, status, supplier_profiles(company_name)")
          .eq("id", proposalId)
          .single(),
        supabaseAdmin
          .from("service_requests")
          .select("service_type, buyer_id, buyer_name")
          .eq("id", requestId)
          .single(),
      ])

      const proposal = propRes.data
      const request = reqRes.data

      if (!proposal || proposal.status !== "pending" || !request) {
        return NextResponse.json({ error: "Proposta ou pedido inválido" }, { status: 400 })
      }

      if (request.buyer_id) {
        const { data: buyer } = await supabaseAdmin
          .from("profiles")
          .select("email, name")
          .eq("id", request.buyer_id)
          .single()

        if (buyer?.email) {
          const supplierProfiles = proposal.supplier_profiles as SupplierJoin | SupplierJoin[] | null
          const supplierName = Array.isArray(supplierProfiles)
            ? supplierProfiles[0]?.company_name
            : supplierProfiles?.company_name

          await sendNewProposalEmail({
            buyerEmail: buyer.email,
            buyerName: buyer.name ?? request.buyer_name ?? "Comprador",
            supplierName: supplierName ?? "Fornecedor",
            serviceType: request.service_type,
            priceTotal: proposal.price_total,
            deliveryDays: proposal.delivery_days,
            requestId,
          })
        }
      }

      return NextResponse.json({ success: true })
    }

    if (type === "new_request" && requestId) {
      const { data: request } = await supabaseAdmin
        .from("service_requests")
        .select("service_type, city, state, deadline_days, status, created_at")
        .eq("id", requestId)
        .single()

      if (!request || request.status !== "open") {
        return NextResponse.json({ error: "Pedido inválido" }, { status: 400 })
      }

      const createdAt = new Date(request.created_at).getTime()
      if (Date.now() - createdAt > 15 * 60 * 1000) {
        return NextResponse.json({ error: "Pedido expirado para notificação" }, { status: 400 })
      }

      if (!shouldNotifySuppliersForRequest(request.state)) {
        return NextResponse.json({ success: true, skipped: "pilot_state" })
      }

      const { data: suppliers } = await supabaseAdmin
        .from("supplier_profiles")
        .select("user_id, company_name")
        .eq("is_active", true)
        .limit(100)

      if (suppliers && suppliers.length > 0) {
        const userIds = suppliers.map((s) => s.user_id).filter(Boolean)

        const { data: profiles } = await supabaseAdmin
          .from("profiles")
          .select("id, email, name, state")
          .in("id", userIds)
          .not("email", "is", null)

        const targets = (profiles ?? []).filter(
          (p) => p.state?.toUpperCase() === request.state?.toUpperCase()
        )

        const chunks = []
        for (let i = 0; i < targets.length; i += 10) {
          chunks.push(targets.slice(i, i + 10))
        }

        for (const chunk of chunks) {
          await Promise.all(
            chunk.map((profile) => {
              const supplier = suppliers.find((s) => s.user_id === profile.id)
              return sendNewRequestEmail({
                supplierEmail: profile.email!,
                supplierName: supplier?.company_name ?? profile.name ?? "Fornecedor",
                serviceType: request.service_type,
                city: request.city,
                state: request.state,
                deadlineDays: request.deadline_days,
                requestId,
              })
            })
          )
        }
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "type inválido" }, { status: 400 })
  } catch (error: unknown) {
    console.error("Erro no notify-proposal:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
