import { Link } from "react-router-dom"

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

export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_32px_rgba(5,26,63,0.1)]">
      <img
        src={property.top_view_image}
        alt={property.title}
        className="h-56 w-full object-cover"
      />
      <div className="space-y-3 p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">{property.location_name}</span>
          <span className={`rounded-full px-2 py-1 text-xs ${statusClass(property.status)}`}>
            {property.status}
          </span>
        </div>
        <h3 className="text-[1.15rem] font-semibold text-slate-900">{property.title}</h3>
        <p className="line-clamp-2 text-sm text-slate-500">{property.description}</p>
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-[#f58e43]">${property.price_per_block} / block</span>
          <span className="text-slate-500">{property.available_blocks} blocks left</span>
        </div>
        <Link
          to={`/properties/${property.id}`}
          className="inline-flex rounded-full border border-[#f58e43] px-4 py-2 text-sm font-medium text-[#f58e43] transition hover:bg-[#f58e43] hover:text-slate-950"
        >
          View Details
        </Link>
      </div>
    </article>
  )
}
