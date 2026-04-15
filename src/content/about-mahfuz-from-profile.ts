/**
 * About page copy intended to mirror `public/Profile OF MAHFUZ BIN YOUSUF-UPDATE.pdf`.
 * Add the PDF under `frontend/public/` with that exact name, then replace the strings
 * below with text extracted from the document if anything should differ.
 */
export const profilePdfFileName = "Profile OF MAHFUZ BIN YOUSUF-UPDATE.pdf"
export const profilePdfHref = `/${encodeURIComponent(profilePdfFileName)}`

export const aboutHero = {
  title: "Every parcel has a purpose. Here's ours.",
  subtitle:
    "We built a land-first experience around transparent listings, clear buy and installment options, and dependable legal support—so owners and investors can move with confidence.",
}

export const aboutStory = {
  heading: "About Mahfuz Bin Yousuf",
  paragraphs: [
    "Mahfuz Bin Yousuf brings a disciplined, client-centered approach to real estate and land investment—connecting people to whole-parcel opportunities, structured payment paths, and the compliance context that serious transactions deserve.",
    "His work emphasizes clarity over noise: practical guidance for buyers and sellers, careful attention to documentation and process, and a long-term view of trust in every introduction, negotiation, and closing.",
  ],
}

export const aboutStats = [
  {
    value: "Land-first",
    label: "Whole-parcel listings and clear channel choices",
    toneClass: "bg-[#2d2d2d] text-white",
  },
  {
    value: "Buy & invest",
    label: "Direct purchase and installment-friendly lanes",
    toneClass: "bg-[#5c5c5c] text-white",
  },
  {
    value: "Legal desk",
    label: "Dedicated legal services for property journeys",
    toneClass: "bg-[#7d6fbf] text-white",
  },
  {
    value: "One platform",
    label: "Listings, plans, dashboards, and support in one flow",
    toneClass: "bg-[#e8e4f5] text-[#1a1a1a]",
  },
] as const

export const founder = {
  name: "Mahfuz Bin Yousuf",
  role: "Founder",
  summary:
    "Profile-driven leadership focused on transparent land transactions, investor confidence, and repeatable processes across listings, bookings, and advisory.",
  /** Replace with a headshot from the PDF or `public/` when available. */
  imageSrc: "https://ui-avatars.com/api/?name=Mahfuz+Bin+Yousuf&size=256&background=0b2348&color=f58e43&bold=true",
}

export const focusAreas = [
  {
    title: "Explore listings",
    body: "Search whole-parcel land with filters for location, sale type, and channel so you see only what fits your goal.",
    href: "/listings",
  },
  {
    title: "Plans that fit",
    body: "Understand registration and installment-style paths side by side before you commit capital or book a parcel.",
    href: "/plans",
  },
  {
    title: "Legal backbone",
    body: "Access legal services tuned to real estate—documentation, review, and the guardrails that keep deals defensible.",
    href: "/legal",
  },
] as const

/** Optional compliance table — extend with real registration numbers from your jurisdiction. */
export const disclosuresHeading = "Disclosures & registrations"
export const disclosureRows = [
  { jurisdiction: "Platform operating standards", detail: "Processes aligned with published listing and booking rules." },
  { jurisdiction: "Document updates", detail: "Add statutory references here when you publish them from the PDF." },
] as const
