import { useMemo, useState } from "react"
import { Link } from "react-router-dom"

import {
  eurostarFaqLandShare,
  eurostarFaqNrbLegal,
  eurostarFaqPlotBuy,
} from "@/content/eurostar-faq-content"
import { useLanguage } from "@/i18n/language-context"

type FaqTab = "plot" | "share" | "nrb"

export function FaqPage() {
  const { language } = useLanguage()
  const [faqTab, setFaqTab] = useState<FaqTab>("plot")

  const faqItems = useMemo(() => {
    const source =
      faqTab === "plot"
        ? eurostarFaqPlotBuy
        : faqTab === "share"
          ? eurostarFaqLandShare
          : eurostarFaqNrbLegal
    return source.map((row) => ({
      question: language === "bn" ? row.questionBn : row.question,
      answer: language === "bn" ? row.answerBn : row.answer,
    }))
  }, [faqTab, language])

  return (
    <main className="bg-[#f6f7fb] text-slate-900">
      <section className="border-b border-slate-200/70 bg-white">
        <div className="landing-inner py-10 sm:py-12">
          <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#f58e43]">FAQ</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-[2.2rem]">
            {language === "bn" ? "প্রায়শই জিজ্ঞাসিত প্রশ্ন" : "Frequently asked questions"}
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-slate-600 sm:text-base">
            {language === "bn"
              ? "প্লট ক্রয়, ল্যান্ড শেয়ার বিনিয়োগ, এবং NRB লিগ্যাল সাপোর্ট নিয়ে গুরুত্বপূর্ণ প্রশ্নের উত্তর একসাথে।"
              : "Answers to the most common questions about plot buying, land-share investment, and NRB legal support."}
          </p>
        </div>
      </section>

      <section className="landing-section">
        <div className="landing-inner">
          <div className="landing-surface landing-surface--pad">
            <div className="mb-5 flex flex-wrap gap-2">
              {(
                [
                  { id: "plot", en: "Plot buying FAQ", bn: "প্লট ক্রয় FAQ" },
                  { id: "share", en: "Land share FAQ", bn: "ল্যান্ড শেয়ার FAQ" },
                  { id: "nrb", en: "NRB legal FAQ", bn: "NRB লিগ্যাল FAQ" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFaqTab(tab.id)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold sm:text-sm ${
                    faqTab === tab.id
                      ? "bg-[#0b1f44] text-white!"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {language === "bn" ? tab.bn : tab.en}
                </button>
              ))}
            </div>

            <div className="grid gap-4">
              {faqItems.map((item) => (
                <details
                  key={item.question}
                  className="group rounded-2xl border border-slate-200/95 bg-slate-50/40 px-5 py-4 shadow-[0_10px_26px_rgba(15,23,42,0.05)] transition hover:border-slate-300 hover:bg-white hover:shadow-[0_14px_30px_rgba(15,23,42,0.09)] sm:px-6 sm:py-5"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[0.95rem] leading-snug font-semibold text-slate-900 marker:content-[''] sm:text-base">
                    <span>{item.question}</span>
                    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-300 text-sm font-bold text-slate-500 transition group-open:rotate-45 group-open:border-[#f58e43] group-open:text-[#f58e43]">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 border-t border-slate-100 pt-3 whitespace-pre-line text-sm leading-7 text-slate-600">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/contact"
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#f58e43] px-5 text-sm font-semibold text-slate-950 hover:bg-[#ff9b4f]"
              >
                {language === "bn" ? "যোগাযোগ করুন" : "Contact support"}
              </Link>
              <Link
                to="/listings"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                {language === "bn" ? "সব লিস্টিং দেখুন" : "Browse listings"}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
