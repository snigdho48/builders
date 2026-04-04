import { useEffect, useMemo, useState } from "react"

import { CompactFormSelect } from "@/components/ui/compact-form-select"
import { DashboardTablePagination } from "@/components/ui/dashboard-table-pagination"
import { TableLoader } from "@/components/ui/table-loader"
import { listInvestments, listRedemptionRequests } from "@/services/api"
import type { Investment, InvestmentType, RedemptionRequest } from "@/types/domain"
import { formatBdtAmount } from "@/utils/currency"
import { investmentTypeLabel } from "@/utils/investor-display"

type TrackerAudience = "investor" | "admin" | "representative" | "agent"

type TrackerRow = {
  investmentId: number
  investor: string
  investorEmail: string
  propertyTitle: string
  type: InvestmentType
  installmentPlan: string
  principal: string
  expectedProfitPercent: string
  expectedReturn: string
  startDate: string | null
  endDate: string | null
  nextDueDate: string | null
  overdueDays: number
  installmentsPaidCount: number
  installmentsTotalCount: number
  paidAmount: string
  remainingAmount: string
  completedAt: string | null
  payoutStatus: string
}

function asNumber(v: string | number | null | undefined): number {
  const n = typeof v === "number" ? v : Number(v ?? 0)
  return Number.isFinite(n) ? n : 0
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—"
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? String(iso) : d.toLocaleDateString()
}

function mapPayoutStatus(
  audience: TrackerAudience,
  investmentId: number,
  requestsByInvestment: Map<number, RedemptionRequest[]>
): string {
  if (audience === "agent") {
    return "—"
  }
  const rows = requestsByInvestment.get(investmentId) ?? []
  if (!rows.length) return "Not requested"
  const latest = rows[0]
  if (latest.status === "paid") return "Paid"
  if (latest.status === "approved") return "Approved"
  if (latest.status === "rejected") return "Rejected"
  return "Pending"
}

function buildTrackerRow(
  inv: Investment,
  audience: TrackerAudience,
  requestsByInvestment: Map<number, RedemptionRequest[]>
): TrackerRow {
  const installments = inv.installments ?? []
  const principal = asNumber(inv.total_amount)
  const installmentPlan =
    inv.type === "installment"
      ? `${formatBdtAmount(inv.total_amount)} / ${inv.duration_years} year${inv.duration_years === 1 ? "" : "s"}`
      : "—"
  const profitPct = asNumber(inv.roi_percent)
  const expectedReturn = principal + (principal * profitPct) / 100
  const paidRows = installments.filter((i) => i.status === "paid")
  const unpaidRows = installments.filter((i) => i.status !== "paid")
  const paidAmount = paidRows.reduce((sum, row) => sum + asNumber(row.amount), 0)
  const remainingAmount = unpaidRows.reduce((sum, row) => sum + asNumber(row.amount), 0)
  const pendingDueDates = unpaidRows
    .map((r) => r.due_date)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b))
  const nextDueDate = pendingDueDates.length ? pendingDueDates[0] : null
  const overdueRows = unpaidRows.filter((r) => r.status === "overdue")
  const oldestOverdue = overdueRows
    .map((r) => r.due_date)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b))[0]
  const overdueDays = oldestOverdue
    ? Math.max(
        0,
        Math.floor(
          (Date.now() - new Date(`${oldestOverdue}T00:00:00`).getTime()) / (1000 * 60 * 60 * 24)
        )
      )
    : 0
  const completedAt =
    installments.length > 0 && paidRows.length === installments.length
      ? paidRows
          .map((r) => r.paid_at)
          .filter((v): v is string => Boolean(v))
          .sort((a, b) => b.localeCompare(a))[0] ?? inv.end_date
      : null

  return {
    investmentId: inv.id,
    investor: inv.investor_username ?? "—",
    investorEmail: inv.investor_email ?? "",
    propertyTitle: inv.property_title,
    type: inv.type,
    installmentPlan,
    principal: String(principal),
    expectedProfitPercent: String(profitPct),
    expectedReturn: String(expectedReturn),
    startDate: inv.start_date,
    endDate: inv.end_date,
    nextDueDate,
    overdueDays,
    installmentsPaidCount: paidRows.length,
    installmentsTotalCount: installments.length,
    paidAmount: String(paidAmount),
    remainingAmount: String(remainingAmount),
    completedAt,
    payoutStatus: mapPayoutStatus(audience, inv.id, requestsByInvestment),
  }
}

const audienceCopy: Record<TrackerAudience, { title: string; subtitle: string }> = {
  investor: {
    title: "Installment tracker",
    subtitle: "Track due installments, overdue days, maturity timeline, and expected return.",
  },
  admin: {
    title: "Installment tracker",
    subtitle: "Platform-wide installment monitoring with maturity and payout visibility.",
  },
  representative: {
    title: "Installment tracker",
    subtitle: "Track installment progress for your referred/listing-linked investors.",
  },
  agent: {
    title: "Installment tracker",
    subtitle: "Track installment progress and due timelines on properties you manage.",
  },
}

export function InstallmentTrackerPage({ audience }: { audience: TrackerAudience }) {
  const copy = audienceCopy[audience]
  const [loading, setLoading] = useState(true)
  const [investments, setInvestments] = useState<Investment[]>([])
  const [requests, setRequests] = useState<RedemptionRequest[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState<InvestmentType | "all">("all")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      setLoading(false)
      return
    }
    setLoading(true)
    Promise.all([
      listInvestments(token, { pageSize: 200 }),
      audience === "agent"
        ? Promise.resolve([])
        : listRedemptionRequests(token).catch(() => [] as RedemptionRequest[]),
    ])
      .then(([inv, red]) => {
        setInvestments(inv)
        setRequests(red)
      })
      .catch(() => {
        setInvestments([])
        setRequests([])
      })
      .finally(() => setLoading(false))
  }, [audience])

  const requestsByInvestment = useMemo(() => {
    const map = new Map<number, RedemptionRequest[]>()
    const sorted = [...requests].sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""))
    for (const req of sorted) {
      const list = map.get(req.investment) ?? []
      list.push(req)
      map.set(req.investment, list)
    }
    return map
  }, [requests])

  const rows = useMemo(
    () => investments.map((inv) => buildTrackerRow(inv, audience, requestsByInvestment)),
    [investments, audience, requestsByInvestment]
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows.filter((row) => {
      if (q) {
        const hay = `${row.propertyTitle} ${row.investor} ${row.investorEmail}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      if (typeFilter !== "all" && row.type !== typeFilter) return false
      if (statusFilter === "overdue_only" && row.overdueDays <= 0) return false
      if (statusFilter === "active_only" && row.remainingAmount === "0") return false
      if (statusFilter === "completed_only" && row.remainingAmount !== "0") return false
      return true
    })
  }, [rows, search, typeFilter, statusFilter])

  useEffect(() => {
    setPage(1)
  }, [search, statusFilter, typeFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pagedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, currentPage, pageSize])

  return (
    <section>
      <h2 className="text-xl font-semibold text-white">{copy.title}</h2>
      <p className="mt-2 max-w-3xl text-sm text-slate-400">{copy.subtitle}</p>

      <div className="mt-5 dashboard-filters-row">
        <label className="dashboard-filter-group min-w-[220px]">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Search</span>
          <input
            className="dashboard-filter-input"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Property / investor"
          />
        </label>
        <div className="dashboard-filter-group min-w-[170px]">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Type</span>
          <div className="dashboard-filter-select-shell">
            <CompactFormSelect
              ariaLabel="Filter tracker by type"
              value={typeFilter}
              onValueChange={(v) => setTypeFilter(v as InvestmentType | "all")}
              options={[
                { value: "all", label: "All types" },
                { value: "plot_buy", label: "Plot buy" },
                { value: "installment", label: "Installment" },
              ]}
            />
          </div>
        </div>
        <div className="dashboard-filter-group min-w-[170px]">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Rows</span>
          <div className="dashboard-filter-select-shell">
            <CompactFormSelect
              ariaLabel="Filter tracker rows"
              value={statusFilter}
              onValueChange={setStatusFilter}
              options={[
                { value: "all", label: "All rows" },
                { value: "overdue_only", label: "Overdue only" },
                { value: "active_only", label: "Active only" },
                { value: "completed_only", label: "Completed only" },
              ]}
            />
          </div>
        </div>
        <div className="dashboard-filter-group min-w-[170px]">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Page size</span>
          <div className="dashboard-filter-select-shell">
            <CompactFormSelect
              ariaLabel="Select page size"
              value={String(pageSize)}
              onValueChange={(v) => setPageSize(Number(v))}
              options={[
                { value: "10", label: "10 rows" },
                { value: "20", label: "20 rows" },
                { value: "50", label: "50 rows" },
              ]}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <TableLoader rows={8} cols={12} className="mt-6" />
      ) : filtered.length === 0 ? (
        <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] px-6 py-12 text-center text-slate-400">
          No tracker rows found.
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="min-w-[1280px] text-left text-sm text-slate-200">
              <thead className="border-b border-white/10 bg-white/[0.04] text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  {audience !== "investor" ? <th className="px-4 py-3">Investor</th> : null}
                  <th className="px-4 py-3">Property</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Installment plan</th>
                  <th className="px-4 py-3">Principal</th>
                  <th className="px-4 py-3">Profit %</th>
                  <th className="px-4 py-3">Expected return</th>
                  <th className="px-4 py-3">Start</th>
                  <th className="px-4 py-3">End</th>
                  <th className="px-4 py-3">Next due</th>
                  <th className="px-4 py-3">Overdue days</th>
                  <th className="px-4 py-3">Installments</th>
                  <th className="px-4 py-3">Paid / Remaining</th>
                  <th className="px-4 py-3">Completed on</th>
                  <th className="px-4 py-3">Payout</th>
                </tr>
              </thead>
              <tbody>
                {pagedRows.map((row) => (
                  <tr key={row.investmentId} className="border-b border-white/5 hover:bg-white/[0.02]">
                    {audience !== "investor" ? (
                      <td className="px-4 py-3">
                        <div className="font-medium text-white">{row.investor}</div>
                        {row.investorEmail ? <div className="text-[11px] text-slate-500">{row.investorEmail}</div> : null}
                      </td>
                    ) : null}
                    <td className="px-4 py-3 font-medium text-white">{row.propertyTitle}</td>
                    <td className="px-4 py-3">{investmentTypeLabel(row.type)}</td>
                    <td className="px-4 py-3">{row.installmentPlan}</td>
                    <td className="px-4 py-3">{formatBdtAmount(row.principal)}</td>
                    <td className="px-4 py-3">{row.expectedProfitPercent}%</td>
                    <td className="px-4 py-3">{formatBdtAmount(row.expectedReturn)}</td>
                    <td className="px-4 py-3">{formatDate(row.startDate)}</td>
                    <td className="px-4 py-3">{formatDate(row.endDate)}</td>
                    <td className="px-4 py-3">{formatDate(row.nextDueDate)}</td>
                    <td className="px-4 py-3">{row.overdueDays > 0 ? row.overdueDays : "—"}</td>
                    <td className="px-4 py-3">
                      {row.installmentsTotalCount > 0
                        ? `${row.installmentsPaidCount}/${row.installmentsTotalCount}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {formatBdtAmount(row.paidAmount)} / {formatBdtAmount(row.remainingAmount)}
                    </td>
                    <td className="px-4 py-3">{formatDate(row.completedAt)}</td>
                    <td className="px-4 py-3">{row.payoutStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <DashboardTablePagination
            page={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={filtered.length}
            onPageChange={setPage}
          />
        </div>
      )}
    </section>
  )
}
