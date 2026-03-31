import { Link } from "react-router-dom"

import { useCart } from "@/contexts/use-cart"
import { useToast } from "@/components/ui/use-toast"
import type { Property } from "@/types/domain"

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

function priceLabel(property: Property) {
  if (property.land_sale_mode === "fractional_share") {
    return `$${property.share_price ?? "0"} / share`
  }
  if (property.land_sale_mode === "whole_land") {
    return property.whole_land_price
      ? `$${property.whole_land_price} whole`
      : `Whole (from $${property.price_per_block}/u)`
  }
  return `$${property.price_per_block} / block`
}

function availabilityLabel(property: Property) {
  if (property.land_sale_mode === "fractional_share") {
    return `${property.available_shares ?? 0} shares left`
  }
  if (property.land_sale_mode === "whole_land") {
    return property.available_blocks >= 1 ? "Whole land available" : "Sold out"
  }
  return `${property.available_blocks} blocks left`
}

export function PropertyCard({ property }: PropertyCardProps) {
  const { addItem } = useCart()
  const { showToast } = useToast()
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
      addItem(property, {
        shares: Math.max(1, property.min_shares_per_order || 1),
        investment_type: "direct",
        duration_years: 0,
      })
    } else if (property.land_sale_mode === "whole_land") {
      addItem(property, { investment_type: "direct", duration_years: 0 })
    } else {
      addItem(property, { blocks: 1, investment_type: "direct", duration_years: 0 })
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
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">{property.location_name}</span>
          <span className={`rounded-full px-2 py-1 text-xs ${statusClass(property.status)}`}>
            {property.status}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-slate-900">{property.title}</h3>
        <p className="line-clamp-2 text-sm text-slate-500">{property.description}</p>
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-[#f58e43]">{priceLabel(property)}</span>
          <span className="text-slate-500">{availabilityLabel(property)}</span>
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
