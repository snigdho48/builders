import { useMemo, useState } from "react"
import { Link } from "react-router-dom"

import {
  eurostarFaqLandShare,
  eurostarFaqNrbLegal,
  eurostarFaqPlotBuy,
} from "@/content/eurostar-faq-content"
import { useLanguage } from "@/i18n/language-context"

type FaqTab = "plot" | "share" | "nrb"
type FaqPageLang = "en" | "bn"

export function FaqPage() {
  const { language: siteLanguage } = useLanguage()
  const [faqTab, setFaqTab] = useState<FaqTab>("plot")
  /** FAQ copy only — does not change site language or Google Translate. */
  const [faqLang, setFaqLang] = useState<FaqPageLang>(() => (siteLanguage === "bn" ? "bn" : "en"))

  const isBn = faqLang === "bn"

  const faqItems = useMemo(() => {
    const source =
      faqTab === "plot"
        ? eurostarFaqPlotBuy
        : faqTab === "share"
          ? eurostarFaqLandShare
          : eurostarFaqNrbLegal
    return source.map((row) => ({
      question: isBn ? row.questionBn : row.question,
      answer: isBn ? row.answerBn : row.answer,
    }))
  }, [faqTab, isBn])

  return (
    <main
      className="notranslate bg-[#f6f7fb] text-slate-900"
      translate="no"
      lang={faqLang === "bn" ? "bn" : "en"}
    >
      <section className="border-b border-slate-200/70 bg-white">
        <div className="landing-inner py-8 sm:py-12">
          <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#f58e43]">FAQ</p>
          <p className="sr-only">
            {isBn ? "এই পেজের ভাষা: শুধু এই FAQ পেজের জন্য।" : "This page language: FAQ content only."}
          </p>
          <h1 className="mt-3 text-[1.65rem] font-bold leading-tight tracking-tight text-slate-900 sm:mt-4 sm:text-[2.2rem]">
            {isBn ? "প্রায়শই জিজ্ঞাসিত প্রশ্ন" : "Frequently asked questions"}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
            {isBn
              ? "প্লট ক্রয়, ল্যান্ড শেয়ার বিনিয়োগ, এবং NRB লিগ্যাল সাপোর্ট নিয়ে গুরুত্বপূর্ণ প্রশ্নের উত্তর একসাথে।"
              : "Answers to the most common questions about plot buying, land-share investment, and NRB legal support."}
          </p>
        </div>
      </section>

      <section className="landing-section">
        <div className="landing-inner">
          <div className="landing-surface landing-surface--pad">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-1 flex-wrap gap-2 sm:gap-2.5">
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
                    className={`inline-flex min-h-11 items-center rounded-full px-3.5 py-2 text-xs font-semibold sm:min-h-10 sm:px-4 sm:text-sm ${
                      faqTab === tab.id
                        ? "bg-[#0b1f44] text-white!"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {isBn ? tab.bn : tab.en}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setFaqLang(isBn ? "en" : "bn")}
                className="inline-flex shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-2 text-center text-[0.75rem] font-bold leading-tight text-[#0b1f44] shadow-sm ring-1 ring-slate-200/80 transition hover:bg-slate-50 hover:ring-[#f58e43]/40 sm:min-h-10 sm:px-4 sm:py-2.5 sm:text-sm"
                aria-label={isBn ? "See FAQ in English" : "FAQ বাংলায় দেখুন"}
              >
                {isBn ? "See in English" : "বাংলায় দেখুন"}
              </button>
            </div>

            <div className="grid gap-4">
              {faqItems.map((item) => (
                <details
                  key={item.question}
                  className="group rounded-2xl border border-slate-200/95 bg-slate-50/40 px-5 py-4 shadow-[0_10px_26px_rgba(15,23,42,0.05)] transition hover:border-slate-300 hover:bg-white hover:shadow-[0_14px_30px_rgba(15,23,42,0.09)] sm:px-6 sm:py-5"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[0.95rem] leading-snug font-bold text-[#0b1f44] marker:content-[''] sm:text-base sm:leading-snug">
                    <span>{item.question}</span>
                    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-300 text-sm font-bold text-slate-500 transition group-open:rotate-45 group-open:border-[#f58e43] group-open:text-[#f58e43]">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 border-t border-slate-100 pt-3 whitespace-pre-line text-sm leading-7 font-medium text-slate-700">
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
                {isBn ? "যোগাযোগ করুন" : "Contact support"}
              </Link>
              <Link
                to="/listings"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                {isBn ? "সব লিস্টিং দেখুন" : "Browse listings"}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
