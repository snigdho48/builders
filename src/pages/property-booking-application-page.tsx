import { useEffect, useMemo, useState } from "react"
import { Link, useLocation, useNavigate, useParams } from "react-router-dom"

import { PlotBookingApplicationFormFields } from "@/components/plot-booking-application-form"
import { useToast } from "@/components/ui/use-toast"
import {
  emptyJointApplicantAttachmentRows,
  emptyNomineeAttachmentRows,
  type JointApplicantAttachmentRow,
  type NomineeAttachmentRow,
} from "@/content/plot-booking-joint-attachments"
import {
  emptyPlotBookingApplicationData,
  emptyPlotBookingAttachmentFiles,
  type PlotBookingApplicationData,
  type PlotBookingAttachmentFiles,
  type PlotBookingAttachmentSlot,
} from "@/content/plot-booking-application-form"
import { normalizeStoredRole } from "@/routes/protected-route"
import { createLandBooking, getMe, getProperty, uploadLandBookingApplicationAttachments } from "@/services/api"
import type { PlotBookingApplicationLocationState } from "@/types/plot-booking"
import { isPlotBookingApplicationState } from "@/types/plot-booking"
import type { LandBookingCreatePayload, Property } from "@/types/domain"
import { formatBdtInteger } from "@/utils/currency"

function planLabel(plan: PlotBookingApplicationLocationState["plan_type"]): string {
  if (plan === "one_percent_installment") return "1% installment plan"
  return "50% installment plan"
}

function describeListingForPlotDetail(p: Property): string {
  const kind =
    p.property_type === "apartment"
      ? "Apartment"
      : p.property_type === "villa"
        ? "Villa"
        : p.property_type === "commercial"
          ? "Commercial"
          : "Land"
  const channel = p.property_channel === "plot_buy" ? "Plot buy" : "Installment"
  const sale = p.sale_type === "land_buy" ? "Land buy" : "Installment / land share"
  const mode = p.land_sale_mode === "per_block" ? "Per block" : "Whole land"
  return `${kind} · ${channel} · ${sale} · ${mode}`
}

export function PropertyBookingApplicationPage() {
  const { id = "" } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { showToast } = useToast()
  const numericId = Number(id)
  const state = location.state as PlotBookingApplicationLocationState | undefined

  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null
  const role = typeof window !== "undefined" ? normalizeStoredRole(localStorage.getItem("userRole")) : null

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [referralCode, setReferralCode] = useState("")
  const [extra, setExtra] = useState<PlotBookingApplicationData>(() => emptyPlotBookingApplicationData())
  const [attachmentFiles, setAttachmentFiles] = useState<PlotBookingAttachmentFiles>(() => emptyPlotBookingAttachmentFiles())
  const [jointAttachmentRows, setJointAttachmentRows] = useState<JointApplicantAttachmentRow[]>(() =>
    emptyJointApplicantAttachmentRows(),
  )
  const [nomineeAttachmentRows, setNomineeAttachmentRows] = useState<NomineeAttachmentRow[]>(() =>
    emptyNomineeAttachmentRows(),
  )

  useEffect(() => {
    if (!isPlotBookingApplicationState(state)) {
      navigate(`/properties/${id}/book`, { replace: true })
      return
    }
    if (!Number.isFinite(numericId) || numericId <= 0) {
      navigate("/listings/buy-plots", { replace: true })
      return
    }
    setLoading(true)
    getProperty(numericId)
      .then((p) => setProperty(p))
      .catch(() => setProperty(null))
      .finally(() => setLoading(false))
  }, [numericId, id, navigate, state])

  useEffect(() => {
    const t = localStorage.getItem("accessToken")
    if (!t) return
    void getMe(t)
      .then((m) => {
        const name = [m.first_name, m.last_name].filter(Boolean).join(" ").trim()
        const displayName = name || m.username
        setFullName((prev) => prev.trim() || displayName)
        setEmail((prev) => prev.trim() || m.email || "")
        setPhone((prev) => prev.trim() || m.phone || "")
        setExtra((prev) => ({
          ...prev,
          applicant_full_name_en: prev.applicant_full_name_en.trim() || displayName.toUpperCase(),
          contact_email: prev.contact_email.trim() || m.email || "",
          contact_mobile_phone: prev.contact_mobile_phone.trim() || m.phone || "",
        }))
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!property || !isPlotBookingApplicationState(state)) return
    const plot = state.plot
    const kathaAppr = plot.area_sqft > 0 ? (plot.area_sqft / 720).toFixed(4) : ""
    setExtra((prev) => ({
      ...prev,
      plot_detail_project_name: prev.plot_detail_project_name.trim() || property.title,
      plot_detail_property_type: prev.plot_detail_property_type.trim() || describeListingForPlotDetail(property),
      plot_detail_location_address: prev.plot_detail_location_address.trim() || property.location_name,
      selected_plot_no: prev.selected_plot_no.trim() || plot.plot_id,
      plot_size_katha: prev.plot_size_katha.trim() || kathaAppr,
      plot_unit_label: prev.plot_unit_label.trim() || (kathaAppr ? "Katha (approx. from sq ft ÷ 720)" : ""),
    }))
  }, [property, state])

  const mapSelectionHint = useMemo(() => {
    if (!property || !isPlotBookingApplicationState(state)) return undefined
    const pl = state.plot
    return `Plot ${pl.plot_id} · ${pl.area_sqft.toLocaleString()} sq ft · ${formatBdtInteger(String(pl.price))}`
  }, [property, state])

  async function submitApplication() {
    if (!token || !property || !isPlotBookingApplicationState(state)) {
      showToast("Session or listing invalid. Go back and try again.", "error")
      return
    }
    const resolvedName = fullName.trim() || extra.applicant_full_name_en.trim()
    const resolvedEmail = email.trim() || extra.contact_email.trim()
    const resolvedPhone = phone.trim() || extra.contact_mobile_phone.trim()
    if (!resolvedName || !resolvedEmail || !resolvedPhone) {
      showToast("Full name, email, and phone are required (primary section or extended form).", "error")
      return
    }
    if (
      !extra.declares_booking_policy_read_full ||
      !extra.declares_english_declaration_read ||
      !extra.declares_information_provided_truthfully ||
      !extra.declares_read_and_agreed_project_terms ||
      !extra.declares_company_may_accept_or_reject_application
    ) {
      showToast(
        "প্লট বুকিং নীতিমালা পঠন সম্মতি, ইংরেজি ঘোষণা ও নিচের চেকবক্সগুলো সম্পূর্ণ করুন। / Confirm policy read, English declaration, and all confirmations.",
        "error",
      )
      return
    }

    const plot = state.plot
    if (!plot.plot_id?.trim()) {
      showToast("Plot selection missing. Go back and choose a plot.", "error")
      return
    }

    const contact_notes = [
      extra.instruction_if_any.trim()
        ? `Instruction: ${extra.instruction_if_any.trim().slice(0, 1500)}`
        : "",
      extra.mailing_present_address_en.trim()
        ? `Mailing/Present: ${extra.mailing_present_address_en.trim().slice(0, 500)}`
        : "",
    ]
      .filter(Boolean)
      .join("\n")

    const payload: LandBookingCreatePayload = {
      booking_kind: "plot_buy",
      plan_type: state.plan_type,
      full_name: resolvedName,
      email: resolvedEmail,
      phone: resolvedPhone,
      contact_notes: contact_notes.slice(0, 4000),
      referral_code_used: referralCode.trim(),
      property: property.id,
      selected_plot_code: plot.plot_id,
      selected_plot_area_sqft: plot.area_sqft,
      selected_plot_price: String(plot.price),
      application_data: extra,
    }

    if (state.investor_id != null && (role === "admin" || role === "agent")) {
      payload.investor = state.investor_id
    }

    const fp1 = attachmentFiles.passport_photo_1
    const nid = attachmentFiles.nid_or_id
    const receipt = attachmentFiles.booking_money_receipt
    if (!fp1 || !nid || !receipt) {
      showToast("তিনটি ফাইল আপলোড করুন। / Upload all three documents.", "error")
      return
    }

    const nJoint =
      extra.applicant_ownership_mode === "joint" ? extra.joint_applicants.length : 0
    if (nJoint > 0) {
      for (let i = 0; i < nJoint; i++) {
        const jr = jointAttachmentRows[i]
        if (!jr?.passport || !jr?.nid) {
          showToast(
            `যৌথ আবেদনকারী ${String(i + 1).padStart(2, "0")}: পাসপোর্ট ছবি ও NID আপলোড করুন। / Joint applicant ${i + 1}: upload passport photo and NID/ID.`,
            "error",
          )
          return
        }
      }
    }

    const nNom = extra.nominees.length
    if (nNom > 0) {
      for (let i = 0; i < nNom; i++) {
        const nr = nomineeAttachmentRows[i]
        if (!nr?.passport || !nr?.nid) {
          showToast(
            `নমিনি ${String(i + 1).padStart(2, "0")}: পাসপোর্ট ছবি ও NID আপলোড করুন। / Nominee ${i + 1}: upload passport photo and NID/ID.`,
            "error",
          )
          return
        }
      }
    }

    setBusy(true)
    try {
      const booking = await createLandBooking(payload, token)
      try {
        await uploadLandBookingApplicationAttachments(
          booking.id,
          {
            passport_photo_1: fp1,
            nid_or_id: nid,
            booking_money_receipt: receipt,
            ...(nJoint > 0 ? { jointApplicantRows: jointAttachmentRows.slice(0, nJoint) } : {}),
            ...(nNom > 0 ? { nomineeAttachmentRows: nomineeAttachmentRows.slice(0, nNom) } : {}),
          },
          token,
        )
      } catch (uploadErr) {
        const msg = uploadErr instanceof Error ? uploadErr.message : "Upload failed"
        showToast(
          `Booking #${booking.id} was created, but documents failed to upload: ${msg}. Retry from staff or contact support with this booking number.`,
          "error",
        )
        return
      }

      showToast("Booking and documents submitted. Track status in your dashboard.", "success")
      const inv = role === "investor"
      navigate(
        inv
          ? "/dashboard/investor/bookings"
          : role === "admin"
            ? "/dashboard/admin/bookings"
            : "/dashboard/agent/bookings",
        { replace: true },
      )
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Booking failed", "error")
    } finally {
      setBusy(false)
    }
  }

  if (!isPlotBookingApplicationState(state)) {
    return null
  }

  const plot = state.plot

  if (loading || !property) {
    return (
      <main className="min-h-[50vh] bg-[#f6f7fb] px-4 py-16 text-slate-900">
        <div className="mx-auto max-w-lg text-center text-sm text-slate-600">Loading…</div>
      </main>
    )
  }

  const isInvestor = role === "investor"
  const isStaff = role === "admin" || role === "agent"
  if (!token || (!isInvestor && !isStaff)) {
    return (
      <main className="min-h-[50vh] bg-[#f6f7fb] px-4 py-16">
        <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-slate-700">Sign in as an investor (or staff) to submit.</p>
          <Link
            to={`/auth?next=${encodeURIComponent(`/properties/${id}/book/application`)}`}
            className="mt-4 inline-flex rounded-xl bg-[#f58e43] px-4 py-3 font-semibold text-slate-950"
          >
            Sign in
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-[60vh] bg-[#f6f7fb] px-4 py-8 text-slate-900 sm:py-12">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <div>
          <Link to={`/properties/${property.id}/book`} className="text-sm font-medium text-[#f58e43] hover:underline">
            ← Back to plan &amp; plot
          </Link>
          <h1 className="mt-3 text-2xl font-semibold text-[#0b1f44]">Booking application</h1>
          <p className="mt-1 text-sm text-slate-600">{property.title}</p>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[#f58e43]">Selection summary</h2>
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">Plan</dt>
              <dd className="font-semibold text-[#0b1f44]">{planLabel(state.plan_type)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Plot</dt>
              <dd className="font-semibold text-[#0b1f44]">{plot.plot_id}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Area</dt>
              <dd className="font-semibold text-slate-800">{plot.area_sqft?.toLocaleString() ?? "—"} sqft</dd>
            </div>
            <div>
              <dt className="text-slate-500">Plot price</dt>
              <dd className="font-semibold text-[#f58e43]">{formatBdtInteger(String(plot.price))}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-[#0b1f44]">Primary contact</h2>
          <p className="mt-1 text-xs text-slate-600">Must match your account; used for booking confirmation.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-slate-700">Full name</span>
              <input
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-slate-700">Email</span>
              <input
                type="email"
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 sm:col-span-2">
              <span className="text-xs font-semibold text-slate-700">Phone</span>
              <input
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 sm:col-span-2">
              <span className="text-xs font-semibold text-slate-700">Referral code (optional)</span>
              <input
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
              />
            </label>
          </div>
        </section>

        <PlotBookingApplicationFormFields
          values={extra}
          onChange={(patch) => setExtra((prev) => ({ ...prev, ...patch }))}
          attachmentFiles={attachmentFiles}
          onAttachmentFileChange={(slot: PlotBookingAttachmentSlot, file) =>
            setAttachmentFiles((prev) => ({ ...prev, [slot]: file }))
          }
          mapSelectionHint={mapSelectionHint}
          selectedPlotSnapshot={state.plot}
          jointAttachmentRows={jointAttachmentRows}
          setJointAttachmentRows={setJointAttachmentRows}
          nomineeAttachmentRows={nomineeAttachmentRows}
          setNomineeAttachmentRows={setNomineeAttachmentRows}
        />

        <button
          type="button"
          disabled={busy}
          onClick={() => void submitApplication()}
          className="w-full rounded-xl bg-[#0b1f44] py-3.5 font-semibold text-white! shadow-sm transition hover:bg-[#152a55] disabled:opacity-50"
        >
          {busy ? "Submitting…" : "Submit booking application"}
        </button>
      </div>
    </main>
  )
}
