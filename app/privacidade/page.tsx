import Link from "next/link"
import { ButtonLink } from "@/components/ui/button-link"
import { layout, type } from "@/lib/typography"

export default function PrivacidadePage() {
  return (
    <div className={`${layout.containerNarrow} py-16`}>
      <h1 className={`mb-8 ${type.h2}`}>Política de Privacidade</h1>
      <div className={`${type.body} space-y-8 text-gray-600`}>
        <p><strong>Última atualização:</strong> junho de 2026</p>

        <section>
          <h2 className={`mb-4 ${type.cardTitle} text-gray-900`}>1. Dados que coletamos</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>Nome, e-mail e senha (cadastro)</li>
            <li>WhatsApp e dados da empresa (fornecedores)</li>
            <li>Dados dos pedidos de orçamento (serviço, medidas, cidade)</li>
            <li>Propostas enviadas por fornecedores</li>
          </ul>
        </section>

        <section>
          <h2 className={`mb-4 ${type.cardTitle} text-gray-900`}>2. Como usamos</h2>
          <p>
            Para operar a plataforma: exibir pedidos, comparar propostas, enviar notificações por
            e-mail e conectar comprador e fornecedor após escolha de proposta.
          </p>
        </section>

        <section>
          <h2 className={`mb-4 ${type.cardTitle} text-gray-900`}>3. Compartilhamento de WhatsApp</h2>
          <p>
            Quando o comprador <strong>aceita uma proposta</strong>, com consentimento explícito,
            compartilhamos o WhatsApp do comprador com o fornecedor escolhido e disponibilizamos
            o WhatsApp do fornecedor ao comprador. Não exibimos WhatsApp publicamente antes disso.
          </p>
        </section>

        <section>
          <h2 className={`mb-4 ${type.cardTitle} text-gray-900`}>4. Base legal (LGPD)</h2>
          <p>
            Execução do serviço e consentimento do titular para compartilhamento de contato
            após aceite de proposta.
          </p>
        </section>

        <section>
          <h2 className={`mb-4 ${type.cardTitle} text-gray-900`}>5. Seus direitos</h2>
          <p>
            Você pode solicitar acesso, correção ou exclusão dos seus dados pelo e-mail{" "}
            <a href="mailto:contato@cotavisu.com.br" className="text-blue-600 hover:underline">contato@cotavisu.com.br</a>.
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
