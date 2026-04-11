import type { Property, SaleType } from "@/types/domain"
import { formatBdtInteger } from "@/utils/currency"

export function saleTypeLabel(sale: SaleType): string {
  return sale === "installment" ? "Installment (whole land)" : "Land buy (full payment)"
}

export function isInstallmentChannel(property: Pick<Property, "property_channel" | "sale_type">): boolean {
  return property.property_channel === "installment" || property.sale_type === "installment"
}

/** Installment / fractional listings use investment booking; plot-buy listings use 1% / 50% plans. */
export function propertyUsesInvestmentBooking(property: Property): boolean {
  return isInstallmentChannel(property) || property.land_sale_mode === "fractional_share"
}

/** Channel label on cards and listings */
export function propertySaleChannelLabel(property: Pick<Property, "property_channel" | "sale_type">): string {
  return isInstallmentChannel(property) ? "Installment" : "Buy property"
}

export function propertySaleChannelBadgeClass(property: Pick<Property, "property_channel" | "sale_type">): string {
  return isInstallmentChannel(property)
    ? "bg-amber-100 text-amber-800 ring-amber-200"
    : "bg-emerald-100 text-emerald-800 ring-emerald-200"
}

export function propertyPrimaryPriceLine(property: Property): string {
  return formatBdtInteger(property.land_price)
}
