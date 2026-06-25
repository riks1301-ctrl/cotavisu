import Link from "next/link"
import { Eye } from "lucide-react"
import { layout, type } from "@/lib/typography"

export function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className={`${layout.container} py-16`}>
        <div className="flex flex-col items-center justify-between gap-8 sm:flex-row">
          <Link href="/" className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 shadow-md">
              <Eye className="h-6 w-6 text-white" />
            </div>
            <span className={`${type.h3} font-bold text-gray-800`}>CotaVisu</span>
          </Link>
          <p className={`${type.body} max-w-md text-center text-gray-600`}>
            O comparador de comunicação visual do Brasil.
          </p>
          <div className={`flex gap-8 ${type.nav} text-gray-600`}>
            <Link href="/termos" className="hover:text-gray-900">Termos</Link>
            <Link href="/privacidade" className="hover:text-gray-900">Privacidade</Link>
            <a href="mailto:contato@cotavisu.com.br" className="hover:text-gray-900">Contato</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
