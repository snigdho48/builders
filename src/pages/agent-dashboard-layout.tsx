import { DashboardShell, type DashboardNavSection } from "@/components/layout/dashboard-shell"

const sections: DashboardNavSection[] = [
  {
    id: "overview",
    title: "Overview",
    items: [{ to: "/dashboard/agent", label: "Overview", end: true }],
  },
  {
    id: "lands",
    title: "Assigned lands",
    items: [{ to: "/dashboard/agent/properties", label: "My listings" }],
  },
  {
    id: "bookings",
    title: "Bookings",
    items: [
      { to: "/dashboard/agent/bookings", label: "Booking requests" },
      { to: "/dashboard/agent/installments", label: "Installment tracker" },
    ],
  },
  {
    id: "investors",
    title: "Investors",
    items: [{ to: "/dashboard/agent/investors", label: "Investor KYC" }],
  },
]

export function AgentDashboardLayout() {
  return <DashboardShell sections={sections} />
}
