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
    <article className="flex w-full min-w-0 flex-col overflow-hidden rounded-[14px] border border-slate-200/90 bg-white shadow-[0_1px_0_rgb(255_255_255/80%)_inset,0_10px_28px_rgb(15_23_42/5%),0_2px_6px_rgb(15_23_42/4%)] transition-[border-color,box-shadow] duration-200 hover:border-slate-300 hover:shadow-[0_14px_36px_rgb(15_23_42/7%),0_4px_10px_rgb(15_23_42/5%)] sm:aspect-square">
      <div className="relative aspect-5/4 w-full shrink-0 overflow-hidden bg-slate-100 sm:aspect-auto sm:min-h-0 sm:flex-1">
        <img
          src={property.top_view_image || "https://placehold.co/640x360/e2e8f0/64748b?text=Land"}
          alt=""
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex shrink-0 flex-col gap-2 border-t border-slate-100 p-3.5 sm:gap-2.5 sm:p-3.5">
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${statusClass(property.status)}`}>
            {property.status}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ${propertySaleChannelBadgeClass(property)}`}
          >
            {saleTypeLabel(property.sale_type)}
          </span>
        </div>
        <h3 className="line-clamp-2 text-[0.9375rem] font-semibold leading-snug text-[#0b1f44] sm:text-base">{property.title}</h3>
        <p className="line-clamp-2 text-sm text-slate-500">{property.location_name}</p>
        <p className="text-base font-semibold text-[#f58e43] sm:text-[1.0625rem]">{propertyPrimaryPriceLine(property)}</p>
        <Link
          to={`/properties/${property.id}`}
          className="mt-auto inline-flex min-h-11 w-full items-center justify-center rounded-full border border-[#f58e43] py-2.5 text-sm font-semibold text-[#f58e43] transition-colors hover:bg-[#fff7f1] active:bg-[#fff0e6] sm:min-h-0 sm:py-2 sm:text-sm"
        >
          View land
        </Link>
      </div>
    </article>
  )
}
