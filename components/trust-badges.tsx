import { BadgeCheck, Clock, Shield, Star, ThumbsUp, Users } from "lucide-react"

export function TrustSection() {
  return (
    <section className="border-t bg-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Headline */}
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Por que confiar no CotaVisu?</h2>
          <p className="mt-2 text-gray-500">Cada pedido é protegido. Cada fornecedor é verificado.</p>
        </div>

        {/* 3 pilares */}
        <div className="grid gap-6 sm:grid-cols-3">

          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600">
              <BadgeCheck className="h-7 w-7 text-white" />
            </div>
            <h3 className="mb-2 font-bold text-gray-900">Fornecedores verificados</h3>
            <p className="text-sm text-gray-600">
              Antes de aparecer na plataforma, cada fornecedor tem CNPJ confirmado e
              passa por validação manual da nossa equipe.
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
              <BadgeCheck className="h-3 w-3" /> Verificação ativa
            </div>
          </div>

          <div className="rounded-2xl border border-yellow-100 bg-yellow-50 p-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-yellow-500">
              <Star className="h-7 w-7 text-white" />
            </div>
            <h3 className="mb-2 font-bold text-gray-900">Avaliações reais</h3>
            <p className="text-sm text-gray-600">
              Só quem realmente fechou negócio pode avaliar. Sem estrelas compradas,
              sem reviews falsos — apenas experiências reais.
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
              <ThumbsUp className="h-3 w-3" /> 100% reais
            </div>
          </div>

          <div className="rounded-2xl border border-green-100 bg-green-50 p-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-600">
              <Shield className="h-7 w-7 text-white" />
            </div>
            <h3 className="mb-2 font-bold text-gray-900">Seus dados protegidos</h3>
            <p className="text-sm text-gray-600">
              Seus dados nunca são compartilhados sem sua permissão.
              Plataforma em conformidade com a LGPD.
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
              <Shield className="h-3 w-3" /> LGPD
            </div>
          </div>

        </div>

        {/* Barra de stats de confiança */}
        <div className="mt-10 rounded-2xl border bg-gray-50 p-6">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              { icon: <Users className="h-5 w-5 text-blue-600" />, value: "100%", label: "Gratuito para compradores" },
              { icon: <BadgeCheck className="h-5 w-5 text-green-600" />, value: "Verificados", label: "Todos os fornecedores" },
              { icon: <Star className="h-5 w-5 text-yellow-500" />, value: "Reais", label: "Avaliações verificadas" },
              { icon: <Clock className="h-5 w-5 text-purple-600" />, value: "24h", label: "Tempo médio de resposta" },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div className="mb-1 flex justify-center">{item.icon}</div>
                <p className="text-lg font-bold text-gray-900">{item.value}</p>
                <p className="text-xs text-gray-500">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}

// Badge inline para usar nos cards de fornecedor/proposta
export function VerifiedBadge({ size = "sm" }: { size?: "sm" | "md" }) {
  if (size === "md") return (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
      <BadgeCheck className="h-3.5 w-3.5" /> Verificado
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
      <BadgeCheck className="h-3 w-3" /> Verificado
    </span>
  )
}

// Stars component reutilizável
export function StarRating({
  rating,
  reviews,
  showCount = true,
  size = "sm",
}: {
  rating: number
  reviews: number
  showCount?: boolean
  size?: "sm" | "md" | "lg"
}) {
  const sizeMap = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }
  const textMap = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  }

  if (reviews === 0) {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 ${textMap[size]} text-gray-500`}>
        Novo fornecedor
      </span>
    )
  }

  return (
    <span className={`inline-flex items-center gap-1 ${textMap[size]}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${sizeMap[size]} ${n <= Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`}
        />
      ))}
      <span className="font-semibold text-gray-800">{rating.toFixed(1)}</span>
      {showCount && (
        <span className="text-gray-400">({reviews})</span>
      )}
    </span>
  )
}
