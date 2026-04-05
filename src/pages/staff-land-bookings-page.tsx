import { useCallback, useEffect, useMemo, useState } from "react"

import { DashboardModal } from "@/components/dashboard/dashboard-modal"
import { CompactFormSelect } from "@/components/ui/compact-form-select"
import { useToast } from "@/components/ui/use-toast"
import { acceptLandBooking, listLandBookings, rejectLandBooking } from "@/services/api"
import type { LandBooking } from "@/types/domain"

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

  const load = useCallback(async () => {
    const token = localStorage.getItem("accessToken")
    if (!token) return
    setLoading(true)
    try {
      setRows(await listLandBookings(token))
    } catch {
      setRows([])
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
              <thead className="border-b border-white/10 bg-white/[0.04] text-xs font-semibold uppercase tracking-wide text-slate-400">
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
                  <tr key={r.id} className="border-b border-white/5 transition-colors hover:bg-white/[0.02]">
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
    </section>
  )
}
