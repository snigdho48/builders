import type { Dispatch, ReactNode, SetStateAction } from "react"
import { useToast } from "@/components/ui/use-toast"
import {
  BOOKING_ATTACHMENT_FILE_INPUT_CLASS,
  BOOKING_ATTACHMENT_FILE_INPUT_INVALID,
} from "@/components/plot-booking-attachment-file-inputs"
import type { JointApplicantAttachmentRow } from "@/content/plot-booking-joint-attachments"
import { jointApplicantAttachmentLabelIndex } from "@/content/plot-booking-joint-attachments"
import type { JointApplicantRow, PlotBookingApplicationData } from "@/content/plot-booking-application-form"
import {
  PLOT_CATEGORY_OPTIONS,
  PLOT_FACING_OPTIONS,
  PLOT_POSITION_OPTIONS,
} from "@/content/plot-booking-plot-detail-options"
import { bn, en } from "@/components/booking-form/label-lang"
import type { LandPlot } from "@/types/domain"

const JOINT_FILE_MAX_BYTES = 10 * 1024 * 1024

type Props = {
  values: PlotBookingApplicationData
  onChange: (patch: Partial<PlotBookingApplicationData>) => void
  mapSelectionHint?: string
  /** Plot chosen on the map — used to show read-only facts and suggested katha (see page autofill). */
  selectedPlotSnapshot?: LandPlot | null
  /** Passport + NID uploads per joint row (same order as `joint_applicants`). */
  jointAttachmentRows: JointApplicantAttachmentRow[]
  setJointAttachmentRows: Dispatch<SetStateAction<JointApplicantAttachmentRow[]>>
  fieldErrors?: Partial<Record<string, true>>
  onDismissFieldError?: (key: string) => void
}

function Labeled({
  label,
  children,
  hint,
}: {
  label: string
  children: ReactNode
  hint?: string
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-semibold text-slate-700">{label}</span>
      {hint ? <span className="text-[11px] text-slate-500">{hint}</span> : null}
      {children}
    </label>
  )
}

function emptyJointRow(): JointApplicantRow {
  return { name_en: "", name_bn: "" }
}

/** Non-editable value from plot selection / server-prefilled application_data. */
function LockedField({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  const ro =
    "min-h-[42px] rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900"
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold text-slate-700">{label}</span>
      {hint ? <span className="text-[11px] text-slate-500">{hint}</span> : null}
      <div className={ro}>{children}</div>
    </div>
  )
}

export function PlotBookingSelectedPlotFields({
  values,
  onChange,
  mapSelectionHint,
  selectedPlotSnapshot,
  jointAttachmentRows,
  setJointAttachmentRows,
  fieldErrors,
  onDismissFieldError,
}: Props) {
  const { showToast } = useToast()
  const inp =
    "rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-[#f58e43]/0 transition focus:border-[#f58e43] focus:ring-2 focus:ring-[#f58e43]/25"

  const isJoint = values.applicant_ownership_mode === "joint"
  const jointRows = values.joint_applicants

  function jointRowFiles(idx: number): JointApplicantAttachmentRow {
    return jointAttachmentRows[idx] ?? { passport: null, nid: null }
  }

  function pickJointFile(idx: number, key: keyof JointApplicantAttachmentRow, list: FileList | null) {
    const f = list?.[0] ?? null
    if (f && f.size > JOINT_FILE_MAX_BYTES) {
      showToast(`File too large (max ${JOINT_FILE_MAX_BYTES / (1024 * 1024)} MB).`, "error")
      return
    }
    if (f) onDismissFieldError?.(`joint_${idx}_${key}`)
    setJointAttachmentRows((prev) => {
      const next = [...prev]
      while (next.length <= idx) next.push({ passport: null, nid: null })
      const row = { ...next[idx]!, [key]: f }
      next[idx] = row
      return next
    })
  }

  const dash = (s: string | undefined | null) => (s != null && String(s).trim() !== "" ? String(s).trim() : "—")

  const plotNo = selectedPlotSnapshot?.plot_id ?? values.selected_plot_no
  const plotKatha =
    values.plot_size_katha.trim() ||
    (selectedPlotSnapshot?.area_sqft ? (selectedPlotSnapshot.area_sqft / 720).toFixed(4) : "")
  const plotUnit =
    values.plot_unit_label.trim() ||
    (selectedPlotSnapshot?.area_sqft ? "Katha (approx. from sq ft ÷ 720)" : "")

  return (
    <fieldset className="rounded-2xl border border-[#0b1f44]/15 bg-white p-4 shadow-sm sm:p-5">
      <legend className="px-1 text-sm font-bold text-[#0b1f44]">Selected Plot Detail</legend>
      <p className="mt-1 text-xs text-slate-600">
        প্লট নম্বর, আকার ও ইউনিট আপনার নির্বাচিত প্লট অনুযায়ী নির্ধারিত — সম্পাদনা যোগ্য নয়। প্রকল্প ও ঠিকানা উপরের ঘরে আপডেট করা যাবে।
      </p>

      {mapSelectionHint ? (
        <p className="mt-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-[11px] text-slate-600">
          <span className="font-semibold text-[#0b1f44]">Map selection (reference):</span> {mapSelectionHint}
        </p>
      ) : null}

      {selectedPlotSnapshot ? (
        <dl className="mt-3 grid gap-2 rounded-lg border border-emerald-100 bg-emerald-50/60 px-3 py-2 text-[11px] text-slate-700 sm:grid-cols-3">
          <div>
            <dt className="text-slate-500">Plot ID (English)</dt>
            <dd className="font-semibold text-[#0b1f44]">{selectedPlotSnapshot.plot_id}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Area (sq ft)</dt>
            <dd className="font-semibold text-slate-800">{selectedPlotSnapshot.area_sqft.toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Price (BDT)</dt>
            <dd className="font-semibold text-[#f58e43]">{selectedPlotSnapshot.price}</dd>
          </div>
        </dl>
      ) : null}

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Labeled label={en("Project Name")}>
          <input className={inp} value={values.plot_detail_project_name} onChange={(e) => onChange({ plot_detail_project_name: e.target.value })} />
        </Labeled>
        <Labeled label={en("Property Type")}>
          <input className={inp} value={values.plot_detail_property_type} onChange={(e) => onChange({ plot_detail_property_type: e.target.value })} />
        </Labeled>
      </div>

      <div className="mt-4">
        <Labeled label={en("Location / Address")}>
          <textarea className={`${inp} min-h-[72px] resize-y`} value={values.plot_detail_location_address} onChange={(e) => onChange({ plot_detail_location_address: e.target.value })} />
        </Labeled>
      </div>

      <div className="mt-5 flex flex-wrap gap-8 border-t border-slate-100 pt-4">
        <span className="text-xs font-semibold text-slate-700">Application type (English)</span>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-800">
          <input
            type="radio"
            name="ownership_mode"
            className="h-4 w-4 border-slate-300 text-[#0b1f44]"
            checked={values.applicant_ownership_mode === "individual"}
            onChange={() => {
              onChange({ applicant_ownership_mode: "individual", joint_applicants: [] })
              setJointAttachmentRows([])
            }}
          />
          Individual
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-800">
          <input
            type="radio"
            name="ownership_mode"
            className="h-4 w-4 border-slate-300 text-[#0b1f44]"
            checked={values.applicant_ownership_mode === "joint"}
            onChange={() => onChange({ applicant_ownership_mode: "joint" })}
          />
          Joint
        </label>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <LockedField label={en("Plot No.")} hint="From plot selection (fixed)">
          {dash(plotNo)}
        </LockedField>
        <LockedField label={en("Plot Size (Katha)")} hint="From map area (÷ 720) when prefilled">
          {dash(plotKatha)}
        </LockedField>
        <LockedField label={en("Unit")} hint="Fixed from selection">
          {dash(plotUnit)}
        </LockedField>
      </div>

      <div className="mt-6">
        <p className="text-xs font-semibold text-slate-600">Plot attributes (English) — optional</p>
        <p className="mt-1 text-[11px] text-slate-500">
          These are only required if your allotment or quotation specifies them; otherwise leave as &quot;Not specified&quot;.
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Labeled label={en("Plot Category")}>
            <select className={inp} value={values.plot_category} onChange={(e) => onChange({ plot_category: e.target.value })}>
              {PLOT_CATEGORY_OPTIONS.map((o) => (
                <option key={o.value || "empty"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Labeled>
          <Labeled label={en("Plot Position")}>
            <select className={inp} value={values.plot_position} onChange={(e) => onChange({ plot_position: e.target.value })}>
              {PLOT_POSITION_OPTIONS.map((o) => (
                <option key={o.value || "empty-pos"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Labeled>
          <Labeled label={en("Plot Facing")}>
            <select className={inp} value={values.plot_facing} onChange={(e) => onChange({ plot_facing: e.target.value })}>
              {PLOT_FACING_OPTIONS.map((o) => (
                <option key={o.value || "empty-face"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Labeled>
        </div>
      </div>

      <hr className="my-8 border-dashed border-slate-300" />

      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h3 className="text-sm font-bold text-[#0b1f44]">
            Name of Joint Applicants (If any) · {bn("যৌথ আবেদনকারীর নাম (যদি থাকে)")}
          </h3>
          <button
            type="button"
            disabled={!isJoint || jointRows.length >= 5}
            title={jointRows.length >= 5 ? "Maximum 5 joint applicants (matches admin document slots)." : undefined}
            className="rounded-xl border border-[#0b1f44]/25 bg-white px-4 py-2 text-sm font-semibold text-[#0b1f44] shadow-sm transition enabled:hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() => {
              onChange({ joint_applicants: [...jointRows, emptyJointRow()] })
              setJointAttachmentRows((rows) => [...rows, { passport: null, nid: null }])
            }}
          >
            + Add joint applicant
          </button>
        </div>
        {!isJoint ? (
          <p className="text-xs text-slate-500">Individual application — switch to Joint above if you need co‑applicants.</p>
        ) : jointRows.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-5 text-center text-sm text-slate-600">
            কোনো যৌথ আবেদনকারী যোগ করা হয়নি। প্রয়োজনে <strong>Add joint applicant</strong> চাপুন।
          </p>
        ) : (
          <div className="space-y-4">
            {jointRows.map((row, idx) => {
              const jf = jointRowFiles(idx)
              const lab = jointApplicantAttachmentLabelIndex(idx)
              return (
                <div key={idx} className="space-y-4 border-t border-slate-100 pt-4">
                  <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                    <Labeled label={`${en(`Joint applicant ${idx + 1} — Name`)}`}>
                      <input
                        className={inp}
                        value={row.name_en}
                        onChange={(e) => {
                          const next = [...jointRows]
                          next[idx] = { ...next[idx], name_en: e.target.value }
                          onChange({ joint_applicants: next })
                        }}
                      />
                    </Labeled>
                    <Labeled label={bn(`নাম (${idx + 1})`)}>
                      <input
                        className={inp}
                        value={row.name_bn}
                        onChange={(e) => {
                          const next = [...jointRows]
                          next[idx] = { ...next[idx], name_bn: e.target.value }
                          onChange({ joint_applicants: next })
                        }}
                      />
                    </Labeled>
                    <button
                      type="button"
                      className="h-10 rounded-lg text-sm font-semibold text-red-700 underline-offset-2 hover:underline sm:mb-0.5"
                      onClick={() => {
                        onChange({ joint_applicants: jointRows.filter((_, i) => i !== idx) })
                        setJointAttachmentRows((rows) => rows.filter((_, i) => i !== idx))
                      }}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                    <p className="text-xs font-semibold text-[#0b1f44]">
                      {en(`Joint applicant ${lab} — documents`)}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-600">
                      Passport-size photo and NID / valid ID (same rules as primary applicant). Required for each joint applicant.
                    </p>
                    <div className="mt-3 grid gap-4 sm:grid-cols-2">
                      <label className="flex flex-col gap-1" id={`booking-field-joint_${idx}_passport`}>
                        <span className="text-xs font-semibold text-slate-800">{en("Passport-size photo")}</span>
                        <span className="text-[11px] text-slate-500">JPG, PNG, WebP, or PDF · max 10 MB</span>
                        <input
                          type="file"
                          aria-invalid={fieldErrors?.[`joint_${idx}_passport`] ? true : undefined}
                          className={`${BOOKING_ATTACHMENT_FILE_INPUT_CLASS} ${
                            fieldErrors?.[`joint_${idx}_passport`] ? BOOKING_ATTACHMENT_FILE_INPUT_INVALID : ""
                          }`}
                          accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp,.pdf,application/pdf"
                          onChange={(e) => pickJointFile(idx, "passport", e.target.files)}
                        />
                        {jf.passport ? (
                          <span className="text-[11px] font-medium text-emerald-700">
                            Selected: {jf.passport.name} ({(jf.passport.size / 1024).toFixed(0)} KB)
                          </span>
                        ) : (
                          <span
                            className={`text-[11px] ${fieldErrors?.[`joint_${idx}_passport`] ? "font-medium text-red-600" : "text-amber-700"}`}
                          >
                            Required
                          </span>
                        )}
                      </label>
                      <label className="flex flex-col gap-1" id={`booking-field-joint_${idx}_nid`}>
                        <span className="text-xs font-semibold text-slate-800">{en("NID / valid ID")}</span>
                        <span className="text-[11px] text-slate-500">JPG, PNG, WebP, or PDF · max 10 MB</span>
                        <input
                          type="file"
                          aria-invalid={fieldErrors?.[`joint_${idx}_nid`] ? true : undefined}
                          className={`${BOOKING_ATTACHMENT_FILE_INPUT_CLASS} ${
                            fieldErrors?.[`joint_${idx}_nid`] ? BOOKING_ATTACHMENT_FILE_INPUT_INVALID : ""
                          }`}
                          accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp,.pdf,application/pdf"
                          onChange={(e) => pickJointFile(idx, "nid", e.target.files)}
                        />
                        {jf.nid ? (
                          <span className="text-[11px] font-medium text-emerald-700">
                            Selected: {jf.nid.name} ({(jf.nid.size / 1024).toFixed(0)} KB)
                          </span>
                        ) : (
                          <span
                            className={`text-[11px] ${fieldErrors?.[`joint_${idx}_nid`] ? "font-medium text-red-600" : "text-amber-700"}`}
                          >
                            Required
                          </span>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </fieldset>
  )
}
