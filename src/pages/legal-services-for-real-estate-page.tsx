import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCheck } from "@fortawesome/free-solid-svg-icons"
import { Link } from "react-router-dom"
import { Autoplay, Pagination } from "swiper/modules"
import { Swiper, SwiperSlide } from "swiper/react"

import { RevealOnView } from "@/components/motion/reveal-on-view"

const SY = "https://www.squareyards.com"
const PROP_IMG = (file: string) => `https://img.squareyards.com/propamcsubscription/${file}`
const ASSET = (path: string) => `${SY}${path.startsWith("/") ? path : `/${path}`}`

type FeaturedService = {
  title: string
  icon: string
  bullets: string[]
  samplePdf: string
  price: string
  was: string
  stat: { value: string; label: string }
}

const FEATURED: FeaturedService[] = [
  {
    title: "Documents Review",
    icon: "63b049fd-af09-453f-845f-12768b1bcdd0.svg",
    bullets: [
      "Recommended for property buyers",
      "Legal documents are reviewed by an in-house expert",
      "Analyses property documents and compliance issues",
    ],
    samplePdf: "e62dfb12-cd9d-4f74-a945-9d49d9a8fa0c.pdf",
    price: "FREE",
    was: "₹ 2,500",
    stat: { value: "100+", label: "Cases Handled" },
  },
  {
    title: "Legal Power of Attorney",
    icon: "326f0470-61d5-4667-b21f-19a96e028eaf.svg",
    bullets: [
      "Gives an attorney-in-charge the authority to act for specific rights",
      "Issued for consideration or interest for a fixed period of time",
      "Incompetent to eliminate the lack of payment capacity",
    ],
    samplePdf: "dcb7c7e6-8985-4654-afad-53c2319d492b.pdf",
    price: "₹ 5,500",
    was: "₹ 9,000",
    stat: { value: "150", label: "POA Executed" },
  },
  {
    title: "Project Monitoring Report",
    icon: "a4e711c6-4383-461c-95fd-21b9d61731fb.svg",
    bullets: [
      "Meant especially for under-construction projects",
      "Tracks the developments and recent transactions",
      "Includes legal permissions and litigation queries",
    ],
    samplePdf: "a3f96fde-3d1d-4204-8247-aa7537ece709.pdf",
    price: "₹ 5,500",
    was: "₹ 10,000",
    stat: { value: "80", label: "Projects Monitored" },
  },
  {
    title: "Property Complaints",
    icon: "d69625ca-05a9-46e3-8633-296a13c1c6e3.svg",
    bullets: [
      "Includes assessment of the complaint and the best route to take",
      "Sends legal letter to the Developer / Seller for refunds / Settlement",
      "Files case in appropriate courts - RERA, Consumer, NCLT, Arbitration",
    ],
    samplePdf: "72f86024-ffa0-4538-807f-afafcd6f080d.pdf",
    price: "₹ 27,500",
    was: "₹ 75,000",
    stat: { value: "75+", label: "Complaints Filed" },
  },
]

type GridService = {
  title: string
  icon: string
  bullets: string[]
  samplePdf: string
  price: string
  was: string
}

const LITIGATION: GridService[] = [
  {
    title: "Documents Review",
    icon: "63b049fd-af09-453f-845f-12768b1bcdd0.svg",
    bullets: [
      "Recommended for property buyers",
      "Legal documents are reviewed by an in-house expert",
      "Analyses property documents and compliance issues",
    ],
    samplePdf: "e62dfb12-cd9d-4f74-a945-9d49d9a8fa0c.pdf",
    price: "FREE",
    was: "₹ 2,500",
  },
  {
    title: "Legal Power of Attorney",
    icon: "326f0470-61d5-4667-b21f-19a96e028eaf.svg",
    bullets: [
      "Gives an attorney-in-charge the authority to act for specific rights",
      "Issued for consideration or interest for a fixed period of time",
      "Incompetent to eliminate the lack of payment capacity",
    ],
    samplePdf: "dcb7c7e6-8985-4654-afad-53c2319d492b.pdf",
    price: "₹ 5,500",
    was: "₹ 9,000",
  },
  {
    title: "Lease Agreement",
    icon: "ecf91986-c01f-4cae-8c52-6c2803b4a576.svg",
    bullets: [
      "A legal contract between a lessor and lessee",
      "Constitutes all requisites when a lessor engages with a lessee",
      "Allows the lessee to rent a property for a certain period",
    ],
    samplePdf: "62f2ce78-4e1b-4bab-9e8c-8d45668e94b4.pdf",
    price: "₹ 2,750",
    was: "₹ 10,000",
  },
  {
    title: "Sale Agreement",
    icon: "59bde20b-dbcb-4d3c-ba0e-69b25f3ddf99.svg",
    bullets: [
      "Includes all the regulations about the sale of a property",
      "Executed by a developer or a seller",
      "Constitutes all financial terms",
    ],
    samplePdf: "5b4eb2e3-26d3-45c2-b4e2-0709cedd803a.pdf",
    price: "₹ 5,500",
    was: "₹ 15,000",
  },
  {
    title: "Comprehensive Due Diligence",
    icon: "e4e8c25c-ca50-467b-ba23-a2b568c6a8d7.svg",
    bullets: [
      "Analyses the property documents and compliance issues",
      "Verifies title search and mortgage checks",
      "Used for property valuation reports and verifying documents",
    ],
    samplePdf: "3178dc8b-5471-43d4-b7fd-e88c11a3793e.pdf",
    price: "₹ 11,000",
    was: "₹ 20,000",
  },
  {
    title: "Property Complaints",
    icon: "d69625ca-05a9-46e3-8633-296a13c1c6e3.svg",
    bullets: [
      "Includes assessment of the complaint and the best route to take",
      "Sends legal letter to the Developer / Seller for refunds / Settlement",
      "Files case in appropriate courts - RERA, Consumer, NCLT, Arbitration",
    ],
    samplePdf: "72f86024-ffa0-4538-807f-afafcd6f080d.pdf",
    price: "₹ 27,500",
    was: "₹ 75,000",
  },
  {
    title: "Title Search",
    icon: "91ed3e12-91e2-47a7-93f9-94f4d14cfe1c.svg",
    bullets: [
      "Determines various facets of a property history",
      "Helps in assessing the present titleholder",
      "Examines public records to confirm ownership of property",
    ],
    samplePdf: "a8fec36f-885d-4b20-a8ce-f72d3c53f9d4.pdf",
    price: "₹ 5,500",
    was: "₹ 10,000",
  },
  {
    title: "Litigation Search",
    icon: "b18bf7ee-1e9e-4d71-a71a-2c8fa68f5a73.svg",
    bullets: [
      "Refers to actions contested in court",
      "Investigates charges levied on property sellers",
      "Deals with active, pending and disposed off cases",
    ],
    samplePdf: "7ec375eb-7978-46ed-a3b2-d5d7ec156696.pdf",
    price: "₹ 1,650",
    was: "₹ 3,000",
  },
]

const MONITORING: GridService[] = [
  {
    title: "Project Monitoring Report",
    icon: "a4e711c6-4383-461c-95fd-21b9d61731fb.svg",
    bullets: [
      "Meant especially for under-construction projects",
      "Tracks the developments and recent transactions",
      "Includes legal permissions and litigation queries",
    ],
    samplePdf: "a3f96fde-3d1d-4204-8247-aa7537ece709.pdf",
    price: "₹ 5,500",
    was: "₹ 10,000",
  },
]

const PLATFORM = [
  {
    title: "Inhouse Experts",
    icon: ASSET("/assets/images/propsamc-common-services/icons/platform-icon-1.svg"),
    text: "Legal experts with 3–6 years' experience in real estate, worked in leading law firms to deliver practical outcomes.",
  },
  {
    title: "Simple to Complex Issues",
    icon: ASSET("/assets/images/propsamc-common-services/icons/platform-icon-2.svg"),
    text: "From vetting and drafting to complaints, notices, and wills — all under one roof, including support with established firms.",
  },
  {
    title: "Cost Efficient",
    icon: ASSET("/assets/images/propsamc-common-services/icons/platform-icon-3.svg"),
    text: "We aim to deliver the best services at competitive cost; where processes are standardised, service stays personalised.",
  },
]

function ServiceCardGrid({
  item,
  showStatFooter,
  className = "",
}: {
  item: GridService | FeaturedService
  showStatFooter?: boolean
  className?: string
}) {
  const stat = "stat" in item ? item.stat : undefined
  return (
    <article
      className={`legal-sy-tile flex h-full min-h-0 flex-col rounded-lg border border-neutral-200/90 bg-white p-4 shadow-[0_1px_8px_rgba(0,0,0,0.06)] sm:p-5 ${className}`.trim()}
    >
      <div className="flex shrink-0 items-start justify-between gap-2">
        <figure className="m-0 flex h-11 shrink-0 items-center sm:h-12">
          <img
            src={PROP_IMG(item.icon)}
            alt=""
            className="max-h-9 w-auto max-w-[5.5rem] object-contain sm:max-h-10 sm:max-w-[6rem]"
            loading="lazy"
            decoding="async"
          />
        </figure>
        <a
          href={PROP_IMG(item.samplePdf)}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-full border border-[#e6c200] bg-[#fff9e6] px-2.5 py-0.5 text-[11px] font-semibold leading-tight text-neutral-900 hover:bg-[#fff3cc] sm:text-xs"
        >
          Sample Report
        </a>
      </div>
      <h3 className="mt-3 line-clamp-2 text-[0.95rem] font-semibold leading-snug tracking-tight text-neutral-900 sm:text-base">
        {item.title}
      </h3>
      <ul className="mt-2.5 shrink-0 space-y-1.5 text-xs font-medium leading-snug text-neutral-600 sm:text-[0.8125rem] sm:leading-snug">
        {item.bullets.map((b) => (
          <li
            key={b}
            className="relative pl-3.5 before:absolute before:left-0 before:top-[0.4em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-neutral-300 before:content-['']"
          >
            {b}
          </li>
        ))}
      </ul>
      {/* Fills remaining vertical space so price + CTA align across cards in a row */}
      <div className="min-h-0 flex-1" aria-hidden />
      <div className="shrink-0 space-y-2.5 border-t border-neutral-100 pt-3">
        <div className="flex flex-wrap items-baseline justify-end gap-x-2 gap-y-0.5 text-right">
          <span className="text-lg font-bold tabular-nums tracking-tight text-neutral-900 sm:text-xl">{item.price}</span>
          <span className="text-xs font-medium text-neutral-400 line-through sm:text-sm">{item.was}</span>
        </div>
        <Link
          to={`/contact?topic=legal&service=${encodeURIComponent(item.title)}`}
          className="legal-sy-book flex h-9 w-full items-center justify-center rounded-md bg-[#ffd916] text-sm font-bold text-neutral-900 transition hover:brightness-[0.98] active:brightness-95"
        >
          Book Now
        </Link>
      </div>
      {showStatFooter && stat ? (
        <div className="legal-sy-tile-foot -mx-4 -mb-4 mt-3 flex h-10 items-center justify-center gap-1.5 rounded-b-[0.45rem] bg-[#fff7da] text-neutral-900 sm:-mx-5 sm:-mb-5">
          <strong className="text-lg font-semibold tabular-nums sm:text-xl">{stat.value}</strong>
          <span className="text-xs font-medium sm:text-sm">{stat.label}</span>
        </div>
      ) : null}
    </article>
  )
}

export function LegalServicesForRealEstatePage() {
  const [tab, setTab] = useState<0 | 1>(0)
  const grid = tab === 0 ? LITIGATION : MONITORING

  return (
    <main className="legal-sy-page min-w-0 bg-[#f1f1f1] text-neutral-700">
      {/* Hero */}
      <section className="legal-sy-hero relative isolate min-h-[min(100svh,52rem)] overflow-hidden pt-28 text-white md:min-h-[36rem] md:pt-32">
        <picture className="pointer-events-none absolute inset-0 -z-10">
          <source media="(max-width: 540px)" srcSet={ASSET("/assets/images/propsamc-common-services/icons/prop-amc-cover-mobile.svg")} />
          <source media="(max-width: 1024px)" srcSet={ASSET("/assets/images/propsamc-common-services/icons/prop-amc-cover-tab.svg")} />
          <img
            src={ASSET("/assets/images/propsamc-common-services/icons/prop-amc-cover-v2.svg")}
            alt=""
            className="h-full w-full object-cover object-center"
            loading="eager"
            decoding="async"
          />
        </picture>
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#1e0f3d]/85 via-[#1a1a2e]/55 to-[#0d3d38]/80" />
        <div className="landing-inner relative pb-16 pt-8 md:pb-20 md:pt-12">
     
          <div className="mt-8 max-w-xl">
            <h1 className="text-[clamp(1.75rem,5vw,2.75rem)] font-bold leading-tight tracking-tight text-white">
              Legal Services for <br className="hidden sm:block" />
              Real Estate
            </h1>
            <ul className="mt-6 space-y-3 text-base font-semibold leading-relaxed text-white/95 sm:text-lg">
              <li className="flex gap-3">
                <FontAwesomeIcon icon={faCheck} className="mt-1 shrink-0 text-[#ffd916]" />
                Inhouse &amp; Experienced Team of Experts
              </li>
              <li className="flex gap-3">
                <FontAwesomeIcon icon={faCheck} className="mt-1 shrink-0 text-[#ffd916]" />
                Simple to complex property issues
              </li>
              <li className="flex gap-3">
                <FontAwesomeIcon icon={faCheck} className="mt-1 shrink-0 text-[#ffd916]" />
                Cost-Efficient Services at your doorstep
              </li>
            </ul>
            <p className="mt-6 text-lg font-semibold text-white">Starting at ₹ 1,499 only</p>

            <Link
              to="/contact?topic=legal"
              className="mt-8 inline-flex h-12 items-center gap-2 rounded-full border border-white/30 bg-white px-8 text-sm font-semibold text-neutral-900 shadow-lg transition hover:bg-white/95"
            >
              Contact Us
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Most utilized */}
      <section className="py-12 md:py-16">
        <div className="landing-inner">
          <RevealOnView className="w-full" variant="fade-up">
            <h2 className="text-2xl font-semibold text-neutral-900 md:text-[1.65rem]">Most Utilized Services</h2>
          </RevealOnView>
          <div className="relative mt-8 md:mt-10">
            <Swiper
              modules={[Pagination, Autoplay]}
              spaceBetween={16}
              slidesPerView={1.08}
              centeredSlides={false}
              pagination={{ clickable: true }}
              autoplay={{ delay: 5200, disableOnInteraction: true }}
              breakpoints={{
                640: { slidesPerView: 1.35, spaceBetween: 16 },
                900: { slidesPerView: 2, spaceBetween: 20 },
                1200: { slidesPerView: 3, spaceBetween: 20 },
              }}
              className="legal-sy-featured-swiper !pb-12"
            >
              {FEATURED.map((s) => (
                <SwiperSlide key={s.title} className="legal-sy-slide flex h-auto">
                  <div className="mx-auto flex min-h-0 w-full max-w-[20.5rem] flex-1 flex-col sm:max-w-none">
                    <ServiceCardGrid item={s} showStatFooter className="min-h-0 w-full flex-1" />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>

      {/* Top property services */}
      <section className="pb-14 md:pb-20">
        <div className="landing-inner">
          <h2 className="text-2xl font-semibold text-neutral-900 md:text-[1.65rem]">Top Property Services</h2>
          <div
            role="tablist"
            aria-label="Service categories"
            className="mt-6 flex gap-3 border-b border-neutral-200"
          >
            {(["Litigation Services", "Monitoring and Valuation"] as const).map((label, i) => (
              <button
                key={label}
                type="button"
                role="tab"
                aria-selected={tab === i}
                className={`relative pb-3 pl-1 pr-3 text-sm font-semibold transition md:text-base ${
                  tab === i ? "text-neutral-900" : "text-neutral-500 hover:text-neutral-800"
                }`}
                onClick={() => setTab(i as 0 | 1)}
              >
                {label}
                {tab === i ? (
                  <span className="absolute bottom-0 left-0 h-0.5 w-full bg-neutral-800" />
                ) : null}
              </button>
            ))}
          </div>
          <div
            className="mt-8 grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-4 sm:gap-y-4"
            role="tabpanel"
          >
            {grid.map((item) => (
              <div key={item.title} className="flex min-h-0 min-w-0">
                <ServiceCardGrid item={item} className="min-h-full w-full flex-1" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform */}
      <section className="border-t border-neutral-200/80 bg-white py-14 md:py-16">
        <div className="landing-inner">
          <h2 className="text-2xl font-semibold text-neutral-900">The Platform</h2>
          <p className="mt-2 max-w-3xl text-base text-neutral-600">
            One-stop destination for best online asset management &amp; diligence
          </p>
          <div className="mt-10 grid auto-rows-fr gap-4 md:grid-cols-3 md:gap-5">
            {PLATFORM.map((p) => (
              <div
                key={p.title}
                className="flex h-full min-h-0 flex-col rounded-lg border border-neutral-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <img src={p.icon} alt="" className="h-10 w-10 shrink-0 object-contain" loading="lazy" />
                <h3 className="mt-3 text-base font-semibold tracking-tight text-neutral-900">{p.title}</h3>
                <p className="mt-2 flex-1 text-xs leading-relaxed text-neutral-600 sm:text-sm">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA strip */}
      <section className="legal-sy-cta-strip py-10 md:py-12">
        <div className="landing-inner flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-2xl text-white">
            <p className="text-lg font-semibold leading-snug md:text-xl">
              Improve your experience in Management, Property Insights &amp; Marketing
            </p>
            <p className="mt-2 text-sm leading-relaxed text-white/85 md:text-base">
              A structured and centralized single source of truth for your real estate portfolio.
            </p>
          </div>
          <Link
            to="/contact?topic=legal"
            className="inline-flex h-12 shrink-0 items-center gap-2 rounded-full bg-white px-7 text-sm font-semibold text-neutral-900 shadow-md transition hover:bg-white/95"
          >
            Contact us
            <span aria-hidden>→</span>
          </Link>
        </div>
      </section>



      <section className="border-t border-neutral-200 bg-neutral-50 py-8 text-center text-sm text-neutral-600">
        <div className="landing-inner">
          <p>
            Reference layout inspired by{" "}
            <a
              href="https://www.squareyards.com/legal-services-for-real-estate"
              className="font-medium text-[#0b2348] underline-offset-2 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Square Yards
            </a>
            . Service imagery and sample reports load from their public CDN for parity.
          </p>
          <p className="mt-3">
            <Link to="/legal/terms" className="font-medium text-[#f58e43] hover:underline">
              Website terms &amp; legal notices
            </Link>{" "}
            for this platform
          </p>
        </div>
      </section>
    </main>
  )
}
