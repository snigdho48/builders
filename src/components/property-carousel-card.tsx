import { Link } from "react-router-dom"

import type { Property } from "@/types/domain"
import { formatBdtInteger } from "@/utils/currency"

function priceCaption(property: Property): string {
  const main = formatBdtInteger(property.land_price)
  const whole = property.whole_land_price ? formatBdtInteger(property.whole_land_price) : null
  if (whole && whole !== main) {
    return `${main} – ${whole}`
  }
  return main
}

type PropertyCarouselCardProps = {
  property: Property
  /** 1-based rank (Square Yards `.project-number .number`). */
  rank: number
}

export function PropertyCarouselCard({ property, rank }: PropertyCarouselCardProps) {
  const img = property.top_view_image || "https://placehold.co/640x400/e2e8f0/64748b?text=Land"

  return (
    <Link
      to={`/properties/${property.id}`}
      className="property-focus-card-link group mx-auto block h-auto w-full max-w-[min(100%,312px)] min-w-0 cursor-pointer overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-[#f58e43] focus-visible:ring-offset-2"
    >
      <article className="property-focus-card flex min-h-0 w-full flex-col overflow-hidden">
        <figure className="property-focus-card__figure m-0">
          <div className="property-focus-card__img-wrap">
            <img
              src={img}
              alt=""
              className="property-focus-card__img block h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
              loading="lazy"
              decoding="async"
            />
          </div>
          <span className="project-number" aria-hidden>
            <span className="number">{rank}</span>
          </span>
        </figure>
        <figcaption className="property-focus-card__caption m-0">
          <strong className="property-focus-card__title line-clamp-2 font-bold text-gray-900 max-sm:line-clamp-1">
            {property.title}
          </strong>
          <span className="property-focus-card__city line-clamp-2 text-gray-500 max-sm:line-clamp-1">
            {property.location_name}
          </span>
          <div className="property-focus-card__price font-bold text-gray-900">
            {priceCaption(property)}
          </div>
        </figcaption>
      </article>
    </Link>
  )
}
