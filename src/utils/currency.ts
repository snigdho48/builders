/**
 * All property, investment, payment, and commission amounts in this app are in Bangladeshi Taka (BDT).
 */

const BDT_FORMAT: Intl.NumberFormatOptions = {
  style: "currency",
  currency: "BDT",
}

export function formatBdt(
  value: string | number | null | undefined,
  overrides?: Pick<Intl.NumberFormatOptions, "minimumFractionDigits" | "maximumFractionDigits">
): string {
  const n = typeof value === "string" ? Number.parseFloat(value) : Number(value)
  if (!Number.isFinite(n)) {
    return "—"
  }
  const opts = { ...BDT_FORMAT, ...overrides }
  try {
    return new Intl.NumberFormat("en-BD", opts).format(n)
  } catch {
    const frac = overrides?.maximumFractionDigits ?? 2
    return `${n.toLocaleString("en-BD", { minimumFractionDigits: 0, maximumFractionDigits: frac })} BDT`
  }
}

/** Whole taka (no poisha) — typical for list prices and tiers. */
export function formatBdtInteger(value: string | number | null | undefined): string {
  return formatBdt(value, { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

/** Subtotals and balances with two decimal places. */
export function formatBdtAmount(value: string | number | null | undefined): string {
  return formatBdt(value, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
