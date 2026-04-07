import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFacebookF, faInstagram, faLinkedinIn, faXTwitter } from "@fortawesome/free-brands-svg-icons"
import { useLocation } from "react-router-dom"

export function Footer() {
  const gallery = [
    "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1560184897-ae75f418493e?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=400&q=80",
  ]

  return (
    <footer className="bg-[#031632] text-slate-300">
      <div className="mx-auto max-w-[1240px] px-4 pt-10 sm:px-6">
        <div className="rounded-2xl bg-[#f15a24] px-5 py-4 text-slate-950 shadow-[0_14px_30px_rgba(0,0,0,0.2)] sm:px-8 sm:py-5">
          <div className="grid gap-3 text-[13px] sm:grid-cols-3 sm:gap-6">
            <p className="font-semibold">6391 Elgin St, Delaware</p>
            <p className="font-semibold">contact@example.com</p>
            <p className="font-semibold">+88 0123 654 99</p>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1240px] gap-9 px-4 pb-10 pt-12 text-[13px] leading-6 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:gap-10">
        <div className="space-y-4">
          <h3 className="text-[18px] font-semibold text-white">EUROSTAR</h3>
          <p className="max-w-[280px] text-slate-400">
            Nullam interdum libero vitae pretium aliquam donec nibh purus laoreet in ullamcorper vel malesuada sit amet enim.
          </p>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Follow on</p>
          <div className="flex gap-2.5 text-[11px]">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/25">
              <FontAwesomeIcon icon={faFacebookF} />
            </span>
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/25">
              <FontAwesomeIcon icon={faXTwitter} />
            </span>
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/25">
              <FontAwesomeIcon icon={faLinkedinIn} />
            </span>
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/25">
              <FontAwesomeIcon icon={faInstagram} />
            </span>
          </div>
        </div>
        <div>
          <h3 className="mb-3 text-[16px] font-semibold text-white">Quick Link</h3>
          <ul className="space-y-1.5 text-slate-400">
            <li>Startup Business</li>
            <li>Financial Advice</li>
            <li>Management</li>
            <li>Business Advice</li>
            <li>Strategy Services</li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-[16px] font-semibold text-white">Discover</h3>
          <ul className="space-y-1.5 text-slate-400">
            <li>About</li>
            <li>Our Team</li>
            <li>Testimonials</li>
            <li>Gallery</li>
            <li>Contact</li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-[16px] font-semibold text-white">Gallery</h3>
          <div className="grid grid-cols-3 gap-2.5">
            {gallery.map((image) => (
              <img
                key={image}
                src={image}
                alt="gallery"
                className="h-14 w-full rounded-sm object-cover"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/5 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] text-[12px] text-slate-400 sm:px-6">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-3">
          <p>© 2026 LandBlocks. All Rights Reserved.</p>
          <div className="flex items-center gap-4">
            <span>Terms & Conditions</span>
            <span>Privacy Policy</span>
          </div>
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
