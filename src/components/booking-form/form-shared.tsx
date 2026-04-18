import type { ReactNode } from "react"

export const FORM_INP =
  "rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-[#f58e43]/0 transition focus:border-[#f58e43] focus:ring-2 focus:ring-[#f58e43]/25"
export const FORM_CHK = "h-4 w-4 rounded border-slate-300 text-[#0b1f44] focus:ring-[#f58e43]"

export function FormLabeled({
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

const OCC_OPTS = [
  { v: "pvt_service", l: "Pvt. Service" },
  { v: "govt_service", l: "Govt. Service" },
  { v: "business", l: "Business" },
  { v: "others", l: "Others" },
] as const

export function OccupationBoxes({
  occupation_type,
  occupation_other,
  onPatch,
  namePrefix,
}: {
  occupation_type: string
  occupation_other: string
  onPatch: (p: { occupation_type?: string; occupation_other?: string }) => void
  /** Unique name for radio group (applicant vs nominee vs representative). */
  namePrefix: string
}) {
  return (
    <div className="space-y-2">
      <span className="text-xs font-semibold text-slate-700">Occupation (English)</span>
      <div className="flex flex-wrap gap-4">
        {OCC_OPTS.map((o) => (
          <label key={o.v} className="flex cursor-pointer items-center gap-2 text-sm text-slate-800">
            <input
              type="radio"
              name={`occ_${namePrefix}`}
              className={FORM_CHK}
              checked={occupation_type === o.v}
              onChange={() => onPatch({ occupation_type: o.v })}
            />
            {o.l}
          </label>
        ))}
      </div>
      {occupation_type === "others" ? (
        <input
          className={FORM_INP}
          value={occupation_other}
          placeholder="Specify"
          onChange={(e) => onPatch({ occupation_other: e.target.value })}
        />
      ) : null}
    </div>
  )
}

export function PhotoIdentityBoxes({
  nid,
  passport,
  driving,
  birthCert,
  other,
  onNid,
  onPassport,
  onDriving,
  onBirth,
  onOtherText,
}: {
  nid: boolean
  passport: boolean
  driving: boolean
  birthCert: boolean
  other: string
  onNid: (v: boolean) => void
  onPassport: (v: boolean) => void
  onDriving: (v: boolean) => void
  onBirth: (v: boolean) => void
  onOtherText: (v: string) => void
}) {
  return (
    <div className="space-y-3">
      <span className="text-xs font-semibold text-slate-700">Photo Identity (English)</span>
      <div className="flex flex-wrap gap-4">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" className={FORM_CHK} checked={nid} onChange={(e) => onNid(e.target.checked)} />
          NID
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" className={FORM_CHK} checked={passport} onChange={(e) => onPassport(e.target.checked)} />
          Passport
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" className={FORM_CHK} checked={driving} onChange={(e) => onDriving(e.target.checked)} />
          Driving License
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" className={FORM_CHK} checked={birthCert} onChange={(e) => onBirth(e.target.checked)} />
          Birth Certificate
        </label>
      </div>
      <FormLabeled label="Others (specify) (English)">
        <input className={FORM_INP} value={other} onChange={(e) => onOtherText(e.target.value)} placeholder="Others…" />
      </FormLabeled>
    </div>
  )
}
