import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Autoplay, Pagination } from "swiper/modules"
import { Swiper, SwiperSlide } from "swiper/react"

import { EverythingNeedSection } from "@/components/everything-need-section"
import { RevealOnView, RevealStagger } from "@/components/motion/reveal-on-view"
import { PropertyLandingCarousel } from "@/components/property-landing-carousel"
import { getProperties } from "@/services/api"
import type { Property } from "@/types/domain"
import { pickInstallmentTop, pickPlotBuyTop } from "@/utils/property-lanes"
import { publicUrl } from "@/utils/public-url"

const partnerLogos = [
  { name: "Google", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" },
  { name: "Trustpilot", logo: "https://upload.wikimedia.org/wikipedia/commons/5/5f/Trustpilot_logo_2022.svg" },
  { name: "Airbnb", logo: "https://upload.wikimedia.org/wikipedia/commons/6/69/Airbnb_Logo_Belo.svg" },
  { name: "Booking.com", logo: "https://upload.wikimedia.org/wikipedia/commons/b/be/Booking.com_logo.svg" },
  { name: "Zillow", logo: "https://upload.wikimedia.org/wikipedia/commons/5/5a/Zillow_logo.svg" },
  { name: "Redfin", logo: "https://upload.wikimedia.org/wikipedia/commons/0/0c/Redfin_logo.svg" },
]
const marqueeLogosA = [...partnerLogos, ...partnerLogos, ...partnerLogos, ...partnerLogos]
const reversedPartnerLogos = [...partnerLogos].reverse()
const marqueeLogosB = [
  ...reversedPartnerLogos,
  ...reversedPartnerLogos,
  ...reversedPartnerLogos,
  ...reversedPartnerLogos,
]

const faqItems = [
  {
    question: "How does fractional investment work?",
    answer:
      "You buy selected blocks for fixed duration, then track installments and ROI in your dashboard.",
  },
  {
    question: "Can I buy plots or blocks permanently?",
    answer:
      "Yes. Buy property keeps long-term ownership and appears immediately in investment history.",
  },
  {
    question: "How does referral commission work?",
    answer:
      "On valid referred purchase, commission is calculated from configurable percentage and shown in dashboard.",
  },
  {
    question: "Are user and admin dashboards separate?",
    answer:
      "Yes. Admin, investor, and representative each have distinct dashboards and permissions.",
  },
]

const LANE_CARD_LIMIT = 5

export function LandingPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const heroSlides = useMemo(
    () => [publicUrl("1%-intereste-jomir-malik.png"), publicUrl("50%-registration.png")],
    [],
  )

  useEffect(() => {
    getProperties().then(setProperties)
  }, [])

  const available = useMemo(
    () => properties.filter((p) => p.status === "available"),
    [properties]
  )

  const plotBuyTop = useMemo(
    () => pickPlotBuyTop(available, LANE_CARD_LIMIT),
    [available]
  )

  const installmentTop = useMemo(
    () => pickInstallmentTop(available, plotBuyTop, LANE_CARD_LIMIT),
    [available, plotBuyTop]
  )

  return (
    <main className="landing-main relative bg-[#f6f7fb] text-slate-900">
      <section className="home-hero border-b border-slate-200/70 bg-gradient-to-b from-white to-[#f6f7fb]">
        <div className="landing-inner flex min-h-0 w-full flex-col justify-center py-8 sm:py-10 md:py-12">
          <RevealOnView className="flex min-h-0 w-full flex-1 flex-col" variant="fade-up">
            <div className="mx-auto flex min-h-0 w-full max-w-full flex-1 flex-col">
              <div className="min-h-0 flex-1 overflow-hidden">
                <Swiper
                  modules={[Autoplay, Pagination]}
                  slidesPerView={1}
                  loop
                  autoplay={{ delay: 3200, disableOnInteraction: false }}
                  pagination={{ clickable: true }}
                  className="hero-plan-swiper w-full"
                >
                  {heroSlides.map((src, idx) => (
                    <SwiperSlide
                      key={src}
                      className="!flex h-full min-h-0 items-center justify-center"
                    >
                      <img
                        src={src}
                        alt={`Plan banner ${idx + 1}`}
                        className="mx-auto block h-auto  w-full max-w-[min(70vw,840px)] object-contain object-center"
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>
          </RevealOnView>
        </div>
      </section>
      <EverythingNeedSection />
      <section className="landing-section" aria-label="Featured properties">
        <div className="landing-inner">
          <div className="landing-surface landing-surface--pad">
            <RevealOnView
              className="mb-8 flex w-full flex-wrap items-end justify-between gap-6 sm:mb-10 lg:mb-12 lg:gap-8"
              variant="fade-up"
            >
              <div className="min-w-0 max-w-3xl">
                <p className="text-xs font-medium tracking-[0.28em] text-[#f58e43] uppercase">
                  Buy property
                </p>
                <h2 className="mt-2 text-[1.65rem] font-semibold tracking-tight text-slate-900 sm:text-[2rem]">
                  Top properties to buy
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-[0.9375rem]">
                  Plots and per-block listings — best for upfront, full ownership (up to {LANE_CARD_LIMIT}).
                </p>
              </div>
              <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
                <Link
                  to="/plans"
                  className="btn-alive inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[#f58e43] px-5 text-sm font-semibold text-slate-950 shadow-[0_8px_24px_rgba(245,142,67,0.28)] transition hover:bg-[#ff9b4f] sm:w-auto"
                >
                  See plans
                </Link>
                <Link
                  to="/listings"
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border-2 border-[#0b2348] bg-white px-5 text-sm font-semibold text-[#0b2348] shadow-sm transition hover:border-[#f58e43] hover:bg-[#fff8f3] hover:text-[#b84a0f] sm:w-auto"
                >
                  View all listings
                </Link>
              </div>
            </RevealOnView>
            <RevealOnView variant="fade-up">
              <PropertyLandingCarousel properties={plotBuyTop} />
            </RevealOnView>
            {plotBuyTop.length === 0 ? (
              <p className="mt-8 text-center text-sm text-slate-500">
                No buy-property listings available yet.
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="landing-section bg-slate-200/35">
        <div className="landing-inner">
          <div className="landing-surface landing-surface--pad">
            <RevealOnView
              className="mb-8 flex w-full flex-wrap items-end justify-between gap-6 sm:mb-10 lg:mb-12 lg:gap-8"
              variant="fade-up"
            >
              <div className="min-w-0 max-w-3xl">
                <p className="text-xs font-medium tracking-[0.28em] text-[#f58e43] uppercase">
                  Installment
                </p>
                <h2 className="mt-2 text-[1.65rem] font-semibold tracking-tight text-slate-900 sm:text-[2rem]">
                  Top properties for installment plans
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-[0.9375rem]">
                  Fractional and extended-payment friendly picks — ranked by rating (up to {LANE_CARD_LIMIT}).
                </p>
              </div>
              <div className="flex w-full shrink-0 sm:w-auto sm:justify-end">
                <Link
                  to="/listings"
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border-2 border-[#0b2348] bg-white px-5 text-sm font-semibold text-[#0b2348] shadow-sm transition hover:border-[#f58e43] hover:bg-[#fff8f3] hover:text-[#b84a0f] sm:w-auto"
                >
                  View all listings
                </Link>
              </div>
            </RevealOnView>
            <RevealOnView variant="fade-up">
              <PropertyLandingCarousel properties={installmentTop} />
            </RevealOnView>
            {installmentTop.length === 0 ? (
              <p className="mt-8 text-center text-sm text-slate-500">
                No installment-friendly listings available yet.
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="landing-section overflow-x-clip">
        <div className="landing-inner">
          <div className="partners-shell">
            <RevealOnView className="mb-9 w-full sm:mb-10" variant="fade-up">
              <p className="text-xs font-medium tracking-[0.28em] text-[#f8ab71] uppercase">
                Partners
              </p>
              <h2 className="mt-2 text-[1.65rem] font-semibold tracking-tight text-[#f8fafc] sm:text-[2rem]">
                Trusted by global partners
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-200/90 sm:text-[0.9375rem]">
                Backed by brands and marketplaces that help us deliver secure,
                transparent, and scalable real-estate investing.
              </p>
            </RevealOnView>
            <div className="partner-slider rounded-2xl border border-white/15 bg-white/5 p-4 sm:p-5">
              <div className="partner-track partner-track-a">
                {marqueeLogosA.map((item, index) => (
                  <div
                    key={`${item.name}-a-${index}`}
                    className="partner-logo-pill"
                  >
                    <img
                      src={item.logo}
                      alt={item.name}
                      className="h-6 w-auto object-contain"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
              <div className="partner-track partner-track-b mt-3 sm:mt-4">
                {marqueeLogosB.map((item, index) => (
                  <div
                    key={`${item.name}-b-${index}`}
                    className="partner-logo-pill partner-logo-pill-soft"
                  >
                    <img
                      src={item.logo}
                      alt={item.name}
                      className="h-6 w-auto object-contain"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="landing-section">
        <div className="landing-inner">
          <div className="landing-surface landing-surface--pad">
            <RevealOnView className="mb-8 w-full sm:mb-10" variant="fade-up">
              <p className="text-xs font-medium tracking-[0.28em] text-[#f58e43] uppercase">
                FAQ
              </p>
              <h2 className="mt-2 text-[1.65rem] font-semibold tracking-tight text-slate-900 sm:text-[2rem]">
                Frequently asked questions
              </h2>
              <p className="mt-3 max-w-2xl text-sm text-slate-600">
                Common questions about investing, ownership, and how the platform works.
              </p>
            </RevealOnView>
            <RevealStagger className="grid gap-4">
              {faqItems.map((item) => (
                <details
                  key={item.question}
                  className="group rounded-2xl border border-slate-200/95 bg-slate-50/40 px-5 py-4 shadow-[0_10px_26px_rgba(15,23,42,0.05)] transition hover:border-slate-300 hover:bg-white hover:shadow-[0_14px_30px_rgba(15,23,42,0.09)] sm:px-6 sm:py-5"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[0.95rem] font-semibold leading-snug text-slate-900 marker:content-[''] sm:text-base">
                    <span>{item.question}</span>
                    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-300 text-sm font-bold text-slate-500 transition group-open:rotate-45 group-open:border-[#f58e43] group-open:text-[#f58e43]">
                      +
                    </span>
                  </summary>
                  <p className="group-open:animate-fade-in mt-3 border-t border-slate-100 pt-3 text-sm leading-7 text-slate-600">
                    {item.answer}
                  </p>
                </details>
              ))}
            </RevealStagger>
          </div>
        </div>
      </section>
      <section
        className="achievement-strip landing-section relative border-t border-slate-200/80 bg-gradient-to-b from-white via-[#f8fafc] to-[#eef2f9] text-slate-900"
        aria-labelledby="achievement-heading"
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-[#f58e43] to-transparent opacity-90"
          aria-hidden
        />
        <div className="relative landing-inner">
          <RevealOnView className="w-full" variant="fade-up">
            <p className="text-xs font-medium tracking-[0.28em] text-[#f58e43] uppercase sm:text-sm sm:tracking-[0.22em]">
              Our Achievement
            </p>
            <h2
              id="achievement-heading"
              className="mt-2 max-w-2xl text-[1.65rem] font-semibold tracking-tight text-[#0b2348] sm:mt-3 sm:text-[2rem]"
            >
              Our Awesome Success Story.
            </h2>
          </RevealOnView>
          <RevealStagger className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-3 sm:gap-5 lg:mt-12">
            <div className="metric-card border-l-[3px] border-l-[#f58e43] shadow-[0_10px_32px_rgba(15,23,42,0.08)]">
              <p>Featured Projects</p>
              <strong className="text-[#0b2348]">20K</strong>
            </div>
            <div className="metric-card border-l-[3px] border-l-[#f58e43] shadow-[0_10px_32px_rgba(15,23,42,0.08)]">
              <p>Luxury Houses</p>
              <strong className="text-[#0b2348]">100K</strong>
            </div>
            <div className="metric-card border-l-[3px] border-l-[#f58e43] shadow-[0_10px_32px_rgba(15,23,42,0.08)]">
              <p>Satisfied Clients</p>
              <strong className="text-[#0b2348]">150.5K</strong>
            </div>
          </RevealStagger>
        </div>
      </section>

    </main>
  )
}
