import { PlotBookingAttachmentFileInputs } from "@/components/plot-booking-attachment-file-inputs"
import type {
  PlotBookingApplicationData,
  PlotBookingAttachmentFiles,
  PlotBookingAttachmentSlot,
} from "@/content/plot-booking-application-form"
import { BLOOD_GROUP_OPTIONS } from "@/content/blood-group-options"
import { RELIGION_OPTIONS } from "@/content/religion-options"
import { bn, en } from "@/components/booking-form/label-lang"
import { FormLabeled, FORM_INP, FORM_CHK, OccupationBoxes, PhotoIdentityBoxes } from "@/components/booking-form/form-shared"

type P = {
  values: PlotBookingApplicationData
  onChange: (patch: Partial<PlotBookingApplicationData>) => void
}

export function BookingFormIdRow({ values, onChange }: P) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormLabeled label="ID No. (English)">
        <input className={FORM_INP} value={values.form_id_no} onChange={(e) => onChange({ form_id_no: e.target.value })} />
      </FormLabeled>
      <FormLabeled label="File No. (English)">
        <input className={FORM_INP} value={values.form_file_no} onChange={(e) => onChange({ form_file_no: e.target.value })} />
      </FormLabeled>
    </div>
  )
}

export function BookingFormPersonalInformations({ values, onChange }: P) {
  return (
    <fieldset className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5">
      <legend className="px-1 text-sm font-bold text-[#0b1f44]">Personal Informations / ব্যক্তিগত তথ্যাদি</legend>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <FormLabeled label={en("Full Name of Applicant (In capital letter)")}>
          <input className={FORM_INP} value={values.applicant_full_name_en} onChange={(e) => onChange({ applicant_full_name_en: e.target.value })} autoComplete="name" />
        </FormLabeled>
        <FormLabeled label={bn("আবেদনকারীর নাম")}>
          <input className={FORM_INP} value={values.applicant_full_name_bn} onChange={(e) => onChange({ applicant_full_name_bn: e.target.value })} />
        </FormLabeled>
        <FormLabeled label={en("Father's Name (In capital letter)")}>
          <input className={FORM_INP} value={values.father_name_en} onChange={(e) => onChange({ father_name_en: e.target.value })} />
        </FormLabeled>
        <FormLabeled label={bn("পিতার নাম")}>
          <input className={FORM_INP} value={values.father_name_bn} onChange={(e) => onChange({ father_name_bn: e.target.value })} />
        </FormLabeled>
        <FormLabeled label={en("Mother's Name (In capital letter)")}>
          <input className={FORM_INP} value={values.mother_name_en} onChange={(e) => onChange({ mother_name_en: e.target.value })} />
        </FormLabeled>
        <FormLabeled label={bn("মাতার নাম")}>
          <input className={FORM_INP} value={values.mother_name_bn} onChange={(e) => onChange({ mother_name_bn: e.target.value })} />
        </FormLabeled>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <FormLabeled label={en("Date of Birth")}>
          <input type="date" className={FORM_INP} value={values.date_of_birth} onChange={(e) => onChange({ date_of_birth: e.target.value })} />
        </FormLabeled>
        <FormLabeled label={en("Blood Group")}>
          <select className={FORM_INP} value={values.blood_group} onChange={(e) => onChange({ blood_group: e.target.value })}>
            {BLOOD_GROUP_OPTIONS.map((o) => (
              <option key={o.value || "empty"} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </FormLabeled>
        <FormLabeled label={en("Gender")}>
          <select className={FORM_INP} value={values.gender} onChange={(e) => onChange({ gender: e.target.value })}>
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </FormLabeled>
        <FormLabeled label={en("Religion")}>
          <select className={FORM_INP} value={values.religion} onChange={(e) => onChange({ religion: e.target.value })}>
            {RELIGION_OPTIONS.map((o) => (
              <option key={o.value || "empty-rel"} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </FormLabeled>
        <FormLabeled label={en("Nationality")}>
          <input className={FORM_INP} value={values.nationality} onChange={(e) => onChange({ nationality: e.target.value })} />
        </FormLabeled>
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-slate-700">NRB (English)</span>
          <div className="flex gap-6">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="radio" className={FORM_CHK} checked={values.is_nrb === true} onChange={() => onChange({ is_nrb: true })} />
              Yes
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="radio" className={FORM_CHK} checked={values.is_nrb === false} onChange={() => onChange({ is_nrb: false })} />
              No
            </label>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <OccupationBoxes namePrefix="applicant" occupation_type={values.occupation_type} occupation_other={values.occupation_other} onPatch={(p) => onChange(p)} />
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <FormLabeled label={en("Designation")}>
          <input className={FORM_INP} value={values.designation} onChange={(e) => onChange({ designation: e.target.value })} />
        </FormLabeled>
        <FormLabeled label={en("Department")}>
          <input className={FORM_INP} value={values.department} onChange={(e) => onChange({ department: e.target.value })} />
        </FormLabeled>
        <FormLabeled label={en("Organization Name")}>
          <input className={FORM_INP} value={values.organization_name} onChange={(e) => onChange({ organization_name: e.target.value })} />
        </FormLabeled>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <FormLabeled label={en("Marital Status")}>
          <input className={FORM_INP} value={values.marital_status} onChange={(e) => onChange({ marital_status: e.target.value })} />
        </FormLabeled>
        <FormLabeled label={en("Marriage Date")}>
          <input type="date" className={FORM_INP} value={values.marriage_date} onChange={(e) => onChange({ marriage_date: e.target.value })} />
        </FormLabeled>
        <FormLabeled label={en("Spouse Name (In capital letter)")}>
          <input className={FORM_INP} value={values.spouse_name_en} onChange={(e) => onChange({ spouse_name_en: e.target.value })} />
        </FormLabeled>
        <FormLabeled label={bn("স্বামী / স্ত্রীর নাম")}>
          <input className={FORM_INP} value={values.spouse_name_bn} onChange={(e) => onChange({ spouse_name_bn: e.target.value })} />
        </FormLabeled>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <FormLabeled label={en("National ID (NID)")}>
          <input className={FORM_INP} value={values.national_id} onChange={(e) => onChange({ national_id: e.target.value })} />
        </FormLabeled>
        <FormLabeled label={en("Passport number")} hint="If applicable">
          <input className={FORM_INP} value={values.passport_number} onChange={(e) => onChange({ passport_number: e.target.value })} />
        </FormLabeled>
      </div>
    </fieldset>
  )
}

export function BookingFormContactDetail({ values, onChange }: P) {
  return (
    <fieldset className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <legend className="px-1 text-sm font-bold text-[#0b1f44]">Contact Detail</legend>
      <p className="mt-1 text-xs text-slate-600">Mailing and permanent addresses are captured in English only.</p>
      <div className="mt-4 grid gap-4">
        <FormLabeled label={en("Mobile / Phone No. (With country & local code)")}>
          <input className={FORM_INP} value={values.contact_mobile_phone} onChange={(e) => onChange({ contact_mobile_phone: e.target.value })} autoComplete="tel" />
        </FormLabeled>
        <FormLabeled label={en("Email ID")}>
          <input type="email" className={FORM_INP} value={values.contact_email} onChange={(e) => onChange({ contact_email: e.target.value })} autoComplete="email" />
        </FormLabeled>
        <FormLabeled label={en("Mailing or Present Address")}>
          <textarea className={`${FORM_INP} min-h-[88px]`} value={values.mailing_present_address_en} onChange={(e) => onChange({ mailing_present_address_en: e.target.value })} />
        </FormLabeled>
        <FormLabeled label={en("Permanent Address")}>
          <textarea className={`${FORM_INP} min-h-[88px]`} value={values.permanent_address_en} onChange={(e) => onChange({ permanent_address_en: e.target.value })} />
        </FormLabeled>
      </div>
    </fieldset>
  )
}

type PAttach = P & {
  attachmentFiles: PlotBookingAttachmentFiles
  onAttachmentFileChange: (slot: PlotBookingAttachmentSlot, file: File | null) => void
}

export function BookingFormApplicantAttachmentDraft({ values, onChange, attachmentFiles, onAttachmentFileChange }: PAttach) {
  return (
    <fieldset className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <legend className="px-1 text-sm font-bold text-[#0b1f44]">Attachment</legend>
      <div className="mt-4">
        <PhotoIdentityBoxes
          nid={values.applicant_photo_identity_nid}
          passport={values.applicant_photo_identity_passport}
          driving={values.applicant_photo_identity_driving_license}
          birthCert={values.applicant_photo_identity_birth_certificate}
          other={values.applicant_photo_identity_other}
          onNid={(v) => onChange({ applicant_photo_identity_nid: v })}
          onPassport={(v) => onChange({ applicant_photo_identity_passport: v })}
          onDriving={(v) => onChange({ applicant_photo_identity_driving_license: v })}
          onBirth={(v) => onChange({ applicant_photo_identity_birth_certificate: v })}
          onOtherText={(v) => onChange({ applicant_photo_identity_other: v })}
        />
      </div>

      <div className="mt-6 border-t border-slate-100 pt-5">
        <p className="text-xs font-bold uppercase tracking-wide text-[#f58e43]">{en("Upload files")}</p>
        <p className="mt-2 text-xs text-slate-600">
          একই ফর্ম অনুযায়ী উপরের ছবি ও পরিচয়পত্রের জন্য ফাইল নির্বাচন করুন। জমা দেওয়ার আগে তিনটি আপলোডই বাধ্যতামূলক।
        </p>
        <PlotBookingAttachmentFileInputs
          files={attachmentFiles}
          onChange={onAttachmentFileChange}
          showSectionHeader={false}
        />
      </div>
    </fieldset>
  )
}
