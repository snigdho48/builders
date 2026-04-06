import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"

import { useToast } from "@/components/ui/use-toast"
import { normalizeStoredRole } from "@/routes/protected-route"
import { getP2pListing, getP2pListingsPaged, submitP2pBid } from "@/services/api"
import type { P2PListing } from "@/types/domain"
import { formatBdtInteger } from "@/utils/currency"

export function P2pDetailPage() {
  const { id = "" } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const numericId = Number(id)
  const [listing, setListing] = useState<P2PListing | null>(null)
  const [loading, setLoading] = useState(true)
  const [related, setRelated] = useState<P2PListing[]>([])
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
    void getP2pListingsPaged({ page: 1, pageSize: 6 })
      .then((res) => {
        setRelated(res.items.filter((x) => x.id !== numericId).slice(0, 3))
      })
      .catch(() => setRelated([]))
  }, [numericId])

  const gallery = useMemo(() => (listing?.gallery_images ?? []).filter(Boolean), [listing])
  const mapUrl = useMemo(() => {
    if (!listing) return ""
    if (listing.latitude && listing.longitude) {
      return `https://www.google.com/maps?q=${listing.latitude},${listing.longitude}&z=14&output=embed`
    }
    return `https://www.google.com/maps?q=${encodeURIComponent(listing.location_name)}&z=13&output=embed`
  }, [listing])

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
    <main className="bg-[#f6f7fb] py-10 text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6">
          <Link to="/p2p" className="text-sm font-medium text-[#f58e43] hover:underline">
            ← P2P marketplace
          </Link>
          <h1 className="mt-3 text-3xl font-semibold text-[#0b1f44]">{listing.title}</h1>
          <p className="mt-2 text-sm text-slate-600">{listing.location_name}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-[#0b1f44] px-3 py-1 text-xs font-semibold text-white">
              P2P resale listing
            </span>
            <span className="rounded-full bg-[#fff3eb] px-3 py-1 text-xs font-semibold text-[#c55f1a]">
              {listing.bid_count ?? 0} pending bid{(listing.bid_count ?? 0) === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-4 py-10 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[1.5fr_0.9fr]">
          <div className="space-y-8">
            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_18px_45px_rgba(15,32,68,0.08)]">
              <div className="aspect-16/8 overflow-hidden rounded-2xl bg-slate-100">
                {listing.hero_image ? (
                  <img src={listing.hero_image} alt={listing.title} className="h-full w-full object-cover" />
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
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-8">
              <h3 className="mb-4 text-2xl font-semibold text-[#0b1f44]">Description</h3>
              <p className="whitespace-pre-wrap text-sm leading-8 text-slate-600">{listing.description}</p>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-8">
              <h4 className="mb-5 text-xl font-semibold text-[#0b1f44]">Overview</h4>
              <dl className="grid gap-y-3 text-sm sm:grid-cols-2">
                <div className="flex justify-between border-b border-slate-100 py-2 pr-5">
                  <dt className="text-slate-500">Listing ID</dt>
                  <dd className="font-medium text-slate-900">#{String(listing.id).padStart(4, "0")}</dd>
                </div>
                <div className="flex justify-between border-b border-slate-100 py-2 pl-0 sm:pl-5">
                  <dt className="text-slate-500">Listing type</dt>
                  <dd className="font-medium text-slate-900">Peer-to-peer</dd>
                </div>
                <div className="flex justify-between border-b border-slate-100 py-2 pr-5">
                  <dt className="text-slate-500">Guide price</dt>
                  <dd className="font-semibold text-[#0b1f44]">
                    {listing.asking_price_hint ? formatBdtInteger(listing.asking_price_hint) : "Not specified"}
                  </dd>
                </div>
                <div className="flex justify-between border-b border-slate-100 py-2 pl-0 sm:pl-5">
                  <dt className="text-slate-500">Land size</dt>
                  <dd className="font-medium text-slate-900">
                    {listing.land_area_sqft ? `${listing.land_area_sqft.toLocaleString()} sqft` : "Not specified"}
                  </dd>
                </div>
                <div className="flex justify-between border-b border-slate-100 py-2 pr-5 sm:col-span-2">
                  <dt className="text-slate-500">Location</dt>
                  <dd className="font-medium text-slate-900">{listing.location_name}</dd>
                </div>
                <div className="flex justify-between border-b border-slate-100 py-2 pr-5">
                  <dt className="text-slate-500">Published</dt>
                  <dd className="font-medium text-slate-900">{new Date(listing.created_at).toLocaleDateString()}</dd>
                </div>
                <div className="flex justify-between border-b border-slate-100 py-2 pl-0 sm:pl-5">
                  <dt className="text-slate-500">Last updated</dt>
                  <dd className="font-medium text-slate-900">{new Date(listing.updated_at).toLocaleDateString()}</dd>
                </div>
              </dl>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-8">
              <h4 className="mb-5 text-xl font-semibold text-[#0b1f44]">Location</h4>
              <iframe title="P2P listing location" src={mapUrl} className="h-[320px] w-full rounded-2xl border border-slate-200" loading="lazy" />
              <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                <p className="text-slate-600">{listing.location_name}</p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(listing.location_name)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-[#f58e43] hover:underline"
                >
                  Open in Google Maps
                </a>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-8">
              <h4 className="mb-5 text-xl font-semibold text-[#0b1f44]">Features</h4>
              {listing.features.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {listing.features.map((f) => (
                    <span key={f} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700">
                      {f}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No features were provided for this listing yet.</p>
              )}
            </section>

            {related.length > 0 ? (
              <section className="rounded-3xl border border-slate-200 bg-white p-8">
                <h3 className="mb-5 text-2xl font-semibold text-[#0b1f44]">Related P2P Listings</h3>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {related.map((item) => (
                    <article key={item.id} className="overflow-hidden rounded-2xl border border-slate-200">
                      <img src={item.hero_image || "https://placehold.co/400x180"} alt={item.title} className="h-36 w-full object-cover" />
                      <div className="space-y-2 p-3">
                        <h4 className="line-clamp-1 text-sm font-semibold text-[#0b1f44]">{item.title}</h4>
                        <p className="line-clamp-1 text-xs text-slate-500">{item.location_name}</p>
                        <p className="text-xs font-semibold text-[#f58e43]">
                          {item.asking_price_hint ? formatBdtInteger(item.asking_price_hint) : "Guide price on request"}
                        </p>
                        <Link to={`/p2p/${item.id}`} className="text-xs font-semibold text-[#0b1f44] hover:underline">
                          View details
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <aside className="space-y-7">
            <section className="rounded-3xl border border-slate-200 bg-white p-6">
              <h3 className="text-xl font-semibold text-[#0b1f44]">Quick facts</h3>
              <div className="mt-4 grid gap-3 text-sm text-slate-700">
                <div className="rounded-xl bg-slate-50 px-3 py-2">
                  <p className="text-xs text-slate-500">Guide price</p>
                  <p className="font-semibold text-[#0b1f44]">
                    {listing.asking_price_hint ? formatBdtInteger(listing.asking_price_hint) : "Not specified"}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 px-3 py-2">
                  <p className="text-xs text-slate-500">Approx. area</p>
                  <p className="font-semibold text-[#0b1f44]">
                    {listing.land_area_sqft ? `${listing.land_area_sqft.toLocaleString()} sqft` : "Not specified"}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 px-3 py-2">
                  <p className="text-xs text-slate-500">Current pending bids</p>
                  <p className="font-semibold text-[#0b1f44]">{listing.bid_count ?? 0}</p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6">
              <h3 className="text-xl font-semibold text-[#0b1f44]">Seller contact</h3>
              <div className="mt-4 space-y-2 text-sm text-slate-700">
                <p>
                  <span className="text-slate-500">Email: </span>
                  {listing.contact_email || "Not specified"}
                </p>
                <p>
                  <span className="text-slate-500">Phone: </span>
                  {listing.contact_phone || "Not specified"}
                </p>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-[#0b1f44]">Place a bid</h2>
              {isOwn ? (
                <p className="mt-2 text-sm text-slate-500">This is your listing. Manage it from your investor dashboard.</p>
              ) : !isInvestor && token ? (
                <p className="mt-2 text-sm text-slate-500">Only investor accounts can place bids on P2P listings.</p>
              ) : (
                <>
                  <p className="mt-2 text-xs text-slate-500">
                    Your profile email and phone are shared with the seller so they can follow up.
                  </p>
                  <label className="mt-4 block text-xs font-medium text-slate-600" htmlFor="bid-price">
                    Your offer (amount)
                  </label>
                  <input
                    id="bid-price"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900"
                    inputMode="decimal"
                    value={bidPrice}
                    onChange={(e) => setBidPrice(e.target.value)}
                    placeholder="e.g. 125000"
                  />
                  <label className="mt-3 block text-xs font-medium text-slate-600" htmlFor="bid-msg">
                    Message (optional)
                  </label>
                  <textarea
                    id="bid-msg"
                    className="mt-1 min-h-[88px] w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                    value={bidMessage}
                    onChange={(e) => setBidMessage(e.target.value)}
                    placeholder="Financing, timeline, questions…"
                  />
                  <button
                    type="button"
                    disabled={bidBusy}
                    onClick={() => void sendBid()}
                    className="mt-4 w-full rounded-xl bg-[#f58e43] py-3 font-semibold text-slate-950 hover:bg-[#ff9b4f] disabled:opacity-50"
                  >
                    {!token ? "Sign in to bid" : bidBusy ? "Sending…" : "Submit bid"}
                  </button>
                </>
              )}
            </section>
          </aside>
        </div>
      </section>
    </main>
  )
}
