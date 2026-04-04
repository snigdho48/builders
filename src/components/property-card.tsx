import { Link } from "react-router-dom"

import { useCart } from "@/contexts/use-cart"
import { useToast } from "@/components/ui/use-toast"
import type { Property } from "@/types/domain"
import { computeSharesForTierAmount } from "@/utils/share-tiers"
import {
  propertyPrimaryPriceOnly,
  propertySaleChannelBadgeClass,
  propertySaleChannelLabel,
} from "@/utils/property-display"
import { plainTextFromHtml } from "@/utils/html-sanitize"

type PropertyCardProps = {
  property: Property
}

function statusClass(status: Property["status"]) {
  if (status === "sold") {
    return "bg-rose-100 text-rose-700"
  }
  if (status === "booked") {
    return "bg-amber-100 text-amber-700"
  }
  return "bg-emerald-100 text-emerald-700"
}

export function PropertyCard({ property }: PropertyCardProps) {
  const { addItem } = useCart()
  const { showToast } = useToast()
  const channelLabel = propertySaleChannelLabel(property)
  const canAdd =
    property.status !== "sold" &&
    (property.land_sale_mode === "fractional_share"
      ? (property.available_shares ?? 0) >= Math.max(1, property.min_shares_per_order || 1)
      : property.available_blocks >= 1)

  function handleAddToCart() {
    if (!canAdd) {
      showToast("This property cannot be added to cart.", "error")
      return
    }
    if (property.land_sale_mode === "fractional_share") {
      const tiers = property.share_investment_options ?? []
      if (property.property_channel === "installment" && tiers.length > 0) {
        const tier = tiers[0]
        const shares = computeSharesForTierAmount(property.share_price, tier.amount)
        if (shares != null) {
          addItem(property, {
            shares,
            investment_type: "installment",
            duration_years: tier.duration_years,
            share_tier: tier,
          })
        } else {
          addItem(property, {
            shares: Math.max(1, property.min_shares_per_order || 1),
            investment_type: "plot_buy",
            duration_years: 0,
          })
        }
      } else {
        addItem(property, {
          shares: Math.max(1, property.min_shares_per_order || 1),
          investment_type: "plot_buy",
          duration_years: 0,
        })
      }
    } else if (property.land_sale_mode === "whole_land") {
      addItem(property, { investment_type: "plot_buy", duration_years: 0 })
    } else {
      addItem(property, { blocks: 1, investment_type: "plot_buy", duration_years: 0 })
    }
    showToast("Added to cart", "success")
  }

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="overflow-hidden">
        <img
          src={property.top_view_image}
          alt={property.title}
          className="h-52 w-full object-cover"
        />
      </div>
      <div className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm text-slate-500">{property.location_name}</span>
          <div className="flex shrink-0 flex-col items-end gap-1.5 sm:flex-row sm:items-center">
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ${propertySaleChannelBadgeClass(property)}`}
              title={
                property.property_channel === "installment"
                  ? "Installment listing (pay over time / fractional plan)"
                  : "Plot buy (blocks, whole land, or shares as priced)"
              }
            >
              {channelLabel}
            </span>
            <span className={`rounded-full px-2 py-1 text-xs ${statusClass(property.status)}`}>
              {property.status}
            </span>
          </div>
        </div>
        <h3 className="text-lg font-semibold text-slate-900">{property.title}</h3>
        <p className="line-clamp-2 text-sm text-slate-500">
          {plainTextFromHtml(property.description) || "—"}
        </p>
        <div className="rounded-lg bg-slate-50 px-3 py-2.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Price</p>
          <p className="mt-0.5 text-base font-semibold text-[#f58e43]">{propertyPrimaryPriceOnly(property)}</p>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          <Link
            to={`/properties/${property.id}`}
            className="inline-flex rounded-full border border-[#f58e43] px-4 py-2 text-sm font-medium text-[#f58e43] hover:bg-[#f58e43] hover:text-white"
          >
            View Details
          </Link>
          <button
            type="button"
            disabled={!canAdd}
            onClick={handleAddToCart}
            className="inline-flex rounded-full bg-[#0b1f44] px-4 py-2 text-sm font-medium text-white hover:bg-[#152a52] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add to cart
          </button>
        </div>
      </div>
    </article>
  )
}
