import Link from "next/link"
import { type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { buttonVariants } from "./button"

type Props = VariantProps<typeof buttonVariants> & {
  href: string
  className?: string
  children: React.ReactNode
  target?: string
  rel?: string
}

export function ButtonLink({ href, className, variant, size, children, target, rel }: Props) {
  return (
    <Link
      href={href}
      target={target}
      rel={rel}
      className={cn(buttonVariants({ variant, size, className }))}
    >
      {children}
    </Link>
  )
}
