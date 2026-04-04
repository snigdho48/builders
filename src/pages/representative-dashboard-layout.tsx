import { DashboardShell, type DashboardNavSection } from "@/components/layout/dashboard-shell"

const sections: DashboardNavSection[] = [
  {
    id: "overview",
    title: "Overview",
    items: [{ to: "/dashboard/representative", label: "Overview", end: true }],
  },
  {
    id: "portfolio",
    title: "Portfolio operations",
    items: [
      { to: "/dashboard/representative/investments", label: "Investments" },
      { to: "/dashboard/representative/payout-requests", label: "Payout requests" },
    ],
  },
  {
    id: "installment",
    title: "Installment",
    items: [
      { to: "/dashboard/representative/installment-tracker", label: "Installment tracker" },
      { to: "/dashboard/representative/installment-payment-requests", label: "Installment payment requests" },
    ],
  },
  {
    id: "team-properties",
    title: "Team & properties",
    items: [
      { to: "/dashboard/representative/properties", label: "Properties" },
      { to: "/dashboard/representative/agents", label: "Agents" },
    ],
  },
]

export function RepresentativeDashboardLayout() {
  return <DashboardShell sections={sections} />
}
