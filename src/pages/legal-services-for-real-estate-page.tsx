import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCheck } from "@fortawesome/free-solid-svg-icons"
import { Link } from "react-router-dom"
import { RevealOnView } from "@/components/motion/reveal-on-view"

const SY = "https://www.squareyards.com"
const PROP_IMG = (file: string) => `https://img.squareyards.com/propamcsubscription/${file}`
const ASSET = (path: string) => `${SY}${path.startsWith("/") ? path : `/${path}`}`

type UtilizedService = {
  title: string
  icon: string
  /** Opening standfirst — larger type */
  lead: string
  /** Body copy — one string per paragraph */
  paragraphs: string[]
}

const MOST_UTILIZED: UtilizedService[] = [
  {
    title: "Documents Review",
    icon: "63b049fd-af09-453f-845f-12768b1bcdd0.svg",
    lead:
      "Real estate deals rest on paper — sale deeds, allotments, plans, NOCs, and developer letters. A documents review tells you what those papers actually commit you to, before you pay or sign.",
    paragraphs: [
      "Our in-house experts read your bundle end-to-end: agreements, disclosures, approvals, and handover-related documents. We compare what is promised in marketing with what is binding in the contract, and call out wording that shifts risk or liability to the buyer.",
      "We focus on compliance and title signals you might not spot alone — encumbrances, unusual conditions, possession timelines, penalties, and obligations that affect resale or use of the asset. You get a clear summary of findings and practical next steps, not a generic checklist.",
      "Whether you are choosing between projects or closing a resale, this review is one of the most cost-effective ways to avoid expensive surprises later. Use it to negotiate fixes, exit with confidence, or move ahead knowing the legal baseline is sound.",
    ],
  },
]

type GridService = {
  title: string
  icon: string
  description: string
  samplePdf: string
}

const LITIGATION: GridService[] = [
  {
    title: "Documents Review",
    icon: "63b049fd-af09-453f-845f-12768b1bcdd0.svg",
    description:
      "Recommended for buyers: an in-house expert reviews legal documents and analyses property and compliance issues.",
    samplePdf: "e62dfb12-cd9d-4f74-a945-9d49d9a8fa0c.pdf",
  },
  {
    title: "Legal Power of Attorney",
    icon: "326f0470-61d5-4667-b21f-19a96e028eaf.svg",
    description:
      "Authorises an attorney-in-charge to act on specific rights for a defined period or consideration; it does not fix payment-capacity gaps.",
    samplePdf: "dcb7c7e6-8985-4654-afad-53c2319d492b.pdf",
  },
  {
    title: "Lease Agreement",
    icon: "ecf91986-c01f-4cae-8c52-6c2803b4a576.svg",
    description:
      "A full lease contract between lessor and lessee covering essentials and letting the lessee rent the property for the agreed term.",
    samplePdf: "62f2ce78-4e1b-4bab-9e8c-8d45668e94b4.pdf",
  },
  {
    title: "Sale Agreement",
    icon: "59bde20b-dbcb-4d3c-ba0e-69b25f3ddf99.svg",
    description:
      "Sets out sale regulations and financial terms, typically executed by the developer or seller for the transaction.",
    samplePdf: "5b4eb2e3-26d3-45c2-b4e2-0709cedd803a.pdf",
  },
  {
    title: "Comprehensive Due Diligence",
    icon: "e4e8c25c-ca50-467b-ba23-a2b568c6a8d7.svg",
    description:
      "Deep review of documents and compliance, title and mortgage checks, supporting valuations and end-to-end verification.",
    samplePdf: "3178dc8b-5471-43d4-b7fd-e88c11a3793e.pdf",
  },
  {
    title: "Property Complaints",
    icon: "d69625ca-05a9-46e3-8633-296a13c1c6e3.svg",
    description:
      "We assess your complaint and strategy, issue legal notices to developers or sellers for refund or settlement, and file in RERA, consumer forums, NCLT, or arbitration where fit.",
    samplePdf: "72f86024-ffa0-4538-807f-afafcd6f080d.pdf",
  },
  {
    title: "Title Search",
    icon: "91ed3e12-91e2-47a7-93f9-94f4d14cfe1c.svg",
    description:
      "Maps property history and the present titleholder using public records so ownership and encumbrances are clear before you proceed.",
    samplePdf: "a8fec36f-885d-4b20-a8ce-f72d3c53f9d4.pdf",
  },
  {
    title: "Litigation Search",
    icon: "b18bf7ee-1e9e-4d71-a71a-2c8fa68f5a73.svg",
    description:
      "Court-focused review of seller-related disputes, covering active, pending, and disposed matters that could affect the asset.",
    samplePdf: "7ec375eb-7978-46ed-a3b2-d5d7ec156696.pdf",
  },
]

const MONITORING: GridService[] = [
  {
    title: "Project Monitoring Report",
    icon: "a4e711c6-4383-461c-95fd-21b9d61731fb.svg",
    description:
      "For under-construction projects: tracks progress and recent transactions and covers legal permissions plus litigation-related checks.",
    samplePdf: "a3f96fde-3d1d-4204-8247-aa7537ece709.pdf",
  },
]

function MostUtilizedBlock({ item }: { item: UtilizedService }) {
  return (
    <div className="max-w-full">
      <div className="flex gap-4 sm:gap-5">
        <div className="shrink-0 pt-0.5">
          <img
            src={PROP_IMG(item.icon)}
            alt=""
            className="h-11 w-auto max-w-[5.5rem] object-contain sm:h-12 sm:max-w-24"
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="min-w-0">
          <h3 className="text-xl font-semibold leading-snug tracking-tight text-neutral-900 sm:text-2xl">{item.title}</h3>
          <p className="mt-3 text-base leading-relaxed text-neutral-700 sm:text-[1.0625rem]">{item.lead}</p>
          <div className="mt-5 space-y-4 text-sm leading-relaxed text-neutral-600 sm:text-base">
            {item.paragraphs.map((p, i) => (
              <p key={`${item.title}-${i}`}>{p}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ServiceCardGrid({
  item,
  className = "",
}: {
  item: GridService
  className?: string
}) {
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
      <p className="mt-2.5 shrink-0 text-xs font-medium leading-relaxed text-neutral-600 sm:text-[0.8125rem]">{item.description}</p>
      <div className="min-h-0 flex-1" aria-hidden />
      <div className="shrink-0 border-t border-neutral-100 pt-3">
        <Link
          to={`/contact?topic=legal&service=${encodeURIComponent(item.title)}`}
          className="legal-sy-book flex h-9 w-full items-center justify-center rounded-md bg-[#ffd916] text-sm font-bold text-neutral-900 transition hover:brightness-[0.98] active:brightness-95"
        >
          Book Now
        </Link>
      </div>
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
            <h1 className="text-[clamp(1.75rem,5vw,2.75rem)] font-bold leading-tight tracking-tight !text-white">
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
          <RevealOnView className="mt-8 md:mt-10" variant="fade-up">
            <div className="space-y-12 md:space-y-14">
              {MOST_UTILIZED.map((s) => (
                <MostUtilizedBlock key={s.title} item={s} />
              ))}
            </div>
          </RevealOnView>
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

    </main>
  )
}
