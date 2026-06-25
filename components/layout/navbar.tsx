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
import { layout, type } from "@/lib/typography"

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
      <div className={layout.container}>
        <div className="flex h-[4.5rem] items-center justify-between lg:h-20">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 lg:h-11 lg:w-11">
              <Eye className="h-5 w-5 text-white lg:h-6 lg:w-6" />
            </div>
            <span className={`${type.h3} font-bold tracking-tight text-gray-900`}>
              CotaVisu
            </span>
            <Badge variant="secondary" className="hidden sm:inline-flex">Beta</Badge>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${type.nav} transition-colors ${
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
                <ButtonLink href="/dashboard" variant="ghost">
                  <LayoutDashboard className="mr-2 h-5 w-5" />
                  {profile?.name?.split(" ")[0] ?? "Painel"}
                </ButtonLink>
                {profile?.role === "buyer" && (
                  <ButtonLink href="/pedidos/novo">
                    <Plus className="mr-2 h-5 w-5" /> Criar pedido
                  </ButtonLink>
                )}
                {profile?.role === "supplier" && (
                  <ButtonLink href="/pedidos">
                    <Package className="mr-2 h-5 w-5" /> Ver pedidos
                  </ButtonLink>
                )}
                <Button variant="ghost" size="icon-sm" onClick={handleLogout}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <>
                <ButtonLink href="/login" variant="ghost">Entrar</ButtonLink>
                <ButtonLink href="/cadastro">Cadastrar grátis</ButtonLink>
              </>
            )}
          </div>

          <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
          </button>
        </div>

        {open && (
          <div className="border-t py-5 md:hidden">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${type.nav} text-gray-700`}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-3 pt-4 border-t">
                {user ? (
                  <>
                    <ButtonLink href="/dashboard" variant="outline" className="w-full" onClick={() => setOpen(false)}>
                      Painel
                    </ButtonLink>
                    <Button variant="ghost" onClick={handleLogout}>Sair</Button>
                  </>
                ) : (
                  <>
                    <ButtonLink href="/login" variant="outline" className="w-full">Entrar</ButtonLink>
                    <ButtonLink href="/cadastro" className="w-full">Cadastrar grátis</ButtonLink>
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
