import type { Dispatch, SetStateAction } from "react"

import { PlotBookingSelectedPlotFields } from "@/components/plot-booking-selected-plot-fields"
import {
  BookingFormApplicantAttachmentDraft,
  BookingFormContactDetail,
  BookingFormPersonalInformations,
} from "@/components/booking-form/booking-form-applicant-section"
import { BookingFormDeclarationSection } from "@/components/booking-form/booking-form-declaration-section"
import { BookingFormNomineeBlocks } from "@/components/booking-form/booking-form-nominee-section"
import { BookingFormPolicyAcknowledgement } from "@/components/booking-form/booking-form-policy-section"
import { FormLabeled, FORM_INP } from "@/components/booking-form/form-shared"
import { en } from "@/components/booking-form/label-lang"

import type { JointApplicantAttachmentRow, NomineeAttachmentRow } from "@/content/plot-booking-joint-attachments"
import type {
  PlotBookingApplicationData,
  PlotBookingAttachmentFiles,
  PlotBookingAttachmentSlot,
} from "@/content/plot-booking-application-form"
import type { LandPlot } from "@/types/domain"

type Props = {
  values: PlotBookingApplicationData
  onChange: (patch: Partial<PlotBookingApplicationData>) => void
  attachmentFiles: PlotBookingAttachmentFiles
  onAttachmentFileChange: (slot: PlotBookingAttachmentSlot, file: File | null) => void
  mapSelectionHint?: string
  /** Map-selected plot — drives read-only summary in Selected Plot Detail. */
  selectedPlotSnapshot?: LandPlot | null
  jointAttachmentRows: JointApplicantAttachmentRow[]
  setJointAttachmentRows: Dispatch<SetStateAction<JointApplicantAttachmentRow[]>>
  nomineeAttachmentRows: NomineeAttachmentRow[]
  setNomineeAttachmentRows: Dispatch<SetStateAction<NomineeAttachmentRow[]>>
  /** Submit validation highlights — keys from `@/content/plot-booking-field-errors`. */
  fieldErrors?: Partial<Record<string, true>>
  /** Clear one validation key when the user fixes that control. */
  onDismissFieldError?: (key: string) => void
}

export function PlotBookingApplicationFormFields({
  values,
  onChange,
  attachmentFiles,
  onAttachmentFileChange,
  mapSelectionHint,
  selectedPlotSnapshot,
  jointAttachmentRows,
  setJointAttachmentRows,
  nomineeAttachmentRows,
  setNomineeAttachmentRows,
  fieldErrors,
  onDismissFieldError,
}: Props) {
  const declInvalid = Boolean(fieldErrors?.declarations)

  return (
    <div className="space-y-8">
      <BookingFormPersonalInformations values={values} onChange={onChange} />
      <BookingFormContactDetail values={values} onChange={onChange} />
      <BookingFormApplicantAttachmentDraft
        values={values}
        onChange={onChange}
        attachmentFiles={attachmentFiles}
        onAttachmentFileChange={onAttachmentFileChange}
        attachmentFieldErrors={fieldErrors}
      />

      <PlotBookingSelectedPlotFields
        values={values}
        onChange={onChange}
        mapSelectionHint={mapSelectionHint}
        selectedPlotSnapshot={selectedPlotSnapshot ?? null}
        jointAttachmentRows={jointAttachmentRows}
        setJointAttachmentRows={setJointAttachmentRows}
        fieldErrors={fieldErrors}
        onDismissFieldError={onDismissFieldError}
      />

      <BookingFormNomineeBlocks
        values={values}
        onChange={onChange}
        nomineeAttachmentRows={nomineeAttachmentRows}
        setNomineeAttachmentRows={setNomineeAttachmentRows}
        fieldErrors={fieldErrors}
        onDismissFieldError={onDismissFieldError}
      />

      <fieldset className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <legend className="px-1 text-sm font-bold text-[#0b1f44]">{en("Bank details (optional)")}</legend>
        <p className="mt-1 text-xs text-slate-600">
          ফেরত বা ফর্মাল পেআউটের জন্য ব্যবহারযোগ্য। প্রয়োজন না হলে খালি রাখুন।
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <FormLabeled label={en("Bank name")}>
            <input className={FORM_INP} value={values.bank_name} onChange={(e) => onChange({ bank_name: e.target.value })} />
          </FormLabeled>
          <FormLabeled label={en("Branch")}>
            <input className={FORM_INP} value={values.bank_branch} onChange={(e) => onChange({ bank_branch: e.target.value })} />
          </FormLabeled>
          <FormLabeled label={en("Account holder name")}>
            <input className={FORM_INP} value={values.account_name} onChange={(e) => onChange({ account_name: e.target.value })} />
          </FormLabeled>
          <FormLabeled label={en("Account number")}>
            <input className={FORM_INP} value={values.account_number} onChange={(e) => onChange({ account_number: e.target.value })} autoComplete="off" />
          </FormLabeled>
          <FormLabeled label={en("Account type")}>
            <select className={FORM_INP} value={values.account_type} onChange={(e) => onChange({ account_type: e.target.value })}>
              <option value="savings">Savings</option>
              <option value="current">Current</option>
              <option value="other">Other</option>
            </select>
          </FormLabeled>
          <FormLabeled label={en("Routing number")} hint="If applicable">
            <input className={FORM_INP} value={values.routing_number} onChange={(e) => onChange({ routing_number: e.target.value })} />
          </FormLabeled>
        </div>
      </fieldset>

      <fieldset className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <legend className="px-1 text-sm font-bold text-[#0b1f44]">{en("Instruction (if any)")}</legend>
        <p className="mt-1 text-xs text-slate-600">অতিরিক্ত নির্দেশনা থাকলে লিখুন। খালি রাখতে পারেন।</p>
        <textarea
          className={`${FORM_INP} mt-4 min-h-[88px] resize-y`}
          value={values.instruction_if_any}
          onChange={(e) => onChange({ instruction_if_any: e.target.value })}
          placeholder="Optional instructions for processing…"
        />
      </fieldset>

      <BookingFormPolicyAcknowledgement
        checked={values.declares_booking_policy_read_full}
        invalid={declInvalid}
        onCheckedChange={(checked) => {
          onDismissFieldError?.("declarations")
          onChange({ declares_booking_policy_read_full: checked })
        }}
      />

      <BookingFormDeclarationSection
        values={values}
        invalid={declInvalid}
        onChange={(patch) => {
          onDismissFieldError?.("declarations")
          onChange(patch)
        }}
      />
    </div>
  )
}
