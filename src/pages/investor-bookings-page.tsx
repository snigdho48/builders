import { useCallback, useEffect, useMemo, useState } from "react"

import { CompactFormSelect } from "@/components/ui/compact-form-select"
import { listInstallmentLedger, listLandBookings } from "@/services/api"
import type { InstallmentLedgerRow, LandBooking } from "@/types/domain"

const planLabel: Record<string, string> = {
  one_percent_installment: "1% installment",
  fifty_percent_installment: "50% installment",
}

export function InvestorBookingsPage() {
  const [rows, setRows] = useState<LandBooking[]>([])
  const [installments, setInstallments] = useState<InstallmentLedgerRow[]>([])
  const [loading, setLoading] = useState(true)
  const [tableSearch, setTableSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | LandBooking["status"]>("all")
  const [planFilter, setPlanFilter] = useState<"all" | LandBooking["plan_type"]>("all")
  const [instSearch, setInstSearch] = useState("")
  const [instStatusFilter, setInstStatusFilter] = useState<
    "all" | InstallmentLedgerRow["status"]
  >("all")
  const [instNotificationFilter, setInstNotificationFilter] = useState<
    "all" | InstallmentLedgerRow["notification"]
  >("all")
  const [instPage, setInstPage] = useState(1)

  const load = useCallback(async () => {
    const token = localStorage.getItem("accessToken")
    if (!token) return
    setLoading(true)
    try {
      const list = await listLandBookings(token)
      setRows(list)
      const ledger = await listInstallmentLedger(token)
      setInstallments(ledger)
    } catch {
      setRows([])
      setInstallments([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const filteredRows = useMemo(() => {
    let list = rows
    if (statusFilter !== "all") {
      list = list.filter((r) => r.status === statusFilter)
    }
    if (planFilter !== "all") {
      list = list.filter((r) => r.plan_type === planFilter)
    }
    const q = tableSearch.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (r) =>
          (r.property_title ?? "").toLowerCase().includes(q) ||
          String(r.id).includes(q) ||
          (planLabel[r.plan_type] ?? r.plan_type).toLowerCase().includes(q),
      )
    }
    return list
  }, [rows, tableSearch, statusFilter, planFilter])

  const invSelectClass = "h-9 w-full text-xs leading-9"
  const INSTALLMENT_PAGE_SIZE = 10
  const progressByBooking = useMemo(() => {
    const out = new Map<number, number>()
    const buckets = new Map<number, { due: number; paid: number }>()
    for (const it of installments) {
      const cur = buckets.get(it.booking_id) ?? { due: 0, paid: 0 }
      cur.due += Number(it.amount_due || 0)
      cur.paid += Number(it.amount_paid || 0)
      buckets.set(it.booking_id, cur)
    }
    for (const [bookingId, x] of buckets) {
      if (x.due <= 0) out.set(bookingId, 0)
      else out.set(bookingId, Math.max(0, Math.min(100, Math.round((x.paid / x.due) * 100))))
    }
    return out
  }, [installments])

  const filteredInstallments = useMemo(() => {
    let list = installments
    if (instStatusFilter !== "all") {
      list = list.filter((r) => r.status === instStatusFilter)
    }
    if (instNotificationFilter !== "all") {
      list = list.filter((r) => r.notification === instNotificationFilter)
    }
    const q = instSearch.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (r) =>
          (r.property_title || "").toLowerCase().includes(q) ||
          String(r.booking_id).includes(q) ||
          String(r.installment_no).includes(q) ||
          r.status.toLowerCase().includes(q) ||
          r.notification.toLowerCase().includes(q),
      )
    }
    return list
  }, [installments, instSearch, instStatusFilter, instNotificationFilter])

  const instTotalPages = Math.max(1, Math.ceil(filteredInstallments.length / INSTALLMENT_PAGE_SIZE))
  const pagedInstallments = useMemo(() => {
    const start = (instPage - 1) * INSTALLMENT_PAGE_SIZE
    return filteredInstallments.slice(start, start + INSTALLMENT_PAGE_SIZE)
  }, [filteredInstallments, instPage])

  useEffect(() => {
    setInstPage(1)
  }, [instSearch, instStatusFilter, instNotificationFilter])

  useEffect(() => {
    if (instPage > instTotalPages) setInstPage(instTotalPages)
  }, [instPage, instTotalPages])

  return (
    <section className="space-y-6 rounded-2xl border border-white/10 bg-slate-900/70 p-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">My land bookings</h2>
        <p className="mt-1 text-sm text-slate-400">Track requests you submitted from land detail pages.</p>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="rounded-xl border border-white/10 bg-white/3 px-6 py-10 text-center text-slate-400">
          No bookings yet. Open a land listing and use <strong className="text-white">Book now</strong>.
        </p>
      ) : (
        <>
          <div className="dashboard-filters-row">
            <input
              className="dashboard-filter-input min-w-[200px] flex-1"
              placeholder="Search land title or booking ID…"
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              aria-label="Search my bookings"
            />
            <div className="dashboard-filter-group min-w-[130px]">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Status</span>
              <div className="dashboard-filter-select-shell">
                <CompactFormSelect
                  ariaLabel="Filter by status"
                  className={invSelectClass}
                  value={statusFilter}
                  onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
                  options={[
                    { value: "all", label: "All statuses" },
                    { value: "pending", label: "Pending" },
                    { value: "accepted", label: "Accepted" },
                    { value: "rejected", label: "Rejected" },
                  ]}
                />
              </div>
            </div>
            <div className="dashboard-filter-group min-w-[150px]">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Plan</span>
              <div className="dashboard-filter-select-shell">
                <CompactFormSelect
                  ariaLabel="Filter by plan"
                  className={invSelectClass}
                  value={planFilter}
                  onValueChange={(v) => setPlanFilter(v as typeof planFilter)}
                  options={[
                    { value: "all", label: "All plans" },
                    { value: "one_percent_installment", label: "1% installment" },
                    { value: "fifty_percent_installment", label: "50% installment" },
                  ]}
                />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="min-w-full w-full border-collapse text-left text-sm text-slate-200">
              <thead className="border-b border-white/10 bg-white/4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-4 py-3 align-middle">Land</th>
                  <th className="px-4 py-3 align-middle">Plan</th>
                  <th className="px-4 py-3 align-middle whitespace-nowrap">Booked</th>
                  <th className="px-4 py-3 align-middle whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((r) => (
                  <tr key={r.id} className="border-b border-white/5 transition-colors hover:bg-white/2">
                    <td className="max-w-[min(280px,50vw)] px-4 py-3 align-middle font-medium text-white">
                      <span className="line-clamp-2" title={r.property_title ?? undefined}>
                        {r.property_title ?? `#${r.property}`}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-middle text-slate-300">{planLabel[r.plan_type] ?? r.plan_type}</td>
                    <td className="px-4 py-3 align-middle whitespace-nowrap text-slate-400">
                      {new Date(r.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 align-middle capitalize text-slate-300">{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredRows.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">No bookings match your filters.</p>
          ) : null}
        </>
      )}

      <div className="rounded-xl border border-white/10 bg-white/2 p-4 sm:p-5">
        <h3 className="text-lg font-semibold text-white">Installment progress tracker</h3>
        <p className="mt-1 text-xs text-slate-500">
          One table for due date, payment state, reminders, and overall progress.
        </p>
        {installments.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">
            No installment schedule yet. It appears after a booking is accepted.
          </p>
        ) : (
          <>
            <div className="dashboard-filters-row mt-4">
              <input
                className="dashboard-filter-input min-w-[220px] flex-1"
                placeholder="Search land, booking, installment…"
                value={instSearch}
                onChange={(e) => setInstSearch(e.target.value)}
                aria-label="Search installment tracker"
              />
              <div className="dashboard-filter-group min-w-[140px]">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Status</span>
                <div className="dashboard-filter-select-shell">
                  <CompactFormSelect
                    ariaLabel="Filter installment status"
                    className={invSelectClass}
                    value={instStatusFilter}
                    onValueChange={(v) => setInstStatusFilter(v as typeof instStatusFilter)}
                    options={[
                      { value: "all", label: "All status" },
                      { value: "unpaid", label: "Unpaid" },
                      { value: "partial", label: "Partial" },
                      { value: "overdue", label: "Overdue" },
                      { value: "paid", label: "Paid" },
                    ]}
                  />
                </div>
              </div>
              <div className="dashboard-filter-group min-w-[160px]">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Notification</span>
                <div className="dashboard-filter-select-shell">
                  <CompactFormSelect
                    ariaLabel="Filter installment notification"
                    className={invSelectClass}
                    value={instNotificationFilter}
                    onValueChange={(v) => setInstNotificationFilter(v as typeof instNotificationFilter)}
                    options={[
                      { value: "all", label: "All notices" },
                      { value: "upcoming", label: "Upcoming" },
                      { value: "due_soon", label: "Due soon" },
                      { value: "overdue", label: "Overdue" },
                      { value: "paid", label: "Paid" },
                    ]}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto rounded-xl border border-white/10">
            <table className="min-w-full w-full border-collapse text-left text-sm text-slate-200">
              <thead className="border-b border-white/10 bg-white/4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-3 py-2">Land</th>
                  <th className="px-3 py-2">Inst #</th>
                  <th className="px-3 py-2">Due</th>
                  <th className="px-3 py-2">Amount</th>
                  <th className="px-3 py-2">Paid</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Notification</th>
                  <th className="px-3 py-2">Progress</th>
                </tr>
              </thead>
              <tbody>
                {pagedInstallments.map((r) => {
                  const progress = progressByBooking.get(r.booking_id) ?? 0
                  return (
                    <tr key={r.id} className="border-b border-white/5 hover:bg-white/2">
                      <td className="max-w-[250px] px-3 py-2 align-middle text-slate-200">
                        <span className="line-clamp-2">{r.property_title || `Booking #${r.booking_id}`}</span>
                      </td>
                      <td className="px-3 py-2 align-middle text-slate-300">{r.installment_no}</td>
                      <td className="px-3 py-2 align-middle whitespace-nowrap text-slate-400">
                        {r.due_date ? new Date(r.due_date).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-3 py-2 align-middle text-slate-300">{r.amount_due}</td>
                      <td className="px-3 py-2 align-middle text-slate-300">{r.amount_paid}</td>
                      <td className="px-3 py-2 align-middle capitalize text-slate-300">{r.status}</td>
                      <td className="px-3 py-2 align-middle capitalize text-slate-400">{r.notification.replace("_", " ")}</td>
                      <td className="px-3 py-2 align-middle">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-white/10">
                          <div className="h-full bg-[#f58e43]" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="mt-1 inline-block text-[11px] text-slate-500">{progress}%</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
              <span>
                Showing {pagedInstallments.length} of {filteredInstallments.length} row(s)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={instPage <= 1}
                  onClick={() => setInstPage((p) => Math.max(1, p - 1))}
                  className="rounded border border-white/20 px-2 py-1 disabled:opacity-40"
                >
                  Prev
                </button>
                <span>
                  Page {instPage} / {instTotalPages}
                </span>
                <button
                  type="button"
                  disabled={instPage >= instTotalPages}
                  onClick={() => setInstPage((p) => Math.min(instTotalPages, p + 1))}
                  className="rounded border border-white/20 px-2 py-1 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
