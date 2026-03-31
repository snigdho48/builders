import { useEffect, useMemo, useState } from "react"

import { DashboardModal } from "@/components/dashboard/dashboard-modal"
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
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
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
    const reps = await getRepresentatives(token)
    setRepresentatives(reps)
  }

  useEffect(() => {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      return
    }
    load(token).catch((error) => {
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

  async function handleDelete(id: number) {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      return
    }
    try {
      await deleteRepresentative(id, token)
      showToast("Representative deleted.", "success")
      await load(token)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Delete failed."
      showToast(message, "error")
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) {
      return representatives
    }
    return representatives.filter((rep) =>
      [rep.username, rep.email, rep.phone, rep.first_name, rep.last_name].join(" ").toLowerCase().includes(q)
    )
  }, [representatives, query])

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
          <p className="mt-1 text-sm text-slate-400">Create and manage representative accounts.</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-slate-950"
        >
          Add representative
        </button>
      </div>
      <div className="mt-4">
        <input
          className="template-input w-full sm:w-96"
          placeholder="Search username, email, phone..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setPage(1)
          }}
        />
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-slate-300">
              <th className="px-3 py-2">Username</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Phone</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((rep) => (
              <tr key={rep.id} className="border-b border-white/10">
                <td className="px-3 py-3">{rep.username}</td>
                <td className="px-3 py-3">{rep.email}</td>
                <td className="px-3 py-3">{rep.phone || "-"}</td>
                <td className="px-3 py-3">{rep.is_active ? "Active" : "Inactive"}</td>
                <td className="px-3 py-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(rep)}
                      className="rounded border border-white/20 px-2 py-1 text-xs"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(rep.id)}
                      className="rounded border border-rose-400/40 px-2 py-1 text-xs text-rose-300"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-300">
        <span>
          Showing {pageRows.length} of {filtered.length}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded border border-white/20 px-3 py-1 disabled:opacity-40"
          >
            Previous
          </button>
          <span>
            Page {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded border border-white/20 px-3 py-1 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      <DashboardModal
        open={modalOpen}
        title={editingId ? "Update representative" : "Create representative"}
        onClose={closeModal}
        wide
        footer={
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleSubmit}
              className="rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-slate-950"
            >
              {editingId ? "Save changes" : "Create"}
            </button>
            <button type="button" onClick={closeModal} className="rounded-xl border border-white/20 px-4 py-2">
              Cancel
            </button>
          </div>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
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
