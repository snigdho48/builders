import { useId } from "react"

const SY = "https://www.squareyards.com"

function iconSrc(filename: string): string {
  return `${SY}/assets/images/squareyard-services/${filename}`
}

type ServiceItem = {
  href: string
  icon: string
  alt: string
  label: string
}

const SERVICE_CARDS: ServiceItem[] = [
  { href: "/listings", icon: "sell-or-rent-property.png", alt: "Buy Plot Icon", label: "Buy Plot" },
  { href: "/plans", icon: "rent-receipts.png", alt: "Buy Land Share Icon", label: "Buy Land Share" },
  { href: "/legal", icon: "property-management.png", alt: "Legal Services Icon", label: "Legal Services" },
]

export function EverythingNeedSection() {
  const headingId = useId()

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
                        <strong className="everything-need-item-label line-clamp-3 text-xl">{item.label}</strong>
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
