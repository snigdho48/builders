import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"

import { LandBookingFlow } from "@/components/land-booking-flow"
import { normalizeStoredRole } from "@/routes/protected-route"
import { getProperty } from "@/services/api"
import type { Property } from "@/types/domain"

/**
 * Reachable only via "Book now" on a property (not linked from the main nav).
 */
export function PropertyLandBookPage() {
  const { id = "" } = useParams()
  const navigate = useNavigate()
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(() => localStorage.getItem("accessToken"))
  const [role, setRole] = useState(() => normalizeStoredRole(localStorage.getItem("userRole")))

  const numericId = Number(id)
  const bookPath = `/properties/${id}/book`

  useEffect(() => {
    const sync = () => {
      setToken(localStorage.getItem("accessToken"))
      setRole(normalizeStoredRole(localStorage.getItem("userRole")))
    }
    window.addEventListener("auth-state-changed", sync)
    return () => window.removeEventListener("auth-state-changed", sync)
  }, [])

  useEffect(() => {
    if (!Number.isFinite(numericId) || numericId <= 0) {
      setProperty(null)
      setLoading(false)
      return
    }
    setLoading(true)
    getProperty(numericId)
      .then((p) => {
        setProperty(p)
      })
      .catch(() => {
        setProperty(null)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [numericId])

  const isInvestor = role === "investor"
  const isStaff = role === "admin" || role === "agent"
  const listingBookable =
    property != null && property.status === "available" && property.listing_active

  if (loading) {
    return (
      <main className="min-h-[50vh] bg-[#f6f7fb] px-4 py-16 text-slate-900">
        <div className="mx-auto max-w-lg text-center text-sm text-slate-600">Loading…</div>
      </main>
    )
  }

  if (property === null) {
    return (
      <main className="min-h-[50vh] bg-[#f6f7fb] px-4 py-16 text-slate-900">
        <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-slate-700">This listing could not be loaded.</p>
          <Link to="/listings/buy-plots" className="mt-4 inline-block font-semibold text-[#f58e43] hover:underline">
            Browse buy plots
          </Link>
        </div>
      </main>
    )
  }

  if (!listingBookable) {
    return (
      <main className="min-h-[50vh] bg-[#f6f7fb] px-4 py-16 text-slate-900">
        <div className="mx-auto max-w-lg space-y-4">
          <Link
            to={`/properties/${property.id}`}
            className="inline-block text-sm font-medium text-[#f58e43] hover:underline"
          >
            ← Back to property
          </Link>
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-slate-700">This land is not available for booking right now.</p>
            <Link
              to={`/properties/${property.id}`}
              className="mt-4 inline-block font-semibold text-[#f58e43] hover:underline"
            >
              View listing
            </Link>
          </div>
        </div>
      </main>
    )
  }

  if (!token) {
    return (
      <main className="min-h-[50vh] bg-[#f6f7fb] px-4 py-16 text-slate-900">
        <div className="mx-auto max-w-lg space-y-4">
          <Link
            to={`/properties/${property.id}`}
            className="inline-block text-sm font-medium text-[#f58e43] hover:underline"
          >
            ← Back to property
          </Link>
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="text-slate-700">Sign in to complete your booking.</p>
            <Link
              to={`/auth?next=${encodeURIComponent(bookPath)}`}
              className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-[#f58e43] px-4 py-3 font-semibold text-slate-950 hover:bg-[#ff9b4f]"
            >
              Sign in
            </Link>
          </div>
        </div>
      </main>
    )
  }

  if (!isInvestor && !isStaff) {
    return (
      <main className="min-h-[50vh] bg-[#f6f7fb] px-4 py-16 text-slate-900">
        <div className="mx-auto max-w-lg space-y-4">
          <Link
            to={`/properties/${property.id}`}
            className="inline-block text-sm font-medium text-[#f58e43] hover:underline"
          >
            ← Back to property
          </Link>
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-slate-700">Only investor, admin, or agent accounts can book land.</p>
            <Link
              to="/dashboard"
              className="mt-4 inline-block font-semibold text-[#f58e43] hover:underline"
            >
              Go to dashboard
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-[60vh] bg-[#f6f7fb] px-4 py-10 text-slate-900 sm:py-14">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div>
          <Link
            to={`/properties/${property.id}`}
            className="text-sm font-medium text-[#f58e43] hover:underline"
          >
            ← Back to property
          </Link>
          <h1 className="mt-3 text-2xl font-semibold text-[#0b1f44]">Complete your booking</h1>
          <p className="mt-1 text-sm text-slate-600">{property.title}</p>
        </div>
        <LandBookingFlow
          listing={property}
          allowStaffBookingForInvestor={isStaff}
          onSuccess={() =>
            navigate(
              isInvestor ? "/dashboard/investor/bookings" : role === "admin" ? "/dashboard/admin/bookings" : "/dashboard/agent/bookings",
              { replace: true },
            )
          }
        />
      </div>
    </main>
  )
}
