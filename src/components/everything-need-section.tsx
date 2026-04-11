import { useCallback, useId, useState } from "react"

const SY = "https://www.squareyards.com"

function syUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path
  return `${SY}${path.startsWith("/") ? path : `/${path}`}`
}

function iconSrc(filename: string): string {
  return `${SY}/assets/images/squareyard-services/${filename}`
}

type ServiceItem = {
  href: string
  icon: string
  alt: string
  label: string
  /** If true, `href` is used as-is and opened in a new tab. */
  external?: boolean
  /** Open Square Yards path in a new tab (still resolve with `syUrl`). */
  newTab?: boolean
}

const TABS = [
  { id: "item_0", label: "For Buyers / Owners" },
  { id: "item_1", label: "For Tenants" },
  { id: "item_2", label: "For Agents" },
  { id: "item_3", label: "For Builders & Banks" },
] as const

const TAB_PANELS: ServiceItem[][] = [
  [
    {
      href: "https://loangateway.urbanmoney.com/?utm_source=dotcom&view=web",
      icon: "home-loan.png",
      alt: "Home Loan Icon",
      label: "Home Loan",
      external: true,
    },
    {
      href: "https://www.interiorcompany.com/in/interior-design-ideas",
      icon: "home-interior.png",
      alt: "Home Interior Design Icon",
      label: "Home Interior Design",
      external: true,
    },
    { href: "/online-property-valuation", icon: "valuation.png", alt: "Valuation Icon", label: "Valuation" },
    { href: "/vastu-calculator", icon: "vastu-calculator.png", alt: "Vastu Calculator Icon", label: "Vastu Calculator" },
    { href: "/property-management", icon: "property-management.png", alt: "Property Management Icon", label: "Property Management" },
    { href: "/post-property", icon: "sell-or-rent-property.png", alt: "Sell or Rent Property Icon", label: "Sell or Rent Property" },
  ],
  [
    { href: "/rent-agreement", icon: "online-rent-agreement.png", alt: "Online Rent Agreement Icon", label: "Online Rent Agreement" },
    { href: "/rent-receipts", icon: "rent-receipts.png", alt: "Rent Receipts Icon", label: "Rent Receipts" },
    { href: "/property-management", icon: "property-management.png", alt: "Property Management Icon", label: "Property Management" },
  ],
  [
    { href: "/advertise-with-squareyards", icon: "advertise-with-us.png", alt: "List Property With Us Icon", label: "List Property With Us" },
    {
      href: "/connect",
      icon: "co-broking-for-new-projects.png",
      alt: "Co-Broking For New Projects Icon",
      label: "Co-Broking For New Projects",
      newTab: true,
    },
  ],
  [
    { href: "/advertise-with-squareyards", icon: "advertise-with-us.png", alt: "Advertise With Us Icon", label: "Advertise With Us" },
    { href: "https://propvr.ai/", icon: "three-d-services.png", alt: "3D/AR/VR Services Icon", label: "3D/AR/VR Services", external: true },
    {
      href: "https://dataintelligence.squareyards.com/",
      icon: "data-intelligence.png",
      alt: "Data Intelligence Icon",
      label: "Data Intelligence",
      external: true,
    },
    {
      href: "https://crediq.urbanmoney.com/",
      icon: "mortgage-partnerships.png",
      alt: "Mortgage Partnerships Icon",
      label: "Mortgage Partnerships",
      external: true,
    },
    {
      href: "https://superagentpro.ai/",
      icon: "super-agent-pro.png",
      alt: "Super Agent Pro Icon",
      label: "Super Agent Pro",
      external: true,
    },
  ],
]

export function EverythingNeedSection() {
  const [activeIndex, setActiveIndex] = useState(3)
  const headingId = useId()
  const tabIds = TABS.map((_, i) => `${headingId}-tab-${i}`)
  const panelIds = TABS.map((_, i) => `${headingId}-panel-${i}`)

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return
    e.preventDefault()
    setActiveIndex((i) => {
      if (e.key === "ArrowRight") return (i + 1) % TABS.length
      return (i - 1 + TABS.length) % TABS.length
    })
  }, [])

  return (
    <section className="white-box everything-need" aria-labelledby={headingId}>
      <div className="landing-inner">
        <div className="title-box">
          <strong id={headingId} className="title">
            Everything you Need at One Place
          </strong>
        </div>

        <div className="white-body">
          <div className="service-box">
            <ul
              className="service-tabs tab-box scrollbar-hide"
              role="tablist"
              aria-label="Service categories"
              onKeyDown={onKeyDown}
            >
              {TABS.map((tab, index) => (
                <li key={tab.id}>
                  <button
                    type="button"
                    role="tab"
                    id={tabIds[index]}
                    aria-selected={activeIndex === index}
                    aria-controls={panelIds[index]}
                    tabIndex={activeIndex === index ? 0 : -1}
                    className={`service-tab-trigger item_${index}${activeIndex === index ? " active" : ""}`}
                    data-tab={tab.id}
                    onClick={() => setActiveIndex(index)}
                  >
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>

            <div className="service-tab-body">
              {TAB_PANELS.map((items, index) => (
                <ul
                  key={TABS[index].id}
                  id={panelIds[index]}
                  role="tabpanel"
                  aria-labelledby={tabIds[index]}
                  aria-hidden={activeIndex !== index}
                  className={`service-tab-list item_${index} scrollbar-hide${activeIndex === index ? " active" : ""}`}
                >
                  {items.map((item) => {
                    const href = item.external ? item.href : syUrl(item.href)
                    const newTab = Boolean(item.external || item.newTab)
                    const rel = newTab ? "noopener noreferrer" : undefined
                    const target = newTab ? "_blank" : undefined
                    return (
                      <li key={item.label}>
                        <a href={href} className="link" target={target} rel={rel}>
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
                          <strong>{item.label}</strong>
                        </a>
                      </li>
                    )
                  })}
                </ul>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
