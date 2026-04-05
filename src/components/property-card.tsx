import { Link } from "react-router-dom"

import type { Property } from "@/types/domain"
import { propertyPrimaryPriceLine, propertySaleChannelBadgeClass, saleTypeLabel } from "@/utils/property-display"

type PropertyCardProps = {
  property: Property
}

function statusClass(status: Property["status"]) {
  if (status === "sold") return "bg-rose-100 text-rose-700"
  if (status === "booked") return "bg-amber-100 text-amber-700"
  return "bg-emerald-100 text-emerald-700"
}

export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <article className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-slate-100">
        <img
          src={property.top_view_image || "https://placehold.co/640x360/e2e8f0/64748b?text=Land"}
          alt=""
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${statusClass(property.status)}`}>
            {property.status}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ${propertySaleChannelBadgeClass(property)}`}
          >
            {saleTypeLabel(property.sale_type)}
          </span>
        </div>
        <h3 className="line-clamp-2 min-h-[3.25rem] text-lg font-semibold leading-snug text-[#0b1f44]">{property.title}</h3>
        <p className="line-clamp-2 text-sm text-slate-500">{property.location_name}</p>
        <p className="text-lg font-semibold text-[#f58e43]">{propertyPrimaryPriceLine(property)}</p>
        <Link
          to={`/properties/${property.id}`}
          className="mt-auto inline-flex w-full justify-center rounded-full border border-[#f58e43] py-2.5 text-sm font-semibold text-[#f58e43] transition-colors hover:bg-[#fff7f1]"
        >
          View land
        </Link>
      </div>
    </article>
  )
}
