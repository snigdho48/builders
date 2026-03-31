import { useEffect, useMemo, useState } from "react"

import { DashboardModal } from "@/components/dashboard/dashboard-modal"
import { useToast } from "@/components/ui/use-toast"
import { createAgent, deleteAgent, getAgents, updateAgent } from "@/services/api"
import type { AgentUpsertPayload, AgentUser } from "@/types/domain"

const PAGE_SIZE = 10

export function RepresentativeAgentsPage() {
  const [agents, setAgents] = useState<AgentUser[]>([])
  const [agentPage, setAgentPage] = useState(1)
  const [agentQuery, setAgentQuery] = useState("")
  const [showAgentForm, setShowAgentForm] = useState(false)
  const [editingAgentId, setEditingAgentId] = useState<number | null>(null)
  const [agentForm, setAgentForm] = useState<AgentUpsertPayload>({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
    password: "",
    is_active: true,
    referral_commission_percent: "5.00",
  })
  const { showToast } = useToast()

  async function loadAgents(token: string) {
    const list = await getAgents(token)
    setAgents(list)
  }

  useEffect(() => {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      return
    }
    loadAgents(token).catch((error) => {
      const message = error instanceof Error ? error.message : "Failed to load agents."
      showToast(message, "error")
    })
  }, [showToast])

  const closeModal = () => {
    setShowAgentForm(false)
    setEditingAgentId(null)
    setAgentForm({
      username: "",
      email: "",
      first_name: "",
      last_name: "",
      phone: "",
      password: "",
      is_active: true,
      referral_commission_percent: "5.00",
    })
  }

  async function saveAgent() {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      return
    }
    try {
      if (editingAgentId) {
        const payload = { ...agentForm }
        if (!payload.password) {
          delete payload.password
        }
        await updateAgent(editingAgentId, payload, token)
        showToast("Agent updated.", "success")
      } else {
        if (!agentForm.password) {
          showToast("Password is required for new agent.", "error")
          return
        }
        await createAgent(agentForm, token)
        showToast("Agent created.", "success")
      }
      await loadAgents(token)
      closeModal()
      setAgentPage(1)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Agent save failed."
      showToast(message, "error")
    }
  }

  async function removeAgent(id: number) {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      return
    }
    try {
      await deleteAgent(id, token)
      showToast("Agent deleted.", "success")
      await loadAgents(token)
      setAgentPage(1)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Agent delete failed."
      showToast(message, "error")
    }
  }

  function editAgent(item: AgentUser) {
    setEditingAgentId(item.id)
    setShowAgentForm(true)
    setAgentForm({
      username: item.username,
      email: item.email,
      first_name: item.first_name,
      last_name: item.last_name,
      phone: item.phone,
      password: "",
      is_active: item.is_active,
      referral_commission_percent: item.referral_commission_percent,
    })
  }

  const filteredAgents = useMemo(() => {
    const query = agentQuery.trim().toLowerCase()
    if (!query) {
      return agents
    }
    return agents.filter((item) =>
      [item.username, item.email, item.first_name, item.last_name, item.phone].join(" ").toLowerCase().includes(query)
    )
  }, [agents, agentQuery])

  const agentTotalPages = Math.max(1, Math.ceil(filteredAgents.length / PAGE_SIZE))
  const paginatedAgents = useMemo(() => {
    const start = (agentPage - 1) * PAGE_SIZE
    return filteredAgents.slice(start, start + PAGE_SIZE)
  }, [filteredAgents, agentPage, PAGE_SIZE])

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900/70 p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">Agents</h2>
          <p className="mt-1 text-sm text-slate-400">Create and manage agents on your team.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            closeModal()
            setEditingAgentId(null)
            setAgentForm({
              username: "",
              email: "",
              first_name: "",
              last_name: "",
              phone: "",
              password: "",
              is_active: true,
              referral_commission_percent: "5.00",
            })
            setShowAgentForm(true)
          }}
          className="rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-slate-950"
        >
          Add agent
        </button>
      </div>

      <div className="mb-4">
        <input
          className="template-input w-full sm:w-96"
          placeholder="Search by username, email, phone..."
          value={agentQuery}
          onChange={(event) => {
            setAgentQuery(event.target.value)
            setAgentPage(1)
          }}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-slate-300">
              <th className="px-3 py-2">Username</th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Phone</th>
              <th className="px-3 py-2">Ref %</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedAgents.map((item) => (
              <tr key={item.id} className="border-b border-white/10">
                <td className="px-3 py-3">{item.username}</td>
                <td className="px-3 py-3">{[item.first_name, item.last_name].filter(Boolean).join(" ") || "-"}</td>
                <td className="px-3 py-3">{item.email}</td>
                <td className="px-3 py-3">{item.phone || "-"}</td>
                <td className="px-3 py-3">{item.referral_commission_percent ?? "-"}</td>
                <td className="px-3 py-3">{item.is_active ? "Active" : "Inactive"}</td>
                <td className="px-3 py-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => editAgent(item)}
                      className="rounded border border-white/20 px-2 py-1 text-xs"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => removeAgent(item.id)}
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
        <p>
          Showing {paginatedAgents.length} of {filteredAgents.length} agents
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={agentPage <= 1}
            onClick={() => setAgentPage((current) => Math.max(1, current - 1))}
            className="rounded border border-white/20 px-3 py-1 disabled:opacity-40"
          >
            Previous
          </button>
          <span>
            Page {agentPage} / {agentTotalPages}
          </span>
          <button
            type="button"
            disabled={agentPage >= agentTotalPages}
            onClick={() => setAgentPage((current) => Math.min(agentTotalPages, current + 1))}
            className="rounded border border-white/20 px-3 py-1 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      <DashboardModal
        open={showAgentForm}
        title={editingAgentId ? "Update agent" : "Create agent"}
        onClose={closeModal}
        wide
        footer={
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void saveAgent()}
              className="rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-slate-950"
            >
              {editingAgentId ? "Save changes" : "Create agent"}
            </button>
            <button type="button" onClick={closeModal} className="rounded-xl border border-white/20 px-4 py-2">
              Cancel
            </button>
          </div>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <input
            className="template-input"
            placeholder="Username"
            value={agentForm.username}
            onChange={(event) => setAgentForm((current) => ({ ...current, username: event.target.value }))}
          />
          <input
            className="template-input"
            placeholder="Email"
            value={agentForm.email}
            onChange={(event) => setAgentForm((current) => ({ ...current, email: event.target.value }))}
          />
          <input
            className="template-input"
            placeholder={editingAgentId ? "Password (optional)" : "Password"}
            type="password"
            value={agentForm.password}
            onChange={(event) => setAgentForm((current) => ({ ...current, password: event.target.value }))}
          />
          <input
            className="template-input"
            placeholder="First name"
            value={agentForm.first_name}
            onChange={(event) => setAgentForm((current) => ({ ...current, first_name: event.target.value }))}
          />
          <input
            className="template-input"
            placeholder="Last name"
            value={agentForm.last_name}
            onChange={(event) => setAgentForm((current) => ({ ...current, last_name: event.target.value }))}
          />
          <input
            className="template-input"
            placeholder="Phone"
            value={agentForm.phone}
            onChange={(event) => setAgentForm((current) => ({ ...current, phone: event.target.value }))}
          />
          <input
            className="template-input"
            placeholder="Referral commission %"
            value={agentForm.referral_commission_percent ?? "5.00"}
            onChange={(event) =>
              setAgentForm((current) => ({
                ...current,
                referral_commission_percent: event.target.value,
              }))
            }
          />
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={agentForm.is_active ?? true}
            onChange={(event) => setAgentForm((current) => ({ ...current, is_active: event.target.checked }))}
          />
          Active account
        </label>
      </DashboardModal>
    </section>
  )
}
