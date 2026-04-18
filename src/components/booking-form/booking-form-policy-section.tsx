import { PlotBookingPolicyPanel } from "@/components/plot-booking-policy-panel"
import { FORM_CHK } from "@/components/booking-form/form-shared"

type Props = {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

/** Policy text (expandable) plus mandatory acknowledgment before final declarations. */
export function BookingFormPolicyAcknowledgement({ checked, onCheckedChange }: Props) {
  return (
    <fieldset className="rounded-2xl border border-[#0b1f44]/15 bg-white p-4 shadow-sm sm:p-5">
      <legend className="px-1 text-sm font-bold text-[#0b1f44]">প্লট বুকিং ও বরাদ্দ নীতিমালা</legend>
      <details className="group mt-3 rounded-xl border border-slate-200 bg-white open:shadow-sm">
        <summary className="cursor-pointer list-none rounded-xl px-4 py-3 text-sm font-semibold text-[#0b1f44] marker:content-none [&::-webkit-details-marker]:hidden">
          বিস্তারিত পড়ুন · ক্লিক করে খুলুন বা বন্ধ করুন
        </summary>
        <div className="border-t border-slate-100 px-4 pb-4 pt-2">
          <PlotBookingPolicyPanel />
        </div>
      </details>
      <label className="mt-4 flex cursor-pointer gap-3 rounded-xl border border-amber-200 bg-amber-50/90 p-4 text-sm leading-snug text-slate-900">
        <input type="checkbox" className={FORM_CHK} checked={checked} onChange={(e) => onCheckedChange(e.target.checked)} />
        <span>
          আমি উপরের <strong className="text-[#0b1f44]">প্লট বুকিং ও বরাদ্দ নীতিমালা</strong> সম্পূর্ণ পড়েছি ও বুঝেছি। / I confirm I have read and understood the full plot booking and allotment policy.
        </span>
      </label>
    </fieldset>
  )
}
