"use client"

import { MessageCircle } from "lucide-react"
import { buildWhatsAppUrl, formatWhatsAppDisplay } from "@/lib/whatsapp"

type Props = {
  supplierName: string
  supplierWhatsApp: string
  serviceType: string
  priceTotal: number
  deliveryDays: number
  buyerWhatsApp?: string | null
}

export function WhatsAppHandoff({
  supplierName,
  supplierWhatsApp,
  serviceType,
  priceTotal,
  deliveryDays,
  buyerWhatsApp,
}: Props) {
  const price = priceTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })
  const message =
    `Olá! Vi sua proposta no CotaVisu para *${serviceType}*. ` +
    `Aceitei *R$ ${price}* em *${deliveryDays} dias*. Podemos seguir?`

  const waUrl = buildWhatsAppUrl(supplierWhatsApp, message)

  return (
    <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-green-800">Proposta escolhida — próximo passo</p>
          <p className="mt-1 text-sm text-green-700">
            Fale com <strong>{supplierName}</strong> no WhatsApp para fechar os detalhes.
            A negociação e o pagamento são diretos com a gráfica.
          </p>
          <p className="mt-2 text-xs text-green-600">
            WhatsApp: {formatWhatsAppDisplay(supplierWhatsApp)}
          </p>
          {buyerWhatsApp && (
            <p className="mt-1 text-xs text-green-600">
              Seu número ({formatWhatsAppDisplay(buyerWhatsApp)}) foi compartilhado com o fornecedor.
            </p>
          )}
        </div>
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          Abrir WhatsApp
        </a>
      </div>
    </div>
  )
}
