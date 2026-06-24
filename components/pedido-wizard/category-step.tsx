"use client"

import Image from "next/image"
import { Check } from "lucide-react"
import { categoryVisuals } from "@/lib/category-visuals"
import { serviceCategories } from "@/lib/service-options"

type Props = {
  selected: string
  onSelect: (name: string) => void
}

export function CategoryStep({ selected, onSelect }: Props) {
  const categories = serviceCategories.map((cat) => {
    const visual = categoryVisuals.find((v) => v.name === cat.name)
    return { ...cat, visual }
  })

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Qual tipo de projeto?
        </h2>
        <p className="mt-2 text-gray-500">
          Escolha a categoria que melhor descreve o que você precisa produzir
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {categories.map((cat) => {
          const isSelected = selected === cat.name
          const imageUrl = cat.visual?.imageUrl
          const gradient = cat.visual?.gradient ?? "from-gray-950/80"

          return (
            <button
              key={cat.name}
              type="button"
              onClick={() => onSelect(cat.name)}
              className={`group relative overflow-hidden rounded-2xl text-left transition-all duration-300 ${
                isSelected
                  ? "ring-2 ring-gray-900 ring-offset-2 shadow-xl scale-[1.02]"
                  : "hover:shadow-xl hover:-translate-y-1 hover:ring-1 hover:ring-gray-200"
              }`}
              style={{ aspectRatio: "16/10" }}
            >
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900" />
              )}

              <div className={`absolute inset-0 bg-gradient-to-t ${gradient} via-black/20 to-transparent`} />

              <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-6">
                <span className="text-3xl mb-2 drop-shadow-lg">{cat.icon}</span>
                <p className="text-lg font-bold text-white drop-shadow-md leading-tight">
                  {cat.name}
                </p>
                {cat.visual?.description && (
                  <p className="mt-1 text-sm text-white/80">{cat.visual.description}</p>
                )}
              </div>

              {isSelected && (
                <div className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-lg">
                  <Check className="h-5 w-5 text-gray-900" />
                </div>
              )}

              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <span className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-gray-900 shadow-xl">
                  Selecionar →
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
