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

/** Strip simple HTML from API fields like `<p>…</p>` for plain-text previews. */
function htmlToPlainText(html: string): string {
  const decoded = html
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
  return decoded
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

/** Primary API copy for the card blurb; visual length capped with `line-clamp-2` on the element. */
function listingDescriptionPreview(property: Property): string {
  const primary = htmlToPlainText(property.description ?? "")
  if (primary) return primary
  const secondary = htmlToPlainText(property.description_secondary ?? "")
  if (secondary) return secondary
  const review = property.review_sample_text?.trim()
  if (review) return review
  return "Premium listing in a prime location."
}

export function PropertyCarouselCard({ property, rank }: PropertyCarouselCardProps) {
  const img = property.top_view_image || "https://placehold.co/640x400/e2e8f0/64748b?text=Land"
  const sqft = property.size_sqft ?? property.land_area_sqft ?? 1600

  return (
    <Link
      to={`/properties/${property.id}`}
      className="property-focus-card-link group mx-auto block h-auto w-full min-w-0 cursor-pointer overflow-visible outline-none focus-visible:ring-2 focus-visible:ring-[#f58e43] focus-visible:ring-offset-2 lg:max-w-none"
    >
      <article className="property-focus-card flex min-h-0 w-full flex-col overflow-visible">
        <figure className="property-focus-card__figure property-focus-card__figure--rank m-0" data-rank={rank}>
          <div className="property-focus-card__img-wrap">
            <img
              src={img}
              alt=""
              className="property-focus-card__img block h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
              loading="lazy"
              decoding="async"
            />
            <span className="property-focus-card__wish" aria-hidden>
              ♡
            </span>
          </div>
        </figure>
        <figcaption className="property-focus-card__caption m-0">
          <strong className="property-focus-card__title line-clamp-2 font-bold text-gray-900 max-sm:line-clamp-1">
            {property.title}
          </strong>
          <span className="property-focus-card__city line-clamp-2 text-gray-500 max-sm:line-clamp-1">
            {property.location_name}
          </span>
          <p className="property-focus-card__desc line-clamp-2 min-h-0 min-w-0 wrap-break-word">
            {listingDescriptionPreview(property)}
          </p>
          <div className="property-focus-card__meta-row w-full" aria-hidden>
            <span>{sqft.toLocaleString()} sqft</span>
          </div>
          <div className="property-focus-card__footer">
            <span className="property-focus-card__price font-bold text-gray-900">{priceCaption(property)}</span>
            <span className="property-focus-card__details-pill">Details</span>
          </div>
        </figcaption>
      </article>
    </Link>
  )
}
