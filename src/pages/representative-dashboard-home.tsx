import { useEffect, useState } from "react"

import { RepresentativeStaffAnalyticsCharts } from "@/components/dashboard/staff-dashboard-analytics"
import { InvestmentCheckoutRequestsSection } from "@/components/dashboard/investment-checkout-requests-section"
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
      <RepresentativeStaffAnalyticsCharts data={data} />

      <InvestmentCheckoutRequestsSection variant="representative" />
    </section>
  )
}
