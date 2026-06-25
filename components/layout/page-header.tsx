import { type } from "@/lib/typography"

type Props = {
  title: string
  subtitle?: string
  className?: string
}

export function PageHeader({ title, subtitle, className = "" }: Props) {
  return (
    <div className={`title-gap ${className}`}>
      <h1 className={type.h2}>{title}</h1>
      {subtitle && (
        <p className={`mt-5 ${type.subtitle} text-gray-600`}>{subtitle}</p>
      )}
    </div>
  )
}
