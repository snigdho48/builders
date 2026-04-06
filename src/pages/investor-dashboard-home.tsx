import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import { InvestorKycPanel } from "@/components/investor-kyc-panel"
import { useToast } from "@/components/ui/use-toast"
import { getDashboard } from "@/services/api"
import type { InvestorDashboardData } from "@/types/domain"

const emptyInvestorDashboard: InvestorDashboardData = {
  my_pending_bookings: 0,
  my_accepted_bookings: 0,
  my_rejected_bookings: 0,
  kyc_status: "pending",
  kyc_requested_at: "",
}

export function InvestorDashboardHomePage() {
  const [data, setData] = useState<InvestorDashboardData | null>(null)
  const { showToast } = useToast()

  useEffect(() => {
    const token = localStorage.getItem("accessToken")
    if (!token) return
    getDashboard(token)
      .then((d) => setData(d as InvestorDashboardData))
      .catch((e) => {
        showToast(e instanceof Error ? e.message : "Failed to load dashboard metrics", "error")
        setData(emptyInvestorDashboard)
      })
  }, [showToast])

  if (!data) {
    return <p className="text-slate-400">Loading…</p>
  }

  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Welcome</h2>
        <p className="mt-2 text-sm text-slate-600">
          Browse <Link to="/listings" className="text-[#f58e43] hover:underline">land listings</Link> and book a parcel.
          Track requests on{" "}
          <Link to="/dashboard/investor/bookings" className="text-[#f58e43] hover:underline">My bookings</Link>.
          {" "}
          <Link to="/dashboard/investor/kyc" className="font-semibold text-[#f58e43] hover:underline">
            KYC & verification
          </Link>{" "}
          is under <strong className="text-slate-700">KYC</strong> in the sidebar.
        </p>
      </div>
      <InvestorKycPanel />
      <div className="grid gap-4 sm:grid-cols-3">
        <article className="metric-card">
          <p>Pending</p>
          <strong>{data.my_pending_bookings}</strong>
        </article>
        <article className="metric-card">
          <p>Accepted</p>
          <strong>{data.my_accepted_bookings}</strong>
        </article>
        <article className="metric-card">
          <p>Rejected</p>
          <strong>{data.my_rejected_bookings}</strong>
        </article>
      </div>
    </section>
  )
}
