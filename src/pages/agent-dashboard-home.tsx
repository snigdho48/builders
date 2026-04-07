import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { useToast } from "@/components/ui/use-toast"
import { getDashboard } from "@/services/api"
import type { AgentDashboardData } from "@/types/domain"

export function AgentDashboardHomePage() {
  const [data, setData] = useState<AgentDashboardData | null>(null)
  const { showToast } = useToast()

  useEffect(() => {
    const token = localStorage.getItem("accessToken")
    if (!token) return
    getDashboard(token)
      .then((d) => setData(d as AgentDashboardData))
      .catch((e) => showToast(e instanceof Error ? e.message : "Failed to load", "error"))
  }, [showToast])

  if (!data) {
    return <p className="text-slate-400">Loading…</p>
  }

  const totalWorkload = Math.max(1, data.managed_properties + data.pending_bookings)
  const bars = [
    {
      key: "managed",
      label: "Assigned lands",
      value: data.managed_properties,
      tone: "bg-sky-500",
    },
    {
      key: "pending",
      label: "Pending bookings",
      value: data.pending_bookings,
      tone: "bg-amber-500",
    },
  ]
  const timelineLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
  const workloadTrendData =
    data.workload_trend && data.workload_trend.length > 0
      ? data.workload_trend
      : timelineLabels.map((label, idx) => {
          const factor = (idx + 2) / (timelineLabels.length + 1)
          const managed = Math.max(0, Math.round(data.managed_properties * factor))
          const pending = Math.max(0, Math.round(data.pending_bookings * (0.62 + idx * 0.06)))
          return { label, managed, pending }
        })

  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Agent workspace</h2>
        <p className="mt-2 text-sm text-slate-600">
          You manage assigned land listings. Review{" "}
          <Link to="/dashboard/agent/bookings" className="text-[#f58e43] hover:underline">booking requests</Link> for
          those lands.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <article className="metric-card">
          <p>Assigned lands</p>
          <strong>{data.managed_properties}</strong>
        </article>
        <article className="metric-card">
          <p>Pending bookings</p>
          <strong>{data.pending_bookings}</strong>
        </article>
      </div>
      <article className="metric-card">
        <p>Workload graph</p>
        <div className="mt-4 space-y-3">
          {bars.map((item) => (
            <div key={item.key} className="space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>{item.label}</span>
                <span className="font-semibold text-slate-800">{item.value}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${item.tone}`}
                  style={{ width: `${Math.max(8, (item.value / totalWorkload) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </article>
      <div className="grid gap-4 lg:grid-cols-2">
        <article className="metric-card">
          <p>Assigned vs pending trend (line chart)</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={workloadTrendData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip />
                <Line type="monotone" dataKey="managed" name="Assigned lands" stroke="#0ea5e9" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="pending" name="Pending bookings" stroke="#f59e0b" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>
        <article className="metric-card">
          <p>Agent activity area chart</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={workloadTrendData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="managedArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.08} />
                  </linearGradient>
                  <linearGradient id="pendingArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.42} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.08} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip />
                <Area type="monotone" dataKey="managed" name="Assigned lands" stroke="#0ea5e9" fill="url(#managedArea)" strokeWidth={2} />
                <Area type="monotone" dataKey="pending" name="Pending bookings" stroke="#f59e0b" fill="url(#pendingArea)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>
    </section>
  )
}
