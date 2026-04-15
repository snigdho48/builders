import { useId } from "react"
import { Link } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronDown, faLocationCrosshairs } from "@fortawesome/free-solid-svg-icons"

const SY = "https://www.squareyards.com"

function iconSrc(filename: string): string {
  return `${SY}/assets/images/squareyard-services/${filename}`
}

type ServiceItem = {
  href: string
  icon: string
  alt: string
  label: string
  /** Short label above the bold title (glass bar). */
  kicker: string
}

const SERVICE_CARDS: ServiceItem[] = [
  {
    href: "/listings",
    icon: "sell-or-rent-property.png",
    alt: "Buy plot",
    kicker: "Explore",
    label: "Buy plot",
  },
  {
    href: "/plans",
    icon: "rent-receipts.png",
    alt: "Buy land share",
    kicker: "Plans",
    label: "Buy land share",
  },
  {
    href: "/legal",
    icon: "property-management.png",
    alt: "Legal services",
    kicker: "Support",
    label: "Legal services",
  },
]

export type EverythingNeedSectionProps = {
  /**
   * Compact frosted strip for the home hero (below the plan slider).
   * Omits the standalone blue section shell.
   */
  embeddedInHero?: boolean
}

export function EverythingNeedSection({ embeddedInHero = false }: EverythingNeedSectionProps) {
  const headingId = useId()

  if (embeddedInHero) {
    return (
      <div
        className="everything-need-glass font-sans mt-4 w-full max-w-[min(100%,56rem)] shrink-0 self-center tracking-tight sm:mt-5 md:mt-6"
        aria-labelledby={headingId}
      >
        <p id={headingId} className="sr-only">
          Quick services: buy plot, buy land share, legal services, and listings hub
        </p>
        <div className="everything-need-glass__shell overflow-hidden rounded-[1.35rem] border border-white/55 bg-white/28 shadow-[0_18px_48px_rgba(15,23,42,0.12)] backdrop-blur-[3px] sm:rounded-[1.5rem]">
          <div className="flex flex-col divide-y divide-slate-300/35 sm:flex-row sm:divide-x sm:divide-y-0">
            {SERVICE_CARDS.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="group flex min-h-17 flex-1 items-center gap-3 px-4 py-3.5 transition hover:bg-white/45 sm:min-h-18 sm:px-5 sm:py-4"
              >
                <figure className="shrink-0">
                  <img
                    className="h-10 w-10 object-contain sm:h-11 sm:w-11"
                    loading="lazy"
                    decoding="async"
                    src={iconSrc(item.icon)}
                    alt={item.alt}
                    width={44}
                    height={44}
                    onError={(e) => {
                      const el = e.currentTarget
                      el.onerror = null
                      el.src = `${SY}/assets/images/default.png`
                    }}
                  />
                </figure>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-black sm:text-[11px]">
                    {item.kicker}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-[0.8125rem] font-bold leading-snug text-[#0b2348] sm:text-[0.9375rem]">
                    <span className="truncate capitalize">{item.label}</span>
                    <FontAwesomeIcon
                      icon={faChevronDown}
                      className="text-[9px] shrink-0 text-slate-500 transition group-hover:text-[#0b2348] sm:text-[10px]"
                      aria-hidden
                    />
                  </p>
                </div>
              </Link>
            ))}
            {/* <div className="flex items-stretch sm:shrink-0">
              <Link
                to="/listings"
                className="flex flex-1 items-center gap-2.5 px-4 py-3.5 transition hover:bg-white/45 sm:flex-initial sm:px-5 sm:py-4"
              >
                <FontAwesomeIcon
                  icon={faLocationCrosshairs}
                  className="shrink-0 text-base text-[#0b2348]/85"
                  aria-hidden
                />
                <span className="truncate text-[0.8125rem] font-bold text-[#0b2348] sm:text-[0.9375rem]">
                  Listings hub
                </span>
              </Link>
            </div> */}
          </div>
        </div>
      </div>
    )
  }

  return (
    <section className="landing-section everything-need" aria-labelledby={headingId}>
      <div className="landing-inner">
        <div className="white-body">
          <header className="everything-need-header">
            <p className="everything-need-kicker">Services</p>
            <h2 id={headingId} className="everything-need-heading font-bold text-4xl">
              Everything You Need at One Place
            </h2>
            <p className="everything-need-lead">
              Quick access to the core journeys you need most on this platform.
            </p>
          </header>

          <div className="service-box">
            <div className="service-tab-body">
              <ul className="service-tab-list item_0 active scrollbar-hide">
                {SERVICE_CARDS.map((item) => {
                  return (
                    <li key={item.label}>
                      <a href={item.href} className="link">
                        <figure>
                          <img
                            className="img-responsive"
                            loading="lazy"
                            decoding="async"
                            src={iconSrc(item.icon)}
                            alt={item.alt}
                            width={79}
                            height={79}
                            onError={(e) => {
                              const el = e.currentTarget
                              el.onerror = null
                              el.src = `${SY}/assets/images/default.png`
                            }}
                          />
                        </figure>
                        <strong className="everything-need-item-label line-clamp-3 text-xl capitalize">
                          {item.label}
                        </strong>
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
