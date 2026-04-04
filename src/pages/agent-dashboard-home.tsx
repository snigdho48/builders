import { useEffect, useState } from "react"

import { AgentStaffAnalyticsCharts } from "@/components/dashboard/staff-dashboard-analytics"
import { InvestmentCheckoutRequestsSection } from "@/components/dashboard/investment-checkout-requests-section"
import { useToast } from "@/components/ui/use-toast"
import { getDashboardByRole } from "@/services/api"
import type { AgentDashboardData } from "@/types/domain"

export function AgentDashboardHomePage() {
  const [data, setData] = useState<AgentDashboardData | null>(null)
  const { showToast } = useToast()

  useEffect(() => {
    const token = localStorage.getItem("accessToken")
    if (!token) return
    getDashboardByRole(token)
      .then((payload) => setData(payload as AgentDashboardData))
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
        Open <strong>Properties</strong> to view assigned listings and open a full details modal.
      </p>
      <p className="mt-2 text-sm text-slate-300">
        Managed by: <span className="font-semibold text-white">{data.managed_by_name || "Not assigned"}</span>
      </p>
      <AgentStaffAnalyticsCharts data={data} />

      <InvestmentCheckoutRequestsSection variant="agent" />
    </section>
  )
}
