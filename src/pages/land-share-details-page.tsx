import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"

import { useToast } from "@/components/ui/use-toast"
import { normalizeStoredRole } from "@/routes/protected-route"
import { getLandShareListing } from "@/services/api"
import type { LandShareListing } from "@/types/domain"
import { formatBdtInteger } from "@/utils/currency"
import { sanitizePropertyHtml } from "@/utils/html-sanitize"
import { propertySaleChannelBadgeClass, propertySaleChannelLabel } from "@/utils/property-display"

function billingLabel(p: string): string {
  if (p === "yearly") return "per year"
  if (p === "one_time") return "one-time"
  return "per month"
}

export function LandShareDetailsPage() {
  const { id = "" } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [listing, setListing] = useState<LandShareListing | null>(null)
  const [userRole, setUserRole] = useState<string | null>(() => localStorage.getItem("userRole"))
  const [sessionActive, setSessionActive] = useState(() => Boolean(localStorage.getItem("accessToken")))

  const isInvestor = normalizeStoredRole(userRole) === "investor"

  useEffect(() => {
    const n = Number(id)
    if (!Number.isFinite(n) || n <= 0) {
      setListing(null)
      return
    }
    getLandShareListing(n).then(setListing).catch(() => setListing(null))
  }, [id])

  useEffect(() => {
    const syncRole = () => {
      setUserRole(localStorage.getItem("userRole"))
      setSessionActive(Boolean(localStorage.getItem("accessToken")))
    }
    window.addEventListener("auth-state-changed", syncRole)
    return () => window.removeEventListener("auth-state-changed", syncRole)
  }, [])

  const galleryImages = useMemo(() => {
    if (!listing) return [] as string[]
    const main = listing.top_view_image ? [listing.top_view_image] : []
    const extra = (listing.gallery_images ?? []).filter(Boolean)
    const merged = [...main, ...extra]
    return merged.length ? merged : []
  }, [listing])

  function openBook() {
    if (!listing || listing.status !== "available" || !listing.listing_active) {
      showToast("This listing is not available for booking.", "error")
      return
    }
    navigate(`/land-share-listings/${listing.id}/book`)
  }

  if (!listing) {
    return (
      <main className="min-h-[50vh] bg-[#f4f6fb] px-4 py-20 text-slate-600">
        <div className="mx-auto max-w-2xl text-center">
          {Number(id) > 0 ? "Loading…" : "Listing not found."}
        </div>
      </main>
    )
  }

  const primary = sanitizePropertyHtml(listing.description || "")
  const secondary = sanitizePropertyHtml(listing.description_secondary || "")

  return (
    <main className="bg-[#f4f6fb] px-4 py-10 text-slate-900 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link to="/listings/buy-land-share" className="text-sm font-medium text-[#f58e43] hover:underline">
              ← Land share listings
            </Link>
            <h1 className="mt-3 text-2xl font-semibold text-[#0b1f44] sm:text-3xl">{listing.title}</h1>
            <p className="mt-2 text-slate-600">{listing.location_name}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${propertySaleChannelBadgeClass(listing)}`}
            >
              {propertySaleChannelLabel(listing)}
            </span>
            <p className="text-lg font-semibold text-[#f58e43]">{formatBdtInteger(listing.land_price)}</p>
          </div>
        </div>

        {galleryImages.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <img src={galleryImages[0]} alt="" className="max-h-[420px] w-full object-cover" />
          </div>
        ) : null}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#0b1f44]">Payment options</h2>
          <p className="mt-1 text-sm text-slate-600">
            Choose one of these tiers when you book. Amounts and billing periods are set by the listing agent or admin.
          </p>
          {listing.payment_options.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No payment tiers configured yet. Contact the agent for terms.</p>
          ) : (
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {listing.payment_options.map((t, i) => (
                <li key={`${t.amount}-${t.billing_period}-${i}`} className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                  <p className="text-base font-semibold text-[#f58e43]">{formatBdtInteger(t.amount)}</p>
                  <p className="text-sm text-slate-600">{billingLabel(t.billing_period)}</p>
                  {t.commitment_months != null ? (
                    <p className="mt-1 text-xs text-slate-500">Minimum commitment: {t.commitment_months} months</p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#0b1f44]">About</h2>
          {primary ? (
            <div className="prose prose-slate mt-3 max-w-none text-sm" dangerouslySetInnerHTML={{ __html: primary }} />
          ) : null}
          {secondary ? (
            <div
              className="prose prose-slate mt-4 max-w-none text-sm text-slate-600"
              dangerouslySetInnerHTML={{ __html: secondary }}
            />
          ) : null}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#0b1f44]">Book this land share</h2>
          <p className="mt-2 text-sm text-slate-600">
            Investment-style booking: staff will review your request after you submit your details.
          </p>
          <button
            type="button"
            onClick={openBook}
            className="mt-4 w-full rounded-xl bg-[#f58e43] px-4 py-3 font-semibold text-slate-950 transition hover:bg-[#ff9b4f] sm:w-auto"
          >
            Book now
          </button>
          {!sessionActive ? (
            <p className="mt-2 text-center text-xs text-slate-500 sm:text-left">
              <Link
                to={`/auth?next=${encodeURIComponent(`/land-share-listings/${listing.id}/book`)}`}
                className="font-semibold text-[#f58e43] hover:underline"
              >
                Sign in
              </Link>{" "}
              as an investor to book.
            </p>
          ) : !isInvestor ? (
            <p className="mt-2 text-xs text-slate-500">Only investor accounts can submit a booking.</p>
          ) : null}
        </section>
      </div>
    </main>
  )
}
