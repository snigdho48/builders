import type { Investment, InvestmentType } from "@/types/domain"

export function investmentTypeLabel(type: InvestmentType): string {
  if (type === "plot_buy") return "Plot buy"
  if (type === "installment") return "Installment"
  // Legacy fallback: treat old fractional rows as installment.
  return "Installment"
}

/** Table cell: installment shows years; plot buy shows label. */
export function investmentDurationCell(inv: Investment): string {
  if (inv.duration_years) return `${inv.duration_years} yr`
  if (inv.type === "plot_buy") return "Plot buy"
  return "—"
}

/** Active / still open (no end date recorded). */
export function isRunningInvestment(inv: Investment): boolean {
  return inv.end_date == null || inv.end_date === ""
}

export type InvestmentLifecycle = "running" | "due" | "expired" | "complete"

function todayYmd(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function ymdFromIso(iso: string): string {
  if (!iso) return ""
  return iso.slice(0, 10)
}

/**
 * Single lifecycle label for tables (mutually exclusive display priority).
 * complete → expired (listing window ended) → due (installment) → running.
 */
export function investmentLifecycle(inv: Investment): InvestmentLifecycle {
  if (inv.end_date != null && inv.end_date !== "") {
    return "complete"
  }
  const winEnd = inv.property_investment_window_end
  if (winEnd) {
    const t = new Date(winEnd).getTime()
    if (!Number.isNaN(t) && t < Date.now()) {
      return "expired"
    }
  }
  const inst = inv.installments ?? []
  const today = todayYmd()
  for (const row of inst) {
    const st = row.status?.toLowerCase() ?? ""
    if (st !== "pending" && st !== "overdue") continue
    const due = ymdFromIso(row.due_date)
    if (due && due <= today) {
      return "due"
    }
  }
  return "running"
}

export function investmentLifecycleLabel(phase: InvestmentLifecycle): string {
  switch (phase) {
    case "running":
      return "Running"
    case "due":
      return "Due"
    case "expired":
      return "Expired"
    case "complete":
      return "Complete"
    default:
      return phase
  }
}

export function unitsLabel(inv: Investment): string {
  if (inv.shares_owned > 0) {
    return `${inv.shares_owned} share${inv.shares_owned === 1 ? "" : "s"}`
  }
  if (inv.blocks_owned > 0) {
    return `${inv.blocks_owned} block${inv.blocks_owned === 1 ? "" : "s"}`
  }
  return "—"
}
