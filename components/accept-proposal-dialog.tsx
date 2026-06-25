"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { isValidWhatsApp } from "@/lib/whatsapp"
import { type } from "@/lib/typography"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplierName: string
  buyerWhatsApp: string
  onBuyerWhatsAppChange: (v: string) => void
  onConfirm: () => void
  loading: boolean
}

export function AcceptProposalDialog({
  open,
  onOpenChange,
  supplierName,
  buyerWhatsApp,
  onBuyerWhatsAppChange,
  onConfirm,
  loading,
}: Props) {
  const [consent, setConsent] = useState(false)
  const whatsappOk = isValidWhatsApp(buyerWhatsApp)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar escolha da proposta</DialogTitle>
        </DialogHeader>

        <div className={`space-y-6 ${type.body} text-gray-700`}>
          <p>
            Você está escolhendo a proposta de <strong>{supplierName}</strong>.
            As demais propostas serão recusadas e o pedido será fechado.
          </p>
          <p>
            O CotaVisu <strong>apenas compara orçamentos</strong>. A venda e o pagamento
            são feitos diretamente com a gráfica, em geral pelo WhatsApp.
          </p>

          <div>
            <Label htmlFor="buyer-wa">Seu WhatsApp *</Label>
            <Input
              id="buyer-wa"
              placeholder="(41) 99999-9999"
              value={buyerWhatsApp}
              onChange={(e) => onBuyerWhatsAppChange(e.target.value)}
            />
            <p className={`mt-2 ${type.caption}`}>
              Será compartilhado com a gráfica escolhida para continuidade do orçamento.
            </p>
          </div>

          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="mt-1"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            <span>
              Autorizo o CotaVisu a compartilhar meu WhatsApp com a gráfica escolhida,
              conforme a{" "}
              <a href="/privacidade" className="text-blue-600 underline" target="_blank">
                Política de Privacidade
              </a>
              .
            </span>
          </label>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              className="flex-1"
              disabled={!consent || !whatsappOk || loading}
              onClick={onConfirm}
            >
              {loading ? "Confirmando..." : "Confirmar e conectar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
