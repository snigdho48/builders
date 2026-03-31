import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"

import { PropertyCard } from "@/components/property-card"
import { getProperties } from "@/services/api"
import type { Property } from "@/types/domain"

const partnerNames = ["Trustpilot", "Google", "PropertyHub", "UrbanVest", "Prime Assets", "EstateFlow"]

const projects = [
  { id: "01", place: "California, US", listings: 7 },
  { id: "02", place: "Las Vegas, US", listings: 3 },
  { id: "03", place: "Melbourne, AU", listings: 13 },
  { id: "04", place: "New York, US", listings: 3 },
]

const team = [
  "Savannah Nguyen",
  "Annette Black",
  "Kathryn Murphy",
  "David Hardson",
]

const testimonials = [
  "Praesent ut lacus a velit tincidunt aliquam a eget urna. Sed ullamcorper tristique nisl at pharetra turpis accumsan et.",
  "Praesent ut lacus a velit tincidunt aliquam a eget urna. Sed ullamcorper tristique nisl at pharetra turpis accumsan et.",
  "Praesent ut lacus a velit tincidunt aliquam a eget urna. Sed ullamcorper tristique nisl at pharetra turpis accumsan et.",
]

const blogs = [
  "Top 8 Amazing Places to Stay in California",
  "The surfing man will adventure your mind",
  "Top 5 destinations & adventure travel",
]

const faqItems = [
  {
    question: "How does fractional investment work?",
    answer:
      "You buy selected blocks for fixed duration, then track installments and ROI in your dashboard.",
  },
  {
    question: "Can I directly buy blocks permanently?",
    answer:
      "Yes. Direct buy keeps long-term ownership and appears immediately in investment history.",
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

export function LandingPage() {
  const [properties, setProperties] = useState<Property[]>([])

  useEffect(() => {
    getProperties().then(setProperties)
  }, [])

  const featured = useMemo(() => properties.slice(0, 6), [properties])
  const totalBlocks = useMemo(
    () => properties.reduce((total, property) => total + property.total_blocks, 0),
    [properties]
  )
  const requirementProperties = useMemo(() => properties.slice(0, 6), [properties])

  return (
    <main className="bg-[#f6f7fb] text-slate-900">
      <section className="home-hero border-b border-white/10">
        <div className="mx-auto max-w-[1240px] px-4 pb-14 pt-18 sm:px-6">
          <div className="max-w-[1160px] space-y-4">
            <h1 className="text-[3.1rem] font-semibold leading-[1.08] text-white lg:text-[3.55rem]">
              Journey To Your Perfect Luxury Home
            </h1>
            <p className="max-w-[840px] text-[1.05rem] leading-8 text-slate-100/95">
              Explore premium opportunities with direct ownership and fractional investment plans.
              Track ROI, installments, and referrals in one modern dashboard.
            </p>
          </div>
          <div className="mt-10 flex gap-1.5">
            <button className="rounded-t-2xl bg-[#f26932] px-8 py-3.5 font-semibold text-white">
              Direct Buy
            </button>
            <button className="rounded-t-2xl border border-white/30 bg-[#22304a]/85 px-8 py-3.5 font-semibold text-white">
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
              <button className="rounded-xl bg-[#f58e43] py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-[#ff9b4f]">
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
        </div>
      </section>

      <section className="bg-[#0b2348]">
        <div className="mx-auto max-w-[1240px] px-4 py-16 sm:px-6">
          <p className="text-sm uppercase tracking-[0.22em] text-[#f58e43]">Our Achievement</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">Our Realhr Awesome Success Story.</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="metric-card">
              <p>Featured Projects</p>
              <strong>{properties.length || 20}K</strong>
            </div>
            <div className="metric-card">
              <p>Luxury Houses</p>
              <strong>{totalBlocks || 100}K</strong>
            </div>
            <div className="metric-card">
              <p>Satisfied Clients</p>
              <strong>150.5K</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-4 py-18 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#f58e43]">Top Listing</p>
            <h2 className="text-[2rem] font-semibold">Featured Properties</h2>
          </div>
          <Link to="/listings" className="text-sm text-[#f58e43] transition hover:text-[#ff9b4f]">
            View all listings
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-[1240px] gap-8 px-4 pb-18 sm:grid-cols-[1.15fr_1fr] sm:px-6">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
          <img
            src="https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1600&q=80"
            alt="advisors"
            className="h-full min-h-[380px] w-full object-cover"
          />
        </div>
        <article className="rounded-3xl border border-slate-200 bg-white p-6">
          <p className="text-xs uppercase tracking-[0.25em] text-[#f58e43]">About Us</p>
          <h3 className="mt-2 text-[1.7rem] font-semibold">Our Trusted Real Estate Advisors.</h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            It is a long established fact that a reader will be distracted by readable content
            while looking at layout. We provide friendly host support and secure investment flow.
          </p>
          <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-slate-600">
            <li>List your own property</li>
            <li>Friendly host & Fast support</li>
          </ul>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <article className="rounded-xl border border-slate-200 p-3">
              <h4 className="font-semibold">Hotel in Broklyn</h4>
              <p className="text-xs text-slate-500">6391 Elgin St. Celina</p>
            </article>
            <article className="rounded-xl border border-slate-200 p-3">
              <h4 className="font-semibold">Shopping mall</h4>
              <p className="text-xs text-slate-500">6391 Elgin St. Celina</p>
            </article>
          </div>
        </article>
      </section>

      <section className="mx-auto max-w-[1240px] px-4 pb-18 sm:px-6">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#f58e43]">Latest Project</p>
            <h2 className="text-[2rem] font-semibold">Meet Our Latest Real Estate Projects</h2>
          </div>
          <Link to="/listings" className="text-sm font-semibold text-[#f58e43]">
            Explore More
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {projects.map((item) => (
            <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-sm font-semibold text-[#f58e43]">{item.id}.</p>
              <h3 className="mt-2 text-lg font-semibold">{item.place}</h3>
              <p className="text-sm text-slate-500">{item.listings} Listings</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#0b2348] py-16">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.25em] text-[#f58e43]">Property By Requirement</p>
            <h2 className="text-[2rem] font-semibold text-white">Uncover Country Home</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {requirementProperties.map((property) => (
              <article key={`req-${property.id}`} className="overflow-hidden rounded-2xl bg-white">
                <img src={property.top_view_image} alt={property.title} className="h-44 w-full object-cover" />
                <div className="space-y-2 p-4">
                  <h3 className="text-lg font-semibold">{property.title}</h3>
                  <p className="text-sm text-slate-500">{property.location_name}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-[#f58e43]">${property.price_per_block}</span>
                    <Link to={`/properties/${property.id}`} className="font-semibold text-[#0b2348]">
                      Details
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] overflow-hidden px-4 pb-18 sm:px-6">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.25em] text-[#f58e43]">Partners</p>
          <h2 className="text-[2rem] font-semibold">Trusted by global partners</h2>
        </div>
        <div className="partner-slider rounded-2xl border border-white/10 bg-slate-900/70 py-4">
          <div className="partner-track">
            {[...partnerNames, ...partnerNames].map((name, index) => (
              <div key={`${name}-${index}`} className="partner-pill">
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0b2348] py-16">
        <div className="mx-auto max-w-[1240px] px-4 text-white sm:px-6">
          <p className="text-xs uppercase tracking-[0.25em] text-[#f58e43]">Facilities</p>
          <h2 className="mt-2 text-[2rem] font-semibold">Top Features</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <article className="metric-card"><p>Apartment</p><strong>6 Properties</strong></article>
            <article className="metric-card"><p>Villa</p><strong>8 Properties</strong></article>
            <article className="metric-card"><p>Commercial</p><strong>6 Properties</strong></article>
            <article className="metric-card"><p>Warehouse</p><strong>4 Properties</strong></article>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-4 py-18 sm:px-6">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.25em] text-[#f58e43]">Our Expert</p>
          <h2 className="text-[2rem] font-semibold">Meet Our Real Estate Team</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((name) => (
            <article key={name} className="rounded-2xl border border-slate-200 bg-white p-5 text-center">
              <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-slate-200" />
              <h3 className="font-semibold">{name}</h3>
              <p className="text-sm text-slate-500">Property Expert</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-4 pb-18 sm:px-6">
        <div className="rounded-3xl bg-[#0b2348] p-8 text-white">
          <p className="text-xs uppercase tracking-[0.25em] text-[#f58e43]">Download App</p>
          <h2 className="mt-2 text-[2rem] font-semibold">Download Our Real Estate Mobile App 15% Off</h2>
          <div className="mt-6 flex flex-wrap gap-3">
            <button className="rounded-full bg-white px-5 py-3 font-semibold text-[#0b2348]">Apps Store</button>
            <button className="rounded-full bg-white px-5 py-3 font-semibold text-[#0b2348]">Google Play</button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-4 pb-18 sm:px-6">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.25em] text-[#f58e43]">Testimonials</p>
          <h2 className="text-[2rem] font-semibold">Latest Client Feedback</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {testimonials.map((text, idx) => (
            <article key={`t-${idx}`} className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-sm leading-7 text-slate-600">{text}</p>
              <p className="mt-4 font-semibold">Client {idx + 1}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-4 pb-18 sm:px-6">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#f58e43]">Blog & News</p>
            <h2 className="text-[2rem] font-semibold">Our Latest News Update</h2>
          </div>
          <Link to="/listings" className="text-sm font-semibold text-[#f58e43]">
            View All Post
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {blogs.map((title) => (
            <article key={title} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="mb-4 h-40 rounded-xl bg-slate-200" />
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-slate-500">There are many variations of but the majority have free text.</p>
              <button className="mt-3 text-sm font-semibold text-[#f58e43]">Read More</button>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-4 pb-20 sm:px-6">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.25em] text-[#f58e43]">FAQ</p>
          <h2 className="text-[2rem] font-semibold">Frequently asked questions</h2>
        </div>
        <div className="grid gap-4">
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
        </div>
      </section>
    </main>
  )
}
