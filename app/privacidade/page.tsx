import Link from "next/link"
import { ButtonLink } from "@/components/ui/button-link"

export default function PrivacidadePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="mb-6 text-3xl font-bold">Política de Privacidade</h1>
      <div className="prose prose-sm max-w-none space-y-4 text-gray-600">
        <p><strong>Última atualização:</strong> junho de 2026</p>

        <h2 className="text-lg font-semibold text-gray-900">1. Dados que coletamos</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Nome, e-mail e senha (cadastro)</li>
          <li>WhatsApp e dados da empresa (fornecedores)</li>
          <li>Dados dos pedidos de orçamento (serviço, medidas, cidade)</li>
          <li>Propostas enviadas por fornecedores</li>
        </ul>

        <h2 className="text-lg font-semibold text-gray-900">2. Como usamos</h2>
        <p>
          Para operar a plataforma: exibir pedidos, comparar propostas, enviar notificações por
          e-mail e conectar comprador e fornecedor após escolha de proposta.
        </p>

        <h2 className="text-lg font-semibold text-gray-900">3. Compartilhamento de WhatsApp</h2>
        <p>
          Quando o comprador <strong>aceita uma proposta</strong>, com consentimento explícito,
          compartilhamos o WhatsApp do comprador com o fornecedor escolhido e disponibilizamos
          o WhatsApp do fornecedor ao comprador. Não exibimos WhatsApp publicamente antes disso.
        </p>

        <h2 className="text-lg font-semibold text-gray-900">4. Base legal (LGPD)</h2>
        <p>
          Execução do serviço e consentimento do titular para compartilhamento de contato
          após aceite de proposta.
        </p>

        <h2 className="text-lg font-semibold text-gray-900">5. Seus direitos</h2>
        <p>
          Você pode solicitar acesso, correção ou exclusão dos seus dados pelo e-mail{" "}
          <a href="mailto:contato@cotavisu.com.br" className="text-blue-600">contato@cotavisu.com.br</a>.
        </p>
      </div>

      <div className="mt-8">
        <ButtonLink href="/cadastro" variant="outline">Voltar ao cadastro</ButtonLink>
        {" · "}
        <Link href="/" className="text-sm text-blue-600 hover:underline">Início</Link>
      </div>
    </div>
  )
}
