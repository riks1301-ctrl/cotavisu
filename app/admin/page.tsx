"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { buttonVariants } from "@/components/ui/button"
import { Edit, LayoutDashboard, Loader2, Package, Plus, Settings, ShoppingBag, ToggleLeft, ToggleRight, Trash2, Users } from "lucide-react"
import { supabase } from "@/lib/supabase"

type Service = { id: string; name: string; base_price: number; avg_days: number; unit: string; is_active: boolean; service_categories: { name: string } | null }
type Product = { id: string; name: string; avg_price: number; unit: string; is_active: boolean; supplier_name: string | null; service_categories: { name: string } | null }
type Stats = { totalRequests: number; totalProposals: number; totalSuppliers: number; totalUsers: number; requestsToday: number; activeServices: number }

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
        {sub && <p className="text-xs text-green-600">{sub}</p>}
      </CardContent>
    </Card>
  )
}

export default function AdminPage() {
  const [services, setServices] = useState<Service[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [newService, setNewService] = useState({ name: "", base_price: "", avg_days: "3", unit: "m2" })
  const [newProduct, setNewProduct] = useState({ name: "", avg_price: "", unit: "m2", supplier_name: "" })

  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    setLoading(true)
    const [svcRes, prodRes, reqRes, propRes, suppRes] = await Promise.all([
      supabase.from("standard_services").select("*, service_categories(name)").order("name"),
      supabase.from("shelf_products").select("*, service_categories(name)").order("name"),
      supabase.from("service_requests").select("id", { count: "exact", head: true }),
      supabase.from("proposals").select("id", { count: "exact", head: true }),
      supabase.from("supplier_profiles").select("id", { count: "exact", head: true }),
    ])
    setServices(svcRes.data ?? [])
    setProducts(prodRes.data ?? [])
    setStats({
      totalRequests: reqRes.count ?? 0,
      totalProposals: propRes.count ?? 0,
      totalSuppliers: suppRes.count ?? 0,
      totalUsers: 0,
      requestsToday: 0,
      activeServices: (svcRes.data ?? []).filter((s) => s.is_active).length,
    })
    setLoading(false)
  }

  async function toggleService(id: string, current: boolean) {
    await supabase.from("standard_services").update({ is_active: !current }).eq("id", id)
    setServices((prev) => prev.map((s) => s.id === id ? { ...s, is_active: !current } : s))
  }

  async function toggleProduct(id: string, current: boolean) {
    await supabase.from("shelf_products").update({ is_active: !current }).eq("id", id)
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, is_active: !current } : p))
  }

  async function deleteService(id: string) {
    if (!confirm("Excluir este serviço?")) return
    await supabase.from("standard_services").delete().eq("id", id)
    setServices((prev) => prev.filter((s) => s.id !== id))
  }

  async function deleteProduct(id: string) {
    if (!confirm("Excluir este produto?")) return
    await supabase.from("shelf_products").delete().eq("id", id)
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  async function createService() {
    if (!newService.name || !newService.base_price) return
    const { data } = await supabase
      .from("standard_services")
      .insert({ name: newService.name, base_price: parseFloat(newService.base_price), avg_days: parseInt(newService.avg_days), unit: newService.unit, formula_type: newService.unit === "unit" ? "unit" : "area", is_active: true })
      .select("*, service_categories(name)")
      .single()
    if (data) setServices((prev) => [...prev, data])
    setNewService({ name: "", base_price: "", avg_days: "3", unit: "m2" })
  }

  async function createProduct() {
    if (!newProduct.name || !newProduct.avg_price) return
    const { data } = await supabase
      .from("shelf_products")
      .insert({ name: newProduct.name, avg_price: parseFloat(newProduct.avg_price), unit: newProduct.unit, supplier_name: newProduct.supplier_name || null, is_active: true })
      .select("*, service_categories(name)")
      .single()
    if (data) setProducts((prev) => [...prev, data])
    setNewProduct({ name: "", avg_price: "", unit: "m2", supplier_name: "" })
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Painel Admin</h1>
          <p className="text-sm text-gray-500">Gerenciar plataforma e modo prateleira</p>
        </div>
        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
          <Settings className="mr-1 h-3 w-3" /> Administrador
        </Badge>
      </div>

      <Tabs defaultValue="dashboard">
        <TabsList className="mb-6 grid w-full grid-cols-3">
          <TabsTrigger value="dashboard"><LayoutDashboard className="mr-2 h-4 w-4" /><span className="hidden sm:inline">Dashboard</span></TabsTrigger>
          <TabsTrigger value="services"><ShoppingBag className="mr-2 h-4 w-4" /><span className="hidden sm:inline">Serviços</span></TabsTrigger>
          <TabsTrigger value="products"><Package className="mr-2 h-4 w-4" /><span className="hidden sm:inline">Produtos</span></TabsTrigger>
        </TabsList>

        {/* Dashboard */}
        <TabsContent value="dashboard">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard label="Total de pedidos" value={stats?.totalRequests ?? 0} />
            <StatCard label="Total de propostas" value={stats?.totalProposals ?? 0} />
            <StatCard label="Fornecedores ativos" value={stats?.totalSuppliers ?? 0} />
            <StatCard label="Serviços padrão ativos" value={services.filter((s) => s.is_active).length} />
            <StatCard label="Produtos de prateleira" value={products.filter((p) => p.is_active).length} />
          </div>
          <div className="mt-8 rounded-xl border bg-blue-50 p-5">
            <h2 className="mb-1 font-semibold text-blue-800">Modo Prateleira</h2>
            <p className="text-sm text-blue-700">
              {services.filter((s) => s.is_active).length} serviços e {products.filter((p) => p.is_active).length} produtos ativos.
              Exibidos automaticamente quando um pedido não tem propostas reais.
            </p>
          </div>
        </TabsContent>

        {/* Serviços */}
        <TabsContent value="services">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Serviços padrão</h2>
              <p className="text-sm text-gray-500">Base de estimativas do modo prateleira</p>
            </div>
            <Dialog>
              <DialogTrigger className={buttonVariants({ size: "sm" })}>
                <Plus className="mr-2 h-4 w-4" /> Novo serviço
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Novo serviço padrão</DialogTitle></DialogHeader>
                <div className="space-y-4 py-2">
                  <div><Label>Nome do serviço</Label><Input placeholder="ex: Banner em Lona 440g" value={newService.name} onChange={(e) => setNewService((p) => ({ ...p, name: e.target.value }))} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Preço base (R$)</Label><Input type="number" placeholder="25.00" value={newService.base_price} onChange={(e) => setNewService((p) => ({ ...p, base_price: e.target.value }))} /></div>
                    <div><Label>Prazo médio (dias)</Label><Input type="number" placeholder="3" value={newService.avg_days} onChange={(e) => setNewService((p) => ({ ...p, avg_days: e.target.value }))} /></div>
                  </div>
                  <Button className="w-full" onClick={createService}>Salvar serviço</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Serviço</th>
                  <th className="px-4 py-3 text-left hidden sm:table-cell">Categoria</th>
                  <th className="px-4 py-3 text-right">Preço base</th>
                  <th className="px-4 py-3 text-right hidden sm:table-cell">Prazo</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {services.map((s) => (
                  <tr key={s.id} className={`hover:bg-gray-50 ${!s.is_active ? "opacity-50" : ""}`}>
                    <td className="px-4 py-3 font-medium">{s.name}</td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                      {s.service_categories && <Badge variant="secondary" className="text-xs">{s.service_categories.name}</Badge>}
                    </td>
                    <td className="px-4 py-3 text-right font-mono">R$ {s.base_price}/{s.unit}</td>
                    <td className="px-4 py-3 text-right text-gray-500 hidden sm:table-cell">{s.avg_days}d</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => toggleService(s.id, s.is_active)}>
                        {s.is_active ? <ToggleRight className="h-5 w-5 text-green-500 mx-auto" /> : <ToggleLeft className="h-5 w-5 text-gray-400 mx-auto" />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Edit className="h-3.5 w-3.5" /></Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-400 hover:text-red-600" onClick={() => deleteService(s.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Produtos */}
        <TabsContent value="products">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Produtos de prateleira</h2>
              <p className="text-sm text-gray-500">Insumos com preço médio de referência</p>
            </div>
            <Dialog>
              <DialogTrigger className={buttonVariants({ size: "sm" })}>
                <Plus className="mr-2 h-4 w-4" /> Novo produto
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Novo produto de prateleira</DialogTitle></DialogHeader>
                <div className="space-y-4 py-2">
                  <div><Label>Nome do produto</Label><Input placeholder="ex: Vinil Adesivo Branco Fosco" value={newProduct.name} onChange={(e) => setNewProduct((p) => ({ ...p, name: e.target.value }))} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Preço médio (R$)</Label><Input type="number" placeholder="18.00" value={newProduct.avg_price} onChange={(e) => setNewProduct((p) => ({ ...p, avg_price: e.target.value }))} /></div>
                    <div><Label>Unidade</Label><Input placeholder="m², kg, rolo..." value={newProduct.unit} onChange={(e) => setNewProduct((p) => ({ ...p, unit: e.target.value }))} /></div>
                  </div>
                  <div><Label>Fornecedor (opcional)</Label><Input placeholder="Nome do fornecedor" value={newProduct.supplier_name} onChange={(e) => setNewProduct((p) => ({ ...p, supplier_name: e.target.value }))} /></div>
                  <Button className="w-full" onClick={createProduct}>Salvar produto</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Produto</th>
                  <th className="px-4 py-3 text-right">Preço médio</th>
                  <th className="px-4 py-3 text-left hidden sm:table-cell">Fornecedor</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((p) => (
                  <tr key={p.id} className={`hover:bg-gray-50 ${!p.is_active ? "opacity-50" : ""}`}>
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-right font-mono">R$ {p.avg_price}/{p.unit}</td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                      {p.supplier_name ?? <span className="italic text-gray-300">Referência mercado</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => toggleProduct(p.id, p.is_active)}>
                        {p.is_active ? <ToggleRight className="h-5 w-5 text-green-500 mx-auto" /> : <ToggleLeft className="h-5 w-5 text-gray-400 mx-auto" />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Edit className="h-3.5 w-3.5" /></Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-400 hover:text-red-600" onClick={() => deleteProduct(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

      </Tabs>
    </div>
  )
}
