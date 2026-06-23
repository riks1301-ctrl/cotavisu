import Link from "next/link"
import { ButtonLink } from "@/components/ui/button-link"

export default function TermosPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="mb-6 text-3xl font-bold">Termos de Uso</h1>
      <div className="prose prose-sm max-w-none space-y-4 text-gray-600">
        <p><strong>Última atualização:</strong> junho de 2026</p>

        <h2 className="text-lg font-semibold text-gray-900">1. O que é o CotaVisu</h2>
        <p>
          O CotaVisu é uma plataforma de <strong>intermediação e comparação de orçamentos</strong>{" "}
          para serviços de comunicação visual. Não somos gráfica, não produzimos materiais e não
          participamos do pagamento entre comprador e fornecedor.
        </p>

        <h2 className="text-lg font-semibold text-gray-900">2. Como funciona</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Compradores publicam pedidos de orçamento.</li>
          <li>Fornecedores enviam propostas com preço e prazo.</li>
          <li>Compradores comparam e escolhem uma proposta.</li>
          <li>Após a escolha, as partes podem se conectar via WhatsApp para fechar o negócio.</li>
        </ul>

        <h2 className="text-lg font-semibold text-gray-900">3. Responsabilidades</h2>
        <p>
          O CotaVisu não garante qualidade, prazo ou entrega dos serviços contratados diretamente
          entre comprador e fornecedor. Cada fornecedor é responsável pelas suas propostas e entregas.
        </p>

        <h2 className="text-lg font-semibold text-gray-900">4. Conta e uso</h2>
        <p>
          É necessário cadastro para publicar pedidos. É proibido uso fraudulento, spam de propostas
          ou publicação de informações falsas.
        </p>

        <h2 className="text-lg font-semibold text-gray-900">5. Contato</h2>
        <p>
          Dúvidas: <a href="mailto:contato@cotavisu.com.br" className="text-blue-600">contato@cotavisu.com.br</a>
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
