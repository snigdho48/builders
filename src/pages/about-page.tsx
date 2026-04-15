import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowRight, faCheck, faChevronRight, faStar } from "@fortawesome/free-solid-svg-icons"
import { Link } from "react-router-dom"

import { RevealOnView } from "@/components/motion/reveal-on-view"

const H = "https://gaviaspreview.com/wp/homirx/wp-content/uploads/2024/11"
const heroBg =
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2000&q=80"

/** YouTube embed (same ID as HomiRX reference) — avoids hotlink / poster issues */
const ABOUT_VIDEO_EMBED = "https://www.youtube.com/embed/QmfVLaBan5I?rel=0&modestbranding=1"

const brandLogos = [`${H}/brand-1.png`, `${H}/brand-2.png`, `${H}/brand-3.png`, `${H}/brand-4.png`, `${H}/brand-5.png`, `${H}/brand-6.png`]

const stats = [
  { value: "20.5K", label: "Properties sold" },
  { value: "100.5K", label: "Happy clients" },
  { value: "150.5K", label: "Total investment" },
]

const team = [
  { name: "Savannah Nguyen", phone: "(0123) 456 789", img: `${H}/team-1.jpg` },
  { name: "Annette Black", phone: "(0123) 456 789", img: `${H}/team-2.jpg` },
  { name: "Kathryn Murphy", phone: "(0123) 456 789", img: `${H}/team-3.jpg` },
  { name: "David Hardson", phone: "(0123) 456 789", img: `${H}/team-4.jpg` },
]

const testimonials = [
  {
    quote:
      "Praesent ut lacus a velit tincidunt aliquam a eget urna. Sed ullamcorper tristique nisl at pharetra turpis accumsan et etiam eu sollicitudin eros. In imperdiet accumsan.",
    name: "Kristin Watson",
    role: "Web designer",
    avatar: `${H}/testimonial-3.jpg`,
  },
  {
    quote:
      "Praesent ut lacus a velit tincidunt aliquam a eget urna. Sed ullamcorper tristique nisl at pharetra turpis accumsan et etiam eu sollicitudin eros. In imperdiet accumsan.",
    name: "Wade Warren",
    role: "President of sales",
    avatar: `${H}/testimonial-2.jpg`,
  },
  {
    quote:
      "Praesent ut lacus a velit tincidunt aliquam a eget urna. Sed ullamcorper tristique nisl at pharetra turpis accumsan et etiam eu sollicitudin eros. In imperdiet accumsan.",
    name: "Jessica Brown",
    role: "Founder & CEO",
    avatar: `${H}/testimonial-1.jpg`,
  },
]

const featureTypes = [
  { title: "Commercial", count: "6 properties", href: "/listings" },
  { title: "Villa", count: "8 properties", href: "/listings" },
  { title: "Apartment", count: "6 properties", href: "/listings" },
  { title: "Warehouse", count: "4 properties", href: "/listings" },
]

export function AboutPage() {
  return (
    <main className="about-page min-w-0 overflow-x-hidden bg-white text-[#1a1a1a]">
      {/* Page hero */}
      <section
        className="relative isolate flex min-h-[12.5rem] items-end pb-8 pt-24 max-[380px]:min-h-[11rem] sm:min-h-[16rem] sm:pb-12 sm:pt-32 md:min-h-[18rem]"
        style={{
          backgroundImage: `linear-gradient(105deg, rgb(10 29 55 / 0.9) 0%, rgb(10 29 55 / 0.58) 48%, rgb(10 29 55 / 0.82) 100%), url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="landing-inner w-full max-w-full pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          <h1 className="text-[clamp(1.65rem,6vw,2.35rem)] font-bold leading-[1.15] tracking-tight text-[#ffffff] sm:text-4xl">
            About us
          </h1>
          <nav className="mt-2.5 text-xs font-medium text-[rgba(255,255,255,0.88)] sm:mt-3 sm:text-sm" aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link to="/" className="text-[rgba(255,255,255,0.92)] transition hover:text-[#ffffff]">
                  Home
                </Link>
              </li>
              <li aria-hidden className="text-[rgba(255,255,255,0.45)]">
                {">"}
              </li>
              <li className="font-semibold text-[#f58e43]">About us</li>
            </ol>
          </nav>
        </div>
      </section>

      {/* Success story + stats + video + brands */}
      <section className="bg-[#f6f7f9] py-10 sm:py-14 md:py-20">
        <div className="landing-inner max-w-full">
          <RevealOnView variant="fade-up">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f58e43] sm:text-sm sm:tracking-[0.2em]">
              Our achievement
            </p>
            <div className="mt-5 flex flex-col gap-8 sm:mt-6 sm:gap-10 lg:flex-row lg:items-end lg:justify-between">
              <h2 className="max-w-xl text-[clamp(1.25rem,4.8vw,2.15rem)] font-bold leading-snug tracking-tight text-[#0a1d37] sm:text-3xl md:leading-tight">
                Our Homeda awesome success story.
              </h2>
              <div className="grid w-full grid-cols-3 gap-3 sm:flex sm:w-auto sm:flex-wrap sm:justify-end sm:gap-8 md:gap-10 lg:shrink-0 lg:gap-12">
                {stats.map((s) => (
                  <div key={s.label} className="min-w-0 sm:min-w-[5.5rem]">
                    <p className="text-xl font-bold tabular-nums text-[#0a1d37] sm:text-2xl md:text-3xl">{s.value}</p>
                    <p className="mt-1 text-[11px] font-semibold capitalize leading-snug text-[#5c6573] sm:text-[13px]">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </RevealOnView>

          {/* No RevealOnView: global .light-content + reveal opacity hid the block for some users */}
          <div className="mt-8 sm:mt-10 md:mt-12">
            <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-black shadow-[0_20px_50px_rgba(10,29,55,0.14)] sm:rounded-2xl">
              <div className="relative aspect-video w-full min-h-0 overflow-hidden">
                <iframe
                  title="About our real estate platform"
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

          <div className="mt-8 grid grid-cols-3 place-items-center gap-x-4 gap-y-6 border-t border-slate-200/90 pt-8 sm:mt-10 sm:flex sm:flex-wrap sm:justify-between sm:gap-x-6 sm:pt-10">
            {brandLogos.map((src) => (
              <img
                key={src}
                src={src}
                alt=""
                className="h-7 w-auto max-w-[5.25rem] object-contain opacity-75 contrast-[0.92] sm:h-9 sm:max-w-[6.5rem] sm:opacity-85"
                loading="lazy"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Trusted advisors — dark band */}
      <section className="bg-[#0a1d37] py-10 text-[#f1f5f9] sm:py-14 md:py-20">
        <div className="landing-inner max-w-full">
          <div className="grid gap-10 sm:gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
            <RevealOnView variant="fade-up">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f58e43] sm:text-sm sm:tracking-[0.2em]">
                About us
              </p>
              <h2 className="mt-3 text-[clamp(1.35rem,5vw,2.1rem)] font-bold leading-snug text-[#ffffff] sm:mt-4 sm:leading-tight md:text-[2.1rem]">
                Our trusted <em className="not-italic text-[#f58e43]">real estate</em> advisors.
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-[rgba(255,255,255,0.88)] sm:mt-5 sm:text-base">
                It is a long established fact that a reader will be distracted by the readable content of a page when
                looking at layout — the point of using lorem is that it has a more-or-less normal distribution of
                letters.
              </p>
              <ul className="mt-8 space-y-3 text-sm font-medium text-[#f8fafc] sm:text-base">
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f58e43] text-[#ffffff] shadow-sm">
                    <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
                  </span>
                  List your own property
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f58e43] text-[#ffffff] shadow-sm">
                    <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
                  </span>
                  Friendly host &amp; fast support
                </li>
              </ul>
              <Link
                to="/contact"
                className="mt-8 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border-2 border-[#ffffff] bg-[rgba(255,255,255,0.14)] px-6 py-3.5 text-sm font-semibold text-[#ffffff] shadow-sm backdrop-blur-sm transition hover:border-[#ffffff] hover:bg-[#ffffff] hover:text-[#0a1d37] hover:shadow-md sm:mt-10 sm:w-auto sm:justify-start sm:px-8"
              >
                Contact us
                <FontAwesomeIcon icon={faArrowRight} className="text-xs" aria-hidden />
              </Link>
              <div className="mt-10 flex flex-wrap gap-8 sm:mt-12 sm:gap-10">
                <div>
                  <p className="text-3xl font-bold text-[#ffffff] sm:text-4xl">
                    30<span className="text-lg font-semibold text-[rgba(255,255,255,0.78)]">k+</span>
                  </p>
                  <p className="mt-1 text-sm font-medium text-[rgba(255,255,255,0.75)]">Satisfied client</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-[#ffffff] sm:text-4xl">
                    700<span className="text-lg font-semibold text-[rgba(255,255,255,0.78)]">+</span>
                  </p>
                  <p className="mt-1 text-sm font-medium text-[rgba(255,255,255,0.75)]">House</p>
                </div>
              </div>
            </RevealOnView>

            <RevealOnView className="relative min-w-0" variant="fade-up">
              <div className="relative mx-auto max-w-lg min-w-0 lg:mx-0 lg:max-w-none">
                <img
                  src={`${H}/image-03.jpg`}
                  alt=""
                  className="relative z-0 w-full max-w-full rounded-xl object-cover shadow-xl sm:rounded-2xl"
                  loading="lazy"
                />
                <div className="mt-4 w-full max-w-full rounded-xl border border-slate-200/90 bg-white p-4 text-[#1a1a1a] shadow-2xl sm:absolute sm:bottom-3 sm:right-0 sm:mt-0 sm:max-w-[min(100%,14.5rem)] sm:p-5 sm:shadow-2xl md:bottom-4 md:max-w-[14.5rem]">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#5c6573] sm:text-xs">Featured</p>
                  <p className="mt-1 text-sm font-semibold text-[#0a1d37] sm:text-base">Luxurious boutique offices</p>
                  <p className="mt-2 text-xl font-bold text-[#f58e43] sm:mt-3 sm:text-2xl">From $4,500</p>
                  <p className="mt-2 text-[11px] leading-relaxed text-[#5c6573] sm:text-xs">6391 Elgin St, Celina · 16235</p>
                </div>
              </div>
            </RevealOnView>
          </div>
        </div>
      </section>

      {/* Team */}
      <section id="team" className="scroll-mt-20 bg-white py-10 sm:scroll-mt-24 sm:py-14 md:py-20">
        <div className="landing-inner max-w-full">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
            <RevealOnView variant="fade-up" className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f58e43] sm:text-sm sm:tracking-[0.2em]">
                Our expert
              </p>
              <h2 className="mt-2 text-[clamp(1.25rem,4.5vw,1.9rem)] font-bold leading-snug tracking-tight text-[#0a1d37] sm:mt-3 sm:text-3xl">
                Meet our real estate team
              </h2>
            </RevealOnView>
            <RevealOnView variant="fade-up" className="w-full shrink-0 sm:w-auto">
              <Link
                to="/contact"
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#f58e43] px-6 py-3 text-sm font-semibold text-[#1a1a1a] transition hover:bg-[#ff9b4f] sm:w-auto sm:justify-center"
              >
                View more
                <span aria-hidden>→</span>
              </Link>
            </RevealOnView>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:mt-10 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {team.map((m) => (
              <RevealOnView key={m.name} variant="fade-up">
                <article className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm transition hover:shadow-md sm:rounded-2xl">
                  <div className="aspect-[3/4] overflow-hidden sm:aspect-[4/5]">
                    <img src={m.img} alt="" className="h-full w-full object-cover" loading="lazy" />
                  </div>
                  <div className="p-4 sm:p-5">
                    <h3 className="font-semibold text-[#0a1d37]">{m.name}</h3>
                    <p className="mt-2 text-sm text-[#5c6573]">
                      <span className="font-medium text-[#5c6573]">Call: </span>
                      <a href={`tel:${m.phone.replace(/\D/g, "")}`} className="text-[#0a1d37] underline-offset-2 hover:underline">
                        {m.phone}
                      </a>
                    </p>
                  </div>
                </article>
              </RevealOnView>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="scroll-mt-20 bg-[#0a1d37] py-10 text-[#f1f5f9] sm:scroll-mt-24 sm:py-14 md:py-20">
        <div className="landing-inner max-w-full">
          <RevealOnView className="text-center" variant="fade-up">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f58e43] sm:text-sm sm:tracking-[0.2em]">
              Testimonials
            </p>
            <h2 className="mt-2 text-[clamp(1.35rem,5vw,1.9rem)] font-bold leading-snug text-[#ffffff] sm:mt-3 sm:text-3xl">
              Trusted client feedback
            </h2>
          </RevealOnView>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:mt-10 sm:gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <RevealOnView key={t.name} variant="fade-up">
                <article className="flex h-full flex-col rounded-xl border border-[rgba(255,255,255,0.22)] bg-[#0c223f] p-5 shadow-lg sm:rounded-2xl sm:p-6">
                  <div className="flex gap-1 text-[#f58e43]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <FontAwesomeIcon key={i} icon={faStar} className="text-sm" />
                    ))}
                  </div>
                  <p className="mt-5 flex-1 text-sm leading-relaxed text-[rgba(255,255,255,0.92)]">{t.quote}</p>
                  <div className="mt-8 flex items-center gap-3 border-t border-[rgba(255,255,255,0.18)] pt-6">
                    <img
                      src={t.avatar}
                      alt=""
                      className="h-12 w-12 rounded-full object-cover ring-2 ring-[#f58e43]/50"
                      loading="lazy"
                    />
                    <div>
                      <p className="font-semibold text-[#ffffff]">{t.name}</p>
                      <p className="text-xs text-[rgba(255,255,255,0.78)]">{t.role}</p>
                    </div>
                  </div>
                </article>
              </RevealOnView>
            ))}
          </div>
        </div>
      </section>

      {/* Top features — CTA strip */}
      <section
        className="relative isolate overflow-hidden py-12 sm:py-16 md:py-20"
        style={{
          backgroundImage: `linear-gradient(95deg, rgb(10 29 55 / 0.93) 0%, rgb(10 29 55 / 0.84) 42%, rgb(10 29 55 / 0.58) 100%), url(${H}/gallery-4.jpg)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="landing-inner relative z-10 max-w-full">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:items-center lg:gap-12">
            <RevealOnView variant="fade-up" className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f58e43] sm:text-sm sm:tracking-[0.2em]">
                Facilities
              </p>
              <h2 className="mt-2 text-[clamp(1.35rem,5vw,2rem)] font-bold leading-snug text-[#f58e43] sm:mt-3 sm:text-3xl">
                Top features
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-[rgba(255,255,255,0.92)] sm:mt-4 sm:text-base">
                Explore listings by property type — commercial, villas, apartments, and more.
              </p>
              <Link
                to="/listings"
                className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border-2 border-[#ffffff] bg-[rgba(255,255,255,0.14)] px-6 py-3.5 text-sm font-semibold text-[#ffffff] shadow-sm backdrop-blur-sm transition hover:border-[#ffffff] hover:bg-[#ffffff] hover:text-[#0a1d37] hover:shadow-md sm:mt-8 sm:w-auto sm:px-8"
              >
                Add properties
                <span aria-hidden>→</span>
              </Link>
              <img
                src={`${H}/image-04.png`}
                alt=""
                className="mt-10 hidden max-h-48 w-auto object-contain opacity-90 lg:block"
                loading="lazy"
              />
            </RevealOnView>
            <RevealOnView variant="fade-up" className="min-w-0">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                {featureTypes.map((f) => (
                  <Link
                    key={f.title}
                    to={f.href}
                    className="group flex min-h-[4.5rem] flex-col justify-center rounded-xl border border-slate-200/90 bg-white p-4 shadow-md transition hover:border-[#f58e43]/60 hover:shadow-lg active:scale-[0.99] sm:min-h-0 sm:rounded-2xl sm:p-6"
                  >
                    <p className="text-base font-semibold text-[#0a1d37] sm:text-lg">{f.title}</p>
                    <p className="mt-2 text-sm capitalize text-[#5c6573]">{f.count}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#f58e43]">
                      Browse
                      <FontAwesomeIcon icon={faChevronRight} className="text-xs transition group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                ))}
              </div>
            </RevealOnView>
          </div>
        </div>
      </section>
    </main>
  )
}
