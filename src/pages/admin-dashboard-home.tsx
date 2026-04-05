import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

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

  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-white">Admin overview</h2>
        <p className="mt-2 text-sm text-slate-400">
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
    </section>
  )
}
