import { useEffect, useState } from "react"

import { useToast } from "@/components/ui/use-toast"
import { getDashboardByRole } from "@/services/api"
import type { RepresentativeDashboardData } from "@/types/domain"

export function RepresentativeDashboardHomePage() {
  const [data, setData] = useState<RepresentativeDashboardData | null>(null)
  const { showToast } = useToast()

  useEffect(() => {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      return
    }
    getDashboardByRole(token)
      .then((payload) => setData(payload as RepresentativeDashboardData))
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
        Open <strong>Properties</strong> or <strong>Agents</strong> to create and update records in a modal.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="metric-card">
          <p>Referred Users</p>
          <strong>{data.total_referred_users}</strong>
        </article>
        <article className="metric-card">
          <p>Referred Investments</p>
          <strong>{data.referred_investments}</strong>
        </article>
        <article className="metric-card">
          <p>Referred Amount</p>
          <strong>${data.referred_investment_amount}</strong>
        </article>
        <article className="metric-card">
          <p>Commission Earned</p>
          <strong>${data.earned_commission}</strong>
        </article>
        <article className="metric-card">
          <p>Managed Properties</p>
          <strong>{data.managed_properties}</strong>
        </article>
        <article className="metric-card">
          <p>Direct Buy Requests</p>
          <strong>{data.direct_buy_requests}</strong>
        </article>
        <article className="metric-card">
          <p>Installment Requests</p>
          <strong>{data.installment_requests}</strong>
        </article>
      </div>
    </section>
  )
}
