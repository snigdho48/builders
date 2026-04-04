import { useCallback, useEffect, useMemo, useState } from "react"

import { CompactFormSelect } from "@/components/ui/compact-form-select"
import { TableLoader } from "@/components/ui/table-loader"
import { useToast } from "@/components/ui/use-toast"
import { listRedemptionRequests } from "@/services/api"
import type { RedemptionRequest } from "@/types/domain"
import { formatBdtAmount } from "@/utils/currency"

function statusBadge(status: RedemptionRequest["status"]): string {
  switch (status) {
    case "pending":
      return "bg-amber-500/20 text-amber-200"
    case "approved":
      return "bg-sky-500/20 text-sky-200"
    case "paid":
      return "bg-emerald-500/20 text-emerald-200"
    case "rejected":
      return "bg-rose-500/15 text-rose-200"
    default:
      return "bg-white/10 text-slate-300"
  }
}

function fmtDate(iso?: string): string {
  if (!iso) return "-"
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString()
}

export function InvestorRedemptionRequestsPage() {
  const [rows, setRows] = useState<RedemptionRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const { showToast } = useToast()

  const visibleRows = useMemo(() => {
    let r = rows
    if (statusFilter !== "all") {
      r = r.filter((x) => x.status === statusFilter)
    }
    const q = searchQuery.trim().toLowerCase()
    if (!q) return r
    return r.filter((x) => `${x.investment_property_title ?? ""}`.toLowerCase().includes(q))
  }, [rows, statusFilter, searchQuery])

  const load = useCallback(async () => {
    const token = localStorage.getItem("accessToken")
    if (!token) return
    setLoading(true)
    try {
      const list = await listRedemptionRequests(token)
      setRows(list)
    } catch (e) {
      setRows([])
      showToast(e instanceof Error ? e.message : "Failed to load payout requests.", "error")
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <section>
      <h2 className="text-xl font-semibold text-white">Payout requests</h2>
      <p className="mt-2 max-w-3xl text-sm text-slate-400">
        Track your maturity payout requests (principal + profit) and their review status.
      </p>

      {loading ? (
        <TableLoader rows={5} cols={7} className="mt-6" />
      ) : rows.length === 0 ? (
        <div className="mt-8 rounded-xl border border-white/10 bg-white/3 px-6 py-12 text-center text-slate-400">
          No payout requests yet.
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          <div className="dashboard-filters-row">
            <input
              className="dashboard-filter-input min-w-[220px] flex-1"
              placeholder="Search property..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="dashboard-filter-group min-w-[160px]">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Status</span>
              <div className="dashboard-filter-select-shell">
                <CompactFormSelect
                  ariaLabel="Filter by request status"
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                  options={[
                    { value: "all", label: "All statuses" },
                    { value: "pending", label: "Pending" },
                    { value: "approved", label: "Approved" },
                    { value: "paid", label: "Paid" },
                    { value: "rejected", label: "Rejected" },
                  ]}
                />
              </div>
            </div>
          </div>
          {visibleRows.length === 0 ? (
            <p className="text-sm text-slate-500">No rows match the current filters.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="min-w-[840px] text-left text-sm text-slate-200">
                <thead className="border-b border-white/10 bg-white/4 text-xs uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Property</th>
                    <th className="px-4 py-3">Principal</th>
                    <th className="px-4 py-3">Profit</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Updated</th>
                    <th className="px-4 py-3">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((r) => (
                    <tr key={r.id} className="border-b border-white/5 hover:bg-white/2">
                      <td className="px-4 py-3 font-medium text-white">{r.investment_property_title ?? "-"}</td>
                      <td className="px-4 py-3 tabular-nums">{formatBdtAmount(r.principal_amount)}</td>
                      <td className="px-4 py-3 tabular-nums">{formatBdtAmount(r.profit_amount)}</td>
                      <td className="px-4 py-3 tabular-nums font-semibold text-emerald-300">
                        {formatBdtAmount(r.total_payout)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${statusBadge(r.status)}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{fmtDate(r.updated_at ?? r.created_at)}</td>
                      <td className="px-4 py-3 text-slate-400">{r.rejection_reason || r.notes || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
