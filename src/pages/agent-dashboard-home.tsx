import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

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

  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-white">Agent workspace</h2>
        <p className="mt-2 text-sm text-slate-400">
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
    </section>
  )
}
