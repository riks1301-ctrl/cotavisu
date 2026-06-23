/**
 * Módulo de e-mails transacionais — CotaVisu
 * Usa Resend (resend.com) — plano gratuito: 3.000 e-mails/mês
 *
 * Para ativar:
 * 1. Crie conta em resend.com
 * 2. Adicione RESEND_API_KEY no .env.local e na Vercel
 * 3. Configure RESEND_FROM_EMAIL com e-mail verificado no Resend
 */

import { Resend } from "resend"

const FROM = process.env.RESEND_FROM_EMAIL ?? "noreply@cotavisu.com.br"
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://cotavisu.vercel.app"

/** Instancia Resend só quando a chave existe — evita quebrar build/dev sem RESEND_API_KEY */
function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY
  if (!key || key.startsWith("re_placeholder")) return null
  return new Resend(key)
}

// Silencia erros de e-mail em dev se chave não configurada
function safeLog(action: string, error?: any) {
  if (process.env.NODE_ENV === "development") {
    console.log(`[EMAIL] ${action}`, error ?? "")
  }
}

// ─────────────────────────────────────────────────────────
// E-MAIL 1: Comprador recebe aviso de nova proposta
// ─────────────────────────────────────────────────────────
export async function sendNewProposalEmail(params: {
  buyerEmail: string
  buyerName: string
  supplierName: string
  serviceType: string
  priceTotal: number
  deliveryDays: number
  requestId: string
}) {
  const resend = getResend()
  if (!resend) {
    safeLog("sendNewProposalEmail: chave não configurada, pulando")
    return
  }

  const { error } = await resend.emails.send({
    from: `CotaVisu <${FROM}>`,
    to: params.buyerEmail,
    subject: `Nova proposta para seu pedido de ${params.serviceType}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
        <div style="background:#2563eb;padding:20px 24px;border-radius:8px 8px 0 0">
          <h1 style="color:white;margin:0;font-size:20px">CotaVisu</h1>
        </div>
        <div style="border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 8px 8px">
          <p style="color:#374151">Olá, <strong>${params.buyerName}</strong>!</p>
          <p style="color:#374151">Você recebeu uma nova proposta para o seu pedido de <strong>${params.serviceType}</strong>.</p>

          <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:20px 0">
            <p style="margin:0 0 8px 0;color:#6b7280;font-size:14px">DETALHES DA PROPOSTA</p>
            <p style="margin:4px 0"><strong>Fornecedor:</strong> ${params.supplierName}</p>
            <p style="margin:4px 0"><strong>Preço total:</strong> R$ ${params.priceTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
            <p style="margin:4px 0"><strong>Prazo de entrega:</strong> ${params.deliveryDays} dias</p>
          </div>

          <a href="${SITE_URL}/pedidos/${params.requestId}"
             style="display:inline-block;background:#2563eb;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">
            Ver e comparar propostas →
          </a>

          <p style="color:#9ca3af;font-size:12px;margin-top:24px">
            CotaVisu — O comparador de comunicação visual do Brasil.<br>
            Você está recebendo este e-mail porque é o dono deste pedido.
          </p>
        </div>
      </div>
    `,
  })

  if (error) safeLog("sendNewProposalEmail erro", error)
}

// ─────────────────────────────────────────────────────────
// E-MAIL 2: Fornecedor recebe aviso de proposta aceita
// ─────────────────────────────────────────────────────────
export async function sendProposalAcceptedEmail(params: {
  supplierEmail: string
  supplierName: string
  buyerName: string
  serviceType: string
  priceTotal: number
  requestId: string
}) {
  const resend = getResend()
  if (!resend) {
    safeLog("sendProposalAcceptedEmail: chave não configurada, pulando")
    return
  }

  const { error } = await resend.emails.send({
    from: `CotaVisu <${FROM}>`,
    to: params.supplierEmail,
    subject: `🎉 Sua proposta foi aceita — ${params.serviceType}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
        <div style="background:#16a34a;padding:20px 24px;border-radius:8px 8px 0 0">
          <h1 style="color:white;margin:0;font-size:20px">CotaVisu — Proposta Aceita!</h1>
        </div>
        <div style="border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 8px 8px">
          <p style="color:#374151">Olá, <strong>${params.supplierName}</strong>!</p>
          <p style="color:#374151">Ótima notícia! O comprador <strong>${params.buyerName}</strong> aceitou a sua proposta para o serviço de <strong>${params.serviceType}</strong>.</p>

          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:20px 0">
            <p style="margin:0 0 8px 0;color:#16a34a;font-size:14px;font-weight:bold">✓ PROPOSTA ACEITA</p>
            <p style="margin:4px 0"><strong>Serviço:</strong> ${params.serviceType}</p>
            <p style="margin:4px 0"><strong>Valor:</strong> R$ ${params.priceTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
            <p style="margin:4px 0"><strong>Comprador:</strong> ${params.buyerName}</p>
          </div>

          <p style="color:#374151">O comprador entrará em contato para finalizar os detalhes. Você também pode acessar o pedido abaixo.</p>

          <a href="${SITE_URL}/pedidos/${params.requestId}"
             style="display:inline-block;background:#16a34a;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">
            Ver detalhes do pedido →
          </a>

          <p style="color:#9ca3af;font-size:12px;margin-top:24px">
            CotaVisu — O comparador de comunicação visual do Brasil.
          </p>
        </div>
      </div>
    `,
  })

  if (error) safeLog("sendProposalAcceptedEmail erro", error)
}

// ─────────────────────────────────────────────────────────
// E-MAIL 3: Fornecedores recebem aviso de novo pedido
// ─────────────────────────────────────────────────────────
export async function sendNewRequestEmail(params: {
  supplierEmail: string
  supplierName: string
  serviceType: string
  city: string
  state: string
  deadlineDays: number
  requestId: string
}) {
  const resend = getResend()
  if (!resend) {
    safeLog("sendNewRequestEmail: chave não configurada, pulando")
    return
  }

  const { error } = await resend.emails.send({
    from: `CotaVisu <${FROM}>`,
    to: params.supplierEmail,
    subject: `Novo pedido de ${params.serviceType} em ${params.city}/${params.state}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
        <div style="background:#2563eb;padding:20px 24px;border-radius:8px 8px 0 0">
          <h1 style="color:white;margin:0;font-size:20px">CotaVisu — Novo Pedido</h1>
        </div>
        <div style="border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 8px 8px">
          <p style="color:#374151">Olá, <strong>${params.supplierName}</strong>!</p>
          <p style="color:#374151">Há um novo pedido de orçamento na sua região que pode ser do seu interesse.</p>

          <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;margin:20px 0">
            <p style="margin:0 0 8px 0;color:#2563eb;font-size:14px;font-weight:bold">PEDIDO ABERTO</p>
            <p style="margin:4px 0"><strong>Serviço:</strong> ${params.serviceType}</p>
            <p style="margin:4px 0"><strong>Local:</strong> ${params.city}/${params.state}</p>
            <p style="margin:4px 0"><strong>Prazo desejado:</strong> ${params.deadlineDays} dias</p>
          </div>

          <a href="${SITE_URL}/pedidos/${params.requestId}"
             style="display:inline-block;background:#2563eb;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">
            Ver pedido e enviar proposta →
          </a>

          <p style="color:#9ca3af;font-size:12px;margin-top:24px">
            CotaVisu — O comparador de comunicação visual do Brasil.<br>
            Para não receber mais estes e-mails, ajuste suas preferências no painel.
          </p>
        </div>
      </div>
    `,
  })

  if (error) safeLog("sendNewRequestEmail erro", error)
}
