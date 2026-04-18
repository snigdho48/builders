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
  dummyJointApplicantAttachmentRows,
  dummyNomineeAttachmentRows,
  dummyPlotBookingApplicationData,
  dummyPlotBookingAttachmentFiles,
} from "@/content/plot-booking-dummy-data"
import {
  attachmentFieldErrorKey,
  landBookingApiDetailsToFieldErrors,
  scrollToFirstPlotBookingFieldError,
  type PlotBookingFieldErrors,
} from "@/content/plot-booking-field-errors"
import {
  emptyPlotBookingApplicationData,
  emptyPlotBookingAttachmentFiles,
  type PlotBookingApplicationData,
  type PlotBookingAttachmentFiles,
  type PlotBookingAttachmentSlot,
} from "@/content/plot-booking-application-form"
import { cnFormInp } from "@/components/booking-form/form-shared"
import { normalizeStoredRole } from "@/routes/protected-route"
import {
  ApiRequestError,
  createLandBooking,
  getMe,
  getProperty,
  openLandBookingMoneyReceiptPdf,
  uploadLandBookingApplicationAttachments,
} from "@/services/api"
import type { PlotBookingApplicationLocationState } from "@/types/plot-booking"
import { isPlotBookingApplicationState } from "@/types/plot-booking"
import type { LandBookingCreatePayload, Property } from "@/types/domain"
import { formatBdtInteger } from "@/utils/currency"

const SHOW_DUMMY_BOOKING_FILL =
  import.meta.env.DEV || import.meta.env.VITE_ENABLE_DUMMY_BOOKING_FILL === "true"

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
  const [fieldErrors, setFieldErrors] = useState<PlotBookingFieldErrors>({})

  function dismissFieldError(key: string) {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

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

  useEffect(() => {
    setFieldErrors((prev) => {
      const next = { ...prev }
      let changed = false
      if (prev.primary_full_name && extra.applicant_full_name_en.trim()) {
        delete next.primary_full_name
        changed = true
      }
      if (prev.primary_email && extra.contact_email.trim()) {
        delete next.primary_email
        changed = true
      }
      if (prev.primary_phone && extra.contact_mobile_phone.trim()) {
        delete next.primary_phone
        changed = true
      }
      return changed ? next : prev
    })
  }, [extra.applicant_full_name_en, extra.contact_email, extra.contact_mobile_phone])

  useEffect(() => {
    if (!isPlotBookingApplicationState(state) || state.investor_id == null) return
    setFieldErrors((prev) => {
      if (!prev.staff_investor) return prev
      const next = { ...prev }
      delete next.staff_investor
      return next
    })
  }, [state])

  const mapSelectionHint = useMemo(() => {
    if (!property || !isPlotBookingApplicationState(state)) return undefined
    const pl = state.plot
    return `Plot ${pl.plot_id} · ${pl.area_sqft.toLocaleString()} sq ft · ${formatBdtInteger(String(pl.price))}`
  }, [property, state])

  async function submitApplication() {
    setFieldErrors({})
    if (!token || !property || !isPlotBookingApplicationState(state)) {
      showToast("Session or listing invalid. Go back and try again.", "error")
      return
    }
    const resolvedName = fullName.trim() || extra.applicant_full_name_en.trim()
    const resolvedEmail = email.trim() || extra.contact_email.trim()
    const resolvedPhone = phone.trim() || extra.contact_mobile_phone.trim()
    if (!resolvedName || !resolvedEmail || !resolvedPhone) {
      const nextErr: PlotBookingFieldErrors = {}
      if (!resolvedName) nextErr.primary_full_name = true
      if (!resolvedEmail) nextErr.primary_email = true
      if (!resolvedPhone) nextErr.primary_phone = true
      setFieldErrors(nextErr)
      showToast("Full name, email, and phone are required (primary section or extended form).", "error")
      queueMicrotask(() => scrollToFirstPlotBookingFieldError(nextErr))
      return
    }
    if (
      !extra.declares_booking_policy_read_full ||
      !extra.declares_english_declaration_read ||
      !extra.declares_information_provided_truthfully ||
      !extra.declares_read_and_agreed_project_terms ||
      !extra.declares_company_may_accept_or_reject_application
    ) {
      const nextErr: PlotBookingFieldErrors = { declarations: true }
      setFieldErrors(nextErr)
      showToast(
        "প্লট বুকিং নীতিমালা পঠন সম্মতি, ইংরেজি ঘোষণা ও নিচের চেকবক্সগুলো সম্পূর্ণ করুন। / Confirm policy read, English declaration, and all confirmations.",
        "error",
      )
      queueMicrotask(() => scrollToFirstPlotBookingFieldError(nextErr))
      return
    }

    const plot = state.plot
    if (!plot.plot_id?.trim()) {
      showToast("Plot selection missing. Go back and choose a plot.", "error")
      return
    }

    const isStaffUser = role === "admin" || role === "agent"
    if (isStaffUser && state.investor_id == null) {
      const nextErr: PlotBookingFieldErrors = { staff_investor: true }
      setFieldErrors(nextErr)
      showToast("Staff: assign an investor on the plan & plot step before submitting.", "error")
      queueMicrotask(() => scrollToFirstPlotBookingFieldError(nextErr))
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
      const nextErr: PlotBookingFieldErrors = {}
      if (!fp1) nextErr.attachment_passport_photo_1 = true
      if (!nid) nextErr.attachment_nid_or_id = true
      if (!receipt) nextErr.attachment_booking_money_receipt = true
      setFieldErrors(nextErr)
      showToast("তিনটি ফাইল আপলোড করুন। / Upload all three documents.", "error")
      queueMicrotask(() => scrollToFirstPlotBookingFieldError(nextErr))
      return
    }

    const nJoint =
      extra.applicant_ownership_mode === "joint" ? extra.joint_applicants.length : 0
    if (nJoint > 0) {
      for (let i = 0; i < nJoint; i++) {
        const jr = jointAttachmentRows[i]
        if (!jr?.passport || !jr?.nid) {
          const nextErr: PlotBookingFieldErrors = {}
          if (!jr?.passport) nextErr[`joint_${i}_passport`] = true
          if (!jr?.nid) nextErr[`joint_${i}_nid`] = true
          setFieldErrors(nextErr)
          showToast(
            `যৌথ আবেদনকারী ${String(i + 1).padStart(2, "0")}: পাসপোর্ট ছবি ও NID আপলোড করুন। / Joint applicant ${i + 1}: upload passport photo and NID/ID.`,
            "error",
          )
          queueMicrotask(() => scrollToFirstPlotBookingFieldError(nextErr))
          return
        }
      }
    }

    const nNom = extra.nominees.length
    if (nNom > 0) {
      for (let i = 0; i < nNom; i++) {
        const nr = nomineeAttachmentRows[i]
        if (!nr?.passport || !nr?.nid) {
          const nextErr: PlotBookingFieldErrors = {}
          if (!nr?.passport) nextErr[`nominee_${i}_passport`] = true
          if (!nr?.nid) nextErr[`nominee_${i}_nid`] = true
          setFieldErrors(nextErr)
          showToast(
            `নমিনি ${String(i + 1).padStart(2, "0")}: পাসপোর্ট ছবি ও NID আপলোড করুন। / Nominee ${i + 1}: upload passport photo and NID/ID.`,
            "error",
          )
          queueMicrotask(() => scrollToFirstPlotBookingFieldError(nextErr))
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

      try {
        await openLandBookingMoneyReceiptPdf(booking.id, token)
        showToast("Booking submitted. Money Receipt opened in a new tab (use the viewer’s download button to save).", "success")
      } catch (receiptErr) {
        const isPopupFallback =
          receiptErr instanceof Error && receiptErr.message.startsWith("Popup blocked")
        showToast(
          isPopupFallback
            ? `Booking submitted. ${receiptErr.message}`
            : `Booking submitted. Money Receipt could not open: ${receiptErr instanceof Error ? receiptErr.message : "Unknown error"}. Your booking is saved — try again from the dashboard.`,
          isPopupFallback ? "success" : "error",
        )
      }

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
      const msg = e instanceof Error ? e.message : "Booking failed"
      if (e instanceof ApiRequestError && e.details && typeof e.details === "object") {
        const fe = landBookingApiDetailsToFieldErrors(e.details as Record<string, unknown>)
        if (Object.keys(fe).length > 0) {
          setFieldErrors((prev) => ({ ...prev, ...fe }))
          queueMicrotask(() => scrollToFirstPlotBookingFieldError(fe))
        }
      }
      showToast(msg, "error")
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

        {isStaff ? (
          <section
            id="booking-field-staff_investor"
            className={`rounded-2xl border p-4 shadow-sm sm:p-5 ${
              fieldErrors.staff_investor
                ? "border-red-500 bg-red-50/90 ring-2 ring-red-500/25"
                : "border-emerald-200 bg-emerald-50/70"
            }`}
          >
            <h2 className="text-sm font-bold text-[#0b1f44]">Investor for this booking</h2>
            {state.investor_id != null ? (
              <p className="mt-2 text-sm text-slate-800">
                Booking for investor account ID <strong className="tabular-nums">#{state.investor_id}</strong> (chosen on
                the previous step).
              </p>
            ) : (
              <div className="mt-2 space-y-2">
                <p className="text-sm font-medium text-red-800">
                  No investor is assigned. Staff must select or create an investor before this application can be
                  submitted.
                </p>
                <Link
                  to={`/properties/${property.id}/book`}
                  className="inline-flex text-sm font-semibold text-[#f58e43] hover:underline"
                >
                  ← Back to plan &amp; plot to assign an investor
                </Link>
              </div>
            )}
          </section>
        ) : null}

        <section
          className={`rounded-2xl border bg-white p-4 shadow-sm sm:p-6 ${
            fieldErrors.selected_plot_code || fieldErrors.plan_type_api ? "border-red-500 ring-2 ring-red-500/25" : "border-slate-200"
          }`}
        >
          <h2 className="text-sm font-bold uppercase tracking-wide text-[#f58e43]">Selection summary</h2>
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div id="booking-field-plan_type_api">
              <dt className="text-slate-500">Plan</dt>
              <dd className="font-semibold text-[#0b1f44]">{planLabel(state.plan_type)}</dd>
            </div>
            <div id="booking-field-selected_plot_code">
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

        {SHOW_DUMMY_BOOKING_FILL ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300/80 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            <p className="font-medium text-amber-950">Dev / QA: load sample applicant + nominee + files</p>
            <button
              type="button"
              className="rounded-lg bg-amber-600 px-4 py-2 font-semibold text-white shadow-sm transition hover:bg-amber-700"
              onClick={() => {
                const d = dummyPlotBookingApplicationData()
                setExtra(d)
                setFullName(d.applicant_full_name_en)
                setEmail(d.contact_email)
                setPhone(d.contact_mobile_phone)
                setAttachmentFiles(dummyPlotBookingAttachmentFiles())
                setJointAttachmentRows(dummyJointApplicantAttachmentRows())
                setNomineeAttachmentRows(dummyNomineeAttachmentRows())
                setFieldErrors({})
                showToast("Dummy data filled. Plot details follow your selected plot when loaded.", "success")
              }}
            >
              Fill dummy data
            </button>
          </div>
        ) : null}

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-[#0b1f44]">Primary contact</h2>
          <p className="mt-1 text-xs text-slate-600">Must match your account; used for booking confirmation.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-slate-700">Full name</span>
              <input
                id="booking-field-primary_full_name"
                aria-invalid={fieldErrors.primary_full_name ? true : undefined}
                className={cnFormInp(fieldErrors.primary_full_name)}
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value)
                  dismissFieldError("primary_full_name")
                }}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-slate-700">Email</span>
              <input
                id="booking-field-primary_email"
                type="email"
                aria-invalid={fieldErrors.primary_email ? true : undefined}
                className={cnFormInp(fieldErrors.primary_email)}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  dismissFieldError("primary_email")
                }}
              />
            </label>
            <label className="flex flex-col gap-1 sm:col-span-2">
              <span className="text-xs font-semibold text-slate-700">Phone</span>
              <input
                id="booking-field-primary_phone"
                aria-invalid={fieldErrors.primary_phone ? true : undefined}
                className={cnFormInp(fieldErrors.primary_phone)}
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value)
                  dismissFieldError("primary_phone")
                }}
              />
            </label>
            <label className="flex flex-col gap-1 sm:col-span-2">
              <span className="text-xs font-semibold text-slate-700">Referral code (optional)</span>
              <input
                id="booking-field-referral_code_used"
                aria-invalid={fieldErrors.referral_code_used ? true : undefined}
                className={cnFormInp(fieldErrors.referral_code_used)}
                value={referralCode}
                onChange={(e) => {
                  setReferralCode(e.target.value)
                  dismissFieldError("referral_code_used")
                }}
              />
            </label>
          </div>
        </section>

        <PlotBookingApplicationFormFields
          values={extra}
          onChange={(patch) => setExtra((prev) => ({ ...prev, ...patch }))}
          attachmentFiles={attachmentFiles}
          onAttachmentFileChange={(slot: PlotBookingAttachmentSlot, file) => {
            setAttachmentFiles((prev) => ({ ...prev, [slot]: file }))
            dismissFieldError(attachmentFieldErrorKey(slot))
          }}
          mapSelectionHint={mapSelectionHint}
          selectedPlotSnapshot={state.plot}
          jointAttachmentRows={jointAttachmentRows}
          setJointAttachmentRows={setJointAttachmentRows}
          nomineeAttachmentRows={nomineeAttachmentRows}
          setNomineeAttachmentRows={setNomineeAttachmentRows}
          fieldErrors={fieldErrors}
          onDismissFieldError={dismissFieldError}
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
