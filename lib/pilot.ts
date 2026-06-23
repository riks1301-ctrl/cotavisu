/**
 * Config operacional do piloto — não aparece na UI.
 * PILOT_NOTIFY_STATES: estados em que disparamos e-mail de novo pedido para fornecedores.
 * Use "*" para nacional. Padrão "PR" durante recrutamento inicial.
 */
export function getPilotNotifyStates(): string[] | "all" {
  const raw = process.env.PILOT_NOTIFY_STATES ?? "PR"
  if (raw.trim() === "*") return "all"
  return raw.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean)
}

export function shouldNotifySuppliersForRequest(requestState: string): boolean {
  const states = getPilotNotifyStates()
  if (states === "all") return true
  return states.includes(requestState.toUpperCase())
}
