import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faAnglesRight,
  faEnvelope,
  faLocationDot,
  faPhone,
} from "@fortawesome/free-solid-svg-icons"
import { faFacebookF, faInstagram, faLinkedinIn, faXTwitter } from "@fortawesome/free-brands-svg-icons"
import { Link, useLocation } from "react-router-dom"

import { publicUrl } from "@/utils/public-url"

const accent = "#f15a24"

const galleryImages = [
  "https://gaviaspreview.com/wp/homirx/wp-content/uploads/2024/11/gallery-1.jpg",
  "https://gaviaspreview.com/wp/homirx/wp-content/uploads/2024/11/gallery-2.jpg",
  "https://gaviaspreview.com/wp/homirx/wp-content/uploads/2024/11/gallery-3.jpg",
  "https://gaviaspreview.com/wp/homirx/wp-content/uploads/2024/11/gallery-4.jpg",
  "https://gaviaspreview.com/wp/homirx/wp-content/uploads/2024/11/gallery-5.jpg",
  "https://gaviaspreview.com/wp/homirx/wp-content/uploads/2024/11/gallery-5.jpg",
]

const quickLinks: { label: string; to: string }[] = [
  { label: "Startup Business", to: "/listings" },
  { label: "Financial Advice", to: "/plans" },
  { label: "Management", to: "/contact" },
  { label: "Business Advice", to: "/legal" },
  { label: "Strategy Services", to: "/p2p" },
]

const discoverLinks: { label: string; to: string }[] = [
  { label: "About", to: "/about" },
  { label: "FAQ", to: "/#faq" },
  { label: "Our Team", to: "/about#team" },
  { label: "Testimonials", to: "/about#testimonials" },
  { label: "Gallery", to: "/listings" },
  { label: "Contact", to: "/contact" },
]

function FooterHeading({ children }: { children: string }) {
  return (
    <h2 className="mb-5 text-[18px] font-bold leading-[1.35] text-white">
      <span className="relative inline-block pb-2.5">
        {children}
        <span
          className="absolute bottom-0 left-0 block h-[3px] w-10 rounded-full"
          style={{ backgroundColor: accent }}
          aria-hidden
        />
      </span>
    </h2>
  )
}

function ChevronLink({ to, children }: { to: string; children: string }) {
  return (
    <Link
      to={to}
      className="group flex min-w-0 items-center gap-2 py-1.5 text-[16px] leading-[1.55] text-slate-300 transition-colors hover:text-white"
    >
      <FontAwesomeIcon
        icon={faAnglesRight}
        className="w-4 shrink-0 text-[13px] transition-colors group-hover:opacity-90"
        style={{ color: accent }}
      />
      <span className="min-w-0 wrap-break-word">{children}</span>
    </Link>
  )
}

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#16243E] text-[16px] font-semibold leading-[1.6] text-slate-300 font-sans">
      {/* Decorative background (reference: faint geometry left / circles right) */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-[min(42%,320px)] opacity-[0.08]"
        aria-hidden
        style={{
          backgroundImage:
            "repeating-linear-gradient(-35deg, transparent, transparent 12px, rgba(255,255,255,0.5) 12px, rgba(255,255,255,0.5) 14px)",
        }}
      />
      <div
        className="pointer-events-none absolute -right-16 top-1/2 h-[min(90vw,420px)] w-[min(90vw,420px)] -translate-y-1/2 rounded-full border border-white/10 opacity-[0.12]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-8 top-24 h-2 w-2 rotate-45 rounded-[1px] opacity-90"
        style={{ backgroundColor: accent }}
        aria-hidden
      />

      <div className="relative z-[1] mx-auto max-w-[1240px] px-4 pt-10 sm:px-6">
        <div
          className="rounded-2xl px-4 py-5 text-white shadow-[0_14px_40px_rgba(0,0,0,0.28)] sm:px-8 sm:py-6"
          style={{ backgroundColor: accent }}
        >
          <div className="grid gap-6 divide-white/25 sm:grid-cols-3 sm:gap-0 sm:divide-x">
            <div className="flex items-center gap-3 sm:pr-6">
              <span className="inline-flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-white text-[18px] shadow-sm">
                <FontAwesomeIcon icon={faLocationDot} style={{ color: accent }} />
              </span>
              <div className="min-w-0">
                <p className="text-[16px] leading-[1.45] text-white/95">Address</p>
                <p className="text-[16px] leading-[1.45] text-white">6391 Elgin St, Delaware</p>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:px-6">
              <span className="inline-flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-white text-[16px] shadow-sm">
                <FontAwesomeIcon icon={faEnvelope} style={{ color: accent }} />
              </span>
              <div className="min-w-0">
                <p className="text-[16px] leading-[1.45] text-white/95">Send Email</p>
                <a
                  href="mailto:contact@example.com"
                  className="block text-[16px] leading-[1.45] text-white underline-offset-2 hover:underline"
                >
                  contact@example.com
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:pl-6">
              <span className="inline-flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-white text-[16px] shadow-sm">
                <FontAwesomeIcon icon={faPhone} style={{ color: accent }} />
              </span>
              <div className="min-w-0">
                <p className="text-[16px] leading-[1.45] text-white/95">Call Emergency</p>
                <a
                  href="tel:+88012365499"
                  className="block text-[16px] leading-[1.45] text-white underline-offset-2 hover:underline"
                >
                  +88 0123 654 99
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-[1] mx-auto grid max-w-[1240px] grid-cols-2 gap-x-6 gap-y-10 px-4 pb-12 pt-12 sm:px-6 sm:gap-x-8 lg:grid-cols-4 lg:gap-x-12 lg:gap-y-12">
        <div className="col-span-2 space-y-4 max-lg:min-w-0 lg:col-span-1 lg:max-w-[280px]">
          <Link to="/" className="inline-flex items-center gap-3 text-white transition-opacity hover:opacity-90">
            <span className="inline-flex h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-[#f58e43] bg-[#16243E] shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
              <img
                src={publicUrl("navlogo.jpg")}
                alt="Eurostar"
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </span>
            <span className="leading-tight">
              <span className="block text-lg font-semibold uppercase tracking-[0.06em]">EUROSTAR</span>
              <span className="block text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-slate-200/90">
                Group
              </span>
            </span>
          </Link>
          <p className="text-[16px] leading-[1.65] text-slate-400">
            Nullam interdum libero vitae pretium aliquam donec nibh purus laoreet in ullamcorper vel malesuada sit amet
            enim.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <span className="text-[16px] leading-[1.5] uppercase tracking-[0.14em] text-slate-400">Follow on</span>
            <div className="flex items-center gap-2">
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-[13px] text-white transition-[background,color] hover:bg-white/10"
                aria-label="Facebook"
              >
                <FontAwesomeIcon icon={faFacebookF} />
              </a>
              <a
                href="https://twitter.com/"
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-[13px] transition-[background,color] hover:bg-white/10"
                style={{ color: accent }}
                aria-label="X"
              >
                <FontAwesomeIcon icon={faXTwitter} />
              </a>
              <a
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-[13px] text-white transition-[background,color] hover:bg-white/10"
                aria-label="LinkedIn"
              >
                <FontAwesomeIcon icon={faLinkedinIn} />
              </a>
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-[13px] text-white transition-[background,color] hover:bg-white/10"
                aria-label="Instagram"
              >
                <FontAwesomeIcon icon={faInstagram} />
              </a>
            </div>
          </div>
        </div>

        <div className="min-w-0">
          <FooterHeading>Quick Link</FooterHeading>
          <nav className="flex flex-col gap-0.5" aria-label="Quick links">
            {quickLinks.map((item) => (
              <ChevronLink key={item.label} to={item.to}>
                {item.label}
              </ChevronLink>
            ))}
          </nav>
        </div>

        <div className="min-w-0">
          <FooterHeading>Discover</FooterHeading>
          <nav className="flex flex-col gap-0.5" aria-label="Discover">
            {discoverLinks.map((item) => (
              <ChevronLink key={item.label} to={item.to}>
                {item.label}
              </ChevronLink>
            ))}
          </nav>
        </div>

        <div className="col-span-2 min-w-0 lg:col-span-1">
          <FooterHeading>Gallery</FooterHeading>
          <div className="grid grid-cols-3 gap-2">
            {galleryImages.map((src, i) => (
              <a
                key={i}
                href={src}
                target="_blank"
                rel="noreferrer noopener"
                className="group relative block overflow-hidden rounded-sm ring-1 ring-white/10"
              >
                <img
                  src={src}
                  alt=""
                  className="aspect-[4/3] h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div
        className="relative z-[1] border-t border-white/[0.06] px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] sm:px-6"
        style={{ backgroundColor: "rgba(22, 36, 62, 0.92)" }}
      >
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-3 text-[16px] leading-[1.55] text-slate-400">
          <p>© {new Date().getFullYear()} Eurostar Group. All Rights Reserved.</p>
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 sm:justify-end">
            <li>
              <Link to="/legal/terms" className="transition-colors hover:text-white">
                Terms &amp; Conditions
              </Link>
            </li>
            <li>
              <Link to="/legal" className="transition-colors hover:text-white">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}

/** Staff dashboards (admin / representative / agent) omit the marketing footer; investor dashboard keeps it. */
export function ConditionalFooter() {
  const { pathname } = useLocation()
  const role = localStorage.getItem("userRole")
  if (pathname.startsWith("/dashboard") && role !== "investor") {
    return null
  }
  return <Footer />
}
