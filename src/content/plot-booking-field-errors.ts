/** Keys used with submit validation highlighting on the plot booking application page. */
export type PlotBookingFieldErrors = Partial<Record<string, true>>

export function attachmentFieldErrorKey(slot: string): string {
  return `attachment_${slot}`
}

export function jointFileFieldErrorKey(index: number, kind: "passport" | "nid"): string {
  return `joint_${index}_${kind}`
}

export function nomineeFileFieldErrorKey(index: number, kind: "passport" | "nid"): string {
  return `nominee_${index}_${kind}`
}

/** Focus order for scrolling to the first invalid control after validation. */
const SCROLL_PRIORITY: string[] = [
  "primary_full_name",
  "primary_email",
  "primary_phone",
  "staff_investor",
  "selected_plot_code",
  "plan_type_api",
  "referral_code_used",
  "declarations",
  "attachment_passport_photo_1",
  "attachment_nid_or_id",
  "attachment_booking_money_receipt",
]

function anchorIdForErrorKey(key: string): string {
  if (key === "declarations") return "booking-field-declarations"
  return `booking-field-${key}`
}

/** Map DRF field keys from `error.details` to client field-error keys (same ids as `booking-field-*`). */
export function landBookingApiDetailsToFieldErrors(details: Record<string, unknown>): PlotBookingFieldErrors {
  const out: PlotBookingFieldErrors = {}
  for (const key of Object.keys(details)) {
    const raw = details[key]
    const hasErr = Array.isArray(raw)
      ? raw.some((x) => x != null && String(x).trim() !== "")
      : raw != null && String(raw).trim() !== ""
    if (!hasErr) continue
    switch (key) {
      case "investor":
        out.staff_investor = true
        break
      case "selected_plot_code":
        out.selected_plot_code = true
        break
      case "referral_code_used":
        out.referral_code_used = true
        break
      case "plan_type":
        out.plan_type_api = true
        break
      default:
        out[`api_${key}`] = true
    }
  }
  return out
}

export function scrollToFirstPlotBookingFieldError(errors: PlotBookingFieldErrors): void {
  for (const k of SCROLL_PRIORITY) {
    if (errors[k]) {
      document.getElementById(anchorIdForErrorKey(k))?.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }
  }
  const rest = Object.keys(errors)
    .filter((k) => k.startsWith("joint_") || k.startsWith("nominee_") || k.startsWith("api_"))
    .sort()
  for (const k of rest) {
    const id = k.startsWith("api_") ? `booking-field-${k.slice(4)}` : `booking-field-${k}`
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "center" })
    return
  }
}

