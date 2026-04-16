import { useMemo } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faArrowRight,
  faCheck,
  faCompass,
  faQuoteLeft,
  faScaleBalanced,
  faSitemap,
  faWallet,
} from "@fortawesome/free-solid-svg-icons"
import { Link } from "react-router-dom"

import { RevealOnView } from "@/components/motion/reveal-on-view"
import {
  disclosureRows,
  disclosuresHeading,
  focusAreas,
  founder,
  principles,
} from "@/content/about-mahfuz-from-profile"
import { aboutMissionVisionValues, eurostarWhyChooseItems, getEurostarAboutPageCopy } from "@/content/eurostar-company-copy"
import { useLanguage } from "@/i18n/language-context"

const PRINCIPLE_ICONS = [faCompass, faScaleBalanced, faSitemap, faWallet] as const

/** YouTube embed — replace with your own channel video if needed */
const ABOUT_VIDEO_EMBED = "https://www.youtube.com/embed/QmfVLaBan5I?rel=0&modestbranding=1"

const whyChooseSectionI18n = {
  en: {
    title: "Why choose Eurostar Group",
    subtitle: "Key differentiators from our company overview—experience, structure, transparency, and NRB-focused legal support.",
  },
  bn: {
    title: "কেন Eurostar Group বেছে নেবেন",
    subtitle:
      "অভিজ্ঞতা, কাঠামো, স্বচ্ছতা ও নবায়ন—একই ইকোসিস্টেমে প্লট সেলস, ফ্র্যাকশনাল ওনারশিপ ও সম্পূর্ণ লিগ্যাল সাপোর্ট।",
  },
} as const

export function AboutPage() {
  const { language } = useLanguage()
  const about = useMemo(() => getEurostarAboutPageCopy(language), [language])
  const whyHead = whyChooseSectionI18n[language === "bn" ? "bn" : "en"]
  const missionVisionValues = aboutMissionVisionValues[language === "bn" ? "bn" : "en"]

  return (
    <main className="about-page min-w-0 overflow-x-hidden bg-white text-[#0b1f44]">
      {/* Hero */}
      <section
        className="relative isolate overflow-hidden border-b border-slate-200/80 bg-[#f8fafc] pt-20 pb-12 sm:pt-24 sm:pb-16 md:pt-28 md:pb-20"
        aria-labelledby="about-hero-heading"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage: `radial-gradient(rgb(148 163 184 / 0.45) 1px, transparent 1px)`,
            backgroundSize: "18px 18px",
          }}
          aria-hidden
        />
        <div className="pointer-events-none absolute -right-24 top-0 h-112 w-md rounded-full bg-[#f58e43]/15 blur-3xl md:right-0" aria-hidden />
        <div
          className="pointer-events-none absolute -left-32 bottom-0 h-88 w-88 rounded-full bg-[#0b1f44]/6 blur-3xl"
          aria-hidden
        />

        <div className="landing-inner relative z-1 max-w-full">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-start lg:gap-14 xl:gap-16">
            <RevealOnView className="min-w-0" variant="fade-up">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f58e43] sm:text-sm">{about.eyebrow}</p>
              <h1
                id="about-hero-heading"
                className="mt-3 text-[clamp(1.85rem,5.2vw,3rem)] font-extrabold leading-[1.1] tracking-tight text-[#0b1f44]"
              >
                {about.hero.title}
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">{about.hero.subtitle}</p>

              <ul className="mt-8 flex flex-wrap gap-2 sm:gap-2.5">
                {about.pills.map((pill) => (
                  <li
                    key={pill}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-white/90 px-3 py-1.5 text-xs font-semibold text-[#0b1f44] shadow-sm sm:text-sm"
                  >
                    <FontAwesomeIcon icon={faCheck} className="text-[10px] text-[#f58e43] sm:text-xs" aria-hidden />
                    {pill}
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-wrap items-center gap-3 sm:mt-10">
                <Link
                  to="/contact?topic=about"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#0b1f44] px-6 text-sm font-bold text-white shadow-[0_12px_32px_rgba(11,31,68,0.22)] transition hover:bg-[#152a55]"
                >
                  Talk with us
                  <FontAwesomeIcon icon={faArrowRight} className="text-xs opacity-90" aria-hidden />
                </Link>
              </div>
            </RevealOnView>

            <RevealOnView className="min-w-0" variant="fade-up" delayMs={80}>
              <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-black shadow-[0_28px_64px_rgba(15,23,42,0.14)] sm:rounded-3xl">
                <div className="relative aspect-video w-full min-h-0">
                  <iframe
                    title="About our platform"
                    src={ABOUT_VIDEO_EMBED}
                    className="absolute inset-0 h-full w-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                </div>
              </div>
              <p className="mt-3 text-center text-xs text-slate-500 sm:text-left">
                Watch the short overview to learn how the platform works.
              </p>
            </RevealOnView>
          </div>
        </div>
      </section>

      {/* Story + quote + stats */}
      <section className="border-b border-slate-100 py-14 sm:py-16 md:py-20" aria-labelledby="about-story-heading">
        <div className="landing-inner max-w-full">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,22rem)] lg:gap-16 xl:gap-20">
            <RevealOnView variant="fade-up">
              <h2
                id="about-story-heading"
                className="text-[clamp(1.6rem,4vw,2.35rem)] font-bold leading-tight tracking-tight text-[#0b1f44]"
              >
                {about.story.heading}
              </h2>
              <div className="mt-6 space-y-4 text-base leading-relaxed text-slate-600 sm:text-[1.0625rem]">
                {about.story.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              <Link
                to="/listings/buy-plots"
                className="mt-8 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#f58e43] hover:underline sm:mt-10"
              >
                Browse land listings
                <FontAwesomeIcon icon={faArrowRight} className="text-xs" aria-hidden />
              </Link>
            </RevealOnView>

            <div className="flex min-w-0 flex-col gap-6">
              <RevealOnView variant="fade-up" delayMs={60}>
                <figure className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-linear-to-br from-[#0b1f44] to-[#152a55] p-6 text-white shadow-lg sm:rounded-3xl sm:p-8">
                  <FontAwesomeIcon
                    icon={faQuoteLeft}
                    className="text-2xl text-[#f58e43]/90 sm:text-3xl"
                    aria-hidden
                  />
                  <blockquote className="mt-4 text-base font-medium leading-relaxed text-white/95 sm:text-lg">
                    {about.story.spotlightQuote.text}
                  </blockquote>
                  <figcaption className="mt-5 text-sm font-semibold text-[#f58e43]">
                    — {about.story.spotlightQuote.attribution}
                  </figcaption>
                </figure>
              </RevealOnView>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {about.stats.map((s) => (
                  <RevealOnView key={s.value} variant="fade-up" delayMs={40}>
                    <article
                      className={`flex h-full flex-col justify-end rounded-2xl p-4 shadow-sm sm:rounded-3xl sm:p-5 ${s.toneClass}`}
                    >
                      <p className="text-lg font-extrabold tracking-tight sm:text-xl">{s.value}</p>
                      <p className="mt-2 text-[11px] font-medium leading-snug opacity-95 sm:text-xs">{s.label}</p>
                    </article>
                  </RevealOnView>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-16 md:py-20" aria-labelledby="why-eurostar-heading">
        <div className="landing-inner max-w-full">
          <RevealOnView variant="fade-up">
            <h2
              id="why-eurostar-heading"
              className="text-center text-[clamp(1.45rem,4vw,2rem)] font-bold text-[#0b1f44]"
            >
              {whyHead.title}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-slate-600 sm:text-base">{whyHead.subtitle}</p>
          </RevealOnView>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {eurostarWhyChooseItems.map((item, i) => (
              <RevealOnView key={item.title} variant="fade-up" delayMs={40 * i}>
                <article className="h-full rounded-2xl border border-slate-200/90 bg-slate-50/40 p-6 shadow-sm sm:rounded-3xl sm:p-7">
                  <h3 className="text-base font-bold text-[#0b1f44] sm:text-lg">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
                  {"subPoints" in item && item.subPoints ? (
                    <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-slate-600">
                      {item.subPoints.map((pt) => (
                        <li key={pt}>{pt}</li>
                      ))}
                    </ul>
                  ) : null}
                </article>
              </RevealOnView>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-100 bg-[#f8fafc] py-14 sm:py-16 md:py-20" aria-labelledby="about-mvv-heading">
        <div className="landing-inner max-w-full">
          <RevealOnView variant="fade-up">
            <h2 id="about-mvv-heading" className="text-center text-[clamp(1.45rem,4vw,2rem)] font-bold text-[#0b1f44]">
              {language === "bn" ? "মিশন, ভিশন ও ভ্যালুস" : "Mission, Vision & Values"}
            </h2>
          </RevealOnView>
          <div className="mt-10 grid gap-5 md:grid-cols-3 md:gap-6">
            {missionVisionValues.map((item, i) => (
              <RevealOnView key={item.title} variant="fade-up" delayMs={40 * i}>
                <article className="h-full rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm sm:rounded-3xl sm:p-7">
                  <h3 className="text-lg font-bold text-[#0b1f44]">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-[0.95rem]">{item.body}</p>
                </article>
              </RevealOnView>
            ))}
          </div>
        </div>
      </section>

      {/* Founder spotlight */}
      <section className="bg-[#f1f5f9]/60 py-14 sm:py-16 md:py-20" aria-labelledby="founder-heading">
        <div className="landing-inner max-w-full">
          <RevealOnView variant="fade-up">
            <p className="text-center text-xs font-bold uppercase tracking-[0.22em] text-[#f58e43] sm:text-sm">
              Founder&apos;s profile
            </p>
            <h2 id="founder-heading" className="mt-3 text-center text-[clamp(1.5rem,4vw,2.1rem)] font-bold text-[#0b1f44]">
              {founder.name}
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-center text-sm font-semibold text-slate-600 sm:text-base">
              {founder.role}
            </p>
          </RevealOnView>

          <div className="mx-auto mt-10 max-w-4xl">
            <RevealOnView variant="fade-up" delayMs={50}>
              <article className="grid gap-8 overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)] sm:grid-cols-[auto_minmax(0,1fr)] sm:items-start sm:gap-10 sm:p-10 md:p-12">
                <img
                  src={founder.imageSrc}
                  alt=""
                  className="mx-auto h-36 w-36 shrink-0 rounded-2xl border border-slate-200 object-cover shadow-md sm:mx-0 sm:h-40 sm:w-40"
                  width={160}
                  height={160}
                  loading="lazy"
                />
                <div className="min-w-0 text-center sm:text-left">
                  <p className="text-base leading-relaxed text-slate-600 sm:text-[1.0625rem]">{founder.summary}</p>
                  <ul className="mt-6 space-y-3 text-left text-sm text-slate-700 sm:text-base">
                    {founder.highlights.map((line) => (
                      <li key={line} className="flex gap-3">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#f58e43]" aria-hidden />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 flex flex-wrap justify-center gap-3 sm:justify-start">
                    <Link
                      to="/contact?topic=founder"
                      className="inline-flex min-h-10 items-center rounded-full border border-slate-300 bg-white px-5 text-sm font-bold text-[#0b1f44] transition hover:bg-slate-50"
                    >
                      Request introduction
                    </Link>
                  </div>
                </div>
              </article>
            </RevealOnView>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="py-14 sm:py-16 md:py-20" aria-labelledby="principles-heading">
        <div className="landing-inner max-w-full">
          <RevealOnView variant="fade-up">
            <h2 id="principles-heading" className="text-center text-[clamp(1.45rem,4vw,2rem)] font-bold text-[#0b1f44]">
              How we work
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-relaxed text-slate-600 sm:text-base">
              Principles that show up in product decisions, not just on a slide—so investors and partners know what to
              expect.
            </p>
          </RevealOnView>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:gap-6 xl:grid-cols-4">
            {principles.map((principle, i) => (
              <RevealOnView key={principle.title} variant="fade-up" delayMs={40 * i}>
                <article className="group flex h-full flex-col rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm transition hover:border-[#f58e43]/40 hover:shadow-md sm:rounded-3xl sm:p-7">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0b1f44]/6 text-[#0b1f44] transition group-hover:bg-[#f58e43]/15 group-hover:text-[#b84a0f]">
                    <FontAwesomeIcon icon={PRINCIPLE_ICONS[i] ?? faCompass} className="text-lg" aria-hidden />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-[#0b1f44]">{principle.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{principle.body}</p>
                </article>
              </RevealOnView>
            ))}
          </div>
        </div>
      </section>

      {/* Focus areas */}
      <section className="border-t border-slate-100 bg-[#f8fafc] py-14 sm:py-16 md:py-20" aria-labelledby="focus-heading">
        <div className="landing-inner max-w-full">
          <RevealOnView variant="fade-up">
            <h2 id="focus-heading" className="text-center text-[clamp(1.45rem,4vw,2rem)] font-bold text-[#0b1f44]">
              Explore the platform
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-slate-600 sm:text-base">
              Move from reading about us to seeing how listings, plans, and legal support connect in one experience.
            </p>
          </RevealOnView>
          <div className="mt-10 grid gap-5 md:grid-cols-3 md:gap-6">
            {focusAreas.map((f, i) => (
              <RevealOnView key={f.title} variant="fade-up" delayMs={50 * i}>
                <Link
                  to={f.href}
                  className="group flex h-full flex-col rounded-2xl border border-slate-200/90 bg-white p-7 shadow-[0_14px_40px_rgba(15,23,42,0.06)] transition hover:border-[#f58e43]/35 hover:shadow-[0_20px_48px_rgba(245,142,67,0.12)] sm:rounded-3xl sm:p-8"
                >
                  <h3 className="text-lg font-bold text-[#0b1f44] sm:text-xl">{f.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600 sm:text-[0.9375rem]">{f.body}</p>
                  <span className="mt-6 inline-flex items-center gap-1 text-sm font-bold text-[#f58e43]">
                    Continue
                    <FontAwesomeIcon
                      icon={faArrowRight}
                      className="text-xs transition group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </span>
                </Link>
              </RevealOnView>
            ))}
          </div>
        </div>
      </section>

      {/* Disclosures */}
      <section className="border-t border-slate-100 bg-white py-12 sm:py-16" aria-labelledby="disclosures-heading">
        <div className="landing-inner max-w-full">
          <RevealOnView variant="fade-up">
            <h2 id="disclosures-heading" className="text-lg font-bold text-[#0b1f44] sm:text-xl">
              {disclosuresHeading}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Use this block for statutory IDs and registry lines once your counsel clears them for the site.
            </p>
          </RevealOnView>
          <RevealOnView variant="fade-up" delayMs={40} className="mt-8">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/50 shadow-sm">
              <table className="w-full min-w-0 text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-white">
                    <th className="px-4 py-3.5 font-semibold text-[#0b1f44] sm:px-5">Topic</th>
                    <th className="px-4 py-3.5 font-semibold text-[#0b1f44] sm:px-5">Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {disclosureRows.map((row, i) => (
                    <tr key={row.jurisdiction} className={i % 2 === 1 ? "bg-white" : "bg-slate-50/80"}>
                      <td className="border-t border-slate-100 px-4 py-3.5 font-medium text-[#0b1f44] sm:px-5">
                        {row.jurisdiction}
                      </td>
                      <td className="border-t border-slate-100 px-4 py-3.5 text-slate-600 sm:px-5">{row.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </RevealOnView>
        </div>
      </section>
    </main>
  )
}
