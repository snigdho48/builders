import {
  PLOT_BOOKING_POLICY_BLOCKS_BN,
  PLOT_BOOKING_POLICY_FOOTER_BN,
  PLOT_BOOKING_POLICY_TITLE_BN,
} from "@/content/plot-booking-policy-bn"

export function PlotBookingPolicyPanel() {
  return (
    <div className="space-y-4 rounded-2xl border border-[#0b1f44]/15 bg-[#f8fafc] p-4 sm:p-5">
      <h3 className="text-base font-bold text-[#0b1f44]">{PLOT_BOOKING_POLICY_TITLE_BN}</h3>
      <div className="max-h-[min(70vh,520px)] space-y-4 overflow-y-auto pr-1 text-sm leading-relaxed text-slate-800">
        {PLOT_BOOKING_POLICY_BLOCKS_BN.map((block) => (
          <section key={block.id} className="rounded-xl border border-slate-200/80 bg-white/90 p-3 shadow-sm">
            <h4 className="font-semibold text-[#0b1f44]">{block.heading}</h4>
            <div className="mt-2 space-y-2 text-[13px] text-slate-700">
              {block.paragraphs.map((p, i) => (
                <p key={`${block.id}-${i}`}>{p}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
      <div className="border-t border-dashed border-slate-300 pt-4 text-xs leading-relaxed text-slate-600">
        <p className="font-semibold text-[#0b1f44]">{PLOT_BOOKING_POLICY_FOOTER_BN.noteLabel}</p>
        <ul className="mt-2 list-none space-y-1">
          {PLOT_BOOKING_POLICY_FOOTER_BN.lines.map((line, i) =>
            line === "" ? (
              <li key={`gap-${i}`} className="h-1" aria-hidden />
            ) : (
              <li key={`${line}-${i}`}>{line}</li>
            ),
          )}
        </ul>
      </div>
    </div>
  )
}
