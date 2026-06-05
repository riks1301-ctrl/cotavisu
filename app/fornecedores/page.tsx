import { ButtonLink } from "@/components/ui/button-link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MapPin, Search } from "lucide-react"
import { StarRating, VerifiedBadge } from "@/components/trust-badges"

const suppliers = [
  { id: "f1", name: "GráficaPrint SP", city: "São Paulo", state: "SP", services: ["Banners", "Adesivos", "Plotagem"], rating: 4.8, reviews: 127, isPremium: true, description: "Especialistas em impressão digital de alta qualidade. Entregamos para todo o estado de SP." },
  { id: "f2", name: "Visual Comunicação", city: "Campinas", state: "SP", services: ["Fachadas", "ACM", "Luminosos"], rating: 4.5, reviews: 43, isPremium: false, description: "15 anos de experiência em fachadas comerciais e comunicação visual externa." },
  { id: "f3", name: "BannerFlex", city: "São Paulo", state: "SP", services: ["Banners", "Lonas", "Eventos"], rating: 0, reviews: 0, isPremium: false, description: "Empresa nova especializada em materiais para eventos e feiras." },
  { id: "f4", name: "SignPro Belo Horizonte", city: "Belo Horizonte", state: "MG", services: ["ACM", "Letras Caixa", "Luminosos"], rating: 4.9, reviews: 88, isPremium: true, description: "Referência em BH para fachadas e letreiros. Atendemos todo o estado de MG." },
]

export default function FornecedoresPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Fornecedores</h1>
        <p className="text-gray-500">Encontre empresas verificadas de comunicação visual</p>
      </div>

      <div className="mb-6 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input className="pl-9" placeholder="Buscar por nome, cidade ou serviço..." />
        </div>
        <Button variant="outline">Filtrar</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {suppliers.map((s) => (
          <Card key={s.id} className={`hover:shadow-md transition-shadow ${s.isPremium ? "border-blue-200" : ""}`}>
            <CardContent className="p-5">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-lg font-bold text-blue-600">
                  {s.name[0]}
                </div>
                <div className="flex gap-1">
                  {s.reviews === 0 && <Badge variant="outline" className="text-xs">Novo</Badge>}
                </div>
              </div>

              <div className="mb-1 flex items-center gap-2">
                <h3 className="font-semibold">{s.name}</h3>
                {s.isPremium && <VerifiedBadge />}
              </div>

              <div className="mb-2 flex items-center gap-1 text-xs text-gray-500">
                <MapPin className="h-3 w-3" />{s.city}/{s.state}
              </div>

              <div className="mb-2">
                <StarRating rating={s.rating} reviews={s.reviews} size="sm" />
              </div>

              <p className="mb-3 text-xs text-gray-500 line-clamp-2">{s.description}</p>

              <div className="mb-4 flex flex-wrap gap-1">
                {s.services.map((svc) => (
                  <Badge key={svc} variant="secondary" className="text-xs">{svc}</Badge>
                ))}
              </div>

              <ButtonLink href={`/fornecedores/${s.id}`} className="w-full" size="sm" variant="outline">
                Ver perfil
              </ButtonLink>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
