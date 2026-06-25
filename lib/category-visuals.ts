export type CategoryVisual = {
  name: string
  description: string
  imageUrl: string
  gradient: string
}

/** Visuals keyed by `serviceCategories[].name` */
export const categoryVisuals: CategoryVisual[] = [
  {
    name: "PDV — Materiais de Loja",
    description: "Wobbler, totem, display e mais",
    imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
    gradient: "from-indigo-950/80",
  },
  {
    name: "Adesivos",
    description: "Adesivos e envelopamento",
    imageUrl: "https://images.unsplash.com/photo-1611532736596-66f1c05583be?w=800&q=80",
    gradient: "from-violet-950/80",
  },
  {
    name: "Banners e Lonas",
    description: "Banners para eventos e fachadas",
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
    gradient: "from-blue-950/80",
  },
  {
    name: "Fachadas e ACM",
    description: "Placas, ACM e identidade visual",
    imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
    gradient: "from-slate-950/85",
  },
  {
    name: "Plotagem",
    description: "Recorte, vinil e plantas técnicas",
    imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80",
    gradient: "from-zinc-950/80",
  },
  {
    name: "Luminosos",
    description: "Painéis e caixas de luz",
    imageUrl: "https://images.unsplash.com/photo-1513828583688-c52646db42da?w=800&q=80",
    gradient: "from-amber-950/75",
  },
  {
    name: "Impressão Digital",
    description: "Papel, rígidos e grandes formatos",
    imageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80",
    gradient: "from-neutral-950/80",
  },
]

export function getCategoryVisual(name: string): CategoryVisual | undefined {
  return categoryVisuals.find((c) => c.name === name)
}
