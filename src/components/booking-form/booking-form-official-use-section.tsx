import type { PlotBookingApplicationData } from "@/content/plot-booking-application-form"
import { en } from "@/components/booking-form/label-lang"
import { FormLabeled, FORM_INP, FORM_CHK } from "@/components/booking-form/form-shared"

type P = {
  values: PlotBookingApplicationData
  onChange: (patch: Partial<PlotBookingApplicationData>) => void
}

export function BookingFormOfficialUseSection({ values, onChange }: P) {
  const o = values.official_use
  const patch = (p: Partial<typeof o>) => onChange({ official_use: { ...o, ...p } })

  return (
    <fieldset className="rounded-2xl border border-[#0b1f44]/25 bg-slate-50/60 p-4 shadow-sm sm:p-5">
      <legend className="px-1 text-sm font-bold text-[#0b1f44]">For Official Use Only (English)</legend>

      <p className="mt-2 text-xs font-semibold text-slate-700">Mode of Payment Detail (English)</p>
      <div className="mt-3 flex flex-wrap gap-6">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" className={FORM_CHK} checked={o.payment_mode_at_once} onChange={(e) => patch({ payment_mode_at_once: e.target.checked })} />
          At a Time
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" className={FORM_CHK} checked={o.payment_mode_installment} onChange={(e) => patch({ payment_mode_installment: e.target.checked })} />
          Installment
        </label>
      </div>

      <p className="mt-5 text-xs font-semibold text-slate-700">Payment type (English)</p>
      <div className="mt-2 flex flex-wrap gap-4">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" className={FORM_CHK} checked={o.payment_booking_money} onChange={(e) => patch({ payment_booking_money: e.target.checked })} />
          Booking Money
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" className={FORM_CHK} checked={o.payment_down_payment} onChange={(e) => patch({ payment_down_payment: e.target.checked })} />
          Down Payment
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" className={FORM_CHK} checked={o.payment_part_payment} onChange={(e) => patch({ payment_part_payment: e.target.checked })} />
          Part Payment
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" className={FORM_CHK} checked={o.payment_full_payment} onChange={(e) => patch({ payment_full_payment: e.target.checked })} />
          Full Payment
        </label>
      </div>
      <div className="mt-3 max-w-xs">
        <FormLabeled label={en("Full Payment (%)")}>
          <input className={FORM_INP} value={o.payment_full_payment_percent} onChange={(e) => patch({ payment_full_payment_percent: e.target.value })} placeholder="%" />
        </FormLabeled>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <FormLabeled label={en("Taka")}>
          <input className={FORM_INP} value={o.amount_taka} onChange={(e) => patch({ amount_taka: e.target.value })} />
        </FormLabeled>
        <FormLabeled label={en("on or before (date)")}>
          <input type="date" className={FORM_INP} value={o.amount_on_or_before_date} onChange={(e) => patch({ amount_on_or_before_date: e.target.value })} />
        </FormLabeled>
        <div className="sm:col-span-2">
          <FormLabeled label={en("In word")}>
            <textarea className={`${FORM_INP} min-h-[64px]`} value={o.amount_in_words} onChange={(e) => patch({ amount_in_words: e.target.value })} />
          </FormLabeled>
        </div>
        <FormLabeled label={en("Instrument (Cash / Cheque / P.O / DD note)")}>
          <input className={FORM_INP} value={o.instrument_type_note} onChange={(e) => patch({ instrument_type_note: e.target.value })} />
        </FormLabeled>
        <FormLabeled label={en("Cash / Cheque / P.O / DD No.")}>
          <input className={FORM_INP} value={o.cash_cheque_po_dd_no} onChange={(e) => patch({ cash_cheque_po_dd_no: e.target.value })} />
        </FormLabeled>
        <FormLabeled label={en("Date")}>
          <input type="date" className={FORM_INP} value={o.cash_cheque_date} onChange={(e) => patch({ cash_cheque_date: e.target.value })} />
        </FormLabeled>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <FormLabeled label={en("Account Name")}>
          <input className={FORM_INP} value={o.account_name} onChange={(e) => patch({ account_name: e.target.value })} />
        </FormLabeled>
        <FormLabeled label={en("Bank Name")}>
          <input className={FORM_INP} value={o.bank_name} onChange={(e) => patch({ bank_name: e.target.value })} />
        </FormLabeled>
        <FormLabeled label={en("Branch Name")}>
          <input className={FORM_INP} value={o.branch_name} onChange={(e) => patch({ branch_name: e.target.value })} />
        </FormLabeled>
        <FormLabeled label={en("Routing No.")}>
          <input className={FORM_INP} value={o.routing_no} onChange={(e) => patch({ routing_no: e.target.value })} />
        </FormLabeled>
        <FormLabeled label={en("SWIFT Code")}>
          <input className={FORM_INP} value={o.swift_code} onChange={(e) => patch({ swift_code: e.target.value })} />
        </FormLabeled>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <FormLabeled label={en("No. of Installment")}>
          <input className={FORM_INP} value={o.num_installment_options} onChange={(e) => patch({ num_installment_options: e.target.value })} />
        </FormLabeled>
        <FormLabeled label={en("Per Installment Taka")}>
          <input className={FORM_INP} value={o.per_installment_taka} onChange={(e) => patch({ per_installment_taka: e.target.value })} />
        </FormLabeled>
        <div className="lg:col-span-2">
          <FormLabeled label={en("Installment Start from")}>
            <input className={FORM_INP} value={o.installment_start_from} onChange={(e) => patch({ installment_start_from: e.target.value })} />
          </FormLabeled>
        </div>
      </div>
    </fieldset>
  )
}
