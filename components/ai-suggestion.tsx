"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, Sparkles, CheckCircle, ChevronRight } from "lucide-react"
import { type } from "@/lib/typography"

type Suggestion = {
  categoria: string
  servico: string
  largura_cm: number | null
  altura_cm: number | null
  quantidade: number
  material_sugerido: string
  observacoes: string
  confianca: "alta" | "media" | "baixa"
}

type Props = {
  onApply: (suggestion: Suggestion) => void
  onSkip: () => void
  large?: boolean
}

const confiancaStyle = {
  alta: "bg-green-100 text-green-700 border-green-200",
  media: "bg-yellow-100 text-yellow-700 border-yellow-200",
  baixa: "bg-gray-100 text-gray-600 border-gray-200",
}

const examples = [
  "Preciso de banner para evento de formatura",
  "Quero uma placa para fachada da minha loja",
  "Adesivo com o logo da empresa para 50 caixas",
  "Envelopamento do meu carro com vinil preto fosco",
]

export function AISuggestion({ onApply, onSkip, large = false }: Props) {
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null)
  const [error, setError] = useState("")

  async function handleSuggest() {
    if (!text.trim() || text.length < 5) return
    setLoading(true)
    setError("")
    setSuggestion(null)

    try {
      const res = await fetch("/api/sugerir-pedido", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descricao: text }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setSuggestion(data)
    } catch {
      setError("Não consegui entender. Tente descrever de outra forma.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className={`rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50/50 ${large ? "p-8" : "p-6"}`}>
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <Sparkles className={`text-blue-600 ${large ? "h-7 w-7" : "h-6 w-6"}`} />
          <span className={`font-semibold text-blue-800 ${large ? type.h3 : type.cardTitle}`}>
            Descreva o que você precisa
          </span>
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">IA</Badge>
        </div>
        <Textarea
          placeholder="Ex: preciso de um banner para a fachada da minha loja de roupas, 3 metros de largura..."
          value={text}
          onChange={(e) => { setText(e.target.value); setSuggestion(null) }}
          rows={large ? 5 : 3}
          className={`bg-white resize-none min-h-[120px]`}
          onKeyDown={(e) => { if (e.key === "Enter" && e.ctrlKey) handleSuggest() }}
        />

        {!text && (
          <div className="mt-3 flex flex-wrap gap-2">
            {examples.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => setText(ex)}
                className={`rounded-full border border-blue-200 bg-white px-4 py-1.5 ${type.caption} text-blue-600 hover:bg-blue-50 transition-colors`}
              >
                {ex}
              </button>
            ))}
          </div>
        )}

        <div className={`mt-4 flex gap-3 ${large ? "flex-col sm:flex-row" : ""}`}>
          <Button className="flex-1" onClick={handleSuggest} disabled={loading || text.length < 5}>
            {loading
              ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analisando...</>
              : <><Sparkles className="mr-2 h-5 w-5" /> Sugerir automaticamente</>
            }
          </Button>
          <Button variant="ghost" onClick={onSkip} className={`text-gray-500 ${type.nav}`}>
            Preencher manualmente
          </Button>
        </div>
        {error && <p className={`mt-3 ${type.body} text-red-500`}>{error}</p>}
      </div>

      {suggestion && (
        <div className="rounded-2xl border-2 border-green-200 bg-green-50 p-6 space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <span className={`${type.cardTitle} text-green-800`}>Pedido identificado</span>
            </div>
            <span className={`rounded-full border px-3 py-1 ${type.caption} font-medium ${confiancaStyle[suggestion.confianca]}`}>
              Confiança {suggestion.confianca}
            </span>
          </div>

          <div className={`grid grid-cols-2 gap-3 ${type.body}`}>
            <div className="rounded-xl bg-white border p-3">
              <p className={type.caption}>Categoria</p>
              <p className="font-medium">{suggestion.categoria}</p>
            </div>
            <div className="rounded-xl bg-white border p-3">
              <p className={type.caption}>Serviço</p>
              <p className="font-medium">{suggestion.servico}</p>
            </div>
            {suggestion.largura_cm && suggestion.altura_cm && (
              <div className="rounded-xl bg-white border p-3">
                <p className={type.caption}>Medidas sugeridas</p>
                <p className="font-medium">{suggestion.largura_cm} × {suggestion.altura_cm} cm</p>
              </div>
            )}
            <div className="rounded-xl bg-white border p-3">
              <p className={type.caption}>Quantidade</p>
              <p className="font-medium">{suggestion.quantidade} unidade{suggestion.quantidade > 1 ? "s" : ""}</p>
            </div>
          </div>

          {suggestion.material_sugerido && (
            <div className={`rounded-xl bg-white border p-3 ${type.body}`}>
              <p className={type.caption}>Material recomendado</p>
              <p className="font-medium">{suggestion.material_sugerido}</p>
            </div>
          )}

          {suggestion.observacoes && (
            <div className={`rounded-xl bg-blue-50 border border-blue-100 p-3 ${type.caption} text-blue-700`}>
              💡 {suggestion.observacoes}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button className="flex-1" onClick={() => onApply(suggestion)}>
              Usar estas sugestões <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" className="flex-1" onClick={onSkip}>
              Ajustar manualmente
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
