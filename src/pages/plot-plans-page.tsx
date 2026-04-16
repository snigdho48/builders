import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"

import { getEurostarServicesPageCopy } from "@/content/eurostar-services-content"
import { useLanguage } from "@/i18n/language-context"
import { getBookingPromoSettings } from "@/services/api"
import type { BookingPromoSettings } from "@/types/domain"

export function PlotPlansPage() {
  const { language } = useLanguage()
  const [promo, setPromo] = useState<BookingPromoSettings | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    void getBookingPromoSettings()
      .then(setPromo)
      .catch(() => setPromo(null))
      .finally(() => setReady(true))
  }, [])

  const promoLive = Boolean(
    promo?.plot_buy_installment_promo_enabled && promo.plot_buy_installment_slots_available > 0,
  )
  const copy = useMemo(() => getEurostarServicesPageCopy(language), [language])
  const isBn = language === "bn"

  return (
    <main className="bg-white py-16 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))] pb-[max(5rem,env(safe-area-inset-bottom,0px))] text-slate-900 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#f58e43]">{copy.intro.eyebrow}</p>
        <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">{copy.intro.title}</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          {copy.intro.subtitle}
        </p>

        {ready && !promoLive ? (
          <div
            className="mt-6 rounded-2xl border border-amber-300/80 bg-amber-50 px-4 py-3 text-sm text-amber-950 sm:px-5 sm:py-4"
            role="status"
          >
            <strong className="font-semibold">{isBn ? "প্রোমো সক্রিয় নয়।" : "Promo not active."}</strong>{" "}
            <span className="text-amber-950/90">
              {isBn
                ? "১% / ৫০% প্লট ইনস্টলমেন্ট অফার এখন বন্ধ আছে অথবা সব স্লট পূর্ণ। আপনি এখনও প্লট ব্রাউজ করতে পারবেন এবং বিকল্প পরিকল্পনার জন্য আমাদের সাথে যোগাযোগ করতে পারবেন।"
                : "The 1% / 50% buy-plot installment offer is turned off or all promo slots are in use. You can still browse plots and contact us for other arrangements."}
            </span>
          </div>
        ) : null}

        <section className="mt-12 rounded-2xl border border-[#0b1f44]/15 bg-linear-to-br from-[#0b1f44]/5 via-white to-[#f58e43]/10 p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-[#0b1f44]">{copy.plotSalesOverview.title}</h2>
          <div className="mt-3 space-y-3 text-sm leading-7 text-slate-700">
            {copy.plotSalesOverview.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-[#f58e43]/25 bg-linear-to-br from-[#f58e43]/10 via-white to-[#0b1f44]/5 p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-[#7a3a12]">{copy.paymentPlans.heading}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {copy.paymentPlans.plans.map((plan) => (
              <article key={plan.title} className="rounded-xl border border-slate-200 bg-white/80 p-4">
                <h3 className="text-sm font-semibold text-[#0b1f44]">{plan.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{plan.body}</p>
              </article>
            ))}
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-700">{copy.paymentPlans.closing}</p>
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-slate-50/60 p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-[#0b1f44]">{copy.fractionalOverview.title}</h2>
          <div className="mt-3 space-y-3 text-sm leading-7 text-slate-700">
            {copy.fractionalOverview.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-[#0b1f44]">{copy.fractionalHowItWorks.title}</h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">{copy.fractionalHowItWorks.intro}</p>
          <div className="mt-6 space-y-4">
            {copy.fractionalHowItWorks.steps.map((step) => (
              <article key={step.title} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                <h3 className="text-sm font-semibold text-[#0b1f44]">{step.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-700">{step.body}</p>
                {step.bullets.length > 0 ? (
                  <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-7 text-slate-700">
                    {step.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-700">{copy.fractionalHowItWorks.closing}</p>
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-[#0b1f44]">{copy.landShareBenefits.title}</h2>
          <div className="mt-3 space-y-3 text-sm leading-7 text-slate-700">
            {copy.landShareBenefits.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </section>

        <section className="mt-10 border-t border-slate-200 pt-8 text-sm leading-7 text-slate-600">
          <h2 className="text-base font-semibold text-slate-900">{isBn ? "লিস্টিং ও যোগাযোগ" : "Listings & contact"}</h2>
          <p className="mt-2">
            {isBn ? (
              <>
                প্লট ওনারশিপ অথবা ফ্র্যাকশনাল বিনিয়োগ শুরু করতে নিচের লিংক ব্যবহার করুন। ১%/৫০% অফার কেবল{" "}
                <strong className="text-slate-800">buy-plot</strong> লিস্টিংয়ে প্রযোজ্য।
              </>
            ) : (
              <>
                Use the links below to start either full-plot ownership or fractional investment. The 1% / 50% offer
                applies only to <strong className="text-slate-800">buy-plot</strong> listings.
              </>
            )}{" "}
            <Link to="/listings/buy-land-share" className="font-semibold text-[#f58e43] hover:underline">
              {isBn ? "ল্যান্ড শেয়ার লিস্টিং" : "land share listings"}
            </Link>{" "}
            {isBn ? "দেখুন বা আমাদের সাথে যোগাযোগ করুন।" : "or contact us."}
          </p>
          <p className="mt-4">
            <Link to="/listings/buy-land-share" className="font-semibold text-[#f58e43] hover:underline">
              {isBn ? "ল্যান্ড শেয়ার ব্রাউজ করুন" : "Browse land share listings"}
            </Link>
            {" · "}
            <Link to="/listings/buy-plots" className="font-semibold text-[#f58e43] hover:underline">
              {isBn ? "বাই-প্লট লিস্টিং দেখুন" : "Browse buy-plot listings"}
            </Link>
            {" · "}
            <Link to="/contact" className="font-semibold text-[#f58e43] hover:underline">
              {isBn ? "যোগাযোগ" : "Contact"}
            </Link>
          </p>
        </section>
      </div>
    </main>
  )
}
