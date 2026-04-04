import { useCallback, useEffect, useState } from "react"

import {
  approveInvestmentCheckoutRequest,
  cancelInvestmentCheckoutRequest,
  listInvestmentCheckoutRequests,
  rejectInvestmentCheckoutRequest,
} from "@/services/api"
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons"

import { TableActionIconButton } from "@/components/ui/table-action-button"
import { actionsButtonRowClass } from "@/components/ui/sticky-table-actions"
import { cn } from "@/lib/utils"
import type { InvestmentCheckoutRequest, PropertyChannel } from "@/types/domain"

type Variant = "investor" | "agent" | "representative" | "admin"

const selectClass =
  "min-w-[7.5rem] h-9 rounded-md border border-white/15 bg-[#152a45]/95 px-2 text-xs text-white outline-none focus:border-[#f58e43]/50"

function formatWindowCell(r: InvestmentCheckoutRequest): string {
  const s = r.property_investment_window_start
  const e = r.property_investment_window_end
  if (!s && !e) {
    return "—"
  }
  const short = (iso: string) => {
    try {
      return new Date(iso).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return iso.slice(0, 16)
    }
  }
  if (s && e) {
    return `${short(s)} → ${short(e)}`
  }
  if (s) {
    return `From ${short(s)}`
  }
  return `Until ${short(e!)}`
}

function channelLabel(c?: PropertyChannel): string {
  if (c === "installment") {
    return "Installment"
  }
  if (c === "plot_buy") {
    return "Plot buy"
  }
  return "—"
}

export type InvestmentCheckoutRequestsSectionProps = {
  variant: Variant
  /** Parent page supplies the subsection heading; only the card + reset row (no duplicate title). */
  hideSectionTitle?: boolean
  className?: string
}

export function InvestmentCheckoutRequestsSection({
  variant,
  hideSectionTitle,
  className,
}: InvestmentCheckoutRequestsSectionProps) {
  const [rows, setRows] = useState<InvestmentCheckoutRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<number | null>(null)

  const [searchInput, setSearchInput] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [windowFilter, setWindowFilter] = useState<string>("all")
  const [listingFilter, setListingFilter] = useState<string>("all")
  const [channelFilter, setChannelFilter] = useState<string>("all")

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), 350)
    return () => window.clearTimeout(t)
  }, [searchInput])

  const load = useCallback(async () => {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      return
    }
    setLoading(true)
    try {
      const list = await listInvestmentCheckoutRequests(token, {
        pageSize: 200,
        search: debouncedSearch || undefined,
        status: statusFilter as "all" | InvestmentCheckoutRequest["status"],
        investmentType: typeFilter as "all" | InvestmentCheckoutRequest["investment_type"],
        window: windowFilter as "all" | "running" | "expired" | "upcoming" | "no_window",
        listingActive: listingFilter as "all" | "true" | "false",
        propertyChannel: channelFilter as "all" | PropertyChannel,
      })
      setRows(list)
    } catch {
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, statusFilter, typeFilter, windowFilter, listingFilter, channelFilter])

  useEffect(() => {
    void load()
  }, [load])

  async function run(
    id: number,
    fn: (id: number, token: string, reason?: string) => Promise<unknown>,
    reason?: string
  ) {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      return
    }
    setBusyId(id)
    try {
      await fn(id, token, reason)
      await load()
    } finally {
      setBusyId(null)
    }
  }

  function resetFilters() {
    setSearchInput("")
    setDebouncedSearch("")
    setStatusFilter("all")
    setTypeFilter("all")
    setWindowFilter("all")
    setListingFilter("all")
    setChannelFilter("all")
  }

  return (
    <section className={cn("mt-8 rounded-xl border border-white/10 bg-white/[0.03] p-5", className)}>
      {hideSectionTitle ? (
        <div className="flex justify-end border-b border-white/10 pb-3">
          <button
            type="button"
            onClick={resetFilters}
            className="text-[11px] font-medium text-slate-400 underline-offset-2 hover:text-white hover:underline"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
          <h3 className="text-lg font-semibold text-white">Investment checkout requests</h3>
          <button
            type="button"
            onClick={resetFilters}
            className="text-[11px] font-medium text-slate-400 underline-offset-2 hover:text-white hover:underline"
          >
            Reset filters
          </button>
        </div>
      )}

      <div className="dashboard-filters-row mt-4">
        <label className="dashboard-filter-group min-w-[220px] flex-1">
          <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Search</span>
          <input
            type="search"
            placeholder="Property, investor…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="dashboard-filter-input"
          />
        </label>
        <label className="dashboard-filter-group">
          <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Status</span>
          <select
            className={selectClass}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>
        <label className="dashboard-filter-group">
          <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Investment type</span>
          <select
            className={selectClass}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="plot_buy">Plot buy</option>
            <option value="installment">Installment</option>
          </select>
        </label>
        <label className="dashboard-filter-group">
          <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Property window</span>
          <select
            className={selectClass}
            value={windowFilter}
            onChange={(e) => setWindowFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="running">Running</option>
            <option value="upcoming">Upcoming</option>
            <option value="expired">Expired</option>
            <option value="no_window">No window set</option>
          </select>
        </label>
        <label className="dashboard-filter-group">
          <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Listing</span>
          <select
            className={selectClass}
            value={listingFilter}
            onChange={(e) => setListingFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="true">Active listing</option>
            <option value="false">Inactive listing</option>
          </select>
        </label>
        <label className="dashboard-filter-group">
          <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Channel</span>
          <select
            className={selectClass}
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="plot_buy">Plot buy</option>
            <option value="installment">Installment</option>
          </select>
        </label>
      </div>
      {loading ? (
        <p className="mt-4 text-sm text-slate-500">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">No requests match your filters.</p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full min-w-[800px] border-collapse text-left text-[11px] text-slate-300 sm:text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.04] text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2">Property</th>
                {variant === "investor" ? null : <th className="px-3 py-2">Investor</th>}
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Channel</th>
                <th className="px-3 py-2">Window</th>
                <th className="px-3 py-2">Listing</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Agent</th>
                <th className="px-3 py-2">Reviewer</th>
                <th className="w-[1%] whitespace-nowrap px-2 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                  <td className="px-3 py-2 align-top font-medium text-white">
                    {r.property_title ?? `#${r.property}`}
                  </td>
                  {variant === "investor" ? null : (
                    <td className="px-3 py-2 align-top text-slate-400">
                      <span className="block">{r.investor_username ?? r.investor}</span>
                      {r.investor_email ? (
                        <span className="block text-[10px] text-slate-500">{r.investor_email}</span>
                      ) : null}
                    </td>
                  )}
                  <td className="px-3 py-2 align-top">
                    {r.investment_type}
                    <span className="block text-[10px] text-slate-500">
                      {r.duration_years} yr · {r.blocks_owned}b / {r.shares_owned}sh
                    </span>
                  </td>
                  <td className="px-3 py-2 align-top text-slate-400">{channelLabel(r.property_channel)}</td>
                  <td className="max-w-[200px] px-3 py-2 align-top text-[10px] leading-snug text-slate-400">
                    {formatWindowCell(r)}
                  </td>
                  <td className="px-3 py-2 align-top">
                    {r.property_listing_active === false ? (
                      <span className="text-amber-300/90">Inactive</span>
                    ) : (
                      <span className="text-emerald-300/90">Active</span>
                    )}
                  </td>
                  <td className="px-3 py-2 align-top">
                    <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] uppercase text-slate-300">
                      {r.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 align-top text-slate-400">
                    <span className="tabular-nums">{r.agent_approved ? "✓ Yes" : "—"}</span>
                  </td>
                  <td className="px-3 py-2 align-top text-slate-400">
                    <span className="tabular-nums">{r.representative_approved ? "✓ Yes" : "—"}</span>
                  </td>
                  <td className="w-[1%] whitespace-nowrap px-2 py-2 align-top">
                    <div className={cn(actionsButtonRowClass, "justify-end")}>
                      {variant === "investor" && r.status === "pending" ? (
                        <TableActionIconButton
                          icon={faXmark}
                          label="Cancel request"
                          tone="danger"
                          disabled={busyId === r.id}
                          onClick={() => void run(r.id, cancelInvestmentCheckoutRequest)}
                        />
                      ) : null}
                      {(variant === "agent" ||
                        variant === "representative" ||
                        variant === "admin") &&
                      r.status === "pending" ? (
                        <>
                          <TableActionIconButton
                            icon={faCheck}
                            label="Approve checkout request"
                            tone="accent"
                            disabled={busyId === r.id}
                            onClick={() => void run(r.id, approveInvestmentCheckoutRequest)}
                          />
                          <TableActionIconButton
                            icon={faXmark}
                            label="Reject checkout request"
                            tone="danger"
                            disabled={busyId === r.id}
                            onClick={() => {
                              const reason = window.prompt("Optional rejection reason:") ?? ""
                              void run(r.id, rejectInvestmentCheckoutRequest, reason || undefined)
                            }}
                          />
                        </>
                      ) : null}
                    </div>
                    {r.rejected_reason ? (
                      <p className="mt-1 max-w-[12rem] text-[10px] text-rose-300/90">{r.rejected_reason}</p>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
