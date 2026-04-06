import { useEffect, useState } from "react"

import { useToast } from "@/components/ui/use-toast"
import { createLandBooking, getMe } from "@/services/api"
import type { LandBookingPlanType, Property } from "@/types/domain"

type Step = "choose" | "form"

type LandBookingFlowProps = {
  property: Property
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

const PLAN_INSTRUCTIONS: Record<
  LandBookingPlanType,
  { title: string; points: string[] }
> = {
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

const PLAN_THEME: Record<LandBookingPlanType, { wrap: string; title: string; item: string }> = {
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

export function LandBookingFlow({ property, onSuccess }: LandBookingFlowProps) {
  const { showToast } = useToast()
  const [step, setStep] = useState<Step>("choose")
  const [planType, setPlanType] = useState<LandBookingPlanType | null>(null)
  const [busy, setBusy] = useState(false)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [contactNotes, setContactNotes] = useState("")
  const [referralCode, setReferralCode] = useState("")

  useEffect(() => {
    setStep("choose")
    setPlanType(null)
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
  }, [property.id])

  function selectPlan(pt: LandBookingPlanType) {
    setPlanType(pt)
    setStep("form")
  }

  async function submit() {
    const token = localStorage.getItem("accessToken")
    if (!token || !planType) {
      showToast("Please sign in to book.", "error")
      return
    }
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      showToast("Name, email, and phone are required.", "error")
      return
    }
    setBusy(true)
    try {
      await createLandBooking(
        {
          property: property.id,
          plan_type: planType,
          full_name: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          contact_notes: contactNotes.trim(),
          referral_code_used: referralCode.trim(),
        },
        token,
      )
      showToast("Booking submitted. Track status in your dashboard.", "success")
      onSuccess?.()
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Booking failed", "error")
    } finally {
      setBusy(false)
    }
  }

  const selectedPlanLabel = planType === "one_percent_installment" ? "1% installment plan" : "50% installment plan"

  return (
    <>
      {step === "choose" ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm text-slate-600">Select one plan to continue.</p>
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <button
              type="button"
              className="group min-h-[320px] rounded-2xl border-2 border-[#0b1f44] bg-white p-8 text-left transition hover:-translate-y-0.5 hover:bg-slate-50"
              onClick={() => selectPlan("one_percent_installment")}
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
              className="group min-h-[320px] rounded-2xl border-2 border-[#f58e43] bg-[#f58e43] p-8 text-left text-slate-950 transition hover:-translate-y-0.5 hover:bg-[#ff9b4f]"
              onClick={() => selectPlan("fifty_percent_installment")}
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
      ) : (
        <section className="mx-auto w-full max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-5 flex items-center justify-between gap-3">
            <button
              type="button"
              className="text-sm font-medium text-[#f58e43] hover:underline"
              onClick={() => {
                setStep("choose")
              }}
            >
              ← Change plan
            </button>
            <p className="text-xs text-slate-500">
              Selected: <strong className="text-[#0b1f44]">{selectedPlanLabel}</strong>
            </p>
          </div>

          <div className="space-y-3">
            {planType != null ? (
              <div className={`mb-2 rounded-2xl border p-4 shadow-sm ${PLAN_THEME[planType].wrap}`}>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h3 className={`text-sm font-semibold ${PLAN_THEME[planType].title}`}>
                    {PLAN_INSTRUCTIONS[planType].title}
                  </h3>
         
                </div>
                <ul className="space-y-2 text-xs leading-relaxed text-slate-700">
                  {PLAN_INSTRUCTIONS[planType].points.map((line, idx) => (
                    <li key={`${planType}-${idx}`} className={`rounded-lg border px-3 py-2 ${PLAN_THEME[planType].item}`}>
                      {renderInstructionText(line)}
                    </li>
                  ))}
                </ul>
              </div>
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
              className="w-full rounded-xl bg-[#0b1f44] py-3 font-semibold text-white disabled:opacity-50"
            >
              {busy ? "Submitting…" : "Submit booking"}
            </button>
          </div>
        </section>
      )}
    </>
  )
}
