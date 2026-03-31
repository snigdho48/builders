import type { Property } from "@/types/domain"

export function sortByRatingThenId(a: Property, b: Property) {
  const ra = parseFloat(String(a.rating_average ?? "0")) || 0
  const rb = parseFloat(String(b.rating_average ?? "0")) || 0
  if (rb !== ra) {
    return rb - ra
  }
  return a.id - b.id
}

/** Direct-buy lane: channel first, then land-sale heuristic, then any available. */
export function pickDirectBuyTop(available: Property[], limit: number): Property[] {
  let pool = available.filter((p) => p.property_channel === "direct_buy")
  if (pool.length === 0) {
    pool = available.filter(
      (p) => p.land_sale_mode === "whole_land" || p.land_sale_mode === "per_block"
    )
  }
  if (pool.length === 0) {
    pool = [...available]
  }
  return [...pool].sort(sortByRatingThenId).slice(0, limit)
}

/** Installment lane: channel first, then fractional land mode, then listings not shown in direct row. */
export function pickInstallmentTop(
  available: Property[],
  directTop: Property[],
  limit: number
): Property[] {
  const directIds = new Set(directTop.map((p) => p.id))
  let pool = available.filter((p) => p.property_channel === "installment")
  if (pool.length === 0) {
    pool = available.filter((p) => p.land_sale_mode === "fractional_share")
  }
  if (pool.length === 0) {
    pool = available.filter((p) => !directIds.has(p.id))
  }
  return [...pool].sort(sortByRatingThenId).slice(0, limit)
}
