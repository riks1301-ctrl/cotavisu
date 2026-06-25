"use client"

import { serviceCategories } from "@/lib/service-options"

type Props = {
  selected: string
  onSelect: (name: string) => void
}

/** Grid compacto com ícones — atalho direto por categoria */
export function CategoryQuickPick({ selected, onSelect }: Props) {
  return (
    <div className="space-y-3">
      <p className="font-medium text-gray-700">Qual tipo de serviço você precisa?</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {serviceCategories.map((cat) => (
          <button
            key={cat.name}
            type="button"
            onClick={() => onSelect(cat.name)}
            className={`flex flex-col items-center gap-1.5 rounded-xl border p-4 text-sm transition-all ${
              selected === cat.name
                ? "border-blue-500 bg-blue-50 text-blue-700 font-medium shadow-sm"
                : "hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            <span className="text-2xl">{cat.icon}</span>
            <span className="leading-tight text-center">{cat.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
