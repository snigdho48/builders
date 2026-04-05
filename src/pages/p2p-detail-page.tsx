import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"

import { useToast } from "@/components/ui/use-toast"
import { normalizeStoredRole } from "@/routes/protected-route"
import { getP2pListing, submitP2pBid } from "@/services/api"
import type { P2PListing } from "@/types/domain"

export function P2pDetailPage() {
  const { id = "" } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const numericId = Number(id)
  const [listing, setListing] = useState<P2PListing | null>(null)
  const [loading, setLoading] = useState(true)
  const [bidPrice, setBidPrice] = useState("")
  const [bidMessage, setBidMessage] = useState("")
  const [bidBusy, setBidBusy] = useState(false)
  const token = localStorage.getItem("accessToken")
  const role = normalizeStoredRole(localStorage.getItem("userRole"))
  const isInvestor = role === "investor"
  const isOwn =
    listing != null && token && localStorage.getItem("userId") === String(listing.seller_id)

  useEffect(() => {
    if (!Number.isFinite(numericId) || numericId <= 0) {
      setListing(null)
      setLoading(false)
      return
    }
    setLoading(true)
    getP2pListing(numericId)
      .then(setListing)
      .catch(() => setListing(null))
      .finally(() => setLoading(false))
  }, [numericId])

  const gallery = useMemo(() => (listing?.gallery_images ?? []).filter(Boolean), [listing])

  async function sendBid() {
    if (!token || !isInvestor) {
      navigate(`/auth?next=${encodeURIComponent(`/p2p/${numericId}`)}`)
      return
    }
    const raw = bidPrice.replace(/,/g, "").trim()
    if (!raw || Number.isNaN(Number(raw)) || Number(raw) < 0.01) {
      showToast("Enter a valid bid amount.", "error")
      return
    }
    setBidBusy(true)
    try {
      await submitP2pBid(numericId, { bid_price: raw, message: bidMessage.trim() }, token)
      showToast("Your bid was submitted. The seller can contact you from your profile details.", "success")
      setBidPrice("")
      setBidMessage("")
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Bid failed", "error")
    } finally {
      setBidBusy(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-[50vh] bg-slate-950 px-4 py-16 text-slate-400">
        <div className="mx-auto max-w-3xl text-center text-sm">Loading…</div>
      </main>
    )
  }

  if (listing === null) {
    return (
      <main className="min-h-[50vh] bg-slate-950 px-4 py-16 text-white">
        <div className="mx-auto max-w-lg text-center">
          <p className="text-slate-400">This listing could not be loaded.</p>
          <Link to="/p2p" className="mt-4 inline-block font-semibold text-[#f58e43] hover:underline">
            Back to P2P
          </Link>
        </div>
      </main>
    )
  }

  if (listing.status !== "active") {
    return (
      <main className="min-h-[50vh] bg-slate-950 px-4 py-16 text-white">
        <div className="mx-auto max-w-lg text-center">
          <p className="text-slate-400">This listing is no longer active.</p>
          <Link to="/p2p" className="mt-4 inline-block font-semibold text-[#f58e43] hover:underline">
            Back to P2P
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-svh bg-slate-950 px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Link to="/p2p" className="text-sm font-medium text-[#f58e43] hover:underline">
          ← P2P marketplace
        </Link>
        <h1 className="mt-4 text-2xl font-semibold sm:text-3xl">{listing.title}</h1>
        <p className="mt-1 text-sm text-slate-400">{listing.location_name}</p>
        {listing.asking_price_hint ? (
          <p className="mt-2 text-lg font-medium text-[#f58e43]">Seller guide price: {listing.asking_price_hint}</p>
        ) : null}
        {listing.land_area_sqft ? (
          <p className="mt-1 text-sm text-slate-400">Approx. {listing.land_area_sqft.toLocaleString()} sq ft</p>
        ) : null}

        <div className="mt-6 aspect-video overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
          {listing.hero_image ? (
            <img src={listing.hero_image} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-500">No image</div>
          )}
        </div>

        {gallery.length > 0 ? (
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {gallery.map((url) => (
              <a key={url} href={url} target="_blank" rel="noreferrer" className="aspect-video overflow-hidden rounded-lg">
                <img src={url} alt="" className="h-full w-full object-cover hover:opacity-90" />
              </a>
            ))}
          </div>
        ) : null}

        <div className="mt-8 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">{listing.description}</div>

        <section className="mt-10 rounded-2xl border border-white/10 bg-slate-900/70 p-6">
          <h2 className="text-lg font-semibold text-white">Place a bid</h2>
          {isOwn ? (
            <p className="mt-2 text-sm text-slate-400">This is your listing. Manage it from your investor dashboard.</p>
          ) : !isInvestor && token ? (
            <p className="mt-2 text-sm text-slate-400">Only investor accounts can place bids on P2P listings.</p>
          ) : (
            <>
              <p className="mt-2 text-xs text-slate-500">
                Your profile email and phone are shared with the seller so they can follow up.
              </p>
              <label className="mt-4 block text-xs font-medium text-slate-400" htmlFor="bid-price">
                Your offer (amount)
              </label>
              <input
                id="bid-price"
                className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-white"
                inputMode="decimal"
                value={bidPrice}
                onChange={(e) => setBidPrice(e.target.value)}
                placeholder="e.g. 125000"
              />
              <label className="mt-3 block text-xs font-medium text-slate-400" htmlFor="bid-msg">
                Message (optional)
              </label>
              <textarea
                id="bid-msg"
                className="mt-1 min-h-[88px] w-full resize-y rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white"
                value={bidMessage}
                onChange={(e) => setBidMessage(e.target.value)}
                placeholder="Financing, timeline, questions…"
              />
              <button
                type="button"
                disabled={bidBusy}
                onClick={() => void sendBid()}
                className="mt-4 w-full rounded-xl bg-[#f58e43] py-3 font-semibold text-slate-950 hover:bg-[#ff9b4f] disabled:opacity-50 sm:w-auto sm:px-8"
              >
                {!token ? "Sign in to bid" : bidBusy ? "Sending…" : "Submit bid"}
              </button>
            </>
          )}
        </section>
      </div>
    </main>
  )
}
