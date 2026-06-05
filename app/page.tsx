import Link from "next/link";
import { ButtonLink } from "@/components/ui/button-link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, CheckCircle, Clock, Star, TrendingDown, Zap } from "lucide-react";
import { getCategories, getServiceRequests } from "@/lib/db";
import { UrgencyBar } from "@/components/urgency-bar";

export const revalidate = 60

export default async function Home() {
  const [categories, requests] = await Promise.all([
    getCategories(),
    getServiceRequests(),
  ])

  const recent = requests.slice(0, 3)

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 px-4 py-20 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <Badge className="mb-4 bg-blue-500 text-white hover:bg-blue-500">
            Plataforma beta — cadastro gratuito
          </Badge>
          <h1 className="mb-6 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Compare orçamentos de<br />
            <span className="text-blue-200">comunicação visual</span>
          </h1>
          <p className="mb-8 text-lg text-blue-100 sm:text-xl">
            Crie um pedido, receba propostas de fornecedores verificados e escolha
            o melhor preço, prazo ou avaliação — tudo em um só lugar.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <ButtonLink href="/pedidos/novo" size="lg" className="bg-white text-blue-700 hover:bg-blue-50">
              Criar pedido grátis <ArrowRight className="ml-2 h-4 w-4" />
            </ButtonLink>
            <ButtonLink href="/pedidos" size="lg" variant="outline" className="border-blue-300 text-white hover:bg-blue-700">
              Ver pedidos abertos
            </ButtonLink>
          </div>
          <p className="mt-4 text-sm text-blue-200">
            Sem cadastro para ver pedidos. Gratuito para compradores.
          </p>
        </div>
      </section>

      {/* Barra de urgência */}
      <section className="border-b px-4 py-3 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <UrgencyBar />
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-b bg-gray-50 px-4 py-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Pedidos abertos", value: requests.length.toString() },
              { label: "Categorias", value: categories.length.toString() },
              { label: "Plataforma", value: "Beta" },
              { label: "Cadastro", value: "Grátis" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-bold text-blue-600">{s.value}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold">Como funciona</h2>
            <p className="mt-2 text-gray-500">Três passos simples para o melhor orçamento</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              { step: "1", icon: <Zap className="h-6 w-6 text-blue-600" />, title: "Crie seu pedido", desc: "Informe o serviço, medidas, quantidade, cidade e prazo desejado. Leva menos de 2 minutos." },
              { step: "2", icon: <Clock className="h-6 w-6 text-green-600" />, title: "Receba propostas", desc: "Fornecedores verificados da sua região enviam propostas com preço, prazo e condições." },
              { step: "3", icon: <CheckCircle className="h-6 w-6 text-purple-600" />, title: "Compare e escolha", desc: "Veja lado a lado: menor preço, menor prazo, melhor avaliação. Escolha com segurança." },
            ].map((item) => (
              <div key={item.step} className="relative rounded-xl border bg-white p-6 shadow-sm">
                <div className="absolute -top-4 left-6 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  {item.step}
                </div>
                <div className="mb-3 mt-2">{item.icon}</div>
                <h3 className="mb-2 font-semibold">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categorias */}
      <section className="bg-gray-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold">Categorias de serviço</h2>
            <p className="mt-2 text-gray-500">Tudo para comunicação visual em um só lugar</p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/pedidos?categoria=${cat.slug}`}
                className="flex flex-col items-center gap-2 rounded-xl border bg-white p-4 text-center shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
              >
                <span className="text-3xl">{cat.icon}</span>
                <span className="text-sm font-medium text-gray-700">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Pedidos recentes */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">Pedidos abertos</h2>
              <p className="mt-1 text-gray-500">Fornecedores: veja os pedidos aguardando proposta</p>
            </div>
            <ButtonLink href="/pedidos" variant="outline">
              Ver todos <ArrowRight className="ml-2 h-4 w-4" />
            </ButtonLink>
          </div>

          {recent.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-gray-200 py-16 text-center text-gray-400">
              <p className="mb-3 text-lg">Nenhum pedido aberto ainda.</p>
              <ButtonLink href="/pedidos/novo">Criar o primeiro pedido</ButtonLink>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recent.map((req) => (
                <Card key={req.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="mb-3 flex items-start justify-between">
                      <Badge variant="secondary" className="text-xs">{req.category}</Badge>
                      <span className="text-xs text-gray-400">{req.city}/{req.state}</span>
                    </div>
                    <h3 className="mb-1 font-semibold">{req.service_type}</h3>
                    <p className="mb-3 text-sm text-gray-500">
                      {req.width_m}m × {req.height_m}m · {req.quantity} {req.quantity > 1 ? "unidades" : "unidade"}
                    </p>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="h-3 w-3" />
                        <span>Prazo: {req.deadline_days} dias</span>
                      </div>
                    </div>
                    <ButtonLink href={`/pedidos/${req.id}`} className="w-full" size="sm" variant="outline">
                      Ver pedido
                    </ButtonLink>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Benefícios */}
      <section className="bg-blue-600 px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              { icon: <TrendingDown className="h-8 w-8 text-blue-200" />, title: "Redução de custos", desc: "Compradores economizam ao comparar múltiplas propostas lado a lado." },
              { icon: <Clock className="h-8 w-8 text-blue-200" />, title: "Menos tempo perdido", desc: "Chega de ligar pra vários fornecedores. Receba todas as propostas em um lugar." },
              { icon: <Star className="h-8 w-8 text-blue-200" />, title: "Fornecedores verificados", desc: "Avaliações reais de clientes. Escolha com confiança, não no escuro." },
            ].map((b) => (
              <div key={b.title} className="text-center">
                <div className="mb-3 flex justify-center">{b.icon}</div>
                <h3 className="mb-2 text-lg font-semibold">{b.title}</h3>
                <p className="text-sm text-blue-100">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold">Pronto para começar?</h2>
          <p className="mb-8 text-gray-500">Crie seu primeiro pedido agora e receba propostas de fornecedores.</p>
          <ButtonLink href="/pedidos/novo" size="lg">
            Criar pedido grátis <ArrowRight className="ml-2 h-4 w-4" />
          </ButtonLink>
        </div>
      </section>
    </div>
  )
}
