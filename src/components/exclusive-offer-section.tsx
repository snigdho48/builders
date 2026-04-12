import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Autoplay, EffectCoverflow } from "swiper/modules"
import { Swiper, SwiperSlide } from "swiper/react"

import { RevealOnView } from "@/components/motion/reveal-on-view"

const exclusiveOffers = [
  {
    stat: "1%",
    title: "Start from 1% on qualifying buy-property plans",
    detail:
      "Limited promo slots: reserve selected plots or land with a 1% entry path on approved plans. Our team confirms eligibility, documentation, and your payment schedule.",
    ctaLabel: "Claim this offer",
    href: "/contact",
  },
  {
    stat: "50%",
    title: "Half off registration on qualifying plans",
    detail:
      "Limited slots this month: save 50% on registration when you reserve selected plots or installment blocks. Speak with our team to confirm eligibility.",
    ctaLabel: "Claim this offer",
    href: "/contact",
  },
  {
    stat: "1%",
    title: "Start from 1% on qualifying buy-property plans",
    detail:
      "Limited promo slots: reserve selected plots or land with a 1% entry path on approved plans. Our team confirms eligibility, documentation, and your payment schedule.",
    ctaLabel: "Claim this offer",
    href: "/contact",
  },
  {
    stat: "50%",
    title: "Half off registration on qualifying plans",
    detail:
      "Limited slots this month: save 50% on registration when you reserve selected plots or installment blocks. Speak with our team to confirm eligibility.",
    ctaLabel: "Claim this offer",
    href: "/contact",
  },
  {
    stat: "1%",
    title: "Start from 1% on qualifying buy-property plans",
    detail:
      "Limited promo slots: reserve selected plots or land with a 1% entry path on approved plans. Our team confirms eligibility, documentation, and your payment schedule.",
    ctaLabel: "Claim this offer",
    href: "/contact",
  },
  {
    stat: "50%",
    title: "Half off registration on qualifying plans",
    detail:
      "Limited slots this month: save 50% on registration when you reserve selected plots or installment blocks. Speak with our team to confirm eligibility.",
    ctaLabel: "Claim this offer",
    href: "/contact",
  },
  {
    stat: "1%",
    title: "Start from 1% on qualifying buy-property plans",
    detail:
      "Limited promo slots: reserve selected plots or land with a 1% entry path on approved plans. Our team confirms eligibility, documentation, and your payment schedule.",
    ctaLabel: "Claim this offer",
    href: "/contact",
  },
  {
    stat: "50%",
    title: "Half off registration on qualifying plans",
    detail:
      "Limited slots this month: save 50% on registration when you reserve selected plots or installment blocks. Speak with our team to confirm eligibility.",
    ctaLabel: "Claim this offer",
    href: "/contact",
  },
] as const

function useExclusiveDesktopLayout() {
  const [desktop, setDesktop] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)")
    const sync = () => setDesktop(mq.matches)
    sync()
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
  }, [])

  return desktop
}

export function ExclusiveOfferSection() {
  const desktop = useExclusiveDesktopLayout()

  const slides = exclusiveOffers.map((offer, idx) => (
    <SwiperSlide key={`${offer.stat}-${idx}`}>
      <div className="exclusive-offer-card">
        <div className="exclusive-offer-visual" aria-hidden>
          <span className="exclusive-offer-exclaim">!</span>
          <span className="exclusive-offer-stat">{offer.stat}</span>
        </div>
        <div className="exclusive-offer-copy">
          <p className="exclusive-offer-kicker">Exclusive offer</p>
          <h3 className="exclusive-offer-title">{offer.title}</h3>
          <p className="exclusive-offer-detail">{offer.detail}</p>
          <Link to={offer.href} className="exclusive-offer-cta">
            {offer.ctaLabel}
          </Link>
        </div>
      </div>
    </SwiperSlide>
  ))

  return (
    <section
      className="exclusive-offer-wrap"
      aria-labelledby="exclusive-offer-heading"
    >
      <div className="">
        <RevealOnView className="w-full" variant="fade-up">
          <div className="landing-inner">
            <p className="mb-3 text-center text-xs font-semibold tracking-[0.2em] text-[#c2410c] uppercase sm:mb-4 sm:text-left">
              Exclusive offers
            </p>
            <h2
              id="exclusive-offer-heading"
              className="mx-auto mb-6 max-w-2xl text-center !text-3xl !font-extrabold tracking-tight text-slate-900 sm:mx-0 sm:max-w-none sm:text-left sm:text-2xl"
            >
              Limited-time buy-property promos
            </h2>
          </div>
          <div className="exclusive-offer-stack mt-2">
            {desktop ? (
              <Swiper
                key="exclusive-desktop"
                modules={[Autoplay, EffectCoverflow]}
                direction="horizontal"
                effect="coverflow"
                grabCursor
                loop
                watchOverflow
                centeredSlides={true}
                slidesPerView={1.35}
                spaceBetween={20}
                coverflowEffect={{
                  rotate: 50,
                  stretch: 0,
                  depth: 100,
                  modifier: 1,
                  slideShadows: false,
                }}
                breakpoints={{
                  1280: { slidesPerView: 1.5, spaceBetween: 24 },
                  1536: { slidesPerView: 1.65, spaceBetween: 28 },
                }}
                autoplay={{ delay: 4800, disableOnInteraction: false }}
                className="exclusive-offer-swiper exclusive-offer-swiper--coverflow"
              >
                {slides}
              </Swiper>
            ) : (
              <Swiper
                key="exclusive-mobile"
                modules={[EffectCoverflow, Autoplay]}
                effect="coverflow"
                direction="vertical"
                grabCursor
                loop
                watchOverflow
                centeredSlides
                slidesPerView={1.22}
                spaceBetween={-22}
                coverflowEffect={{
                  rotate: 0,
                  stretch: -18,
                  depth: 170,
                  modifier: 2,
                  slideShadows: false,
                }}
                autoplay={{ delay: 4800, disableOnInteraction: false }}
                className="exclusive-offer-swiper exclusive-offer-swiper--coverflow"
              >
                {slides}
              </Swiper>
            )}
          </div>
        </RevealOnView>
      </div>
    </section>
  )
}
