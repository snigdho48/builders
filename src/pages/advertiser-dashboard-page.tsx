import { useEffect, useState } from "react"

import { getDashboardByRole } from "@/services/api"
import type { AdvertiserDashboardData } from "@/types/domain"

export function AdvertiserDashboardPage() {
  const [data, setData] = useState<AdvertiserDashboardData | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      return
    }
    getDashboardByRole(token).then((payload) => setData(payload as AdvertiserDashboardData))
  }, [])

  if (!data) {
    return (
      <main className="bg-slate-950 px-4 py-20 text-slate-300 sm:px-6">
        Loading advertiser dashboard...
      </main>
    )
  }

  return (
    <main className="bg-slate-950 px-4 py-14 text-white sm:px-6">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm uppercase tracking-[0.22em] text-emerald-300">Advertiser Dashboard</p>
        <h1 className="mt-2 text-3xl font-semibold">Property Request Overview</h1>
        <p className="mt-2 text-sm text-slate-300">
          Managed by: <span className="font-semibold text-white">{data.managed_by_name || "Not assigned"}</span>
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <article className="metric-card"><p>Managed Properties</p><strong>{data.managed_properties}</strong></article>
          <article className="metric-card"><p>Direct Buy Requests</p><strong>{data.direct_buy_requests}</strong></article>
          <article className="metric-card"><p>Installment Requests</p><strong>{data.installment_requests}</strong></article>
        </div>
      </div>
    </main>
  )
}
