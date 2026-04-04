import type { Property } from "@/types/domain"

import { formatBdtInteger } from "@/utils/currency"

export function formatPropertyMoney(value: string | number | null | undefined): string {
  return formatBdtInteger(value)
}

/** Matches DB: `Property.property_channel` */
export function propertySaleChannelLabel(property: Property): "Plot buy" | "Installment" {
  return property.property_channel === "installment" ? "Installment" : "Plot buy"
}

export function propertySaleChannelBadgeClass(property: Property): string {
  return property.property_channel === "installment"
    ? "bg-amber-50 text-amber-900 ring-amber-200/80"
    : "bg-emerald-50 text-emerald-900 ring-emerald-200/80"
}

/**
 * One clear price line from `land_sale_mode` + prices — never both /share and /block.
 */
export function propertyPrimaryPriceLine(property: Property): string {
  if (property.land_sale_mode === "fractional_share") {
    return `${formatPropertyMoney(property.share_price)} / share`
  }
  if (property.land_sale_mode === "whole_land") {
    if (property.whole_land_price) {
      return `${formatPropertyMoney(property.whole_land_price)} · whole parcel`
    }
    return `Whole parcel · from ${formatPropertyMoney(property.price_per_block)} / unit`
  }
  return `${formatPropertyMoney(property.price_per_block)} / block`
}

/** Formatted primary amount only — for cards where type/channel are shown elsewhere. */
export function propertyPrimaryPriceOnly(property: Property): string {
  if (property.land_sale_mode === "fractional_share") {
    return formatPropertyMoney(property.share_price)
  }
  if (property.land_sale_mode === "whole_land") {
    if (property.whole_land_price) {
      return formatPropertyMoney(property.whole_land_price)
    }
    return formatPropertyMoney(property.price_per_block)
  }
  return formatPropertyMoney(property.price_per_block)
}
