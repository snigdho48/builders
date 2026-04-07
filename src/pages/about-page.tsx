export function AboutPage() {


  return (
    <main className="bg-[#f6f7f9] text-slate-900">
      <section>
        <iframe
          title="Office map"
          src="https://www.google.com/maps?q=51.5074,-0.1278&z=10&output=embed"
          className="h-[320px] w-full border-0"
          loading="lazy"
        />
      </section>

      <section className="mx-auto -mt-16 max-w-7xl px-4 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-xl bg-white px-5 py-6 text-center shadow-[0_12px_28px_rgba(15,23,42,0.08)]">
            <div className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f58e43] text-white">📍</div>
            <h3 className="mt-3 text-base font-semibold text-[#0f172a]">Our Address</h3>
            <p className="mt-2 text-sm text-slate-500">4577 Washington Ave, Manchester, Kentucky 39495</p>
          </article>
          <article className="rounded-xl bg-white px-5 py-6 text-center shadow-[0_12px_28px_rgba(15,23,42,0.08)]">
            <div className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f58e43] text-white">✉️</div>
            <h3 className="mt-3 text-base font-semibold text-[#0f172a]">info@example.com</h3>
            <p className="mt-2 text-sm text-slate-500">Email us anytime for any kind of query.</p>
          </article>
          <article className="rounded-xl bg-white px-5 py-6 text-center shadow-[0_12px_28px_rgba(15,23,42,0.08)]">
            <div className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f58e43] text-white">📞</div>
            <h3 className="mt-3 text-base font-semibold text-[#0f172a]">Hot: (123) 208 666</h3>
            <p className="mt-2 text-sm text-slate-500">24/7 support line. Chat and ticket support.</p>
          </article>
          <article className="rounded-xl bg-white px-5 py-6 text-center shadow-[0_12px_28px_rgba(15,23,42,0.08)]">
            <div className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f58e43] text-white">🕒</div>
            <h3 className="mt-3 text-base font-semibold text-[#0f172a]">Opening Hour</h3>
            <p className="mt-2 text-sm text-slate-500">Sunday-Fri: 9 AM - 5 PM, Saturday: 9 AM - 1 PM</p>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-16 pt-14 text-center sm:px-6">
        <p className="text-sm font-semibold text-[#f58e43]">Book Appointment</p>
        <h1 className="mt-2 text-4xl font-semibold text-[#0f172a]">Send Message Anytime</h1>
        <form className="mt-8 space-y-3 text-left">
          <div className="grid gap-3 sm:grid-cols-2">
            <input className="rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800" placeholder="Your Name" />
            <input className="rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800" placeholder="Phone Number" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input className="rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800" placeholder="Email Address" />
            <input className="rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800" placeholder="Subject" />
          </div>
          <textarea className="min-h-32 w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800" placeholder="Write a Message" />
          <div className="pt-2 text-center">
            <button type="button" className="rounded-full bg-[#f58e43] px-8 py-2.5 text-sm font-semibold text-white hover:bg-[#ea7f31]">
              Send a Message
            </button>
          </div>
        </form>


      </section>
    </main>
  )
}

