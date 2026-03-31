import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBoxOpen, faCube } from "@fortawesome/free-solid-svg-icons"

import { getDashboard, getMe, getProperties } from "@/services/api"
import type { DashboardData, Property } from "@/types/domain"

export function DashboardPage() {
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

  const suggestedProperties = useMemo(() => properties.slice(0, 3), [properties])

  if (!dashboard) {
    return (
      <main className="bg-[#f4f6fb] px-4 py-20 text-slate-600 sm:px-6">
        <div className="mx-auto max-w-7xl">Loading dashboard...</div>
      </main>
    )
  }

  const hasInvestments = dashboard.recent_investments.length > 0
  const totalInvestment = Number(dashboard.total_investment) || 0
  const totalRoi = Number(dashboard.total_roi) || 0
  const yearlyYield = totalInvestment > 0 ? ((totalRoi / totalInvestment) * 100).toFixed(2) : "0.00"
  const monthlyIncome = (totalRoi / 12).toFixed(2)

  const performanceRows = [
    { label: "Total Value of Investment:", value: `${dashboard.total_investment}` },
    { label: "Live Investment:", value: `${dashboard.active_investments}` },
    {
      label: "Closed Investments:",
      value: `${Math.max(0, dashboard.recent_investments.length - dashboard.active_investments)}`,
    },
    { label: "Ownership Percentage:", value: `${Math.min(100, dashboard.active_investments * 7).toFixed(2)}%` },
  ]

  const portfolioRows = [
    { label: "Current Return on Investments:", value: `${yearlyYield}%` },
    { label: "Total Dividend Income to Date:", value: `${dashboard.total_roi}` },
    { label: "Annual Investment Limit:", value: `${(Number(dashboard.total_investment) * 0.1).toFixed(2)}` },
  ]

  return (
    <main className="bg-[#f4f6fb] px-4 py-10 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-[1240px]">
        <h1 className="text-4xl font-semibold text-[#0b1f44]">Hi {userName.toLowerCase()}!</h1>

        <section className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-md border border-slate-200 bg-white px-5 py-4">
            <p className="text-xs text-slate-500">Total Investment</p>
            <p className="mt-1 text-xl font-semibold text-[#0b1f44]">{dashboard.total_investment}</p>
          </article>
          <article className="rounded-md border border-slate-200 bg-white px-5 py-4">
            <p className="text-xs text-slate-500">Monthly Income</p>
            <p className="mt-1 text-xl font-semibold text-[#0b1f44]">{monthlyIncome}</p>
          </article>
          <article className="rounded-md border border-slate-200 bg-white px-5 py-4">
            <p className="text-xs text-slate-500">Annualized Rental Yield</p>
            <p className="mt-1 text-xl font-semibold text-[#0b1f44]">{yearlyYield}%</p>
          </article>
          <article className="rounded-md border border-slate-200 bg-white px-5 py-4">
            <p className="text-xs text-slate-500">Cash Balance</p>
            <p className="mt-1 text-xl font-semibold text-[#0b1f44]">{dashboard.referral_earnings}</p>
          </article>
        </section>

        <section className="mt-9">
          <h2 className="text-4xl font-semibold text-[#0b1f44]">My Statements</h2>
          <div className="mt-5 rounded-md border border-slate-200 bg-white py-12 text-center">
            <div className="mx-auto mb-3 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#eaf2ff] text-[#2c75ff]">
              <FontAwesomeIcon icon={faCube} className="text-2xl" />
            </div>
            <p className="text-base text-slate-700">You don't have any statement</p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-4xl font-semibold text-[#0b1f44]">My Investments</h2>
          {!hasInvestments ? (
            <div className="mt-5 rounded-md border border-slate-200 bg-white py-12 text-center">
              <div className="mx-auto mb-3 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#eaf2ff] text-[#2c75ff]">
                <FontAwesomeIcon icon={faBoxOpen} className="text-2xl" />
              </div>
              <p className="text-base text-slate-700">You don't have any investment</p>
              <p className="text-sm text-slate-500">Browse to view our opportunities</p>
              <Link
                to="/listings"
                className="mt-4 inline-flex rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Browse properties
              </Link>
            </div>
          ) : (
            <div className="mt-5 overflow-hidden rounded-md border border-slate-200 bg-white">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Property</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Blocks</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.recent_investments.map((investment) => (
                    <tr key={investment.id} className="border-t border-slate-100">
                      <td className="px-4 py-3">{investment.property_title}</td>
                      <td className="px-4 py-3 capitalize">{investment.type}</td>
                      <td className="px-4 py-3">{investment.blocks_owned}</td>
                      <td className="px-4 py-3">{investment.total_amount}</td>
                      <td className="px-4 py-3">
                        {investment.duration_years ? `${investment.duration_years} years` : "Direct"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-2">
          <article className="rounded-md border border-slate-200 bg-white">
            <h3 className="border-b border-slate-200 px-5 py-3 text-3xl font-semibold text-[#0b1f44]">Performance</h3>
            <div>
              {performanceRows.map((row) => (
                <div key={row.label} className="flex items-center justify-between border-b border-slate-100 px-5 py-3 text-sm">
                  <span className="text-slate-600">{row.label}</span>
                  <span className="font-semibold text-slate-900">{row.value}</span>
                </div>
              ))}
            </div>
          </article>
          <article className="rounded-md border border-slate-200 bg-white">
            <h3 className="border-b border-slate-200 px-5 py-3 text-3xl font-semibold text-[#0b1f44]">Portfolio</h3>
            <div>
              {portfolioRows.map((row) => (
                <div key={row.label} className="flex items-center justify-between border-b border-slate-100 px-5 py-3 text-sm">
                  <span className="text-slate-600">{row.label}</span>
                  <span className="font-semibold text-slate-900">{row.value}</span>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-4xl font-semibold text-[#0b1f44]">Properties for you</h2>
            <Link to="/listings" className="text-sm font-semibold text-[#0d6aa8] hover:text-[#0b1f44]">
              View All
            </Link>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-3">
            {suggestedProperties.map((item) => (
              <article key={item.id} className="overflow-hidden rounded-md border border-slate-200 bg-white">
                <img src={item.top_view_image} alt={item.title} className="h-44 w-full object-cover" />
                <div className="space-y-2 px-4 py-3">
                  <p className="text-xs text-slate-500">{item.location_name}</p>
                  <h3 className="text-xl font-semibold text-[#0b1f44]">{item.title}</h3>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="font-semibold">{item.price_per_block}</span>
                    <span className="text-slate-500">{Math.max(10, item.available_blocks)} investors</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                    <span>Gross yield</span>
                    <span className="text-right">{(Number(item.price_per_block) / 100).toFixed(2)}%</span>
                    <span>1-year return</span>
                    <span className="text-right">{(Number(item.price_per_block) / 80).toFixed(2)}%</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
