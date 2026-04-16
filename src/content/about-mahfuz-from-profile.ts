/**
 * About page data: company copy is sourced from `public/Eurostar Website.docx`
 * via `eurostar-company-copy.ts`. Founder block remains for leadership context.
 */
export {
  aboutEyebrowEurostar as aboutEyebrow,
  aboutHeroEurostar as aboutHero,
  aboutHeroPillsEurostar as aboutHeroPills,
  aboutStoryEurostar as aboutStory,
  aboutStatsEurostar as aboutStats,
} from "@/content/eurostar-company-copy"

export const profilePdfFileName = "Profile OF MAHFUZ BIN YOUSUF-UPDATE.pdf"
export const profilePdfHref = `/${encodeURIComponent(profilePdfFileName)}`

export const founder = {
  name: "Mahfuz Bin Yousuf",
  role: "Founder",
  summary:
    "Leadership focused on transparent land transactions, investor confidence, and repeatable operations across listings, bookings, and advisory—so teams and clients share the same picture of risk, timing, and next steps.",
  /** Replace with a headshot from the PDF or `public/` when available. */
  imageSrc: "https://ui-avatars.com/api/?name=Mahfuz+Bin+Yousuf&size=256&background=0b1f44&color=f58e43&bold=true",
  highlights: [
    "Emphasis on clear documentation and process before capital is committed",
    "Alignment of marketing language with what contracts and schedules actually deliver",
    "Long-term relationships over one-off transactions in land and property",
  ],
}

export const principles = [
  {
    title: "Clarity first",
    body: "Listings and plans are presented so you can see channel, term, and obligations—not buried footnotes after interest is gone.",
  },
  {
    title: "Defensible deals",
    body: "Legal and compliance context is treated as part of the product, not an afterthought once something breaks.",
  },
  {
    title: "Operational discipline",
    body: "Bookings, dashboards, and staff workflows aim for one source of truth—fewer disputes, faster resolutions.",
  },
  {
    title: "Respect for capital",
    body: "Whether you size a land-share tier or reserve a plot, the flow is built to match serious money with serious process.",
  },
] as const

export const focusAreas = [
  {
    title: "Explore listings",
    body: "Filter by location, sale type, and channel so you only see land that fits buy-plot, land-share, or full-parcel goals.",
    href: "/listings/buy-plots",
  },
  {
    title: "Plans & promos",
    body: "See how plot-buy promos and investment lanes differ before you choose a path or speak to the team.",
    href: "/plans",
  },
  {
    title: "Legal backbone",
    body: "Documentation review, agreements, and property legal services that sit alongside your transaction—not generic templates.",
    href: "/legal",
  },
] as const

export const ctaBand = {
  heading: "Need the full professional profile?",
  body: "Download the published PDF for complete biography, credentials, and organisational detail as released for partners and investors.",
  primaryLabel: "Open profile PDF",
  secondaryLabel: "Contact the team",
  secondaryHref: "/contact?topic=about",
} as const

/** Optional compliance table — extend with real registration numbers from your jurisdiction. */
export const disclosuresHeading = "Disclosures & registrations"
export const disclosureRows = [
  {
    jurisdiction: "Platform standards",
    detail: "Listing, booking, and review flows follow the rules published in-app and in staff tooling.",
  },
  {
    jurisdiction: "Statutory references",
    detail: "Add company registration, tax IDs, and licences here when counsel approves publication.",
  },
  {
    jurisdiction: "Document accuracy",
    detail: "Replace placeholder rows with data taken from your corporate registry or official brochure.",
  },
] as const
