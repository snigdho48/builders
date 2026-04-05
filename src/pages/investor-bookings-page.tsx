import { useCallback, useEffect, useMemo, useState } from "react"

import { CompactFormSelect } from "@/components/ui/compact-form-select"
import { listLandBookings } from "@/services/api"
import type { LandBooking } from "@/types/domain"

const planLabel: Record<string, string> = {
  one_percent_installment: "1% installment",
  fifty_percent_installment: "50% installment",
}

export function InvestorBookingsPage() {
  const [rows, setRows] = useState<LandBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [tableSearch, setTableSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | LandBooking["status"]>("all")
  const [planFilter, setPlanFilter] = useState<"all" | LandBooking["plan_type"]>("all")

  const load = useCallback(async () => {
    const token = localStorage.getItem("accessToken")
    if (!token) return
    setLoading(true)
    try {
      const list = await listLandBookings(token)
      setRows(list)
    } catch {
      setRows([])
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

  return (
    <section className="space-y-6 rounded-2xl border border-white/10 bg-slate-900/70 p-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">My land bookings</h2>
        <p className="mt-1 text-sm text-slate-400">Track requests you submitted from land detail pages.</p>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="rounded-xl border border-white/10 bg-white/[0.03] px-6 py-10 text-center text-slate-400">
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
              <thead className="border-b border-white/10 bg-white/[0.04] text-xs font-semibold uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-4 py-3 align-middle">Land</th>
                  <th className="px-4 py-3 align-middle">Plan</th>
                  <th className="px-4 py-3 align-middle whitespace-nowrap">Booked</th>
                  <th className="px-4 py-3 align-middle whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((r) => (
                  <tr key={r.id} className="border-b border-white/5 transition-colors hover:bg-white/[0.02]">
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
    </section>
  )
}
