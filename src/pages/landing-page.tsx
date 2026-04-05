import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"

import { RevealOnView, RevealStagger } from "@/components/motion/reveal-on-view"
import { PropertyCard } from "@/components/property-card"
import { getProperties } from "@/services/api"
import type { Property } from "@/types/domain"
import { pickInstallmentTop, pickPlotBuyTop } from "@/utils/property-lanes"

const partnerNames = ["Trustpilot", "Google", "PropertyHub", "UrbanVest", "Prime Assets", "EstateFlow"]

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

export function LandingPage() {
  const [properties, setProperties] = useState<Property[]>([])

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
    <main className="bg-[#f6f7fb] text-slate-900">
      <section className="home-hero border-b border-white/10">
        <div className="mx-auto max-w-[1240px] px-4 pb-14 pt-18 sm:px-6">
          <RevealOnView className="w-full" variant="fade-up">
            <div className="max-w-[1160px] space-y-4">
              <h1 className="text-[3.1rem] font-semibold leading-[1.08] text-white lg:text-[3.55rem]">
                Journey To Your Perfect Luxury Home
              </h1>
              <p className="max-w-[840px] text-[1.05rem] leading-8 text-slate-100/95">
                Explore premium opportunities with plot buy and installment investment plans.
                Track ROI, installments, and referrals in one modern dashboard.
              </p>
            </div>
            <div className="mt-10 flex gap-1.5">
              <button
                type="button"
                className="btn-alive rounded-t-2xl bg-[#f26932] px-8 py-3.5 font-semibold text-white shadow-[0_8px_28px_rgb(242_105_50/35%)] hover:brightness-105"
              >
                Plot Buy
              </button>
              <button
                type="button"
                className="rounded-t-2xl border border-white/30 bg-[#22304a]/85 px-8 py-3.5 font-semibold text-white transition-[transform,background-color,border-color] duration-300 hover:border-white/45 hover:bg-[#2a3d5c]/90 active:scale-[0.98] motion-reduce:active:scale-100"
              >
                Installment
              </button>
            </div>
            <div className="glass-panel rounded-tl-none p-5 sm:p-6">
              <div className="grid gap-3 sm:grid-cols-[1.15fr_1fr_1fr_0.95fr]">
                <input className="template-input" placeholder="Keyword" />
                <select className="template-input">
                  <option>Category</option>
                  <option>Apartment</option>
                  <option>Villa</option>
                  <option>Commercial</option>
                </select>
                <input className="template-input" placeholder="Location" />
                <button
                  type="button"
                  className="btn-alive rounded-xl bg-[#f58e43] py-3.5 text-sm font-semibold text-slate-950 hover:bg-[#ff9b4f]"
                >
                  Search
                </button>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                <span className="rounded-full bg-white/12 px-3 py-1 text-white">Commercial</span>
                <span className="rounded-full bg-white/12 px-3 py-1 text-white">Apartment</span>
                <span className="rounded-full bg-white/12 px-3 py-1 text-white">Sales</span>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <article className="rounded-2xl border border-white/15 bg-[#072349]/80 px-4 py-3 text-white">
                <p className="text-xs text-slate-300">Trustpilot</p>
                <p className="text-sm font-semibold">450+ reviews</p>
              </article>
              <article className="rounded-2xl border border-white/15 bg-[#072349]/80 px-4 py-3 text-white">
                <p className="text-xs text-slate-300">Google</p>
                <p className="text-sm font-semibold">450+ reviews</p>
              </article>
            </div>
          </RevealOnView>
        </div>
      </section>

      <section className="bg-[#0b2348]">
        <div className="mx-auto max-w-[1240px] px-4 py-16 sm:px-6">
          <RevealOnView className="w-full" variant="fade-up">
            <p className="text-sm uppercase tracking-[0.22em] text-[#f58e43]">Our Achievement</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Our Realhr Awesome Success Story.</h2>
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

      <section className="mx-auto max-w-7xl px-4 py-18 sm:px-6">
        <RevealOnView className="mb-8 flex w-full flex-wrap items-end justify-between gap-4" variant="fade-up">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#f58e43]">Plot buy</p>
            <h2 className="text-[2rem] font-semibold">Top properties for plot buy</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Whole land and per-block listings — best for upfront, full ownership style buys (up to{" "}
              {LANE_CARD_LIMIT}).
            </p>
          </div>
          <Link to="/listings" className="text-sm text-[#f58e43] transition hover:text-[#ff9b4f]">
            View all listings
          </Link>
        </RevealOnView>
        <div className="grid auto-rows-fr gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {plotBuyTop.map((property) => (
            <div key={`plot-${property.id}`} className="min-h-0 min-w-0">
              <PropertyCard property={property} />
            </div>
          ))}
        </div>
        {plotBuyTop.length === 0 ? (
          <p className="mt-6 text-center text-sm text-slate-500">No plot-buy listings available yet.</p>
        ) : null}
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-18 sm:px-6">
        <RevealOnView className="mb-8 flex w-full flex-wrap items-end justify-between gap-4" variant="fade-up">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#f58e43]">Installment</p>
            <h2 className="text-[2rem] font-semibold">Top properties for installment plans</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Fractional and extended-payment friendly picks — ranked by rating (up to {LANE_CARD_LIMIT}).
            </p>
          </div>
          <Link to="/listings" className="text-sm text-[#f58e43] transition hover:text-[#ff9b4f]">
            View all listings
          </Link>
        </RevealOnView>
        <div className="grid auto-rows-fr gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {installmentTop.map((property) => (
            <div key={`inst-${property.id}`} className="min-h-0 min-w-0">
              <PropertyCard property={property} />
            </div>
          ))}
        </div>
        {installmentTop.length === 0 ? (
          <p className="mt-6 text-center text-sm text-slate-500">No installment-friendly listings available yet.</p>
        ) : null}
      </section>

      <section className="mx-auto max-w-[1240px] overflow-hidden px-4 pb-18 sm:px-6">
        <div className="partners-shell">
          <RevealOnView className="mb-6 w-full" variant="fade-up">
            <p className="text-xs uppercase tracking-[0.25em] text-[#f8ab71]">Partners</p>
            <h2 className="text-[2rem] font-semibold text-white">Trusted by global partners</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-200/90">
              Backed by brands and marketplaces that help us deliver secure, transparent, and scalable
              real-estate investing.
            </p>
          </RevealOnView>
          <div className="partner-slider rounded-2xl border border-white/15 bg-white/5 py-4">
            <div className="partner-track">
              {[...partnerNames, ...partnerNames].map((name, index) => (
                <div key={`${name}-${index}`} className="partner-pill">
                  {name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-4 pb-20 sm:px-6">
        <RevealOnView className="mb-6 w-full" variant="fade-up">
          <p className="text-xs uppercase tracking-[0.25em] text-[#f58e43]">FAQ</p>
          <h2 className="text-[2rem] font-semibold">Frequently asked questions</h2>
        </RevealOnView>
        <RevealStagger className="grid gap-4">
          {faqItems.map((item) => (
            <details
              key={item.question}
              className="group rounded-2xl border border-white/10 bg-slate-900/70 p-5"
            >
              <summary className="cursor-pointer list-none font-medium text-white">
                {item.question}
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-300 group-open:animate-fade-in">
                {item.answer}
              </p>
            </details>
          ))}
        </RevealStagger>
      </section>
    </main>
  )
}
