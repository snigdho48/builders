import { useEffect, useMemo, useState } from "react"

import { DashboardModal } from "@/components/dashboard/dashboard-modal"
import { CompactFormSelect } from "@/components/ui/compact-form-select"
import { DashboardTablePagination } from "@/components/ui/dashboard-table-pagination"
import { TableLoader } from "@/components/ui/table-loader"
import { useToast } from "@/components/ui/use-toast"
import { createRetailInvestor, listRetailInvestors, patchRetailInvestorKyc } from "@/services/api"
import type { InvestorKycStatus, InvestorUpsertPayload, RetailInvestor } from "@/types/domain"

const PAGE_SIZE = 12

const KYC_OPTIONS: { value: InvestorKycStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
]

function KycPill({ status }: { status: InvestorKycStatus }) {
  const styles: Record<InvestorKycStatus, string> = {
    pending: "bg-slate-700/50 text-slate-300",
    approved: "bg-emerald-500/20 text-emerald-300",
    rejected: "bg-rose-500/20 text-rose-300",
  }
  const labels: Record<InvestorKycStatus, string> = {
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
  }
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}

export type AdminInvestorsPageProps = {
  /** When false (e.g. agent dashboard), hide investor creation; KYC tools stay available. */
  allowCreateInvestor?: boolean
}

export function AdminInvestorsPage({ allowCreateInvestor = true }: AdminInvestorsPageProps) {
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
  const [kycModalOpen, setKycModalOpen] = useState(false)
  const [kycTarget, setKycTarget] = useState<RetailInvestor | null>(null)
  const [kycStatus, setKycStatus] = useState<InvestorKycStatus>("pending")
  const [kycNotes, setKycNotes] = useState("")
  const [kycSaving, setKycSaving] = useState(false)
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

  function openKycModal(row: RetailInvestor) {
    setKycTarget(row)
    setKycStatus(row.kyc_status)
    setKycNotes(row.kyc_notes)
    setKycModalOpen(true)
  }

  function closeKycModal() {
    if (kycSaving) return
    setKycModalOpen(false)
    setKycTarget(null)
  }

  useEffect(() => {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      return
    }
    setLoading(true)
    listRetailInvestors(token)
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
      const data = await listRetailInvestors(token)
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

  async function saveKyc() {
    const token = localStorage.getItem("accessToken")
    if (!token || !kycTarget) {
      showToast("Please login again.", "error")
      return
    }
    setKycSaving(true)
    try {
      const updated = await patchRetailInvestorKyc(kycTarget.id, { kyc_status: kycStatus, kyc_notes: kycNotes }, token)
      setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
      showToast("KYC updated.", "success")
      closeKycModal()
    } catch (error) {
      const message = error instanceof Error ? error.message : "KYC update failed."
      showToast(message, "error")
    } finally {
      setKycSaving(false)
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
      [
        r.username,
        r.email,
        r.first_name,
        r.last_name,
        r.phone,
        r.referral_code,
        r.kyc_status,
        r.kyc_verified_by_username,
        r.kyc_investor_notes,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q),
    )
  }, [rows, query, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, page])

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Investors</h2>
          <p className="mt-1 text-sm text-slate-600">
            {allowCreateInvestor
              ? "Investors can request KYC review from their profile; staff set the final status here."
              : "Investors can request KYC from their profile; you can record verification here. Creation is admin-only."}
          </p>
        </div>
        {allowCreateInvestor ? (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-slate-950 hover:bg-emerald-400"
          >
            Add investor
          </button>
        ) : null}
      </div>
      <div className="dashboard-filters-row mt-4">
        <input
          className="dashboard-filter-input min-w-[220px] flex-1"
          placeholder="Search username, email, phone, referral, KYC…"
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
            cols={9}
            colClasses={["w-[12%]", "w-[14%]", "w-[16%]", "w-[12%]", "w-[10%]", "w-[9%]", "w-[8%]", "w-[10%]", "w-[9%]"]}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 align-middle">Username</th>
                  <th className="px-4 py-3 align-middle">Name</th>
                  <th className="px-4 py-3 align-middle">Email</th>
                  <th className="px-4 py-3 align-middle whitespace-nowrap">Phone</th>
                  <th className="px-4 py-3 align-middle">Referral</th>
                  <th className="px-4 py-3 align-middle whitespace-nowrap">Joined</th>
                  <th className="px-4 py-3 align-middle whitespace-nowrap">Acct</th>
                  <th className="px-4 py-3 align-middle whitespace-nowrap">KYC</th>
                  <th className="px-4 py-3 align-middle whitespace-nowrap"> </th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50">
                    <td className="px-4 py-3 align-middle text-slate-900">{r.username}</td>
                    <td className="px-4 py-3 align-middle text-slate-800">
                      {[r.first_name, r.last_name].filter(Boolean).join(" ") || "—"}
                    </td>
                    <td className="px-4 py-3 align-middle text-slate-800">{r.email}</td>
                    <td className="px-4 py-3 align-middle text-slate-600">{r.phone || "—"}</td>
                    <td className="px-4 py-3 align-middle font-mono text-xs text-slate-600">{r.referral_code}</td>
                    <td className="px-4 py-3 align-middle text-xs text-slate-400">{r.date_joined?.slice(0, 10) ?? "—"}</td>
                    <td className="px-4 py-3 align-middle text-slate-700">{r.is_active ? "Active" : "Inactive"}</td>
                    <td className="px-4 py-3 align-middle">
                      <KycPill status={r.kyc_status} />
                      {r.kyc_requested_at ? (
                        <span className="mt-1 inline-block rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-medium text-amber-200">
                          Requested
                        </span>
                      ) : null}
                      {r.kyc_verified_at ? (
                        <p className="mt-1 text-[10px] leading-tight text-slate-500">
                          {r.kyc_verified_by_username ? `${r.kyc_verified_by_username} · ` : null}
                          {r.kyc_verified_at.slice(0, 10)}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <button
                        type="button"
                        onClick={() => openKycModal(r)}
                        className="text-xs font-semibold text-[#f58e43] hover:underline"
                      >
                        Set KYC
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && filtered.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">No investors match your filters.</p>
        ) : null}
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
        open={kycModalOpen}
        title={kycTarget ? `KYC — ${kycTarget.username}` : "KYC"}
        onClose={closeKycModal}
        footer={
          <div className="flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={closeKycModal}
              className="dashboard-modal-btn-secondary"
              disabled={kycSaving}
            >
              Cancel
            </button>
            <button type="button" onClick={() => void saveKyc()} className="dashboard-modal-btn-primary" disabled={kycSaving}>
              {kycSaving ? "Saving…" : "Save KYC"}
            </button>
          </div>
        }
      >
        {kycTarget ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Investor request</p>
              {kycTarget.kyc_requested_at ? (
                <p className="mt-1 text-xs text-slate-400">
                  Submitted {kycTarget.kyc_requested_at.slice(0, 19).replace("T", " ")}
                </p>
              ) : (
                <p className="mt-1 text-xs text-slate-500">No in-app request yet.</p>
              )}
              {kycTarget.kyc_investor_notes ? (
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-800">{kycTarget.kyc_investor_notes}</p>
              ) : (
                <p className="mt-2 text-xs text-slate-500">No message from investor.</p>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Staff notes below are internal only. Investors see KYC status, not staff notes.
            </p>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Status</span>
              <div className="dashboard-filter-select-shell mt-1">
                <CompactFormSelect
                  ariaLabel="KYC status"
                  value={kycStatus}
                  onValueChange={(v) => setKycStatus(v as InvestorKycStatus)}
                  options={KYC_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-500" htmlFor="kyc-notes">
                Staff notes
              </label>
              <textarea
                id="kyc-notes"
                className="template-input mt-1 min-h-[100px] w-full resize-y"
                value={kycNotes}
                onChange={(e) => setKycNotes(e.target.value)}
                placeholder="Document reference, ID check result, follow-up items…"
              />
            </div>
          </div>
        ) : null}
      </DashboardModal>

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
          <label className="mt-1 flex items-center gap-2 text-sm text-slate-700 sm:col-span-2">
            <input
              type="checkbox"
              checked={Boolean(form.is_active)}
              onChange={(e) => setForm((s) => ({ ...s, is_active: e.target.checked }))}
              className="rounded border-slate-300"
            />
            Active account
          </label>
        </div>
      </DashboardModal>
    </section>
  )
}
