import { useCallback, useEffect, useMemo, useState } from "react"
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons"

import { CompactFormSelect } from "@/components/ui/compact-form-select"
import { DashboardTablePagination } from "@/components/ui/dashboard-table-pagination"
import { TableActionIconButton } from "@/components/ui/table-action-button"
import { TableLoader } from "@/components/ui/table-loader"
import { useToast } from "@/components/ui/use-toast"
import { approvePaymentRequest, listPaymentRequests, rejectPaymentRequest } from "@/services/api"
import type { PaymentRequestRecord } from "@/types/domain"
import { formatBdtAmount } from "@/utils/currency"

function statusClass(status: PaymentRequestRecord["status"]): string {
  if (status === "approved") return "bg-emerald-500/20 text-emerald-300"
  if (status === "pending") return "bg-amber-500/20 text-amber-200"
  if (status === "rejected") return "bg-rose-500/20 text-rose-200"
  return "bg-white/10 text-slate-300"
}

export function StaffPaymentRequestsPage() {
  const { showToast } = useToast()
  const [rows, setRows] = useState<PaymentRequestRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const load = useCallback(async () => {
    const token = localStorage.getItem("accessToken")
    if (!token) return
    setLoading(true)
    try {
      const list = await listPaymentRequests(token)
      setRows(list)
    } catch (e) {
      setRows([])
      showToast(e instanceof Error ? e.message : "Failed to load installment payment requests.", "error")
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    void load()
  }, [load])

  const filtered = useMemo(() => {
    let list = rows
    if (statusFilter !== "all") {
      list = list.filter((r) => r.status === statusFilter)
    }
    const q = query.trim().toLowerCase()
    if (!q) return list
    return list.filter((r) =>
      `${r.investment_property_title ?? ""} ${r.user_username ?? ""} ${r.user_email ?? ""}`.toLowerCase().includes(q)
    )
  }, [rows, statusFilter, query])

  useEffect(() => {
    setPage(1)
  }, [statusFilter, query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pageRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, currentPage, pageSize])

  async function approve(row: PaymentRequestRecord) {
    const token = localStorage.getItem("accessToken")
    if (!token) return
    setBusyId(row.id)
    try {
      const note = window.prompt("Approval note (optional):") ?? ""
      await approvePaymentRequest(row.id, token, note.trim() || undefined)
      showToast("Installment payment request approved.", "success")
      await load()
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Approve failed.", "error")
    } finally {
      setBusyId(null)
    }
  }

  async function reject(row: PaymentRequestRecord) {
    const token = localStorage.getItem("accessToken")
    if (!token) return
    const note = window.prompt("Rejection reason (optional):") ?? ""
    setBusyId(row.id)
    try {
      await rejectPaymentRequest(row.id, token, note.trim() || undefined)
      showToast("Installment payment request rejected.", "success")
      await load()
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Reject failed.", "error")
    } finally {
      setBusyId(null)
    }
  }

  return (
    <section>
      <h2 className="text-xl font-semibold text-white">Installment payment requests</h2>
      <p className="mt-2 max-w-3xl text-sm text-slate-400">
        Investors submit installment payment requests here. Review and approve/reject to keep payment records clean.
      </p>

      {loading ? (
        <TableLoader rows={5} cols={7} className="mt-6" />
      ) : (
        <div className="mt-6 space-y-3">
          <div className="dashboard-filters-row">
            <input
              className="dashboard-filter-input min-w-[220px] flex-1"
              placeholder="Search property or investor..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="dashboard-filter-group min-w-[160px]">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Status</span>
              <div className="dashboard-filter-select-shell">
                <CompactFormSelect
                  ariaLabel="Filter installment payment requests by status"
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                  options={[
                    { value: "all", label: "All statuses" },
                    { value: "pending", label: "Pending" },
                    { value: "approved", label: "Approved" },
                    { value: "rejected", label: "Rejected" },
                  ]}
                />
              </div>
            </div>
            <div className="dashboard-filter-group min-w-[140px]">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Page size</span>
              <div className="dashboard-filter-select-shell">
                <CompactFormSelect
                  ariaLabel="Payment requests page size"
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

          {pageRows.length === 0 ? (
            <p className="text-sm text-slate-500">No installment payment requests found.</p>
          ) : (
            <div className="space-y-3">
              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="min-w-full text-left text-sm text-slate-200">
                  <thead className="border-b border-white/10 bg-white/[0.04] text-xs uppercase tracking-wide text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Investor</th>
                      <th className="px-4 py-3">Property</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Method</th>
                      <th className="px-4 py-3">Note</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.map((r) => (
                      <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                        <td className="px-4 py-3">
                          <div className="font-medium text-white">{r.user_username ?? `#${r.user}`}</div>
                          {r.user_email ? <div className="text-xs text-slate-500">{r.user_email}</div> : null}
                        </td>
                        <td className="px-4 py-3">{r.investment_property_title ?? "—"}</td>
                        <td className="px-4 py-3">{formatBdtAmount(r.amount)}</td>
                        <td className="px-4 py-3 capitalize">{r.method}</td>
                        <td className="max-w-[260px] truncate px-4 py-3 text-slate-300" title={r.note || "—"}>
                          {r.note || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${statusClass(r.status)}`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {r.status === "pending" ? (
                            <div className="inline-flex items-center justify-end gap-2">
                              <TableActionIconButton
                                icon={faCheck}
                                label="Approve request"
                                tone="success"
                                disabled={busyId === r.id}
                                onClick={() => void approve(r)}
                              />
                              <TableActionIconButton
                                icon={faXmark}
                                label="Reject request"
                                tone="danger"
                                disabled={busyId === r.id}
                                onClick={() => void reject(r)}
                              />
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500">Reviewed</span>
                          )}
                        </td>
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
        </div>
      )}
    </section>
  )
}
