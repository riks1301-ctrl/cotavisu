/** Normaliza telefone BR para dígitos (com 55 quando aplicável). */
export function normalizeWhatsAppPhone(input: string): string | null {
  const digits = input.replace(/\D/g, "")
  if (digits.length < 10) return null
  if (digits.length === 10 || digits.length === 11) return `55${digits}`
  if (digits.startsWith("55") && digits.length >= 12) return digits
  return null
}

export function formatWhatsAppDisplay(phone: string): string {
  const d = phone.replace(/\D/g, "")
  const local = d.startsWith("55") ? d.slice(2) : d
  if (local.length === 11) {
    return `(${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7)}`
  }
  if (local.length === 10) {
    return `(${local.slice(0, 2)}) ${local.slice(2, 6)}-${local.slice(6)}`
  }
  return phone
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const normalized = normalizeWhatsAppPhone(phone)
  if (!normalized) return "#"
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`
}

export function isValidWhatsApp(input: string): boolean {
  return normalizeWhatsAppPhone(input) !== null
}
