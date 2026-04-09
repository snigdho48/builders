import { useCallback, useEffect, useState } from "react"
import { Link } from "react-router-dom"

import { useToast } from "@/components/ui/use-toast"
import { listMyP2pListings, listP2pBidsIncoming } from "@/services/api"

export function InvestorP2pHomePage() {
  const { showToast } = useToast()
  const [listingCount, setListingCount] = useState<number | null>(null)
  const [offerCount, setOfferCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const token = localStorage.getItem("accessToken")
    if (!token) return
    setLoading(true)
    try {
      const [listings, offers] = await Promise.all([
        listMyP2pListings(token),
        listP2pBidsIncoming(token),
      ])
      setListingCount(listings.length)
      setOfferCount(offers.length)
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to load P2P summary", "error")
      setListingCount(0)
      setOfferCount(0)
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Overview</h2>
        <p className="mt-1 text-sm text-slate-600">
          Quick snapshot of your P2P activity. Use the sidebar to switch sections.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          to="/dashboard/investor-p2p/listings"
          className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-[#f58e43]/40 hover:shadow-md"
        >
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">My listings</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-900">
            {loading ? "—" : listingCount}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Create, edit, or withdraw your P2P land resale posts.
          </p>
          <span className="mt-4 inline-flex text-sm font-semibold text-[#f58e43] group-hover:underline">
            Open listings →
          </span>
        </Link>
        <Link
          to="/dashboard/investor-p2p/offers"
          className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-[#f58e43]/40 hover:shadow-md"
        >
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Incoming offers</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-900">
            {loading ? "—" : offerCount}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Accept or decline bids buyers sent on your listings.
          </p>
          <span className="mt-4 inline-flex text-sm font-semibold text-[#f58e43] group-hover:underline">
            Review offers →
          </span>
        </Link>
      </div>
      <p className="text-sm text-slate-500">
        Public listings from all sellers are on the{" "}
        <Link to="/p2p" className="font-semibold text-[#f58e43] hover:underline">
          P2P marketplace
        </Link>
        .
      </p>
    </section>
  )
}
