import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"

import { PropertyCard } from "@/components/property-card"
import { getDashboard, getMe, getProperties } from "@/services/api"
import type { DashboardData, Property } from "@/types/domain"
import { formatBdtAmount } from "@/utils/currency"
import { pickInstallmentTop, pickPlotBuyTop } from "@/utils/property-lanes"

export function InvestorDashboardHomePage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [properties, setProperties] = useState<Property[]>([])
  const [userName, setUserName] = useState("Investor")

  useEffect(() => {
    const token = localStorage.getItem("accessToken") ?? undefined
    getDashboard(token).then(setDashboard)
    getProperties().then(setProperties)
    if (token) {
      getMe(token)
        .then((me) => setUserName(me.first_name || me.username || "Investor"))
        .catch(() => setUserName("Investor"))
    }
  }, [])

  const availableProperties = useMemo(
    () => properties.filter((p) => p.status === "available"),
    [properties]
  )

  const dashboardLaneLimit = 5

  const plotBuySuggestions = useMemo(
    () => pickPlotBuyTop(availableProperties, dashboardLaneLimit),
    [availableProperties]
  )

  const installmentSuggestions = useMemo(
    () => pickInstallmentTop(availableProperties, plotBuySuggestions, dashboardLaneLimit),
    [availableProperties, plotBuySuggestions]
  )

  if (!dashboard) {
    return <p className="text-slate-400">Loading overview...</p>
  }

  const totalInvestment = Number(dashboard.total_investment) || 0
  const totalRoi = Number(dashboard.total_roi) || 0
  const yearlyYield = totalInvestment > 0 ? ((totalRoi / totalInvestment) * 100).toFixed(2) : "0.00"
  const monthlyIncome = formatBdtAmount(totalRoi / 12)

  const performanceRows = [
    { label: "Total value invested", value: formatBdtAmount(dashboard.total_investment) },
    { label: "Live positions", value: `${dashboard.active_investments}` },
    {
      label: "Closed positions",
      value: `${Math.max(0, dashboard.recent_investments.length - dashboard.active_investments)}`,
    },
    { label: "Ownership (est.)", value: `${Math.min(100, dashboard.active_investments * 7).toFixed(2)}%` },
  ]

  const portfolioRows = [
    { label: "Annualized return (est.)", value: `${yearlyYield}%` },
    { label: "Dividend income (est.)", value: formatBdtAmount(dashboard.total_roi) },
    {
      label: "Annual limit (est.)",
      value: formatBdtAmount(Number(dashboard.total_investment) * 0.1),
    },
  ]

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="text-2xl font-semibold text-white">Hi {userName}!</h2>
        <Link
          to="/profile"
          className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 hover:underline"
        >
          Profile &amp; account settings
        </Link>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="metric-card">
          <p>Total investment</p>
          <strong>{formatBdtAmount(dashboard.total_investment)}</strong>
        </article>
        <article className="metric-card">
          <p>Monthly income (est.)</p>
          <strong>{monthlyIncome}</strong>
        </article>
        <article className="metric-card">
          <p>Annualized yield (est.)</p>
          <strong>{yearlyYield}%</strong>
        </article>
        <article className="metric-card">
          <p>Referral balance</p>
          <strong>{formatBdtAmount(dashboard.referral_earnings)}</strong>
        </article>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h3 className="border-b border-white/10 pb-3 text-lg font-semibold text-white">Performance</h3>
          <div className="mt-2 space-y-0">
            {performanceRows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between border-b border-white/5 py-3 text-sm last:border-0"
              >
                <span className="text-slate-400">{row.label}</span>
                <span className="font-semibold text-white">{row.value}</span>
              </div>
            ))}
          </div>
        </article>
        <article className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h3 className="border-b border-white/10 pb-3 text-lg font-semibold text-white">Portfolio</h3>
          <div className="mt-2 space-y-0">
            {portfolioRows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between border-b border-white/5 py-3 text-sm last:border-0"
              >
                <span className="text-slate-400">{row.label}</span>
                <span className="font-semibold text-white">{row.value}</span>
              </div>
            ))}
          </div>
        </article>
      </div>

      <p className="text-sm text-slate-400">
        Installments:{" "}
        <span className="font-medium text-slate-200">{dashboard.paid_installments}</span> paid ·{" "}
        <span className="font-medium text-slate-200">{dashboard.remaining_installments}</span> remaining (
        <Link to="/dashboard/investor/statements" className="text-emerald-400 hover:underline">
          statements
        </Link>
        ).
      </p>

      <section className="space-y-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-xl font-semibold text-white">Properties for you</h2>
          <div className="flex items-center gap-3">
            <Link to="/listings" className="text-sm font-semibold text-emerald-400 hover:text-emerald-300">
              View all listings
            </Link>
          </div>
        </div>

        <div>
          <h3 className="text-center text-lg font-semibold text-white">Plot buy</h3>
          <p className="mt-1 text-center text-sm text-slate-400">Up to {dashboardLaneLimit} top picks</p>
          {plotBuySuggestions.length === 0 ? (
            <p className="mt-6 text-center text-sm text-slate-500">No plot-buy listings available yet.</p>
          ) : (
            <div className="mt-5 flex flex-wrap justify-center gap-6">
              {plotBuySuggestions.map((item) => (
                <div key={`dash-plot-${item.id}`} className="w-full shrink-0 sm:w-[min(100%,340px)]">
                  <PropertyCard property={item} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-center text-lg font-semibold text-white">Installment</h3>
          <p className="mt-1 text-center text-sm text-slate-400">Up to {dashboardLaneLimit} top picks</p>
          {installmentSuggestions.length === 0 ? (
            <p className="mt-6 text-center text-sm text-slate-500">
              No installment-friendly listings available yet.
            </p>
          ) : (
            <div className="mt-5 flex flex-wrap justify-center gap-6">
              {installmentSuggestions.map((item) => (
                <div key={`dash-inst-${item.id}`} className="w-full shrink-0 sm:w-[min(100%,340px)]">
                  <PropertyCard property={item} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
