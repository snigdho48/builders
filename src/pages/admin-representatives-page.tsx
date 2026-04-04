import { useEffect, useMemo, useState } from "react"

import { DashboardModal } from "@/components/dashboard/dashboard-modal"
import { CompactFormSelect } from "@/components/ui/compact-form-select"
import { DashboardTablePagination } from "@/components/ui/dashboard-table-pagination"
import {
  actionsButtonRowClass,
  stickyActionsTdCompactClass,
  stickyActionsThCompactClass,
} from "@/components/ui/sticky-table-actions"
import { faPenToSquare, faTrash, faUserCheck, faUserSlash } from "@fortawesome/free-solid-svg-icons"

import { TableActionIconButton } from "@/components/ui/table-action-button"
import { TableLoader } from "@/components/ui/table-loader"
import { useToast } from "@/components/ui/use-toast"
import {
  createRepresentative,
  deleteRepresentative,
  getRepresentatives,
  updateRepresentative,
} from "@/services/api"
import type { RepresentativeUpsertPayload, RepresentativeUser } from "@/types/domain"

const PAGE_SIZE = 10

export function AdminRepresentativesPage() {
  const [representatives, setRepresentatives] = useState<RepresentativeUser[]>([])
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<RepresentativeUpsertPayload>({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
    password: "",
    is_active: true,
  })
  const { showToast } = useToast()

  async function load(token: string) {
    setLoading(true)
    const reps = await getRepresentatives(token)
    setRepresentatives(reps)
    setLoading(false)
  }

  useEffect(() => {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      return
    }
    load(token).catch((error) => {
      setLoading(false)
      const message = error instanceof Error ? error.message : "Failed to load representatives."
      showToast(message, "error")
    })
  }, [showToast])

  const emptyForm = (): RepresentativeUpsertPayload => ({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
    password: "",
    is_active: true,
  })

  const closeModal = () => {
    setModalOpen(false)
    setEditingId(null)
    setForm(emptyForm())
  }

  async function handleSubmit() {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      showToast("Please login again.", "error")
      return
    }
    if (!form.username || !form.email || (!editingId && !form.password)) {
      showToast("Username, email, and password are required for new representative.", "error")
      return
    }
    try {
      if (editingId) {
        const payload: Partial<RepresentativeUpsertPayload> = { ...form }
        if (!payload.password) {
          delete payload.password
        }
        await updateRepresentative(editingId, payload, token)
        showToast("Representative updated.", "success")
      } else {
        await createRepresentative(form, token)
        showToast("Representative created.", "success")
      }
      await load(token)
      closeModal()
      setPage(1)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Representative save failed."
      showToast(message, "error")
    }
  }

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm())
    setModalOpen(true)
  }

  function openEdit(rep: RepresentativeUser) {
    setEditingId(rep.id)
    setForm({
      username: rep.username,
      email: rep.email,
      first_name: rep.first_name,
      last_name: rep.last_name,
      phone: rep.phone,
      password: "",
      is_active: rep.is_active,
    })
    setModalOpen(true)
  }

  async function handleDelete(rep: RepresentativeUser) {
    if (
      !window.confirm(
        `Delete representative "${rep.username}"? This removes the account if the server allows it.`
      )
    ) {
      return
    }
    const token = localStorage.getItem("accessToken")
    if (!token) {
      return
    }
    try {
      await deleteRepresentative(rep.id, token)
      showToast("Representative deleted.", "success")
      await load(token)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Delete failed."
      showToast(message, "error")
    }
  }

  async function toggleRepresentativeActive(rep: RepresentativeUser) {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      return
    }
    const next = !rep.is_active
    const label = next ? "Activate" : "Deactivate"
    if (
      !window.confirm(
        `${label} ${rep.username}? ${next ? "They will be able to sign in again." : "They will not be able to sign in until reactivated."}`
      )
    ) {
      return
    }
    try {
      await updateRepresentative(rep.id, { is_active: next }, token)
      showToast(next ? "Representative activated." : "Representative deactivated.", "success")
      await load(token)
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Update failed.", "error")
    }
  }

  const filtered = useMemo(() => {
    let list = representatives
    if (statusFilter === "active") {
      list = list.filter((r) => r.is_active)
    } else if (statusFilter === "inactive") {
      list = list.filter((r) => !r.is_active)
    }
    const q = query.trim().toLowerCase()
    if (!q) {
      return list
    }
    return list.filter((rep) =>
      [rep.username, rep.email, rep.phone, rep.first_name, rep.last_name].join(" ").toLowerCase().includes(q)
    )
  }, [representatives, query, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, page])

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900/70 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">Representatives</h2>
          <p className="mt-1 text-sm text-slate-400">
            Create and manage representative accounts. <strong>Properties</strong> = listings where they are the
            assigned representative.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-slate-950"
        >
          Add representative
        </button>
      </div>
      <div className="dashboard-filters-row mt-4">
        <input
          className="dashboard-filter-input min-w-[220px] flex-1"
          placeholder="Search username, email, phone..."
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
              ariaLabel="Filter by active or inactive"
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v as "all" | "active" | "inactive")
                setPage(1)
              }}
              options={[
                { value: "all", label: "All accounts" },
                { value: "active", label: "Active only" },
                { value: "inactive", label: "Inactive only" },
              ]}
            />
          </div>
        </div>
      </div>
      <div className="mt-4">
        {loading ? (
          <TableLoader rows={10} cols={6} colClasses={["w-[18%]", "w-[26%]", "w-[16%]", "w-[10%]", "w-[10%]", "w-[20%]"]} />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-slate-300">
                  <th className="px-3 py-2">Username</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Phone</th>
                  <th className="px-3 py-2">Properties</th>
                  <th className="px-3 py-2">Status</th>
                  <th className={stickyActionsThCompactClass}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((rep) => (
                  <tr key={rep.id} className="group border-b border-white/10">
                    <td className="px-3 py-3">{rep.username}</td>
                    <td className="px-3 py-3">{rep.email}</td>
                    <td className="px-3 py-3">{rep.phone || "-"}</td>
                    <td className="px-3 py-3 tabular-nums">{rep.property_count ?? 0}</td>
                    <td className="px-3 py-3">{rep.is_active ? "Active" : "Inactive"}</td>
                    <td className={stickyActionsTdCompactClass}>
                      <div className={actionsButtonRowClass}>
                        <TableActionIconButton
                          icon={faPenToSquare}
                          label="Edit representative"
                          tone="neutral"
                          onClick={() => openEdit(rep)}
                        />
                        <TableActionIconButton
                          icon={rep.is_active ? faUserSlash : faUserCheck}
                          label={rep.is_active ? "Deactivate account" : "Activate account"}
                          tone="warning"
                          onClick={() => void toggleRepresentativeActive(rep)}
                        />
                        <TableActionIconButton
                          icon={faTrash}
                          label="Delete representative"
                          tone="danger"
                          onClick={() => void handleDelete(rep)}
                        />
                      </div>
                    </td>
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
        title={editingId ? "Update representative" : "Create representative"}
        onClose={closeModal}
        wide
        footer={
          <div className="flex flex-wrap items-center justify-end gap-3">
            <button type="button" onClick={closeModal} className="dashboard-modal-btn-secondary">
              Cancel
            </button>
            <button type="button" onClick={handleSubmit} className="dashboard-modal-btn-primary">
              {editingId ? "Save changes" : "Create"}
            </button>
          </div>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            className="template-input"
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm((c) => ({ ...c, username: e.target.value }))}
          />
          <input
            className="template-input"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))}
          />
          <input
            className="template-input"
            placeholder={editingId ? "Password (optional for update)" : "Password"}
            type="password"
            value={form.password}
            onChange={(e) => setForm((c) => ({ ...c, password: e.target.value }))}
          />
          <input
            className="template-input"
            placeholder="First name"
            value={form.first_name}
            onChange={(e) => setForm((c) => ({ ...c, first_name: e.target.value }))}
          />
          <input
            className="template-input"
            placeholder="Last name"
            value={form.last_name}
            onChange={(e) => setForm((c) => ({ ...c, last_name: e.target.value }))}
          />
          <input
            className="template-input"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm((c) => ({ ...c, phone: e.target.value }))}
          />
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={form.is_active ?? true}
            onChange={(e) => setForm((c) => ({ ...c, is_active: e.target.checked }))}
          />
          Active account
        </label>
      </DashboardModal>
    </section>
  )
}
