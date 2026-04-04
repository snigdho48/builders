import type { Property } from "@/types/domain"

/**
 * Plot-buy lane: prefer whole-plot (whole_land) listings in the plot_buy channel.
 */
export function pickPlotBuyTop(available: Property[], limit: number): Property[] {
  let pool = available.filter(
    (p) => p.property_channel === "plot_buy" && p.land_sale_mode === "whole_land"
  )
  if (pool.length === 0) {
    pool = available.filter((p) => p.property_channel === "plot_buy")
  }
  return [...pool].sort(sortByRatingThenBlocks).slice(0, limit)
}

export function pickInstallmentTop(
  available: Property[],
  plotBuyTop: Property[],
  limit: number
): Property[] {
  const plotIds = new Set(plotBuyTop.map((p) => p.id))
  let pool = available.filter(
    (p) => p.property_channel === "installment" && p.land_sale_mode === "fractional_share"
  )
  if (pool.length === 0) {
    pool = available.filter((p) => p.property_channel === "installment")
  }
  pool = pool.filter((p) => !plotIds.has(p.id))
  return [...pool].sort(sortByRatingThenBlocks).slice(0, limit)
}

function sortByRatingThenBlocks(a: Property, b: Property): number {
  const ra = Number(a.rating_average ?? 0)
  const rb = Number(b.rating_average ?? 0)
  if (rb !== ra) return rb - ra
  return b.total_blocks - a.total_blocks
}
