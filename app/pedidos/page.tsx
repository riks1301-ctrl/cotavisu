import { ButtonLink } from "@/components/ui/button-link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Clock, MapPin, Package, Plus, Search } from "lucide-react"
import { getServiceRequests, getCategories } from "@/lib/db"

export const revalidate = 30

export default async function PedidosPage() {
  const [requests, categories] = await Promise.all([
    getServiceRequests(),
    getCategories(),
  ])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pedidos abertos</h1>
          <p className="text-gray-500">Fornecedores: envie sua proposta nos pedidos abaixo</p>
        </div>
        <ButtonLink href="/pedidos/novo">
          <Plus className="mr-2 h-4 w-4" /> Criar pedido
        </ButtonLink>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input className="pl-9" placeholder="Buscar por serviço ou cidade..." />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.slice(0, 4).map((cat) => (
            <Badge key={cat.id} variant="outline" className="cursor-pointer hover:bg-blue-50 hover:border-blue-300">
              {cat.icon} {cat.name}
            </Badge>
          ))}
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="py-20 text-center text-gray-400">
          <Package className="mx-auto mb-3 h-12 w-12 opacity-30" />
          <p className="mb-2 text-lg font-medium">Nenhum pedido aberto no momento.</p>
          <p className="mb-6 text-sm">Seja o primeiro a criar um pedido e receber propostas.</p>
          <ButtonLink href="/pedidos/novo">
            <Plus className="mr-2 h-4 w-4" /> Criar pedido
          </ButtonLink>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {requests.map((req) => (
            <Card key={req.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">{req.category}</Badge>
                  <span className="text-xs text-gray-400">
                    {new Date(req.expires_at).toLocaleDateString("pt-BR")}
                  </span>
                </div>

                <h3 className="mb-1 text-base font-semibold">{req.service_type}</h3>
                {req.material && <p className="mb-1 text-sm text-gray-500">{req.material}</p>}

                <div className="mb-4 mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <Package className="h-3 w-3" />
                    {req.width_m}m × {req.height_m}m · {req.quantity}un
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {req.city}/{req.state}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Prazo: {req.deadline_days} dias
                  </div>
                </div>

                {req.description && (
                  <p className="mb-4 text-xs text-gray-400 line-clamp-2">{req.description}</p>
                )}

                <div className="flex gap-2">
                  <ButtonLink href={`/pedidos/${req.id}`} className="flex-1" size="sm" variant="outline">
                    Ver detalhes
                  </ButtonLink>
                  <ButtonLink href={`/pedidos/${req.id}#proposta`} className="flex-1" size="sm">
                    Enviar proposta
                  </ButtonLink>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
