import { type } from "@/lib/typography"

type Props = {
  title: string
  subtitle?: string
  className?: string
}

export function PageHeader({ title, subtitle, className = "" }: Props) {
  return (
    <div className={`mb-10 ${className}`}>
      <h1 className={type.h2}>{title}</h1>
      {subtitle && (
        <p className={`mt-4 ${type.subtitle} text-gray-700`}>{subtitle}</p>
      )}
    </div>
  )
}
