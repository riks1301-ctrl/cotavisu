import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendNewProposalEmail, sendNewRequestEmail } from "@/lib/emails"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Notifica comprador quando fornecedor envia proposta
export async function POST(req: NextRequest) {
  try {
    const { type, proposalId, requestId } = await req.json()

    if (type === "new_proposal" && proposalId && requestId) {
      // Busca dados da proposta e do pedido
      const [propRes, reqRes] = await Promise.all([
        supabaseAdmin
          .from("proposals")
          .select("price_total, delivery_days, supplier_profiles(company_name)")
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

      if (proposal && request?.buyer_id) {
        const { data: buyer } = await supabaseAdmin
          .from("profiles")
          .select("email, name")
          .eq("id", request.buyer_id)
          .single()

        if (buyer?.email) {
          await sendNewProposalEmail({
            buyerEmail: buyer.email,
            buyerName: buyer.name ?? request.buyer_name ?? "Comprador",
            supplierName: (proposal.supplier_profiles as any)?.company_name ?? "Fornecedor",
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
      // Busca fornecedores da mesma cidade/estado para notificar
      const { data: request } = await supabaseAdmin
        .from("service_requests")
        .select("service_type, city, state, deadline_days")
        .eq("id", requestId)
        .single()

      if (!request) return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 })

      // Busca fornecedores ativos no mesmo estado
      const { data: suppliers } = await supabaseAdmin
        .from("supplier_profiles")
        .select("user_id, company_name")
        .eq("is_active", true)
        .limit(50) // Cap de 50 por segurança no MVP

      if (suppliers && suppliers.length > 0) {
        const userIds = suppliers.map((s) => s.user_id).filter(Boolean)

        const { data: profiles } = await supabaseAdmin
          .from("profiles")
          .select("id, email, name, state")
          .in("id", userIds)
          .not("email", "is", null)

        // Prioriza mesmo estado, mas envia para todos no MVP
        const targets = profiles ?? []

        // Envia em paralelo (máx 10 simultâneos para não sobrecarregar)
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
  } catch (error: any) {
    console.error("Erro no notify-proposal:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
