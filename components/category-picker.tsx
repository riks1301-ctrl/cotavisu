"use client"

import Image from "next/image"
import { Check } from "lucide-react"
import { serviceCategories } from "@/lib/service-options"
import { getCategoryVisual } from "@/lib/category-visuals"
import { type } from "@/lib/typography"

type Props = {
  selected: string
  onSelect: (name: string) => void
}

export function CategoryPicker({ selected, onSelect }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {serviceCategories.map((cat) => {
        const visual = getCategoryVisual(cat.name)
        const isSelected = selected === cat.name

        return (
          <button
            key={cat.name}
            type="button"
            onClick={() => onSelect(cat.name)}
            className={`group relative overflow-hidden rounded-2xl text-left shadow-sm transition-all ${
              isSelected
                ? "ring-2 ring-blue-600 ring-offset-2 shadow-md"
                : "hover:shadow-lg hover:-translate-y-0.5"
            }`}
            style={{ aspectRatio: "4/3" }}
          >
            {visual ? (
              <Image
                src={visual.imageUrl}
                alt={cat.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, 33vw"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-600 to-gray-800" />
            )}

            <div
              className={`absolute inset-0 bg-gradient-to-t ${
                visual?.gradient ?? "from-gray-950/80"
              } via-black/25 to-transparent`}
            />

            <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-5">
              <span className="text-3xl mb-2 drop-shadow">{cat.icon}</span>
              <p className={`font-bold text-white ${type.cardTitle} leading-tight drop-shadow`}>
                {cat.name}
              </p>
              {visual?.description && (
                <p className={`mt-1 ${type.caption} text-white/90 drop-shadow hidden sm:block`}>
                  {visual.description}
                </p>
              )}
            </div>

            {isSelected && (
              <div className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow">
                <Check className="h-4 w-4 text-blue-600" />
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}
