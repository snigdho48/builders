import type { ShareInvestmentOption } from "@/types/domain"

export function tierKey(tier: ShareInvestmentOption): string {
  return `${tier.amount}|${tier.duration_years}`
}

/** Whole share count when tier amount is an exact multiple of share price (2-decimal cents). */
export function computeSharesForTierAmount(
  sharePrice: string | null,
  tierAmount: string
): number | null {
  const pc = Math.round((Number.parseFloat(sharePrice || "0") || 0) * 100)
  const ac = Math.round((Number.parseFloat(tierAmount) || 0) * 100)
  if (pc <= 0 || ac <= 0) {
    return null
  }
  if (ac % pc !== 0) {
    return null
  }
  return ac / pc
}

export function findTierOption(
  options: ShareInvestmentOption[],
  tier: ShareInvestmentOption | null | undefined
): ShareInvestmentOption | undefined {
  if (!tier) {
    return undefined
  }
  const k = tierKey(tier)
  return options.find((o) => tierKey(o) === k)
}
