import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowRight } from "@fortawesome/free-solid-svg-icons"
import { Link } from "react-router-dom"

import {
  aboutHero,
  aboutStats,
  aboutStory,
  disclosureRows,
  disclosuresHeading,
  focusAreas,
  founder,
  profilePdfHref,
  profilePdfFileName,
} from "@/content/about-mahfuz-from-profile"

/** YouTube embed — replace with your own channel video if needed */
const ABOUT_VIDEO_EMBED = "https://www.youtube.com/embed/QmfVLaBan5I?rel=0&modestbranding=1"

export function AboutPage() {
  return (
    <main className="about-page min-w-0 overflow-x-hidden bg-white text-[#1a1a1a]">
      {/* Hero — light grid, headline + video */}
      <section
        className="relative isolate overflow-hidden border-b border-slate-200/90 bg-[#fafbfc] pt-20 pb-10 sm:pt-24 sm:pb-14 md:pt-28 md:pb-16"
        aria-labelledby="about-hero-heading"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.55]"
          style={{
            backgroundImage: `radial-gradient(rgb(148 163 184 / 0.35) 1px, transparent 1px)`,
            backgroundSize: "14px 14px",
          }}
          aria-hidden
        />
        <div className="landing-inner relative z-[1] max-w-full">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-center lg:gap-12 xl:gap-16">
            <div>
              <h1
                id="about-hero-heading"
                className="text-[clamp(1.75rem,5vw,2.85rem)] font-extrabold leading-[1.12] tracking-tight text-[#0f172a]"
              >
                {aboutHero.title}
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-[1.05rem]">
                {aboutHero.subtitle}
              </p>
              <p className="mt-6 text-sm text-slate-500">
                Full profile document:{" "}
                <a
                  href={profilePdfHref}
                  className="font-semibold text-[#E85A2A] underline-offset-2 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {profilePdfFileName}
                </a>
                <span className="sr-only"> (opens PDF in a new tab)</span>
              </p>
            </div>
            <div className="min-w-0">
              <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-black shadow-[0_24px_60px_rgba(15,23,42,0.12)] sm:rounded-3xl">
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
            </div>
          </div>

          <nav
            className="mt-8 text-xs font-medium text-slate-500 sm:mt-10 sm:text-sm"
            aria-label="Breadcrumb"
          >
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link to="/" className="text-slate-600 transition hover:text-[#0b2348]">
                  Home
                </Link>
              </li>
              <li aria-hidden className="text-slate-300">
                /
              </li>
              <li className="font-semibold text-[#E85A2A]">About us</li>
            </ol>
          </nav>
        </div>
      </section>

      {/* Story + stat cards */}
      <section className="border-b border-slate-100 py-12 sm:py-16 md:py-20" aria-labelledby="about-story-heading">
        <div className="landing-inner max-w-full">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-14 xl:gap-20">
            <div className="min-w-0">
              <h2
                id="about-story-heading"
                className="text-[clamp(1.5rem,4vw,2.25rem)] font-bold leading-tight tracking-tight text-[#0f172a]"
              >
                {aboutStory.heading}
              </h2>
              <div className="mt-6 space-y-4 text-base leading-relaxed text-slate-600 sm:text-[1.05rem]">
                {aboutStory.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              <Link
                to="/contact"
                className="mt-8 inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] bg-[#E85A2A] px-6 text-sm font-bold text-white shadow-[0_10px_28px_rgba(232,90,42,0.25)] transition hover:bg-[#ea7045] sm:mt-10"
              >
                Talk with us
                <FontAwesomeIcon icon={faArrowRight} className="text-xs" aria-hidden />
              </Link>
            </div>
            <div className="grid min-w-0 grid-cols-2 gap-3 sm:gap-4">
              {aboutStats.map((s) => (
                <article
                  key={s.value}
                  className={`flex flex-col justify-end rounded-2xl p-5 shadow-sm sm:rounded-3xl sm:p-6 ${s.toneClass}`}
                >
                  <p className="text-xl font-extrabold tracking-tight sm:text-2xl">{s.value}</p>
                  <p className="mt-2 text-xs font-medium leading-snug opacity-90 sm:text-sm">{s.label}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="bg-[#f6f7f9] py-12 sm:py-16 md:py-20" aria-labelledby="founder-heading">
        <div className="landing-inner max-w-full">
          <h2
            id="founder-heading"
            className="text-center text-xs font-bold uppercase tracking-[0.22em] text-[#E85A2A] sm:text-sm"
          >
            Founder&apos;s profile
          </h2>
          <div className="mx-auto mt-8 max-w-2xl sm:mt-10">
            <article className="flex flex-col gap-5 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:gap-6 sm:rounded-3xl sm:p-6 md:p-8">
              <img
                src={founder.imageSrc}
                alt=""
                className="mx-auto h-28 w-28 shrink-0 rounded-full border border-slate-200 object-cover shadow-inner sm:mx-0 sm:h-32 sm:w-32"
                width={128}
                height={128}
                loading="lazy"
              />
              <div className="min-w-0 text-center sm:text-left">
                <h3 className="text-xl font-bold text-[#0f172a] sm:text-2xl">{founder.name}</h3>
                <p className="mt-1 text-sm font-semibold text-[#E85A2A]">{founder.role}</p>
                <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">{founder.summary}</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Focus areas — brand-style cards */}
      <section className="py-12 sm:py-16 md:py-20" aria-labelledby="focus-heading">
        <div className="landing-inner max-w-full">
          <h2
            id="focus-heading"
            className="text-center text-[clamp(1.35rem,4vw,2rem)] font-bold tracking-tight text-[#0f172a]"
          >
            What we focus on
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-relaxed text-slate-600 sm:text-base">
            Three pillars that keep the product experience coherent from discovery to booking.
          </p>
          <div className="mt-10 grid gap-5 sm:mt-12 md:grid-cols-3 md:gap-6">
            {focusAreas.map((f) => (
              <Link
                key={f.title}
                to={f.href}
                className="group flex h-full flex-col rounded-2xl border border-slate-200/90 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)] transition hover:border-[#E85A2A]/35 hover:shadow-[0_18px_48px_rgba(232,90,42,0.12)] sm:rounded-3xl sm:p-7"
              >
                <h3 className="text-lg font-bold text-[#0f172a] sm:text-xl">{f.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">{f.body}</p>
                <span className="mt-6 inline-flex items-center gap-1 text-sm font-bold text-[#E85A2A]">
                  Continue
                  <FontAwesomeIcon
                    icon={faArrowRight}
                    className="text-xs transition group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Simple disclosures table */}
      <section className="border-t border-slate-100 bg-[#fafbfc] py-12 sm:py-16" aria-labelledby="disclosures-heading">
        <div className="landing-inner max-w-full">
          <h2 id="disclosures-heading" className="text-lg font-bold text-[#0f172a] sm:text-xl">
            {disclosuresHeading}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Populate this block with statutory IDs from your PDF or counsel when they are ready for publication.
          </p>
          <div className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm sm:rounded-2xl">
            <table className="w-full min-w-0 text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 font-semibold text-slate-700 sm:px-5 sm:py-3.5">Topic</th>
                  <th className="px-4 py-3 font-semibold text-slate-700 sm:px-5 sm:py-3.5">Detail</th>
                </tr>
              </thead>
              <tbody>
                {disclosureRows.map((row, i) => (
                  <tr
                    key={row.jurisdiction}
                    className={i % 2 === 1 ? "bg-slate-50/80" : "bg-white"}
                  >
                    <td className="border-t border-slate-100 px-4 py-3 font-medium text-[#0f172a] sm:px-5 sm:py-3.5">
                      {row.jurisdiction}
                    </td>
                    <td className="border-t border-slate-100 px-4 py-3 text-slate-600 sm:px-5 sm:py-3.5">
                      {row.detail}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  )
}
