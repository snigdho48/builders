import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import { AdminStaffAnalyticsCharts } from "@/components/dashboard/staff-dashboard-analytics"
import { InvestmentCheckoutRequestsSection } from "@/components/dashboard/investment-checkout-requests-section"
import { useToast } from "@/components/ui/use-toast"
import { getDashboardByRole } from "@/services/api"
import { formatBdtAmount } from "@/utils/currency"
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

  const representativeMetrics = data.rep_metrics
  const agentMetrics = data.agent_metrics

  return (
    <section className="space-y-10">
      <div>
        <h2 className="text-xl font-semibold text-white">Overview</h2>
        <p className="mt-2 text-sm text-slate-400">
          Manage the platform from the sidebar. Use <strong>All properties</strong> for the unified listings table.
          Checkout and listing tools use the same flows as in other staff workspaces.{" "}
          <Link to="/dashboard/admin/kyc" className="font-medium text-[#f58e43] hover:underline">
            KYC & verification
          </Link>{" "}
          defines investor forms and approval; when a template is <strong>required for checkout</strong>, investors
          cannot submit cart checkouts until staff approve their submission.
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
            <strong>{formatBdtAmount(data.total_referral_commission)}</strong>
          </article>
        </div>

        <AdminStaffAnalyticsCharts representativeMetrics={representativeMetrics} agentMetrics={agentMetrics} />

        <InvestmentCheckoutRequestsSection variant="admin" />
      </div>
    </section>
  )
}
