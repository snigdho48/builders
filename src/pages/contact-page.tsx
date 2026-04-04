export function ContactPage() {
  return (
    <main className="bg-slate-950 px-4 py-16 pb-20 text-white sm:px-6">
      <div className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-2">
        <section>
          <p className="text-sm uppercase tracking-[0.22em] text-emerald-300">Contact</p>
          <h1 className="mt-2 text-3xl font-semibold">Talk to our investment advisors</h1>
          <p className="mt-3 text-slate-300">
            Share your goals and we will help you choose plot buy or installment plans.
          </p>
          <div className="mt-8 space-y-3 text-slate-300">
            <p>Email: contact@example.com</p>
            <p>Phone: +88 0123 654 99</p>
            <p>Address: 6391 Elgin St, Delaware</p>
          </div>
        </section>
        <section className="rounded-2xl border border-white/10 bg-slate-900/70 p-6">
          <h2 className="mb-4 text-xl font-semibold">Send a message</h2>
          <div className="grid gap-3">
            <input className="template-input" placeholder="Your name" />
            <input className="template-input" placeholder="Email" />
            <textarea className="template-input min-h-36" placeholder="Message" />
            <button className="rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400">
              Submit now
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}
