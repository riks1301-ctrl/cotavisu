import Link from "next/link";
import { ButtonLink } from "@/components/ui/button-link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, CheckCircle, Clock, Star, TrendingDown, Zap } from "lucide-react";
import { getCategories, getServiceRequests } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import { UrgencyBar } from "@/components/urgency-bar";
import { TrustSection } from "@/components/trust-badges";
import { CategoryCards } from "@/components/category-cards";
import { layout, type } from "@/lib/typography";

export const revalidate = 60

export default async function Home() {
  const [categories, requests, suppliersRes, proposalsRes, reviewsRes] = await Promise.all([
    getCategories(),
    getServiceRequests(),
    supabase.from("supplier_profiles").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("proposals").select("price_total"),
    supabase.from("reviews").select("rating"),
  ])

  const recent = requests.slice(0, 3)

  const totalSuppliers = suppliersRes.count ?? 0
  const proposalsList = proposalsRes.data ?? []
  const totalNegotiated = proposalsList.reduce((acc, p) => acc + (p.price_total ?? 0), 0)
  const reviewsList = reviewsRes.data ?? []
  const avgRating = reviewsList.length > 0
    ? (reviewsList.reduce((acc, r) => acc + r.rating, 0) / reviewsList.length).toFixed(1)
    : null

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 section-y text-white">
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-blue-300/20 blur-3xl" />
        </div>
        <div className={`${layout.container} relative text-center`}>
          <Badge className="mb-8 bg-white/20 px-5 py-2 text-[18px] text-white hover:bg-white/20 backdrop-blur">
            Plataforma beta — cadastro gratuito
          </Badge>
          <h1 className={`${type.hero} mb-8 text-white`}>
            Compare orçamentos de<br />
            <span className="text-blue-200">comunicação visual</span>
          </h1>
          <p className={`${type.heroSub} mx-auto mb-12 max-w-3xl text-blue-50`}>
            Crie um pedido, compare propostas reais de gráficas da sua região e escolha
            o melhor preço ou prazo — a negociação segue direto com quem você escolher.
          </p>
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-center">
            <ButtonLink href="/pedidos/novo" size="lg" className="min-w-[280px] bg-white text-blue-800 shadow-xl hover:bg-blue-50">
              Criar pedido grátis <ArrowRight className="ml-2 h-6 w-6" />
            </ButtonLink>
            <ButtonLink href="/pedidos" size="lg" variant="outline" className="min-w-[280px] border-2 border-white/40 text-white hover:bg-white/10">
              Ver pedidos abertos
            </ButtonLink>
          </div>
          <p className={`mt-8 ${type.body} text-blue-100`}>
            Ver pedidos abertos sem cadastro. Login gratuito para publicar e escolher propostas.
          </p>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            {[
              "📊 Compare preços lado a lado",
              "🔒 Dados protegidos (LGPD)",
              "💬 Feche no WhatsApp",
              "🆓 Grátis para quem pede",
            ].map((item) => (
              <span key={item} className={`rounded-full bg-white/15 px-6 py-3 ${type.body} text-white backdrop-blur`}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Cards visuais de categoria */}
      <CategoryCards />

      {/* Barra de urgência */}
      <section className="border-b py-5">
        <div className={layout.container}>
          <UrgencyBar />
        </div>
      </section>

      <section className="border-b bg-white py-12">
        <div className={layout.container}>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            <div className="text-center">
              <p className="text-4xl font-extrabold text-blue-600 lg:text-5xl">
                {totalSuppliers > 0 ? totalSuppliers : "—"}
              </p>
              <p className={`mt-2 ${type.label} text-gray-700`}>Gráficas cadastradas</p>
              <p className={type.caption}>na plataforma</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-extrabold text-blue-600 lg:text-5xl">Brasil</p>
              <p className={`mt-2 ${type.label} text-gray-700`}>Atendimento nacional</p>
              <p className={type.caption}>todas as regiões</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-extrabold text-blue-600 lg:text-5xl">
                {totalNegotiated > 0 ? `R$ ${(totalNegotiated / 1000).toFixed(0)}k+` : "R$ 0"}
              </p>
              <p className={`mt-2 ${type.label} text-gray-700`}>Em orçamentos</p>
              <p className={type.caption}>solicitados na plataforma</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <p className="text-4xl font-extrabold text-blue-600 lg:text-5xl">{avgRating ?? "—"}</p>
                {avgRating && <Star className="h-8 w-8 fill-yellow-400 text-yellow-400" />}
              </div>
              <p className={`mt-2 ${type.label} text-gray-700`}>Avaliação média</p>
              <p className={type.caption}>
                {reviewsList.length > 0 ? `${reviewsList.length} avaliações` : "em breve"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-y">
        <div className={layout.container}>
          <div className="mb-12 text-center title-gap">
            <h2 className={type.h2}>Como funciona</h2>
            <p className={`mt-4 ${type.subtitle} text-gray-500`}>Três passos simples para o melhor orçamento</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              { step: "1", icon: <Zap className="h-8 w-8 text-blue-600" />, title: "Crie seu pedido", desc: "Descreva o serviço, medidas e cidade. Login gratuito para publicar." },
              { step: "2", icon: <Clock className="h-8 w-8 text-green-600" />, title: "Receba propostas", desc: "Gráficas da sua região enviam preço, prazo e condições reais." },
              { step: "3", icon: <CheckCircle className="h-8 w-8 text-purple-600" />, title: "Compare e escolha", desc: "Veja lado a lado e feche no WhatsApp com a gráfica escolhida." },
            ].map((item) => (
              <div key={item.step} className="relative rounded-2xl border bg-white p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="absolute -top-5 left-8 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
                  {item.step}
                </div>
                <div className="mb-4 mt-3">{item.icon}</div>
                <h3 className={`mb-3 ${type.cardTitle}`}>{item.title}</h3>
                <p className={type.cardDesc}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 section-y">
        <div className={layout.container}>
          <div className="mb-12 text-center">
            <h2 className={type.h2}>Categorias de serviço</h2>
            <p className={`mt-4 ${type.subtitle} text-gray-500`}>Tudo para comunicação visual em um só lugar</p>
          </div>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/pedidos?categoria=${cat.slug}`}
                className="flex flex-col items-center gap-3 rounded-2xl border bg-white p-6 text-center shadow-sm transition-all hover:border-blue-300 hover:shadow-lg hover:-translate-y-0.5"
              >
                <span className="text-4xl">{cat.icon}</span>
                <span className={`${type.label} text-gray-700`}>{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-y">
        <div className={layout.container}>
          <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className={type.h2}>Pedidos abertos</h2>
              <p className={`mt-3 ${type.subtitle} text-gray-500`}>Fornecedores: veja os pedidos aguardando proposta</p>
            </div>
            <ButtonLink href="/pedidos" variant="outline">
              Ver todos <ArrowRight className="ml-2 h-5 w-5" />
            </ButtonLink>
          </div>

          {recent.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 py-20 text-center text-gray-400">
              <p className={`mb-4 ${type.subtitle}`}>Nenhum pedido aberto ainda.</p>
              <ButtonLink href="/pedidos/novo">Criar o primeiro pedido</ButtonLink>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {recent.map((req) => (
                <Card key={req.id}>
                  <CardContent>
                    <div className="mb-4 flex items-start justify-between">
                      <Badge variant="secondary">{req.category}</Badge>
                      <span className={type.caption}>{req.city}/{req.state}</span>
                    </div>
                    <h3 className={`mb-2 ${type.cardTitle}`}>{req.service_type}</h3>
                    <p className={`mb-4 ${type.cardDesc}`}>
                      {req.width_m && req.height_m ? `${req.width_m}m × ${req.height_m}m · ` : ""}
                      {req.quantity} {req.quantity > 1 ? "unidades" : "unidade"}
                    </p>
                    <div className={`mb-5 flex items-center gap-2 ${type.caption}`}>
                      <Clock className="h-4 w-4" />
                      <span>Prazo: {req.deadline_days} dias</span>
                    </div>
                    <ButtonLink href={`/pedidos/${req.id}`} className="w-full" variant="outline">
                      Ver pedido
                    </ButtonLink>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-blue-600 section-y text-white">
        <div className={layout.container}>
          <div className="grid gap-10 sm:grid-cols-3">
            {[
              { icon: <TrendingDown className="h-10 w-10 text-blue-200" />, title: "Redução de custos", desc: "Compradores economizam ao comparar múltiplas propostas lado a lado." },
              { icon: <Clock className="h-10 w-10 text-blue-200" />, title: "Menos tempo perdido", desc: "Chega de ligar pra vários fornecedores. Receba todas as propostas em um lugar." },
              { icon: <Star className="h-10 w-10 text-blue-200" />, title: "Intermediação transparente", desc: "Comparamos orçamentos. A venda e o pagamento são diretos com a gráfica que você escolher." },
            ].map((b) => (
              <div key={b.title} className="text-center">
                <div className="mb-4 flex justify-center">{b.icon}</div>
                <h3 className={`mb-3 ${type.cardTitle} text-white`}>{b.title}</h3>
                <p className="type-body text-blue-100">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seção de confiança */}
      <TrustSection />

      <section className="section-y">
        <div className={`${layout.container} text-center`}>
          <h2 className={`mb-6 ${type.h2}`}>Pronto para começar?</h2>
          <p className={`mb-10 ${type.subtitle} text-gray-500`}>Crie seu primeiro pedido agora e receba propostas de fornecedores.</p>
          <ButtonLink href="/pedidos/novo" size="lg">
            Criar pedido grátis <ArrowRight className="ml-2 h-5 w-5" />
          </ButtonLink>
        </div>
      </section>
    </div>
  )
}
