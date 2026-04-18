import type { Dispatch, SetStateAction } from "react"

import { useToast } from "@/components/ui/use-toast"
import { BOOKING_ATTACHMENT_FILE_INPUT_CLASS } from "@/components/plot-booking-attachment-file-inputs"
import type { NomineePersonDraft, PlotBookingApplicationData } from "@/content/plot-booking-application-form"
import { emptyNomineePersonDraft } from "@/content/plot-booking-application-form"
import {
  MAX_NOMINEE_ATTACHMENT_SLOTS,
  type NomineeAttachmentRow,
} from "@/content/plot-booking-joint-attachments"
import { BLOOD_GROUP_OPTIONS } from "@/content/blood-group-options"
import { RELIGION_OPTIONS } from "@/content/religion-options"
import { bn, en } from "@/components/booking-form/label-lang"
import { FormLabeled, FORM_INP, FORM_CHK, OccupationBoxes, PhotoIdentityBoxes } from "@/components/booking-form/form-shared"

const NOMINEE_FILE_MAX_BYTES = 10 * 1024 * 1024

function NomineePersonFields({
  value,
  onChange,
  namePrefix,
  indexOneBased,
  attachmentRow,
  onPickAttachment,
}: {
  value: NomineePersonDraft
  onChange: (patch: Partial<NomineePersonDraft>) => void
  namePrefix: string
  indexOneBased: number
  attachmentRow: NomineeAttachmentRow
  onPickAttachment: (key: keyof NomineeAttachmentRow, files: FileList | null) => void
}) {
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormLabeled label={en("Relation")}>
          <input className={FORM_INP} value={value.relation} onChange={(e) => onChange({ relation: e.target.value })} />
        </FormLabeled>
        <FormLabeled label={en("Ownership Proportion %")}>
          <input className={FORM_INP} value={value.ownership_proportion_pct} onChange={(e) => onChange({ ownership_proportion_pct: e.target.value })} />
        </FormLabeled>
      </div>

      <p className="mt-6 text-xs font-bold uppercase tracking-wide text-[#f58e43]">
        Personal Informations (ব্যক্তিগত তথ্যাদি) — nominee {indexOneBased}
      </p>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <FormLabeled label={en("Full Name of Applicant (In capital letter)")}>
          <input className={FORM_INP} value={value.full_name_en} onChange={(e) => onChange({ full_name_en: e.target.value })} />
        </FormLabeled>
        <FormLabeled label={bn("আবেদনকারীর নাম")}>
          <input className={FORM_INP} value={value.full_name_bn} onChange={(e) => onChange({ full_name_bn: e.target.value })} />
        </FormLabeled>
        <FormLabeled label={en("Father's Name (In capital letter)")}>
          <input className={FORM_INP} value={value.father_name_en} onChange={(e) => onChange({ father_name_en: e.target.value })} />
        </FormLabeled>
        <FormLabeled label={bn("পিতার নাম")}>
          <input className={FORM_INP} value={value.father_name_bn} onChange={(e) => onChange({ father_name_bn: e.target.value })} />
        </FormLabeled>
        <FormLabeled label={en("Mother's Name (In capital letter)")}>
          <input className={FORM_INP} value={value.mother_name_en} onChange={(e) => onChange({ mother_name_en: e.target.value })} />
        </FormLabeled>
        <FormLabeled label={bn("মাতার নাম")}>
          <input className={FORM_INP} value={value.mother_name_bn} onChange={(e) => onChange({ mother_name_bn: e.target.value })} />
        </FormLabeled>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <FormLabeled label={en("Date of Birth")}>
          <input type="date" className={FORM_INP} value={value.date_of_birth} onChange={(e) => onChange({ date_of_birth: e.target.value })} />
        </FormLabeled>
        <FormLabeled label={en("Blood Group")}>
          <select className={FORM_INP} value={value.blood_group} onChange={(e) => onChange({ blood_group: e.target.value })}>
            {BLOOD_GROUP_OPTIONS.map((o) => (
              <option key={o.value || "empty-n"} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </FormLabeled>
        <FormLabeled label={en("Gender")}>
          <select className={FORM_INP} value={value.gender} onChange={(e) => onChange({ gender: e.target.value })}>
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </FormLabeled>
        <FormLabeled label={en("Religion")}>
          <select className={FORM_INP} value={value.religion} onChange={(e) => onChange({ religion: e.target.value })}>
            {RELIGION_OPTIONS.map((o) => (
              <option key={o.value || "empty-nrel"} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </FormLabeled>
        <FormLabeled label={en("Nationality")}>
          <input className={FORM_INP} value={value.nationality} onChange={(e) => onChange({ nationality: e.target.value })} />
        </FormLabeled>
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-slate-700">NRB (English)</span>
          <div className="flex gap-6">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="radio" className={FORM_CHK} checked={value.is_nrb === true} onChange={() => onChange({ is_nrb: true })} />
              Yes
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="radio" className={FORM_CHK} checked={value.is_nrb === false} onChange={() => onChange({ is_nrb: false })} />
              No
            </label>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <OccupationBoxes namePrefix={`nom_${namePrefix}`} occupation_type={value.occupation_type} occupation_other={value.occupation_other} onPatch={(p) => onChange(p)} />
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <FormLabeled label={en("Designation")}>
          <input className={FORM_INP} value={value.designation} onChange={(e) => onChange({ designation: e.target.value })} />
        </FormLabeled>
        <FormLabeled label={en("Department")}>
          <input className={FORM_INP} value={value.department} onChange={(e) => onChange({ department: e.target.value })} />
        </FormLabeled>
        <FormLabeled label={en("Organization Name")}>
          <input className={FORM_INP} value={value.organization_name} onChange={(e) => onChange({ organization_name: e.target.value })} />
        </FormLabeled>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <FormLabeled label={en("Marital Status")}>
          <input className={FORM_INP} value={value.marital_status} onChange={(e) => onChange({ marital_status: e.target.value })} />
        </FormLabeled>
        <FormLabeled label={en("Marriage Date")}>
          <input type="date" className={FORM_INP} value={value.marriage_date} onChange={(e) => onChange({ marriage_date: e.target.value })} />
        </FormLabeled>
        <FormLabeled label={en("Spouse Name (In capital letter)")}>
          <input className={FORM_INP} value={value.spouse_name_en} onChange={(e) => onChange({ spouse_name_en: e.target.value })} />
        </FormLabeled>
        <FormLabeled label={bn("স্বামী / স্ত্রীর নাম")}>
          <input className={FORM_INP} value={value.spouse_name_bn} onChange={(e) => onChange({ spouse_name_bn: e.target.value })} />
        </FormLabeled>
      </div>

      <p className="mt-6 text-xs font-bold uppercase tracking-wide text-[#f58e43]">Contact Detail</p>
      <div className="mt-3 grid gap-4">
        <FormLabeled label={en("Mobile / Phone No. (With country & local code)")}>
          <input className={FORM_INP} value={value.mobile_phone} onChange={(e) => onChange({ mobile_phone: e.target.value })} />
        </FormLabeled>
        <FormLabeled label={en("Email ID")}>
          <input type="email" className={FORM_INP} value={value.email} onChange={(e) => onChange({ email: e.target.value })} />
        </FormLabeled>
        <FormLabeled label={en("Mailing or Present Address")}>
          <textarea className={`${FORM_INP} min-h-[72px]`} value={value.mailing_address_en} onChange={(e) => onChange({ mailing_address_en: e.target.value })} />
        </FormLabeled>
        <FormLabeled label={en("Permanent Address")}>
          <textarea className={`${FORM_INP} min-h-[72px]`} value={value.permanent_address_en} onChange={(e) => onChange({ permanent_address_en: e.target.value })} />
        </FormLabeled>
      </div>

      <div className="mt-6">
        <PhotoIdentityBoxes
          nid={value.photo_identity_nid}
          passport={value.photo_identity_passport}
          driving={value.photo_identity_driving_license}
          birthCert={value.photo_identity_birth_certificate}
          other={value.photo_identity_other}
          onNid={(v) => onChange({ photo_identity_nid: v })}
          onPassport={(v) => onChange({ photo_identity_passport: v })}
          onDriving={(v) => onChange({ photo_identity_driving_license: v })}
          onBirth={(v) => onChange({ photo_identity_birth_certificate: v })}
          onOtherText={(v) => onChange({ photo_identity_other: v })}
        />
      </div>

      <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
        <p className="text-xs font-semibold text-[#0b1f44]">{en(`Nominee ${String(indexOneBased).padStart(2, "0")} — documents`)}</p>
        <p className="mt-1 text-[11px] text-slate-600">
          পাসপোর্ট সাইজের ছবি ও পরিচয়পত্রের কপি আপলোড করুন (প্রাথমিক আবেদনকারীর নিয়ম অনুযায়ী)। প্রতিটি নমিনির জন্য বাধ্যতামূলক।
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-800">{en("Passport-size photo")}</span>
            <span className="text-[11px] text-slate-500">JPG, PNG, WebP, or PDF · max 10 MB</span>
            <input
              type="file"
              className={BOOKING_ATTACHMENT_FILE_INPUT_CLASS}
              accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp,.pdf,application/pdf"
              onChange={(e) => onPickAttachment("passport", e.target.files)}
            />
            {attachmentRow.passport ? (
              <span className="text-[11px] font-medium text-emerald-700">
                Selected: {attachmentRow.passport.name} ({(attachmentRow.passport.size / 1024).toFixed(0)} KB)
              </span>
            ) : (
              <span className="text-[11px] text-amber-700">Required</span>
            )}
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-800 leading-snug">
              জাতীয় পরিচয়পত্র বা নির্বাচিত পরিচয়পত্রের কপি / Photo identity document
            </span>
            <span className="text-[11px] text-slate-500">JPG, PNG, WebP, or PDF · max 10 MB</span>
            <input
              type="file"
              className={BOOKING_ATTACHMENT_FILE_INPUT_CLASS}
              accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp,.pdf,application/pdf"
              onChange={(e) => onPickAttachment("nid", e.target.files)}
            />
            {attachmentRow.nid ? (
              <span className="text-[11px] font-medium text-emerald-700">
                Selected: {attachmentRow.nid.name} ({(attachmentRow.nid.size / 1024).toFixed(0)} KB)
              </span>
            ) : (
              <span className="text-[11px] text-amber-700">Required</span>
            )}
          </label>
        </div>
      </div>
    </div>
  )
}

type Props = {
  values: PlotBookingApplicationData
  onChange: (patch: Partial<PlotBookingApplicationData>) => void
  nomineeAttachmentRows: NomineeAttachmentRow[]
  setNomineeAttachmentRows: Dispatch<SetStateAction<NomineeAttachmentRow[]>>
}

export function BookingFormNomineeBlocks({
  values,
  onChange,
  nomineeAttachmentRows,
  setNomineeAttachmentRows,
}: Props) {
  const { showToast } = useToast()
  const nominees = values.nominees

  function updateAt(index: number, patch: Partial<NomineePersonDraft>) {
    const next = nominees.map((n, i) => (i === index ? { ...n, ...patch } : n))
    onChange({ nominees: next })
  }

  function removeAt(index: number) {
    onChange({ nominees: nominees.filter((_, i) => i !== index) })
    setNomineeAttachmentRows((rows) => rows.filter((_, i) => i !== index))
  }

  function pickNomineeFile(idx: number, key: keyof NomineeAttachmentRow, list: FileList | null) {
    const f = list?.[0] ?? null
    if (f && f.size > NOMINEE_FILE_MAX_BYTES) {
      showToast(`File too large (max ${NOMINEE_FILE_MAX_BYTES / (1024 * 1024)} MB).`, "error")
      return
    }
    setNomineeAttachmentRows((prev) => {
      const next = [...prev]
      while (next.length <= idx) next.push({ passport: null, nid: null })
      next[idx] = { ...next[idx]!, [key]: f }
      return next
    })
  }

  function addNominee() {
    if (nominees.length >= MAX_NOMINEE_ATTACHMENT_SLOTS) return
    onChange({ nominees: [...nominees, emptyNomineePersonDraft()] })
    setNomineeAttachmentRows((rows) => [...rows, { passport: null, nid: null }])
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-[#0b1f44]">Nominee Detail</h3>
          <p className="mt-1 text-xs text-slate-600">
            প্রয়োজন অনুযায়ী <strong>Add nominee</strong> চাপুন। প্রতিটি নমিনির সম্পূর্ণ তথ্য আলাদা ব্লকে পূরণ করুন।
          </p>
        </div>
        <button
          type="button"
          disabled={nominees.length >= MAX_NOMINEE_ATTACHMENT_SLOTS}
          title={
            nominees.length >= MAX_NOMINEE_ATTACHMENT_SLOTS
              ? `Maximum ${MAX_NOMINEE_ATTACHMENT_SLOTS} nominees`
              : undefined
          }
          className="rounded-xl border border-[#0b1f44]/25 bg-white px-4 py-2 text-sm font-semibold text-[#0b1f44] shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={addNominee}
        >
          + Add nominee
        </button>
      </div>

      {nominees.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-6 text-center text-sm text-slate-600">
          কোনো নমিনি যোগ করা হয়নি। প্রয়োজন হলে <strong>Add nominee</strong> ব্যবহার করুন।
        </p>
      ) : (
        <div className="space-y-8">
          {nominees.map((nom, idx) => (
            <fieldset key={idx} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <legend className="flex w-full flex-wrap items-center justify-between gap-2 px-1 text-sm font-bold text-[#0b1f44]">
                <span>Nominee — {String(idx + 1).padStart(2, "0")}</span>
                <button
                  type="button"
                  className="text-xs font-semibold text-red-700 underline-offset-2 hover:underline"
                  onClick={() => removeAt(idx)}
                >
                  Remove
                </button>
              </legend>
              <div className="mt-4">
                <NomineePersonFields
                  indexOneBased={idx + 1}
                  namePrefix={`nm${idx}`}
                  value={nom}
                  onChange={(patch) => updateAt(idx, patch)}
                  attachmentRow={nomineeAttachmentRows[idx] ?? { passport: null, nid: null }}
                  onPickAttachment={(key, files) => pickNomineeFile(idx, key, files)}
                />
              </div>
            </fieldset>
          ))}
        </div>
      )}
    </div>
  )
}
