import Link from "next/link"
import { layout, type } from "@/lib/typography"

type CategoryCard = {
  name: string
  slug: string
  description: string
  imageUrl: string
  color: string
}

const categories: CategoryCard[] = [
  {
    name: "Fachada em ACM",
    slug: "fachadas-acm",
    description: "Placas e painéis para lojas",
    imageUrl: "/images/fachada-acm.png",
    color: "from-blue-900/70",
  },
  {
    name: "Letra Caixa",
    slug: "luminosos-letras",
    description: "Letras iluminadas e luminosos",
    imageUrl: "/images/letra-caixa.png",
    color: "from-slate-900/60",
  },
  {
    name: "Banners e Lonas",
    slug: "banners-lonas",
    description: "Banners para eventos e fachadas",
    imageUrl: "/images/banner.png",
    color: "from-blue-800/70",
  },
  {
    name: "Adesivos",
    slug: "adesivos",
    description: "Adesivos e envelopamento",
    imageUrl: "/images/adesivos.png",
    color: "from-blue-700/60",
  },
  {
    name: "PDV — Materiais de Loja",
    slug: "pdv",
    description: "Wobbler, totem, display e mais",
    imageUrl: "/images/pdv.png",
    color: "from-blue-900/70",
  },
  {
    name: "Luminosos",
    slug: "luminosos",
    description: "Painéis e caixas de luz",
    imageUrl: "/images/luminosos.png",
    color: "from-slate-900/70",
  },
  {
    name: "Impressão Digital",
    slug: "impressao-digital",
    description: "Impressão em papel e rígidos",
    imageUrl: "/images/impressao.png",
    color: "from-blue-900/60",
  },
]

export function CategoryCards() {
  return (
    <section className="section-y bg-white">
      <div className={layout.container}>
        <div className="mb-12 flex items-end justify-between">
          <div>
            <h2 className={type.h2}>O que você precisa fazer?</h2>
            <p className={`mt-4 ${type.subtitle} text-gray-500`}>
              Clique na categoria e receba orçamentos de fornecedores na sua região
            </p>
          </div>
          <Link
            href="/pedidos/novo"
            className={`hidden ${type.nav} text-blue-600 hover:underline sm:block`}
          >
            Ver todos →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/pedidos/novo?categoria=${cat.slug}`}
              className="group relative overflow-hidden rounded-2xl shadow-lg transition-all hover:shadow-2xl hover:-translate-y-1"
              style={{ aspectRatio: "5/4" }}
            >
              {/* Imagem de fundo */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cat.imageUrl}
                alt={cat.name}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />

              {/* Gradiente escuro */}
              <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} to-black/10`} />

              {/* Conteúdo */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
                <p className={`${type.cardTitle} text-white drop-shadow leading-tight`}>
                  {cat.name}
                </p>
                <p className={`mt-1 ${type.cardDesc} text-white/90 drop-shadow hidden sm:block`}>
                  {cat.description}
                </p>
              </div>

              {/* Badge "Pedir orçamento" no hover */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                <span className={`rounded-full bg-white px-5 py-2 ${type.caption} font-bold text-gray-900 shadow-lg`}>
                  Pedir orçamento →
                </span>
              </div>
            </Link>
          ))}

          {/* Card especial — Ver todos */}
          <Link
            href="/pedidos/novo"
            className="group relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50 transition-all hover:border-blue-500 hover:bg-blue-100"
            style={{ aspectRatio: "5/4" }}
          >
            <span className="text-3xl mb-2">➕</span>
            <p className={`font-bold text-blue-700 ${type.nav}`}>Outro serviço</p>
            <p className={`mt-1 ${type.caption} text-blue-500`}>Criar pedido personalizado</p>
          </Link>
        </div>

        {/* CTA mobile */}
        <div className="mt-4 text-center sm:hidden">
          <Link href="/pedidos/novo" className={`${type.nav} font-medium text-blue-600 hover:underline`}>
            Ver todos os serviços →
          </Link>
        </div>
      </div>
    </section>
  )
}
