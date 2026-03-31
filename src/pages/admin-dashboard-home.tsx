import { useEffect, useState } from "react"

import { useToast } from "@/components/ui/use-toast"
import { getDashboardByRole } from "@/services/api"
import type { AdminDashboardData } from "@/types/domain"

export function AdminDashboardHomePage() {
  const [data, setData] = useState<AdminDashboardData | null>(null)
  const { showToast } = useToast()

  useEffect(() => {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      return
    }
    getDashboardByRole(token)
      .then((payload) => setData(payload as AdminDashboardData))
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Failed to load dashboard."
        showToast(message, "error")
      })
  }, [showToast])

  if (!data) {
    return <p className="text-slate-400">Loading overview...</p>
  }

  return (
    <section>
      <h2 className="text-xl font-semibold text-white">Overview</h2>
      <p className="mt-2 text-sm text-slate-400">
        Use the tabs above to manage investors, all properties, and representatives.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <article className="metric-card">
          <p>Total Users</p>
          <strong>{data.total_users}</strong>
        </article>
        <article className="metric-card">
          <p>Total Properties</p>
          <strong>{data.total_properties}</strong>
        </article>
        <article className="metric-card">
          <p>Total Investments</p>
          <strong>{data.total_investments}</strong>
        </article>
        <article className="metric-card">
          <p>Total Payments</p>
          <strong>{data.total_payments}</strong>
        </article>
        <article className="metric-card">
          <p>Pending Payments</p>
          <strong>{data.pending_payments}</strong>
        </article>
        <article className="metric-card">
          <p>Total Referral Commission</p>
          <strong>${data.total_referral_commission}</strong>
        </article>
      </div>
    </section>
  )
}
