import { useEffect, useMemo, useState } from "react"
import { useLocation } from "react-router-dom"

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
import { createAgent, deleteAgent, getAgents, updateAgent } from "@/services/api"
import type { AgentUpsertPayload, AgentUser } from "@/types/domain"

const PAGE_SIZE = 10

export function RepresentativeAgentsPage() {
  const location = useLocation()
  const isAdminContext = location.pathname.startsWith("/dashboard/admin")
  const [agents, setAgents] = useState<AgentUser[]>([])
  const [agentPage, setAgentPage] = useState(1)
  const [agentQuery, setAgentQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")
  const [showAgentForm, setShowAgentForm] = useState(false)
  const [editingAgentId, setEditingAgentId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
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
    setLoading(true)
    const list = await getAgents(token)
    setAgents(list)
    setLoading(false)
  }

  useEffect(() => {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      return
    }
    loadAgents(token).catch((error) => {
      setLoading(false)
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

  async function removeAgent(item: AgentUser) {
    if (!window.confirm(`Delete agent "${item.username}"? This cannot be undone if the server allows removal.`)) {
      return
    }
    const token = localStorage.getItem("accessToken")
    if (!token) {
      return
    }
    try {
      await deleteAgent(item.id, token)
      showToast("Agent deleted.", "success")
      await loadAgents(token)
      setAgentPage(1)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Agent delete failed."
      showToast(message, "error")
    }
  }

  async function toggleAgentActive(item: AgentUser) {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      return
    }
    const next = !item.is_active
    if (
      !window.confirm(
        next
          ? `Activate ${item.username}? They will be able to sign in again.`
          : `Deactivate ${item.username}? They will not be able to sign in until reactivated.`
      )
    ) {
      return
    }
    try {
      await updateAgent(item.id, { is_active: next }, token)
      showToast(next ? "Agent activated." : "Agent deactivated.", "success")
      await loadAgents(token)
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Update failed.", "error")
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
    let list = agents
    if (statusFilter === "active") {
      list = list.filter((a) => a.is_active)
    } else if (statusFilter === "inactive") {
      list = list.filter((a) => !a.is_active)
    }
    const query = agentQuery.trim().toLowerCase()
    if (!query) {
      return list
    }
    return list.filter((item) =>
      [item.username, item.email, item.first_name, item.last_name, item.phone].join(" ").toLowerCase().includes(query)
    )
  }, [agents, agentQuery, statusFilter])

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
          <p className="mt-1 text-sm text-slate-400">
            {isAdminContext
              ? "All agent accounts. Property count = listings assigned to that agent."
              : "Create and manage agents on your team."}
          </p>
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

      <div className="dashboard-filters-row mb-4">
        <input
          className="dashboard-filter-input min-w-[220px] flex-1"
          placeholder="Search by username, email, phone..."
          value={agentQuery}
          onChange={(event) => {
            setAgentQuery(event.target.value)
            setAgentPage(1)
          }}
        />
        <div className="dashboard-filter-group min-w-[160px]">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Account</span>
          <div className="dashboard-filter-select-shell">
            <CompactFormSelect
              ariaLabel="Filter agents by status"
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v as "all" | "active" | "inactive")
                setAgentPage(1)
              }}
              options={[
                { value: "all", label: "All agents" },
                { value: "active", label: "Active only" },
                { value: "inactive", label: "Inactive only" },
              ]}
            />
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        {loading ? (
          <TableLoader
            rows={8}
            cols={8}
            colClasses={["w-[14%]", "w-[16%]", "w-[18%]", "w-[12%]", "w-[8%]", "w-[8%]", "w-[8%]", "w-[16%]"]}
          />
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-slate-300">
                <th className="px-3 py-2">Username</th>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Phone</th>
                <th className="px-3 py-2">Ref %</th>
                <th className="px-3 py-2">Properties</th>
                <th className="px-3 py-2">Status</th>
                <th className={stickyActionsThCompactClass}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAgents.map((item) => (
                <tr key={item.id} className="group border-b border-white/10">
                  <td className="px-3 py-3">{item.username}</td>
                  <td className="px-3 py-3">{[item.first_name, item.last_name].filter(Boolean).join(" ") || "-"}</td>
                  <td className="px-3 py-3">{item.email}</td>
                  <td className="px-3 py-3">{item.phone || "-"}</td>
                  <td className="px-3 py-3">{item.referral_commission_percent ?? "-"}</td>
                  <td className="px-3 py-3 tabular-nums">{item.property_count ?? 0}</td>
                  <td className="px-3 py-3">{item.is_active ? "Active" : "Inactive"}</td>
                  <td className={stickyActionsTdCompactClass}>
                    <div className={actionsButtonRowClass}>
                      <TableActionIconButton
                        icon={faPenToSquare}
                        label="Edit agent"
                        tone="neutral"
                        onClick={() => editAgent(item)}
                      />
                      <TableActionIconButton
                        icon={item.is_active ? faUserSlash : faUserCheck}
                        label={item.is_active ? "Deactivate account" : "Activate account"}
                        tone="warning"
                        onClick={() => void toggleAgentActive(item)}
                      />
                      <TableActionIconButton
                        icon={faTrash}
                        label="Delete agent"
                        tone="danger"
                        onClick={() => void removeAgent(item)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <DashboardTablePagination
        className="mt-4 text-sm"
        page={agentPage}
        totalPages={agentTotalPages}
        pageSize={PAGE_SIZE}
        totalItems={filteredAgents.length}
        onPageChange={setAgentPage}
      />

      <DashboardModal
        open={showAgentForm}
        title={editingAgentId ? "Update agent" : "Create agent"}
        onClose={closeModal}
        wide
        footer={
          <div className="flex flex-wrap items-center justify-end gap-3">
            <button type="button" onClick={closeModal} className="dashboard-modal-btn-secondary">
              Cancel
            </button>
            <button type="button" onClick={() => void saveAgent()} className="dashboard-modal-btn-primary">
              {editingAgentId ? "Save changes" : "Create agent"}
            </button>
          </div>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
