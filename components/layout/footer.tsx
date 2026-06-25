import Link from "next/link"
import { Eye } from "lucide-react"
import { layout, type } from "@/lib/typography"

export function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className={`${layout.container} py-12`}>
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
              <Eye className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800">CotaVisu</span>
          </Link>
          <p className={`${type.body} text-gray-500 text-center`}>
            O comparador de comunicação visual do Brasil.
          </p>
          <div className={`flex gap-6 ${type.nav} text-gray-500`}>
            <Link href="/termos" className="hover:text-gray-800">Termos</Link>
            <Link href="/privacidade" className="hover:text-gray-800">Privacidade</Link>
            <a href="mailto:contato@cotavisu.com.br" className="hover:text-gray-800">Contato</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
