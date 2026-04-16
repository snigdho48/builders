import { useMemo } from "react"
import { Link } from "react-router-dom"

import { RevealOnView } from "@/components/motion/reveal-on-view"
import { eurostarLegalServicesOverview, eurostarLegalServicesOverviewBn, eurostarLegalTeam } from "@/content/eurostar-company-copy"
import { getEurostarLegalDetailedCopy } from "@/content/eurostar-services-content"
import { useLanguage } from "@/i18n/language-context"

export function LegalServicesForRealEstatePage() {
  const { language } = useLanguage()
  const isBn = language === "bn"

  const legalOverviewBlock = useMemo(() => {
    if (language === "bn") {
      return {
        title: eurostarLegalServicesOverviewBn.title,
        paragraphs: [eurostarLegalServicesOverviewBn.lead, eurostarLegalServicesOverviewBn.lead2],
        bullets: eurostarLegalServicesOverviewBn.bullets,
        footers: [eurostarLegalServicesOverviewBn.closing, eurostarLegalServicesOverviewBn.closing2],
      }
    }
    return {
      title: eurostarLegalServicesOverview.title,
      paragraphs: [
        eurostarLegalServicesOverview.lead,
        eurostarLegalServicesOverview.lead2,
        eurostarLegalServicesOverview.lead3,
      ],
      bullets: eurostarLegalServicesOverview.bullets,
      footers: [eurostarLegalServicesOverview.closing, eurostarLegalServicesOverview.closing2],
    }
  }, [language])
  const legalDetails = useMemo(() => getEurostarLegalDetailedCopy(language), [language])
  const legalTeam = eurostarLegalTeam[isBn ? "bn" : "en"]

  return (
    <main className="min-w-0 bg-[#f6f7fb] text-neutral-700">
      <section className="border-b border-slate-200 bg-[#0b1f44] py-14 text-white sm:py-16">
        <div className="landing-inner">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f58e43]">
            {isBn ? "লিগ্যাল সার্ভিস" : "Legal service"}
          </p>
          <h1 className="mt-3 text-[clamp(1.7rem,5vw,2.6rem)] font-bold leading-tight text-white!">
            {isBn ? "প্রপার্টি লিগ্যাল সাপোর্ট, শুরু থেকে মালিকানা পর্যন্ত" : "Property legal support from verification to ownership"}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-100! sm:text-base">{legalOverviewBlock.paragraphs[0]}</p>
          <div className="mt-8">
            <Link
              to="/contact?topic=legal"
              className="inline-flex min-h-11 items-center rounded-full bg-white px-6 text-sm font-bold text-[#0b1f44] transition hover:bg-slate-100"
            >
              {isBn ? "যোগাযোগ করুন" : "Contact us"}
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-neutral-200 bg-white py-10 md:py-14">
        <div className="landing-inner">
          <RevealOnView className="w-full" variant="fade-up">
            <h2 className="text-2xl font-semibold text-neutral-900 md:text-[1.65rem]">{legalOverviewBlock.title}</h2>
            {legalOverviewBlock.paragraphs.map((para, i) => (
              <p
                key={`legal-overview-p-${i}`}
                className={`max-w-3xl text-sm leading-relaxed text-neutral-700 sm:text-base ${i === 0 ? "mt-4" : "mt-3"}`}
              >
                {para}
              </p>
            ))}
            <ul className="mt-6 grid list-disc gap-2 pl-5 text-sm leading-relaxed text-neutral-700 sm:grid-cols-2 sm:text-[0.9375rem]">
              {legalOverviewBlock.bullets.map((b) => (
                <li key={b} className="marker:text-[#f58e43]">
                  {b}
                </li>
              ))}
            </ul>
            {legalOverviewBlock.footers.map((para, i) => (
              <p
                key={`legal-overview-f-${i}`}
                className={`max-w-3xl text-sm leading-relaxed text-neutral-600 sm:text-base ${i === 0 ? "mt-6" : "mt-3"}`}
              >
                {para}
              </p>
            ))}
          </RevealOnView>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="landing-inner">
          <RevealOnView className="w-full" variant="fade-up">
            <h2 className="text-2xl font-semibold text-neutral-900 md:text-[1.65rem]">{legalDetails.title}</h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-neutral-700 sm:text-base">{legalDetails.intro}</p>
          </RevealOnView>
          <RevealOnView className="mt-8 md:mt-10" variant="fade-up">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {legalDetails.sections.map((sec) => (
                <article key={sec.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="text-base font-semibold text-[#0b1f44]">{sec.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{sec.body}</p>
                </article>
              ))}
            </div>
          </RevealOnView>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white py-12 md:py-16">
        <div className="landing-inner">
          <RevealOnView className="w-full" variant="fade-up">
            <h2 className="text-2xl font-semibold text-neutral-900 md:text-[1.65rem]">{legalTeam.title}</h2>
          </RevealOnView>
          <RevealOnView className="mt-8 md:mt-10" variant="fade-up">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {legalTeam.members.map((member) => (
                <article key={member.name} className="rounded-2xl border border-slate-200 bg-slate-50/40 p-5 shadow-sm">
                  <h3 className="text-base font-semibold text-[#0b1f44]">{member.name}</h3>
                  <p className="mt-1 text-sm font-medium text-[#f58e43]">{member.designation}</p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{member.bio}</p>
                </article>
              ))}
            </div>
          </RevealOnView>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white py-10">
        <div className="landing-inner">
          <p className="text-sm leading-7 text-slate-700">
            {isBn
              ? "ওয়েবসাইটের শর্তাবলী এবং বিনিয়োগ ডিসক্লেইমার দেখতে legal terms পেইজ ব্যবহার করুন। বিস্তারিত প্রশ্নের জন্য FAQ এবং Contact পেইজে যান।"
              : "For website terms, refund policy, and investment disclaimers, please use the legal terms page. For specific queries, use FAQ or contact support."}
          </p>
          <p className="mt-3 text-sm font-semibold">
            <Link to="/legal/terms" className="text-[#f58e43] hover:underline">
              {isBn ? "Terms & Conditions দেখুন" : "View Terms & Conditions"}
            </Link>
            {" · "}
            <Link to="/#faq" className="text-[#f58e43] hover:underline">
              FAQ
            </Link>
            {" · "}
            <Link to="/contact?topic=legal" className="text-[#f58e43] hover:underline">
              {isBn ? "যোগাযোগ" : "Contact"}
            </Link>
          </p>
        </div>
      </section>
    </main>
  )
}
