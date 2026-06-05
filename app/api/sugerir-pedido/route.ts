import Anthropic from "@anthropic-ai/sdk"
import { NextRequest, NextResponse } from "next/server"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `Você é um especialista em comunicação visual brasileiro.
Analise a descrição do usuário e sugira os detalhes do pedido no formato JSON exato abaixo.

Categorias disponíveis: Adesivos, Banners e Lonas, Fachadas e ACM, Plotagem, Luminosos, Impressão Digital

Serviços disponíveis por categoria:
- Adesivos: Adesivo Impresso, Adesivo Recortado (Plotter), Envelopamento Veicular
- Banners e Lonas: Banner, Lona para Fachada
- Fachadas e ACM: Placa em ACM, Placa em PVC, Letra Caixa
- Plotagem: Plotagem de Plantas, Adesivo de Corte (Vinil)
- Luminosos: Painel Luminoso
- Impressão Digital: Impressão em Papel, Impressão em Rígido (Direto)

Retorne APENAS o JSON, sem markdown, sem explicação:
{
  "categoria": "nome da categoria",
  "servico": "nome do serviço",
  "largura_cm": número ou null,
  "altura_cm": número ou null,
  "quantidade": número,
  "material_sugerido": "descrição curta do material recomendado",
  "observacoes": "dica relevante para este tipo de pedido",
  "confianca": "alta" | "media" | "baixa"
}`

export async function POST(req: NextRequest) {
  try {
    const { descricao } = await req.json()

    if (!descricao || descricao.trim().length < 5) {
      return NextResponse.json({ error: "Descrição muito curta" }, { status: 400 })
    }

    const message = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Descrição do pedido: "${descricao}"`,
        },
      ],
    })

    const text = message.content[0].type === "text" ? message.content[0].text : ""

    // Remove possíveis blocos markdown ```json ... ```
    const cleaned = text
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim()

    let suggestion
    try {
      suggestion = JSON.parse(cleaned)
    } catch {
      // Tenta extrair JSON de dentro do texto
      const match = cleaned.match(/\{[\s\S]*\}/)
      if (match) {
        try {
          suggestion = JSON.parse(match[0])
        } catch {
          return NextResponse.json({ error: "Não foi possível processar a sugestão" }, { status: 500 })
        }
      } else {
        return NextResponse.json({ error: "Não foi possível processar a sugestão" }, { status: 500 })
      }
    }

    return NextResponse.json(suggestion)
  } catch (error: any) {
    console.error("Erro na sugestão de IA:", error?.message ?? error)
    const msg = error?.message?.includes("API key")
      ? "Chave de API inválida"
      : error?.message?.includes("model")
      ? "Modelo não disponível"
      : "Erro interno"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
