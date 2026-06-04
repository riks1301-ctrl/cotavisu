"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ButtonLink } from "@/components/ui/button-link"
import { Eye, LayoutDashboard, LogOut, Menu, Package, Plus, X } from "lucide-react"
import { createClient } from "@/lib/supabase-client"
import { signOut } from "@/lib/auth"

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        supabase.from("profiles").select("name,role").eq("id", user.id).single()
          .then(({ data }) => setProfile(data))
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) setProfile(null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    await signOut()
    setUser(null)
    setProfile(null)
    router.push("/")
    router.refresh()
  }

  const navLinks = [
    { href: "/pedidos", label: "Pedidos" },
    { href: "/fornecedores", label: "Fornecedores" },
    ...(profile?.role === "admin" ? [{ href: "/admin", label: "Admin" }] : []),
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <Eye className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">CotaVisu</span>
            <Badge variant="secondary" className="hidden text-xs sm:inline-flex">Beta</Badge>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  pathname.startsWith(link.href) ? "text-blue-600" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <>
                <ButtonLink href="/dashboard" variant="ghost" size="sm">
                  <LayoutDashboard className="mr-1.5 h-4 w-4" />
                  {profile?.name?.split(" ")[0] ?? "Painel"}
                </ButtonLink>
                {profile?.role === "buyer" && (
                  <ButtonLink href="/pedidos/novo" size="sm">
                    <Plus className="mr-1.5 h-4 w-4" /> Criar pedido
                  </ButtonLink>
                )}
                {profile?.role === "supplier" && (
                  <ButtonLink href="/pedidos" size="sm">
                    <Package className="mr-1.5 h-4 w-4" /> Ver pedidos
                  </ButtonLink>
                )}
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <ButtonLink href="/login" variant="ghost" size="sm">Entrar</ButtonLink>
                <ButtonLink href="/cadastro" size="sm">Cadastrar grátis</ButtonLink>
              </>
            )}
          </div>

          <button className="md:hidden" onClick={() => setOpen(!open)}>
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {open && (
          <div className="border-t py-4 md:hidden">
            <nav className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="text-sm font-medium text-gray-700" onClick={() => setOpen(false)}>
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-2 border-t">
                {user ? (
                  <>
                    <Link href="/dashboard" onClick={() => setOpen(false)} className="rounded-lg border px-3 py-1.5 text-sm font-medium text-center">Painel</Link>
                    <Button variant="ghost" size="sm" onClick={handleLogout}>Sair</Button>
                  </>
                ) : (
                  <>
                    <ButtonLink href="/login" variant="outline" size="sm">Entrar</ButtonLink>
                    <ButtonLink href="/cadastro" size="sm">Cadastrar grátis</ButtonLink>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
