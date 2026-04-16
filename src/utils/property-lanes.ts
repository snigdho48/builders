import type { LandShareListing, Property } from "@/types/domain"

/**
 * Plot-buy lane: prefer whole-plot (whole_land) listings in the plot_buy channel.
 */
export function pickPlotBuyTop(available: Property[], limit: number): Property[] {
  let pool = available.filter((p) => p.property_channel === "plot_buy" && p.land_sale_mode === "whole_land")
  if (pool.length === 0) {
    pool = available.filter((p) => p.property_channel === "plot_buy")
  }
  return [...pool].sort(sortByRatingThenBlocks).slice(0, limit)
}

export function pickLandShareTop(available: LandShareListing[], limit: number): LandShareListing[] {
  return [...available].sort(sortLandShare).slice(0, limit)
}

function sortByRatingThenBlocks(a: Property, b: Property): number {
  const ra = Number(a.rating_average ?? 0)
  const rb = Number(b.rating_average ?? 0)
  if (rb !== ra) return rb - ra
  return b.total_blocks - a.total_blocks
}

function sortLandShare(a: LandShareListing, b: LandShareListing): number {
  const ra = Number(a.rating_average ?? 0)
  const rb = Number(b.rating_average ?? 0)
  if (rb !== ra) return rb - ra
  return (b.land_area_sqft ?? 0) - (a.land_area_sqft ?? 0)
}
