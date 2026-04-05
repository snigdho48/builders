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

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-[#0b1f44]">Book this land</h2>
        <p className="mt-1 text-sm text-slate-600">{property.title}</p>
      </div>

      {step === "choose" ? (
        <div className="grid gap-3">
          <p className="text-sm text-slate-600">
            Choose an installment plan to proceed (terms are fixed for the full land).
          </p>
          <button
            type="button"
            className="rounded-xl border-2 border-[#0b1f44] bg-white px-4 py-4 text-left font-semibold text-[#0b1f44] transition hover:bg-slate-50"
            onClick={() => selectPlan("one_percent_installment")}
          >
            1% installment plan
          </button>
          <button
            type="button"
            className="rounded-xl bg-[#f58e43] px-4 py-4 text-left font-semibold text-slate-950 transition hover:bg-[#ff9b4f]"
            onClick={() => selectPlan("fifty_percent_installment")}
          >
            50% installment plan
          </button>
        </div>
      ) : (
        <div className="space-y-3">
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
            Plan:{" "}
            <strong>
              {planType === "one_percent_installment" ? "1% installment" : "50% installment"}
            </strong>
          </p>
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full name"
          />
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone"
          />
          <textarea
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            rows={3}
            value={contactNotes}
            onChange={(e) => setContactNotes(e.target.value)}
            placeholder="Additional contact details or notes (optional)"
          />
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
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
      )}
    </div>
  )
}
