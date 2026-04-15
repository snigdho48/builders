import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faClock, faEnvelope, faLocationDot, faPhone } from "@fortawesome/free-solid-svg-icons"

const mapEmbedSrc =
  "https://www.google.com/maps?q=6391+Elgin+St+Delaware&z=14&output=embed"

export function ContactPage() {
  return (
    <main className="bg-[#f6f7f9] pb-[max(4rem,env(safe-area-inset-bottom,0px))] text-slate-900">
      <section className="relative">
        <iframe
          title="Office location"
          src={mapEmbedSrc}
          className="h-[min(42vh,380px)] w-full border-0 sm:h-[400px]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </section>

      <section className="relative z-10 mx-auto -mt-14 max-w-7xl px-4 sm:-mt-16 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-xl border border-slate-200/80 bg-white px-5 py-6 text-center shadow-[0_12px_28px_rgba(15,23,42,0.08)]">
            <div className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#f58e43] text-white">
              <FontAwesomeIcon icon={faLocationDot} className="text-lg" />
            </div>
            <h2 className="mt-3 text-base font-semibold text-[#0f172a]">Our address</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">6391 Elgin St, Delaware</p>
          </article>
          <article className="rounded-xl border border-slate-200/80 bg-white px-5 py-6 text-center shadow-[0_12px_28px_rgba(15,23,42,0.08)]">
            <div className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#f58e43] text-white">
              <FontAwesomeIcon icon={faEnvelope} className="text-lg" />
            </div>
            <h2 className="mt-3 text-base font-semibold text-[#0f172a]">Email</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              <a href="mailto:contact@example.com" className="text-[#0b2348] underline-offset-2 hover:underline">
                contact@example.com
              </a>
            </p>
          </article>
          <article className="rounded-xl border border-slate-200/80 bg-white px-5 py-6 text-center shadow-[0_12px_28px_rgba(15,23,42,0.08)]">
            <div className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#f58e43] text-white">
              <FontAwesomeIcon icon={faPhone} className="text-lg" />
            </div>
            <h2 className="mt-3 text-base font-semibold text-[#0f172a]">Phone</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              <a href="tel:+88012365499" className="text-[#0b2348] underline-offset-2 hover:underline">
                +88 0123 654 99
              </a>
            </p>
          </article>
          <article className="rounded-xl border border-slate-200/80 bg-white px-5 py-6 text-center shadow-[0_12px_28px_rgba(15,23,42,0.08)]">
            <div className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#f58e43] text-white">
              <FontAwesomeIcon icon={faClock} className="text-lg" />
            </div>
            <h2 className="mt-3 text-base font-semibold text-[#0f172a]">Hours</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Mon–Fri: 9:00–17:00
              <br />
              Sat: 9:00–13:00
            </p>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-16 pt-14 text-center sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#f58e43]">Get in touch</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#0f172a] sm:text-4xl">Send us a message</h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
          Ask about listings, installment plans, or P2P — we will respond as soon as we can.
        </p>
        <form className="mt-10 space-y-4 text-left" onSubmit={(e) => e.preventDefault()}>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              Your name
              <input className="template-input" name="name" type="text" autoComplete="name" placeholder="Jane Doe" />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              Phone
              <input
                className="template-input"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="+880…"
              />
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              Email
              <input
                className="template-input"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              Subject
              <input className="template-input" name="subject" type="text" placeholder="How can we help?" />
            </label>
          </div>
          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            Message
            <textarea className="template-input min-h-36" name="message" placeholder="Write your message…" />
          </label>
          <div className="pt-2 text-center">
            <button type="submit" className="btn-alive rounded-full bg-[#f58e43] px-10 py-3 text-sm font-semibold text-slate-950 hover:bg-[#ff9b4f]">
              Send message
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}
