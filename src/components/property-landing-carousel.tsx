import { FreeMode } from "swiper/modules"
import { Swiper, SwiperSlide } from "swiper/react"

import { PropertyCarouselCard } from "@/components/property-carousel-card"
import type { CatalogListing } from "@/types/domain"

type PropertyLandingCarouselProps = {
  listings: CatalogListing[]
}

export function PropertyLandingCarousel({ listings }: PropertyLandingCarouselProps) {
  if (listings.length === 0) return null

  return (
    <div className="property-landing-carousel-wrap relative">
      <Swiper
        modules={[FreeMode]}
        freeMode={{
          enabled: true,
          momentum: true,
          momentumRatio: 0.85,
          momentumVelocityRatio: 0.85,
        }}
        watchOverflow
        centeredSlides={false}
        slidesPerView={1.28}
        spaceBetween={12}
        breakpoints={{
          480: { slidesPerView: 1.24, spaceBetween: 14, centeredSlides: false },
          640: { slidesPerView: 2.12, spaceBetween: 18, centeredSlides: false },
          900: { slidesPerView: 2.5, spaceBetween: 18, centeredSlides: false },
          /* Desktop: fewer slidesPerView = wider cards; max ~2.7 “columns” so never 4-up */
          1024: { slidesPerView: 2.42, spaceBetween: 18, centeredSlides: false },
          1280: { slidesPerView: 2.55, spaceBetween: 20, centeredSlides: false },
          1536: { slidesPerView: 2.68, spaceBetween: 22, centeredSlides: false },
        }}
        className="property-landing-swiper pb-1!"
      >
        {listings.map((listing, index) => (
          <SwiperSlide key={`${listing.listing_kind}-${listing.id}`} className="h-auto!">
            <PropertyCarouselCard listing={listing} rank={index + 1} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}
