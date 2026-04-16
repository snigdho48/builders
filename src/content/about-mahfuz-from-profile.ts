/**
 * About page copy aligned with `public/Profile OF MAHFUZ BIN YOUSUF-UPDATE.pdf`.
 * Place the PDF in `frontend/public/` with that exact name. Replace any section
 * below with text pulled from the document when you want verbatim profile details.
 */
export const profilePdfFileName = "Profile OF MAHFUZ BIN YOUSUF-UPDATE.pdf"
export const profilePdfHref = `/${encodeURIComponent(profilePdfFileName)}`

export const aboutEyebrow = "About the founder & platform"

export const aboutHero = {
  title: "Land, clarity, and long-term trust—by design.",
  subtitle:
    "Eurostar Land is shaped around a simple idea: serious land decisions deserve transparent listings, disciplined processes, and legal context you can rely on. Mahfuz Bin Yousuf leads that vision—bridging investors, owners, and structured purchase paths without the usual noise.",
}

/** Short lines under the hero for quick scanning */
export const aboutHeroPills = [
  "Whole-parcel & land-share lanes",
  "Plot maps with clear booking flows",
  "Legal services built for property",
] as const

export const aboutStory = {
  heading: "A profile built on execution, not hype",
  paragraphs: [
    "Mahfuz Bin Yousuf approaches real estate and land investment with a client-first mindset: fewer promises, more structure. That means honest framing of what a listing includes, what registration or installment paths involve, and where professional review still matters before money moves.",
    "Whether you are comparing buy-plot promos, land-share tiers, or a full-parcel acquisition, the goal is the same—reduce ambiguity early so decisions hold up later. The platform reflects that philosophy in how listings are presented, how bookings are recorded, and how support routes stay visible.",
    "This page summarises the leadership story behind the product. For the full professional profile—including credentials, affiliations, and detailed background as published—open the PDF linked below.",
  ],
  spotlightQuote: {
    text: "Trust in land deals is earned in the details: documentation, timing, and plain language when it matters.",
    attribution: "Mahfuz Bin Yousuf",
  },
}

export const aboutStats = [
  {
    value: "Land-first",
    label: "Listings centred on parcels, channels, and real map context",
    toneClass: "bg-[#0b1f44] text-white",
  },
  {
    value: "Structured buy paths",
    label: "Buy plots, land share, and installment lanes where applicable",
    toneClass: "bg-[#152a55] text-white",
  },
  {
    value: "Legal desk",
    label: "Property-focused legal services on demand",
    toneClass: "bg-[#f58e43] text-[#0b1f44]",
  },
  {
    value: "One journey",
    label: "Discovery → booking → dashboards without hand-offs",
    toneClass: "bg-slate-100 text-[#0b1f44] ring-1 ring-slate-200/90",
  },
] as const

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
  { jurisdiction: "Platform standards", detail: "Listing, booking, and review flows follow the rules published in-app and in staff tooling." },
  { jurisdiction: "Statutory references", detail: "Add company registration, tax IDs, and licences here when counsel approves publication." },
  { jurisdiction: "Document accuracy", detail: "Replace placeholder rows with data taken from your profile PDF or corporate registry." },
] as const
