import { useEffect, useMemo, useState } from "react"

import { DashboardModal } from "@/components/dashboard/dashboard-modal"
import { CompactFormSelect } from "@/components/ui/compact-form-select"
import { DashboardTablePagination } from "@/components/ui/dashboard-table-pagination"
import { TableLoader } from "@/components/ui/table-loader"
import { useToast } from "@/components/ui/use-toast"
import { createRetailInvestor, getRetailInvestors } from "@/services/api"
import type { InvestorUpsertPayload, RetailInvestor } from "@/types/domain"

const PAGE_SIZE = 12

export function AdminInvestorsPage() {
  const [rows, setRows] = useState<RetailInvestor[]>([])
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<InvestorUpsertPayload>({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
    password: "",
    is_active: true,
  })
  const { showToast } = useToast()

  function resetForm() {
    setForm({
      username: "",
      email: "",
      first_name: "",
      last_name: "",
      phone: "",
      password: "",
      is_active: true,
    })
  }

  useEffect(() => {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      return
    }
    setLoading(true)
    getRetailInvestors(token)
      .then((data) => {
        setRows(data)
        setLoading(false)
      })
      .catch((error) => {
        setLoading(false)
        const message = error instanceof Error ? error.message : "Failed to load investors."
        showToast(message, "error")
      })
  }, [showToast])

  async function saveInvestor() {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      showToast("Please login again.", "error")
      return
    }
    if (!form.username || !form.email || !form.password) {
      showToast("Username, email, and password are required.", "error")
      return
    }
    setSaving(true)
    try {
      await createRetailInvestor(form, token)
      showToast("Investor created.", "success")
      const data = await getRetailInvestors(token)
      setRows(data)
      setPage(1)
      setModalOpen(false)
      resetForm()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Investor create failed."
      showToast(message, "error")
    } finally {
      setSaving(false)
    }
  }

  const filtered = useMemo(() => {
    let list = rows
    if (statusFilter === "active") {
      list = list.filter((r) => r.is_active)
    } else if (statusFilter === "inactive") {
      list = list.filter((r) => !r.is_active)
    }
    const q = query.trim().toLowerCase()
    if (!q) {
      return list
    }
    return list.filter((r) =>
      [r.username, r.email, r.first_name, r.last_name, r.phone, r.referral_code].join(" ").toLowerCase().includes(q)
    )
  }, [rows, query, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, page])

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900/70 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">Investors</h2>
          <p className="mt-1 text-sm text-slate-400">All accounts with the investor role.</p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-slate-950 hover:bg-emerald-400"
        >
          Add investor
        </button>
      </div>
      <div className="dashboard-filters-row mt-4">
        <input
          className="dashboard-filter-input min-w-[220px] flex-1"
          placeholder="Search username, email, phone, referral code..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setPage(1)
          }}
        />
        <div className="dashboard-filter-group min-w-[160px]">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Account</span>
          <div className="dashboard-filter-select-shell">
            <CompactFormSelect
              ariaLabel="Filter investors by account status"
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v as "all" | "active" | "inactive")
                setPage(1)
              }}
              options={[
                { value: "all", label: "All investors" },
                { value: "active", label: "Active only" },
                { value: "inactive", label: "Inactive only" },
              ]}
            />
          </div>
        </div>
      </div>
      <div className="mt-4">
        {loading ? (
          <TableLoader
            rows={10}
            cols={7}
            colClasses={["w-[16%]", "w-[18%]", "w-[20%]", "w-[14%]", "w-[12%]", "w-[10%]", "w-[10%]"]}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-slate-300">
                  <th className="px-3 py-2">Username</th>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Phone</th>
                  <th className="px-3 py-2">Referral</th>
                  <th className="px-3 py-2">Joined</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((r) => (
                  <tr key={r.id} className="border-b border-white/10">
                    <td className="px-3 py-3">{r.username}</td>
                    <td className="px-3 py-3">{[r.first_name, r.last_name].filter(Boolean).join(" ") || "—"}</td>
                    <td className="px-3 py-3">{r.email}</td>
                    <td className="px-3 py-3">{r.phone || "—"}</td>
                    <td className="px-3 py-3 font-mono text-xs">{r.referral_code}</td>
                    <td className="px-3 py-3 text-xs text-slate-400">{r.date_joined?.slice(0, 10) ?? "—"}</td>
                    <td className="px-3 py-3">{r.is_active ? "Active" : "Inactive"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <DashboardTablePagination
        className="mt-4 text-sm"
        page={page}
        totalPages={totalPages}
        pageSize={PAGE_SIZE}
        totalItems={filtered.length}
        onPageChange={setPage}
      />

      <DashboardModal
        open={modalOpen}
        title="Add investor"
        onClose={() => {
          if (saving) return
          setModalOpen(false)
          resetForm()
        }}
        footer={
          <div className="flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setModalOpen(false)
                resetForm()
              }}
              className="dashboard-modal-btn-secondary"
              disabled={saving}
            >
              Cancel
            </button>
            <button type="button" onClick={() => void saveInvestor()} className="dashboard-modal-btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Create investor"}
            </button>
          </div>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            className="template-input"
            placeholder="Username *"
            value={form.username ?? ""}
            onChange={(e) => setForm((s) => ({ ...s, username: e.target.value }))}
          />
          <input
            className="template-input"
            placeholder="Email *"
            type="email"
            value={form.email ?? ""}
            onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
          />
          <input
            className="template-input"
            placeholder="First name"
            value={form.first_name ?? ""}
            onChange={(e) => setForm((s) => ({ ...s, first_name: e.target.value }))}
          />
          <input
            className="template-input"
            placeholder="Last name"
            value={form.last_name ?? ""}
            onChange={(e) => setForm((s) => ({ ...s, last_name: e.target.value }))}
          />
          <input
            className="template-input"
            placeholder="Phone"
            value={form.phone ?? ""}
            onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
          />
          <input
            className="template-input"
            placeholder="Password *"
            type="password"
            value={form.password ?? ""}
            onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
          />
          <label className="mt-1 flex items-center gap-2 text-sm text-slate-300 sm:col-span-2">
            <input
              type="checkbox"
              checked={Boolean(form.is_active)}
              onChange={(e) => setForm((s) => ({ ...s, is_active: e.target.checked }))}
              className="rounded border-white/20"
            />
            Active account
          </label>
        </div>
      </DashboardModal>
    </section>
  )
}
