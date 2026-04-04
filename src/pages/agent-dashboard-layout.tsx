import { DashboardShell, type DashboardNavSection } from "@/components/layout/dashboard-shell"

const sections: DashboardNavSection[] = [
  {
    id: "overview",
    title: "Overview",
    items: [{ to: "/dashboard/agent", label: "Overview", end: true }],
  },
  {
    id: "portfolio",
    title: "Portfolio operations",
    items: [{ to: "/dashboard/agent/investments", label: "Investments" }],
  },
  {
    id: "installment",
    title: "Installment",
    items: [
      { to: "/dashboard/agent/installment-tracker", label: "Installment tracker" },
      { to: "/dashboard/agent/installment-payment-requests", label: "Installment payment requests" },
    ],
  },
  {
    id: "properties",
    title: "Managed listings",
    items: [{ to: "/dashboard/agent/properties", label: "Properties" }],
  },
]

export function AgentDashboardLayout() {
  return <DashboardShell sections={sections} />
}
