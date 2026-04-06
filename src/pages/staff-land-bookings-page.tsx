import { useCallback, useEffect, useMemo, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons"

import { DashboardModal } from "@/components/dashboard/dashboard-modal"
import { CompactFormSelect } from "@/components/ui/compact-form-select"
import { useToast } from "@/components/ui/use-toast"
import { acceptLandBooking, listInstallmentLedger, listLandBookings, markInstallmentComplete, rejectLandBooking } from "@/services/api"
import type { InstallmentLedgerRow, LandBooking } from "@/types/domain"

const planLabel: Record<string, string> = {
  one_percent_installment: "1% installment",
  fifty_percent_installment: "50% installment",
}

export function StaffLandBookingsPage() {
  const { showToast } = useToast()
  const [rows, setRows] = useState<LandBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<LandBooking | null>(null)
  const [rejectNote, setRejectNote] = useState("")
  const [busy, setBusy] = useState(false)
  const [tableSearch, setTableSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | LandBooking["status"]>("all")
  const [planFilter, setPlanFilter] = useState<"all" | LandBooking["plan_type"]>("all")
  const [installments, setInstallments] = useState<InstallmentLedgerRow[]>([])
  const [instSearch, setInstSearch] = useState("")
  const [instStatusFilter, setInstStatusFilter] = useState<"all" | InstallmentLedgerRow["status"]>("all")
  const [instNotificationFilter, setInstNotificationFilter] = useState<"all" | InstallmentLedgerRow["notification"]>("all")
  const [instPage, setInstPage] = useState(1)

  const load = useCallback(async () => {
    const token = localStorage.getItem("accessToken")
    if (!token) return
    setLoading(true)
    try {
      setRows(await listLandBookings(token))
      setInstallments(await listInstallmentLedger(token))
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

  async function onAccept() {
    if (!selected) return
    const token = localStorage.getItem("accessToken")
    if (!token) return
    setBusy(true)
    try {
      await acceptLandBooking(selected.id, token)
      showToast("Booking accepted.", "success")
      setSelected(null)
      await load()
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed", "error")
    } finally {
      setBusy(false)
    }
  }

  async function onReject() {
    if (!selected) return
    const token = localStorage.getItem("accessToken")
    if (!token) return
    setBusy(true)
    try {
      await rejectLandBooking(selected.id, token, rejectNote)
      showToast("Booking rejected.", "success")
      setSelected(null)
      setRejectNote("")
      await load()
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed", "error")
    } finally {
      setBusy(false)
    }
  }

  async function onMarkInstallmentPaid(rowId: number) {
    const token = localStorage.getItem("accessToken")
    if (!token) return
    try {
      await markInstallmentComplete(rowId, token)
      showToast("Installment marked as paid.", "success")
      await load()
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to update installment", "error")
    }
  }

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
          String(r.id).includes(q) ||
          (r.property_title ?? "").toLowerCase().includes(q) ||
          (r.investor_username ?? "").toLowerCase().includes(q) ||
          r.full_name.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q),
      )
    }
    return list
  }, [rows, tableSearch, statusFilter, planFilter])

  const bookingSelectClass = "h-9 w-full text-xs leading-9"
  const INSTALLMENT_PAGE_SIZE = 12
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
        <h2 className="text-2xl font-semibold text-white">Land booking requests</h2>
        <p className="mt-1 text-sm text-slate-400">Review investor requests for your assigned lands (or all lands as admin).</p>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-slate-500">No booking requests.</p>
      ) : (
        <>
          <div className="dashboard-filters-row">
            <input
              className="dashboard-filter-input min-w-[200px] flex-1"
              placeholder="Search land, investor, email, booking ID…"
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              aria-label="Search bookings"
            />
            <div className="dashboard-filter-group min-w-[130px]">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Status</span>
              <div className="dashboard-filter-select-shell">
                <CompactFormSelect
                  ariaLabel="Filter by status"
                  className={bookingSelectClass}
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
                  className={bookingSelectClass}
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
                  <th className="px-4 py-3 align-middle whitespace-nowrap">ID</th>
                  <th className="px-4 py-3 align-middle">Land</th>
                  <th className="px-4 py-3 align-middle">Investor</th>
                  <th className="px-4 py-3 align-middle">Plan</th>
                  <th className="px-4 py-3 align-middle whitespace-nowrap">Status</th>
                  <th className="px-4 py-3 align-middle whitespace-nowrap">Booked</th>
                  <th className="px-4 py-3 align-middle text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((r) => (
                  <tr key={r.id} className="border-b border-white/5 transition-colors hover:bg-white/2">
                    <td className="px-4 py-3 align-middle tabular-nums text-slate-400">#{r.id}</td>
                    <td className="max-w-[min(220px,35vw)] px-4 py-3 align-middle font-medium text-white">
                      <span className="line-clamp-2" title={r.property_title ?? undefined}>
                        {r.property_title ?? r.property}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-middle text-slate-300">{r.investor_username ?? r.investor}</td>
                    <td className="px-4 py-3 align-middle text-slate-300">{planLabel[r.plan_type] ?? r.plan_type}</td>
                    <td className="px-4 py-3 align-middle capitalize text-slate-300">{r.status}</td>
                    <td className="px-4 py-3 align-middle whitespace-nowrap text-slate-400">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 align-middle text-right">
                      <button
                        type="button"
                        className="text-sm font-semibold text-[#f58e43] hover:underline"
                        onClick={() => {
                          setRejectNote("")
                          setSelected(r)
                        }}
                      >
                        Details
                      </button>
                    </td>
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

      <DashboardModal
        open={Boolean(selected)}
        title={selected ? `Booking #${selected.id}` : ""}
        onClose={() => setSelected(null)}
        footer={
          selected?.status === "pending" ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => void onAccept()}
                className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50"
              >
                Accept
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void onReject()}
                className="rounded-lg border border-rose-400/50 px-4 py-2 text-sm font-semibold text-rose-300 disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          ) : null
        }
      >
        {selected ? (
          <div className="space-y-3 text-sm text-slate-200">
            <p>
              <span className="text-slate-500">Land:</span> {selected.property_title}
            </p>
            <p>
              <span className="text-slate-500">Investor:</span> {selected.investor_username}
            </p>
            <p>
              <span className="text-slate-500">Plan:</span> {planLabel[selected.plan_type]}
            </p>
            <p>
              <span className="text-slate-500">Name:</span> {selected.full_name}
            </p>
            <p>
              <span className="text-slate-500">Email:</span> {selected.email}
            </p>
            <p>
              <span className="text-slate-500">Phone:</span> {selected.phone}
            </p>
            {selected.contact_notes ? (
              <p>
                <span className="text-slate-500">Notes:</span> {selected.contact_notes}
              </p>
            ) : null}
            {selected.referral_code_used ? (
              <p>
                <span className="text-slate-500">Referral code:</span> {selected.referral_code_used}
              </p>
            ) : null}
            <p>
              <span className="text-slate-500">Status:</span> {selected.status}
            </p>
            {selected.status === "rejected" && selected.rejection_reason ? (
              <p className="text-rose-300">Reason: {selected.rejection_reason}</p>
            ) : null}
            {selected.status === "pending" ? (
              <label className="block pt-2">
                <span className="text-xs text-slate-500">Rejection reason (optional)</span>
                <textarea
                  className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white"
                  rows={2}
                  value={rejectNote}
                  onChange={(e) => setRejectNote(e.target.value)}
                />
              </label>
            ) : null}
          </div>
        ) : null}
      </DashboardModal>

      <div className="rounded-xl border border-white/10 bg-white/2 p-4 sm:p-5">
        <h3 className="text-lg font-semibold text-white">Installment tracker</h3>
        <p className="mt-1 text-xs text-slate-500">Track due, paid, overdue and reminder status across visible bookings.</p>
        {installments.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">No installment schedules available yet.</p>
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
                    className={bookingSelectClass}
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
                    className={bookingSelectClass}
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
                    <th className="px-3 py-2">Booking</th>
                    <th className="px-3 py-2">Inst #</th>
                    <th className="px-3 py-2">Due</th>
                    <th className="px-3 py-2">Amount</th>
                    <th className="px-3 py-2">Paid</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Notification</th>
                    <th className="px-3 py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedInstallments.map((r) => (
                    <tr key={r.id} className="border-b border-white/5 hover:bg-white/2">
                      <td className="max-w-[250px] px-3 py-2 align-middle text-slate-200">
                        <span className="line-clamp-2">{r.property_title || `Booking #${r.booking_id}`}</span>
                      </td>
                      <td className="px-3 py-2 align-middle text-slate-300">#{r.booking_id}</td>
                      <td className="px-3 py-2 align-middle text-slate-300">{r.installment_no}</td>
                      <td className="px-3 py-2 align-middle whitespace-nowrap text-slate-400">
                        {r.due_date ? new Date(r.due_date).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-3 py-2 align-middle text-slate-300">{r.amount_due}</td>
                      <td className="px-3 py-2 align-middle text-slate-300">{r.amount_paid}</td>
                      <td className="px-3 py-2 align-middle capitalize text-slate-300">{r.status}</td>
                      <td className="px-3 py-2 align-middle capitalize text-slate-400">{r.notification.replace("_", " ")}</td>
                      <td className="px-3 py-2 text-right">
                        {r.status !== "paid" ? (
                          <button
                            type="button"
                            onClick={() => void onMarkInstallmentPaid(r.id)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-emerald-400 hover:bg-white/10"
                            title="Mark complete"
                            aria-label="Mark installment complete"
                          >
                            <FontAwesomeIcon icon={faCircleCheck} />
                          </button>
                        ) : (
                          <span className="text-xs text-slate-500">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
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
