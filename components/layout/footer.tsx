import Link from "next/link"
import { Eye } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
              <Eye className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-bold text-gray-800">CotaVisu</span>
          </Link>
          <p className="text-sm text-gray-500">
            O comparador de comunicação visual do Brasil.
          </p>
          <div className="flex gap-4 text-sm text-gray-500">
            <Link href="#" className="hover:text-gray-800">Termos</Link>
            <Link href="#" className="hover:text-gray-800">Privacidade</Link>
            <Link href="#" className="hover:text-gray-800">Contato</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
