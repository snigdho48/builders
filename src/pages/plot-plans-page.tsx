import { Link } from "react-router-dom"

export function PlotPlansPage() {
  return (
    <main className="bg-white py-16 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))] pb-[max(5rem,env(safe-area-inset-bottom,0px))] text-slate-900 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#f58e43]">Plot buy</p>
        <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">Payment plans: 1% and 50%</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          These options apply to <strong className="text-slate-800">plot-buy</strong> listings. When you book, you
          choose one plan; staff review your request before acceptance. Exact amounts, dates, and registration steps
          are fixed in your signed sale or allotment agreement — this page is a plain-language overview.
        </p>

        <section className="mt-12 rounded-2xl border border-[#0b1f44]/15 bg-gradient-to-br from-[#0b1f44]/5 via-white to-[#f58e43]/10 p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-[#0b1f44]">Plan A — 1% installment plan</h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            Designed for buyers who want to start with a smaller regular payment and build toward ownership over time.
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-700">
            <li>
              You pay toward the agreed purchase price on a monthly schedule based on a <strong>1% of parcel price</strong>{" "}
              style structure (as offered on the listing and confirmed at booking).
            </li>
            <li>
              When your <strong>total paid reaches 50%</strong> of the agreed price (or the milestone defined in your
              agreement), <strong>registration</strong> in your favour proceeds according to that contract.
            </li>
            <li>
              <strong>Example:</strong> if the land price is ৳10,00,000, a 1%-style monthly installment is on the order
              of ৳10,000 per month until the 50% threshold is met — then registration and remaining balance follow the
              written schedule.
            </li>
            <li>
              Registration fees, stamp duty, taxes, and any service charges are <strong>separate</strong> unless the
              agreement states otherwise.
            </li>
            <li>
              Missed installments may incur fees or affect your booking; cancellation rules are in the sale agreement.
            </li>
          </ul>
        </section>

        <section className="mt-8 rounded-2xl border border-[#f58e43]/25 bg-gradient-to-br from-[#f58e43]/10 via-white to-[#0b1f44]/5 p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-[#7a3a12]">Plan B — 50% down payment + balance installments</h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            For buyers who prefer a large upfront payment so registration and title steps can align earlier in the
            process, with the rest paid on a fixed schedule.
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-700">
            <li>
              You pay <strong>50% of the agreed purchase price</strong> (or the first tranche specified in your
              agreement) up front.
            </li>
            <li>
              <strong>Registration</strong> is tied to receiving that threshold, as set out in your sale agreement
              (often shortly after the 50% payment clears).
            </li>
            <li>
              The <strong>remaining 50%</strong> is repaid in monthly installments — commonly structured in line with
              a 1%-of-price-per-month style schedule on the outstanding balance until completion.
            </li>
            <li>
              <strong>Example:</strong> ৳10,00,000 land → about ৳5,00,000 down, then registration per contract, then
              roughly ৳10,000 per month on the balance until paid in full (exact figures and count of months are in your
              agreement).
            </li>
            <li>
              Late payment on the balance can trigger interest, acceleration, or termination as described in the signed
              contract.
            </li>
          </ul>
        </section>

        <section className="mt-10 border-t border-slate-200 pt-8 text-sm leading-7 text-slate-600">
          <h2 className="text-base font-semibold text-slate-900">Availability</h2>
          <p className="mt-2">
            Plot-buy 1% and 50% plans may be offered within a <strong>limited number of active bookings</strong> at a
            time (shown when you book). If slots are full, you can still explore other listing types or contact us.
          </p>
          <p className="mt-4">
            <Link to="/listings" className="font-semibold text-[#f58e43] hover:underline">
              Browse plot-buy listings
            </Link>
            {" · "}
            <Link to="/contact" className="font-semibold text-[#f58e43] hover:underline">
              Contact
            </Link>
          </p>
        </section>
      </div>
    </main>
  )
}
