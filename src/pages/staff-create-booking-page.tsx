import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

import { LandBookingFlow } from "@/components/land-booking-flow"
import { useToast } from "@/components/ui/use-toast"
import {
  createRetailInvestor,
  getLandShareListingsPaged,
  getPropertiesPaged,
  listRetailInvestors,
} from "@/services/api"
import { normalizeStoredRole } from "@/routes/protected-route"
import type { CatalogListing, LandShareListing, Property, RetailInvestor } from "@/types/domain"
import {
  isLandShareListing,
  landShareOpenForStaffBooking,
  propertyOpenForStaffBooking,
} from "@/utils/property-display"

type Phase = "select" | "book"

export function StaffCreateBookingPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [phase, setPhase] = useState<Phase>("select")
  const role = normalizeStoredRole(localStorage.getItem("userRole"))
  const isAgent = role === "agent"
  const bookingsPath = isAgent ? "/dashboard/agent/bookings" : "/dashboard/admin/bookings"

  const [investors, setInvestors] = useState<RetailInvestor[]>([])
  const [plotRows, setPlotRows] = useState<Property[]>([])
  const [landShareRows, setLandShareRows] = useState<LandShareListing[]>([])
  const [catalogLoading, setCatalogLoading] = useState(true)

  const [investorQuery, setInvestorQuery] = useState("")
  const [selectedInvestor, setSelectedInvestor] = useState<RetailInvestor | null>(null)

  const [listingTab, setListingTab] = useState<"plot" | "land_share">("plot")
  const [listingQuery, setListingQuery] = useState("")
  const [selectedListing, setSelectedListing] = useState<CatalogListing | null>(null)

  const [creatingInvestor, setCreatingInvestor] = useState(false)
  const [ciUsername, setCiUsername] = useState("")
  const [ciEmail, setCiEmail] = useState("")
  const [ciPassword, setCiPassword] = useState("")
  const [ciFirst, setCiFirst] = useState("")
  const [ciLast, setCiLast] = useState("")
  const [ciPhone, setCiPhone] = useState("")
  const [ciBusy, setCiBusy] = useState(false)

  const loadCatalog = useCallback(async () => {
    const token = localStorage.getItem("accessToken")
    if (!token) return
    setCatalogLoading(true)
    try {
      const [inv, plots, shares] = await Promise.all([
        listRetailInvestors(token),
        getPropertiesPaged({ pageSize: 200, managedByMe: isAgent, includeInactive: true }),
        getLandShareListingsPaged({ pageSize: 200, managedByMe: isAgent, includeInactive: true }),
      ])
      setInvestors(inv)
      setPlotRows(plots.items)
      setLandShareRows(shares.items)
    } catch {
      showToast("Failed to load investors or listings.", "error")
      setInvestors([])
      setPlotRows([])
      setLandShareRows([])
    } finally {
      setCatalogLoading(false)
    }
  }, [isAgent, showToast])

  useEffect(() => {
    void loadCatalog()
  }, [loadCatalog])

  const bookablePlots = useMemo(
    () => plotRows.filter((p) => propertyOpenForStaffBooking(p)),
    [plotRows],
  )
  const bookableLandShares = useMemo(
    () => landShareRows.filter((p) => landShareOpenForStaffBooking(p)),
    [landShareRows],
  )

  const filteredInvestors = useMemo(() => {
    const q = investorQuery.trim().toLowerCase()
    if (!q) return investors.slice(0, 80)
    return investors
      .filter((inv) => {
        const blob = [inv.username, inv.email, inv.first_name, inv.last_name, String(inv.id)]
          .join(" ")
          .toLowerCase()
        return blob.includes(q)
      })
      .slice(0, 80)
  }, [investors, investorQuery])

  const filteredListings = useMemo(() => {
    const pool = listingTab === "plot" ? bookablePlots : bookableLandShares
    const q = listingQuery.trim().toLowerCase()
    if (!q) return pool.slice(0, 60)
    return pool
      .filter((row) => {
        const blob = [row.title, row.location_name, String(row.id)].join(" ").toLowerCase()
        return blob.includes(q)
      })
      .slice(0, 60)
  }, [listingTab, bookablePlots, bookableLandShares, listingQuery])

  async function handleCreateInvestor() {
    const token = localStorage.getItem("accessToken")
    const username = ciUsername.trim()
    if (!token || !username || !ciEmail.trim() || !ciPassword.trim()) {
      showToast("Username, email, and temporary password are required.", "error")
      return
    }
    setCiBusy(true)
    try {
      await createRetailInvestor(
        {
          username,
          email: ciEmail.trim(),
          password: ciPassword.trim(),
          first_name: ciFirst.trim() || undefined,
          last_name: ciLast.trim() || undefined,
          phone: ciPhone.trim() || undefined,
          is_active: true,
        },
        token,
      )
      const rows = await listRetailInvestors(token)
      setInvestors(rows)
      const created =
        rows.find((r) => r.username.toLowerCase() === username.toLowerCase()) ??
        rows.find((r) => r.email.toLowerCase() === ciEmail.trim().toLowerCase()) ??
        null
      if (created) {
        setSelectedInvestor(created)
        setInvestorQuery(created.username)
        showToast("Investor created and selected.", "success")
      } else {
        showToast("Investor created. Search and select them in the list.", "success")
      }
      setCreatingInvestor(false)
      setCiUsername("")
      setCiEmail("")
      setCiPassword("")
      setCiFirst("")
      setCiLast("")
      setCiPhone("")
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to create investor", "error")
    } finally {
      setCiBusy(false)
    }
  }

  const canStart = selectedInvestor != null && selectedListing != null

  return (
    <section className="space-y-6 rounded-2xl border border-white/10 bg-slate-900/70 p-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">Create land booking</h2>
        <p className="mt-1 text-sm text-slate-400">
          {isAgent
            ? "Choose an investor and one of your assigned listings, then complete plan and contact details."
            : "Choose any investor and an available plot or land-share listing, then complete the booking flow."}
        </p>
      </div>

      {phase === "select" ? (
        <>
          {catalogLoading ? (
            <p className="text-slate-500">Loading investors and listings…</p>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.04] p-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">1. Investor</h3>
                <input
                  className="dashboard-filter-input w-full"
                  placeholder="Search by name, username, email, or ID…"
                  value={investorQuery}
                  onChange={(e) => setInvestorQuery(e.target.value)}
                  aria-label="Search investors"
                />
                <div className="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-white/10 bg-slate-950/40 p-1">
                  {filteredInvestors.length === 0 ? (
                    <p className="p-3 text-xs text-slate-500">No investors match.</p>
                  ) : (
                    filteredInvestors.map((inv) => (
                      <button
                        key={inv.id}
                        type="button"
                        onClick={() => {
                          setSelectedInvestor(inv)
                          setInvestorQuery(inv.username)
                        }}
                        className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                          selectedInvestor?.id === inv.id
                            ? "bg-[#f58e43]/25 text-white ring-1 ring-[#f58e43]/50"
                            : "text-slate-200 hover:bg-white/5"
                        }`}
                      >
                        <span className="font-semibold">{inv.username}</span>
                        <span className="ml-2 text-xs text-slate-400">{inv.email}</span>
                      </button>
                    ))
                  )}
                </div>
                <button
                  type="button"
                  className="text-xs font-semibold text-[#f58e43] hover:underline"
                  onClick={() => setCreatingInvestor((v) => !v)}
                >
                  {creatingInvestor ? "Cancel new investor" : "Register new investor"}
                </button>
                {creatingInvestor ? (
                  <div className="grid gap-2 rounded-lg border border-white/10 bg-slate-950/30 p-3 sm:grid-cols-2">
                    <input
                      className="dashboard-filter-input sm:col-span-2"
                      placeholder="Username *"
                      value={ciUsername}
                      onChange={(e) => setCiUsername(e.target.value)}
                    />
                    <input
                      className="dashboard-filter-input sm:col-span-2"
                      placeholder="Email *"
                      type="email"
                      value={ciEmail}
                      onChange={(e) => setCiEmail(e.target.value)}
                    />
                    <input
                      className="dashboard-filter-input sm:col-span-2"
                      placeholder="Temporary password *"
                      value={ciPassword}
                      onChange={(e) => setCiPassword(e.target.value)}
                    />
                    <input
                      className="dashboard-filter-input"
                      placeholder="First name"
                      value={ciFirst}
                      onChange={(e) => setCiFirst(e.target.value)}
                    />
                    <input
                      className="dashboard-filter-input"
                      placeholder="Last name"
                      value={ciLast}
                      onChange={(e) => setCiLast(e.target.value)}
                    />
                    <input
                      className="dashboard-filter-input sm:col-span-2"
                      placeholder="Phone"
                      value={ciPhone}
                      onChange={(e) => setCiPhone(e.target.value)}
                    />
                    <button
                      type="button"
                      disabled={ciBusy}
                      onClick={() => void handleCreateInvestor()}
                      className="rounded-lg bg-[#f58e43] px-3 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50 sm:col-span-2"
                    >
                      {ciBusy ? "Creating…" : "Create investor"}
                    </button>
                  </div>
                ) : null}
              </div>

              <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.04] p-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">2. Listing</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setListingTab("plot")
                      setSelectedListing(null)
                    }}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                      listingTab === "plot" ? "bg-[#f58e43] text-slate-950" : "bg-white/10 text-slate-300"
                    }`}
                  >
                    Plot listings ({bookablePlots.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setListingTab("land_share")
                      setSelectedListing(null)
                    }}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                      listingTab === "land_share" ? "bg-[#f58e43] text-slate-950" : "bg-white/10 text-slate-300"
                    }`}
                  >
                    Land share ({bookableLandShares.length})
                  </button>
                </div>
                <input
                  className="dashboard-filter-input w-full"
                  placeholder="Search title, location, or ID…"
                  value={listingQuery}
                  onChange={(e) => setListingQuery(e.target.value)}
                  aria-label="Search listings"
                />
                <div className="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-white/10 bg-slate-950/40 p-1">
                  {filteredListings.length === 0 ? (
                    <p className="p-3 text-xs text-slate-500">
                      No bookable {listingTab === "plot" ? "plots" : "land share listings"}.
                      {listingTab === "plot" ? " Listings must be active and available." : ""}
                    </p>
                  ) : (
                    filteredListings.map((row) => (
                      <button
                        key={`${isLandShareListing(row) ? "ls" : "p"}-${row.id}`}
                        type="button"
                        onClick={() => setSelectedListing(row)}
                        className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                          selectedListing != null &&
                          selectedListing.id === row.id &&
                          isLandShareListing(selectedListing) === isLandShareListing(row)
                            ? "bg-[#f58e43]/25 text-white ring-1 ring-[#f58e43]/50"
                            : "text-slate-200 hover:bg-white/5"
                        }`}
                      >
                        <span className="font-semibold line-clamp-1">{row.title}</span>
                        <span className="mt-0.5 block text-xs text-slate-400">
                          #{row.id} · {row.location_name}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={!canStart}
              onClick={() => setPhase("book")}
              className="rounded-full bg-[#f58e43] px-6 py-2.5 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue to booking details
            </button>
            {!canStart ? (
              <span className="text-xs text-slate-500">Select an investor and a listing first.</span>
            ) : null}
          </div>
        </>
      ) : (
        <>
          {selectedInvestor && selectedListing ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-200">
                <div>
                  <span className="text-slate-500">Investor:</span>{" "}
                  <span className="font-semibold text-white">{selectedInvestor.username}</span>
                  <span className="mx-2 text-slate-600">·</span>
                  <span className="text-slate-500">Listing:</span>{" "}
                  <span className="font-semibold text-white">{selectedListing.title}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPhase("select")}
                  className="text-xs font-semibold text-[#f58e43] hover:underline"
                >
                  ← Change investor or listing
                </button>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-[#f6f7fb] p-4 sm:p-6">
                <LandBookingFlow
                  key={`${isLandShareListing(selectedListing) ? "ls" : "p"}-${selectedListing.id}-${selectedInvestor.id}`}
                  listing={selectedListing}
                  allowStaffBookingForInvestor
                  prefilledInvestor={selectedInvestor}
                  onSuccess={() => navigate(bookingsPath, { replace: true })}
                />
              </div>
            </div>
          ) : null}
        </>
      )}
    </section>
  )
}
