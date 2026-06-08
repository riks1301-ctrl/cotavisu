import Link from "next/link"

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
    <section className="px-4 py-12 sm:px-6 lg:px-8 bg-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              O que você precisa fazer?
            </h2>
            <p className="mt-1 text-gray-500">
              Clique na categoria e receba orçamentos de fornecedores na sua região
            </p>
          </div>
          <Link
            href="/pedidos/novo"
            className="hidden text-sm font-medium text-blue-600 hover:underline sm:block"
          >
            Ver todos →
          </Link>
        </div>

        {/* Grid de cards com imagem */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/pedidos/novo?categoria=${cat.slug}`}
              className="group relative overflow-hidden rounded-2xl shadow-sm transition-all hover:shadow-lg hover:-translate-y-0.5"
              style={{ aspectRatio: "4/3" }}
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
              <div className="absolute inset-0 flex flex-col justify-end p-3">
                <p className="font-bold text-white leading-tight text-sm sm:text-base drop-shadow">
                  {cat.name}
                </p>
                <p className="mt-0.5 text-xs text-white/80 drop-shadow hidden sm:block">
                  {cat.description}
                </p>
              </div>

              {/* Badge "Pedir orçamento" no hover */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                <span className="rounded-full bg-white px-4 py-1.5 text-xs font-bold text-gray-900 shadow-lg">
                  Pedir orçamento →
                </span>
              </div>
            </Link>
          ))}

          {/* Card especial — Ver todos */}
          <Link
            href="/pedidos/novo"
            className="group relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50 transition-all hover:border-blue-500 hover:bg-blue-100"
            style={{ aspectRatio: "4/3" }}
          >
            <span className="text-3xl mb-2">➕</span>
            <p className="font-bold text-blue-700 text-sm">Outro serviço</p>
            <p className="mt-0.5 text-xs text-blue-500">Criar pedido personalizado</p>
          </Link>
        </div>

        {/* CTA mobile */}
        <div className="mt-4 text-center sm:hidden">
          <Link href="/pedidos/novo" className="text-sm font-medium text-blue-600 hover:underline">
            Ver todos os serviços →
          </Link>
        </div>
      </div>
    </section>
  )
}
