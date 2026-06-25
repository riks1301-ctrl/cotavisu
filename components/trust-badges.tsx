import { BadgeCheck, Clock, Shield, Star, ThumbsUp, Users } from "lucide-react"
import { layout, type } from "@/lib/typography"

export function TrustSection() {
  return (
    <section className="border-t bg-white section-y">
      <div className={layout.container}>
        <div className="mb-12 text-center">
          <h2 className={type.h2}>Por que confiar no CotaVisu?</h2>
          <p className={`mt-4 ${type.subtitle} text-gray-500`}>
            Cada pedido é protegido. Comparamos — você decide com quem fechar.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {[
            {
              border: "border-blue-100 bg-blue-50",
              iconBg: "bg-blue-600",
              icon: <BadgeCheck className="h-8 w-8 text-white" />,
              title: "Perfis completos",
              desc: "Cada fornecedor cadastra seus serviços, região de atendimento e recebe avaliações reais de clientes que já fecharam negócio.",
              badge: "Avaliações reais",
              badgeClass: "bg-blue-100 text-blue-700",
              badgeIcon: <BadgeCheck className="h-4 w-4" />,
            },
            {
              border: "border-yellow-100 bg-yellow-50",
              iconBg: "bg-yellow-500",
              icon: <Star className="h-8 w-8 text-white" />,
              title: "Avaliações reais",
              desc: "Só quem realmente fechou negócio pode avaliar. Sem estrelas compradas, sem reviews falsos — apenas experiências reais.",
              badge: "100% reais",
              badgeClass: "bg-yellow-100 text-yellow-700",
              badgeIcon: <ThumbsUp className="h-4 w-4" />,
            },
            {
              border: "border-green-100 bg-green-50",
              iconBg: "bg-green-600",
              icon: <Shield className="h-8 w-8 text-white" />,
              title: "Seus dados protegidos",
              desc: "Seus dados nunca são compartilhados sem sua permissão. Plataforma em conformidade com a LGPD.",
              badge: "LGPD",
              badgeClass: "bg-green-100 text-green-700",
              badgeIcon: <Shield className="h-4 w-4" />,
            },
          ].map((item) => (
            <div key={item.title} className={`rounded-2xl border p-8 text-center ${item.border}`}>
              <div className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full ${item.iconBg}`}>
                {item.icon}
              </div>
              <h3 className={`mb-3 ${type.cardTitle}`}>{item.title}</h3>
              <p className={type.cardDesc}>{item.desc}</p>
              <div className={`mt-5 inline-flex items-center gap-2 rounded-full px-4 py-2 ${type.caption} font-medium ${item.badgeClass}`}>
                {item.badgeIcon} {item.badge}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border bg-gray-50 p-8">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {[
              { icon: <Users className="h-6 w-6 text-blue-600" />, value: "100%", label: "Gratuito para compradores" },
              { icon: <BadgeCheck className="h-6 w-6 text-green-600" />, value: "Real", label: "Propostas de gráficas" },
              { icon: <Star className="h-6 w-6 text-yellow-500" />, value: "Compare", label: "Preço e prazo" },
              { icon: <Clock className="h-6 w-6 text-purple-600" />, value: "WhatsApp", label: "Após escolher" },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div className="mb-2 flex justify-center">{item.icon}</div>
                <p className={`${type.cardTitle} text-gray-900`}>{item.value}</p>
                <p className={type.caption}>{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function VerifiedBadge({ size = "sm" }: { size?: "sm" | "md" }) {
  if (size === "md") return (
    <span className={`inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 ${type.caption} font-semibold text-blue-700`}>
      <BadgeCheck className="h-4 w-4" /> Verificado
    </span>
  )
  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 ${type.caption} font-medium text-blue-600`}>
      <BadgeCheck className="h-3.5 w-3.5" /> Verificado
    </span>
  )
}

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
  const sizeMap = { sm: "h-4 w-4", md: "h-5 w-5", lg: "h-6 w-6" }
  const textMap = { sm: type.caption, md: type.body, lg: type.nav }

  if (reviews === 0) {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 ${textMap[size]} text-gray-500`}>
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
      {showCount && <span className="text-gray-400">({reviews})</span>}
    </span>
  )
}
