import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import { LandPlotSelector, type PlotOption } from "@/components/land-plot-selector"
import { useToast } from "@/components/ui/use-toast"
import { createLandBooking, getBookingPromoSettings, getMe } from "@/services/api"
import type {
  BookingPromoSettings,
  CatalogListing,
  LandBookingCreatePayload,
  LandBookingKind,
  LandBookingPlanType,
  Property,
} from "@/types/domain"
import { formatBdtInteger } from "@/utils/currency"
import { isLandShareListing, listingDetailPath, propertyUsesInvestmentBooking } from "@/utils/property-display"

type PlotInstallmentPlan = "one_percent_installment" | "fifty_percent_installment"

type Step = "choose" | "form"

type LandBookingFlowProps = {
  listing: CatalogListing
  /** Called after a successful API submit (e.g. navigate away). */
  onSuccess?: () => void
}

function renderInstructionText(line: string) {
  const headMatch = line.match(/<head>(.*?)<\/head>/i)
  const explicitHeading = headMatch?.[1]?.trim() ?? ""
  const bodySource = line.replace(/<head>.*?<\/head>/i, "").trim()
  const segments = bodySource
    .split("<br>")
    .map((s) => s.trim())
    .filter(Boolean)

  const [firstSegment] = segments
  const [first, ...rest] = (firstSegment ?? "").split(":")
  const headingMarkers = ["📌", "📊", "⚠️", "📑", "🎯", "📢", "🌟", "🚀", "👉", "💎"]
  const hasHeading = rest.length > 0 && headingMarkers.some((m) => first.includes(m))

  const bulletItems: string[] = []
  const paragraphItems: string[] = []
  for (const seg of segments) {
    if (seg.includes("<bullet>")) {
      const bullets = seg
        .split("<bullet>")
        .map((b) => b.trim())
        .filter(Boolean)
      bulletItems.push(...bullets)
      continue
    }
    paragraphItems.push(seg)
  }

  const badgeHeading = explicitHeading || (hasHeading ? `${first}:` : "")
  const initialParagraph = explicitHeading
    ? paragraphItems
    : hasHeading
      ? [rest.join(":").trim(), ...paragraphItems.slice(1)]
      : paragraphItems

  if (!badgeHeading && bulletItems.length === 0) {
    return (
      <>
        {initialParagraph.map((seg, i) => (
          <p key={`plain-${i}`} className="text-xs text-slate-700">
            {seg}
          </p>
        ))}
      </>
    )
  }

  return (
    <>
      {badgeHeading ? (
        <span className="mr-1 inline-flex rounded-md bg-[#0b1f44]/10 px-1.5 py-0.5 font-semibold text-[#0b1f44]">
          {badgeHeading}
        </span>
      ) : null}
      {initialParagraph.map((seg, i) => (
        <p key={`body-${i}`} className="mt-1 text-xs text-slate-700">
          {seg}
        </p>
      ))}
      {bulletItems.length > 0 ? (
        <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
          {bulletItems.map((b, i) => (
            <li key={`bullet-${i}`} className="rounded-md bg-[#0b1f44]/5 px-2 py-1 text-[11px] text-slate-700">
              • {b}
            </li>
          ))}
        </ul>
      ) : null}
    </>
  )
}

const PLAN_INSTRUCTIONS: Record<PlotInstallmentPlan, { title: string; points: string[] }> = {
  one_percent_installment: {
    title: "🔷 ১% মাসিক কিস্তি প্ল্যান",
    points: [
      "🌟 ধীরে ধীরে পরিশোধ, নিশ্চিত জমির মালিকানা",
      "<head>আপনি কি কম টাকায় জমি কিনতে চান?</head><br> তাহলে এই প্ল্যানটি আপনার জন্য সবচেয়ে উপযুক্ত।",
      "<head>👉 এখন আর বড় অংকের টাকা একসাথে লাগবে না</head> মাত্র ১% মাসিক কিস্তিতে শুরু করুন আপনার জমির যাত্রা।",
      "<head>📌 প্ল্যানের মূল ধারণা:</head><br> প্রতি মাসে জমির মোট মূল্যের মাত্র ১% পরিশোধ; <br>যখন মোট পরিশোধ ৫০% পূর্ণ হবে, তখন ✅ আপনার নামে জমির রেজিস্ট্রেশন সম্পন্ন করা হবে।",
      "📊 সহজ উদাহরণ: জমির মূল্য ১০,০০,০০০ টাকা হলে মাসিক কিস্তি ১০,০০০ টাকা; ৫০% (৫,০০,০০০ টাকা) পরিশোধ হলে 👉 জমি আপনার নামে রেজিস্ট্রেশন।",
      "<head>💎 এই প্ল্যানটি কেন সেরা?</head> <br>✔ কম টাকায় শুরু করার সুযোগ <br>✔ মাসিক আয় অনুযায়ী সহজ পরিশোধ <br>✔ সঞ্চয়ের মতো ধাপে ধাপে বিনিয়োগ <br>✔ নতুন ক্রেতা ও মধ্যম আয়ের মানুষের জন্য উপযোগী।",
      "⚠️ গুরুত্বপূর্ণ শর্তাবলী: <br>নির্ধারিত সময়ের মধ্যে কিস্তি প্রদান বাধ্যতামূলক; কিস্তি বকেয়া হলে জরিমানা প্রযোজ্য হতে পারে; ৫০% পূর্ণ হওয়ার আগে রেজিস্ট্রেশন করা হবে না; রেজিস্ট্রেশন খরচ ও অন্যান্য চার্জ আলাদা।",
      "📑 ক্রয় প্রক্রিয়া:<br> প্লট নির্বাচন করুন → বুকিং ফি প্রদান করুন → মাসিক ১% কিস্তি শুরু করুন → ৫০% পূর্ণ হলে রেজিস্ট্রেশন সম্পন্ন করুন।",
      "<head>🎯 কার জন্য এই প্ল্যান?</head><br> যারা কম বাজেটে জমি কিনতে চান, যারা ধীরে ধীরে ইনভেস্ট করতে চান, নতুন বিনিয়োগকারী।",
    ],
  },
  fifty_percent_installment: {
    title: "🟢 ৫০% ডাউন পেমেন্ট + ১% কিস্তি প্ল্যান",
    points: [
      "🚀 আজই মালিক হোন, বাকি টাকা দিন সহজ কিস্তিতে",
      "<head>আপনি কি দ্রুত জমির মালিক হতে চান?</head><br> তাহলে এই প্ল্যানটি আপনার জন্য পারফেক্ট।",
      "<head>👉 একবার ৫০% পেমেন্ট করলেই, সাথে সাথে জমি আপনার নামে!</head>",
      "📌 প্ল্যানের মূল ধারণা:<br> প্রথমে জমির মূল্যের ৫০% এককালীন প্রদান;<br>✅  সাথে সাথে জমির রেজিস্ট্রেশন সম্পন্ন করা হবে;<br> বাকি ৫০% প্রতি মাসে ১% করে পরিশোধ।",
      "📊 সহজ উদাহরণ: <br>জমির মূল্য ১০,০০,০০০ টাকা হলে প্রথম পেমেন্ট ৫,০০,০০০ টাকা;<br> 👉 সাথে সাথে রেজিস্ট্রেশন;<br> বাকি ৫,০০,০০০ টাকা মাসে ১০,০০০ টাকা করে পরিশোধ।",
      "<head>💎 এই প্ল্যানটি কেন সেরা?</head><br> ✔ সাথে সাথে জমির মালিকানা<br> ✔ বিনিয়োগে সর্বোচ্চ নিরাপত্তা<br> ✔ জমির ভবিষ্যৎ মূল্য বৃদ্ধির সম্পূর্ণ সুবিধা<br> ✔ ব্যবসায়ী ও সিরিয়াস ক্রেতাদের জন্য আদর্শ।",
      "⚠️ গুরুত্বপূর্ণ শর্তাবলী: <br>৫০% ডাউন পেমেন্ট সম্পূর্ণ দিতে হবে;<br> বাকি কিস্তি নির্ধারিত সময় অনুযায়ী পরিশোধ করতে হবে;<br> কিস্তি বকেয়া হলে আইনগত ব্যবস্থা নেওয়া হতে পারে;<br> রেজিস্ট্রেশন ও অন্যান্য চার্জ প্রযোজ্য।",
      "📑 ক্রয় প্রক্রিয়া: <br>প্লট নির্বাচন করুন → ৫০% ডাউন পেমেন্ট প্রদান করুন → সাথে সাথে রেজিস্ট্রেশন সম্পন্ন করুন → বাকি টাকা মাসিক ১% কিস্তিতে পরিশোধ করুন।",
      "<head>🎯 কার জন্য এই প্ল্যান?</head> <br>যারা দ্রুত মালিক হতে চান, যারা নিরাপদ ইনভেস্টমেন্ট চান, ব্যবসায়ী ও উচ্চ আয়ের ক্রেতা।",
    ],
  },
}

const PLAN_THEME: Record<PlotInstallmentPlan, { wrap: string; title: string; item: string }> = {
  one_percent_installment: {
    wrap: "border-[#0b1f44]/20 bg-gradient-to-br from-[#0b1f44]/5 via-white to-[#f58e43]/10",
    title: "text-[#0b1f44]",
    item: "border-[#0b1f44]/15 bg-white/85",
  },
  fifty_percent_installment: {
    wrap: "border-[#f58e43]/30 bg-gradient-to-br from-[#f58e43]/10 via-white to-[#0b1f44]/5",
    title: "text-[#7a3a12]",
    item: "border-[#f58e43]/20 bg-white/90",
  },
}

function planTypeLabel(pt: LandBookingPlanType): string {
  if (pt === "one_percent_installment") return "1% installment plan"
  if (pt === "fifty_percent_installment") return "50% installment plan"
  return "Investment"
}

function billingPeriodLabel(p: string): string {
  if (p === "yearly") return "per year"
  if (p === "one_time") return "one time"
  return "per month"
}

export function LandBookingFlow({ listing, onSuccess }: LandBookingFlowProps) {
  const plotProperty: Property | null = isLandShareListing(listing) ? null : listing
  const listingIsInvestment = isLandShareListing(listing) || (plotProperty != null && propertyUsesInvestmentBooking(plotProperty))
  const plotOptional = isLandShareListing(listing)
  const paymentTiers = isLandShareListing(listing) ? listing.payment_options : []
  const { showToast } = useToast()
  const [step, setStep] = useState<Step>(() => (listingIsInvestment ? "form" : "choose"))
  const [bookingKind, setBookingKind] = useState<LandBookingKind | null>(() =>
    listingIsInvestment ? "investment" : null,
  )
  const [planType, setPlanType] = useState<LandBookingPlanType | null>(() =>
    listingIsInvestment ? "investment" : null,
  )
  const [promo, setPromo] = useState<BookingPromoSettings | null>(null)
  const [promoReady, setPromoReady] = useState(false)
  const [busy, setBusy] = useState(false)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [contactNotes, setContactNotes] = useState("")
  const [referralCode, setReferralCode] = useState("")
  const [selectedPlot, setSelectedPlot] = useState<PlotOption | null>(null)
  const [selectedTierIndex, setSelectedTierIndex] = useState<number | null>(null)

  useEffect(() => {
    if (listingIsInvestment) {
      setPromo(null)
      setPromoReady(true)
      return
    }
    setPromoReady(false)
    void getBookingPromoSettings()
      .then((p) => {
        setPromo(p)
        setPromoReady(true)
      })
      .catch(() => {
        setPromo(null)
        setPromoReady(true)
      })
  }, [listingIsInvestment])

  useEffect(() => {
    setSelectedPlot(null)
    setSelectedTierIndex(null)
    if (listingIsInvestment) {
      setStep("form")
      setBookingKind("investment")
      setPlanType("investment")
    } else {
      setStep("choose")
      setBookingKind(null)
      setPlanType(null)
    }
    const token = localStorage.getItem("accessToken")
    if (!token) {
      return
    }
    void getMe(token)
      .then((m) => {
        const name = [m.first_name, m.last_name].filter(Boolean).join(" ").trim()
        setFullName(name || m.username)
        setEmail(m.email || "")
        setPhone(m.phone || "")
      })
      .catch(() => {})
  }, [listing.id, listing.listing_kind, listingIsInvestment])

  /** 1% / 50% plot-buy plans: admin must enable promo and slots must remain (API error → allow attempt). */
  const plotBuyInstallmentPlansOpen =
    promo == null ||
    (promo.plot_buy_installment_promo_enabled && promo.plot_buy_installment_slots_available > 0)

  function selectPlotBuyPlan(pt: PlotInstallmentPlan) {
    if (!plotBuyInstallmentPlansOpen) return
    setBookingKind("plot_buy")
    setPlanType(pt)
    setSelectedPlot(null)
    setStep("form")
  }

  async function submit() {
    const token = localStorage.getItem("accessToken")
    if (!token || !planType || !bookingKind) {
      showToast("Please sign in to book.", "error")
      return
    }
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      showToast("Name, email, and phone are required.", "error")
      return
    }
    if (!plotOptional && !selectedPlot) {
      showToast("Please select an available plot from the map.", "error")
      return
    }
    if (listingIsInvestment && paymentTiers.length > 0) {
      if (selectedTierIndex == null || !paymentTiers[selectedTierIndex]) {
        showToast("Please choose one of the payment options for this listing.", "error")
        return
      }
    }
    setBusy(true)
    try {
      const payload: LandBookingCreatePayload = {
        booking_kind: bookingKind,
        plan_type: planType,
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        contact_notes: contactNotes.trim(),
        referral_code_used: referralCode.trim(),
      }
      if (isLandShareListing(listing)) {
        payload.land_share_listing = listing.id
      } else {
        payload.property = listing.id
      }
      if (!plotOptional && selectedPlot) {
        payload.selected_plot_code = selectedPlot.plot_id
        payload.selected_plot_area_sqft = selectedPlot.area_sqft
        payload.selected_plot_price = String(selectedPlot.price)
      } else if (plotOptional) {
        payload.selected_plot_code = ""
      }
      if (listingIsInvestment && paymentTiers.length > 0 && selectedTierIndex != null) {
        const tier = paymentTiers[selectedTierIndex]
        payload.investment_option_amount = tier.amount
        payload.investment_option_billing_period = tier.billing_period
      }
      await createLandBooking(payload, token)
      showToast("Booking submitted. Track status in your dashboard.", "success")
      onSuccess?.()
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Booking failed", "error")
    } finally {
      setBusy(false)
    }
  }

  const plotPlan =
    planType === "one_percent_installment" || planType === "fifty_percent_installment" ? planType : null

  return (
    <>
      {step === "choose" && !promoReady ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-slate-600">Checking buy-plot plan availability…</p>
        </section>
      ) : null}

      {step === "choose" && promoReady && !plotBuyInstallmentPlansOpen ? (
        <section className="rounded-3xl border border-amber-200 bg-amber-50/80 p-6 shadow-sm sm:p-8">
          <h3 className="text-lg font-semibold text-[#0b1f44]">1% and 50% plans are not available</h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">
            Buy-plot installment promos are controlled by the admin. They may be turned off or all promo slots may be
            in use. Land-share listings use a different booking path — browse those separately, or reach out for
            buy-plot options.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/listings/buy-plots"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#0b1f44] px-5 text-sm font-semibold text-white hover:bg-[#152a55]"
            >
              Buy plots listings
            </Link>
            <Link
              to="/listings/buy-land-share"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Land share listings
            </Link>
            <Link
              to="/contact"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#f58e43] bg-white px-5 text-sm font-semibold text-[#b84a0f] hover:bg-[#fff8f3]"
            >
              Contact us
            </Link>
          </div>
        </section>
      ) : null}

      {step === "choose" && promoReady && plotBuyInstallmentPlansOpen ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm text-slate-600">Select one plan to continue.</p>
          {promo ? (
            <p className="mt-2 text-xs text-slate-500">
              Buy plots (1% / 50%) promo slots:{" "}
              <strong className="text-[#0b1f44]">
                {promo.plot_buy_installment_slots_available} of {promo.plot_buy_installment_slot_limit} left
              </strong>
            </p>
          ) : null}
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <button
              type="button"
              disabled={!plotBuyInstallmentPlansOpen}
              className="group min-h-[320px] rounded-2xl border-2 border-[#0b1f44] bg-white p-8 text-left transition hover:-translate-y-0.5 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => selectPlotBuyPlan("one_percent_installment")}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Plan A</p>
              <h3 className="mt-3 text-3xl font-semibold text-[#0b1f44]">1% Plan</h3>
              <p className="mt-4 max-w-md text-sm text-slate-600">
                Start with 1% and continue using the fixed installment schedule for this full land parcel.
              </p>
              <span className="mt-10 inline-block text-sm font-semibold text-[#0b1f44] group-hover:underline">
                Choose 1% plan
              </span>
            </button>
            <button
              type="button"
              disabled={!plotBuyInstallmentPlansOpen}
              className="group min-h-[320px] rounded-2xl border-2 border-[#f58e43] bg-[#f58e43] p-8 text-left text-slate-950 transition hover:-translate-y-0.5 hover:bg-[#ff9b4f] disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => selectPlotBuyPlan("fifty_percent_installment")}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-900/70">Plan B</p>
              <h3 className="mt-3 text-3xl font-semibold">50% Plan</h3>
              <p className="mt-4 max-w-md text-sm text-slate-900/80">
                Pay 50% upfront, then complete remaining payments based on the schedule in your agreement.
              </p>
              <span className="mt-10 inline-block text-sm font-semibold group-hover:underline">Choose 50% plan</span>
            </button>
          </div>
        </section>
      ) : null}

      {step === "form" ? (
        <section className="mx-auto w-full max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-5 flex items-center justify-between gap-3">
            {listingIsInvestment ? (
              <Link to={listingDetailPath(listing)} className="text-sm font-medium text-[#f58e43] hover:underline">
                ← Back to listing
              </Link>
            ) : (
              <button
                type="button"
                className="text-sm font-medium text-[#f58e43] hover:underline"
                onClick={() => {
                  setStep("choose")
                  setBookingKind(null)
                  setPlanType(null)
                  setSelectedPlot(null)
                  setSelectedTierIndex(null)
                }}
              >
                ← Change plan
              </button>
            )}
            {!listingIsInvestment ? (
              <p className="text-xs text-slate-500">
                Selected: <strong className="text-[#0b1f44]">{planType != null ? planTypeLabel(planType) : "—"}</strong>
              </p>
            ) : null}
          </div>

          <div className="space-y-3">
            {plotPlan != null ? (
              <div className={`mb-2 rounded-2xl border p-4 shadow-sm ${PLAN_THEME[plotPlan].wrap}`}>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h3 className={`text-sm font-semibold ${PLAN_THEME[plotPlan].title}`}>
                    {PLAN_INSTRUCTIONS[plotPlan].title}
                  </h3>
                </div>
                <ul className="space-y-2 text-xs leading-relaxed text-slate-700">
                  {PLAN_INSTRUCTIONS[plotPlan].points.map((line, idx) => (
                    <li key={`${plotPlan}-${idx}`} className={`rounded-lg border px-3 py-2 ${PLAN_THEME[plotPlan].item}`}>
                      {renderInstructionText(line)}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {listingIsInvestment && paymentTiers.length > 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 shadow-sm">
                <p className="text-sm font-semibold text-[#0b1f44]">Choose payment option</p>
                <p className="mt-1 text-xs text-slate-600">
                  Pick one of the amounts and billing periods configured for this listing.
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {paymentTiers.map((t, i) => (
                    <button
                      key={`${t.amount}-${t.billing_period}-${i}`}
                      type="button"
                      onClick={() => setSelectedTierIndex(i)}
                      className={`rounded-xl border px-3 py-3 text-left text-sm transition ${
                        selectedTierIndex === i
                          ? "border-[#0b1f44] bg-white ring-2 ring-[#0b1f44]/15"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <span className="font-semibold text-[#f58e43]">{formatBdtInteger(t.amount)}</span>
                      <span className="mt-1 block text-xs text-slate-600">
                        {billingPeriodLabel(t.billing_period)}
                        {t.commitment_months != null ? ` · min ${t.commitment_months} mo` : ""}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            {plotOptional ? (
              <p className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-xs leading-relaxed text-slate-600">
                Land-share booking applies to the parcel as a whole. Plot map selection is not required for this listing
                type.
              </p>
            ) : plotProperty ? (
              <LandPlotSelector property={plotProperty} value={selectedPlot} onChange={setSelectedPlot} />
            ) : null}
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full name"
            />
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone"
            />
            <textarea
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
              rows={4}
              value={contactNotes}
              onChange={(e) => setContactNotes(e.target.value)}
              placeholder="Additional contact details or notes (optional)"
            />
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              placeholder="Referral code (optional)"
            />
            <button
              type="button"
              disabled={busy}
              onClick={() => void submit()}
              className="w-full rounded-xl bg-[#0b1f44] py-3 font-semibold !text-white disabled:opacity-50"
            >
              {busy ? "Submitting…" : "Submit booking"}
            </button>
          </div>
        </section>
      ) : null}
    </>
  )
}
