import { useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import { Link } from "react-router-dom"
import { Autoplay, Pagination } from "swiper/modules"
import { Swiper, SwiperSlide } from "swiper/react"

import { RevealOnView, RevealStagger } from "@/components/motion/reveal-on-view"
import { PropertyCard } from "@/components/property-card"
import { getProperties } from "@/services/api"
import type { Property } from "@/types/domain"
import { pickInstallmentTop, pickPlotBuyTop } from "@/utils/property-lanes"

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
      "Yes. Plot buy keeps long-term ownership and appears immediately in investment history.",
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
const welcomePoints = [
  "Proactively pontificate client",
  "Is there a waiting list for desired",
  "Immediate 24/ 7 Emergency",
]

export function LandingPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [isVideoOpen, setIsVideoOpen] = useState(false)
  const heroSlides = useMemo(() => ["/1%25-intereste-jomir-malik.png", "/50%25-registration.png"], [])

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
    <main className="relative bg-[#f6f7fb] text-slate-900">
      <section className="home-hero border-b border-white/10">
        <div className="mx-auto flex h-full min-h-0 w-full max-w-full flex-col justify-center px-4 py-4 sm:px-6 sm:py-5">
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
      <section className="mx-auto max-w-7xl px-4 pt-24 pb-10 sm:px-6 sm:pt-28">
        <RevealOnView
          className="mb-10 flex w-full flex-wrap items-end justify-between gap-5"
          variant="fade-up"
        >
          <div>
            <p className="text-xs tracking-[0.25em] text-[#f58e43] uppercase">
              Plot buy
            </p>
            <h2 className="mt-1 text-[2rem] font-semibold tracking-tight text-slate-900">
              Top properties for plot buy
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
              Whole land and per-block listings — best for upfront, full
              ownership style buys (up to {LANE_CARD_LIMIT}).
            </p>
          </div>
          <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
            <Link
              to="/plans"
              className="btn-alive inline-flex min-h-[2.75rem] w-full items-center justify-center rounded-xl bg-[#f58e43] px-5 text-sm font-semibold text-slate-950 shadow-[0_8px_24px_rgba(245,142,67,0.28)] transition hover:bg-[#ff9b4f] sm:w-auto"
            >
              See plans
            </Link>
            <Link
              to="/listings"
              className="inline-flex min-h-[2.75rem] w-full items-center justify-center rounded-xl border-2 border-[#0b2348] bg-white px-5 text-sm font-semibold text-[#0b2348] shadow-sm transition hover:border-[#f58e43] hover:bg-[#fff8f3] hover:text-[#b84a0f] sm:w-auto"
            >
              View all listings
            </Link>
          </div>
        </RevealOnView>
        <div className="grid auto-rows-fr gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {plotBuyTop.map((property) => (
            <div key={`plot-${property.id}`} className="min-h-0 min-w-0">
              <PropertyCard property={property} />
            </div>
          ))}
        </div>
        {plotBuyTop.length === 0 ? (
          <p className="mt-6 text-center text-sm text-slate-500">
            No plot-buy listings available yet.
          </p>
        ) : null}
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-24 pb-10 sm:px-6 sm:pt-28">
        <RevealOnView
          className="mb-10 flex w-full flex-wrap items-end justify-between gap-5"
          variant="fade-up"
        >
          <div>
            <p className="text-xs tracking-[0.25em] text-[#f58e43] uppercase">
              Installment
            </p>
            <h2 className="mt-1 text-[2rem] font-semibold tracking-tight text-slate-900">
              Top properties for installment plans
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
              Fractional and extended-payment friendly picks — ranked by rating
              (up to {LANE_CARD_LIMIT}).
            </p>
          </div>
          <div className="flex w-full shrink-0 sm:w-auto sm:justify-end">
            <Link
              to="/listings"
              className="inline-flex min-h-[2.75rem] w-full items-center justify-center rounded-xl border-2 border-[#0b2348] bg-white px-5 text-sm font-semibold text-[#0b2348] shadow-sm transition hover:border-[#f58e43] hover:bg-[#fff8f3] hover:text-[#b84a0f] sm:w-auto"
            >
              View all listings
            </Link>
          </div>
        </RevealOnView>
        <div className="grid auto-rows-fr gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {installmentTop.map((property) => (
            <div key={`inst-${property.id}`} className="min-h-0 min-w-0">
              <PropertyCard property={property} />
            </div>
          ))}
        </div>
        {installmentTop.length === 0 ? (
          <p className="mt-6 text-center text-sm text-slate-500">
            No installment-friendly listings available yet.
          </p>
        ) : null}
      </section>

      <section className="mx-auto max-w-[1240px] overflow-hidden px-4 pt-24 pb-16 sm:px-6 sm:pt-28">
        <div className="partners-shell">
          <RevealOnView className="mb-8 w-full" variant="fade-up">
            <p className="text-xs tracking-[0.25em] text-[#f8ab71] uppercase">
              Partners
            </p>
            <h2 className="mt-1 text-[2rem] font-semibold tracking-tight text-[#f8fafc]">
              Trusted by global partners
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-200/90">
              Backed by brands and marketplaces that help us deliver secure,
              transparent, and scalable real-estate investing.
            </p>
          </RevealOnView>
          <div className="partner-slider rounded-2xl border border-white/15 bg-white/5 p-3 sm:p-4">
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
      </section>
      <section className="mx-auto max-w-[1240px] px-4 pt-24 pb-24 sm:px-6 sm:pt-28">
        <RevealOnView className="mb-8 w-full" variant="fade-up">
          <p className="text-xs tracking-[0.25em] text-[#f58e43] uppercase">
            FAQ
          </p>
          <h2 className="mt-1 text-[2rem] font-semibold tracking-tight text-slate-900">
            Frequently asked questions
          </h2>
        </RevealOnView>
        <RevealStagger className="grid gap-3">
          {faqItems.map((item) => (
            <details
              key={item.question}
              className="group rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-[0_10px_26px_rgba(15,23,42,0.06)] transition hover:border-slate-300 hover:shadow-[0_14px_30px_rgba(15,23,42,0.1)]"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-slate-900 marker:content-['']">
                <span>{item.question}</span>
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-300 text-sm font-bold text-slate-500 transition group-open:rotate-45 group-open:border-[#f58e43] group-open:text-[#f58e43]">
                  +
                </span>
              </summary>
              <p className="group-open:animate-fade-in mt-3 border-t border-slate-100 pt-3 text-sm leading-7 text-slate-600">
                {item.answer}
              </p>
            </details>
          ))}
        </RevealStagger>
      </section>
      <section className="bg-[#0b2348]">
        <div className="mx-auto max-w-[1240px] px-4 pt-24 pb-20 sm:px-6 sm:pt-28">
          <RevealOnView className="w-full" variant="fade-up">
            <p className="text-sm tracking-[0.22em] text-[#f58e43] uppercase">
              Our Achievement
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#f8fafc]">
              Our Awesome Success Story.
            </h2>
          </RevealOnView>
          <RevealStagger className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="metric-card">
              <p>Featured Projects</p>
              <strong>20K</strong>
            </div>
            <div className="metric-card">
              <p>Luxury Houses</p>
              <strong>100K</strong>
            </div>
            <div className="metric-card">
              <p>Satisfied Clients</p>
              <strong>150.5K</strong>
            </div>
          </RevealStagger>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-4 pt-24 pb-20 sm:px-6 sm:pt-28">
        <div className="welcome-homirx">
          <RevealOnView className="welcome-homirx-left" variant="fade-up">
            <div className="about-one__single">
              <div className="about-one__image">
                <div className="image-inner">
                  <img src="image-01.jpg" alt="Welcome property" />
                </div>
              </div>
              <Link
                to="/about"
                aria-label="About page"
                className="about-one__link-overlay"
              />
            </div>
            <div className="video-two__single">
              <div className="video-two__inner">
                <div className="video-two__content">
                  <div className="video-two__action">
                    <span className="video-two__icon">▶</span>
                  </div>
                  <svg
                    className="video-two__rotatingText"
                    viewBox="0 0 200 200"
                    width="200"
                    height="200"
                  >
                    <defs>
                      <path
                        id="welcome-circle-text"
                        d="M 100, 100 m -75, 0 a 75, 75 0 1, 0 150, 0 a 75, 75 0 1, 0 -150, 0"
                      />
                    </defs>
                    <text>
                      <textPath
                        href="#welcome-circle-text"
                        className="video-two__title"
                      >
                        PLAY INTRO VIDEO - PLAY INTRO VIDEO -
                      </textPath>
                    </text>
                  </svg>
                  <button
                    type="button"
                    className="video-two__link"
                    aria-label="Play intro video"
                    onClick={() => setIsVideoOpen(true)}
                  />
                </div>
              </div>
            </div>
          </RevealOnView>

          <RevealOnView className="welcome-homirx-right" variant="fade-up">
            <div className="sub-title">
              <span className="tagline">About Company</span>
            </div>
            <h2 className="welcome-title">
              <span>Welcome To Properties</span>
            </h2>
            <p className="welcome-desc">
              It is a long established fact that a reader will be distracted the
              readable content of a page when looking at layout the point of
              using lorem the is Ipsum less normal distribution of letters.
            </p>

            <ul className="welcome-list">
              {welcomePoints.map((point) => (
                <li key={point}>
                  <span className="welcome-list-icon">→</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            <div className="welcome-bottom">
              <Link to="/about" className="btn-theme-2">
                <span className="btn-icon">⌂</span>
                Explore More
              </Link>

              <div className="welcome-counters">
                <div className="milestone-one__single">
                  <div className="milestone-one__content">
                    <div className="milestone-one__number">30k+</div>
                    <div className="milestone-one__title">
                      Satisficed Client
                    </div>
                  </div>
                </div>
                <div className="milestone-one__single">
                  <div className="milestone-one__content">
                    <div className="milestone-one__number">700+</div>
                    <div className="milestone-one__title">House</div>
                  </div>
                </div>
              </div>
            </div>
          </RevealOnView>
        </div>
      </section>

      {isVideoOpen
        ? createPortal(
            <div
              className="video-modal-overlay"
              role="dialog"
              aria-modal="true"
              onClick={() => setIsVideoOpen(false)}
            >
              <div
                className="video-modal-body"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  className="video-modal-close"
                  aria-label="Close video"
                  onClick={() => setIsVideoOpen(false)}
                >
                  ×
                </button>
                <iframe
                  className="video-modal-frame"
                  src="https://www.youtube.com/embed/QmfVLaBan5I?autoplay=1&rel=0"
                  title="Intro video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>,
            document.body
          )
        : null}
    </main>
  )
}
