import type { PlotBookingApplicationData } from "@/content/plot-booking-application-form"
import { FORM_CHK } from "@/components/booking-form/form-shared"

const ENGLISH_DECLARATION =
  "I/we do hereby declare that the above mentioned information and description are true to the best of my/our knowledge, I/we further declare that I/we have neither concealed anything nor I/we have given any wrong information. I/we have gone through the pamphlet of the company containing the project and plan and understood the conditions of allotment in my/our favor is binding on me/us. If a plot is allotted to me/us I/we shall get the sale deed executed and registered at my/our own cost, that is I/we shall bear the stamp duty, registration fees, VAT and all other fees payable to the Govt. or other local bodies."

type P = {
  values: PlotBookingApplicationData
  onChange: (patch: Partial<PlotBookingApplicationData>) => void
}

export function BookingFormDeclarationSection({ values, onChange }: P) {
  const chk = FORM_CHK

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-4 sm:p-5">
      <h3 className="text-sm font-bold text-[#0b1f44]">Final declaration (last step)</h3>
      <p className="mt-1 text-xs text-slate-600">নীতিমালা পঠন নিশ্চিত করার পর ঘোষণা সম্পূর্ণ করুন। / Complete after policy acknowledgment above.</p>
      <p className="mt-3 rounded-lg border border-amber-100 bg-white/90 p-3 text-[13px] leading-relaxed text-slate-800">
        <span className="text-xs font-semibold text-slate-500">(English)</span> {ENGLISH_DECLARATION}
      </p>

      <label className="mt-4 flex cursor-pointer gap-3 text-sm leading-snug text-slate-900">
        <input
          type="checkbox"
          className={chk}
          checked={values.declares_english_declaration_read}
          onChange={(e) => onChange({ declares_english_declaration_read: e.target.checked })}
        />
        <span>I/we have read and understood the English declaration above.</span>
      </label>

      <p className="mt-6 text-xs font-semibold text-slate-700">১৩) ঘোষণা — Declaration (বাংলা)</p>
      <p className="mt-2 rounded-lg border border-amber-100 bg-white/80 p-3 text-[13px] leading-relaxed text-slate-800">
        আবেদনকারী ঘোষণা করছেন যে তিনি প্রদত্ত সকল তথ্য সঠিকভাবে প্রদান করেছেন এবং প্রকল্পের সকল শর্তাবলী পড়ে বুঝে সম্মত হয়েছেন। কোম্পানি যেকোনো আবেদন গ্রহণ বা বাতিল করার পূর্ণ অধিকার সংরক্ষণ করে।
      </p>
      <p className="mt-3 text-xs font-medium text-slate-600">জমা দেওয়ার আগে নিম্নের বিষয়গুলোতে সম্মতি দিন:</p>

      <label className="mt-3 flex cursor-pointer gap-3 text-sm leading-snug text-slate-900">
        <input
          type="checkbox"
          className={chk}
          checked={values.declares_information_provided_truthfully}
          onChange={(e) => onChange({ declares_information_provided_truthfully: e.target.checked })}
        />
        <span>আমি নিশ্চিত করছি যে উপরে প্রদত্ত সকল তথ্য সত্য ও সঠিক।</span>
      </label>
      <label className="mt-3 flex cursor-pointer gap-3 text-sm leading-snug text-slate-900">
        <input
          type="checkbox"
          className={chk}
          checked={values.declares_read_and_agreed_project_terms}
          onChange={(e) => onChange({ declares_read_and_agreed_project_terms: e.target.checked })}
        />
        <span>আমি উপরের নীতিমালা ও প্রকল্প সংক্রান্ত শর্তাবলী পড়েছি এবং তাতে সম্মত।</span>
      </label>
      <label className="mt-3 flex cursor-pointer gap-3 text-sm leading-snug text-slate-900">
        <input
          type="checkbox"
          className={chk}
          checked={values.declares_company_may_accept_or_reject_application}
          onChange={(e) => onChange({ declares_company_may_accept_or_reject_application: e.target.checked })}
        />
        <span>
          আমি বুঝেছি যে কোম্পানির যেকোনো আবেদন গ্রহণ বা বাতিল করার পূর্ণ অধিকার রয়েছে এবং সেই সিদ্ধান্ত চূড়ান্ত।
        </span>
      </label>
    </div>
  )
}
