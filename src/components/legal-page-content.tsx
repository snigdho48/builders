import { Link } from "react-router-dom"

import {
  eurostarInvestmentDisclaimer,
  eurostarRefundCancellationPolicy,
  eurostarTermsIntro,
  eurostarTermsSections,
} from "@/content/eurostar-terms-content"

type LegalPageContentProps = {
  className?: string
  headingLevel?: "h1" | "h2"
}

export function LegalPageContent({
  className = "",
  headingLevel = "h1",
}: LegalPageContentProps) {
  const HeadingTag = headingLevel
  const SubHeadingTag = headingLevel === "h1" ? "h2" : "h3"
  const SectionHeadingTag = headingLevel === "h1" ? "h3" : "h4"

  return (
    <div className={`mx-auto max-w-3xl text-slate-900 ${className}`.trim()}>
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#f58e43]">Legal</p>
      <HeadingTag className="mt-2 text-2xl font-semibold sm:text-3xl">Terms &amp; Conditions</HeadingTag>
      <p className="mt-4 text-sm leading-7 text-slate-600">{eurostarTermsIntro}</p>

      <section className="mt-10 space-y-8 text-sm leading-7 text-slate-700">
        {eurostarTermsSections.map((sec) => (
          <div key={sec.title}>
            <SectionHeadingTag className="text-base font-semibold text-slate-900">{sec.title}</SectionHeadingTag>
            <p className="mt-2 whitespace-pre-line">{sec.body}</p>
          </div>
        ))}
      </section>

      <section className="mt-12 border-t border-slate-200 pt-10 text-sm leading-7 text-slate-700">
        <SubHeadingTag className="text-lg font-semibold text-slate-900">Refund &amp; cancellation (including legal fees)</SubHeadingTag>
        <p className="mt-3">{eurostarRefundCancellationPolicy}</p>
      </section>

      <section className="mt-10 text-sm leading-7 text-slate-700">
        <SubHeadingTag className="text-lg font-semibold text-slate-900">Disclaimer (real estate &amp; investment)</SubHeadingTag>
        <ul className="mt-3 list-disc space-y-3 pl-5">
          {eurostarInvestmentDisclaimer.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      </section>

      <section className="mt-10 text-sm leading-7 text-slate-700">
        <SubHeadingTag className="text-base font-semibold text-slate-900">More help</SubHeadingTag>
        <p className="mt-2">
          Browse the{" "}
          <Link to="/#faq" className="font-medium text-[#f58e43] hover:underline">
            FAQ
          </Link>{" "}
          for plot buy, land share, and NRB legal questions, or reach us via the{" "}
          <Link to="/contact" className="font-medium text-[#f58e43] hover:underline">
            Contact
          </Link>{" "}
          page.
        </p>
      </section>
    </div>
  )
}
