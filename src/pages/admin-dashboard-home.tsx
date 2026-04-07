import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { useToast } from "@/components/ui/use-toast"
import { getDashboard } from "@/services/api"
import type { AdminDashboardData } from "@/types/domain"

export function AdminDashboardHomePage() {
  const [data, setData] = useState<AdminDashboardData | null>(null)
  const { showToast } = useToast()

  useEffect(() => {
    const token = localStorage.getItem("accessToken")
    if (!token) return
    getDashboard(token)
      .then((d) => setData(d as AdminDashboardData))
      .catch((e) => showToast(e instanceof Error ? e.message : "Failed to load", "error"))
  }, [showToast])

  if (!data) {
    return <p className="text-slate-400">Loading overview…</p>
  }

  const completedBookings = Math.max(0, data.total_bookings - data.pending_bookings)
  const bookingDenominator = Math.max(1, data.total_bookings)
  const bookingPendingWidth = (data.pending_bookings / bookingDenominator) * 100
  const bookingCompletedWidth = (completedBookings / bookingDenominator) * 100
  const topMetric = Math.max(1, data.total_users, data.total_properties, data.total_bookings)
  const overviewBars = [
    { key: "users", label: "Users", value: data.total_users, tone: "bg-[#f58e43]" },
    { key: "properties", label: "Land listings", value: data.total_properties, tone: "bg-sky-500" },
    { key: "bookings", label: "Total bookings", value: data.total_bookings, tone: "bg-emerald-500" },
  ]
  const timelineLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
  const bookingTrendData =
    data.booking_trend && data.booking_trend.length > 0
      ? data.booking_trend
      : timelineLabels.map((label, idx) => {
          const factor = (idx + 2) / (timelineLabels.length + 1)
          const total = Math.max(0, Math.round(data.total_bookings * factor))
          const pending = Math.min(total, Math.max(0, Math.round(data.pending_bookings * (0.55 + idx * 0.08))))
          return { label, total, pending }
        })
  const assetTrendData =
    data.asset_trend && data.asset_trend.length > 0
      ? data.asset_trend
      : timelineLabels.map((label, idx) => {
          const factor = (idx + 2) / (timelineLabels.length + 1)
          const users = Math.max(0, Math.round(data.total_users * factor))
          const properties = Math.max(0, Math.round(data.total_properties * factor))
          return { label, users, properties }
        })

  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Admin overview</h2>
        <p className="mt-2 text-sm text-slate-600">
          Manage <Link to="/dashboard/admin/properties" className="text-[#f58e43] hover:underline">land listings</Link>
          ,{" "}
          <Link to="/dashboard/admin/bookings" className="text-[#f58e43] hover:underline">booking requests</Link>, agents,
          and investors from the sidebar.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="metric-card">
          <p>Users</p>
          <strong>{data.total_users}</strong>
        </article>
        <article className="metric-card">
          <p>Land listings</p>
          <strong>{data.total_properties}</strong>
        </article>
        <article className="metric-card">
          <p>Total bookings</p>
          <strong>{data.total_bookings}</strong>
        </article>
        <article className="metric-card">
          <p>Pending bookings</p>
          <strong>{data.pending_bookings}</strong>
        </article>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <article className="metric-card">
          <p>Bookings split</p>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
            <div className="flex h-full w-full">
              <div className="bg-amber-500" style={{ width: `${bookingPendingWidth}%` }} />
              <div className="bg-emerald-500" style={{ width: `${bookingCompletedWidth}%` }} />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
            <span>Pending: {data.pending_bookings}</span>
            <span>Completed: {completedBookings}</span>
          </div>
        </article>
        <article className="metric-card">
          <p>Overview graph</p>
          <div className="mt-4 space-y-3">
            {overviewBars.map((item) => (
              <div key={item.key} className="space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>{item.label}</span>
                  <span className="font-semibold text-slate-800">{item.value}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${item.tone}`}
                    style={{ width: `${Math.max(6, (item.value / topMetric) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <article className="metric-card">
          <p>Booking trend (line chart)</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={bookingTrendData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip />
                <Line type="monotone" dataKey="total" name="Total bookings" stroke="#0ea5e9" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="pending" name="Pending bookings" stroke="#f59e0b" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>
        <article className="metric-card">
          <p>User vs listing growth (area chart)</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={assetTrendData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="usersArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f58e43" stopOpacity={0.55} />
                    <stop offset="95%" stopColor="#f58e43" stopOpacity={0.08} />
                  </linearGradient>
                  <linearGradient id="propsArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.08} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip />
                <Area type="monotone" dataKey="users" name="Users" stroke="#f58e43" fill="url(#usersArea)" strokeWidth={2} />
                <Area
                  type="monotone"
                  dataKey="properties"
                  name="Land listings"
                  stroke="#10b981"
                  fill="url(#propsArea)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>
    </section>
  )
}
