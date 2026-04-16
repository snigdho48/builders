import { useMemo, useState } from "react"
import { Link } from "react-router-dom"

import { eurostarFaqLandShare, eurostarFaqNrbLegal, eurostarFaqPlotBuy } from "@/content/eurostar-faq-content"
import { useLanguage } from "@/i18n/language-context"

type FaqTab = "plot" | "share" | "nrb"

const TAB_META: Record<FaqTab, { en: string; bn: string }> = {
  plot: { en: "Plot buying", bn: "প্লট ক্রয়" },
  share: { en: "Land share", bn: "ল্যান্ড শেয়ার" },
  nrb: { en: "NRB legal", bn: "NRB লিগ্যাল" },
}

export function DashboardFaqPanel() {
  const { language } = useLanguage()
  const isBn = language === "bn"
  const [tab, setTab] = useState<FaqTab>("plot")

  const rows = useMemo(() => {
    if (tab === "plot") return eurostarFaqPlotBuy
    if (tab === "share") return eurostarFaqLandShare
    return eurostarFaqNrbLegal
  }, [tab])

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f58e43]">FAQ</p>
          <h3 className="mt-1 text-lg font-semibold text-[#0b1f44]">
            {isBn ? "ড্যাশবোর্ড FAQ" : "Dashboard FAQ"}
          </h3>
        </div>
        <Link to="/#faq" className="text-xs font-semibold text-[#f58e43] hover:underline">
          {isBn ? "হোম FAQ দেখুন" : "View home FAQ"}
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {(Object.keys(TAB_META) as FaqTab[]).map((key) => (
          <button
            key={key}
            type="button"
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              tab === key ? "bg-[#0b1f44] text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
            onClick={() => setTab(key)}
          >
            {isBn ? TAB_META[key].bn : TAB_META[key].en}
          </button>
        ))}
      </div>

      <div className="mt-4 max-h-128 space-y-2 overflow-y-auto pr-1">
        {rows.map((row, i) => (
          <details key={`${tab}-${i}`} className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5">
            <summary className="cursor-pointer text-sm font-semibold text-[#0b1f44]">
              {isBn ? row.questionBn : row.question}
            </summary>
            <p className="mt-2 whitespace-pre-line text-xs leading-6 text-slate-600">
              {isBn ? row.answerBn : row.answer}
            </p>
          </details>
        ))}
      </div>
    </article>
  )
}
