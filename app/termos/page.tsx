import Link from "next/link"
import { ButtonLink } from "@/components/ui/button-link"
import { layout, type } from "@/lib/typography"

export default function TermosPage() {
  return (
    <div className={`${layout.containerNarrow} py-16`}>
      <h1 className={`mb-8 ${type.h2}`}>Termos de Uso</h1>
      <div className={`${type.body} space-y-8 text-gray-600`}>
        <p><strong>Última atualização:</strong> junho de 2026</p>

        <section>
          <h2 className={`mb-4 ${type.cardTitle} text-gray-900`}>1. O que é o CotaVisu</h2>
          <p>
            O CotaVisu é uma plataforma de <strong>intermediação e comparação de orçamentos</strong>{" "}
            para serviços de comunicação visual. Não somos gráfica, não produzimos materiais e não
            participamos do pagamento entre comprador e fornecedor.
          </p>
        </section>

        <section>
          <h2 className={`mb-4 ${type.cardTitle} text-gray-900`}>2. Como funciona</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>Compradores publicam pedidos de orçamento.</li>
            <li>Fornecedores enviam propostas com preço e prazo.</li>
            <li>Compradores comparam e escolhem uma proposta.</li>
            <li>Após a escolha, as partes podem se conectar via WhatsApp para fechar o negócio.</li>
          </ul>
        </section>

        <section>
          <h2 className={`mb-4 ${type.cardTitle} text-gray-900`}>3. Responsabilidades</h2>
          <p>
            O CotaVisu não garante qualidade, prazo ou entrega dos serviços contratados diretamente
            entre comprador e fornecedor. Cada fornecedor é responsável pelas suas propostas e entregas.
          </p>
        </section>

        <section>
          <h2 className={`mb-4 ${type.cardTitle} text-gray-900`}>4. Conta e uso</h2>
          <p>
            É necessário cadastro para publicar pedidos. É proibido uso fraudulento, spam de propostas
            ou publicação de informações falsas.
          </p>
        </section>

        <section>
          <h2 className={`mb-4 ${type.cardTitle} text-gray-900`}>5. Contato</h2>
          <p>
            Dúvidas: <a href="mailto:contato@cotavisu.com.br" className="text-blue-600 hover:underline">contato@cotavisu.com.br</a>
          </p>
        </section>
      </div>

      <div className="mt-12 flex gap-4">
        <ButtonLink href="/cadastro" variant="outline">Voltar ao cadastro</ButtonLink>
        <Link href="/" className={`${type.nav} text-blue-600 hover:underline self-center`}>Início</Link>
      </div>
    </div>
  )
}
