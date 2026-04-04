import { useCallback, useEffect, useMemo, useState } from "react"

import { CompactFormSelect } from "@/components/ui/compact-form-select"
import { faCheck, faMoneyBillWave, faXmark } from "@fortawesome/free-solid-svg-icons"

import { TableActionIconButton } from "@/components/ui/table-action-button"
import {
  actionsButtonRowClass,
  stickyActionsTdClass,
  stickyActionsThClass,
} from "@/components/ui/sticky-table-actions"
import { cn } from "@/lib/utils"
import { TableLoader } from "@/components/ui/table-loader"
import { useToast } from "@/components/ui/use-toast"
import {
  approveRedemptionRequest,
  listRedemptionRequests,
  markRedemptionPaid,
  rejectRedemptionRequest,
} from "@/services/api"
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

export function StaffRedemptionRequestsPage() {
  const [rows, setRows] = useState<RedemptionRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const { showToast } = useToast()

  const visibleRows = useMemo(() => {
    let r = rows
    if (statusFilter !== "all") {
      r = r.filter((x) => x.status === statusFilter)
    }
    const q = searchQuery.trim().toLowerCase()
    if (q) {
      r = r.filter((x) =>
        `${x.investment_property_title ?? ""} ${x.investor_username ?? ""}`.toLowerCase().includes(q)
      )
    }
    return r
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

  async function approve(id: number) {
    const token = localStorage.getItem("accessToken")
    if (!token) return
    setBusyId(id)
    try {
      await approveRedemptionRequest(id, token)
      showToast("Request approved.", "success")
      await load()
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Approve failed.", "error")
    } finally {
      setBusyId(null)
    }
  }

  async function reject(id: number) {
    const reason = window.prompt("Reason for decline (optional):") ?? ""
    const token = localStorage.getItem("accessToken")
    if (!token) return
    setBusyId(id)
    try {
      await rejectRedemptionRequest(id, token, reason)
      showToast("Request declined.", "success")
      await load()
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Reject failed.", "error")
    } finally {
      setBusyId(null)
    }
  }

  async function paid(id: number) {
    const token = localStorage.getItem("accessToken")
    if (!token) return
    setBusyId(id)
    try {
      await markRedemptionPaid(id, token)
      showToast("Marked as paid.", "success")
      await load()
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Update failed.", "error")
    } finally {
      setBusyId(null)
    }
  }

  return (
    <section>
      <h2 className="text-xl font-semibold text-white">Maturity payout requests</h2>
      <p className="mt-2 max-w-3xl text-sm text-slate-400">
        Investors request principal plus profit after the term ends and every installment was paid on time. Profit uses
        the listing&apos;s expected profit % (set on the property) when present; otherwise the investment ROI.
      </p>

      {loading ? (
        <TableLoader rows={5} cols={6} className="mt-6" />
      ) : rows.length === 0 ? (
        <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] px-6 py-12 text-center text-slate-400">
          No payout requests yet.
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          <div className="dashboard-filters-row">
            <input
              className="dashboard-filter-input min-w-[220px] flex-1"
              placeholder="Search property or investor…"
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
            <table className="min-w-[900px] text-left text-sm text-slate-200">
              <thead className="border-b border-white/10 bg-white/[0.04] text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-4 py-3">Property</th>
                  <th className="px-4 py-3">Investor</th>
                  <th className="px-4 py-3">Principal</th>
                  <th className="px-4 py-3">Profit</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className={`${stickyActionsThClass} bg-[#0f172a]/95 text-right uppercase`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((r) => (
                  <tr key={r.id} className="group border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-medium text-white">{r.investment_property_title ?? "—"}</td>
                  <td className="px-4 py-3">{r.investor_username ?? "—"}</td>
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
                  <td className={`${stickyActionsTdClass} bg-slate-950 text-right`}>
                    <div className={cn(actionsButtonRowClass, "justify-end")}>
                      {r.status === "pending" ? (
                        <>
                          <TableActionIconButton
                            icon={faCheck}
                            label="Approve payout request"
                            tone="accent"
                            disabled={busyId === r.id}
                            onClick={() => void approve(r.id)}
                          />
                          <TableActionIconButton
                            icon={faXmark}
                            label="Decline payout request"
                            tone="danger"
                            disabled={busyId === r.id}
                            onClick={() => void reject(r.id)}
                          />
                        </>
                      ) : null}
                      {r.status === "approved" ? (
                        <TableActionIconButton
                          icon={faMoneyBillWave}
                          label="Mark as paid"
                          tone="sky"
                          disabled={busyId === r.id}
                          onClick={() => void paid(r.id)}
                        />
                      ) : null}
                      {r.status === "rejected" && r.rejection_reason ? (
                        <span className="max-w-[120px] truncate text-[10px] text-slate-500" title={r.rejection_reason}>
                          {r.rejection_reason}
                        </span>
                      ) : null}
                    </div>
                  </td>
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
