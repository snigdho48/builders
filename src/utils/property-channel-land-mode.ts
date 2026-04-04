import type { Property } from "@/types/domain"

/**
 * Business rule: plot buy = whole plot (whole_land); installment = per block or fractional shares.
 * Call when `property_channel` changes so `land_sale_mode` stays valid for the API.
 */
export function landSaleModeAfterChannelChange(
  newChannel: Property["property_channel"],
  previous: { channel: Property["property_channel"]; land_sale_mode: Property["land_sale_mode"] | undefined }
): Property["land_sale_mode"] {
  if (newChannel === "plot_buy") {
    return "whole_land"
  }
  if (newChannel === "installment") {
    if (
      previous.channel === "installment" &&
      previous.land_sale_mode === "fractional_share"
    ) {
      return "fractional_share"
    }
    return "per_block"
  }
  return previous.land_sale_mode ?? "per_block"
}
