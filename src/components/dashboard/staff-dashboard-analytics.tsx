import type { ReactNode } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { formatBdtAmount } from "@/utils/currency"
import type { AdminDashboardData, AgentDashboardData, RepresentativeDashboardData } from "@/types/domain"

const GRID = "rgba(148,163,184,0.12)"
const TICK = "#94a3b8"
const BAR_PRIMARY = "#34d399"
const BAR_SECONDARY = "#f58e43"

function moneyToNumber(v: string): number {
  const n = Number(String(v).replace(/,/g, ""))
  return Number.isFinite(n) ? n : 0
}

function ChartFrame({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: ReactNode
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 sm:p-6">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {subtitle ? <p className="mt-1 text-sm text-slate-400">{subtitle}</p> : null}
      <div className="mt-4 h-[260px] w-full min-w-0 sm:h-[300px]">{children}</div>
    </div>
  )
}

type BarTooltipPayload = {
  value?: number
  payload?: { fullLabel?: string; short?: string }
}

function CountTooltip({ active, payload }: { active?: boolean; payload?: BarTooltipPayload[] }) {
  if (!active || !payload?.length) return null
  const row = payload[0]
  const point = row.payload
  const v = row.value
  return (
    <div className="rounded-lg border border-white/15 bg-[#0b1629] px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-white">{point?.fullLabel ?? point?.short}</p>
      <p className="mt-0.5 tabular-nums text-emerald-300">{typeof v === "number" ? v.toLocaleString() : v}</p>
    </div>
  )
}

function BdtTooltip({ active, payload }: { active?: boolean; payload?: BarTooltipPayload[] }) {
  if (!active || !payload?.length) return null
  const row = payload[0]
  const point = row.payload
  const v = row.value
  return (
    <div className="rounded-lg border border-white/15 bg-[#0b1629] px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-white">{point?.fullLabel ?? point?.short}</p>
      <p className="mt-0.5 text-[#f58e43]">{formatBdtAmount(v ?? 0)}</p>
    </div>
  )
}

/** Admin: platform-wide metrics (same API payloads; labels stay neutral “overall”). */
export function AdminStaffAnalyticsCharts({
  representativeMetrics,
  agentMetrics,
}: {
  representativeMetrics: AdminDashboardData["rep_metrics"]
  agentMetrics: AdminDashboardData["agent_metrics"]
}) {
  const m = representativeMetrics
  const activityData = [
    { key: "u", short: "Users", fullLabel: "Referred users", value: m.total_referred_users },
    { key: "i", short: "Invest.", fullLabel: "Referred investments", value: m.referred_investments },
    { key: "ml", short: "Listings", fullLabel: "Linked listings", value: m.managed_properties },
    { key: "p", short: "Plot", fullLabel: "Plot buy requests", value: m.plot_buy_requests },
    { key: "s", short: "Inst.", fullLabel: "Installment requests", value: m.installment_requests },
  ]

  const moneyData = [
    {
      key: "a",
      short: "Referred",
      fullLabel: "Referred investment amount",
      value: moneyToNumber(m.referred_investment_amount),
    },
    {
      key: "c",
      short: "Commission",
      fullLabel: "Commission earned",
      value: moneyToNumber(m.earned_commission),
    },
  ]

  const agentData = [
    { key: "pr", short: "Listings", fullLabel: "Assigned listings", value: agentMetrics.managed_properties },
    { key: "pb", short: "Plot", fullLabel: "Plot buy requests", value: agentMetrics.plot_buy_requests },
    { key: "in", short: "Inst.", fullLabel: "Installment requests", value: agentMetrics.installment_requests },
  ]

  return (
    <div className="mt-8 space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartFrame
          title="Overall activity"
          subtitle="Platform-wide referrals, listings, and request counts."
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activityData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
              <XAxis dataKey="short" tick={{ fill: TICK, fontSize: 11 }} axisLine={{ stroke: GRID }} />
              <YAxis tick={{ fill: TICK, fontSize: 11 }} axisLine={{ stroke: GRID }} allowDecimals={false} />
              <Tooltip content={<CountTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="value" fill={BAR_PRIMARY} radius={[6, 6, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </ChartFrame>

        <ChartFrame
          title="Overall volume (BDT)"
          subtitle="Referred investment total and commission in Bangladeshi Taka."
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={moneyData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
              <XAxis dataKey="short" tick={{ fill: TICK, fontSize: 11 }} axisLine={{ stroke: GRID }} />
              <YAxis
                tick={{ fill: TICK, fontSize: 10 }}
                axisLine={{ stroke: GRID }}
                tickFormatter={(v) => (v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : `${(v / 1000).toFixed(0)}k`)}
              />
              <Tooltip content={<BdtTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="value" fill={BAR_SECONDARY} radius={[6, 6, 0, 0]} maxBarSize={56} />
            </BarChart>
          </ResponsiveContainer>
        </ChartFrame>
      </div>

      <ChartFrame
        title="Overall assignments"
        subtitle="Platform-wide listing and request counts for the assignment workflow."
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={agentData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
            <XAxis dataKey="short" tick={{ fill: TICK, fontSize: 11 }} axisLine={{ stroke: GRID }} />
            <YAxis tick={{ fill: TICK, fontSize: 11 }} axisLine={{ stroke: GRID }} allowDecimals={false} />
            <Tooltip content={<CountTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
            <Bar dataKey="value" fill={BAR_PRIMARY} radius={[6, 6, 0, 0]} maxBarSize={56} />
          </BarChart>
        </ResponsiveContainer>
      </ChartFrame>
    </div>
  )
}

/** Scoped to representative dashboard API payload; UI uses neutral “overall” labels. */
export function RepresentativeStaffAnalyticsCharts({ data }: { data: RepresentativeDashboardData }) {
  const activityData = [
    { key: "u", short: "Users", fullLabel: "Referred users", value: data.total_referred_users },
    { key: "i", short: "Invest.", fullLabel: "Referred investments", value: data.referred_investments },
    { key: "m", short: "Listings", fullLabel: "Managed properties", value: data.managed_properties },
    { key: "p", short: "Plot", fullLabel: "Plot buy requests", value: data.plot_buy_requests },
    { key: "s", short: "Inst.", fullLabel: "Installment requests", value: data.installment_requests },
  ]
  const moneyData = [
    {
      key: "a",
      short: "Referred",
      fullLabel: "Referred amount",
      value: moneyToNumber(data.referred_investment_amount),
    },
    { key: "c", short: "Commission", fullLabel: "Commission earned", value: moneyToNumber(data.earned_commission) },
  ]

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-2">
      <ChartFrame title="Overall activity" subtitle="Your referrals, listings, and request counts.">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={activityData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
            <XAxis dataKey="short" tick={{ fill: TICK, fontSize: 11 }} axisLine={{ stroke: GRID }} />
            <YAxis tick={{ fill: TICK, fontSize: 11 }} axisLine={{ stroke: GRID }} allowDecimals={false} />
            <Tooltip content={<CountTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
            <Bar dataKey="value" fill={BAR_PRIMARY} radius={[6, 6, 0, 0]} maxBarSize={48} />
          </BarChart>
        </ResponsiveContainer>
      </ChartFrame>

      <ChartFrame title="Overall volume (BDT)" subtitle="Referred investment total and commission for your account.">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={moneyData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
            <XAxis dataKey="short" tick={{ fill: TICK, fontSize: 11 }} axisLine={{ stroke: GRID }} />
            <YAxis
              tick={{ fill: TICK, fontSize: 10 }}
              axisLine={{ stroke: GRID }}
              tickFormatter={(v) => (v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : `${(v / 1000).toFixed(0)}k`)}
            />
            <Tooltip content={<BdtTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
            <Bar dataKey="value" fill={BAR_SECONDARY} radius={[6, 6, 0, 0]} maxBarSize={56} />
          </BarChart>
        </ResponsiveContainer>
      </ChartFrame>
    </div>
  )
}

const PIE_COLORS = [BAR_PRIMARY, BAR_SECONDARY, "#60a5fa"]

function PieTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: { name?: string; value?: number }[]
}) {
  if (!active || !payload?.length) return null
  const p = payload[0]
  return (
    <div className="rounded-lg border border-white/15 bg-[#0b1629] px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-white">{p.name}</p>
      <p className="mt-0.5 tabular-nums text-emerald-300">{p.value?.toLocaleString()}</p>
    </div>
  )
}

/** Scoped to agent dashboard API payload; UI uses neutral “overall” labels. */
export function AgentStaffAnalyticsCharts({ data }: { data: AgentDashboardData }) {
  const chartData = [
    {
      key: "mp",
      short: "Listings",
      fullLabel: "Assigned listings",
      value: data.managed_properties,
    },
    { key: "pb", short: "Plot", fullLabel: "Plot buy requests", value: data.plot_buy_requests },
    { key: "in", short: "Inst.", fullLabel: "Installment requests", value: data.installment_requests },
  ]

  const pieData = [
    { name: "Assigned listings", value: Math.max(0, data.managed_properties) },
    { name: "Plot buy requests", value: Math.max(0, data.plot_buy_requests) },
    { name: "Installment requests", value: Math.max(0, data.installment_requests) },
  ]
  const pieSum = pieData.reduce((s, d) => s + d.value, 0)

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-2">
      <ChartFrame title="Overall volume by category" subtitle="Counts for listings and requests in your scope.">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
            <XAxis dataKey="short" tick={{ fill: TICK, fontSize: 11 }} axisLine={{ stroke: GRID }} />
            <YAxis tick={{ fill: TICK, fontSize: 11 }} axisLine={{ stroke: GRID }} allowDecimals={false} />
            <Tooltip content={<CountTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={56}>
              {chartData.map((row, i) => (
                <Cell key={row.key} fill={i === 0 ? BAR_PRIMARY : i === 1 ? BAR_SECONDARY : "#60a5fa"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartFrame>

      <ChartFrame title="Overall mix" subtitle="Share of each category relative to the total above.">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={88}
              paddingAngle={2}
            >
              {pieData.map((slice, i) => (
                <Cell key={slice.name} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="rgba(15,23,42,0.9)" />
              ))}
            </Pie>
            <Tooltip content={<PieTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {pieSum === 0 ? (
          <p className="-mt-2 text-center text-xs text-slate-500">No data yet — values will appear here.</p>
        ) : null}
      </ChartFrame>
    </div>
  )
}
