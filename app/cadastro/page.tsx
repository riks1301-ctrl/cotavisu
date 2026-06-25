"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Building2, Loader2, ShoppingCart } from "lucide-react"
import { signUp } from "@/lib/auth"
import { isValidWhatsApp } from "@/lib/whatsapp"
import { layout, type } from "@/lib/typography"

export default function CadastroPage() {
  const router = useRouter()
  const [role, setRole] = useState<"buyer" | "supplier">("buyer")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) { setError("Senha deve ter pelo menos 6 caracteres."); return }
    if (!acceptedTerms) { setError("Aceite os Termos de Uso e a Política de Privacidade."); return }
    if (role === "supplier" && !isValidWhatsApp(whatsapp)) {
      setError("Informe um WhatsApp comercial válido com DDD.")
      return
    }
    setLoading(true)
    setError("")
    const { error } = await signUp(email, password, name, role, {
      whatsapp: role === "supplier" ? whatsapp : undefined,
    })
    setLoading(false)
    if (error) {
      setError(error.message === "User already registered" ? "Este e-mail já está cadastrado." : "Erro ao criar conta. Tente novamente.")
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <span className="text-3xl">✓</span>
          </div>
          <h2 className={`mb-3 ${type.h2}`}>Conta criada!</h2>
          <p className={`mb-8 ${type.body} text-gray-500`}>
            Verifique seu e-mail para confirmar o cadastro, depois faça login.
          </p>
          <Button className="w-full" onClick={() => router.push("/login")}>
            Ir para o login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <h1 className={type.h2}>Criar conta grátis</h1>
          <p className={`mt-3 ${type.body} text-gray-500`}>
            Já tem conta?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">Entrar</Link>
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tipo de conta */}
              <div>
                <Label className="mb-3 block">Tipo de conta</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("buyer")}
                    className={`flex flex-col items-center gap-2 rounded-xl border p-4 ${type.nav} transition-all ${role === "buyer" ? "border-blue-500 bg-blue-50 text-blue-700" : "hover:border-gray-300"}`}
                  >
                    <ShoppingCart className="h-6 w-6" />
                    <span className="font-medium">Comprador</span>
                    <span className={type.caption}>Crio pedidos</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("supplier")}
                    className={`flex flex-col items-center gap-2 rounded-xl border p-4 ${type.nav} transition-all ${role === "supplier" ? "border-blue-500 bg-blue-50 text-blue-700" : "hover:border-gray-300"}`}
                  >
                    <Building2 className="h-6 w-6" />
                    <span className="font-medium">Fornecedor</span>
                    <span className={type.caption}>Envio propostas</span>
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="name">{role === "supplier" ? "Nome da empresa" : "Seu nome"}</Label>
                <Input
                  id="name"
                  placeholder={role === "supplier" ? "Gráfica Silva Ltda" : "João Silva"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {role === "supplier" && (
                <div>
                  <Label htmlFor="whatsapp">WhatsApp comercial *</Label>
                  <Input
                    id="whatsapp"
                    placeholder="(41) 99999-9999"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    required
                  />
                  <p className={`mt-2 ${type.caption}`}>
                    Compartilhado com o comprador apenas se ele escolher sua proposta.
                  </p>
                </div>
              )}

              <label className={`flex items-start gap-3 ${type.body} text-gray-600`}>
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  required
                />
                <span>
                  Li e aceito os{" "}
                  <Link href="/termos" className="text-blue-600 underline" target="_blank">Termos de Uso</Link>
                  {" "}e a{" "}
                  <Link href="/privacidade" className="text-blue-600 underline" target="_blank">Política de Privacidade</Link>.
                </span>
              </label>

              {error && (
                <p className={`rounded-xl bg-red-50 p-4 ${type.body} text-red-600`}>{error}</p>
              )}

              <Button className="w-full" type="submit" disabled={loading || !acceptedTerms}>
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Criando conta...</> : "Criar conta grátis"}
              </Button>

              <p className={`text-center ${type.caption}`}>
                Conta gratuita. Publicar pedidos exige login.
              </p>
            </form>
          </CardContent>
        </Card>

        {role === "buyer" && (
          <div className={`mt-4 rounded-xl bg-green-50 p-4 text-center ${type.caption} text-green-700`}>
            ✓ Gratuito para compradores. Sempre.
          </div>
        )}
        {role === "supplier" && (
          <div className={`mt-4 rounded-xl bg-blue-50 p-4 text-center ${type.caption} text-blue-700`}>
            ✓ Grátis durante o período beta.
          </div>
        )}
      </div>
    </div>
  )
}
