import type { CatalogListing, LandShareListing, Property, SaleType } from "@/types/domain"

/** Same gate as `PropertyLandBookPage`: staff can start a plot booking for an investor. */
export function propertyOpenForStaffBooking(p: Pick<Property, "listing_active" | "status">): boolean {
  return p.listing_active && p.status === "available"
}

/** Same gate as `LandShareLandBookPage`: staff can start a land-share booking for an investor. */
export function landShareOpenForStaffBooking(p: Pick<LandShareListing, "listing_active" | "status">): boolean {
  return p.listing_active && p.status === "available"
}
import { formatBdtInteger } from "@/utils/currency"

export function isLandShareListing(x: CatalogListing): x is LandShareListing {
  return x.listing_kind === "land_share"
}

export function listingDetailPath(listing: CatalogListing): string {
  return isLandShareListing(listing) ? `/land-share-listings/${listing.id}` : `/properties/${listing.id}`
}

export function saleTypeLabel(sale: SaleType): string {
  return sale === "installment" ? "Installment" : "Land buy (full payment)"
}

/** Short badge for listing cards: distinguishes land-share vs buy-plots vs installment. */
export function propertyCardBadgeLabel(listing: CatalogListing): string {
  if (isLandShareListing(listing)) return "Land share"
  if (listing.property_channel === "plot_buy") return "Buy plots"
  if (listing.sale_type === "installment") return "Installment plan"
  return "Buy plots"
}

export function isInstallmentChannel(property: Pick<Property, "property_channel" | "sale_type">): boolean {
  return property.property_channel === "installment" || property.sale_type === "installment"
}

/** Installment-channel plot listings use investment booking (with plot map); land-share uses tiers only. */
export function propertyUsesInvestmentBooking(property: Property): boolean {
  return isInstallmentChannel(property)
}

export function landShareUsesInvestmentBooking(_listing: LandShareListing): boolean {
  return true
}

/** Channel label on cards and listings */
export function propertySaleChannelLabel(listing: CatalogListing): string {
  if (isLandShareListing(listing)) return "Land share"
  if (listing.property_channel === "plot_buy") return "Buy plots"
  if (isInstallmentChannel(listing)) return "Installment plan"
  return "Buy plots"
}

export function propertySaleChannelBadgeClass(listing: CatalogListing): string {
  if (isLandShareListing(listing)) {
    return "bg-violet-100 text-violet-800 ring-violet-200"
  }
  return isInstallmentChannel(listing)
    ? "bg-amber-100 text-amber-800 ring-amber-200"
    : "bg-emerald-100 text-emerald-800 ring-emerald-200"
}

export function propertyPrimaryPriceLine(listing: Pick<CatalogListing, "land_price">): string {
  return formatBdtInteger(listing.land_price)
}

/** For land-share cards: show configured monthly share amount from payment tiers. */
export function landShareCardPriceLine(listing: CatalogListing): string {
  if (!isLandShareListing(listing)) {
    return formatBdtInteger(listing.land_price)
  }
  const monthly = (listing.payment_options ?? [])
    .filter((t) => t.billing_period === "monthly")
    .map((t) => Number.parseFloat(t.amount))
    .filter((n) => Number.isFinite(n) && n > 0)
    .sort((a, b) => a - b)
  if (monthly.length > 0) {
    const unique = Array.from(new Set(monthly))
    const visible = unique.slice(0, 3).map((n) => formatBdtInteger(String(n)))
    const suffix = unique.length > 3 ? ` +${unique.length - 3} more` : ""
    return `${visible.join(" • ")}${suffix}`
  }
  return formatBdtInteger(listing.land_price)
}
