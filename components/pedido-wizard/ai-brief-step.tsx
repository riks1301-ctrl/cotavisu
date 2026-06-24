"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Sparkles, ArrowRight, Wand2 } from "lucide-react"
import type { AISuggestionResult } from "./types"

const EXAMPLES = [
  "Preciso de banner 3×1m para inauguração da loja em Curitiba",
  "Adesivo com logo para 200 caixas de delivery",
  "Placa ACM para fachada de clínica, 2 metros de largura",
  "Envelopamento completo do carro da empresa em preto fosco",
]

const confiancaStyle = {
  alta: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  media: "bg-amber-50 text-amber-700 ring-amber-200",
  baixa: "bg-gray-50 text-gray-600 ring-gray-200",
}

type Props = {
  onApply: (s: AISuggestionResult) => void
  onManual: () => void
}

export function AIBriefStep({ onApply, onManual }: Props) {
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)
  const [suggestion, setSuggestion] = useState<AISuggestionResult | null>(null)
  const [error, setError] = useState("")

  async function handleSuggest() {
    if (!text.trim() || text.length < 8) return
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
      setError("Não consegui interpretar. Tente com mais detalhes sobre medidas e uso.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-200">
          <Wand2 className="h-7 w-7" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          O que você precisa produzir?
        </h2>
        <p className="mt-3 text-lg text-gray-500">
          Descreva em linguagem natural — a IA monta o pedido para você
        </p>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl shadow-gray-200/60">
        <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-6 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-600" />
            <span className="text-sm font-medium text-gray-700">Assistente CotaVisu</span>
            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-700">
              IA
            </span>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <textarea
            value={text}
            onChange={(e) => { setText(e.target.value); setSuggestion(null) }}
            placeholder="Ex: Preciso de 100 adesivos 10×10 cm em vinil para colar em potes de cosmético. Entrega em São Paulo em até 7 dias..."
            rows={5}
            className="w-full resize-none rounded-2xl border-0 bg-gray-50 px-5 py-4 text-lg text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition-all"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSuggest()
            }}
          />

          {!text && (
            <div className="mt-4 flex flex-wrap gap-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => setText(ex)}
                  className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 transition-all hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
                >
                  {ex}
                </button>
              ))}
            </div>
          )}

          {error && (
            <p className="mt-4 text-sm text-red-600">{error}</p>
          )}

          {suggestion && (
            <div className="mt-6 animate-in fade-in slide-in-from-bottom-2 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="font-semibold text-emerald-900">Pedido identificado</p>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${confiancaStyle[suggestion.confianca]}`}>
                  Confiança {suggestion.confianca}
                </span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  ["Categoria", suggestion.categoria],
                  ["Serviço", suggestion.servico],
                  suggestion.largura_cm && suggestion.altura_cm
                    ? ["Medidas", `${suggestion.largura_cm} × ${suggestion.altura_cm} cm`]
                    : null,
                  ["Quantidade", `${suggestion.quantidade} un`],
                  suggestion.material_sugerido ? ["Material", suggestion.material_sugerido] : null,
                ]
                  .filter(Boolean)
                  .map((row) => (
                    <div key={row![0]} className="rounded-xl bg-white px-4 py-3 ring-1 ring-gray-100">
                      <p className="text-xs text-gray-400">{row![0]}</p>
                      <p className="font-medium text-gray-900">{row![1]}</p>
                    </div>
                  ))}
              </div>
              {suggestion.observacoes && (
                <p className="mt-3 text-sm text-emerald-800">💡 {suggestion.observacoes}</p>
              )}
              <Button
                className="mt-5 w-full h-12 rounded-xl bg-gray-900 text-base hover:bg-gray-800"
                onClick={() => onApply(suggestion)}
              >
                Usar estas sugestões <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-gray-100 bg-gray-50/80 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onManual}
            className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            Prefiro escolher manualmente →
          </button>
          <Button
            size="lg"
            className="h-12 rounded-xl bg-gray-900 px-8 text-base hover:bg-gray-800"
            onClick={handleSuggest}
            disabled={loading || text.length < 8}
          >
            {loading ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analisando...</>
            ) : (
              <><Sparkles className="mr-2 h-5 w-5" /> Gerar pedido com IA</>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
