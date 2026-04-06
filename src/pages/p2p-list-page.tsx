import { useCallback, useEffect, useState } from "react"
import { Link } from "react-router-dom"

import { GridLoader } from "@/components/ui/grid-loader"
import { useLanguage } from "@/i18n/language-context"
import { getP2pListingsPaged } from "@/services/api"
import type { P2PListing } from "@/types/domain"

const PAGE_SIZE = 12

function formatHint(price: string | null): string {
  if (!price) return "বিক্রেতার সাথে কথা বলুন"
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
      Number(price),
    )
  } catch {
    return price
  }
}

export function P2pListPage() {
  const { language } = useLanguage()
  const [items, setItems] = useState<P2PListing[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(search), 320)
    return () => window.clearTimeout(t)
  }, [search])

  const load = useCallback(async (p: number, q: string) => {
    setLoading(true)
    try {
      const { items: rows, pagination } = await getP2pListingsPaged({
        page: p,
        pageSize: PAGE_SIZE,
        search: q || undefined,
      })
      setItems(rows)
      setTotalPages(Math.max(1, pagination?.total_pages ?? 1))
    } catch {
      setItems([])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load(page, debouncedSearch)
  }, [page, debouncedSearch, load])

  return (
    <main className="min-h-svh bg-white px-4 py-12 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold text-white">P2P marketplace</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            {language === "bn"
              ? "সদস্যদের দেওয়া জমি/সম্পত্তির রিসেল লিস্টিং। কোনো লিস্টিং খুলে বিড দিন; আপনার প্রোফাইলের যোগাযোগ তথ্য ব্যবহার করে বিক্রেতা যোগাযোগ করবে।"
              : "Land and property resales listed by members. Open a listing to place a bid; the seller can reach out using the contact details you provide on your account."}
          </p>
        </header>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="search"
            placeholder={language === "bn" ? "শিরোনাম, লোকেশন, বিবরণ দিয়ে খুঁজুন…" : "Search title, location, description…"}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-[#f58e43]/50 focus:outline-none focus:ring-1 focus:ring-[#f58e43]/40 sm:max-w-md"
          />
        </div>

        {loading ? (
          <GridLoader />
        ) : items.length === 0 ? (
          <p className="rounded-2xl border border-white/10 bg-slate-900/60 py-16 text-center text-slate-400">
            {language === "bn"
              ? "এখনও কোনো পিয়ার-টু-পিয়ার লিস্টিং নেই। বিনিয়োগকারীরা ড্যাশবোর্ড থেকে নতুন লিস্টিং যোগ করতে পারবেন।"
              : "No peer-to-peer listings yet. Investors can add one from the dashboard."}
          </p>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((x) => (
              <li key={x.id}>
                <Link
                  to={`/p2p/${x.id}`}
                  className="block overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 transition hover:border-[#f58e43]/40"
                >
                  <div className="aspect-16/10 bg-slate-800">
                    {x.hero_image ? (
                      <img src={x.hero_image} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-slate-500">
                        {language === "bn" ? "ছবি নেই" : "No image"}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h2 className="line-clamp-2 font-semibold text-white">{x.title}</h2>
                    <p className="mt-1 text-xs text-slate-400">{x.location_name}</p>
                    <p className="mt-2 text-sm font-medium text-[#f58e43]">
                      {language === "bn" ? "নির্দেশক মূল্য:" : "Guide:"} {formatHint(x.asking_price_hint)}
                    </p>
                    {x.bid_count != null && x.bid_count > 0 ? (
                      <p className="mt-1 text-xs text-slate-500">
                        {language === "bn" ? `${x.bid_count} টি সক্রিয় বিড` : `${x.bid_count} open bid(s)`}
                      </p>
                    ) : null}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {totalPages > 1 ? (
          <nav className="mt-8 flex justify-center gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-white/20 px-4 py-2 text-sm disabled:opacity-40"
            >
              {language === "bn" ? "আগের" : "Previous"}
            </button>
            <span className="flex items-center px-2 text-sm text-slate-400">
              {language === "bn" ? `পৃষ্ঠা ${page} / ${totalPages}` : `Page ${page} / ${totalPages}`}
            </span>
            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-white/20 px-4 py-2 text-sm disabled:opacity-40"
            >
              {language === "bn" ? "পরের" : "Next"}
            </button>
          </nav>
        ) : null}
      </div>
    </main>
  )
}
