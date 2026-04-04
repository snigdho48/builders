import { useCallback, useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"

import { InvestmentCheckoutRequestsSection } from "@/components/dashboard/investment-checkout-requests-section"
import {
  actionsButtonRowClass,
  stickyActionsTdInvestorClass,
  stickyActionsThInvestorClass,
} from "@/components/ui/sticky-table-actions"
import { faArrowUpRightFromSquare, faHandHoldingDollar, faSpinner } from "@fortawesome/free-solid-svg-icons"

import { TableActionIconButton, TableActionIconLink } from "@/components/ui/table-action-button"
import { cn } from "@/lib/utils"
import { DashboardTablePagination } from "@/components/ui/dashboard-table-pagination"
import { TableLoader } from "@/components/ui/table-loader"
import { useToast } from "@/components/ui/use-toast"
import { createRedemptionRequest, listInvestments } from "@/services/api"
import type { Investment, InvestmentListFilters, InvestmentType } from "@/types/domain"
import { formatBdtAmount } from "@/utils/currency"
import {
  investmentDurationCell,
  investmentLifecycle,
  investmentLifecycleLabel,
  investmentTypeLabel,
  unitsLabel,
} from "@/utils/investor-display"

const selectClass =
  "min-w-[7.5rem] rounded-md border border-white/15 bg-[#152a45]/95 px-2 py-1.5 text-[11px] text-white outline-none focus:border-[#f58e43]/50"

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—"
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString()
}

function installmentProgress(inv: Investment): string {
  const list = inv.installments ?? []
  if (!list.length) return "—"
  const paid = list.filter((i) => i.status === "paid").length
  const overdue = list.filter((i) => i.status === "overdue").length
  return overdue > 0 ? `${paid}/${list.length} paid · ${overdue} overdue` : `${paid}/${list.length} paid`
}

function lifecycleBadgeClass(phase: ReturnType<typeof investmentLifecycle>): string {
  switch (phase) {
    case "running":
      return "bg-emerald-500/20 text-emerald-300"
    case "due":
      return "bg-amber-500/20 text-amber-200"
    case "expired":
      return "bg-rose-500/15 text-rose-200"
    case "complete":
      return "bg-slate-500/25 text-slate-300"
    default:
      return "bg-white/10 text-slate-300"
  }
}

export function InvestorInvestmentsPage() {
  const { showToast } = useToast()
  const [rows, setRows] = useState<Investment[]>([])
  const [loading, setLoading] = useState(true)
  const [busyRedeemId, setBusyRedeemId] = useState<number | null>(null)
  const [searchInput, setSearchInput] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [lifecycleFilter, setLifecycleFilter] = useState<InvestmentListFilters["lifecycle"]>("all")
  const [typeFilter, setTypeFilter] = useState<InvestmentType | "all">("all")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

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
      const list = await listInvestments(token, {
        pageSize: 200,
        search: debouncedSearch || undefined,
        lifecycle: lifecycleFilter,
        investmentType: typeFilter,
      })
      setRows(list)
    } catch {
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, lifecycleFilter, typeFilter])

  useEffect(() => {
    void load()
  }, [load])

  const sorted = useMemo(
    () => [...rows].sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? "")),
    [rows]
  )
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, lifecycleFilter, typeFilter])
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pagedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return sorted.slice(start, start + pageSize)
  }, [sorted, currentPage, pageSize])

  return (
    <div className="space-y-12">
      <header>
        <h2 className="text-xl font-semibold text-white">Investment history</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Checkout requests are what you submit from listings or your cart; your positions are live investments after
          checkout completes.
        </p>
        <p className="mt-2">
          <Link to="/listings" className="text-sm font-semibold text-emerald-400 hover:underline">
            Browse listings
          </Link>
        </p>
      </header>

      <section className="space-y-3" aria-labelledby="investor-investments-checkout-heading">
        <h3 id="investor-investments-checkout-heading" className="text-lg font-semibold text-white">
          Checkout requests
        </h3>
        <p className="max-w-2xl text-sm text-slate-400">
          Pending/rejected/completed requests for your account. Approved requests are activated automatically.
        </p>
        <InvestmentCheckoutRequestsSection variant="investor" hideSectionTitle className="mt-4" />
      </section>

      <section className="space-y-3" aria-labelledby="investor-investments-positions-heading">
        <h3 id="investor-investments-positions-heading" className="text-lg font-semibold text-white">
          Your positions
        </h3>
        <p className="max-w-2xl text-sm text-slate-400">
          Running and past investments with lifecycle filters (running, due installments, expired listing window, or
          complete). When an installment plan ends, every payment was on time, and the term is over, you can request
          principal plus profit (profit follows the listing&apos;s expected profit % when set).
        </p>

      <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
          <h4 className="text-sm font-semibold text-slate-200">Filters</h4>
          <button
            type="button"
            onClick={() => {
              setSearchInput("")
              setDebouncedSearch("")
              setLifecycleFilter("all")
              setTypeFilter("all")
            }}
            className="text-[11px] font-medium text-slate-400 underline-offset-2 hover:text-white hover:underline"
          >
            Reset filters
          </button>
        </div>
        <div className="mt-4 flex flex-wrap items-end gap-2">
          <label className="flex min-w-[140px] flex-1 flex-col gap-1">
            <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Search</span>
            <input
              type="search"
              placeholder="Property…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="rounded-md border border-white/15 bg-[#152a45]/95 px-2 py-1.5 text-[11px] text-white placeholder:text-slate-500 focus:border-[#f58e43]/50 focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Lifecycle</span>
            <select
              className={selectClass}
              value={lifecycleFilter ?? "all"}
              onChange={(e) =>
                setLifecycleFilter(e.target.value as InvestmentListFilters["lifecycle"])
              }
            >
              <option value="all">All</option>
              <option value="running">Running</option>
              <option value="due">Due</option>
              <option value="expired">Expired</option>
              <option value="complete">Complete</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Type</span>
            <select
              className={selectClass}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as InvestmentType | "all")}
            >
              <option value="all">All</option>
              <option value="plot_buy">Plot buy</option>
              <option value="installment">Installment</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Page size</span>
            <select className={selectClass} value={String(pageSize)} onChange={(e) => setPageSize(Number(e.target.value))}>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </label>
        </div>
      </div>

      {loading ? (
        <TableLoader rows={6} cols={10} className="mt-6" />
      ) : sorted.length === 0 ? (
        <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] px-6 py-12 text-center text-slate-400">
          No investments yet.
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-white/10">
          <table className="min-w-full text-left text-sm text-slate-200">
            <thead className="border-b border-white/10 bg-white/[0.04] text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3">Property</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Installment plan</th>
                <th className="px-4 py-3">Units</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Started</th>
                <th className="px-4 py-3">Ends</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Installments</th>
                <th className="px-4 py-3">Lifecycle</th>
                <th className={stickyActionsThInvestorClass}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagedRows.map((inv) => {
                const phase = investmentLifecycle(inv)
                return (
                  <tr key={inv.id} className="group border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-medium text-white">{inv.property_title}</td>
                    <td className="px-4 py-3 capitalize">{investmentTypeLabel(inv.type)}</td>
                    <td className="px-4 py-3">
                      {inv.type === "installment"
                        ? `${formatBdtAmount(inv.total_amount)} / ${inv.duration_years}y`
                        : "—"}
                    </td>
                    <td className="px-4 py-3">{unitsLabel(inv)}</td>
                    <td className="px-4 py-3">{formatBdtAmount(inv.total_amount)}</td>
                    <td className="px-4 py-3">{formatDate(inv.start_date)}</td>
                    <td className="px-4 py-3">{formatDate(inv.end_date)}</td>
                    <td className="px-4 py-3">{investmentDurationCell(inv)}</td>
                    <td className="px-4 py-3 text-xs text-slate-300">{installmentProgress(inv)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${lifecycleBadgeClass(phase)}`}
                      >
                        {investmentLifecycleLabel(phase)}
                      </span>
                    </td>
                    <td className={stickyActionsTdInvestorClass}>
                      <div className={cn(actionsButtonRowClass, "justify-end")}>
                        {inv.redemption_eligible ? (
                          <TableActionIconButton
                            icon={busyRedeemId === inv.id ? faSpinner : faHandHoldingDollar}
                            label={
                              busyRedeemId === inv.id ? "Submitting payout request…" : "Request profit payout"
                            }
                            tone="success"
                            disabled={busyRedeemId === inv.id}
                            className={busyRedeemId === inv.id ? "[&_svg]:animate-spin" : undefined}
                            onClick={async () => {
                              const token = localStorage.getItem("accessToken")
                              if (!token) return
                              setBusyRedeemId(inv.id)
                              try {
                                await createRedemptionRequest(inv.id, token)
                                showToast("Payout request submitted. Staff will review it.", "success")
                                await load()
                              } catch (e) {
                                showToast(e instanceof Error ? e.message : "Request failed.", "error")
                              } finally {
                                setBusyRedeemId(null)
                              }
                            }}
                          />
                        ) : (
                          <span
                            className="inline-flex h-7 min-w-7 items-center justify-center text-[10px] text-slate-600"
                            title={inv.redemption_eligibility_message || "Not eligible yet"}
                          >
                            —
                          </span>
                        )}
                        <TableActionIconLink
                          to={`/properties/${inv.property}`}
                          icon={faArrowUpRightFromSquare}
                          label="Open property listing"
                          tone="neutral"
                        />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      {!loading && sorted.length > 0 ? (
        <DashboardTablePagination
          className="mt-3"
          page={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={sorted.length}
          onPageChange={setPage}
        />
      ) : null}
      </section>
    </div>
  )
}
