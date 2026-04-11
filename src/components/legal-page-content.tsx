import { Link } from "react-router-dom"

type LegalPageContentProps = {
  /** Optional wrapper classes (e.g. landing card). */
  className?: string
  /** Use h2 for landing embed so the page keeps a single outline root. */
  headingLevel?: "h1" | "h2"
}

export function LegalPageContent({
  className = "",
  headingLevel = "h1",
}: LegalPageContentProps) {
  const HeadingTag = headingLevel
  const SubHeadingTag = headingLevel === "h1" ? "h2" : "h3"
  return (
    <div className={`mx-auto max-w-3xl text-slate-900 ${className}`.trim()}>
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#f58e43]">Legal</p>
      <HeadingTag className="mt-2 text-2xl font-semibold sm:text-3xl">
        Legal information
      </HeadingTag>
      <p className="mt-4 text-sm leading-7 text-slate-600">
        This page outlines important legal notices for using our land investment platform. For specific agreements
        related to your booking or plan, please refer to the terms presented at checkout and in your dashboard.
      </p>

      <section className="mt-10 space-y-6 text-sm leading-7 text-slate-700">
        <div>
          <SubHeadingTag className="text-base font-semibold text-slate-900">Website use</SubHeadingTag>
          <p className="mt-2">
            By accessing this site you agree to use it responsibly. Listings and map data are provided for
            information only and do not constitute legal advice or a binding offer until confirmed through our
            official booking process.
          </p>
        </div>
        <div>
          <SubHeadingTag className="text-base font-semibold text-slate-900">Bookings &amp; land</SubHeadingTag>
          <p className="mt-2">
            Land availability, pricing, and plot boundaries are subject to verification. Final terms are governed by
            the agreements you accept when you book and by applicable local law.
          </p>
        </div>
        <div>
          <SubHeadingTag className="text-base font-semibold text-slate-900">Contact</SubHeadingTag>
          <p className="mt-2">
            For legal or compliance questions, contact us through the{" "}
            <Link to="/contact" className="font-medium text-[#f58e43] hover:underline">
              Contact
            </Link>{" "}
            page.
          </p>
        </div>
      </section>
    </div>
  )
}
