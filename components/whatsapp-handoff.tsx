"use client"

import { MessageCircle } from "lucide-react"
import { ButtonLink } from "@/components/ui/button-link"
import { buildWhatsAppUrl, formatWhatsAppDisplay } from "@/lib/whatsapp"
import { type } from "@/lib/typography"

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
    <div className="mb-8 rounded-2xl border-2 border-green-200 bg-green-50 p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className={`${type.cardTitle} text-green-900`}>Proposta escolhida — próximo passo</p>
          <p className={`mt-3 ${type.body} text-green-800`}>
            Fale com <strong>{supplierName}</strong> no WhatsApp para fechar os detalhes.
            A negociação e o pagamento são diretos com a gráfica.
          </p>
          <p className={`mt-3 ${type.caption} text-green-700`}>
            WhatsApp: {formatWhatsAppDisplay(supplierWhatsApp)}
          </p>
          {buyerWhatsApp && (
            <p className={`mt-2 ${type.caption} text-green-700`}>
              Seu número ({formatWhatsAppDisplay(buyerWhatsApp)}) foi compartilhado com o fornecedor.
            </p>
          )}
        </div>
        <ButtonLink
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          size="lg"
          className="shrink-0 bg-green-600 hover:bg-green-700"
        >
          <MessageCircle className="mr-2 h-5 w-5" />
          Abrir WhatsApp
        </ButtonLink>
      </div>
    </div>
  )
}
