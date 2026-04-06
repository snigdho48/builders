import { useEffect, useState } from "react"

import { LandBookingTermsPanel } from "@/content/land-booking-terms"
import { useToast } from "@/components/ui/use-toast"
import { createLandBooking, getMe } from "@/services/api"
import type { LandBookingPlanType, Property } from "@/types/domain"

type Step = "choose" | "form"

type LandBookingFlowProps = {
  property: Property
  /** Called after a successful API submit (e.g. navigate away). */
  onSuccess?: () => void
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
  const [acceptedTerms, setAcceptedTerms] = useState(false)

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
    setAcceptedTerms(false)
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
    if (!acceptedTerms) {
      showToast("Please read and accept the terms and conditions.", "error")
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
                setAcceptedTerms(false)
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
            {planType != null ? <LandBookingTermsPanel planType={planType} /> : null}
            <label className="flex cursor-pointer items-start gap-2 text-xs text-slate-700">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-[#0b1f44] focus:ring-[#0b1f44]"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
              />
              <span>
                I have read and agree to the terms and conditions above, including the terms for my selected installment
                plan.
              </span>
            </label>
            <button
              type="button"
              disabled={busy || !acceptedTerms}
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
