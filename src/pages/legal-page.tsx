export function LegalPage() {
  return (
    <main className="bg-white py-16 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))] pb-[max(5rem,env(safe-area-inset-bottom,0px))] text-slate-900 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#f58e43]">Legal</p>
        <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">Legal information</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          This page outlines important legal notices for using our land investment platform. For specific agreements
          related to your booking or plan, please refer to the terms presented at checkout and in your dashboard.
        </p>

        <section className="mt-10 space-y-6 text-sm leading-7 text-slate-700">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Website use</h2>
            <p className="mt-2">
              By accessing this site you agree to use it responsibly. Listings and map data are provided for
              information only and do not constitute legal advice or a binding offer until confirmed through our
              official booking process.
            </p>
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Bookings &amp; land</h2>
            <p className="mt-2">
              Land availability, pricing, and plot boundaries are subject to verification. Final terms are
              governed by the agreements you accept when you book and by applicable local law.
            </p>
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Contact</h2>
            <p className="mt-2">
              For legal or compliance questions, contact us through the{" "}
              <a href="/contact" className="font-medium text-[#f58e43] hover:underline">
                Contact
              </a>{" "}
              page.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
