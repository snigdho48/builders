import { useEffect, useState } from "react"

import { useToast } from "@/components/ui/use-toast"
import {
  createRepresentative,
  deleteRepresentative,
  getDashboardByRole,
  getRepresentatives,
  updateRepresentative,
} from "@/services/api"
import type { AdminDashboardData, RepresentativeUpsertPayload, RepresentativeUser } from "@/types/domain"

export function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardData | null>(null)
  const [representatives, setRepresentatives] = useState<RepresentativeUser[]>([])
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

  async function loadAdminData(token: string) {
    const [dashboardPayload, repsPayload] = await Promise.all([
      getDashboardByRole(token),
      getRepresentatives(token),
    ])
    setData(dashboardPayload as AdminDashboardData)
    setRepresentatives(repsPayload)
  }

  useEffect(() => {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      return
    }
    const timeoutId = window.setTimeout(() => {
      loadAdminData(token).catch((error) => {
        const message = error instanceof Error ? error.message : "Failed to load admin dashboard."
        showToast(message, "error")
      })
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [showToast])

  const resetForm = () => {
    setForm({
      username: "",
      email: "",
      first_name: "",
      last_name: "",
      phone: "",
      password: "",
      is_active: true,
    })
    setEditingId(null)
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
      await loadAdminData(token)
      resetForm()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Representative save failed."
      showToast(message, "error")
    }
  }

  function handleEdit(rep: RepresentativeUser) {
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
  }

  async function handleDelete(id: number) {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      return
    }
    try {
      await deleteRepresentative(id, token)
      showToast("Representative deleted.", "success")
      await loadAdminData(token)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Delete failed."
      showToast(message, "error")
    }
  }

  if (!data) {
    return <main className="bg-slate-950 px-4 py-20 text-slate-300 sm:px-6">Loading admin dashboard...</main>
  }

  return (
    <main className="bg-slate-950 px-4 py-14 text-white sm:px-6">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm uppercase tracking-[0.22em] text-emerald-300">Admin Dashboard</p>
        <h1 className="mt-2 text-3xl font-semibold">Platform Control Center</h1>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <article className="metric-card"><p>Total Users</p><strong>{data.total_users}</strong></article>
          <article className="metric-card"><p>Total Properties</p><strong>{data.total_properties}</strong></article>
          <article className="metric-card"><p>Total Investments</p><strong>{data.total_investments}</strong></article>
          <article className="metric-card"><p>Total Payments</p><strong>{data.total_payments}</strong></article>
          <article className="metric-card"><p>Pending Payments</p><strong>{data.pending_payments}</strong></article>
          <article className="metric-card"><p>Total Referral Commission</p><strong>${data.total_referral_commission}</strong></article>
        </div>

        <section className="mt-10 rounded-2xl border border-white/10 bg-slate-900/70 p-6">
          <h2 className="text-2xl font-semibold">Representative Management</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <input
              className="template-input"
              placeholder="Username"
              value={form.username}
              onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
            />
            <input
              className="template-input"
              placeholder="Email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            />
            <input
              className="template-input"
              placeholder={editingId ? "Password (optional for update)" : "Password"}
              type="password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            />
            <input
              className="template-input"
              placeholder="First Name"
              value={form.first_name}
              onChange={(event) => setForm((current) => ({ ...current, first_name: event.target.value }))}
            />
            <input
              className="template-input"
              placeholder="Last Name"
              value={form.last_name}
              onChange={(event) => setForm((current) => ({ ...current, last_name: event.target.value }))}
            />
            <input
              className="template-input"
              placeholder="Phone"
              value={form.phone}
              onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
            />
          </div>
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleSubmit}
              className="rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              {editingId ? "Update Representative" : "Create Representative"}
            </button>
            {editingId ? (
              <button
                onClick={resetForm}
                className="rounded-xl border border-white/20 px-4 py-2 font-semibold text-white"
              >
                Cancel Edit
              </button>
            ) : null}
          </div>

          <div className="mt-6 overflow-x-auto">
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
                {representatives.map((rep) => (
                  <tr key={rep.id} className="border-b border-white/10">
                    <td className="px-3 py-3">{rep.username}</td>
                    <td className="px-3 py-3">{rep.email}</td>
                    <td className="px-3 py-3">{rep.phone || "-"}</td>
                    <td className="px-3 py-3">{rep.is_active ? "Active" : "Inactive"}</td>
                    <td className="px-3 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(rep)}
                          className="rounded border border-white/20 px-2 py-1 text-xs"
                        >
                          Edit
                        </button>
                        <button
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
        </section>
      </div>
    </main>
  )
}
