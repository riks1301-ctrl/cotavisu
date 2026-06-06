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
    imageUrl: "https://images.unsplash.com/photo-1582407947304-fd86f28f958f?w=400&h=300&fit=crop&q=80",
    color: "from-orange-500/80",
  },
  {
    name: "Letra Caixa",
    slug: "luminosos-letras",
    description: "Letras iluminadas e luminosos",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&q=80",
    color: "from-red-500/80",
  },
  {
    name: "Banners e Lonas",
    slug: "banners-lonas",
    description: "Banners para eventos e fachadas",
    imageUrl: "https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=400&h=300&fit=crop&q=80",
    color: "from-green-600/80",
  },
  {
    name: "Adesivos",
    slug: "adesivos",
    description: "Adesivos e envelopamento",
    imageUrl: "https://images.unsplash.com/photo-1612838320302-4b3b3996e04b?w=400&h=300&fit=crop&q=80",
    color: "from-blue-600/80",
  },
  {
    name: "PDV — Materiais de Loja",
    slug: "pdv",
    description: "Wobbler, totem, display e mais",
    imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop&q=80",
    color: "from-purple-600/80",
  },
  {
    name: "Luminosos",
    slug: "luminosos",
    description: "Painéis e caixas de luz",
    imageUrl: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400&h=300&fit=crop&q=80",
    color: "from-yellow-500/80",
  },
  {
    name: "Impressão Digital",
    slug: "impressao-digital",
    description: "Impressão em papel e rígidos",
    imageUrl: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=300&fit=crop&q=80",
    color: "from-gray-700/80",
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
