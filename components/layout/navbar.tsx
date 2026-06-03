"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { ButtonLink } from "@/components/ui/button-link"
import { Eye, Menu, X } from "lucide-react"
import { useState } from "react"

const navLinks = [
  { href: "/pedidos", label: "Pedidos" },
  { href: "/fornecedores", label: "Fornecedores" },
  { href: "/admin", label: "Admin" },
]

export function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

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
                  pathname.startsWith(link.href)
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <ButtonLink href="/login" variant="ghost" size="sm">Entrar</ButtonLink>
            <ButtonLink href="/pedidos/novo" size="sm">Criar pedido</ButtonLink>
          </div>

          <button className="md:hidden" onClick={() => setOpen(!open)}>
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {open && (
          <div className="border-t py-4 md:hidden">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-gray-700"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-2">
                <ButtonLink href="/login" variant="outline" size="sm">Entrar</ButtonLink>
                <ButtonLink href="/pedidos/novo" size="sm">Criar pedido</ButtonLink>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
