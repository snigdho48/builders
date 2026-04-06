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
      <div className="mx-auto max-w-[1240px] px-4 pt-8 sm:px-6">
        <div className="rounded-xl bg-[#f58e43] px-5 py-4 text-sm text-slate-950 sm:flex sm:items-center sm:justify-between">
          <p className="font-medium">6391 Elgin St, Delaware</p>
          <p className="font-medium">contact@example.com</p>
          <p className="font-medium">+88 0123 654 99</p>
        </div>
      </div>
      <div className="mx-auto grid max-w-[1240px] gap-8 px-4 py-10 text-sm sm:grid-cols-2 lg:grid-cols-4 sm:px-6">
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-white">LandBlocks</h3>
          <p>Nullam interdum libero vitae pretium aliquam donec nibh purus laoreet in ullamcorper vel malesuada sit amet enim.</p>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Follow on</p>
          <div className="flex gap-2 text-xs">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/20">
              <FontAwesomeIcon icon={faFacebookF} />
            </span>
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/20">
              <FontAwesomeIcon icon={faXTwitter} />
            </span>
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/20">
              <FontAwesomeIcon icon={faLinkedinIn} />
            </span>
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/20">
              <FontAwesomeIcon icon={faInstagram} />
            </span>
          </div>
        </div>
        <div>
          <h3 className="mb-2 text-base font-semibold text-white">Quick Link</h3>
          <ul className="space-y-1">
            <li>Startup Business</li>
            <li>Financial Advice</li>
            <li>Management</li>
            <li>Business Advice</li>
            <li>Strategy Services</li>
          </ul>
        </div>
        <div>
          <h3 className="mb-2 text-base font-semibold text-white">Discover</h3>
          <ul className="space-y-1">
            <li>About</li>
            <li>Our Team</li>
            <li>Testimonials</li>
            <li>Gallery</li>
            <li>Contact</li>
          </ul>
        </div>
        <div>
          <h3 className="mb-2 text-base font-semibold text-white">Gallery</h3>
          <div className="grid grid-cols-3 gap-2">
            {gallery.map((image) => (
              <img
                key={image}
                src={image}
                alt="gallery"
                className="h-16 w-full rounded-md object-cover"
              />
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-white/5 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] text-xs text-slate-400 sm:px-6">
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
